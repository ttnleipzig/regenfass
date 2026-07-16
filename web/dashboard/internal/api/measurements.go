package api

import (
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

const (
	// targetRangedDataPoints is the number of data points we aim to return for a
	// ranged query, regardless of how wide the requested time span is. The
	// bucket width is derived from this so a wider span yields a coarser
	// resolution.
	targetRangedDataPoints = 2000
	// minRangedBucketSeconds caps the finest resolution at one point per minute.
	minRangedBucketSeconds = 60
	// maxRangedBucketSeconds caps the coarsest resolution at three points per
	// day (a point every eight hours).
	maxRangedBucketSeconds = 8 * 60 * 60
)

// rangedBucketSeconds picks a bucket width (in seconds) for a time span so that
// roughly targetRangedDataPoints buckets cover it, clamped so the resolution is
// never finer than one point per minute nor coarser than three points per day.
func rangedBucketSeconds(span time.Duration) float64 {
	bucket := span.Seconds() / targetRangedDataPoints
	if bucket < minRangedBucketSeconds {
		return minRangedBucketSeconds
	}
	if bucket > maxRangedBucketSeconds {
		return maxRangedBucketSeconds
	}
	return bucket
}

// LatestChannelMeasurement represents the latest reading for a single channel of a device
// @Description Latest reading for a single channel of a device
type LatestChannelMeasurement struct {
	ReceivedAt      time.Time       `json:"received_at" example:"2024-01-15T10:30:00Z"`
	ChannelID       int16           `json:"channel_id" example:"1"`
	ChannelName     string          `json:"channel_name" example:"Water Level"`
	MeasurementType int16           `json:"measurement_type" example:"4"`
	Value           json.RawMessage `json:"value" swaggertype:"object"`
}

// LatestDevice represents a device with its latest measurements
// @Description Device identity, name, location and its latest reading per channel. `name` is the user-set name, or a stable auto-generated nickname if none has been set. `is_readonly` is only set on endpoints that resolve a device through a specific token (e.g. `/overview`); it is omitted where read/write access is not token-scoped.
type LatestDevice struct {
	DeviceID     uuid.UUID                  `json:"device_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name         string                     `json:"name" example:"Happy Barrel"`
	Latitude     *float64                   `json:"latitude,omitempty" example:"51.3397"`
	Longitude    *float64                   `json:"longitude,omitempty" example:"12.3731"`
	IsReadonly   *bool                      `json:"is_readonly,omitempty" example:"false"`
	Measurements []LatestChannelMeasurement `json:"measurements"`
}

// LatestMeasurementsPayload selects which devices to return latest measurements for
// @Description Tokens identifying the devices of interest. Devices may be referenced directly by their token, or transitively via the token of a group they belong to.
type LatestMeasurementsPayload struct {
	Groups  []string `json:"groups" example:"gr_token_123,gr_token_456"`
	Devices []string `json:"devices" example:"dev_token_123,dev_token_456"`
}

// LatestMeasurementsResponse holds every requested device with its latest reading per channel
// @Description One entry per requested device. Devices that have not reported yet still appear here, with an empty measurements list and no location.
type LatestMeasurementsResponse struct {
	Devices []LatestDevice `json:"devices"`
}

// GetLatestMeasurements godoc
//
//	@Summary		Get latest measurements grouped per device
//	@Description	Returns one entry per device referenced (directly via `devices` or transitively via `groups`), including its name, location, and the most recent measurement per channel. Devices with no measurements yet still appear with an empty `measurements` list.
//	@Tags			measurements
//	@Accept			json
//	@Produce		json
//	@Param			body	body		LatestMeasurementsPayload	true	"Tokens selecting devices and/or groups"
//	@Success		200		{object}	LatestMeasurementsResponse
//	@Failure		400		{object}	HTTPError	"Invalid payload"
//	@Failure		500		{object}	HTTPError	"Internal server error"
//	@Router			/measurements/latest [post]
func (a *API) handleLatestMeasurements(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	var payload LatestMeasurementsPayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	if payload.Devices == nil {
		payload.Devices = []string{}
	}
	if payload.Groups == nil {
		payload.Groups = []string{}
	}

	if len(payload.Devices) == 0 && len(payload.Groups) == 0 {
		return c.JSON(LatestMeasurementsResponse{Devices: []LatestDevice{}})
	}

	devices, err := a.db.GetDevicesForTokens(c.Context(), db.GetDevicesForTokensParams{
		DeviceTokens: payload.Devices,
		GroupTokens:  payload.Groups,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not load devices for tokens")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load devices for tokens")
	}

	if len(devices) == 0 {
		return c.JSON(LatestMeasurementsResponse{Devices: []LatestDevice{}})
	}

	deviceIDs := make([]pgtype.UUID, len(devices))
	for i, d := range devices {
		deviceIDs[i] = d.ID
	}

	rows, err := a.db.GetLatestMeasurementsForDeviceIDs(c.Context(), deviceIDs)
	if err != nil {
		log.Error().Err(err).Msg("could not load latest device measurements")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load latest device measurements")
	}

	// Index measurements per device UUID so we can attach them to the device
	// entries below in a single pass.
	measurementsByDevice := make(map[uuid.UUID][]LatestChannelMeasurement, len(devices))
	for _, r := range rows {
		id := utils.PGToUUID(r.DeviceID)
		measurementsByDevice[id] = append(measurementsByDevice[id], LatestChannelMeasurement{
			ReceivedAt:      r.ReceivedAt.Time,
			ChannelID:       r.ChannelID,
			ChannelName:     r.ChannelName,
			MeasurementType: r.MeasurementType,
			Value:           json.RawMessage(r.Value),
		})
	}

	out := make([]LatestDevice, len(devices))
	for i, d := range devices {
		out[i] = buildLatestDevice(d.ID, d.Name, d.Latitude, d.Longitude, nil, measurementsByDevice)
	}

	return c.JSON(LatestMeasurementsResponse{Devices: out})
}

// RangedMeasurementsResponse holds a downsampled measurement series for a device
// @Description Downsampled measurement series for a device over a time range. The resolution adapts to the span: the wider the range, the coarser the buckets (never finer than one point per minute, never coarser than three points per day). `bucket_seconds` reports the bucket width that was actually used.
type RangedMeasurementsResponse struct {
	Start         time.Time           `json:"start" example:"2024-01-01T00:00:00Z"`
	End           time.Time           `json:"end" example:"2024-01-08T00:00:00Z"`
	ChannelID     *int16              `json:"channel_id,omitempty" example:"1"`
	BucketSeconds float64             `json:"bucket_seconds" example:"302.4"`
	Measurements  []DeviceMeasurement `json:"measurements"`
}

// GetDeviceMeasurementsRanged godoc
//
//	@Summary		Get downsampled device measurements over a time range
//	@Description	Retrieve a device's measurement history between `start` and `end`, downsampled to a resolution that scales with the span. The endpoint aims for roughly 2000 data points per channel: wider ranges are bucketed more coarsely (never coarser than three points per day) and narrower ranges more finely (never finer than one point per minute). Each bucket is represented by its newest reading. Optionally restrict to a single channel. Authenticated by either the read-write or read-only device token.
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string	true	"Device token (read-write or read-only)"
//	@Param			start		query		string	true	"Start of the range, inclusive (RFC3339)"
//	@Param			end			query		string	true	"End of the range, inclusive (RFC3339)"
//	@Param			channel		query		int		false	"Only return measurements for this channel id"
//	@Success		200			{object}	RangedMeasurementsResponse
//	@Failure		400			{object}	HTTPError	"Invalid token or query parameter"
//	@Failure		404			{object}	HTTPError	"Device not found"
//	@Failure		500			{object}	HTTPError	"Internal server error"
//	@Router			/device/{deviceToken}/measurements [get]
func (a *API) handleDeviceMeasurements(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	deviceToken := c.Params("deviceToken")
	if deviceToken == "" {
		log.Error().Msg("invalid device token")
		return fiber.NewError(fiber.StatusBadRequest, "invalid device token")
	}

	rawStart := c.Query("start")
	rawEnd := c.Query("end")
	if rawStart == "" || rawEnd == "" {
		return fiber.NewError(fiber.StatusBadRequest, "start and end query parameters are required (RFC3339)")
	}

	start, err := time.Parse(time.RFC3339, rawStart)
	if err != nil {
		log.Error().Err(err).Str("start", rawStart).Msg("invalid start query parameter")
		return fiber.NewError(fiber.StatusBadRequest, "invalid start query parameter (expected RFC3339)")
	}
	end, err := time.Parse(time.RFC3339, rawEnd)
	if err != nil {
		log.Error().Err(err).Str("end", rawEnd).Msg("invalid end query parameter")
		return fiber.NewError(fiber.StatusBadRequest, "invalid end query parameter (expected RFC3339)")
	}
	if !end.After(start) {
		return fiber.NewError(fiber.StatusBadRequest, "end must be after start")
	}

	channel := pgtype.Int2{}
	var channelPtr *int16
	if raw := c.Query("channel"); raw != "" {
		parsed, err := strconv.ParseInt(raw, 10, 16)
		if err != nil {
			log.Error().Err(err).Str("channel", raw).Msg("invalid channel query parameter")
			return fiber.NewError(fiber.StatusBadRequest, "invalid channel query parameter (expected integer)")
		}
		id := int16(parsed)
		channel = pgtype.Int2{Int16: id, Valid: true}
		channelPtr = &id
	}

	device, err := a.db.GetDeviceByEitherToken(c.Context(), deviceToken)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fiber.NewError(fiber.StatusNotFound, "device not found")
		}
		log.Error().Err(err).Msg("could not find device in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not find device in database")
	}

	bucketSeconds := rangedBucketSeconds(end.Sub(start))

	rows, err := a.db.GetDeviceMeasurementsRanged(c.Context(), db.GetDeviceMeasurementsRangedParams{
		DeviceID:      device.ID,
		StartTime:     utils.TimeToPG(start),
		EndTime:       utils.TimeToPG(end),
		ChannelID:     channel,
		BucketSeconds: bucketSeconds,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not load ranged device measurements")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load ranged device measurements")
	}

	measurements := make([]DeviceMeasurement, len(rows))
	for i, r := range rows {
		measurements[i] = DeviceMeasurement{
			ReceivedAt:      r.ReceivedAt.Time,
			ChannelID:       r.ChannelID,
			ChannelName:     r.ChannelName,
			MeasurementType: r.MeasurementType,
			Value:           json.RawMessage(r.Value),
		}
	}

	return c.JSON(RangedMeasurementsResponse{
		Start:         start,
		End:           end,
		ChannelID:     channelPtr,
		BucketSeconds: bucketSeconds,
		Measurements:  measurements,
	})
}
