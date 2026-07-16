ALTER TABLE device_group
	ADD CONSTRAINT device_group_device_id_group_id_key
	UNIQUE (device_id, group_id);
