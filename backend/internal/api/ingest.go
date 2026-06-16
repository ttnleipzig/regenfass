package api

import (
	"encoding/base64"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/ttn-leipzig/regenfass/internal/db"
	loraprotocol "github.com/ttn-leipzig/regenfass/internal/lora_protocol"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

// IngestRequest represents the incoming LoRaWAN uplink message
// @Description Request body for ingesting device measurements from LoRaWAN uplink messages
type IngestRequest struct {
	EndDeviceIDs struct {
		DevEUI string `json:"dev_eui" example:"1234567890123456"`
	} `json:"end_device_ids"`
	UplinkMessage struct {
		Payload    string    `json:"frm_payload" example:"AQIDBA=="`
		ReceivedAt time.Time `json:"received_at" example:"2024-01-15T10:30:00Z"`
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
	type Body struct {
		EndDeviceIDs struct {
			DevEUI string `json:"dev_eui"`
		} `json:"end_device_ids"`
		UplinkMessage struct {
			Payload    string    `json:"frm_payload"`
			ReceivedAt time.Time `json:"received_at"`
		} `json:"uplink_message"`
	}

	log := a.getRequestLogger(c)

	var body Body
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
