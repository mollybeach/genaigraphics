/// <reference types="astro/client" />
// path: env.d.ts
interface ImportMetaEnv {
    readonly PUBLIC_API_ENDPOINT: string;
    readonly PUBLIC_API_BEARER_TOKEN: string;
    readonly PUBLIC_AZURE_API_ENDPOINT: string;
    readonly PUBLIC_AZURE_SUGGESTION_API: string;
    readonly PUBLIC_AZURE_ANIMATION_API: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
interface Window {
  myCanvas: any; 
}
  