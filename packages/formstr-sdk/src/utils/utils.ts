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

export function constructFormUrl(
  publicKey: string,
  host: string,
  embedded = false,
) {
  if (!publicKey) {
    throw Error("public key is required");
  }
  return `${host}/${embedded ? "embedded" : "fill"}/${publicKey}`;
}
export function constructResponseUrl(
  privateKey: string,
  host: string,
  formId: string,
) {
  if (!privateKey) {
    throw Error("public key is required");
  }
  if (formId?.startsWith("nprofile")) {
    return `${host}/response/${privateKey}?formId=${formId}`;
  }
  return `${host}/response/${privateKey}`;
}

export function constructDraftUrl(
  draft: { formSpec: unknown; tempId: string } | null,
  host: string,
) {
  if (!draft) {
    return;
  }
  let draftHash = window.btoa(encodeURIComponent(JSON.stringify(draft)));
  draftHash = window.encodeURIComponent(draftHash);

  return `${host}/drafts/${draftHash}`;
}

export function detectFormVersion(form: FormSpec & V0FormSpec) {
  if (form.schemaVersion) {
    return form.schemaVersion;
  } else if (form.schemaLink) {
    return form.schemaLink;
  }
  return "v0";
}
