/// <reference types="astro/client" />
// env.d.ts
interface ImportMetaEnv {
    readonly PUBLIC_API_ENDPOINT: string;
    readonly PUBLIC_API_BEARER_TOKEN: string;
    readonly PUBLIC_AZURE_API_ENDPOINT: string;
    // more env variables...
}
  
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
interface Window {
  myCanvas: any; 
}
  
