import { Tag } from "../../../nostr/types";
import { IFormSettings } from "../../CreateFormNew/components/FormSettings/types";

export const getFormSettings = (formTemplate: Tag[]): IFormSettings | null => {
  const settingsTag = formTemplate.find((t) => t[0] === "settings");
  if (!settingsTag) return null;
  try {
    return JSON.parse(settingsTag[1] || "{}") as IFormSettings;
  } catch (err) {
    console.error("Failed to parse form settings", err);
    return null;
  }
};
