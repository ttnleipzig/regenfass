package api

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ttn-leipzig/regenfass/internal/db"
	loraprotocol "github.com/ttn-leipzig/regenfass/internal/lora_protocol"
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
//	@Failure		400			{object}	HTTPError	"Invalid payload"
//	@Failure		409			{object}	HTTPError	"Device EUI is already registered"
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
		// device_eui is unique: a device that is already enrolled must keep the
		// tokens it was handed the first time, so say so instead of failing hard.
		if utils.IsUniqueViolation(err) {
			log.Debug().Msg("device EUI is already registered")
			return fiber.NewError(fiber.StatusConflict, "device EUI is already registered")
		}
		log.Error().Err(err).Msg("could not save device in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not save device in database")
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

// UpsertDeviceChannelPayload represents the request body for describing a channel
// @Description How a device's channel should be described. `measurement_type` is the type the user picked in the dashboard. Send either field as null (or the name as empty) to clear it, which returns the channel to being undescribed.
type UpsertDeviceChannelPayload struct {
	Name            *string `json:"name,omitempty" example:"Water Level"`
	MeasurementType *int16  `json:"measurement_type,omitempty" example:"4"`
}

// UpsertDeviceChannel godoc
//
//	@Summary		Describe a device channel
//	@Description	Set the name and declared measurement type of one of a device's channels. The channel does not have to have reported anything yet — describing it up front is how a slot is prepared for a sensor. Requires the read-write token.
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string						true	"Device read-write token"
//	@Param			channelID	path		int							true	"Channel id (0–15)"
//	@Param			body		body		UpsertDeviceChannelPayload	true	"How to describe the channel"
//	@Success		204			{string}	string						"No Content"
//	@Failure		400			{object}	HTTPError					"Invalid token, channel id or payload"
//	@Failure		403			{object}	HTTPError					"Device token is read-only"
//	@Failure		404			{object}	HTTPError					"Device not found"
//	@Failure		500			{object}	HTTPError					"Internal server error"
//	@Router			/device/{deviceToken}/channels/{channelID} [put]
//
// resolveWritableChannel validates the path parameters shared by the channel
// endpoints and resolves the device behind the token, rejecting a read-only one.
// Describing and clearing a channel both need exactly this much.
func (a *API) resolveWritableChannel(c fiber.Ctx) (db.GetDeviceByEitherTokenRow, int16, error) {
	log := a.getRequestLogger(c)

	deviceToken := c.Params("deviceToken")
	if deviceToken == "" {
		log.Error().Msg("invalid device token")
		return db.GetDeviceByEitherTokenRow{}, 0, fiber.NewError(fiber.StatusBadRequest, "invalid device token")
	}

	rawChannel := c.Params("channelID")
	parsed, err := strconv.ParseInt(rawChannel, 10, 16)
	if err != nil || parsed < 0 || parsed > loraprotocol.MaxChannelID {
		log.Error().Str("channelID", rawChannel).Msg("invalid channel id")
		return db.GetDeviceByEitherTokenRow{}, 0, fiber.NewError(fiber.StatusBadRequest, "invalid channel id (expected 0–15)")
	}

	device, err := a.db.GetDeviceByEitherToken(c.Context(), deviceToken)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.GetDeviceByEitherTokenRow{}, 0, fiber.NewError(fiber.StatusNotFound, "device not found")
		}
		log.Error().Err(err).Msg("could not load device from database")
		return db.GetDeviceByEitherTokenRow{}, 0, fiber.NewError(fiber.StatusInternalServerError, "could not load device from database")
	}

	if device.IsReadonly {
		return db.GetDeviceByEitherTokenRow{}, 0, fiber.NewError(fiber.StatusForbidden, "device token is read-only")
	}

	return device, int16(parsed), nil
}

func (a *API) handleUpsertDeviceChannel(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	device, channelID, err := a.resolveWritableChannel(c)
	if err != nil {
		return err
	}

	var payload UpsertDeviceChannelPayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	measurementType := pgtype.Int2{}
	if payload.MeasurementType != nil {
		if !loraprotocol.MeasurementType(*payload.MeasurementType).Valid() {
			log.Error().Int16("measurementType", *payload.MeasurementType).Msg("unknown measurement type")
			return fiber.NewError(fiber.StatusBadRequest, "unknown measurement type")
		}
		measurementType = pgtype.Int2{Int16: *payload.MeasurementType, Valid: true}
	}

	// An empty name is a cleared name, not the string "": a channel nobody has
	// described carries no name at all.
	name := pgtype.Text{}
	if payload.Name != nil {
		if trimmed := strings.TrimSpace(*payload.Name); trimmed != "" {
			name = pgtype.Text{String: trimmed, Valid: true}
		}
	}

	if err := a.db.UpsertDeviceChannelMapping(c.Context(), db.UpsertDeviceChannelMappingParams{
		DeviceID:        device.ID,
		ChannelID:       channelID,
		Name:            name,
		MeasurementType: measurementType,
	}); err != nil {
		log.Error().Err(err).Int16("channelID", channelID).Msg("could not save device channel")
		return fiber.NewError(fiber.StatusInternalServerError, "could not save device channel")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// SetDeviceChannelHiddenPayload represents the request body for hiding a channel
// @Description Whether the channel should be shown on the dashboard.
type SetDeviceChannelHiddenPayload struct {
	Hidden bool `json:"hidden" example:"true"`
}

// SetDeviceChannelHidden godoc
//
//	@Summary		Hide or restore a device channel
//	@Description	Takes a channel off the dashboard, or puts it back. Nothing is deleted: the channel's measurements stay and new ones keep arriving, they are simply not returned by the measurement endpoints while it is hidden. A hidden channel still appears in a device's `channels` so it can be restored. Requires the read-write token.
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string							true	"Device read-write token"
//	@Param			channelID	path		int								true	"Channel id (0–15)"
//	@Param			body		body		SetDeviceChannelHiddenPayload	true	"Whether to hide the channel"
//	@Success		204			{string}	string							"No Content"
//	@Failure		400			{object}	HTTPError						"Invalid token, channel id or payload"
//	@Failure		403			{object}	HTTPError						"Device token is read-only"
//	@Failure		404			{object}	HTTPError						"Device not found"
//	@Failure		500			{object}	HTTPError						"Internal server error"
//	@Router			/device/{deviceToken}/channels/{channelID}/hidden [put]
func (a *API) handleSetDeviceChannelHidden(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	device, channelID, err := a.resolveWritableChannel(c)
	if err != nil {
		return err
	}

	var payload SetDeviceChannelHiddenPayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	if err := a.db.SetDeviceChannelHidden(c.Context(), db.SetDeviceChannelHiddenParams{
		DeviceID:  device.ID,
		ChannelID: channelID,
		Hidden:    payload.Hidden,
	}); err != nil {
		log.Error().Err(err).Int16("channelID", channelID).Msg("could not set device channel visibility")
		return fiber.NewError(fiber.StatusInternalServerError, "could not set device channel visibility")
	}

	return c.SendStatus(fiber.StatusNoContent)
}
