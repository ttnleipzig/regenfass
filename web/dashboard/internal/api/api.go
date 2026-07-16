package api

import (
	"fmt"

	swaggo "github.com/gofiber/contrib/v3/swaggo"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	_ "github.com/ttn-leipzig/regenfass/docs"
	"github.com/ttn-leipzig/regenfass/internal/db"
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

	api.app.Use(cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			panic("TODO")
		},
		AllowOrigins:          []string{"*"},
		AllowMethods:          []string{"GET", "POST", "PATCH"},
		AllowHeaders:          []string{},
		ExposeHeaders:         []string{},
		MaxAge:                0,
		DisableValueRedaction: false,
		AllowCredentials:      false,
		AllowPrivateNetwork:   true,
	}))

	api.app.Get("/healthz", api.handleHealthz)
	api.app.Post("/ingest", api.handleIngest)
	api.app.Post("/device", api.handleRegisterDevice)
	api.app.Get("/device/:deviceToken", api.handleDeviceInfoByToken)
	api.app.Patch("/device/:deviceToken", api.handleUpdateDevice)
	api.app.Get("/device/:deviceToken/measurements", api.handleDeviceMeasurements)
	api.app.Post("/group", api.handleCreateGroup)
	api.app.Get("/group/:groupToken", api.handleGroupInfoByToken)
	api.app.Post("/group/:groupToken/devices", api.handleAddDeviceToGroup)
	api.app.Post("/measurements/latest", api.handleLatestMeasurements)
	api.app.Post("/overview", api.handleOverview)
	app.Get("/swagger/*", swaggo.HandlerDefault)

	return api
}

func (a *API) Listen(addr string) error {
	return a.app.Listen(addr)
}

// HealthCheck godoc
//
//	@Summary		Health check endpoint
//	@Description	Check if the API and database connection are healthy
//	@Tags			health
//	@Accept			plain
//	@Produce		plain
//	@Success		200	{string}	string	"ok"
//	@Failure		500	{string}	string	"database connection unhealthy"
//	@Router			/healthz [get]
func (a *API) handleHealthz(c fiber.Ctx) error {
	if err := a.dbPool.Ping(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not ping database")
		c.Status(fiber.StatusInternalServerError)
		return fmt.Errorf("database connection unhealthy")
	}

	return c.SendString("ok")
}

// HTTPError represents an HTTP error response
type HTTPError struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"error message"`
}
