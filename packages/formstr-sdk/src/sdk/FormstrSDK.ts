import {
  Event,
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
} from "nostr-tools";
import {
  FormBlock,
  FormSettings,
  NormalizedField,
  NormalizedForm,
  SectionBlock,
  Tag,
} from "./types.js";
import { fetchFormTemplate } from "./utils/fetchFormTemplate.js";
import { stripHtml } from "./utils/helper.js";
import { encodeNKeys } from "./utils/nkeys.js";
import { pool } from "./pool.js";

export class FormstrSDK {
  /** Fetch a form via NIP-101 naddr */

  //Discouraged use, will completely move to NKeys once app migrates.
  async fetchFormWithViewKey(
    naddr: string,
    viewKey: string,
  ): Promise<NormalizedForm> {
    const nkeys = encodeNKeys({ viewKey });
    return await this.fetchForm(naddr, nkeys);
  }

  attachSubmitListener(
    form: NormalizedForm,
    signer?: (event: any) => Promise<any>,
  ) {
    const formEl = document.getElementById(
      `form-${form.id}`,
    ) as HTMLFormElement;
    if (!formEl)
      return console.warn(`[FormstrSDK] Form element not found: ${form.id}`);

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault(); // prevent page reload

      // Collect form values
      const formData = new FormData(formEl);
      const values: Record<string, any> = {};
      formData.forEach((v, k) => (values[k] = v));

      console.log(`[FormstrSDK] Submitting values:`, values);

      try {
        await this.submit(form, values, signer);
        console.log(`[FormstrSDK] Form submitted successfully!`);
      } catch (err) {
        console.error(`[FormstrSDK] Submit failed:`, err);
      }
    });
  }

  async fetchForm(naddr: string, nkeys?: string): Promise<NormalizedForm> {
    const rawForm = await fetchFormTemplate(naddr, nkeys);
    if (!rawForm) return this.normalizeForm([["name", "Form Not Found"]]);
    return this.normalizeForm(rawForm);
  }

  /** Normalize raw NIP-101 form tags into JS object */
  normalizeForm(raw: Tag[]): NormalizedForm {
    const idTag = raw.find((t) => t[0] === "d");
    const nameTag = raw.find((t) => t[0] === "name");
    const settingsTag = raw.find((t) => t[0] === "settings");
    const relaysTag = raw.filter((t) => t[0] === "relay");
    const relays = relaysTag?.map((r) => r[1]) || [];
    const pubkey = raw.find((t) => t[0] === "pubkey")?.[1] || "";
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
      relays,
      pubkey,
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

    // Neutral wrapper
    form.html = {
      form: `
    <form id="form-${form.id}">
      <div class="form-body">
        ${bodyHtml}
      </div>
      <div id="submit-container">
        <button type="submit" id="form-submit-${form.id}">Submit</button>
      </div>
    </form>
  `,
    };

    return form;
  }

  /** Submit response back to relays */
  async submit(
    form: NormalizedForm,
    values: Record<string, any>,
    signer?: (event: EventTemplate) => Promise<Event>,
  ) {
    const finalSigner = signer ?? createEphemeralSigner();
    const tags = Object.entries(values).map(([fieldId, value]) => {
      if (Array.isArray(value)) value = value.join(";"); // multi-choice
      return ["response", fieldId, value, "{}"];
    });

    const event = {
      kind: 1069,
      content: "",
      tags: [["a", `30168:${form.pubkey}:${form.id}`], ...tags],
      created_at: Math.floor(Date.now() / 1000),
    };
    console.log(
      `submitting response, ${JSON.stringify(event)} to relays`,
      form.relays,
    );
    const signed = await finalSigner(event);
    await Promise.allSettled(pool.publish(form.relays, signed));
  }
}
export function createEphemeralSigner() {
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);

  return async (event: EventTemplate) => {
    return finalizeEvent(
      {
        ...event,
      },
      sk,
    );
  };
}
