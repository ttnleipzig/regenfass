package api

import (
	"github.com/gofiber/fiber/v3"
)

// RegisterDeviceResponse represents the response after registering a device
type RegisterDeviceResponse struct {
	ReadWriteToken string `json:"read_write_token" example:"rw_token_123"`
	ReadOnlyToken  string `json:"read_only_token" example:"ro_token_123"`
}

// RegisterDevicePayload represents the request body for registering a device
type RegisterDevicePayload struct {
	DeviceEUI string `json:"device_eui" example:"AABBCCDDEEFF0011"`
}

// RegisterDevice godoc
//
//	@Summary		Register a device
//	@Description	Register a device using it's device EUI
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			body		body		RegisterDevicePayload	true	"Device to register"
//	@Success		201			{object}	RegisterDeviceResponse
//	@Failure		500			{object}	HTTPError	"Internal server error"
//	@Router			/device [post]
func (a *API) handleRegisterDevice(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	var payload RegisterDevicePayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	created, err := a.db.CreateDevice(c.Context(), payload.DeviceEUI)
	if err != nil {
		log.Error().Err(err).Msg("could not save group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not save group in database")
	}

	return c.Status(fiber.StatusCreated).JSON(RegisterDeviceResponse{
		ReadWriteToken: created.RwToken,
		ReadOnlyToken:  created.RoToken,
	})
}

// DeviceInfoResponse represents device information response
type DeviceInfoResponse struct {
	Token          string `json:"token" example:"dev_token_123"`
	ReadWriteToken string `json:"read_write_token" example:"rw_token_123"`
	ReadOnlyToken  string `json:"read_only_token" example:"ro_token_123"`
	DeviceEUI      string `json:"device_eui" example:"AABBCCDDEEFF0011"`
}

// GetDeviceByToken godoc
//
//	@Summary		Get device information by token
//	@Description	Retrieve device details using either read-write or read-only token
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string			true	"Device token (read-write or read-only)"
//	@Success		200			{object}	DeviceInfoResponse
//	@Failure		400			{object}	HTTPError	"Invalid token"
//	@Failure		404			{object}	HTTPError	"Device not found"
//	@Failure		500			{object}	HTTPError	"Internal server error"
//	@Router			/device/{deviceToken} [get]
func (a *API) handleDeviceInfoByToken(c fiber.Ctx) error {
	return nil
}
