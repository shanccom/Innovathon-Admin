/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CERTIFICATES_APPS_SCRIPT_URL?: string;
  readonly VITE_ORGANIZERS_SPREADSHEET_ID?: string;
  readonly VITE_PARTICIPANTS_SPREADSHEET_ID?: string;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
