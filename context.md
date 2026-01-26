# Nostr Forms - Project Context

## What This Project Is

A comprehensive implementation of **NIP-101: Forms on Nostr**, providing both a full-featured web application for creating and managing forms, and an embeddable SDK for integrating Nostr forms into any website.

**Repository**: https://github.com/your-repo/nostr-forms
**NIP-101 PR**: https://github.com/nostr-protocol/nips/pull/1190
**Status**: NIP-101 is currently a pull request awaiting final review

---

## NIP-101 Specification (Complete)

### Overview

NIP-101 establishes a mechanism for implementing feedback systems on nostr, enabling users to create form templates and collect responses.

### Form Template (Kind 30168)

Forms are stored as parametrized replaceable events with this structure:

```json
{
  "kind": 30168,
  "content": "",
  "tags": [
    ["d", "<form identifier>"],
    ["name", "Form Name"],
    ["settings", "JSON settings object"],
    ["field", "fieldId", "inputType", "label", "options", "fieldSettings"]
  ],
  "pubkey": "<Author pubkey>"
}
```

#### Tag Specifications

**d tag**: Unique form identifier per user (makes event replaceable)

**name tag**: Display name of the form

**settings tag**: Global configuration as stringified JSON (styling, description, etc.)

**field tag structure**:
- Index 0: "field" (tag name)
- Index 1: FieldId (alphanumeric identifier)
- Index 2: InputType ("text", "option", or "label")
- Index 3: Label (field description/question text)
- Index 4: Options (stringified array for option types)
- Index 5: FieldSettings (metadata like "required", validation rules, or UI directives)

#### Supported Input Types

- **text**: Text input field
- **option**: Radio button or multiple choice field
- **label**: Static content/instructional text

#### Options Format

Options are stringified arrays: `["OptionId", "label", "optional config"]`

Example:
```json
["field", "q1", "option", "Choose your favorite",
 "[['opt1','Option 1'],['opt2','Option 2']]",
 "{\"required\":true}"]
```

### Responses (Kind 1069)

Responses attach to form templates via this structure:

```json
{
  "kind": 1069,
  "content": "",
  "tags": [
    ["a", "30168:<pubkey>:<formId>"],
    ["response", "fieldId", "responseValue", "metadata"]
  ],
  "pubkey": "Responder pubkey"
}
```

**Key Points**:
- Each field response gets its own `["response", ...]` tag
- For multi-choice fields, option IDs are delimited with semicolons (e.g., "opt1;opt2;opt3")
- The `a` tag links the response to the form template

### Access Control via NIP-59

Access is managed through gift-wrapped events containing encrypted keys.

#### Rumor (Kind 18)

```json
{
  "kind": 18,
  "tags": [
    ["key", "<view-key>", "<signing-key>"]
  ]
}
```

**View Key**: Encrypts/decrypts form content (allows viewing private forms)

**Signing Key**: Controls form editing capabilities (allows modifying form templates)

#### Wrap (Kind 1059)

Uses alias pubkeys derived from: `SHA256("30168:formAuthor:formId:userPub")`

This allows:
- Recipients to verify they have access without revealing the full recipient list
- Form authors to grant access without publicly exposing who has access

#### Encryption Method

Forms use **NIP-44 v2 encryption** with conversation keys derived from public keys and signing keys.

### Access Scenarios

**Public Forms/Responses**:
- Unencrypted tags
- Anyone can view and submit
- Signed by respective users

**Private Forms**:
- Form content encrypted with view-key
- Encrypted content stored in event.content field
- View-key shared via gift wrap to authorized users
- Tags array can track allowed responders via `p` tags

**Editable Responses**:
- Settings determine if responses can be modified
- When permitted, use latest timestamp event
- Otherwise, earliest timestamp preferred

**Group Edit Access**:
- Signing-key encrypted in key tags
- Distributed to designated editors via gift wraps
- Editors can update the form template

### Response Editability

The form settings determine if responses can be modified. Latest-timestamp events render edited responses; earliest timestamps preferred otherwise.

### Querying

**Form templates**:
```javascript
{ kinds: [30168], authors: [formAuthorPubkey], "#d": [formId] }
```

**Responses**:
```javascript
{ kinds: [1069], "#a": [`30168:${pubkey}:${formId}`], authors: [allowedPubkeys] }
```

### Key Tradeoffs & Design Decisions

- **Alias pubkeys** provide no built-in notifications unless users anticipate access
- **Alias pubkeys** allow verification of access but prevent determining all recipients
- **Form authors** retain knowledge of response authorship despite encryption mechanisms
- **Tag-based structure** (not JSON schemas) makes adoption easier for developers
- **Cryptographic key management** instead of passwords leverages existing Nostr tooling

### Related NIPs

- **NIP-17**: Gift Wraps for encrypted key distribution
- **NIP-44**: v2 encryption standard
- **NIP-59**: Gift-wrapped events (seals and wraps)
- **NIP-19**: Event encoding (naddr format)
- **NIP-88**: Voting/polling (separate from forms)

---

## Project Architecture

### Monorepo Structure

This is a **Yarn monorepo** with two main packages:

```
nostr-forms/
├── packages/
│   ├── formstr-sdk/          # SDK for embedding forms in any website
│   └── formstr-app/          # Full-featured web application
├── package.json              # Root workspace configuration
└── yarn.lock                 # Dependency lock file
```

### Tech Stack

#### Core Technologies
- **Language**: TypeScript 5.2.2
- **Frontend**: React 18 with React Router DOM
- **Build Tools**:
  - Webpack (web app bundling)
  - Rollup (SDK bundling for browser)
  - Babel (transpilation)
  - TypeScript compiler
- **Styling**:
  - Tailwind CSS
  - Styled Components
  - Ant Design (antd v5.11.2)
- **Nostr Protocol**:
  - `nostr-tools` v2.3.2 (SDK)
  - `nostr-tools` v2.16.2 (app)
- **Encryption**:
  - NIP-44 v2 encryption
  - AES-JS for additional cryptography
- **Testing**: Jest with ts-jest
- **Utilities**:
  - Bech32 encoding/decoding
  - SHA256 hashing
  - dayjs for date/time

#### NIP Standards Implemented
- **NIP-07**: Browser extension signer (Alby, nos2x, etc.)
- **NIP-46**: Remote signer (Bunker-based key management)
- **NIP-101**: Form template standard (Kind 30168 events)
- **NIP-19**: Event encoding (naddr, npub, nsec formats)
- **NIP-44**: Encrypted communication (v2)
- **NIP-04**: Deprecated encryption (legacy support only)
- **NIP-59**: Gift-wrapped events for access control

---

## SDK Implementation (formstr-sdk)

The SDK enables embedding NIP-101 forms anywhere on the web.

### Package Structure
```
formstr-sdk/
├── src/sdk/
│   ├── FormstrSDK.ts              # Main SDK class
│   ├── types.ts                   # TypeScript interfaces
│   ├── pool.ts                    # Nostr relay pool
│   ├── validateResponse.ts        # Response validation
│   └── utils/
│       ├── fetchFormTemplate.ts   # Fetch forms from relays
│       ├── helper.ts              # Utility functions
│       └── nkeys.ts               # NKeys TLV encoding/decoding
├── dist/                          # Compiled output
├── rollup.browser.config.js       # Browser bundle config
└── README.md                      # SDK documentation
```

### Core SDK API

```typescript
class FormstrSDK {
  // Fetch a form via NIP-19 naddr
  fetchForm(naddr: string, nkeys?: string): Promise<NormalizedForm>

  // Fetch with explicit view key
  fetchFormWithViewKey(naddr: string, viewKey: string): Promise<NormalizedForm>

  // Normalize raw event tags to JavaScript object
  normalizeForm(raw: Tag[]): NormalizedForm

  // Render form as HTML string
  renderHtml(form: NormalizedForm): NormalizedForm

  // Submit form responses
  submit(
    form: NormalizedForm,
    values: Record<string, any>,
    signer?: (event: EventTemplate) => Promise<Event>
  ): Promise<Event>

  // Attach DOM event listeners for submission
  attachSubmitListener(
    form: NormalizedForm,
    signer?: (event: any) => Promise<any>,
    callbacks?: {onSuccess?, onError?}
  ): void
}
```

### Form Fetching Flow

1. **Decode naddr** → Extract pubkey, form id, relays using NIP-19
2. **Query Relays** → Use SimplePool to fetch Kind 30168 events
3. **Decrypt if needed** → Use NIP-44 with view key from nkeys parameter
4. **Normalize Tags** → Convert event tags to NormalizedForm structure
5. **Return Object** → JavaScript-friendly form representation

### Form Submission Flow

1. **Collect Values** → Extract form data using FormData API
2. **Validate** → Check required fields and format
3. **Create Event** → Build Kind 1069 event with response tags
4. **Sign Event** → Use provided signer or ephemeral key
5. **Publish** → Send to all relays specified in form
6. **Return Signed Event** → For callback handling

### NKeys Encoding (Custom Protocol)

The SDK implements a custom **NKeys encoding format** for secure form access without exposing keys in URLs:

```typescript
// Encode view/edit keys for URL sharing
encodeNKeys({ viewKey: "hex..." }) → "nkeys1..." (bech32-encoded)

// Decode from URL parameter
decodeNKeys("nkeys1...") → { viewKey: "hex..." }
```

Uses **TLV (Tag-Length-Value)** encoding with bech32 wrapper for compact, URL-safe representation.

### Core Types

```typescript
interface NormalizedForm {
  id: string;
  name: string;
  pubkey: string;
  fields: Record<string, NormalizedField>;
  fieldOrder: string[];
  blocks?: FormBlock[];  // Intro + Sections
  settings: FormSettings;
  relays: string[];
}

type FormBlock = IntroBlock | SectionBlock;

interface NormalizedField {
  id: string;
  type: string;
  labelHtml: string;
  options?: NormalizedOption[];
  config: FieldConfig;
}

interface FormSettings {
  description?: string;
  allowMultipleResponses?: boolean;
  requiresLogin?: boolean;
  closesAt?: number;
  // ... other settings
}
```

### SDK Distribution

- **NPM**: `@formstr/sdk`
- **CDN**: jsDelivr (browser bundle via IIFE)
- Can be embedded in any website with a simple script tag

---

## Web Application Architecture (formstr-app)

React-based SPA for form creation, distribution, and response management.

### Directory Structure

```
formstr-app/src/
├── containers/              # Page-level components
│   ├── CreateFormNew/      # Form builder interface
│   ├── FormFillerNew/      # Form filling/rendering
│   ├── ResponsesNew/       # Response management & analytics
│   ├── Dashboard/          # User dashboard
│   ├── EditForm/           # Form editing
│   ├── PublicForms/        # Public forms discovery
│   └── Drafts/            # Draft management
├── components/            # Reusable React components
│   ├── Header/
│   ├── Sidebar/
│   ├── LoginModal/
│   ├── NIP07Interactions/
│   ├── FormBanner/
│   └── ... (other UI components)
├── nostr/                 # Nostr protocol utilities
│   ├── types.ts          # Type definitions (Field, Response, etc.)
│   ├── common.ts         # Event creation, signing, publishing
│   ├── createForm.ts     # Form creation logic
│   ├── accessControl.ts  # Permission management (NIP-13, NIP-44)
│   ├── responses.ts      # Response handling
│   └── utils.ts          # URL construction, encryption
├── signer/               # Signing implementations
│   ├── NIP07Signer.ts   # Browser extension integration
│   ├── NIP46Signer.ts   # Remote signer (Bunker)
│   ├── LocalSigner.ts   # Local key management
│   └── index.ts         # Signer manager
├── provider/            # React context providers
│   ├── ProfileProvider.tsx    # User profile context
│   ├── MyFormsProvider.tsx    # User's forms list
│   ├── ApplicationProvider.tsx
│   └── TemplateProvider.tsx
├── pool/                # Relay pool management
│   └── index.ts        # Nostr SimplePool
└── hooks/              # Custom React hooks
    ├── useProfileContext/
    ├── useApplicationContext/
    └── useNostrAuth/
```

### Key Components

#### FormFillerNew Container
- Renders form questions with section progression
- Handles field validation and submission
- Shows thank you screen after completion
- Converts form data to Kind 1069 response events

#### CreateFormNew Container
- Drag-and-drop form builder
- Field type selection (text, option, label)
- Settings configuration (encryption, relays, etc.)
- Access control assignment

#### ResponsesNew Container
- Display submitted responses
- Filter by respondent
- Export functionality
- Response decryption for private forms

### Signer Management

```typescript
class SignerManager {
  // Multi-method authentication
  async loginWithNip07()       // Browser extension
  async loginWithNip46(uri)    // Remote signer/Bunker
  async createGuestAccount()   // Local ephemeral key
  async loginWithGuestKey()    // Restore from localStorage

  async getSigner(): NostrSigner  // Get active signer
  onChange(callback)              // Subscribe to changes
}
```

**NIP-07 Signer**: Uses `window.nostr` API from browser extensions

**NIP-46 Signer**: Remote signing via Bunker URI (NIP-47 RPC)

**Local Signer**: Generates ephemeral keypairs, stores in localStorage

### MyFormsProvider Context

Manages user's created forms:

```typescript
type MyFormsContextValue = {
  formEvents: Map<string, FormEventMetadata>;
  refreshing: boolean;
  refreshForms: () => Promise<void>;
  deleteForm: (formId: string, formPubkey: string) => Promise<void>;
  saveToMyForms: (formAuthorPub, formAuthorSecret, formId,
                  relays, viewKey?, callback?) => Promise<void>;
  inMyForms: (formPubkey: string, formId: string) => boolean;
}
```

Stores form data in **Kind 14083** event for persistent "My Forms" list.

---

## How Forms Are Created, Stored, and Retrieved

### Creation Process

1. **Generate Keys**:
   - Form signing key (for updates to the form template)
   - View key (for encryption, optional)

2. **Build Event Tags**:
   ```javascript
   [
     ["d", formId],                              // Unique identifier
     ["name", formName],                         // Form title
     ["field", fieldId, type, label, opts, cfg], // Per field
     ["settings", JSON.stringify(settings)],     // Global config
     ["relay", relayUrl],                        // Per relay
     ["p", participantPubkey]                    // Per participant
   ]
   ```

3. **Optional Encryption** (for private forms):
   - Encrypt form content with view key (NIP-44)
   - Store encrypted data in event.content
   - Public forms leave content empty

4. **Permission Grants** (NIP-59 Gift Wraps):
   - Create Kind 18 rumor with view/edit keys
   - Seal and wrap for each recipient
   - Publish as Kind 1059 events
   - Recipients use alias pubkeys

5. **Publish Event**:
   - Kind: 30168 (Form Template - replaceable)
   - Sign with form's signing key
   - Publish to specified relays

### Storage on Nostr

**Form Template Event (Kind 30168)**:
```json
{
  "kind": 30168,
  "pubkey": "form-creator-pubkey",
  "content": "" OR "nip44-encrypted-tags",
  "tags": [
    ["d", "unique-form-id"],
    ["name", "Form Title"],
    ["field", "field1", "text", "Your Name", "{}", "{}"],
    ["field", "field2", "option", "Choose...",
     "[['opt1','Option 1'],[...]]", "{\"required\":true}"],
    ["settings", "{\"description\":\"...\"}"],
    ["relay", "wss://relay.damus.io/"],
    ["p", "recipient-pubkey"]
  ]
}
```

**My Forms List (Kind 14083)**:
```json
{
  "kind": 14083,
  "content": "encrypted-list",
  "tags": [
    ["d", "my-forms"],
    ["form", "formPubkey:formId", "relayUrl", "secretKey:viewKey"]
  ]
}
```

### Retrieval Process

1. **Fetch Form Template**:
   - Decode naddr to extract: pubkey, form id, relays
   - Query relays: `{kinds: [30168], authors: [pubkey], "#d": [formId]}`

2. **Decrypt if Needed**:
   - Extract view key from nkeys parameter or URL
   - Use NIP-44 to decrypt event.content
   - Parse decrypted JSON for tags

3. **Normalize**:
   - Convert tags to NormalizedForm object
   - Build form blocks (intro + sections)
   - Extract field information and ordering

4. **Access Control**:
   - Check public vs private status
   - Verify view key for encrypted forms
   - Check edit permissions for form editors

---

## Configuration

### Default Relays

```typescript
const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
];
```

### Event Kinds Used

| Kind | Purpose | Standard |
|------|---------|----------|
| 30168 | Form Template | NIP-101 (Replaceable) |
| 1069 | Form Response | NIP-101 |
| 14083 | My Forms List | Custom |
| 13 | Seals | NIP-59 |
| 1059 | Gift Wraps | NIP-59 |
| 18 | Access Grants | Custom |
| 4 | Encrypted Messages | NIP-04 (legacy) |

### Build & Deployment

**Development**:
```bash
yarn workspace @formstr/web-app start
```

**Production**:
```bash
yarn workspace @formstr/web-app build
yarn workspace @formstr/web-app deploy  # gh-pages
```

**SDK Build**:
```bash
yarn workspace @formstr/sdk build
```

---

## Data Flow

### Form Creation Flow
```
Form Builder → Generate Keys → Create Tags →
Encrypt (if private) → Grant Permissions (wraps) →
Sign Event → Publish to Relays
```

### Form Distribution Flow
```
User gets naddr → SDK fetches event →
Decrypt (if needed) → Normalize →
Render HTML → User fills form
```

### Response Submission Flow
```
User fills form → Collect data → Create Kind 1069 event →
Sign (with user's signer or ephemeral) →
Publish to form's relays → Callback with result
```

---

## Recent Architectural Changes

Based on commit history:

1. **"Rewrite SDK" (#410)** - Major SDK refactoring for standardized API
2. **"Embed with sdk" (#416)** - SDK can now be embedded via CDN
3. **"Save My Forms" (#412)** - Added persistent My Forms list (Kind 14083)
4. **"Add Warning on Response Urls" (#415)** - Security improvements for response handling
5. **"Fix Banner Gradient" (#411)** - UI improvements

---

## Key Design Decisions

### Why Tag-Based Structure?

Moved from JSON schemas to flatter tag-based approach for:
- Easier adoption by developers
- Better integration with Nostr's native tag system
- Simpler querying and filtering

### Why Cryptographic Keys Instead of Passwords?

- Leverages existing Nostr encryption tooling (NIP-44)
- More secure than password-based protection
- Enables fine-grained access control via gift wraps
- No need for password management/reset flows

### Why Alias Pubkeys?

- Recipients can verify access without exposing full recipient list
- Form authors maintain privacy of who has access
- Tradeoff: No built-in notifications (users must anticipate access)

### Why Separate SDK and App?

- **SDK**: Lightweight, embeddable, framework-agnostic
- **App**: Full-featured, opinionated, batteries-included
- Allows third-party sites to embed forms without running full app

---

## Important Notes for Development

### Security Considerations

- Always validate user input on form submissions
- Never expose signing keys in URLs or client-side storage
- Use NIP-44 v2 for encryption (NIP-04 is deprecated)
- Validate event signatures before processing responses

### Testing

- SDK tests use Jest
- Test form creation, fetching, normalization, and submission flows
- Mock Nostr relays for reliable testing

### Deployment

- Web app deployed via gh-pages
- SDK distributed via NPM and jsDelivr CDN
- No central backend - fully decentralized via Nostr relays

---

## Future Considerations

- **NIP-88 Integration**: Voting/polling features (removed from NIP-101)
- **Enhanced Analytics**: Response aggregation and visualization
- **Form Templates**: Pre-built form templates for common use cases
- **Conditional Logic**: Show/hide fields based on previous answers
- **File Uploads**: Support for file attachments in responses
- **Multi-page Forms**: Complex forms split across multiple pages

---

## Additional Resources

- NIP-101 PR: https://github.com/nostr-protocol/nips/pull/1190
- Nostr Tools: https://github.com/nbd-wtf/nostr-tools
- NIP-44 Spec: https://github.com/nostr-protocol/nips/blob/master/44.md
- NIP-59 Spec: https://github.com/nostr-protocol/nips/blob/master/59.md
