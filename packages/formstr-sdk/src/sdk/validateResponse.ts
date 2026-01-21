import type { NormalizedForm, ResponseSubmission } from "./types";

export function validateResponse(
  form: NormalizedForm,
  values: ResponseSubmission,
) {
  for (const id of form.fieldOrder) {
    const field = form.fields[id];
    if (field.config.required && !values[id]) {
      throw new Error(`Required field missing: ${id}`);
    }
  }
  return true;
}
