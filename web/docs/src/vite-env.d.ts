/* eslint-disable */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SWETRIX_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}
