/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly API_ENDPOINT: string;
    readonly API_BEARER_TOKEN: string;
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
