package api

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/ttn-leipzig/regenfass/internal/db"

	"github.com/jackc/pgx/v5/pgxpool"
)

type API struct {
	app    *fiber.App
	db     *db.Queries
	dbPool *pgxpool.Pool
	log    zerolog.Logger
}

func New(dbPool *pgxpool.Pool) *API {
	log := log.With().Str("component", "api").Logger()

	app := fiber.New()

	api := &API{app, db.New(dbPool), dbPool, log}

	api.app.Get("/healthz", api.handleHealthz)
	api.app.Post("/ingest", api.handleIngest)
	api.app.Get("/device/:deviceToken", api.handleDeviceInfoByToken)
	api.app.Post("/group", api.handleCreateGroup)
	api.app.Get("/group/:groupToken", api.handleGroupInfoByToken)
	api.app.Post("/group/:groupToken/devices", api.handleAddDeviceToGroup)

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
