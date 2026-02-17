package api

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

type GroupInfoDevice struct {
	Token      string `json:"token"`
	IsReadonly bool   `json:"is_readonly"`
}

type GroupInfoResponse struct {
	Name       string            `json:"name"`
	IsReadonly bool              `json:"is_readonly"`
	Devices    []GroupInfoDevice `json:"devices"`
}

func (a *API) handleGroupInfoByToken(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	groupToken := c.Params("groupToken")
	if groupToken == "" {
		log.Error().Msg("invalid group token")
		return fiber.NewError(fiber.StatusBadRequest, "invalid group token")
	}

	groupInfo, err := a.db.GetGroupByEitherToken(c.Context(), groupToken)
	if err != nil {
		log.Error().Err(err).Msg("could not find group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not find group in database")
	}

	groupDevices, err := a.db.GetDevicesInGroupByGroupID(c.Context(), db.GetDevicesInGroupByGroupIDParams{
		GroupID: groupInfo.ID,
		Column2: strconv.FormatBool(groupInfo.IsReadonly),
	})
	if err != nil {
		log.Error().Err(err).Msg("could not find devices in group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not find devices in group in database")
	}

	devices := make([]GroupInfoDevice, len(groupDevices))
	for i, device := range groupDevices {
		devices[i] = GroupInfoDevice{
			Token:      device.Token,
			IsReadonly: device.IsReadonly,
		}
	}

	return c.JSON(GroupInfoResponse{
		Name:       groupInfo.Name,
		IsReadonly: groupInfo.IsReadonly,
		Devices:    devices,
	})
}

type AddDeviceToGroupPayload struct {
	DeviceToken string `json:"device_token"`
}

type AddDeviceToGroupResponse struct {
	ID             uuid.UUID `json:"id"`
	ReadWriteToken string    `json:"read_write_token"`
	ReadOnlyToken  string    `json:"read_only_token"`
}

func (a *API) handleAddDeviceToGroup(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	groupToken := c.Params("groupToken")
	if groupToken == "" {
		log.Error().Msg("invalid group token")
		return fiber.NewError(fiber.StatusBadRequest, "invalid group token")
	}

	var payload AddDeviceToGroupPayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	device, err := a.db.GetDeviceByEitherToken(c.Context(), payload.DeviceToken)
	if err != nil {
		log.Error().Err(err).Msg("could not find device in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not find device in database")
	}

	group, err := a.db.GetGroupByEitherToken(c.Context(), groupToken)
	if err != nil {
		log.Error().Err(err).Msg("could not find group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not find group in database")
	}

	if group.IsReadonly {
		log.Warn().Err(err).Msg("group token is read-only")
		return fiber.NewError(fiber.StatusForbidden, "group token is read-only")
	}

	err = a.db.AddDeviceToGroup(c.Context(), db.AddDeviceToGroupParams{
		DeviceID:   device.ID,
		GroupID:    group.ID,
		IsReadonly: device.IsReadonly,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not save modified group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not save modified group in database")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

type CreateGroupPayload struct {
	Name string `json:"name"`
}

type CreateGroupResponse struct {
	ID             uuid.UUID `json:"id"`
	ReadWriteToken string    `json:"read_write_token"`
	ReadOnlyToken  string    `json:"read_only_token"`
}

func (a *API) handleCreateGroup(c fiber.Ctx) error {
	log := a.getRequestLogger(c)

	var payload CreateGroupPayload
	if err := c.Bind().Body(&payload); err != nil {
		log.Error().Err(err).Msg("could not parse message payload")
		return fiber.NewError(fiber.StatusBadRequest, "could not parse message payload")
	}

	created, err := a.db.CreateGroup(c.Context(), payload.Name)
	if err != nil {
		log.Error().Err(err).Msg("could not save group in database")
		return fiber.NewError(fiber.StatusInternalServerError, "could not save group in database")
	}

	return c.JSON(CreateGroupResponse{
		ID:             utils.PGToUUID(created.ID),
		ReadWriteToken: created.RwToken,
		ReadOnlyToken:  created.RoToken,
	})
}
