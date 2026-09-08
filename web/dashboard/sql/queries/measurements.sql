-- name: InsertDeviceMeasurement :exec
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);

-- name: InsertDeviceMeasurements :copyfrom
INSERT INTO device_measurement (device_id, measurement_type, channel_id, "value", received_at) VALUES ($1, $2, $3, $4, $5);

-- name: GetDeviceMeasurementsRanged :many
-- Ranged, downsampled measurement fetch. Rows are grouped into fixed-width
-- time buckets and the newest reading in each bucket (per channel) is kept as
-- the representative data point. The caller picks @bucket_seconds to control
-- the resolution. Results are ordered chronologically within each channel.
-- Hidden channels are left out; how a channel is described is not repeated
-- per row — the API attaches it once per channel from the mapping table.
SELECT DISTINCT ON (m.channel_id, m.bucket)
	m.received_at,
	m.channel_id,
	m.measurement_type,
	m.value
FROM (
	SELECT
		time_bucket(make_interval(secs => @bucket_seconds::DOUBLE PRECISION), dm.received_at) AS bucket,
		dm.received_at,
		dm.channel_id,
		dm.measurement_type,
		dm.value
	FROM device_measurement dm
	LEFT JOIN device_channel_mapping dcm
		ON dcm.device_id = dm.device_id AND dcm.channel_id = dm.channel_id
	WHERE dm.device_id = @device_id
		AND COALESCE(dcm.hidden, FALSE) = FALSE
		AND dm.received_at >= @start_time
		AND dm.received_at <= @end_time
		AND (sqlc.narg('channel_id')::SMALLINT IS NULL OR dm.channel_id = sqlc.narg('channel_id'))
) m
ORDER BY m.channel_id, m.bucket, m.received_at DESC;

-- name: GetDevicesForTokens :many
SELECT d.id, d.device_eui, d.name, d.latitude, d.longitude
FROM device d
WHERE d.id IN (
	SELECT id FROM device
		WHERE rw_token = ANY(@device_tokens::TEXT[]) OR ro_token = ANY(@device_tokens::TEXT[])
	UNION
	SELECT device_group.device_id FROM device_group
		JOIN "group" ON "group".id = device_group.group_id
		WHERE "group".rw_token = ANY(@group_tokens::TEXT[]) OR "group".ro_token = ANY(@group_tokens::TEXT[])
);

-- name: GetLatestMeasurementsForDeviceIDs :many
-- Newest reading per channel of each device, hidden channels left out. The
-- channel's description is attached once per channel by the API, not here.
SELECT DISTINCT ON (dm.device_id, dm.channel_id)
	dm.device_id,
	dm.received_at,
	dm.channel_id,
	dm.measurement_type,
	dm.value
FROM device_measurement dm
LEFT JOIN device_channel_mapping dcm
	ON dcm.device_id = dm.device_id AND dcm.channel_id = dm.channel_id
WHERE dm.device_id = ANY(@device_ids::UUID[])
	AND COALESCE(dcm.hidden, FALSE) = FALSE
ORDER BY dm.device_id, dm.channel_id, dm.received_at DESC;
