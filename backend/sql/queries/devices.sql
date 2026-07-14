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

-- name: EnsureDeviceChannelMapping :exec
INSERT INTO device_channel_mapping (device_id, channel_id, name)
VALUES ($1, $2, 'Unmapped')
ON CONFLICT (device_id, channel_id) DO NOTHING;

-- name: UpdateDeviceName :exec
UPDATE device SET name = $2 WHERE id = $1;

-- name: UpdateDeviceLocation :exec
UPDATE device SET latitude = $2, longitude = $3 WHERE id = $1;
