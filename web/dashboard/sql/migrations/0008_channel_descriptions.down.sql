-- The foreign key needs a mapping row for every channel that has measurements,
-- and ingest's placeholder name back on any row that has none.
INSERT INTO device_channel_mapping (device_id, channel_id, name)
SELECT DISTINCT device_id, channel_id, 'Unmapped' FROM device_measurement
ON CONFLICT (device_id, channel_id) DO NOTHING;

UPDATE device_channel_mapping SET name = 'Unmapped' WHERE name IS NULL;

ALTER TABLE device_channel_mapping
	ALTER COLUMN name SET NOT NULL,
	DROP COLUMN IF EXISTS hidden,
	DROP COLUMN IF EXISTS measurement_type;

ALTER TABLE device_measurement
	ADD CONSTRAINT device_measurement_device_id_channel_id_fkey
	FOREIGN KEY (device_id, channel_id)
	REFERENCES device_channel_mapping (device_id, channel_id);
