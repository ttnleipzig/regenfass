package main

import (
	"context"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"flag"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool
var (
	databaseUriFlag = flag.String("database-uri", "postgres://postgres:password@127.0.0.1:5434/regenfass", "TimescaleDB Database URI")
	listenAddrFlag  = flag.String("listen-addr", ":64000", "Address to listen on")
)

func main() {
	flag.Parse()

	if *databaseUriFlag == "" {
		flag.PrintDefaults()
		os.Exit(1)
	}

	var err error
	pool, err = pgxpool.New(context.Background(), *databaseUriFlag)
	if err != nil {
		log.Fatal(err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	if err := initDB(context.Background()); err != nil {
		log.Fatal(err)
	}

	mux := &http.ServeMux{}
	mux.HandleFunc("POST /ingest", handleIngest)

	log.Printf("listening on %s", *listenAddrFlag)
	if err := http.ListenAndServe(*listenAddrFlag, mux); err != nil {
		log.Panic(err)
	}
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
		log.Println(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	payload, err := base64.StdEncoding.DecodeString(body.UplinkMessage.Payload)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("%s %x", body.UplinkMessage.Payload, payload)

	waterLevel := readFloat32(payload[0:4])
	minimumLevel := readFloat32(payload[4:8])
	voltage := readFloat32(payload[8:12])

	log.Printf("got request devEUI=%s waterLevel=%f minimumLevel=%f voltage=%f", body.EndDeviceIDs.DevEUI, waterLevel, minimumLevel, voltage)

	tx, err := pool.BeginTx(r.Context(), pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		log.Println(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	row := tx.QueryRow(r.Context(), `
		UPDATE device SET minimum_level = $2 WHERE device_eui = $1 RETURNING id
	`, body.EndDeviceIDs.DevEUI, minimumLevel)

	var deviceID uuid.UUID
	if err := row.Scan(&deviceID); err != nil {
		log.Println(err.Error())
		http.Error(w, "Could not update device with minimum level", http.StatusInternalServerError)
		return
	}

	log.Printf("found device in DB id=%s", deviceID)

	_, err = tx.Exec(r.Context(), `
		INSERT INTO device_measurement (device_id, water_level, voltage, received_at) VALUES ($1, $2, $3, $4)
	`, body.EndDeviceIDs.DevEUI, waterLevel, voltage, body.UplinkMessage.ReceivedAt)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Could not insert measurement", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		log.Println(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func readFloat32(bytes []byte) float32 {
	bits := binary.LittleEndian.Uint32(bytes)
	return math.Float32frombits(bits)
}

func initDB(ctx context.Context) error {
	tx, err := pool.BeginTx(ctx, pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS device (
			id UUID PRIMARY KEY,
			device_eui TEXT NOT NULL UNIQUE,
			minimum_level FLOAT NOT NULL
		)
	`); err != nil {
		log.Printf("could not create device table: %v", err)
		return err
	}

	if _, err := tx.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS device__device_eui ON device (device_eui);
	`); err != nil {
		log.Printf("could not create device EUI -> device index: %v", err)
		return err
	}

	if _, err := tx.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS device_measurement (
			received_at TIMESTAMPTZ NOT NULL,
			device_id TEXT NOT NULL,

			water_level FLOAT NOT NULL,
			voltage FLOAT NOT NULL
		)
	`); err != nil {
		log.Printf("could not create device measurement table: %v", err)
		return err
	}

	if _, err := tx.Exec(ctx, `
		SELECT create_hypertable('device_measurement', by_range('received_at', INTERVAL '1 day'), if_not_exists => TRUE)
	`); err != nil {
		log.Printf("could not create device measurement hypertable: %v", err)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}
