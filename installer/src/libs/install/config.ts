const ConfigField = {
	appEUI: "appEUI",
	appKey: "appKey",
	devEUI: "devEUI",
} as const;
type ConfigField = keyof typeof ConfigField;

type GetDefaultValues<Fields extends ConfigField[]> = () => Record<
	Fields[number],
	string
>;
type Loader<Fields extends ConfigField[]> = (
	readField: (field: string) => Promise<string>
) => Promise<Record<Fields[number], string>>;
type Upgrader<Fields extends ConfigField[]> = (
	config: Record<string, string>
) => Record<Fields[number], string>;
type Downgrader<Fields extends ConfigField[]> = (
	config: Record<Fields[number], string>
) => Record<string, string>;

type ConfigV<Version extends number, Fields extends ConfigField[]> = {
	version: Version;
	fields: Fields;
	getDefaultValues: GetDefaultValues<Fields>;
	load: Loader<Fields>;
	upgrade: Upgrader<Fields>;
	downgrade: Downgrader<Fields>;
	$schema: Record<Fields[number], string>;
};

const makeConfig = <Version extends number, Fields extends ConfigField[]>(
	version: Version,
	fields: Fields,
	getDefaultValues: GetDefaultValues<Fields>,
	load: Loader<Fields>,
	upgrade: Upgrader<Fields>,
	downgrade: Downgrader<Fields>
) =>
	({ version, fields, getDefaultValues, load, upgrade, downgrade } as ConfigV<
		Version,
		Fields
	>);

const configV1 = makeConfig(
	1,
	["appEUI", "appKey", "devEUI"],
	() => ({
		appEUI: "",
		appKey: "",
		devEUI: "",
	}),
	async (readField) => {
		const appEUI = await readField("appEUI");
		const appKey = await readField("appKey");
		const devEUI = await readField("devEUI");

		return { appEUI, appKey, devEUI };
	},
	(config) => {
		throw new Error("No newer version that config v1 implemented");
	},
	() => {
		throw new Error("Can't downgrade below version 1");
	}
);
type ConfigV1 = typeof configV1.$schema;

export type Config = ConfigV1;
export const CONFIG_VERSIONS = [configV1];

export type DeviceInfo = {
	firmwareVersion: string;
	configVersion: number;
	config: Config;
};
