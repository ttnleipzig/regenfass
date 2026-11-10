/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SWETRIX_PROJECT_ID?: string;
  readonly VITE_SWETRIX_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Names read from PlatformIO at build time. */
declare const __FIRMWARE_ENVIRONMENTS__: readonly string[];
