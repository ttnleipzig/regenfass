CREATE TABLE IF NOT EXISTS device (
	id UUID PRIMARY KEY,
	device_eui TEXT NOT NULL UNIQUE,
	minimum_level FLOAT NOT NULL
);
CREATE INDEX IF NOT EXISTS device__device_eui ON device (device_eui);

CREATE TABLE IF NOT EXISTS device_measurement (
	received_at TIMESTAMPTZ NOT NULL,
	device_id UUID NOT NULL REFERENCES device(id),

	water_level FLOAT NOT NULL,
	voltage FLOAT NOT NULL
);
SELECT create_hypertable('device_measurement', by_range('received_at', INTERVAL '1 day'), if_not_exists => TRUE);