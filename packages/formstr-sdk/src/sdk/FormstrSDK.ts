import {
  Field,
  FieldConfig,
  FormBlock,
  FormSettings,
  NormalizedField,
  NormalizedForm,
  SectionBlock,
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
    const idTag = raw.find((t) => t[0] === "d");
    const nameTag = raw.find((t) => t[0] === "name");
    const settingsTag = raw.find((t) => t[0] === "settings");

    const formSettings: FormSettings = settingsTag
      ? JSON.parse(settingsTag[1])
      : {};

    const fields: Record<string, NormalizedField> = {};
    const fieldOrder: string[] = [];

    raw
      .filter((t) => t[0] === "field")
      .forEach((t) => {
        const [_, fieldId, type, label, optionsStr, configStr] = t;

        fields[fieldId] = {
          id: fieldId,
          type,
          labelHtml: label,
          options: optionsStr
            ? JSON.parse(optionsStr).map((o: any[]) => ({
                id: o[0],
                labelHtml: stripHtml(o[1]),
                config: o[2] ? JSON.parse(o[2]) : undefined,
              }))
            : undefined,
          config: configStr ? JSON.parse(configStr) : {},
        };

        fieldOrder.push(fieldId);
      });

    const blocks: FormBlock[] = [];

    // Intro block (optional)
    if (nameTag || formSettings.description) {
      blocks.push({
        type: "intro",
        title: stripHtml(nameTag?.[1]),
        description: stripHtml(formSettings.description),
      });
    }

    // Section blocks
    if (formSettings.sections?.length) {
      blocks.push(
        ...[...formSettings.sections]
          .sort((a, b) => a.order - b.order)
          .map(
            (s): SectionBlock => ({
              type: "section",
              id: s.id,
              title: s.title,
              description: s.description,
              questionIds: s.questionIds,
              order: s.order,
            }),
          ),
      );
    } else {
      // Fallback: single implicit section
      blocks.push({
        type: "section",
        id: "default",
        title: undefined,
        description: undefined,
        questionIds: fieldOrder,
        order: 0,
      });
    }

    return {
      id: idTag?.[1] || "",
      blocks,
      name: stripHtml(nameTag?.[1]),
      fields,
      fieldOrder,
      settings: formSettings,
    };
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

    const renderBlock = (block: any) => {
      if (block.type === "intro") {
        return `
        <section class="form-section form-intro">
          ${block.title ? `<div class="form-name">${block.title}</div>` : ""}
          ${
            block.description
              ? `<div class="form-description">${block.description}</div>`
              : ""
          }
        </section>
      `;
      }

      if (block.type === "section") {
        return `
        <section class="form-section">
          ${block.title ? `<h2 class="section-title">${block.title}</h2>` : ""}
          ${
            block.description
              ? `<div class="section-description">${block.description}</div>`
              : ""
          }
          ${block.questionIds
            .map((id: string) => renderField(form.fields[id]))
            .join("\n")}
        </section>
      `;
      }

      return "";
    };

    const bodyHtml = form.blocks?.map(renderBlock).join("\n");

    form.html = {
      form: `
      <form id="form-${form.id}">
        ${bodyHtml}
        <button type="submit">Submit</button>
      </form>
    `,
    };

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
