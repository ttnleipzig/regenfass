import { Component } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { ButtonAction } from "@/components/atoms/ButtonAction.tsx";
import { AlertInline, AlertDescription, AlertTitle } from "@/components/molecules/AlertInline.tsx";
import { Button } from "@/components/atoms/Button.tsx";
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
        <AlertInline variant="destructive">
          <AlertTitle>{getErrorType()}</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage()}</p>
          </AlertDescription>
        </AlertInline>

        <AlertInline variant="info">
          <AlertTitle>Mögliche Lösungen</AlertTitle>
          <AlertDescription>
            <div class="space-y-2 mt-2">
              {getErrorSuggestions().map((suggestion, index) => (
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-info text-info-foreground text-xs font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </AlertInline>

        {props.error && typeof props.error === "object" && props.error.stack && (
          <AlertInline>
            <AlertTitle>Technische Details</AlertTitle>
            <AlertDescription>
              <details>
                <summary class="text-sm font-medium cursor-pointer">
                  Stacktrace anzeigen
                </summary>
                <pre class="mt-2 text-xs overflow-auto max-h-32">
                  {props.error.stack}
                </pre>
              </details>
            </AlertDescription>
          </AlertInline>
        )}

        <div class="flex justify-center space-x-4">
          <ButtonAction type="secondary" onClick={handleRestart}>
            Installation neu starten
          </ButtonAction>
          <ButtonAction type="primary" onClick={handleRetry}>
            Erneut versuchen
          </ButtonAction>
        </div>

        <div class="text-center">
          <Button
            type="button"
            variant="link"
            onClick={handleDismiss}
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Fehler ignorieren und fortfahren
          </Button>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepFinishShowingErrorForm };
