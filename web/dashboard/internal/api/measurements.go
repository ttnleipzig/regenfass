package api

import (
	"context"
	"errors"
	"fmt"
	"sort"
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

// MeasurementSample is a single reading of a channel
// @Description One reading of a channel: when it arrived and its value. Every value is a number; a Boolean is stored as 0 or 1. How to read the value is a property of the channel (`measurement_type` if declared, else `reported_type`), so it is not repeated per sample.
type MeasurementSample struct {
	ReceivedAt time.Time `json:"received_at" example:"2024-01-15T10:30:00Z"`
	Value      float64   `json:"value" example:"42.5"`
}

// DeviceChannel is a channel of a device
// @Description One channel of a device and how it has been described in the dashboard. A channel is listed once somebody has named it, declared a type for it or hidden it — including a channel set up before the device ever reported on it — and once it has carried a measurement. `name` and `measurement_type` are absent for a channel nobody has described. `measurement_type` is the type the user declared, which labels the channel and picks the unit its readings render in. `reported_type` is the type the newest reading in the response was decoded with, straight from the uplink payload; it is absent for a channel with no readings in the response. A hidden channel is listed so it can be restored, but carries no readings in any measurement response.
type DeviceChannel struct {
	ChannelID       int16   `json:"channel_id" example:"1"`
	Name            *string `json:"name,omitempty" example:"Water Level"`
	MeasurementType *int16  `json:"measurement_type,omitempty" example:"4"`
	ReportedType    *int16  `json:"reported_type,omitempty" example:"1"`
	Hidden          bool    `json:"hidden" example:"false"`
}

// LatestDeviceChannel is a channel of a device together with its newest reading
// @Description A channel and its most recent reading. `latest` is absent while the channel has never reported, and for a hidden channel.
type LatestDeviceChannel struct {
	DeviceChannel
	Latest *MeasurementSample `json:"latest,omitempty"`
}

// RangedDeviceChannel is a channel of a device together with its readings in a time range
// @Description A channel and its downsampled readings within the requested range, ordered chronologically. `measurements` is empty for a channel that has nothing in the range, has never reported, or is hidden — the channel is still listed so a slot prepared ahead of its sensor shows up.
type RangedDeviceChannel struct {
	DeviceChannel
	Measurements []MeasurementSample `json:"measurements"`
}

// channelsForDevices loads every described channel of the given devices, keyed
// by device UUID. Channels that only exist through their measurements are not
// in here; mergeChannels adds those.
func (a *API) channelsForDevices(ctx context.Context, deviceIDs []pgtype.UUID) (map[uuid.UUID][]DeviceChannel, error) {
	byDevice := make(map[uuid.UUID][]DeviceChannel, len(deviceIDs))
	if len(deviceIDs) == 0 {
		return byDevice, nil
	}

	rows, err := a.db.GetChannelMappingsForDeviceIDs(ctx, deviceIDs)
	if err != nil {
		return nil, err
	}

	for _, r := range rows {
		channel := DeviceChannel{
			ChannelID: r.ChannelID,
			Name:      utils.PGTextToPtr(r.Name),
			Hidden:    r.Hidden,
		}
		if r.MeasurementType.Valid {
			declared := r.MeasurementType.Int16
			channel.MeasurementType = &declared
		}
		id := utils.PGToUUID(r.DeviceID)
		byDevice[id] = append(byDevice[id], channel)
	}

	return byDevice, nil
}

// mergeChannels assembles a device's channel list: every described channel,
// plus an undescribed entry for every channel that is only known through the
// readings it produced. A mapping row exists only where somebody described or
// hid a channel, so a channel that simply reports has to be added from its
// data or it would never be listed. reported maps each channel that has
// readings in the response to the type its newest reading was decoded with,
// which becomes the channel's reported_type. The result is ordered by channel
// id.
func mergeChannels(described []DeviceChannel, reported map[int16]int16) []DeviceChannel {
	out := make([]DeviceChannel, 0, len(described)+len(reported))
	seen := make(map[int16]bool, len(described))
	for _, ch := range described {
		seen[ch.ChannelID] = true
		if t, ok := reported[ch.ChannelID]; ok {
			ch.ReportedType = &t
		}
		out = append(out, ch)
	}
	for id, t := range reported {
		if !seen[id] {
			out = append(out, DeviceChannel{ChannelID: id, ReportedType: &t})
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ChannelID < out[j].ChannelID })
	return out
}

// latestChannelsForDevices loads the described channels and the newest reading
// per channel of the given devices and merges them into one channel list per
// device, keyed by device UUID and ready to hand to buildLatestDevice.
func (a *API) latestChannelsForDevices(ctx context.Context, deviceIDs []pgtype.UUID) (map[uuid.UUID][]LatestDeviceChannel, error) {
	out := make(map[uuid.UUID][]LatestDeviceChannel, len(deviceIDs))
	if len(deviceIDs) == 0 {
		return out, nil
	}

	rows, err := a.db.GetLatestMeasurementsForDeviceIDs(ctx, deviceIDs)
	if err != nil {
		return nil, fmt.Errorf("load latest measurements: %w", err)
	}
	type latestRow struct {
		sample       MeasurementSample
		reportedType int16
	}
	latestByDevice := make(map[uuid.UUID]map[int16]latestRow, len(deviceIDs))
	for _, r := range rows {
		id := utils.PGToUUID(r.DeviceID)
		latest := latestByDevice[id]
		if latest == nil {
			latest = make(map[int16]latestRow)
			latestByDevice[id] = latest
		}
		latest[r.ChannelID] = latestRow{
			sample:       MeasurementSample{ReceivedAt: r.ReceivedAt.Time, Value: r.Value},
			reportedType: r.MeasurementType,
		}
	}

	describedByDevice, err := a.channelsForDevices(ctx, deviceIDs)
	if err != nil {
		return nil, fmt.Errorf("load channels: %w", err)
	}

	for _, pgID := range deviceIDs {
		id := utils.PGToUUID(pgID)
		latest := latestByDevice[id]
		reported := make(map[int16]int16, len(latest))
		for channelID, row := range latest {
			reported[channelID] = row.reportedType
		}
		channels := mergeChannels(describedByDevice[id], reported)
		entries := make([]LatestDeviceChannel, len(channels))
		for i, ch := range channels {
			entries[i] = LatestDeviceChannel{DeviceChannel: ch}
			if row, ok := latest[ch.ChannelID]; ok {
				sample := row.sample
				entries[i].Latest = &sample
			}
		}
		out[id] = entries
	}

	return out, nil
}

// LatestDevice represents a device with its channels and their latest readings
// @Description Device identity, name, location and its channels, each with its latest reading. `name` is the user-set name, or a stable auto-generated nickname if none has been set. `is_readonly` is only set on endpoints that resolve a device through a specific token (e.g. `/overview`); it is omitted where read/write access is not token-scoped.
type LatestDevice struct {
	DeviceID   uuid.UUID             `json:"device_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name       string                `json:"name" example:"Happy Barrel"`
	Latitude   *float64              `json:"latitude,omitempty" example:"51.3397"`
	Longitude  *float64              `json:"longitude,omitempty" example:"12.3731"`
	IsReadonly *bool                 `json:"is_readonly,omitempty" example:"false"`
	Channels   []LatestDeviceChannel `json:"channels"`
}

// LatestMeasurementsPayload selects which devices to return latest measurements for
// @Description Tokens identifying the devices of interest. Devices may be referenced directly by their token, or transitively via the token of a group they belong to.
type LatestMeasurementsPayload struct {
	Groups  []string `json:"groups" example:"gr_token_123,gr_token_456"`
	Devices []string `json:"devices" example:"dev_token_123,dev_token_456"`
}

// LatestMeasurementsResponse holds every requested device with its channels and their latest readings
// @Description One entry per requested device. Devices that have not reported yet still appear here, with only their described channels (if any) and no location.
type LatestMeasurementsResponse struct {
	Devices []LatestDevice `json:"devices"`
}

// GetLatestMeasurements godoc
//
//	@Summary		Get latest measurements grouped per device
//	@Description	Returns one entry per device referenced (directly via `devices` or transitively via `groups`), including its name, location, and its channels each carrying their most recent reading. Devices with no measurements yet still appear, listing only the channels somebody has described.
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

	channelsByDevice, err := a.latestChannelsForDevices(c.Context(), deviceIDs)
	if err != nil {
		log.Error().Err(err).Msg("could not load device channels")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load device channels")
	}

	out := make([]LatestDevice, len(devices))
	for i, d := range devices {
		out[i] = buildLatestDevice(d.ID, d.Name, d.Latitude, d.Longitude, nil, channelsByDevice)
	}

	return c.JSON(LatestMeasurementsResponse{Devices: out})
}

// RangedMeasurementsResponse holds a device's channels with their downsampled readings over a time range
// @Description A device's channels, each with its downsampled readings over the requested range. Every channel of the device is listed — described ones as well as ones only known from their data — so a channel that has nothing in the range still appears, with an empty `measurements`. The resolution adapts to the span: the wider the range, the coarser the buckets (never finer than one point per minute, never coarser than three points per day). `bucket_seconds` reports the bucket width that was actually used. With `channel` given, only that channel is listed.
type RangedMeasurementsResponse struct {
	Start         time.Time             `json:"start" example:"2024-01-01T00:00:00Z"`
	End           time.Time             `json:"end" example:"2024-01-08T00:00:00Z"`
	ChannelID     *int16                `json:"channel_id,omitempty" example:"1"`
	BucketSeconds float64               `json:"bucket_seconds" example:"302.4"`
	Channels      []RangedDeviceChannel `json:"channels"`
}

// GetDeviceMeasurementsRanged godoc
//
//	@Summary		Get downsampled device measurements over a time range
//	@Description	Retrieve a device's channels with their measurement history between `start` and `end`, downsampled to a resolution that scales with the span. The endpoint aims for roughly 2000 data points per channel: wider ranges are bucketed more coarsely (never coarser than three points per day) and narrower ranges more finely (never finer than one point per minute). Each bucket is represented by its newest reading. Every channel is listed, with its description attached once, whether or not it has readings in the range. Optionally restrict to a single channel. Authenticated by either the read-write or read-only device token.
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

	// Readings per channel, in the order the query returns them (chronological
	// within a channel), and the type each channel's newest reading was decoded
	// with — the one thing about a sample that isn't repeated per sample.
	seriesByChannel := make(map[int16][]MeasurementSample)
	reported := make(map[int16]int16)
	for _, r := range rows {
		seriesByChannel[r.ChannelID] = append(seriesByChannel[r.ChannelID], MeasurementSample{
			ReceivedAt: r.ReceivedAt.Time,
			Value:      r.Value,
		})
		reported[r.ChannelID] = r.MeasurementType
	}

	describedByDevice, err := a.channelsForDevices(c.Context(), []pgtype.UUID{device.ID})
	if err != nil {
		log.Error().Err(err).Msg("could not load device channels")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load device channels")
	}
	described := describedByDevice[utils.PGToUUID(device.ID)]
	if channelPtr != nil {
		// The query already restricted the readings; the channel list has to
		// follow suit or the response would list every channel with no data.
		filtered := make([]DeviceChannel, 0, 1)
		for _, ch := range described {
			if ch.ChannelID == *channelPtr {
				filtered = append(filtered, ch)
			}
		}
		described = filtered
	}

	merged := mergeChannels(described, reported)
	channels := make([]RangedDeviceChannel, len(merged))
	for i, ch := range merged {
		series := seriesByChannel[ch.ChannelID]
		if series == nil {
			series = []MeasurementSample{}
		}
		channels[i] = RangedDeviceChannel{DeviceChannel: ch, Measurements: series}
	}

	return c.JSON(RangedMeasurementsResponse{
		Start:         start,
		End:           end,
		ChannelID:     channelPtr,
		BucketSeconds: bucketSeconds,
		Channels:      channels,
	})
}
