import { Component, createSignal } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { Checkbox } from "@/components/forms/Checkbox";
import { ActionButton } from "@/components/forms/ActionButton";
import { ErrorList } from "@/components/forms/ErrorList";
import type { FormProps } from "../types";

export interface StepStartWaitingForUserFormProps extends FormProps {
  upstreamVersions?: string[];
}

const StepStartWaitingForUserForm: Component<StepStartWaitingForUserFormProps> = (props) => {
  const [confirmStart, setConfirmStart] = createSignal(false);
  const [errors, setErrors] = createSignal<string[]>([]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!confirmStart()) {
      setErrors(["Bitte bestätigen Sie, dass Sie bereit sind, mit der Installation zu beginnen."]);
      return;
    }

    setErrors([]);
    props.send?.({ type: "start.next" });
  };

  return (
    <FormLayout
      title="Willkommen beim Regenfass Installer"
      subtitle="Dieser Assistent hilft Ihnen dabei, die Firmware auf Ihrem Mikrocontroller zu installieren und zu konfigurieren."
    >
      <div class="space-y-6">
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                Vorbereitung
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li>Stellen Sie sicher, dass Ihr Mikrocontroller über USB mit dem Computer verbunden ist</li>
                  <li>Schließen Sie alle anderen Programme, die den Serial Port verwenden könnten</li>
                  <li>Bereiten Sie Ihre LoRaWAN-Konfigurationsdaten vor (AppEUI, AppKey, DevEUI)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {props.upstreamVersions && props.upstreamVersions.length > 0 && (
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              Verfügbare Firmware-Versionen:
            </h4>
            <div class="flex flex-wrap gap-2">
              {props.upstreamVersions.map((version) => (
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {version}
                </span>
              ))}
            </div>
          </div>
        )}

        <ErrorList errors={errors()} />

        <Checkbox
          label="Ich bestätige, dass ich bereit bin, mit der Installation zu beginnen"
          required
          checked={confirmStart()}
          onChange={(e) => setConfirmStart(e.target.checked)}
        />

        <div class="flex justify-end">
          <ActionButton type="primary" type="submit" onClick={handleSubmit}>
            Installation starten
          </ActionButton>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepStartWaitingForUserForm };
