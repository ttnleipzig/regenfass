import { Component } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { SecondaryButton } from "@/components/forms/SecondaryButton";
import { ErrorList } from "@/components/forms/ErrorList";
import type { FormProps } from "../types";

export interface StepFinishShowingErrorFormProps extends FormProps {
  error?: Error | string;
}

const StepFinishShowingErrorForm: Component<StepFinishShowingErrorFormProps> = (props) => {
  const getErrorMessage = (): string => {
    if (!props.error) return "Ein unbekannter Fehler ist aufgetreten.";
    
    if (typeof props.error === "string") {
      return props.error;
    }
    
    return props.error.message || "Ein Fehler ist aufgetreten.";
  };

  const getErrorType = (): string => {
    if (!props.error) return "Unbekannter Fehler";
    
    if (typeof props.error === "string") {
      if (props.error.includes("Web Serial")) return "Browser-Kompatibilität";
      if (props.error.includes("Connection")) return "Verbindungsfehler";
      if (props.error.includes("Firmware")) return "Firmware-Fehler";
      if (props.error.includes("Configuration")) return "Konfigurationsfehler";
      return "Allgemeiner Fehler";
    }
    
    return props.error.name || "Fehler";
  };

  const getErrorSuggestions = (): string[] => {
    const errorMessage = getErrorMessage().toLowerCase();
    const suggestions: string[] = [];

    if (errorMessage.includes("web serial") || errorMessage.includes("browser")) {
      suggestions.push("Verwenden Sie Chrome, Edge oder Opera");
      suggestions.push("Stellen Sie sicher, dass Web Serial API unterstützt wird");
      suggestions.push("Versuchen Sie es mit einem anderen Browser");
    }

    if (errorMessage.includes("connection") || errorMessage.includes("port")) {
      suggestions.push("Überprüfen Sie die USB-Verbindung");
      suggestions.push("Schließen Sie andere Programme, die den Port verwenden");
      suggestions.push("Versuchen Sie einen anderen USB-Port");
      suggestions.push("Installieren Sie die neuesten USB-Treiber");
    }

    if (errorMessage.includes("firmware") || errorMessage.includes("flash")) {
      suggestions.push("Stellen Sie sicher, dass das Gerät im Download-Modus ist");
      suggestions.push("Halten Sie den Boot-Button beim Start gedrückt");
      suggestions.push("Überprüfen Sie die Firmware-Datei");
    }

    if (errorMessage.includes("configuration") || errorMessage.includes("config")) {
      suggestions.push("Überprüfen Sie die LoRaWAN-Parameter");
      suggestions.push("Stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind");
      suggestions.push("Versuchen Sie es mit einer anderen Konfiguration");
    }

    if (suggestions.length === 0) {
      suggestions.push("Überprüfen Sie alle Verbindungen");
      suggestions.push("Starten Sie das Gerät neu");
      suggestions.push("Versuchen Sie es erneut");
    }

    return suggestions;
  };

  const handleRetry = () => {
    props.send?.({ type: "error.retry" });
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    props.send?.({ type: "error.dismiss" });
  };

  return (
    <FormLayout
      title="Fehler aufgetreten"
      subtitle="Bei der Installation ist ein Fehler aufgetreten. Bitte überprüfen Sie die Details und versuchen Sie es erneut."
    >
      <div class="space-y-6">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {getErrorType()}
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{getErrorMessage()}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 class="text-sm font-medium text-blue-900 mb-3">
            Mögliche Lösungen
          </h4>
          <div class="space-y-2">
            {getErrorSuggestions().map((suggestion, index) => (
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                    {index + 1}
                  </span>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {props.error && typeof props.error === "object" && props.error.stack && (
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <details>
              <summary class="text-sm font-medium text-gray-900 cursor-pointer">
                Technische Details anzeigen
              </summary>
              <pre class="mt-2 text-xs text-gray-600 overflow-auto max-h-32">
                {props.error.stack}
              </pre>
            </details>
          </div>
        )}

        <div class="flex justify-center space-x-4">
          <SecondaryButton onClick={handleRestart}>
            Installation neu starten
          </SecondaryButton>
          <PrimaryButton onClick={handleRetry}>
            Erneut versuchen
          </PrimaryButton>
        </div>

        <div class="text-center">
          <button
            type="button"
            onClick={handleDismiss}
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Fehler ignorieren und fortfahren
          </button>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepFinishShowingErrorForm };
