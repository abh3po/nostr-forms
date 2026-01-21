import type {
  NormalizedForm,
  NormalizedField,
  NormalizedOption,
} from "./types";

export function normalizeForm(event: any): NormalizedForm {
  const formIdTag = event.tags.find((t: any[]) => t[0] === "d");
  const nameTag = event.tags.find((t: any[]) => t[0] === "name");
  const settingsTag = event.tags.find((t: any[]) => t[0] === "settings");

  const fields = event.tags
    .filter((t: any[]) => t[0] === "field")
    .map(normalizeField);

  const fieldMap: Record<string, NormalizedField> = {};
  const fieldOrder: string[] = [];
  for (const field of fields) {
    fieldMap[field.id] = field;
    fieldOrder.push(field.id);
  }

  let settings = {};
  if (settingsTag) {
    try {
      settings = JSON.parse(settingsTag[1]);
    } catch {}
  }

  return {
    id: formIdTag?.[1] || "",
    pubkey: event.pubkey,
    name: nameTag?.[1] || "",
    settings,
    fields: fieldMap,
    fieldOrder,
  };
}

function normalizeField(tag: any[]): NormalizedField {
  const [_, id, type, labelHtml, optionsRaw, configRaw] = tag;
  let options: NormalizedOption[] | undefined;

  if (type === "option" && optionsRaw) {
    try {
      const parsed = JSON.parse(optionsRaw);
      options = parsed.map((o: any[]) => ({ id: o[0], labelHtml: o[1] }));
    } catch {
      options = [];
    }
  }

  let config = {};
  if (configRaw) {
    try {
      config = JSON.parse(configRaw);
    } catch {}
  }

  return {
    id,
    type,
    labelHtml,
    options,
    config,
  };
}
