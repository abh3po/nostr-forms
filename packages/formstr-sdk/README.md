# Formstr SDK – Usage Guide

Formstr SDK allows you to fetch, render, and submit NIP-101 forms stored on Nostr.
It handles normalization, HTML rendering, signing, and publishing responses to relays.

## Installation

### Browser (CDN)

<script src="https://cdn.jsdelivr.net/npm/@formstr/sdk@0/dist/formstr.bundle.js"></script>

const sdk = new FormstrSDK.FormstrSDK();

### Bundlers / ESM

import { FormstrSDK } from "@formstr/sdk";

const sdk = new FormstrSDK();

## Core Concepts

Forms are Nostr events containing tags such as:

```
field

settings

relay

pubkey

d (form identifier)
```

The SDK fetches and normalizes these tags into a usable JavaScript object.

### NormalizedForm

All SDK operations revolve around the NormalizedForm object:

```
interface NormalizedForm {
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
```

## Fetching a Form

### Fetch a Public Form

const form = await sdk.fetchForm(naddr);

Fetches the NIP-101 event

Normalizes tags into a NormalizedForm

Returns a fallback form if not found

### Fetch with View Key

```
const form = await sdk.fetchFormWithViewKey(naddr, viewKey);
```

## Rendering a Form

### Generate HTML

```
sdk.renderHtml(form);
```

This adds a rendered HTML string to:

```
form.html.form
```

### Mount to the DOM

```
document.getElementById("formstr-container").innerHTML =
form.html.form;
```

The rendered output is neutral, unstyled HTML and can be styled freely.

## Supported Field Types

### Type Description

```
text Text input
option Radio group
label Static content / text block
```

## Handling Submissions

### Attach Submit Listener

```
sdk.attachSubmitListener(form);
```

This:

Listens for <form> submit

Collects values using FormData

Signs the response event

Publishes to form relays

With Callbacks

```
sdk.attachSubmitListener(form, undefined, {
onSuccess: ({ event, relays }) => {
console.log("Submitted", event);
},
onError: (err) => {
console.error(err);
},
});
```

## Manual Submission (No HTML)

You may submit responses programmatically:

```
await sdk.submit(form, {
name: "Alice",
feedback: "Great form!",
});
```

Signing Responses
Default: Ephemeral Signer

If no signer is provided, the SDK automatically:

Generates a temporary keypair

Signs locally

Publishes anonymously

```
await sdk.submit(form, values);

Custom Signer (e.g. NIP-07)
const signer = async (event) => {
return await window.nostr.signEvent(event);
};
sdk.attachSubmitListener(form, signer);
```

Or:

```
await sdk.submit(form, values, signer);
```

Events Published

Form responses are published as Nostr events:

```
{
kind: 1069,
tags: [
["a", "30168:<formPubkey>:<formId>"],
["response", "<fieldId>", "<value>", "{}"]
]
}
```

One response tag per field

Published to all relays specified in the form

## Relays

Relay URLs are defined in the form event itself:

```
form.relays;
```

All submissions are published to these relays using a relay pool.

Full Minimal Example

```
<div id="formstr-container"></div>

<script>
  const sdk = new FormstrSDK.FormstrSDK();

  async function mountForm() {
    const form = await sdk.fetchForm(naddr);
    sdk.renderHtml(form);

    document.getElementById("formstr-container").innerHTML =
      form.html.form;

    sdk.attachSubmitListener(form);
  }

  mountForm();
</script>
```

## Styling & CSS Customization

The Formstr SDK renders neutral, unopinionated HTML and exposes semantic CSS class names so you can fully control the appearance of forms.

No styles are bundled by default.

Top-Level Structure

```
<form id="form-<formId>">
  <div class="form-body">
    <!-- blocks -->
  </div>

  <div id="submit-container">
    <button type="submit">Submit</button>
  </div>
</form>
```

### Form Container Selectors

```
form : Root <form> element

.form-body:	Wraps all form content

#submit-container: 	Container for submit button

button[type="submit"]: 	Submit button
Intro Block
```

Rendered when the form has a name or description.

```
<section class="form-section form-intro">
  <div class="form-name">Form Title</div>
  <div class="form-description">Form description</div>
</section>
```

### Selector Description

```
.form-section	Base class for all blocks
.form-intro	Intro block wrapper
.form-name	Form title
.form-description	Form description
```

### Section Blocks

Each logical section of the form:

```
<section class="form-section">
  <h2 class="section-title">Section Title</h2>
  <div class="section-description">Section description</div>

  <!-- fields -->
</section>
```

### Selector Description

.form-section: Section container
.section-title: Section heading
.section-description: Section subtext

### Text Fields

```
<label>Question label</label>
<input type="text" name="field_id" />
```

You can target these with:

```
.form-section label { }
.form-section input[type="text"] { }
```

### Option Fields (Radio Groups)

```
<div class="option-group">
  <div class="option-label">Question</div>

  <label>
    <input type="radio" name="field_id" value="opt1" />
    Option label
  </label>
</div>
```

### Selector Description

```
.option-group Radio group wrapper
.option-label Group label
input[type="radio"] Radio inputs
Label / Static Content
```

Static text Rendered directly inside sections and can be styled with:

```
.form-section p { }
```

Example Styling

```
.form-section {
margin-bottom: 2rem;
}

.form-name {
font-size: 2rem;
font-weight: bold;
}

.section-title {
font-size: 1.25rem;
margin-bottom: 0.5rem;
}

input[type="text"] {
width: 100%;
padding: 0.5rem;
}

.option-group label {
display: block;
margin: 0.25rem 0;
}

button[type="submit"] {
padding: 0.75rem 1.5rem;
font-weight: bold;
}
```

## Notes & Guarantees

Class names are stable and safe to rely on

No inline styles are applied

No CSS resets are included

You may safely override everything

The SDK does not manipulate styles at runtime

Custom Layouts

If deeper customization is required:

Skip renderHtml()

Use form.blocks and form.fields

Render your own markup in React, Vue, Svelte, etc.

## Advanced Usage

Custom UI: Ignore renderHtml and build your own UI from form.blocks

Validation: Add custom validation before calling submit

Multi-step Forms: Render sections incrementally using form.blocks
