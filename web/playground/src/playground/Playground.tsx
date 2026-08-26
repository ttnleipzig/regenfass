import { useParams } from "@solidjs/router";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import { For, Show, createEffect, createMemo, createSignal, onMount, type ParentProps } from "solid-js";
import {
  PLAYGROUND_CATEGORIES,
  PLAYGROUND_COMPONENTS,
  getDefaultValues,
  getPlaygroundComponent,
  type PlaygroundCategory,
} from "./data";
import { COLOR_TOKEN_GROUPS, COLOR_TOKENS, FONT_TOKENS } from "./tokens";
import { Button, InputField, SidebarNav, type SidebarNavItem } from "@regenfass/brand";

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

const PLAYGROUND_CATEGORY_STORAGE_KEY = "regenfass-playground-open-categories";

function defaultOpenCategories() {
  return Object.fromEntries(PLAYGROUND_CATEGORIES.map((category) => [category.id, true]));
}

function readOpenCategories() {
  const defaults = defaultOpenCategories();

  try {
    const stored = JSON.parse(localStorage.getItem(PLAYGROUND_CATEGORY_STORAGE_KEY) ?? "null");
    if (!stored || typeof stored !== "object") {
      return defaults;
    }

    return Object.fromEntries(
      Object.keys(defaults).map((category) => [
        category,
        typeof stored[category] === "boolean" ? stored[category] : true,
      ]),
    );
  } catch {
    return defaults;
  }
}

function PlaygroundSidebar(props: { onNavigate: () => void }) {
  const [query, setQuery] = createSignal("");
  const [openCategories, setOpenCategories] = createSignal<Record<string, boolean>>(defaultOpenCategories());

  onMount(() => {
    setOpenCategories(readOpenCategories());
  });

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

  const navItems = createMemo<SidebarNavItem[]>(() => [
    { id: "tokens", label: "Tokens", href: "/tokens" },
    ...grouped().map((category) => ({
      id: category.id,
      label: category.title,
      children: category.components.map((entry) => ({
        id: entry.slug,
        label: entry.name,
        href: `/${entry.slug}`,
      })),
    })),
  ]);

  const expandedCategories = () =>
    Object.entries(openCategories()).filter(([, isOpen]) => isOpen).map(([id]) => id);

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

      <div class="mt-4">
        <InputField
          type="search"
          aria-label="Search components"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search components…"
        />
      </div>

      <div class="mt-4">
        <SidebarNav
          ariaLabel="Playground components"
          items={navItems()}
          collapsible
          expanded={expandedCategories()}
          onExpandedChange={(expanded) => {
            const next = Object.fromEntries(PLAYGROUND_CATEGORIES.map((category) => [category.id, expanded.includes(category.id)]));
            setOpenCategories(next);
            try {
              localStorage.setItem(PLAYGROUND_CATEGORY_STORAGE_KEY, JSON.stringify(next));
            } catch {
              // Keep the in-memory state when browser storage is unavailable.
            }
          }}
          onNavigate={props.onNavigate}
        />
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
        <Button
          type="button"
          variant="outline"
          class="flex h-auto w-full items-center justify-between bg-card px-3 py-2 text-sm font-medium shadow-sm"
          aria-expanded={sidebarOpen()}
          aria-controls="playground-sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span>{sidebarOpen() ? "Close component library" : "Browse components"}</span>
          <span aria-hidden="true">{sidebarOpen() ? "×" : "☰"}</span>
        </Button>
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

type TokenValues = Record<string, { light: string; dark: string }>;

function readThemeTokenValues(): TokenValues {
  const values: TokenValues = {};
  const lightElement = document.createElement("div");
  const darkElement = document.createElement("div");
  darkElement.setAttribute("data-kb-theme", "dark");
  lightElement.style.display = darkElement.style.display = "none";
  document.body.append(lightElement, darkElement);

  for (const token of COLOR_TOKENS) {
    values[token.variable] = {
      light: getComputedStyle(lightElement).getPropertyValue(token.variable).trim(),
      dark: getComputedStyle(darkElement).getPropertyValue(token.variable).trim(),
    };
  }

  lightElement.remove();
  darkElement.remove();
  return values;
}

function readFontValues(): Record<string, string> {
  const values: Record<string, string> = {};
  const elements = FONT_TOKENS.map((token) => {
    const element = document.createElement("span");
    element.className = token.className;
    element.style.position = "absolute";
    element.style.visibility = "hidden";
    element.textContent = token.name;
    document.body.append(element);
    return [token.name, element] as const;
  });

  for (const [name, element] of elements) {
    values[name] = getComputedStyle(element).fontFamily || FONT_TOKENS.find((token) => token.name === name)?.fallback || "";
    element.remove();
  }

  return values;
}

export function TokensPage() {
  const [colorValues, setColorValues] = createSignal<TokenValues>({});
  const [fontValues, setFontValues] = createSignal<Record<string, string>>({});

  onMount(() => {
    setColorValues(readThemeTokenValues());
    setFontValues(readFontValues());
  });

  return (
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Tokens · Brand system</p>
        <h1 class="text-3xl font-bold tracking-tight">Design tokens</h1>
        <p class="max-w-3xl text-muted-foreground">The semantic colors and typography defaults that shape regenfass interfaces. Every color is shown with its Light and Dark theme value.</p>
      </header>

      <section class="space-y-5" aria-labelledby="color-tokens-heading">
        <div>
          <h2 id="color-tokens-heading" class="text-xl font-semibold">Color tokens</h2>
          <p class="mt-1 text-sm text-muted-foreground">CSS variables from <code class="font-mono text-xs">web/brand/src/styles.css</code>.</p>
        </div>
        <For each={COLOR_TOKEN_GROUPS}>
          {(group) => {
            const groupId = `token-group-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
            return (
              <section class="space-y-3" aria-labelledby={groupId}>
                <h3 id={groupId} class="text-sm font-semibold text-muted-foreground">{group.title}</h3>
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <For each={group.tokens}>
                    {(token) => {
                      const values = () => colorValues()[token.variable];
                      return (
                        <article class="rounded-lg border border-border bg-card/70 p-4">
                          <div class="flex items-center gap-3">
                            <div class="flex shrink-0 gap-1" aria-label={`${token.name} Light and Dark color swatches`}>
                              <span data-token-swatch={`${token.variable}-light`} class="size-8 rounded-md border border-border shadow-inner" style={{ "background-color": values()?.light ? `hsl(${values()?.light})` : `hsl(var(${token.variable}))` }} aria-hidden="true" />
                              <span data-token-swatch={`${token.variable}-dark`} class="size-8 rounded-md border border-border shadow-inner" style={{ "background-color": values()?.dark ? `hsl(${values()?.dark})` : `hsl(var(${token.variable}))` }} aria-hidden="true" />
                            </div>
                            <div class="min-w-0">
                              <h4 class="font-medium">{token.name}</h4>
                              <code class="text-xs text-muted-foreground">{token.variable}</code>
                            </div>
                          </div>
                          <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
                            <div class="rounded-md bg-background/70 p-2"><dt class="font-semibold text-muted-foreground">Light</dt><dd class="mt-1 break-all font-mono">{values()?.light || "—"}</dd></div>
                            <div class="rounded-md bg-background/70 p-2"><dt class="font-semibold text-muted-foreground">Dark</dt><dd class="mt-1 break-all font-mono">{values()?.dark || "—"}</dd></div>
                          </dl>
                        </article>
                      );
                    }}
                  </For>
                </div>
              </section>
            );
          }}
        </For>
      </section>

      <section class="space-y-5" aria-labelledby="font-tokens-heading">
        <div>
          <h2 id="font-tokens-heading" class="text-xl font-semibold">Typography</h2>
          <p class="mt-1 text-sm text-muted-foreground">The current Tailwind and system fallback stacks used by the playground.</p>
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          <For each={FONT_TOKENS}>
            {(token) => (
              <article class="rounded-lg border border-border bg-card/70 p-5">
                <div class="flex items-baseline justify-between gap-3"><h3 class="font-semibold">{token.name}</h3><span class="text-xs text-muted-foreground">{token.label}</span></div>
                <p class={`mt-5 text-2xl ${token.className}`}>The quick brown fox jumps over the lazy dog.</p>
                <p class="mt-4 text-xs text-muted-foreground">{token.description}</p>
                <code class="mt-2 block break-words rounded-md bg-background/70 p-3 text-xs text-muted-foreground">{fontValues()[token.name] || token.fallback}</code>
              </article>
            )}
          </For>
        </div>
      </section>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-auto px-2 py-1 text-xs"
          onClick={props.onReset}
        >
          {props.resetVersion > 0 ? "Reset ✓" : "Reset"}
        </Button>
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

  const highlightedCode = createMemo(() => Prism.highlight(generatedCode(), Prism.languages.jsx, "jsx"));

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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-auto px-2 py-1 text-xs"
                  onClick={copyGeneratedCode}
                >
                  {copied() ? "Copied ✓" : "Copy"}
                </Button>
              </div>
              <pre class="overflow-x-auto rounded-md border border-border bg-muted p-3 text-sm leading-6">
                <code class="tokenized-code" innerHTML={highlightedCode()} />
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
