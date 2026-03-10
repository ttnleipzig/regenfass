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
