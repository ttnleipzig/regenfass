-- Booleans come back as the numbers 0 and 1 rather than JSON true/false. The
-- row's measurement_type still identifies them, so nothing is unrecoverable.
ALTER TABLE device_measurement
	ALTER COLUMN value TYPE JSONB
	USING to_jsonb(value);
