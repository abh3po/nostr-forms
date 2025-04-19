import { BaselimeSDK } from "@baselime/node-opentelemetry";

const sdk = new BaselimeSDK({
  service: process.env.SERVICE_NAME,
  baselimeKey: process.env.BASELIME_API_KEY,
  instrumentations: [],
});

sdk.start();
