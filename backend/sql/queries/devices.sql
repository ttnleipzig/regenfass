-- name: UpdateDeviceMinimumLevel :one
UPDATE device SET minimum_level = $2 WHERE device_eui = $1 RETURNING id;

-- name: GetDeviceByEUI :one
SELECT * FROM device WHERE device_eui = $1;
