CREATE TABLE IF NOT EXISTS device (
	id UUID PRIMARY KEY,
	device_eui TEXT NOT NULL UNIQUE,
	minimum_level FLOAT NOT NULL
);
CREATE INDEX IF NOT EXISTS device__device_eui ON device (device_eui);

CREATE TABLE device_channel_mapping (
	device_id UUID NOT NULL REFERENCES device(id),
	channel_id SMALLINT NOT NULL,
	name TEXT NOT NULL,
	PRIMARY KEY (device_id, channel_id)
);

CREATE TABLE IF NOT EXISTS device_measurement (
	received_at TIMESTAMPTZ NOT NULL,
	device_id UUID NOT NULL,
	channel_id SMALLINT NOT NULL,
	value JSONB NOT NULL,
	measurement_type SMALLINT NOT NULL,
	FOREIGN KEY (device_id, channel_id) REFERENCES device_channel_mapping(device_id, channel_id)
);
SELECT create_hypertable('device_measurement', by_range('received_at', INTERVAL '1 day'), if_not_exists => TRUE);
