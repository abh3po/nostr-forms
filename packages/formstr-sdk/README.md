# Formstr SDK 📦

A lightweight JavaScript SDK for fetching, rendering, and submitting Nostr forms compatible with NIP-101.

Designed for developers who want to embed dynamic, relay-hosted forms into web apps with minimal setup.

## Features

NIP-101 compatible form fetching via naddr

Automatic normalization of Nostr form events

HTML form rendering (framework-agnostic)

Built-in submit handling using FormData

Nostr-native responses (kind 1069)

Ephemeral signer by default, pluggable custom signer

## Installation

Node / Bundlers

```
npm install @formstr/sdk
```

### or

```
yarn add @formstr/sdk
```

Browser (CDN, no build step)

<script type="module">
  import { FormstrSDK } from "https://cdn.jsdelivr.net/npm/@formstr/sdk/dist/main.js";
</script>

## What is naddr?

Formstr uses Nostr address pointers (naddr) as defined in NIP-19.

A valid naddr:

references a kind 30168 event (NIP-101 form)

encodes:

```
kind

pubkey

d tag (form identifier)
```

optional relays

(Users will copy a real one from a client or relay, not hand-write this.)

🚀 Basic Usage (Browser, ESM)

```html
<!doctype html>
<html>
  <body>
    <div id="form-container"></div>

    <script type="module">
      import { FormstrSDK } from "https://cdn.jsdelivr.net/npm/@formstr/sdk/dist/main.js";

      const sdk = new FormstrSDK();

      const form = await sdk.fetchForm(
        "naddr1...", // valid NIP-19 naddr
      );

      sdk.renderHtml(form);
      document.getElementById("form-container").innerHTML = form.html.form;

      sdk.attachSubmitListener(form, async (event) => {
        // Sign the Nostr event (kind 1069)
        return signedEvent;
      });
    </script>
  </body>
</html>
```

## Core Types

```
NormalizedForm
{
id: string;
name?: string;
blocks: FormBlock[];
fields: Record<string, NormalizedField>;
fieldOrder: string[];
settings: FormSettings;
relays: string[];
pubkey: string;
html?: {
form: string;
};
}

NormalizedField
{
id: string;
type: "text" | "option" | "label";
labelHtml: string;
options?: {
id: string;
labelHtml: string;
config?: object;
}[];
config: object;
}
```

## Submission Model

Responses are published as Nostr events

Event kind: 1069

Tagged with:

```
["a", "30168:<form_pubkey>:<form_id>"]
["response", "<field_id>", "<value>", "{}"]
```

Default Signer

If no signer is provided:

an ephemeral keypair is generated

responses are still valid, but anonymous

## Styling

Generated HTML uses stable CSS classes:

Class Purpose
.form-name Form title
.form-description Form description
.form-section Section wrapper
.section-title Section heading
.option-group Radio groups

Override freely in your own CSS.

📄 License

MIT

🔗 References

NIP-101

NIP-19
