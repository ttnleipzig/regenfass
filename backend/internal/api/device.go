package api

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/internal/utils"
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
// @Description Identity of a device. When authenticated with the read-write token, both tokens are returned; otherwise only the read-only token is returned. `name` is the user-set name, or a stable auto-generated nickname if none has been set.
type DeviceInfoResponse struct {
	DeviceID       uuid.UUID `json:"device_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name           string    `json:"name" example:"Happy Barrel"`
	Latitude       *float64  `json:"latitude,omitempty" example:"51.3397"`
	Longitude      *float64  `json:"longitude,omitempty" example:"12.3731"`
	IsReadonly     bool      `json:"is_readonly" example:"false"`
	ReadOnlyToken  string    `json:"read_only_token" example:"ro_token_123"`
	ReadWriteToken string    `json:"read_write_token,omitempty" example:"rw_token_123"`
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
	log := a.getRequestLogger(c)

	deviceToken := c.Params("deviceToken")
	if deviceToken == "" {
		log.Error().Msg("invalid device token")
		return fiber.NewError(fiber.StatusBadRequest, "invalid device token")
	}

	device, err := a.db.GetDeviceByEitherToken(c.Context(), deviceToken)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fiber.NewError(fiber.StatusNotFound, "device not found")
		}
		log.Error().Err(err).Msg("could not load device from database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load device from database")
	}

	name := device.Name
	if name == "" {
		name = utils.FriendlyDeviceName(device.ID)
	}
	resp := DeviceInfoResponse{
		DeviceID:      utils.PGToUUID(device.ID),
		Name:          name,
		IsReadonly:    device.IsReadonly,
		ReadOnlyToken: device.RoToken,
	}
	if device.Latitude.Valid {
		lat := device.Latitude.Float64
		resp.Latitude = &lat
	}
	if device.Longitude.Valid {
		lng := device.Longitude.Float64
		resp.Longitude = &lng
	}
	if !device.IsReadonly {
		resp.ReadWriteToken = device.RwToken
	}

	return c.JSON(resp)
}

// UpdateDevicePayload represents the request body for updating a device
// @Description Fields that can be updated on a device (only present fields are applied)
type UpdateDevicePayload struct {
	Name *string `json:"name,omitempty" example:"Rain barrel by the shed"`
}

// UpdateDevice godoc
//
//	@Summary		Update device fields
//	@Description	Update mutable device fields (currently only the custom name). Requires the read-write token.
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string				true	"Device read-write token"
//	@Param			body		body		UpdateDevicePayload	true	"Fields to update"
//	@Success		204			{string}	string				"No Content"
//	@Failure		400			{object}	HTTPError			"Invalid token or payload"
//	@Failure		403			{object}	HTTPError			"Device token is read-only"
//	@Failure		404			{object}	HTTPError			"Device not found"
//	@Failure		500			{object}	HTTPError			"Internal server error"
//	@Router			/device/{deviceToken} [patch]
func (a *API) handleUpdateDevice(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	deviceToken := c.Params("deviceToken")
	if deviceToken == "" {
		log.Error().Msg("invalid device token")
		return fiber.NewError(fiber.StatusBadRequest, "invalid device token")
	}

	var payload UpdateDevicePayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	device, err := a.db.GetDeviceByEitherToken(c.Context(), deviceToken)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fiber.NewError(fiber.StatusNotFound, "device not found")
		}
		log.Error().Err(err).Msg("could not load device from database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load device from database")
	}

	if device.IsReadonly {
		return fiber.NewError(fiber.StatusForbidden, "device token is read-only")
	}

	if payload.Name != nil {
		if err := a.db.UpdateDeviceName(c.Context(), db.UpdateDeviceNameParams{
			ID:   device.ID,
			Name: *payload.Name,
		}); err != nil {
			log.Error().Err(err).Msg("could not update device name")
			return fiber.NewError(fiber.StatusInternalServerError, "could not update device name")
		}
	}

	return c.SendStatus(fiber.StatusNoContent)
}
