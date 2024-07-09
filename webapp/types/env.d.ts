/// <reference types="astro/client" />
// path: webapp/env.d.ts
interface ImportMetaEnv {
  readonly PUBLIC_AZURE_CHAT_API: string;
  readonly PUBLIC_AZURE_CHAT_API_ENDPOINT: string;
  readonly PUBLIC_AZURE_CHAT_API_KEY: string;
  readonly PUBLIC_AZURE_RECOMMENDATION_API_ENDPOINT: string;
  readonly PUBLIC_AZURE_RECOMMENDATION_API: string;
  readonly PUBLIC_AZURE_RECOMMENDATION_API_KEY: string;
  readonly PUBLIC_AZURE_ANIMATION_API_KEY: string;
  readonly PUBLIC_AZURE_ANIMATION_API: string;
  readonly PUBLIC_AZURE_ANIMATION_API_ENDPOINT: string;
}
interface ImportMeta {
readonly env: ImportMetaEnv;
}
interface Window {
myCanvas: any;  
}
