export type InstallerStateNames =
	| "Start_CheckingWebSerialSupport"
	| "Start_FetchUpstreamVersions"
	| "Start_WaitingForUser"
	| "Connect_Connecting"
	| "Connect_ReadingVersion"
	| "Install_WaitingForInstallationMethodChoice"
	| "Install_Installing"
	| "Install_Updating"
	| "Install_MigratingConfiguration"
	| "Config_LoadingConfiguration"
	| "Config_Editing"
	| "Config_WritingConfiguration"
	| "Finish_ShowingNextSteps"
	| "Finish_ShowingError";

export interface FormProps {
	send: (event: { type: string; [key: string]: unknown }) => void;
	upstreamVersions?: string[];
	configuration?: {
		firmwareVersion?: string;
		configVersion?: string | number;
		appEUI?: string;
		appKey?: string;
		devEUI?: string;
	};
}
