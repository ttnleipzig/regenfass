-- name: InsertDeviceMeasurement :exec
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);

-- name: InsertDeviceMeasurements :copyfrom
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);

-- name: GetDeviceMeasurementsRanged :many
-- Ranged, downsampled measurement fetch. Rows are grouped into fixed-width
-- time buckets and the newest reading in each bucket (per channel) is kept as
-- the representative data point. The caller picks @bucket_seconds to control
-- the resolution. Results are ordered chronologically within each channel.
SELECT DISTINCT ON (m.channel_id, m.bucket)
	m.received_at,
	m.channel_id,
	m.channel_name,
	m.measurement_type,
	m.value
FROM (
	SELECT
		time_bucket(make_interval(secs => @bucket_seconds::DOUBLE PRECISION), dm.received_at) AS bucket,
		dm.received_at,
		dm.channel_id,
		dcm.name AS channel_name,
		dm.measurement_type,
		dm.value
	FROM device_measurement dm
	JOIN device_channel_mapping dcm
		ON dcm.device_id = dm.device_id AND dcm.channel_id = dm.channel_id
	WHERE dm.device_id = @device_id
		AND dm.received_at >= @start_time
		AND dm.received_at <= @end_time
		AND (sqlc.narg('channel_id')::SMALLINT IS NULL OR dm.channel_id = sqlc.narg('channel_id'))
) m
ORDER BY m.channel_id, m.bucket, m.received_at DESC;
