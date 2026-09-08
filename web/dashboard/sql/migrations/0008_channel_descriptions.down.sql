UPDATE device_channel_mapping SET name = 'Unmapped' WHERE name IS NULL;

ALTER TABLE device_channel_mapping
	ALTER COLUMN name SET NOT NULL,
	DROP COLUMN IF EXISTS measurement_type;
