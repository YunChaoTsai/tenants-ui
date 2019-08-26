/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test"
    readonly PUBLIC_URL: string
    readonly APP_URL: string
    readonly REACT_APP_APPLICATION_NAME: string
    readonly REACT_APP_SERVER_BASE: string
    readonly REACT_APP_API_BASE_URL: string
    readonly REACT_APP_VERSION: string
    readonly REACT_APP_PUSHER_APP_KEY: string
    readonly REACT_APP_PUSHER_APP_CLUSTER: string
  }
}
