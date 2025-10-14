import { Component, createSignal, createEffect } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { TextInput } from "@/components/forms/TextInput";
import { FileUploader } from "@/components/forms/FileUploader";
import { ActionButton } from "@/components/forms/ActionButton";
import { ErrorList } from "@/components/forms/ErrorList";
import type { FormProps, Config, ConfigField } from "../types";

export interface StepConfigEditingFormProps extends FormProps {
  configuration?: Config;
}

const StepConfigEditingForm: Component<StepConfigEditingFormProps> = (props) => {
  const [formData, setFormData] = createSignal<Partial<Config>>({
    appEUI: "",
    appKey: "",
    devEUI: "",
    firmwareVersion: "",
    configVersion: ""
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Initialize form data from props
  createEffect(() => {
    if (props.configuration) {
      setFormData(props.configuration);
    }
  });

  const validateHex = (value: string, length: number): boolean => {
    const hexRegex = new RegExp(`^[0-9A-Fa-f]{${length}}$`);
    return hexRegex.test(value);
  };

  const validateField = (field: ConfigField, value: string): string | undefined => {
    if (!value.trim()) {
      return "Dieses Feld ist erforderlich.";
    }

    switch (field) {
      case "appEUI":
        if (!validateHex(value, 16)) {
          return "AppEUI muss 16 Hexadezimalzeichen lang sein (z.B. 0000000000000000).";
        }
        break;
      case "appKey":
        if (!validateHex(value, 32)) {
          return "AppKey muss 32 Hexadezimalzeichen lang sein.";
        }
        break;
      case "devEUI":
        if (!validateHex(value, 16)) {
          return "DevEUI muss 16 Hexadezimalzeichen lang sein.";
        }
        break;
    }
  };

  const handleFieldChange = (field: ConfigField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ""
    }));

    // Send to XState
    props.send?.({ type: "config.changeField", field, value });
  };

  const handleClear = () => {
    const clearedConfig: Config = {
      firmwareVersion: formData().firmwareVersion || "",
      configVersion: formData().configVersion || "",
      appEUI: "",
      appKey: "",
      devEUI: ""
    };
    setFormData(clearedConfig);
    setErrors({});
    props.send?.({ type: "config.clear" });
  };

  const handleLoadFromFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setFormData(config);
        setErrors({});
        props.send?.({ type: "config.loadFromFile", config });
      } catch (error) {
        setErrors({ general: "Ungültige Konfigurationsdatei. Bitte wählen Sie eine gültige JSON-Datei aus." });
      }
    };
    
    reader.readAsText(file);
  };

  const handleSaveToFile = () => {
    props.send?.({ type: "config.saveToFile" });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate all required fields
    ["appEUI", "appKey", "devEUI"].forEach(field => {
      const error = validateField(field as ConfigField, formData()[field as ConfigField] || "");
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      props.send?.({ type: "config.next" });
    }
  };

  const hasErrors = () => Object.values(errors()).some(error => error.length > 0);

  return (
    <FormLayout
      title="LoRaWAN Konfiguration"
      subtitle="Konfigurieren Sie die LoRaWAN-Parameter für Ihr Gerät."
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
                LoRaWAN-Konfiguration
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>Diese Parameter werden benötigt, um Ihr Gerät mit dem LoRaWAN-Netzwerk zu verbinden.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="AppEUI"
            required
            value={formData().appEUI}
            onChange={(e) => handleFieldChange("appEUI", e.target.value)}
            placeholder="0000000000000000"
            helperText="16-stellige Hexadezimalzahl"
            error={errors().appEUI}
          />

          <TextInput
            label="DevEUI"
            required
            value={formData().devEUI}
            onChange={(e) => handleFieldChange("devEUI", e.target.value)}
            placeholder="0000000000000000"
            helperText="16-stellige Hexadezimalzahl"
            error={errors().devEUI}
          />

          <TextInput
            label="AppKey"
            required
            value={formData().appKey}
            onChange={(e) => handleFieldChange("appKey", e.target.value)}
            placeholder="00000000000000000000000000000000"
            helperText="32-stellige Hexadezimalzahl"
            error={errors().appKey}
            class="md:col-span-2"
          />
        </div>

        {(formData().firmwareVersion || formData().configVersion) && (
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              System-Informationen
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData().firmwareVersion && (
                <div>
                  <label class="block text-sm font-medium text-gray-700">Firmware-Version</label>
                  <p class="text-sm text-gray-900">{formData().firmwareVersion}</p>
                </div>
              )}
              {formData().configVersion && (
                <div>
                  <label class="block text-sm font-medium text-gray-700">Konfigurations-Version</label>
                  <p class="text-sm text-gray-900">{formData().configVersion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900">Konfiguration importieren/exportieren</h4>
          
          <div class="flex flex-wrap gap-3">
            <FileUploader
              label="Konfiguration importieren"
              accept=".json"
              onFileSelect={handleLoadFromFile}
              helperText="Wählen Sie eine JSON-Konfigurationsdatei aus"
            />
            
            <div class="flex items-end">
              <ActionButton type="secondary" onClick={handleSaveToFile}>
                Konfiguration exportieren
              </ActionButton>
            </div>
            
            <div class="flex items-end">
              <ActionButton type="secondary" onClick={handleClear}>
                Konfiguration löschen
              </ActionButton>
            </div>
          </div>
        </div>

        {errors().general && (
          <ErrorList errors={[errors().general]} />
        )}

        <div class="flex justify-end space-x-3">
          <ActionButton type="secondary" onClick={props.onBack}>
            Zurück
          </ActionButton>
          <ActionButton
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting()}
            disabled={hasErrors() || isSubmitting()}
          >
            {isSubmitting() ? "Speichere..." : "Konfiguration speichern"}
          </ActionButton>
        </div>
      </div>
    </FormLayout>
  );
};

export { StepConfigEditingForm };
