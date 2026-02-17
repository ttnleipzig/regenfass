package api

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

// GroupInfoDevice represents a device in a group
// @Description Device information within a group
type GroupInfoDevice struct {
	Token      string `json:"token" example:"device_token_123"`
	IsReadonly bool   `json:"is_readonly" example:"false"`
}

// GroupInfoResponse represents group information response
// @Description Detailed group information including associated devices
type GroupInfoResponse struct {
	Name       string            `json:"name" example:"My Rain Barrel Group"`
	IsReadonly bool              `json:"is_readonly" example:"false"`
	Devices    []GroupInfoDevice `json:"devices"`
}

// GetGroupByToken godoc
//
//	@Summary		Get group information by token
//	@Description	Retrieve group details and associated devices using either read-write or read-only token
//	@Tags			groups
//	@Accept			json
//	@Produce		json
//	@Param			groupToken	path		string			true	"Group token (read-write or read-only)"
//	@Success		200			{object}	GroupInfoResponse
//	@Failure		400			{object}	HTTPError	"Invalid group token"
//	@Failure		500			{object}	HTTPError	"Internal server error"
//	@Router			/group/{groupToken} [get]
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

// AddDeviceToGroupPayload represents the request body for adding a device to a group
// @Description Request body to add a device to an existing group
type AddDeviceToGroupPayload struct {
	DeviceToken string `json:"device_token" example:"device_token_123"`
}

// AddDeviceToGroupResponse represents the response after adding a device to a group
// @Description Response with tokens for the added device
type AddDeviceToGroupResponse struct {
	ID             uuid.UUID `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	ReadWriteToken string    `json:"read_write_token" example:"rw_token_123"`
	ReadOnlyToken  string    `json:"read_only_token" example:"ro_token_123"`
}

// AddDeviceToGroup godoc
//
//	@Summary		Add device to group
//	@Description	Add an existing device to a group using the group's read-write token
//	@Tags			groups
//	@Accept			json
//	@Produce		json
//	@Param			groupToken	path		string					true	"Group read-write token"
//	@Param			body		body		AddDeviceToGroupPayload	true	"Device token to add"
//	@Success		204			{string}	string					"No Content"
//	@Failure		400			{object}	HTTPError				"Invalid token or payload"
//	@Failure		403			{object}	HTTPError				"Group token is read-only"
//	@Failure		500			{object}	HTTPError				"Internal server error"
//	@Router			/group/{groupToken}/devices [post]
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

// CreateGroupPayload represents the request body for creating a group
// @Description Request body to create a new device group
type CreateGroupPayload struct {
	Name string `json:"name" example:"My Rain Barrel Group"`
}

// CreateGroupResponse represents the response after creating a group
// @Description Response with group ID and tokens
type CreateGroupResponse struct {
	ID             uuid.UUID `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	ReadWriteToken string    `json:"read_write_token" example:"rw_group_token_123"`
	ReadOnlyToken  string    `json:"read_only_token" example:"ro_group_token_123"`
}

// CreateGroup godoc
//
//	@Summary		Create a new group
//	@Description	Create a new device group for organizing rain barrel devices
//	@Tags			groups
//	@Accept			json
//	@Produce		json
//	@Param			body	body		CreateGroupPayload	true	"Group name"
//	@Success		201		{object}	CreateGroupResponse
//	@Failure		400		{object}	HTTPError	"Invalid payload"
//	@Failure		500		{object}	HTTPError	"Internal server error"
//	@Router			/group [post]
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
