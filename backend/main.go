package main

import (
	"context"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"flag"
	"math"
	"net/http"
	"os"
	"time"

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

	mux := &http.ServeMux{}
	mux.HandleFunc("GET /healthz", handleHealthz)
	mux.HandleFunc("POST /ingest", handleIngest)

	log.Info().Str("listenAddr", *listenAddrFlag).Msg("starting web server...")
	if err := http.ListenAndServe(*listenAddrFlag, mux); err != nil {
		log.Fatal().Err(err).Msg("could not start web server")
	}
}

func handleHealthz(w http.ResponseWriter, r *http.Request) {
	if err := pool.Ping(r.Context()); err != nil {
		log.Error().Err(err).Msg("could not ping database")
		http.Error(w, "database connection unhealthy", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func handleIngest(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		EndDeviceIDs struct {
			DevEUI string `json:"dev_eui"`
		} `json:"end_device_ids"`
		UplinkMessage struct {
			Payload    string    `json:"frm_payload"`
			ReceivedAt time.Time `json:"received_at"`
		} `json:"uplink_message"`
	}

	var body Body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		log.Error().Err(err).Msg("could not parse request body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	payload, err := base64.StdEncoding.DecodeString(body.UplinkMessage.Payload)
	if err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Debug().Hex("decoded", payload).Str("raw", body.UplinkMessage.Payload).Msg("parsed payload")

	waterLevel := readFloat32(payload[0:4])
	minimumLevel := readFloat32(payload[4:8])
	voltage := readFloat32(payload[8:12])

	log.Debug().
		Str("deviceEUI", body.EndDeviceIDs.DevEUI).
		Float32("waterLevel", waterLevel).
		Float32("minimumLevel", minimumLevel).
		Float32("voltage", voltage).
		Msg("got request")

	tx, err := pool.BeginTx(r.Context(), pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not begin database transaction")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	rawDeviceUUID, err := q.UpdateDeviceMinimumLevel(r.Context(), db.UpdateDeviceMinimumLevelParams{
		DeviceEui:    body.EndDeviceIDs.DevEUI,
		MinimumLevel: float64(minimumLevel),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not update device's minimum level")
		http.Error(w, "Could not update device with minimum level", http.StatusInternalServerError)
		return
	}

	deviceUUID := pgToUUID(rawDeviceUUID)
	log.Printf("found device in DB id=%s", deviceUUID)

	err = q.InsertDeviceMeasurement(r.Context(), db.InsertDeviceMeasurementParams{
		DeviceID:   rawDeviceUUID,
		WaterLevel: float64(waterLevel),
		Voltage:    float64(voltage),
		ReceivedAt: timeToPG(body.UplinkMessage.ReceivedAt),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not insert device measurement")
		http.Error(w, "Could not insert measurement", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		log.Error().Err(err).Msg("could not commit database transaction")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
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
