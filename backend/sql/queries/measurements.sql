-- name: InsertDeviceMeasurement :exec
INSERT INTO device_measurement (device_id, water_level, voltage, received_at) VALUES ($1, $2, $3, $4);
