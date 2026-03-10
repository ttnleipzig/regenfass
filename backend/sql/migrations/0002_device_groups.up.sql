CREATE OR REPLACE FUNCTION generate_random_token(len INT DEFAULT 16)
RETURNS TEXT AS $$
DECLARE
	chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	result TEXT := '';
	i INT;
BEGIN
	FOR i IN 1..len LOOP
		result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
	END LOOP;
	RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

ALTER TABLE device
	ADD COLUMN rw_token TEXT
		NOT NULL
		DEFAULT generate_random_token(16)
		UNIQUE,
	ADD COLUMN ro_token TEXT
		NOT NULL
		DEFAULT generate_random_token(16)
		UNIQUE;
CREATE INDEX IF NOT EXISTS device__ro_token ON device (ro_token);
CREATE INDEX IF NOT EXISTS device__rw_token ON device (rw_token);


CREATE TABLE IF NOT EXISTS "group" (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,

	rw_token TEXT NOT NULL DEFAULT generate_random_token(16) UNIQUE,
	ro_token TEXT NOT NULL DEFAULT generate_random_token(16) UNIQUE
);
CREATE INDEX IF NOT EXISTS group__ro_token ON "group" (ro_token);
CREATE INDEX IF NOT EXISTS group__rw_token ON "group" (rw_token);

CREATE TABLE IF NOT EXISTS device_group (
	device_id UUID NOT NULL REFERENCES device (id),
	group_id UUID NOT NULL REFERENCES "group" (id),

	is_readonly BOOL NOT NULL
);
CREATE INDEX IF NOT EXISTS device_group__device_id_group_id ON device_group (device_id, group_id);
