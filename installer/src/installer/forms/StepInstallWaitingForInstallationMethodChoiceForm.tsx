import { Component, createSignal } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { Select } from "@/components/forms/Select";
import { ButtonAction } from "@/components/atoms/ButtonAction.tsx";
import { ErrorList } from "@/components/molecules/ErrorList.tsx";
import type { FormProps, InstallationMethod } from "../types";

export interface StepInstallWaitingForInstallationMethodChoiceFormProps extends FormProps {
  currentFirmwareVersion?: string;
  upstreamVersions?: string[];
}

const installationMethods: InstallationMethod[] = ["install", "update"];

const methodLabels: Record<InstallationMethod, string> = {
  "install": "Neue Installation",
  "update": "Aktualisierung"
};

const methodDescriptions: Record<InstallationMethod, string> = {
  "install": "Installiert eine neue Firmware auf einem blanken Gerät",
  "update": "Aktualisiert die bestehende Firmware und migriert die Konfiguration"
};

const StepInstallWaitingForInstallationMethodChoiceForm: Component<StepInstallWaitingForInstallationMethodChoiceFormProps> = (props) => {
  const [selectedMethod, setSelectedMethod] = createSignal<InstallationMethod | undefined>();
  const [selectedVersion, setSelectedVersion] = createSignal<string | undefined>();
  const [errors, setErrors] = createSignal<string[]>([]);

  const handleInstall = () => {
    if (!selectedMethod()) {
      setErrors(["Bitte wählen Sie eine Installationsmethode aus."]);
      return;
    }

    if (!selectedVersion()) {
      setErrors(["Bitte wählen Sie eine Firmware-Version aus."]);
      return;
    }

    setErrors([]);

    if (selectedMethod() === "install") {
      props.send?.({ type: "install.install" });
    } else {
      props.send?.({ type: "install.update" });
    }
  };

  return (
    <FormLayout
      title="Firmware Installation"
      subtitle="Wählen Sie die Installationsmethode und die gewünschte Firmware-Version aus."
    >
      <div class="space-y-6">
        {props.currentFirmwareVersion && (
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  Aktuelle Firmware erkannt
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>Version: <strong>{props.currentFirmwareVersion}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div class="grid grid-cols-1 gap-6">
          <Select<InstallationMethod>
            label="Installationsmethode"
            required
            options={installationMethods}
            placeholder="Wählen Sie eine Methode..."
            value={selectedMethod()}
            onChange={setSelectedMethod}
            getLabel={(method) => methodLabels[method]}
            helperText={selectedMethod() ? methodDescriptions[selectedMethod()!] : undefined}
            error={errors().find(e => e.includes("Installationsmethode"))}
          />

          {props.upstreamVersions && props.upstreamVersions.length > 0 && (
            <Select<string>
              label="Firmware-Version"
              required
              options={props.upstreamVersions}
              placeholder="Wählen Sie eine Version..."
              value={selectedVersion()}
              onChange={setSelectedVersion}
              helperText="Wählen Sie die gewünschte Firmware-Version aus"
              error={errors().find(e => e.includes("Firmware-Version"))}
            />
          )}
        </div>

        {selectedMethod() && (
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              Ausgewählte Methode: {methodLabels[selectedMethod()!]}
            </h4>
            <p class="text-sm text-gray-600 mb-3">
              {methodDescriptions[selectedMethod()!]}
            </p>
            {selectedMethod() === "update" && props.currentFirmwareVersion && (
              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p class="text-sm text-yellow-800">
                  <strong>Hinweis:</strong> Bei einer Aktualisierung wird die bestehende Konfiguration automatisch migriert.
                </p>
              </div>
            )}
          </div>
        )}

        <ErrorList errors={errors()} />

        <div class="flex justify-end space-x-3">
          <ButtonAction type="secondary" onClick={props.onBack}>
            Zurück
          </ButtonAction>
          <ButtonAction
            type="primary"
            onClick={handleInstall}
            disabled={!selectedMethod() || !selectedVersion()}
          >
            {selectedMethod() === "install" ? "Installieren" : "Aktualisieren"}
          </ButtonAction>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepInstallWaitingForInstallationMethodChoiceForm };
