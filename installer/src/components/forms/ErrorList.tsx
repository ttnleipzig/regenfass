import { Component, JSX } from "solid-js";
import { cn } from "@/libs/cn";

export interface ErrorListProps extends JSX.HTMLAttributes<HTMLDivElement> {
  errors?: string[];
  title?: string;
}

const ErrorList: Component<ErrorListProps> = (props) => {
  const { errors = [], title = "Fehler", class: className, ...rest } = props;

  if (errors.length === 0) return null;

  return (
    <div 
      class={cn("rounded-md bg-red-50 border border-red-200 p-4", className)} 
      role="alert"
      {...rest}
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <ul class="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ErrorList };
