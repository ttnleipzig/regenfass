package api

import (
	"encoding/base64"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ttn-leipzig/regenfass/internal/db"
	loraprotocol "github.com/ttn-leipzig/regenfass/internal/lora_protocol"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

// pickLocation returns the best location from an uplink message, or nil.
// TTN populates uplink_message.locations with device-level fixes (user-set or
// pushed by the device); rx_metadata carries per-gateway locations. Prefer the
// device-level fix, and only fall back to a gateway location if none is set.
func pickLocation(req *IngestRequest) *TTNLocation {
	for _, key := range []string{"user", "frm-payload"} {
		if loc, ok := req.UplinkMessage.Locations[key]; ok && (loc.Latitude != 0 || loc.Longitude != 0) {
			return &loc
		}
	}
	for _, loc := range req.UplinkMessage.Locations {
		if loc.Latitude != 0 || loc.Longitude != 0 {
			return &loc
		}
	}
	for _, meta := range req.UplinkMessage.RxMetadata {
		if meta.Location != nil && (meta.Location.Latitude != 0 || meta.Location.Longitude != 0) {
			return meta.Location
		}
	}
	return nil
}

// TTNLocation is a location entry as sent by The Things Network
// @Description A geo point sent by The Things Network (device locations map or gateway metadata)
type TTNLocation struct {
	Latitude  float64 `json:"latitude" example:"51.3397"`
	Longitude float64 `json:"longitude" example:"12.3731"`
	Altitude  float64 `json:"altitude,omitempty" example:"113"`
	Source    string  `json:"source,omitempty" example:"SOURCE_REGISTRY"`
}

// IngestRequest represents the incoming LoRaWAN uplink message
// @Description Request body for ingesting device measurements from LoRaWAN uplink messages
type IngestRequest struct {
	EndDeviceIDs struct {
		DevEUI string `json:"dev_eui" example:"1234567890123456"`
	} `json:"end_device_ids"`
	UplinkMessage struct {
		Payload    string                 `json:"frm_payload" example:"AQIDBA=="`
		ReceivedAt time.Time              `json:"received_at" example:"2024-01-15T10:30:00Z"`
		Locations  map[string]TTNLocation `json:"locations,omitempty"`
		RxMetadata []struct {
			Location *TTNLocation `json:"location,omitempty"`
		} `json:"rx_metadata,omitempty"`
	} `json:"uplink_message"`
}

// IngestData godoc
//
//	@Summary		Ingest LoRaWAN uplink data
//	@Description	Process LoRaWAN uplink messages and store device measurements
//	@Tags			ingest
//	@Accept			json
//	@Produce		json
//	@Param			body	body		IngestRequest	true	"LoRaWAN uplink message"
//	@Success		204		{string}	string			"No Content"
//	@Failure		400		{object}	HTTPError		"Bad Request"
//	@Failure		500		{object}	HTTPError		"Internal Server Error"
//	@Router			/ingest [post]
func (a *API) handleIngest(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	var body IngestRequest
	if err := c.Bind().JSON(&body); err != nil {
		log.Error().Err(err).Msg("could not parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse request body")
	}

	log = log.With().Str("deviceEUI", body.EndDeviceIDs.DevEUI).Logger()

	payload, err := base64.StdEncoding.DecodeString(body.UplinkMessage.Payload)
	if err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	log.Debug().Hex("decoded", payload).Str("raw", body.UplinkMessage.Payload).Msg("parsed payload")

	log.Debug().Msg("got request")

	tx, err := a.dbPool.BeginTx(c.Context(), pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not begin database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}
	defer tx.Rollback(c.Context())
	q := a.db.WithTx(tx)

	device, err := q.GetDeviceByEUI(c.Context(), body.EndDeviceIDs.DevEUI)
	if err != nil {
		log.Error().Err(err).Msg("could not get device by EUI")
		return fiber.NewError(fiber.StatusInternalServerError, "could not get device by EUI")
	}

	deviceUUID := utils.PGToUUID(device.ID)
	log = log.With().Stringer("deviceUUID", deviceUUID).Logger()

	log.Debug().Msg("found device in DB")

	if loc := pickLocation(&body); loc != nil {
		if err := q.UpdateDeviceLocation(c.Context(), db.UpdateDeviceLocationParams{
			ID:        device.ID,
			Latitude:  pgtype.Float8{Float64: loc.Latitude, Valid: true},
			Longitude: pgtype.Float8{Float64: loc.Longitude, Valid: true},
		}); err != nil {
			log.Error().Err(err).Msg("could not update device location")
			return fiber.NewError(fiber.StatusInternalServerError)
		}
		log.Debug().Float64("lat", loc.Latitude).Float64("lng", loc.Longitude).Str("source", loc.Source).Msg("updated device location")
	}

	datapoints, err := loraprotocol.Decode(payload)
	if err != nil {
		log.Error().Err(err).Msg("could not decode payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not decode payload")
	}

	pointsToInsert := make([]db.InsertDeviceMeasurementsParams, 0, len(datapoints))
	seenChannels := make(map[int16]struct{}, len(datapoints))
	for _, point := range datapoints {
		v, err := json.Marshal(point.Value)
		if err != nil {
			log.Error().Err(err).Msg("could not marshal point value")
			return fiber.NewError(fiber.StatusInternalServerError, "could not marshal point value")
		}

		channelID := int16(point.ChannelID)
		if _, ok := seenChannels[channelID]; !ok {
			if err := q.EnsureDeviceChannelMapping(c.Context(), db.EnsureDeviceChannelMappingParams{
				DeviceID:  device.ID,
				ChannelID: channelID,
			}); err != nil {
				log.Error().Err(err).Int16("channelID", channelID).Msg("could not ensure device channel mapping")
				return fiber.NewError(fiber.StatusInternalServerError)
			}
			seenChannels[channelID] = struct{}{}
		}

		pointsToInsert = append(pointsToInsert, db.InsertDeviceMeasurementsParams{
			DeviceID:        device.ID,
			MeasurementType: int16(point.Type),
			ChannelID:       channelID,
			Value:           v,
			ReceivedAt:      utils.TimeToPG(body.UplinkMessage.ReceivedAt),
		})
	}

	if _, err = q.InsertDeviceMeasurements(c.Context(), pointsToInsert); err != nil {
		log.Error().Err(err).Msg("could not insert device measurement")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := tx.Commit(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not commit database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
