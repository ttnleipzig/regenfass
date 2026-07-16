package api

import (
	"encoding/json"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ttn-leipzig/regenfass/internal/db"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

// OverviewGroup is a subscribed group together with its member devices and each
// device's latest reading per channel.
// @Description A subscribed group and the devices that belong to it. `token` echoes back the token from the request that resolved to this group so the client can correlate it with its stored subscription.
type OverviewGroup struct {
	Token      string         `json:"token" example:"gr_token_123"`
	Name       string         `json:"name" example:"My Rain Barrel Group"`
	IsReadonly bool           `json:"is_readonly" example:"false"`
	Devices    []LatestDevice `json:"devices"`
}

// OverviewResponse is the dashboard view of a set of subscriptions: devices
// organized under the groups they belong to, plus directly-subscribed devices.
// @Description Devices grouped under their groups, plus every directly-subscribed device in `devices`. A device that is both a group member and subscribed directly appears in both places.
type OverviewResponse struct {
	Groups  []OverviewGroup `json:"groups"`
	Devices []LatestDevice  `json:"devices"`
}

// GetOverview godoc
//
//	@Summary		Get subscriptions organized by group
//	@Description	Returns the dashboard view for a set of subscription tokens: every referenced group with its member devices nested inside, plus every directly-referenced device in `devices`. A device that is both a group member and subscribed directly appears in both places. Each device carries its latest reading per channel, exactly as in `/measurements/latest`. Unlike that endpoint, group membership is preserved so the UI can render devices under their groups.
//	@Tags			measurements
//	@Accept			json
//	@Produce		json
//	@Param			body	body		LatestMeasurementsPayload	true	"Tokens selecting groups and/or devices"
//	@Success		200		{object}	OverviewResponse
//	@Failure		400		{object}	HTTPError	"Invalid payload"
//	@Failure		500		{object}	HTTPError	"Internal server error"
//	@Router			/overview [post]
func (a *API) handleOverview(c fiber.Ctx) error {
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

	// Resolve group tokens to groups, then fetch their members.
	groupRows, err := a.db.GetGroupsForTokens(c.Context(), payload.Groups)
	if err != nil {
		log.Error().Err(err).Msg("could not load groups for tokens")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load groups for tokens")
	}

	var memberRows []db.GetGroupMembersForGroupIDsRow
	if len(groupRows) > 0 {
		groupIDs := make([]pgtype.UUID, len(groupRows))
		for i, g := range groupRows {
			groupIDs[i] = g.ID
		}
		memberRows, err = a.db.GetGroupMembersForGroupIDs(c.Context(), groupIDs)
		if err != nil {
			log.Error().Err(err).Msg("could not load group members")
			return fiber.NewError(fiber.StatusInternalServerError, "could not load group members")
		}
	}

	// Resolve directly-subscribed device tokens.
	standaloneRows, err := a.db.GetDevicesForDeviceTokens(c.Context(), payload.Devices)
	if err != nil {
		log.Error().Err(err).Msg("could not load devices for tokens")
		return fiber.NewError(fiber.StatusInternalServerError, "could not load devices for tokens")
	}

	// Fetch the latest measurements for every device referenced (group members
	// and standalone) in one query, keyed by device UUID for the assembly below.
	idByUUID := make(map[uuid.UUID]pgtype.UUID, len(memberRows)+len(standaloneRows))
	for _, m := range memberRows {
		idByUUID[utils.PGToUUID(m.ID)] = m.ID
	}
	for _, d := range standaloneRows {
		idByUUID[utils.PGToUUID(d.ID)] = d.ID
	}

	measurementsByDevice := make(map[uuid.UUID][]LatestChannelMeasurement, len(idByUUID))
	if len(idByUUID) > 0 {
		deviceIDs := make([]pgtype.UUID, 0, len(idByUUID))
		for _, id := range idByUUID {
			deviceIDs = append(deviceIDs, id)
		}
		rows, err := a.db.GetLatestMeasurementsForDeviceIDs(c.Context(), deviceIDs)
		if err != nil {
			log.Error().Err(err).Msg("could not load latest device measurements")
			return fiber.NewError(fiber.StatusInternalServerError, "could not load latest device measurements")
		}
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
	}

	// Index members by their group. A device that is both a group member and
	// subscribed directly is intentionally listed in both places.
	membersByGroup := make(map[uuid.UUID][]db.GetGroupMembersForGroupIDsRow, len(groupRows))
	for _, m := range memberRows {
		gid := utils.PGToUUID(m.GroupID)
		membersByGroup[gid] = append(membersByGroup[gid], m)
	}

	groups := make([]OverviewGroup, len(groupRows))
	for i, g := range groupRows {
		members := membersByGroup[utils.PGToUUID(g.ID)]
		devices := make([]LatestDevice, len(members))
		for j, m := range members {
			// A member is read-only if the membership is marked read-only or the
			// group was resolved through its read-only token.
			ro := m.IsReadonly || g.IsReadonly
			devices[j] = buildLatestDevice(m.ID, m.Name, m.Latitude, m.Longitude, &ro, measurementsByDevice)
		}
		groups[i] = OverviewGroup{
			Token:      g.Token,
			Name:       g.Name,
			IsReadonly: g.IsReadonly,
			Devices:    devices,
		}
	}

	// One entry per resolved device token. The only de-duplication here collapses
	// the case where the same device is referenced by both its read-write and
	// read-only token, which would otherwise yield two identical rows.
	standalone := make([]LatestDevice, 0, len(standaloneRows))
	seen := make(map[uuid.UUID]bool, len(standaloneRows))
	for _, d := range standaloneRows {
		id := utils.PGToUUID(d.ID)
		if seen[id] {
			continue
		}
		seen[id] = true
		ro := d.IsReadonly
		standalone = append(standalone, buildLatestDevice(d.ID, d.Name, d.Latitude, d.Longitude, &ro, measurementsByDevice))
	}

	return c.JSON(OverviewResponse{Groups: groups, Devices: standalone})
}

// buildLatestDevice assembles a LatestDevice from a device's identity/location
// fields and the pre-fetched map of latest measurements keyed by device UUID.
// Devices with no user-set name get a stable auto-generated nickname, and a nil
// measurement slice is normalized to an empty one so JSON callers always see a
// list. isReadonly is copied through as-is: pass nil where read/write access is
// not token-scoped (it is then omitted from the JSON).
func buildLatestDevice(
	id pgtype.UUID,
	name string,
	latitude pgtype.Float8,
	longitude pgtype.Float8,
	isReadonly *bool,
	measurementsByDevice map[uuid.UUID][]LatestChannelMeasurement,
) LatestDevice {
	uid := utils.PGToUUID(id)
	if name == "" {
		name = utils.FriendlyDeviceName(id)
	}
	entry := LatestDevice{
		DeviceID:     uid,
		Name:         name,
		IsReadonly:   isReadonly,
		Measurements: measurementsByDevice[uid],
	}
	if entry.Measurements == nil {
		entry.Measurements = []LatestChannelMeasurement{}
	}
	if latitude.Valid {
		lat := latitude.Float64
		entry.Latitude = &lat
	}
	if longitude.Valid {
		lng := longitude.Float64
		entry.Longitude = &lng
	}
	return entry
}
