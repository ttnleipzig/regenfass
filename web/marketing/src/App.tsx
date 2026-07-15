import { For, type ParentProps } from "solid-js";
import { Router, Route } from "@solidjs/router";
import {
  Badge,
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
  Link,
  Newsletter,
  trackEvent,
  type HeaderNavItem,
} from "@regenfass/brand";
import ChangelogSection from "./ChangelogSection";

const DOCS_URL = "https://docs.regenfass.eu/";
const INSTALLER_URL = "https://install.regenfass.eu";

function trackNavigateToDocs() {
  trackEvent("navigate_to_docs");
}

function trackNavigateToInstaller() {
  trackEvent("navigate_to_installer");
}

const NAV: HeaderNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/#changelog", label: "Changelog" },
  {
    href: DOCS_URL,
    label: "Docs",
    external: true,
    onClick: trackNavigateToDocs,
  },
  {
    href: INSTALLER_URL,
    label: "Installer",
    external: true,
    onClick: trackNavigateToInstaller,
  },
  { href: "https://brand.regenfass.eu", label: "Brand", external: true },
  {
    href: "https://github.com/ttnleipzig/regenfass",
    label: "GitHub",
    external: true,
  },
];

const WHY = [
  {
    title: "Home rain barrels",
    body: "Know how much water is left after a dry spell—before the next watering session.",
  },
  {
    title: "Community gardens",
    body: "Share a clear fill level with gardeners so everyone can water fairly and sparingly.",
  },
  {
    title: "Larger tanks",
    body: "Monitor cisterns and storage tanks without climbing lids or guessing from a dip stick.",
  },
];

const STEPS = [
  { step: "1", title: "Sense", body: "An ultrasonic or ToF sensor reads distance to the water surface." },
  { step: "2", title: "Compute", body: "An ESP32 board converts distance into fill level on device." },
  { step: "3", title: "Transmit", body: "LoRaWAN sends small payloads over long range with low power." },
  { step: "4", title: "Network", body: "The Things Network routes messages to apps you choose." },
  { step: "5", title: "Dashboard", body: "View trends in Grafana, Node-RED, or any MQTT-ready tool." },
];

const HARDWARE = [
  {
    title: "Heltec WiFi LoRa 32",
    body: "ESP32 with onboard LoRa radio—flash and configure from the browser.",
    src: "/img/hardware-esplora.svg",
  },
  {
    title: "HC-SR04 (and friends)",
    body: "Affordable ultrasonic sensing for prototypes; waterproof options for longer installs.",
    src: "/img/sensor-hcsr04.svg",
  },
  {
    title: "Power & housing",
    body: "Optional OLED display, 18650 cells, and a weather-minded enclosure for outdoor use.",
    src: "/img/hardware-18650.svg",
  },
];

const CASES = [
  {
    title: "Garden watering decisions",
    body: "Skip the guesswork: open a chart and decide whether to irrigate today.",
  },
  {
    title: "Seasonal dryness alerts",
    body: "Catch empty or near-empty tanks early during heatwaves and dry weeks.",
  },
  {
    title: "Shared site visibility",
    body: "Give allotment or school garden groups one shared reading source.",
  },
];

function Shell(props: ParentProps) {
  return (
    <div class="min-h-screen flex flex-col">
      <Header title="Regenfass" navItems={NAV} />
      <main class="flex-1">{props.children}</main>
      <Footer />
    </div>
  );
}

function Home() {
  return (
    <Shell>
      {/* 1. Hero — brand first, no cards */}
      <section class="relative overflow-hidden hero-glow">
        <div class="absolute inset-0 grid-quiet pointer-events-none" aria-hidden="true" />
        <div class="site-container relative py-20 sm:py-28 lg:py-32">
          <p class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-400 bg-clip-text">
            Regenfass
          </p>
          <h1 class="mt-4 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Know your rain barrel’s water level—wirelessly.
          </h1>
          <p class="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
            Open-source fill-level sensing for tanks and barrels, over LoRaWAN
            and The Things Network—built by TTN Leipzig.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
              <ButtonPrimary class="px-5 py-2.5 text-base">
                Get started
              </ButtonPrimary>
            </a>
            <a href={DOCS_URL} onClick={trackNavigateToDocs}>
              <ButtonSecondary class="px-5 py-2.5 text-base">
                Read docs
              </ButtonSecondary>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Why it matters */}
      <section class="site-container py-16 sm:py-20 space-y-8">
        <Headline as="h2" subtitle="Practical reasons people put a sensor on a barrel or tank.">
          Why it matters
        </Headline>
        <div class="grid gap-4 sm:grid-cols-3">
          <For each={WHY}>
            {(item) => (
              <Card>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </For>
        </div>
      </section>

      {/* 3. How it works */}
      <section class="border-y border-border bg-card/40">
        <div class="site-container py-16 sm:py-20 space-y-8">
          <Headline as="h2" subtitle="From the water surface to a dashboard you already use.">
            How it works
          </Headline>
          <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <For each={STEPS}>
              {(item) => (
                <li class="rounded-lg border border-border bg-background p-4 space-y-2">
                  <Badge class="font-mono">{item.step}</Badge>
                  <p class="font-semibold text-foreground">{item.title}</p>
                  <p class="text-sm text-muted-foreground">{item.body}</p>
                </li>
              )}
            </For>
          </ol>
        </div>
      </section>

      {/* 4. Hardware */}
      <section class="site-container py-16 sm:py-20 space-y-8">
        <Headline
          as="h2"
          subtitle="A small parts list most makers already recognize."
        >
          Hardware overview
        </Headline>
        <div class="grid gap-6 sm:grid-cols-3">
          <For each={HARDWARE}>
            {(item) => (
              <Card>
                <CardHeader class="items-start gap-3">
                  <img
                    src={item.src}
                    alt=""
                    class="h-24 w-auto object-contain"
                    loading="lazy"
                  />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </For>
        </div>
        <p class="text-sm text-muted-foreground">
          Full bill of materials and wiring diagrams live in the{" "}
          <Link href={DOCS_URL} onClick={trackNavigateToDocs}>
            documentation
          </Link>
          .
        </p>
      </section>

      {/* 5. Software */}
      <section class="border-y border-border bg-card/40">
        <div class="site-container py-16 sm:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div class="space-y-4">
            <Headline as="h2">Software you flash in the browser</Headline>
            <p class="text-muted-foreground max-w-prose">
              The web installer uses Web Serial—no desktop IDE required for a
              first flash. Firmware and the installer are open source under the
              project’s license on GitHub.
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
                <ButtonPrimary>Open installer</ButtonPrimary>
              </a>
              <Link href="https://github.com/ttnleipzig/regenfass">
                View source on GitHub
              </Link>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>What you get</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm text-muted-foreground">
              <p>• Browser-based flashing and device configuration</p>
              <p>• LoRaWAN OTAA credentials for The Things Network</p>
              <p>• Hooks into MQTT, Node-RED, and Grafana stacks</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. Typical use cases */}
      <section class="site-container py-16 sm:py-20 space-y-8">
        <Headline as="h2">Typical use cases</Headline>
        <div class="grid gap-4 sm:grid-cols-3">
          <For each={CASES}>
            {(item) => (
              <Card>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </For>
        </div>
      </section>

      {/* 7. Changelog / release notes */}
      <ChangelogSection />

      {/* 8. CTA strip */}
      <section class="border-t border-border bg-gradient-to-br from-sky-600/10 to-cyan-500/5">
        <div class="site-container py-14 sm:py-16 space-y-6">
          <Headline as="h2" align="center">
            Ready to measure?
          </Headline>
          <p class="text-center text-muted-foreground max-w-xl mx-auto">
            Flash a board in minutes, join The Things Network, and start
            reading your rain barrel from anywhere with coverage.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
              <ButtonPrimary class="px-5 py-2.5">Get started</ButtonPrimary>
            </a>
            <a href={DOCS_URL} onClick={trackNavigateToDocs}>
              <ButtonSecondary class="px-5 py-2.5">Read the docs</ButtonSecondary>
            </a>
          </div>
          <div class="max-w-lg mx-auto pt-4">
            <Newsletter />
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  );
}
