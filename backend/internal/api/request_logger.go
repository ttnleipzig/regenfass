package api

import (
	"github.com/gofiber/fiber/v3"
	"github.com/rs/zerolog"
)

func (a *API) getRequestLogger(c fiber.Ctx) zerolog.Logger {
	id := c.RequestCtx().ID()
	method := c.Method()
	path := c.Path()
	ip := c.IP()

	return a.log.With().
		Uint64("requestID", id).
		Str("httpMethod", method).
		Str("httpPath", path).
		Str("ip", ip).
		Logger()
}
