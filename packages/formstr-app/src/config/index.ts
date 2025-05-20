type Environment = "development" | "staging" | "production";

interface Config {
  [key: string]: {
    apiBaseUrl: string;
    wsBaseUrl: string;
  };
}

import config from "./config.json";

const env: Environment =
  (process.env.REACT_APP_ENVIRONMENT as Environment) || "development";

if (!config[env]) {
  throw new Error(`No configuration found for environment: ${env}`);
}

export const appConfig = config[env];
