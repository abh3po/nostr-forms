import {
  Field,
  FieldConfig,
  FormSettings,
  NormalizedField,
  NormalizedForm,
  Tag,
} from "./types.js";
import { fetchFormTemplate } from "./utils/fetchFormTemplate.js";
import { getOrderedFieldIds, stripHtml } from "./utils/helper.js";

export class FormstrSDK {
  /** Fetch a form via NIP-101 naddr */
  async fetchForm(naddr: string, nkeys?: string): Promise<NormalizedForm> {
    const rawForm = await fetchFormTemplate(naddr, nkeys);
    if (!rawForm) return this.normalizeForm([["name", "Form Not Found"]]);
    console.log(
      "Got Raw form",
      rawForm,
      "normalized Form",
      this.normalizeForm(rawForm),
    );
    return this.normalizeForm(rawForm);
  }

  /** Normalize raw NIP-101 form tags into JS object */
  normalizeForm(raw: Tag[]): NormalizedForm {
    const idTag = raw.find((t: any[]) => t[0] === "d");
    const nameTag = raw.find((t: any[]) => t[0] === "name");
    const settingsTag = raw.find((t: any[]) => t[0] === "settings");
    const formSettings: FormSettings = settingsTag
      ? JSON.parse(settingsTag[1])
      : {};

    const fields: Record<string, NormalizedField> = {};
    const fieldOrder: string[] = [];

    raw
      .filter((t) => t[0] === "field")
      .forEach((t) => {
        const [_, fieldId, type, label, optionsStr, configStr] = t;

        const options = optionsStr
          ? JSON.parse(optionsStr).map((o: any[]) => ({
              id: o[0],
              labelHtml: o[1],
              config: o[2] ? JSON.parse(o[2]) : undefined,
            }))
          : undefined;

        const config: FieldConfig = configStr ? JSON.parse(configStr) : {};

        fields[fieldId] = {
          id: fieldId,
          type,
          labelHtml: label,
          options,
          config,
        };

        fieldOrder.push(fieldId);
      });

    const normalized: NormalizedForm = {
      id: idTag?.[1] || "",
      name: stripHtml(nameTag?.[1]),
      description: stripHtml(
        settingsTag ? JSON.parse(settingsTag[1]).description : "",
      ),
      fields,
      fieldOrder,
      sections: formSettings.sections,
      settings: formSettings,
    };

    return normalized;
  }

  /** Render HTML form with submit wired using FormData */
  renderHtml(form: NormalizedForm): NormalizedForm {
    const renderField = (field: NormalizedField) => {
      if (field.type === "text") {
        return `
        <label>${field.labelHtml}</label>
        <input type="text" name="${field.id}" />
      `;
      }

      if (field.type === "option" && field.options) {
        return `
        <div class="option-group">
          <div class="option-label">${field.labelHtml}</div>
          ${field.options
            .map(
              (opt) => `
              <label>
                <input type="radio" name="${field.id}" value="${opt.id}" />
                ${opt.labelHtml}
              </label>
            `,
            )
            .join("")}
        </div>
      `;
      }

      if (field.type === "label") {
        return `<p>${field.labelHtml}</p>`;
      }

      return "";
    };

    const bodyHtml =
      form.sections && form.sections.length
        ? [...form.sections]
            .sort((a, b) => a.order - b.order)
            .map(
              (section) => `
          <section class="form-section">
            <h2 class="section-title">${section.title}</h2>
            ${
              section.description
                ? `<div class="section-description">${section.description}</div>`
                : ""
            }
            ${section.questionIds
              .map((id) => renderField(form.fields[id]))
              .join("\n")}
          </section>
        `,
            )
            .join("\n")
        : getOrderedFieldIds(form)
            .map((id) => renderField(form.fields[id]))
            .join("\n");

    const formHtml = `
    <form id="form-${form.id}">
      <div class="form-name">${form.name}</div>
      <div class="form-description">${form.settings.description || ""}</div>
      ${bodyHtml}
      <button type="submit">Submit</button>
    </form>
  `;

    form.html = { form: formHtml };
    return form;
  }

  /** Submit response back to relays */
  async submit(
    form: NormalizedForm,
    values: Record<string, any>,
    signer: (event: any) => Promise<any>,
  ) {
    const tags = Object.entries(values).map(([fieldId, value]) => {
      if (Array.isArray(value)) value = value.join(";"); // multi-choice
      return ["response", fieldId, value, "{}"];
    });

    const event = {
      kind: 1069,
      content: "",
      tags: [["a", `30168:${form.id}:${form.id}`], ...tags],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: "", // signer will fill
    };

    const signed = await signer(event);
    // await sendResponseEvent(this.relays, signed);
  }
}
