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

	log = a.log.With().Str("deviceEUI", body.EndDeviceIDs.DevEUI).Logger()

	payload, err := base64.StdEncoding.DecodeString(body.UplinkMessage.Payload)
	if err != nil {
		a.log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	a.log.Debug().Hex("decoded", payload).Str("raw", body.UplinkMessage.Payload).Msg("parsed payload")

	a.log.Debug().Msg("got request")

	tx, err := a.dbPool.BeginTx(c.Context(), pgx.TxOptions{
		IsoLevel:       pgx.Serializable,
		AccessMode:     pgx.ReadWrite,
		DeferrableMode: pgx.NotDeferrable,
	})
	if err != nil {
		a.log.Error().Err(err).Msg("could not begin database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}
	defer tx.Rollback(c.Context())
	q := a.db.WithTx(tx)

	device, err := q.GetDeviceByEUI(c.Context(), body.EndDeviceIDs.DevEUI)
	if err != nil {
		a.log.Error().Err(err).Msg("could not get device by EUI")
		return fiber.NewError(fiber.StatusInternalServerError, "could not get device by EUI")
	}

	// rawDeviceUUID, err := q.UpdateDeviceMinimumLevel(c.Context(), db.UpdateDeviceMinimumLevelParams{
	// 	DeviceEui:    body.EndDeviceIDs.DevEUI,
	// 	MinimumLevel: float64(minimumLevel),
	// })
	// if err != nil {
	// 	a.log.Error().Err(err).Msg("could not update device's minimum level")
	// 	return fiber.NewError(fiber.StatusInternalServerError)
	// }

	deviceUUID := utils.PGToUUID(device.ID)
	a.log = a.log.With().Stringer("deviceUUID", deviceUUID).Logger()

	a.log.Debug().Msg("found device in DB")

	datapoints, err := loraprotocol.Decode(payload)
	if err != nil {
		a.log.Error().Err(err).Msg("could not decode payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not decode payload")
	}

	pointsToInsert := make([]db.InsertDeviceMeasurementsParams, 0, len(datapoints))
	for _, point := range datapoints {
		v, err := json.Marshal(point.Value)
		if err != nil {
			a.log.Error().Err(err).Msg("could not marshal point value")
			return fiber.NewError(fiber.StatusInternalServerError, "could not marshal point value")
		}

		pointsToInsert = append(pointsToInsert, db.InsertDeviceMeasurementsParams{
			DeviceID:        device.ID,
			MeasurementType: int16(point.Type),
			ChannelID:       int16(point.ChannelID),
			Value:           v,
			ReceivedAt:      utils.TimeToPG(body.UplinkMessage.ReceivedAt),
		})
	}

	if _, err = q.InsertDeviceMeasurements(c.Context(), pointsToInsert); err != nil {
		a.log.Error().Err(err).Msg("could not insert device measurement")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := tx.Commit(c.Context()); err != nil {
		a.log.Error().Err(err).Msg("could not commit database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
