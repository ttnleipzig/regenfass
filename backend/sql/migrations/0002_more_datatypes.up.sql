CREATE TABLE device_channel_mapping (
	device_id UUID NOT NULL REFERENCES device(id),
	channel_id SHORT NOT NULL,
	name TEXT NOT NULL,
	PRIMARY KEY (device_id, channel_id)
);

DROP TABLE IF EXISTS device_measurement;
CREATE TABLE IF NOT EXISTS device_measurement (
	received_at TIMESTAMPTZ NOT NULL,
	device_id UUID NOT NULL REFERENCES device(id),

	value JSONB NOT NULL,
	channel_id SHORT NOT NULL REFERENCES device_channel_mapping(channel_id),
	"type" SHORT NOT NULL
);
SELECT create_hypertable('device_measurement', by_range('received_at', INTERVAL '1 day'), if_not_exists => TRUE);
