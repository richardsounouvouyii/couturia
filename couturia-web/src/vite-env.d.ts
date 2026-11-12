/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL: string
  readonly VITE_ATELIER_API_URL: string
  readonly VITE_CATALOGUE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
