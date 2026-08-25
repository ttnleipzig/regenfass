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

function escapeCodeString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n")}"`;
}

function PlaygroundSidebar(props: { onNavigate: () => void }) {
  const [query, setQuery] = createSignal("");
  const [openCategories, setOpenCategories] = createSignal<Record<string, boolean>>(
    Object.fromEntries(PLAYGROUND_CATEGORIES.map((category) => [category.id, true])),
  );

  const grouped = createMemo(() => {
    const normalizedQuery = query().trim().toLowerCase();
    return PLAYGROUND_CATEGORIES.map((category) => ({
      ...category,
      components: PLAYGROUND_COMPONENTS.filter(
        (entry) =>
          entry.category === category.id &&
          (!normalizedQuery ||
            entry.name.toLowerCase().includes(normalizedQuery) ||
            entry.description.toLowerCase().includes(normalizedQuery)),
      ).sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" })),
    })).filter((category) => category.components.length > 0);
  });

  const toggleCategory = (category: string) => {
    setOpenCategories((current) => ({ ...current, [category]: !current[category] }));
  };

  return (
    <aside class="h-full w-full overflow-y-auto border-b border-border bg-card/40 p-4 lg:h-[calc(100vh-5rem)] lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Playground</p>
          <h2 class="mt-1 text-lg font-semibold tracking-tight">Component Library</h2>
        </div>
        <span class="rounded-full border border-border bg-background px-2 py-1 text-xs tabular-nums text-muted-foreground">
          {PLAYGROUND_COMPONENTS.length}
        </span>
      </div>

      <label class="mt-4 block text-sm">
        <span class="sr-only">Search components</span>
        <input
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search components…"
          class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>

      <div class="mt-4 space-y-4">
        <For each={grouped()}>
          {(category) => (
            <div class="space-y-2">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-expanded={openCategories()[category.id]}
                onClick={() => toggleCategory(category.id)}
              >
                <span>{category.title}</span>
                <span aria-hidden="true" class="text-xs">{openCategories()[category.id] ? "−" : "+"}</span>
              </button>
              <Show when={openCategories()[category.id]}>
                <ul class="space-y-1">
                  <For each={category.components}>
                    {(entry) => (
                      <li>
                        <A
                          href={`/${entry.slug}`}
                          class="block rounded-md border border-transparent px-3 py-2 text-sm transition hover:border-border hover:bg-accent"
                          activeClass="border-border bg-accent text-foreground shadow-sm"
                          end
                          onClick={props.onNavigate}
                        >
                          {entry.name}
                        </A>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          )}
        </For>
        <Show when={grouped().length === 0}>
          <p class="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No components found.
          </p>
        </Show>
      </div>
    </aside>
  );
}

export function PlaygroundLayout(props: ParentProps) {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  return (
    <div class="flex min-h-[calc(100vh-5rem)] flex-col lg:flex-row">
      <div class="border-b border-border bg-background px-4 py-3 lg:hidden">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm"
          aria-expanded={sidebarOpen()}
          aria-controls="playground-sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span>{sidebarOpen() ? "Close component library" : "Browse components"}</span>
          <span aria-hidden="true">{sidebarOpen() ? "×" : "☰"}</span>
        </button>
      </div>
      <Show when={sidebarOpen()}>
        <div class="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      </Show>
      <div
        id="playground-sidebar"
        class={sidebarOpen() ? "fixed inset-x-0 top-[7.25rem] z-40 max-h-[calc(100vh-7.25rem)] overflow-y-auto lg:static lg:block" : "hidden lg:block"}
      >
        <PlaygroundSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
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
    type: "text" | "boolean" | "number" | "range" | "select";
    defaultValue: string | boolean | number;
    options?: string[];
    description?: string;
    placeholder?: string;
    min?: number;
    max?: number;
  }[];
  componentSlug: string;
  values: Record<string, string | boolean | number>;
  onChange: (key: string, value: string | boolean | number) => void;
  onReset: () => void;
  resetVersion: number;
}) {
  return (
    <section class="space-y-4 rounded-lg border border-border bg-card/70 p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-semibold">Props</h3>
          <p class="mt-1 text-xs text-muted-foreground">Tune the live preview</p>
        </div>
        <button
          type="button"
          class="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          onClick={props.onReset}
        >
          {props.resetVersion > 0 ? "Reset ✓" : "Reset"}
        </button>
      </div>

      <Show
        when={props.controls.length > 0}
        fallback={
          <p class="rounded-md border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            No configurable props for this component.
          </p>
        }
      >
      <div class="space-y-3">
        <For each={props.controls}>
          {(control) => (
            <div>
            <Show
              when={control.type === "boolean"}
              fallback={
                <label class="block space-y-1 text-sm">
                  <span class="flex items-center justify-between gap-3 font-medium" id={`${props.componentSlug}-${control.key}-label`}>
                    <span>{control.label}</span>
                    <Show when={control.type === "range"}>
                      <span class="font-mono text-xs text-primary">{props.values[control.key]}</span>
                    </Show>
                  </span>
                  <Show when={control.description}>
                    <span class="block text-xs text-muted-foreground">{control.description}</span>
                  </Show>

                  <Show
                    when={control.type === "select"}
                    fallback={
                      <input
                        type={control.type === "range" ? "range" : control.type === "number" ? "number" : "text"}
                        id={`${props.componentSlug}-${control.key}`}
                        aria-labelledby={`${props.componentSlug}-${control.key}-label`}
                        placeholder={control.placeholder}
                        min={control.min}
                        max={control.max}
                        class={control.type === "range" ? "h-2 w-full cursor-pointer accent-primary" : "w-full rounded-md border border-border bg-background px-2 py-2"}
                        value={String(props.values[control.key] ?? "")}
                        onInput={(event) => {
                          if (control.type === "number" || control.type === "range") {
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
                      id={`${props.componentSlug}-${control.key}`}
                      aria-labelledby={`${props.componentSlug}-${control.key}-label`}
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
                  id={`${props.componentSlug}-${control.key}`}
                  checked={Boolean(props.values[control.key])}
                  onChange={(event) => props.onChange(control.key, event.currentTarget.checked)}
                  class="size-4 shrink-0 accent-primary"
                />
                <span>
                  <span class="block font-medium">{control.label}</span>
                  <Show when={control.description}>
                    <span class="block text-xs text-muted-foreground">{control.description}</span>
                  </Show>
                </span>
              </label>
            </Show>
            </div>
          )}
        </For>
      </div>
      </Show>
    </section>
  );
}

export function PlaygroundComponentPage() {
  const params = useParams<{ slug: string }>();
  const component = createMemo(() => getPlaygroundComponent(params.slug));
  const [values, setValues] = createSignal<Record<string, string | boolean | number>>({});
  const [resetVersion, setResetVersion] = createSignal(0);
  const [lastInteraction, setLastInteraction] = createSignal("No interactions yet");
  const [copied, setCopied] = createSignal(false);

  createEffect(() => {
    const entry = component();
    if (!entry) {
      setValues({});
      return;
    }

    setValues(getDefaultValues(entry));
    setResetVersion(0);
    setLastInteraction("No interactions yet");
    setCopied(false);
  });

  const generatedCode = createMemo(() => {
    const entry = component();
    if (!entry) {
      return "";
    }

    if (entry.code) {
      return entry.code(values());
    }

    const attrs = entry.controls
      .filter((control) => control.key !== "children" && values()[control.key] !== control.defaultValue)
      .map((control) => {
        const value = values()[control.key];
        const codeValue = typeof value === "string" ? escapeCodeString(value) : toCodeValue(value);
        return `${control.key}={${codeValue}}`;
      })
      .join(" ");

    const hasChildren = entry.controls.some((control) => control.key === "children");
    const childContent = hasChildren ? String(values()["children"] ?? "") : "";
    const openingTag = attrs.length > 0 ? `<${entry.name} ${attrs}>` : `<${entry.name}>`;

    return hasChildren ? `${openingTag}${childContent}</${entry.name}>` : `<${entry.name} />`;
  });

  const copyGeneratedCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode());
      setCopied(true);
      setLastInteraction("Generated JSX copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setLastInteraction("Clipboard access was unavailable");
    }
  };

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
              <div class="flex flex-wrap items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <span>{entry().category}</span>
                <span aria-hidden="true">·</span>
                <a
                  href={`https://github.com/ttnleipzig/regenfass/blob/main/web/brand/src/components/${entry().category}/${entry().name}.tsx`}
                  target="_blank"
                  rel="noreferrer"
                  class="normal-case tracking-normal text-primary underline-offset-4 hover:underline"
                >
                  View source ↗
                </a>
              </div>
              <h1 class="text-3xl font-bold tracking-tight">{entry().name}</h1>
              <p class="text-muted-foreground">{entry().description}</p>
            </header>

            <div class="rounded-lg border border-border bg-background p-6 shadow-[0_18px_60px_-36px_hsl(var(--primary)/0.55)]">
              {entry().render(values())}
            </div>

            <div class="rounded-lg border border-border bg-card/70 p-5">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 class="font-semibold">Generated JSX</h2>
                  <p class="mt-1 text-xs text-muted-foreground">Only non-default props are shown.</p>
                </div>
                <button
                  type="button"
                  class="rounded-md border border-border px-2 py-1 text-xs font-medium transition hover:bg-accent"
                  onClick={copyGeneratedCode}
                >
                  {copied() ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre class="overflow-x-auto rounded-md border border-border bg-muted p-3 text-sm leading-6">
                <code>{generatedCode()}</code>
              </pre>
            </div>

            <div class="rounded-lg border border-border/70 bg-card/40 px-4 py-3 text-xs text-muted-foreground" aria-live="polite">
              <span class="font-medium text-foreground">Last interaction:</span> {lastInteraction()}
            </div>
          </section>

          <PropsEditor
            controls={entry().controls}
            componentSlug={entry().slug}
            values={values()}
            resetVersion={resetVersion()}
            onChange={(key, value) => {
              setValues((prev) => ({ ...prev, [key]: value }));
              setLastInteraction(`${key} changed`);
              setCopied(false);
            }}
            onReset={() => {
              setValues(getDefaultValues(entry()));
              setResetVersion((version) => version + 1);
              setLastInteraction("Props reset");
              setCopied(false);
            }}
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
