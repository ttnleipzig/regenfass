import { Component, For, JSX } from "solid-js";
import { cn } from "@/libs/cn.ts";
import { XCircle } from "lucide-solid";

export interface ErrorListProps extends JSX.HTMLAttributes<HTMLDivElement> {
  errors?: string[];
  title?: string;
}

const ErrorList: Component<ErrorListProps> = (props) => {
  const { errors = [], title = "Fehler", class: className, ...rest } = props;

  if (errors.length === 0) return null;

	return (
    <div
      class={cn(
        "rounded-md border border-destructive/30 bg-destructive/10 p-4",
        "dark:border-destructive/70 dark:bg-destructive/25",
        className
      )}
      role="alert"
      {...rest}
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <XCircle class="h-5 w-5 text-destructive dark:text-destructive-foreground" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-destructive dark:text-destructive-foreground">
            {title}
          </h3>
          <div class="mt-2 text-sm text-destructive dark:text-destructive-foreground/90">
            <ul class="list-disc pl-5 space-y-1">
              <For each={errors}>
                {(error) => <li>{error}</li>}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ErrorList };
