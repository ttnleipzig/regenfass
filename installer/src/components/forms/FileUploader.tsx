import { Component, JSX, splitProps, createSignal } from "solid-js";
import { FormField } from "./FormField";
import { Button } from "@/components/atoms/Button.tsx";
import { cn } from "@/libs/cn";

export interface FileUploaderProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'class'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  class?: string;
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: FileList | null) => void;
}

const FileUploader: Component<FileUploaderProps> = (props) => {
  const [local, rest] = splitProps(props, ["label", "required", "error", "helperText", "class", "accept", "multiple", "onFileSelect"]);
  const [selectedFiles, setSelectedFiles] = createSignal<FileList | null>(null);

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    setSelectedFiles(files);
    local.onFileSelect?.(files);
  };

  const clearFiles = () => {
    setSelectedFiles(null);
    local.onFileSelect?.(null);
  };

  return (
    <FormField
      label={local.label}
      required={local.required}
      error={local.error}
      helperText={local.helperText}
    >
      <div class={cn("space-y-3", local.class)}>
        <div class="flex items-center space-x-3">
          <input
            {...rest}
            type="file"
            accept={local.accept}
            multiple={local.multiple}
            onChange={handleFileChange}
            class="hidden"
            id={`file-${Math.random().toString(36).substr(2, 9)}`}
          />
          <label
            for={`file-${Math.random().toString(36).substr(2, 9)}`}
            class="cursor-pointer"
          >
            <Button type="button" variant="outline">
              Datei auswählen
            </Button>
          </label>
          {selectedFiles() && (
            <Button type="button" variant="ghost" onClick={clearFiles}>
              Löschen
            </Button>
          )}
        </div>

        {selectedFiles() && (
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ausgewählte Dateien:
            </p>
            <ul class="space-y-1">
              {Array.from(selectedFiles()!).map((file) => (
                <li class="text-sm text-gray-600 dark:text-gray-400">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </FormField>
  );
};

export { FileUploader };
