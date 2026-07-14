import { For } from "solid-js";
import { Router, Route } from "@solidjs/router";
import {
  Badge,
  Button,
  ButtonPrimary,
  ButtonSecondary,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Footer,
  Header,
  Headline,
  InputField,
  Link,
  Spinner,
  Status,
  TextInput,
} from "@regenfass/brand";
import type { ParentProps } from "solid-js";

const SECTIONS = [
  { id: "buttons", title: "Buttons" },
  { id: "feedback", title: "Feedback" },
  { id: "forms", title: "Forms" },
  { id: "layout", title: "Layout" },
] as const;

function Shell(props: ParentProps) {
  return (
    <div class="min-h-screen flex flex-col">
      <Header
        title="Regenfass Brand"
        navItems={[
          { href: "/", label: "Gallery" },
          { href: "https://docs.regenfass.eu/", label: "Docs", external: true },
          {
            href: "https://install.regenfass.eu",
            label: "Installer",
            external: true,
          },
          {
            href: "https://github.com/ttnleipzig/regenfass",
            label: "GitHub",
            external: true,
          },
        ]}
      />
      <main class="flex-1 site-container py-10 space-y-10">{props.children}</main>
      <Footer />
    </div>
  );
}

function Gallery() {
  return (
    <Shell>
      <section class="space-y-3">
        <Headline as="h2">Component gallery</Headline>
        <p class="text-muted-foreground max-w-2xl">
          Shared SolidJS UI from{" "}
          <code class="text-sm text-foreground">@regenfass/brand</code>. Use
          these building blocks across installer, docs, and marketing sites.
        </p>
        <ul class="flex flex-wrap gap-2 pt-2">
          <For each={[...SECTIONS]}>
            {(section) => (
              <li>
                <a
                  href={`#${section.id}`}
                  class="inline-flex rounded-md border border-border bg-card px-3 py-1 text-sm hover:bg-accent"
                >
                  {section.title}
                </a>
              </li>
            )}
          </For>
        </ul>
      </section>

      <section id="buttons" class="space-y-4">
        <Headline as="h3">Buttons</Headline>
        <div class="flex flex-wrap items-center gap-3">
          <ButtonPrimary>Primary</ButtonPrimary>
          <ButtonSecondary>Secondary</ButtonSecondary>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Link href="https://docs.regenfass.eu/">Docs link</Link>
        </div>
      </section>

      <section id="feedback" class="space-y-4">
        <Headline as="h3">Feedback</Headline>
        <div class="flex flex-wrap items-center gap-4">
          <Status status="success" message="Online" />
          <Status status="error" message="Error" />
          <Status status="loading" message="Working…" />
          <Badge>New</Badge>
          <Spinner />
        </div>
      </section>

      <section id="forms" class="space-y-4 max-w-md">
        <Headline as="h3">Forms</Headline>
        <TextInput label="Device name" placeholder="My regenfass" />
        <InputField placeholder="Short value" />
      </section>

      <section id="layout" class="space-y-4">
        <Headline as="h3">Layout</Headline>
        <Card class="max-w-lg">
          <CardHeader>
            <CardTitle>Rain barrel</CardTitle>
            <CardDescription>
              Measure water level and send readings via LoRaWAN.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              This card is part of the shared brand package used by all
              Regenfass web apps.
            </p>
          </CardContent>
        </Card>
      </section>
    </Shell>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={Gallery} />
    </Router>
  );
}
