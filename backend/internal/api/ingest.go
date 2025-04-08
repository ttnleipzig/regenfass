package api

import (
	"encoding/base64"
	"encoding/binary"
	"math"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/ttn-leipzig/regenfass/internal/db"
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

	log := utils.GetRequestLogger(c)

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

	waterLevel := readFloat32(payload[0:4])
	minimumLevel := readFloat32(payload[4:8])
	voltage := readFloat32(payload[8:12])

	log.Debug().
		Float32("waterLevel", waterLevel).
		Float32("minimumLevel", minimumLevel).
		Float32("voltage", voltage).
		Msg("got request")

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

	rawDeviceUUID, err := q.UpdateDeviceMinimumLevel(c.Context(), db.UpdateDeviceMinimumLevelParams{
		DeviceEui:    body.EndDeviceIDs.DevEUI,
		MinimumLevel: float64(minimumLevel),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not update device's minimum level")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	deviceUUID := utils.PGToUUID(rawDeviceUUID)
	log = log.With().Stringer("deviceUUID", deviceUUID).Logger()

	log.Debug().Msg("found device in DB")

	err = q.InsertDeviceMeasurement(c.Context(), db.InsertDeviceMeasurementParams{
		DeviceID:   rawDeviceUUID,
		WaterLevel: float64(waterLevel),
		Voltage:    float64(voltage),
		ReceivedAt: utils.TimeToPG(body.UplinkMessage.ReceivedAt),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not insert device measurement")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if err := tx.Commit(c.Context()); err != nil {
		log.Error().Err(err).Msg("could not commit database transaction")
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func readFloat32(bytes []byte) float32 {
	bits := binary.LittleEndian.Uint32(bytes)
	return math.Float32frombits(bits)
}
