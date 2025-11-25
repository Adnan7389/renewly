/// <reference types="vite/client" />

/**
 * Vite environment variables type definitions
 */
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Add other env variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
