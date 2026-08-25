/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SWETRIX_PROJECT_ID?: string;
  readonly VITE_SWETRIX_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
