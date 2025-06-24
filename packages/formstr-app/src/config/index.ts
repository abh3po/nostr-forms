type Environment = "development" | "staging" | "preview" | "production";

interface Config {
  [key: string]: {
    apiBaseUrl: string;
    wsBaseUrl: string;
  };
}

import config from "./config.json";

const env: Environment =
  (process.env.REACT_APP_VERCEL_ENV as Environment) || "development";

console.log("ENVC IS", process.env.VERCEL_ENV, process.env);

if (!config[env]) {
  throw new Error(`No configuration found for environment: ${env}`);
}

export const appConfig = config[env];
