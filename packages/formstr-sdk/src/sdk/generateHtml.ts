import type { NormalizedForm, NormalizedField } from "./types";

export function generateHtml(form: NormalizedForm) {
  const fieldsHtml = form.fieldOrder
    .map((id) => renderField(form.fields[id]))
    .join("\n");

  const html = `
    <form id="form-${form.id}">
      <h2>${form.name}</h2>
      ${fieldsHtml}
      <button type="submit">Submit</button>
    </form>
  `;

  return { form: html };
}

function renderField(field: NormalizedField): string {
  if (field.type === "label") return `<div>${field.labelHtml}</div>`;
  if (field.type === "text") {
    return `<label>${field.labelHtml}<input type="text" name="${field.id}" ${
      field.config.required ? "required" : ""
    }></label>`;
  }
  if (field.type === "option" && field.options) {
    const inputs = field.options
      .map(
        (opt) =>
          `<label><input type="radio" name="${field.id}" value="${opt.id}"> ${opt.labelHtml}</label>`,
      )
      .join("<br>");
    return `<fieldset>${field.labelHtml}<br>${inputs}</fieldset>`;
  }
  return "";
}
