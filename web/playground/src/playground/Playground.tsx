import { A, useParams } from "@solidjs/router";
import { For, Show, createEffect, createMemo, createSignal, type ParentProps } from "solid-js";
import {
  PLAYGROUND_CATEGORIES,
  PLAYGROUND_COMPONENTS,
  getDefaultValues,
  getPlaygroundComponent,
  type PlaygroundCategory,
} from "./data";

function toCodeValue(value: string | boolean | number) {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function PlaygroundSidebar() {
  const grouped = createMemo(() => {
    return PLAYGROUND_CATEGORIES.map((category) => ({
      ...category,
      components: PLAYGROUND_COMPONENTS.filter((entry) => entry.category === category.id),
    }));
  });

  return (
    <aside class="w-full border-b border-border bg-card/40 p-4 lg:h-[calc(100vh-5rem)] lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Playground</p>
      <h2 class="mt-1 text-lg font-semibold">Component Library</h2>

      <div class="mt-4 space-y-4">
        <For each={grouped()}>
          {(category) => (
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">{category.title}</h3>
              <ul class="space-y-1">
                <For each={category.components}>
                  {(entry) => (
                    <li>
                      <A
                        href={`/${entry.slug}`}
                        class="block rounded-md border border-transparent px-3 py-2 text-sm hover:border-border hover:bg-accent"
                        activeClass="border-border bg-accent text-foreground"
                        end
                      >
                        {entry.name}
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>
    </aside>
  );
}

export function PlaygroundLayout(props: ParentProps) {
  return (
    <div class="flex min-h-[calc(100vh-5rem)] flex-col lg:flex-row">
      <PlaygroundSidebar />
      <main class="flex-1 p-6 lg:p-8">
        {props.children}
      </main>
    </div>
  );
}

export function PlaygroundHomePage() {
  const total = PLAYGROUND_COMPONENTS.length;
  const byCategory = createMemo(() => {
    return PLAYGROUND_CATEGORIES.map((category) => ({
      ...category,
      count: PLAYGROUND_COMPONENTS.filter((entry) => entry.category === category.id).length,
    }));
  });

  return (
    <section class="space-y-6">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Playground is back</h1>
        <p class="max-w-2xl text-muted-foreground">
          This view restores the old component playground workflow: pick a component on the left,
          tweak props, and inspect the generated JSX.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={byCategory()}>
          {(category) => (
            <article class="rounded-lg border border-border bg-card/70 p-4">
              <h2 class="font-semibold">{category.title}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{category.count} components</p>
            </article>
          )}
        </For>
      </div>

      <div class="rounded-lg border border-border bg-card/70 p-5">
        <p class="text-sm text-muted-foreground">Total</p>
        <p class="mt-1 text-3xl font-bold">{total}</p>
      </div>
    </section>
  );
}

function PropsEditor(props: {
  controls: {
    key: string;
    label: string;
    type: "text" | "boolean" | "number" | "select";
    defaultValue: string | boolean | number;
    options?: string[];
  }[];
  values: Record<string, string | boolean | number>;
  onChange: (key: string, value: string | boolean | number) => void;
  onReset: () => void;
}) {
  return (
    <section class="space-y-4 rounded-lg border border-border bg-card/70 p-5">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Props</h3>
        <button
          type="button"
          class="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          onClick={props.onReset}
        >
          Reset
        </button>
      </div>

      <div class="space-y-3">
        <For each={props.controls}>
          {(control) => (
            <Show
              when={control.type === "boolean"}
              fallback={
                <label class="block space-y-1 text-sm">
                  <span class="font-medium">{control.label}</span>

                  <Show
                    when={control.type === "select"}
                    fallback={
                      <input
                        type={control.type === "number" ? "number" : "text"}
                        class="w-full rounded-md border border-border bg-background px-2 py-2"
                        value={String(props.values[control.key] ?? "")}
                        onInput={(event) => {
                          if (control.type === "number") {
                            const next = Number(event.currentTarget.value || "0");
                            props.onChange(control.key, Number.isFinite(next) ? next : 0);
                            return;
                          }

                          props.onChange(control.key, event.currentTarget.value);
                        }}
                      />
                    }
                  >
                    <select
                      class="w-full rounded-md border border-border bg-background px-2 py-2"
                      value={String(props.values[control.key])}
                      onChange={(event) => props.onChange(control.key, event.currentTarget.value)}
                    >
                      <For each={control.options ?? []}>
                        {(option) => <option value={option}>{option}</option>}
                      </For>
                    </select>
                  </Show>
                </label>
              }
            >
              <label class="flex min-h-10 cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                <input
                  type="checkbox"
                  checked={Boolean(props.values[control.key])}
                  onChange={(event) => props.onChange(control.key, event.currentTarget.checked)}
                  class="size-4 shrink-0 accent-primary"
                />
                <span class="font-medium">{control.label}</span>
              </label>
            </Show>
          )}
        </For>
      </div>
    </section>
  );
}

export function PlaygroundComponentPage() {
  const params = useParams<{ slug: string }>();
  const component = createMemo(() => getPlaygroundComponent(params.slug));
  const [values, setValues] = createSignal<Record<string, string | boolean | number>>({});

  createEffect(() => {
    const entry = component();
    if (!entry) {
      setValues({});
      return;
    }

    setValues(getDefaultValues(entry));
  });

  const generatedCode = createMemo(() => {
    const entry = component();
    if (!entry) {
      return "";
    }

    const attrs = entry.controls
      .filter((control) => control.key !== "children")
      .map((control) => `${control.key}={${toCodeValue(values()[control.key])}}`)
      .join(" ");

    const hasChildren = entry.controls.some((control) => control.key === "children");
    const childContent = hasChildren ? String(values()["children"] ?? "") : "";
    const openingTag = attrs.length > 0 ? `<${entry.name} ${attrs}>` : `<${entry.name}>`;

    return hasChildren
      ? `${openingTag}${childContent}</${entry.name}>`
      : `${openingTag}</${entry.name}>`;
  });

  return (
    <Show
      when={component()}
      fallback={
        <div class="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Unknown playground component.
        </div>
      }
    >
      {(entry) => (
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section class="space-y-5">
            <header class="space-y-1">
              <p class="text-sm uppercase tracking-wide text-muted-foreground">{entry().category}</p>
              <h1 class="text-3xl font-bold tracking-tight">{entry().name}</h1>
              <p class="text-muted-foreground">{entry().description}</p>
            </header>

            <div class="rounded-lg border border-border bg-background p-6">
              {entry().render(values())}
            </div>

            <div class="rounded-lg border border-border bg-card/70 p-5">
              <h2 class="mb-3 font-semibold">Generated JSX</h2>
              <pre class="overflow-x-auto rounded bg-muted p-3 text-sm">
                <code>{generatedCode()}</code>
              </pre>
            </div>
          </section>

          <PropsEditor
            controls={entry().controls}
            values={values()}
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setValues(getDefaultValues(entry()))}
          />
        </div>
      )}
    </Show>
  );
}

export function findFirstPlaygroundSlug(category?: PlaygroundCategory) {
  if (!category) {
    return PLAYGROUND_COMPONENTS[0]?.slug;
  }

  return PLAYGROUND_COMPONENTS.find((entry) => entry.category === category)?.slug;
}
