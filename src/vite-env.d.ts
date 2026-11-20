/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPPORT_UPI_ID?: string;
  readonly VITE_SUPPORT_KOFI_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
