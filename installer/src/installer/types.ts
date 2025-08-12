// Installer Context Types
export type InstallerContext = {
  upstreamVersions: string[];
  error: Error | null;
  connection: [SerialPort, any] | null; // SCPReader type simplified
  configuration: Config | null;
  firmwareVersion: string | null;
};

// Configuration Types
export type Config = {
  firmwareVersion: string;
  configVersion: string;
  appEUI: string;
  appKey: string;
  devEUI: string;
};

export type ConfigField = keyof Config;

// Device Types
export type DeviceType = "heltec-lora32" | "generic-esp32";

// Installation Method Types
export type InstallationMethod = "install" | "update";

// Form Props Interface
export interface FormProps {
  state?: any;
  context?: InstallerContext;
  send?: (event: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Progress Types
export interface ProgressInfo {
  current: number;
  total: number;
  message: string;
}

// File Upload Types
export interface FileUploadInfo {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// Event Types for XState
export type InstallerEvents = 
  | { type: "start.next" }
  | { type: "install.install" }
  | { type: "install.update" }
  | { type: "config.changeField"; field: ConfigField; value: string }
  | { type: "config.clear" }
  | { type: "config.loadFromFile"; config: Config }
  | { type: "config.saveToFile" }
  | { type: "config.write" }
  | { type: "config.next" }
  | { type: "connect.deviceType"; deviceType: DeviceType }
  | { type: "connect.retry" }
  | { type: "install.firmwareVersion"; version: string }
  | { type: "error.retry" }
  | { type: "error.dismiss" };

// State Names (for type safety)
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
