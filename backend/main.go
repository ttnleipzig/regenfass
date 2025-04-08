package main

import (
	"context"
	"errors"
	"flag"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ttn-leipzig/regenfass/internal/api"
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

	api := api.New(pool)

	log.Info().Str("listenAddr", *listenAddrFlag).Msg("starting web server...")
	if err := api.Listen(*listenAddrFlag); err != nil {
		log.Fatal().Err(err).Msg("could not start web server")
	}
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
