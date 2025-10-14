import { Component } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { ActionButton } from "@/components/forms/ActionButton";
import type { FormProps } from "../types";

export interface StepFinishShowingNextStepsFormProps extends FormProps {
  configuration?: any;
}

const StepFinishShowingNextStepsForm: Component<StepFinishShowingNextStepsFormProps> = (props) => {
  const handleRestart = () => {
    // Reload the page to restart the installation
    window.location.reload();
  };

  const handleCloudSetup = () => {
    // Navigate to cloud setup (placeholder)
    window.open("https://cloud.example.com/setup", "_blank");
  };

  return (
    <FormLayout
      title="Installation erfolgreich abgeschlossen! 🎉"
      subtitle="Ihr Regenfass-Gerät wurde erfolgreich konfiguriert und ist bereit für den Einsatz."
    >
      <div class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Installation erfolgreich
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Alle Schritte wurden erfolgreich abgeschlossen.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 class="text-sm font-medium text-blue-900 mb-3">
            Nächste Schritte
          </h4>
          <div class="space-y-3">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                  1
                </span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Cloud-Setup:</strong> Richten Sie Ihr Gerät in der Cloud ein, um Daten zu empfangen und zu visualisieren.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                  2
                </span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Gerät testen:</strong> Überprüfen Sie, ob Ihr Gerät korrekt mit dem LoRaWAN-Netzwerk verbunden ist.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                  3
                </span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Dokumentation:</strong> Lesen Sie die Dokumentation für weitere Informationen zur Nutzung.
                </p>
              </div>
            </div>
          </div>
        </div>

        {props.configuration && (
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              Installierte Konfiguration
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">AppEUI:</span>
                <span class="ml-2 font-mono text-gray-900">{props.configuration.appEUI}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">DevEUI:</span>
                <span class="ml-2 font-mono text-gray-900">{props.configuration.devEUI}</span>
              </div>
              <div class="md:col-span-2">
                <span class="font-medium text-gray-700">AppKey:</span>
                <span class="ml-2 font-mono text-gray-900">{props.configuration.appKey}</span>
              </div>
            </div>
          </div>
        )}

        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Wichtiger Hinweis
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>
                  Bewahren Sie Ihre Konfigurationsdaten sicher auf. Sie werden benötigt, um das Gerät später zu verwalten oder zu aktualisieren.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center space-x-4">
          <ActionButton type="secondary" onClick={handleRestart}>
            Neue Installation
          </ActionButton>
          <ActionButton type="primary" onClick={handleCloudSetup}>
            Cloud-Setup starten
          </ActionButton>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepFinishShowingNextStepsForm };
