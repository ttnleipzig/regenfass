CREATE TABLE device (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	device_eui TEXT NOT NULL UNIQUE,
	minimum_level FLOAT NOT NULL
);
CREATE INDEX device__device_eui ON device (device_eui);

CREATE TABLE device_measurement (
	received_at TIMESTAMPTZ NOT NULL,
	device_id UUID NOT NULL REFERENCES device (id),

	water_level FLOAT NOT NULL,
	voltage FLOAT NOT NULL
);
SELECT create_hypertable('device_measurement', by_range('received_at', INTERVAL '1 day'), if_not_exists => TRUE);

CREATE TABLE alert_endpoint (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	url TEXT NOT NULL
);
CREATE INDEX alert_endpoint__id ON alert_endpoint (id);

CREATE TABLE device_alert (
	device_id UUID NOT NULL REFERENCES device (id),
	alert_endpoint_id UUID NOT NULL REFERENCES alert_endpoint (id),
	-- encoding/gob encoded internal/domain/alertrules.Rule
	rule BYTEA NOT NULL,

	PRIMARY KEY (alert_endpoint_id, device_id)
);
CREATE INDEX device_alert__device_id ON device_alert (device_id);

CREATE TABLE "group" (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	readonly_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
	readwrite_uuid UUID NOT NULL DEFAULT gen_random_uuid(),

	name TEXT NOT NULL,
	enable_opendata BOOLEAN NOT NULL DEFAULT false,

	UNIQUE (readonly_uuid, readwrite_uuid)
);
CREATE INDEX group__id ON "group" (id);
CREATE INDEX group__readonly_uuid ON "group" (readonly_uuid);
CREATE INDEX group__readwrite_uuid ON "group" (readwrite_uuid);

CREATE TABLE device_group (
	device_id UUID NOT NULL REFERENCES device (id),
	group_id UUID NOT NULL REFERENCES "group" (id),

	PRIMARY KEY (device_id, group_id)
);