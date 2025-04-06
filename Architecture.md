#  Architecture – Formstr on Nostr

## Overview

Formstr is a decentralized form creation and submission platform built on the [Nostr Protocol](https://github.com/nostr-protocol/nostr). It leverages Nostr events and public key infrastructure to handle creation, sharing, and response collection for forms.

---

##  Core Concepts

- **Forms** are stored as Nostr events.
- **Responses** to forms are also Nostr events, linked by a unique form ID.
- Each user is identified by their **Nostr public key**.
- Formstr uses **NIP-07** for authentication via browser extensions.

---

##  Architecture Components

### 1. Web App (`@formstr/web-app`)

- React-based frontend
- Allows users to:
  - Create forms
  - View and fill forms
  - View response analytics
- Communicates with the SDK to read/write to Nostr

### 2. SDK (`@formstr/sdk`)

- Handles:
  - Form creation (publishing form metadata as Nostr events)
  - Response submission
  - Fetching events by form ID or author pubkey
- Manages event signatures and validation

### 3. Nostr Protocol

- Used for all data transport and storage
- Events are signed using the user's private key (NIP-07 compliant)
- Forms and responses are both stored as `kind=30023` or custom kinds
- Uses relays to propagate events across the network

---

##  Workflow

###  Form Creation

1. User fills out form fields using the UI
2. SDK constructs a Nostr event with:
   - `kind`: custom (e.g. 30023)
   - `content`: JSON representing the form schema
   - `tags`: metadata (e.g., `["d", "form_id"]`)
3. Event is signed and published using NIP-07
4. Form is now live on Nostr

###  Response Submission

1. User fills out the live form
2. SDK constructs a new Nostr event:
   - References the original form ID in `tags`
   - Includes filled values in `content`
3. Signed with the respondent's pubkey and published

###  Fetching Forms/Responses

- To fetch a form:
  - Query Nostr relays using `kind` and `pubkey` or `form_id`
- To fetch responses:
  - Query events that tag the form ID
  - Filter by `kind`, `pubkey`, or timestamp

---

##  Formstr Event Specification

### Form Event


```json
{
  "kind": 30023,
  "content": "{\"title\":\"Survey 1\",\"fields\":[{\"label\":\"Name\",\"type\":\"text\"}]}",
  "tags": [["d", "form:123"], ["type", "form"]],
  "pubkey": "<creator_pubkey>"
}
```

### Response Event

```json
{
  "kind": 30024,
  "content": "{\"Name\":\"Rahul\"}",
  "tags": [["e", "<form_event_id>"], ["type", "response"]],
  "pubkey": "<responder_pubkey>"
}
```
### Contact
For clarifications, reach out to [https://github.com/abh3po](@abh3po)