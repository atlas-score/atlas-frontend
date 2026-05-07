/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** -- Canonical origin for “Copy as Markdown” theory links (default: https://www.atlasscore.org). */
  readonly VITE_ATLAS_SITE_ORIGIN?: string;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}
