-- Every value the protocol can decode is a float32 or a bool (see
-- lora_protocol.decodeValue — anything else is rejected before it is stored), so
-- JSONB was carrying two shapes for no benefit. Storing booleans as 0 and 1
-- loses nothing: the row's own measurement_type still says the value arrived as
-- a Boolean, so 0 is unambiguously false. It also means a channel's declared
-- type can reinterpret its history freely, without a value shape that refuses to
-- render under the new type. The wire protocol is untouched — a Boolean is still
-- one byte on the uplink.
ALTER TABLE device_measurement
	ALTER COLUMN value TYPE DOUBLE PRECISION
	USING CASE jsonb_typeof(value)
		WHEN 'boolean' THEN (value #>> '{}')::BOOLEAN::INT::DOUBLE PRECISION
		ELSE (value #>> '{}')::DOUBLE PRECISION
	END;
