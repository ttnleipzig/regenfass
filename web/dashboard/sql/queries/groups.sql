-- name: CreateGroup :one
INSERT INTO "group" (name) VALUES ($1) RETURNING id, rw_token, ro_token;

-- name: GetGroupByEitherToken :one
SELECT *, (ro_token = $1) AS is_readonly FROM "group" WHERE ro_token = $1 OR rw_token = $1;

-- name: AddDeviceToGroup :exec
INSERT INTO "device_group" (device_id, group_id, is_readonly)
VALUES ($1, $2, $3)
ON CONFLICT (device_id, group_id)
DO UPDATE SET
	is_readonly = EXCLUDED.is_readonly;

-- name: GetGroupsForTokens :many
-- Resolve each provided group token (read-write or read-only) to its group.
-- `is_readonly` reflects whether the provided token was the read-only token.
SELECT
	t.token::TEXT AS token,
	g.id,
	g.name,
	(g.ro_token = t.token) AS is_readonly
FROM unnest(@group_tokens::TEXT[]) AS t(token)
JOIN "group" g ON g.ro_token = t.token OR g.rw_token = t.token
ORDER BY g.name;

-- name: GetGroupMembersForGroupIDs :many
-- All member devices of the given groups, with the identity and location fields
-- needed to render them, plus whether the membership itself is read-only. One
-- row per (group, device) pair.
SELECT
	dg.group_id,
	dg.is_readonly,
	d.id,
	d.name,
	d.latitude,
	d.longitude
FROM device_group dg
JOIN device d ON d.id = dg.device_id
WHERE dg.group_id = ANY(@group_ids::UUID[])
ORDER BY d.name;

-- name: GetDevicesInGroupByGroupID :many
SELECT
	(CASE
		WHEN device_group.is_readonly OR $2 THEN device.ro_token
		ELSE device.rw_token
	END)::TEXT AS token,
	(CASE
		WHEN device_group.is_readonly OR $2 THEN true
		ELSE false
	END)::BOOLEAN AS is_readonly
FROM device_group
JOIN device ON device.id = device_group.device_id
WHERE device_group.group_id = $1;
