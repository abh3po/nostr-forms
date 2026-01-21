# Formstr SDK 📦

A lightweight SDK for creating, rendering, and submitting Nostr-forms with NIP-101 compatibility. Built for developers who want to integrate dynamic forms into their Nostr-based applications.

---

## 📌 Key Features

- **NIP-101 Form Support**: Fetch and render forms using `naddr` identifiers
- **HTML Rendering**: Auto-generates semantic HTML with customizable CSS classes
- **Validation Framework**: Built-in field validation through `FieldConfig`
- **Response Submission**: Sign and submit form responses via Nostr relays
- **Modular Architecture**: Clean separation of form normalization, rendering, and submission

---

## 🧰 Getting Started

### 1. Install

```bash
npm install @formstr/sdk
# or
yarn add @formstr/sdk
```

### 2. Basic Usage

```html
<!-- example.html -->
<!doctype html>
<html>
  <head>
    <style>
      /* Override default styles */
      .form-name {
        color: #2563eb;
        font-size: 24px;
      }
      .option-group {
        border: 1px solid #e5e7eb;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <div id="form-container"></div>

    <script type="module">
      import { FormstrSDK } from "@formstr/sdk";

      const sdk = new FormstrSDK();

      // Fetch and render form
      sdk
        .fetchForm("nip101:30168:example-form-id:example-form-id")
        .then((form) => {
          const html = sdk.renderHtml(form);
          document.getElementById("form-container").innerHTML = html.form;

          // Handle submission
          html.attachSubmit((values) => {
            console.log("Form submitted with:", values);
            // Implement your signer here
            sdk.submit(form, values, async (event) => {
              // Sign event with your Nostr key
              return signedEvent;
            });
          });
        });
    </script>
  </body>
</html>
```

---

## 🧱 Core Objects

### `NormalizedForm`

```ts
{
  id: string;
  name: string;
  description?: string;
  fields: Record<string, NormalizedField>;
  sections?: SectionData[];
  settings: FormSettings;
}
```

### `NormalizedField`

```ts
{
  id: string;
  type: 'text' | 'option' | 'label' | ...;
  labelHtml: string;
  options?: NormalizedOption[];
  config: FieldConfig;
}
```

### `FieldConfig`

```ts
{
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  multiple?: boolean;
}
```

### `FormSettings`

```ts
{
  description?: string;
  encryptForm?: boolean;
  viewKeyInUrl?: boolean;
  sections?: SectionData[];
}
```

---

## 🎨 Customizable CSS Classes

| Element          | Default Class       | Purpose                     |
| ---------------- | ------------------- | --------------------------- |
| Form Title       | `.form-name`        | Styles the form title       |
| Section Header   | `.section-title`    | Styles section headings     |
| Option Group     | `.option-group`     | Radio button groups         |
| Field Labels     | `.option-label`     | Option group labels         |
| Form Description | `.form-description` | Form-level description text |
| Sections         | `.form-section`     | Container for form sections |

**Override these classes in your CSS to match your design system.**

---

## 📤 Submission Workflow

1. **Fetch** form with `sdk.fetchForm()`
2. **Render** HTML with `sdk.renderHtml()`
3. **Attach** submit handler with `attachSubmit()`
4. **Sign** and submit with `sdk.submit()`

```ts
submit(form, values, signer) {
  // signer must be async function that signs Nostr events
  // Example signer implementation:
  const signer = async (event) => {
    // Sign event with your Nostr key
    return signedEvent;
  };
}
```

---

## 📄 License

MIT License - See [LICENSE](https://github.com/your-org/nostr-forms/blob/main/LICENSE)

---

## 📚 Documentation

- [API Reference](docs/v1/design.md)
- [NIP-101 Specification](https://github.com/nostr-protocol/nips/blob/master/101.md)
