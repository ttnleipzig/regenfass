package main

import (
	"context"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"flag"
	"fmt"
	"math"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/sql"
)

var (
	pool *pgxpool.Pool
	q    *db.Queries
)
var (
	logLevelFlag    = flag.String("log-level", "INFO", "Log level")
	databaseUriFlag = flag.String("database-uri", "postgres://postgres:password@127.0.0.1:5434/regenfass", "TimescaleDB Database URI")
	listenAddrFlag  = flag.String("listen-addr", ":64000", "Address to listen on")
)

func init() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnixMicro
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
}

func main() {
	flag.Parse()

	level, err := zerolog.ParseLevel(*logLevelFlag)
	if err != nil {
		log.Fatal().Err(err).Msg("could not parse log level")
	}
	zerolog.SetGlobalLevel(level)

	if *databaseUriFlag == "" {
		flag.PrintDefaults()
		os.Exit(1)
	}

	if err := migrateDB(*databaseUriFlag); err != nil {
		log.Fatal().Err(err).Msg("could not migrate database")
	}

	log.Info().Msg("connecting to database...")
	pool, err = pgxpool.New(context.Background(), *databaseUriFlag)
	if err != nil {
		log.Fatal().Err(err).Msg("could not instanciate new database pool")
	}

	log.Info().Msg("checking reachability...")
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal().Err(err).Msg("could not ping database")
	}
	log.Info().Msg("database is reachable")

	q = db.New(pool)

	app := fiber.New()
	app.Get("/healthz", handleHealthz)
	app.Post("/ingest", handleIngest)

	log.Info().Str("listenAddr", *listenAddrFlag).Msg("starting web server...")
	if err := app.Listen(*listenAddrFlag); err != nil {
		log.Fatal().Err(err).Msg("could not start web server")
	}
}

func handleHealthz(c fiber.Ctx) error {
	if err := pool.Ping(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not ping database")
		c.Status(fiber.StatusInternalServerError)
		return fmt.Errorf("database connection unhealthy")
	}

	return c.SendString("ok")
}

func handleIngest(c fiber.Ctx) error {
	type Body struct {
		EndDeviceIDs struct {
			DevEUI string `json:"dev_eui"`
		} `json:"end_device_ids"`
		UplinkMessage struct {
			Payload    string    `json:"frm_payload"`
			ReceivedAt time.Time `json:"received_at"`
		} `json:"uplink_message"`
	}

	log := getRequestLogger(c)

	var body Body
	if err := c.Bind().JSON(&body); err != nil {
		log.Error().Err(err).Msg("could not parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse request body")
	}

	log = log.With().Str("deviceEUI", body.EndDeviceIDs.DevEUI).Logger()

	payload, err := base64.StdEncoding.DecodeString(body.UplinkMessage.Payload)
	if err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	log.Debug().Hex("decoded", payload).Str("raw", body.UplinkMessage.Payload).Msg("parsed payload")

	waterLevel := readFloat32(payload[0:4])
	minimumLevel := readFloat32(payload[4:8])
	voltage := readFloat32(payload[8:12])

	log.Debug().
		Float32("waterLevel", waterLevel).
		Float32("minimumLevel", minimumLevel).
		Float32("voltage", voltage).
		Msg("got request")

	tx, err := pool.BeginTx(c.Context(), pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not begin database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}
	defer tx.Rollback(c.Context())

	rawDeviceUUID, err := q.UpdateDeviceMinimumLevel(c.Context(), db.UpdateDeviceMinimumLevelParams{
		DeviceEui:    body.EndDeviceIDs.DevEUI,
		MinimumLevel: float64(minimumLevel),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not update device's minimum level")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	deviceUUID := pgToUUID(rawDeviceUUID)
	log = log.With().Stringer("deviceUUID", deviceUUID).Logger()

	log.Debug().Msg("found device in DB")

	err = q.InsertDeviceMeasurement(c.Context(), db.InsertDeviceMeasurementParams{
		DeviceID:   rawDeviceUUID,
		WaterLevel: float64(waterLevel),
		Voltage:    float64(voltage),
		ReceivedAt: timeToPG(body.UplinkMessage.ReceivedAt),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not insert device measurement")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := tx.Commit(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not commit database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func readFloat32(bytes []byte) float32 {
	bits := binary.LittleEndian.Uint32(bytes)
	return math.Float32frombits(bits)
}

func migrateDB(dbUri string) error {
	migrations, err := iofs.New(sql.Migrations, "migrations")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithSourceInstance("iofs", migrations, dbUri)
	if err != nil {
		return err
	}

	log.Info().Msg("migrating database...")

	if err := m.Up(); err != nil {
		if !errors.Is(err, migrate.ErrNoChange) {
			return err

		}

		log.Info().Msg("no migration needed")
	} else {
		log.Info().Msg("migrated database")
	}

	return nil
}

func pgToUUID(raw pgtype.UUID) uuid.UUID {
	return raw.Bytes
}

func timeToPG(raw time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: raw, Valid: true}
}

func getRequestLogger(c fiber.Ctx) zerolog.Logger {
	id := c.RequestCtx().ID()
	method := c.Method()
	path := c.Path()
	ip := c.IP()

	return log.With().
		Uint64("requestID", id).
		Str("httpMethod", method).
		Str("httpPath", path).
		Str("ip", ip).
		Logger()
}
