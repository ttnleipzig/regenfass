package api

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/rs/zerolog/log"
	"github.com/ttn-leipzig/regenfass/internal/db"

	"github.com/jackc/pgx/v5/pgxpool"
)

type API struct {
	app    *fiber.App
	db     *db.Queries
	dbPool *pgxpool.Pool
}

func New(dbPool *pgxpool.Pool) *API {
	app := fiber.New()

	api := &API{app, db.New(dbPool), dbPool}

	api.app.Get("/healthz", api.handleHealthz)
	api.app.Post("/ingest", api.handleIngest)

	return api
}

func (a *API) Listen(addr string) error {
	return a.app.Listen(addr)
}

func (a *API) handleHealthz(c fiber.Ctx) error {
	if err := a.dbPool.Ping(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not ping database")
		c.Status(fiber.StatusInternalServerError)
		return fmt.Errorf("database connection unhealthy")
	}

	return c.SendString("ok")
}
