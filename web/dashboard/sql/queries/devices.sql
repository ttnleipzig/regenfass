-- name: GetDeviceByEUI :one
SELECT * FROM device WHERE device_eui = UPPER($1);

-- name: GetDeviceByEitherToken :one
SELECT *, (ro_token = $1) AS is_readonly FROM device WHERE ro_token = $1 OR rw_token = $1;

-- name: GetDevicesForDeviceTokens :many
-- Resolve each provided device token (read-write or read-only) to its device.
-- `is_readonly` reflects whether the provided token was the read-only token.
SELECT d.id, d.device_eui, d.name, d.latitude, d.longitude, (d.ro_token = t.token) AS is_readonly
FROM unnest(@device_tokens::TEXT[]) AS t(token)
JOIN device d ON d.ro_token = t.token OR d.rw_token = t.token;

-- name: CreateDevice :one
INSERT INTO device (device_eui) VALUES (UPPER($1)) RETURNING id, rw_token, ro_token;

-- name: UpsertDeviceChannelMapping :exec
-- Writes the description the user gave a channel in the dashboard's slot
-- editor. The row may not exist yet: a channel can be described before the
-- device has ever reported on it, which is the point of the editor.
INSERT INTO device_channel_mapping (device_id, channel_id, name, measurement_type)
VALUES ($1, $2, sqlc.narg('name')::TEXT, sqlc.narg('measurement_type')::SMALLINT)
ON CONFLICT (device_id, channel_id) DO UPDATE
SET name = EXCLUDED.name, measurement_type = EXCLUDED.measurement_type;

-- name: SetDeviceChannelHidden :exec
-- Takes a channel off the dashboard, or puts it back. Nothing is deleted: the
-- measurements stay and keep arriving, they are just not rendered. Hiding a
-- channel nobody has described creates the row for the flag alone.
INSERT INTO device_channel_mapping (device_id, channel_id, hidden)
VALUES ($1, $2, $3)
ON CONFLICT (device_id, channel_id) DO UPDATE
SET hidden = EXCLUDED.hidden;

-- name: GetChannelMappingsForDeviceIDs :many
-- Every channel of the given devices that someone has described or hidden,
-- including channels that have never carried a measurement. Lets the dashboard
-- show a declared slot as an empty labelled card until the device starts
-- reporting on it, and know which channels are hidden so they can be restored.
SELECT device_id, channel_id, name, measurement_type, hidden
FROM device_channel_mapping
WHERE device_id = ANY(@device_ids::UUID[])
ORDER BY device_id, channel_id;

-- name: UpdateDeviceName :exec
UPDATE device SET name = $2 WHERE id = $1;

-- name: UpdateDeviceLocation :exec
UPDATE device SET latitude = $2, longitude = $3 WHERE id = $1;
