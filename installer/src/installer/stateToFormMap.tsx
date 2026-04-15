import type { Component } from "solid-js";
import { StepStartWaitingForUserForm } from "./forms/StepStartWaitingForUserForm";
import { StepConnectConnectingForm } from "./forms/StepConnectConnectingForm";
import { StepInstallWaitingForInstallationMethodChoiceForm } from "./forms/StepInstallWaitingForInstallationMethodChoiceForm";
import { StepConfigEditingForm } from "./forms/StepConfigEditingForm";
import { StepFinishShowingNextStepsForm } from "./forms/StepFinishShowingNextStepsForm";
import { StepFinishShowingErrorForm } from "./forms/StepFinishShowingErrorForm";
import type { FormProps, InstallerStateNames } from "./types";

// Progress/Loading Components for automatic states
const LoadingComponent: Component<FormProps> = (_props) => (
  <div class="flex items-center justify-center min-h-64">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Lade...</p>
    </div>
  </div>
);

const ProgressComponent: Component<FormProps & { message?: string }> = (props) => (
  <div class="flex items-center justify-center min-h-64">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p class="text-gray-600">{props.message || "Verarbeite..."}</p>
    </div>
  </div>
);

// State to Form Component Mapping
export const stateToFormMap: Record<InstallerStateNames, Component<FormProps>> = {
  // Start States
  "Start_CheckingWebSerialSupport": LoadingComponent,
  "Start_FetchUpstreamVersions": LoadingComponent,
  "Start_WaitingForUser": StepStartWaitingForUserForm,

  // Connect States
  "Connect_Connecting": StepConnectConnectingForm,
  "Connect_ReadingVersion": ProgressComponent,

  // Install States
  "Install_WaitingForInstallationMethodChoice": StepInstallWaitingForInstallationMethodChoiceForm,
  "Install_Installing": (props: FormProps) => <ProgressComponent {...props} message="Installiere Firmware..." />,
  "Install_Updating": (props: FormProps) => <ProgressComponent {...props} message="Aktualisiere Firmware..." />,
  "Install_MigratingConfiguration": (props: FormProps) => <ProgressComponent {...props} message="Migriere Konfiguration..." />,

  // Config States
  "Config_LoadingConfiguration": (props: FormProps) => <ProgressComponent {...props} message="Lade Konfiguration..." />,
  "Config_Editing": StepConfigEditingForm,
  "Config_WritingConfiguration": (props: FormProps) => <ProgressComponent {...props} message="Speichere Konfiguration..." />,

  // Finish States
  "Finish_ShowingNextSteps": StepFinishShowingNextStepsForm,
  "Finish_ShowingError": StepFinishShowingErrorForm,
};

// Helper function to get form component for a state
export const getFormComponent = (stateName: InstallerStateNames): Component<FormProps> => {
  return stateToFormMap[stateName] || LoadingComponent;
};

/** States that use shared loading / progress UI (not a dedicated form component). */
const GENERIC_FORM_STATES: readonly InstallerStateNames[] = [
	"Start_CheckingWebSerialSupport",
	"Start_FetchUpstreamVersions",
	"Connect_ReadingVersion",
	"Install_Installing",
	"Install_Updating",
	"Install_MigratingConfiguration",
	"Config_LoadingConfiguration",
	"Config_WritingConfiguration",
];

// Helper function to check if a state has a custom form
export const hasCustomForm = (stateName: InstallerStateNames): boolean =>
	!GENERIC_FORM_STATES.includes(stateName);

// Helper function to get state display name
export const getStateDisplayName = (stateName: InstallerStateNames): string => {
  const displayNames: Record<InstallerStateNames, string> = {
    "Start_CheckingWebSerialSupport": "Browser-Kompatibilität prüfen",
    "Start_FetchUpstreamVersions": "Firmware-Versionen laden",
    "Start_WaitingForUser": "Installation starten",
    "Connect_Connecting": "Gerät verbinden",
    "Connect_ReadingVersion": "Firmware-Version lesen",
    "Install_WaitingForInstallationMethodChoice": "Installationsmethode wählen",
    "Install_Installing": "Firmware installieren",
    "Install_Updating": "Firmware aktualisieren",
    "Install_MigratingConfiguration": "Konfiguration migrieren",
    "Config_LoadingConfiguration": "Konfiguration laden",
    "Config_Editing": "Konfiguration bearbeiten",
    "Config_WritingConfiguration": "Konfiguration speichern",
    "Finish_ShowingNextSteps": "Installation abgeschlossen",
    "Finish_ShowingError": "Fehler aufgetreten",
  };
  
  return displayNames[stateName] || stateName;
};

// Helper function to get state description
export const getStateDescription = (stateName: InstallerStateNames): string => {
  const descriptions: Record<InstallerStateNames, string> = {
    "Start_CheckingWebSerialSupport": "Überprüfung der Browser-Kompatibilität für Web Serial API",
    "Start_FetchUpstreamVersions": "Laden der verfügbaren Firmware-Versionen von GitHub",
    "Start_WaitingForUser": "Warten auf Benutzer-Bestätigung zum Start der Installation",
    "Connect_Connecting": "Verbindung mit dem Mikrocontroller über Serial/Bluetooth",
    "Connect_ReadingVersion": "Lesen der aktuellen Firmware-Version vom Gerät",
    "Install_WaitingForInstallationMethodChoice": "Benutzer wählt zwischen Install und Update",
    "Install_Installing": "Installation neuer Firmware auf blankem Gerät",
    "Install_Updating": "Aktualisierung bestehender Firmware",
    "Install_MigratingConfiguration": "Migration der Konfiguration zwischen Firmware-Versionen",
    "Config_LoadingConfiguration": "Laden der aktuellen Konfiguration vom Gerät",
    "Config_Editing": "Bearbeitung der LoRaWAN-Konfiguration",
    "Config_WritingConfiguration": "Schreiben der Konfiguration auf das Gerät",
    "Finish_ShowingNextSteps": "Anzeige der nächsten Schritte nach erfolgreicher Installation",
    "Finish_ShowingError": "Anzeige von Fehlern und Lösungsvorschlägen",
  };
  
  return descriptions[stateName] || "";
};
