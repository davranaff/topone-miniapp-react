/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: "local" | "development" | "staging" | "production";
  readonly VITE_TELEGRAM_BOT_NAME?: string;
  readonly VITE_ENABLE_QUERY_DEVTOOLS?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
