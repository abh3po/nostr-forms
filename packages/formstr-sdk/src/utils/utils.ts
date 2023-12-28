import { FormSpec, V0FormSpec } from "../interfaces";

export function makeTag(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function constructFormUrl(publicKey: string) {
  if (!publicKey) {
    throw Error("public key is required");
  }
  return `https://formstr.app/#/v1/fill/${publicKey}`;
}

export function constructResponseUrl(privateKey: string) {
  if (!privateKey) {
    throw Error("public key is required");
  }
  return `https://formstr.app/#/forms/${privateKey}/responses`;
}

export function detectFormVersion(form: FormSpec & V0FormSpec) {
  if (form.schemaVersion) {
    return form.schemaVersion;
  } else if (form.schemaLink) {
    return form.schemaLink;
  }
  return "v0";
}
