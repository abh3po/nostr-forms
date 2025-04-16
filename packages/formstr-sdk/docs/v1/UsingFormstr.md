# Using Formstr via UI and SDK

This document covers how to create, fetch, and fill forms using the Formstr platform via both the UI and SDK.

---

## 1. Creating a Form

### 🖥️ Using the UI

1. Go to [https://formstr.app](https://formstr.app).
2. Connect your Nostr-compatible signer extension (e.g., NIP-07 extension).
3. Click on **"Create New Form"**.
4. Add your form fields using the builder interface.
5. Save and publish — your form is now available on the Nostr network.

### 💻 Using the SDK

```ts
import { createForm } from "@formstr/sdk";

const form = {
  title: "Feedback Form",
  description: "Collect feedback from users",
  fields: [
    {
      type: "text",
      label: "Name",
      required: true
    },
    {
      type: "email",
      label: "Email",
      required: false
    },
    {
      type: "textarea",
      label: "Feedback",
      required: true
    }
  ]
};

const result = await createForm(form, signer);
console.log("Form created:", result);
```

## 2. Fetching a Form

### 🖥️ Using the UI

- Navigate to the homepage or search bar.
- Enter the form ID or browse your existing forms.
- Click on the form title to open it and view the questions.

### 💻 Using the SDK

```ts
import { fetchForm } from "@formstr/sdk";

const formId = "<form_id_here>";
const form = await fetchForm(formId);
console.log("Fetched form:", form);
```
## 3. Form Filling and Validation Errors

### 🖥️ Using the UI

- Required fields are marked with a red asterisk (*).
- Real-time validation is performed (e.g., email format check).
- On submit, any missing required fields are highlighted.
- If all validations pass, the form is submitted to the Nostr network.

### 💻 Using the SDK

```ts
import { submitForm } from "@formstr/sdk";

const formId = "<form_id_here>";
const formData = {
  Name: "Rahul",
  Email: "rahul@example.com",
  Feedback: "Great platform!"
};

try {
  await submitForm(formId, formData, signer);
  console.log("Form submitted successfully");
} catch (error) {
  console.error("Validation or submission failed:", error.message);
}
