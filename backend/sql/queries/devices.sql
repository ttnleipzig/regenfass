-- name: GetDeviceByEUI :one
SELECT * FROM device WHERE device_eui = $1;

-- name: GetDeviceByEitherToken :one
SELECT *, (ro_token = $1) AS is_readonly FROM device WHERE ro_token = $1 OR rw_token = $1;
