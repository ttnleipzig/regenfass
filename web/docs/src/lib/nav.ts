export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

/** Sidebar aligned with the migrated README table of contents. */
export const DOCS_NAV: NavItem[] = [
  {
    label: "Quickstart",
    href: "/#quick-start",
    children: [
      { label: "Introduction", href: "/#quick-start---introduction" },
      { label: "Hardware overview", href: "/#quick-start---hardware-overview" },
      { label: "Flash software", href: "/#quick-start---flash-software" },
    ],
  },
  {
    label: "Hardware",
    href: "/#hardware",
    children: [
      { label: "Sensors (guide)", href: "/#sensors" },
      { label: "Sensors (deep dive)", href: "/hardware/sensors" },
      { label: "ESP32 boards", href: "/hardware/esp32" },
      { label: "LoRaWAN", href: "/hardware/lorawan" },
      { label: "Power supply", href: "/#power-supply" },
      { label: "Housing", href: "/#housing" },
      { label: "Microcontroller", href: "/#microcontroller" },
      { label: "Gateway", href: "/#gateway" },
    ],
  },
  {
    label: "Assembling",
    href: "/#3-assembeling",
    children: [
      { label: "Sensor to controller", href: "/#sensor-to-controller" },
      { label: "Power to controller", href: "/#power-to-controller" },
      { label: "Troubleshooting", href: "/#trouble-shooting" },
    ],
  },
  {
    label: "Setup",
    href: "/#setup",
  },
  {
    label: "Debugging",
    href: "/#debugging",
  },
  {
    label: "Data Engineering",
    href: "/#data-engineering",
  },
  {
    label: "Other languages",
    href: "/lang/de",
    children: [
      { label: "Deutsch", href: "/lang/de" },
      { label: "Español", href: "/lang/es" },
      { label: "Français", href: "/lang/fr" },
      { label: "日本語", href: "/lang/ja" },
      { label: "Українська", href: "/lang/uk" },
      { label: "简体中文", href: "/lang/zh-CN" },
    ],
  },
];

export const HEADER_NAV = [
  { href: "https://regenfass.eu/", label: "Marketing", external: true },
  { href: "/", label: "Docs" },
  {
    href: "https://install.regenfass.eu",
    label: "Installer",
    external: true,
  },
  { href: "https://brand.regenfass.eu", label: "Brand", external: true },
  {
    href: "https://github.com/ttnleipzig/regenfass",
    label: "GitHub",
    external: true,
  },
];
