-- A channel mapping now describes a channel rather than merely existing for it.
-- `measurement_type` is the type the user declared in the dashboard's slot
-- editor; the type of an actual reading always comes from the uplink payload.
ALTER TABLE device_channel_mapping
	ADD COLUMN measurement_type SMALLINT,
	ALTER COLUMN name DROP NOT NULL;

-- The ingest path used to stamp every channel it saw with a placeholder name.
-- An undescribed channel is now simply nameless, so the placeholder is not a
-- name anything has to recognize and filter out.
UPDATE device_channel_mapping SET name = NULL WHERE name = 'Unmapped';
