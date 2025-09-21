-- name: InsertDeviceMeasurement :exec
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);

-- name: InsertDeviceMeasurements :copyfrom
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);
