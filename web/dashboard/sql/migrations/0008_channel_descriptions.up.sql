-- The foreign key validated nothing. Ingest fabricated a mapping row for
-- whatever channel a payload named, purely to satisfy it, so it never rejected
-- anything — it only made a channel's description impossible to remove for as
-- long as the channel had data.
ALTER TABLE device_measurement
	DROP CONSTRAINT IF EXISTS device_measurement_device_id_channel_id_fkey;

-- A mapping row now exists only because someone described a channel or hid it.
-- `measurement_type` is the type the user declared, which labels the channel and
-- picks the unit its readings render in; the type a reading was *decoded* with
-- always comes from the uplink payload and is stored on the measurement itself.
ALTER TABLE device_channel_mapping
	ADD COLUMN measurement_type SMALLINT,
	ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE,
	ALTER COLUMN name DROP NOT NULL;

-- Rows ingest stamped with a placeholder name describe nothing.
DELETE FROM device_channel_mapping WHERE name = 'Unmapped';
