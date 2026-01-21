import { fetchFormTemplate } from "./utils/fetchFormTemplate.js";

export interface Field {
  id: string;
  type: string; // "text", "option", "label", etc
  label: string;
  options?: { id: string; label: string }[];
  settings?: Record<string, any>;
}

export interface NormalizedForm {
  id: string;
  name: string;
  description?: string;
  fields: Record<string, Field>;
  fieldOrder: string[];
  html?: {
    form: string;
    attachSubmit: (callback: (values: Record<string, any>) => void) => void;
  };
}

export class FormstrSDK {
  /** Fetch a form via NIP-101 naddr */
  async fetchForm(naddr: string, nkeys?: string): Promise<NormalizedForm> {
    const rawForm = await fetchFormTemplate(naddr, nkeys);
    console.log(
      "Got Raw form",
      rawForm,
      "normalized Form",
      this.normalizeForm(rawForm),
    );
    return this.normalizeForm(rawForm);
  }

  /** Normalize raw NIP-101 form tags into JS object */
  normalizeForm(raw: any): NormalizedForm {
    const idTag = raw.find((t: any[]) => t[0] === "d");
    const nameTag = raw.find((t: any[]) => t[0] === "name");
    const settingsTag = raw.find((t: any[]) => t[0] === "settings");

    const fields: Record<string, Field> = {};
    const fieldOrder: string[] = [];

    raw
      .filter((t: any[]) => t[0] === "field")
      .forEach((t: any[]) => {
        const [_, fieldId, type, label, optionsStr, settingsStr] = t;
        const options = optionsStr
          ? JSON.parse(optionsStr).map((o: any[]) => ({
              id: o[0],
              label: o[1],
            }))
          : undefined;
        const settings = settingsStr ? JSON.parse(settingsStr) : {};
        fields[fieldId] = { id: fieldId, type, label, options, settings };
        fieldOrder.push(fieldId);
      });

    const normalized: NormalizedForm = {
      id: idTag?.[1] || "",
      name: nameTag?.[1] || "",
      description: settingsTag ? JSON.parse(settingsTag[1]).description : "",
      fields,
      fieldOrder,
    };

    return normalized;
  }

  /** Render HTML form with submit wired using FormData */
  renderHtml(form: NormalizedForm): NormalizedForm {
    const fieldsHtml = form.fieldOrder
      .map((id) => {
        const field = form.fields[id];
        if (field.type === "text") {
          return `<label>${field.label}</label><input type="text" name="${id}" />`;
        }
        if (field.type === "option" && field.options) {
          return field.options
            .map(
              (opt) => `
          <label>
            <input type="radio" name="${id}" value="${opt.id}" /> ${opt.label}
          </label>
        `,
            )
            .join("<br/>");
        }
        if (field.type === "label") {
          return `<p>${field.label}</p>`;
        }
        return "";
      })
      .join("\n");

    const formHtml = `
      <form id="form-${form.id}">
        ${fieldsHtml}
        <button type="submit">Submit</button>
      </form>
      <script>
        (function() {
          const formEl = document.getElementById("form-${form.id}");
          formEl.addEventListener("submit", function(e) {
            e.preventDefault();
            const data = new FormData(formEl);
            const values = {};
            ${form.fieldOrder
              .map(
                (id) => `
              let val = data.getAll("${id}");
              if (val.length === 1) val = val[0];
              values["${id}"] = val;
            `,
              )
              .join("\n")}
            window.__formstr_submit_${form.id}?.(values);
          });
        })();
      </script>
    `;

    form.html = {
      form: formHtml,
      attachSubmit: (callback: (values: Record<string, any>) => void) => {
        (window as any)[`__formstr_submit_${form.id}`] = callback;
      },
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
