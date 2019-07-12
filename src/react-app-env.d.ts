/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test"
    readonly PUBLIC_URL: string
    readonly APP_URL: string
    readonly REACT_APP_APPLICATION_NAME: string
    readonly REACT_APP_API_BASE_URL: string
  }
}
