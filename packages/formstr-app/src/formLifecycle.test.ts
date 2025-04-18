import { Event, SimplePool, generateSecretKey, getPublicKey } from 'nostr-tools';
import { bytesToHex } from '@noble/hashes/utils';
import { createForm } from './nostr/createForm';
import { sendResponses } from './nostr/common';
import { fetchFormResponses } from './nostr/responses';
import { Response, Tag } from './nostr/types';

const TEST_RELAYS = ['wss://relay.damus.io/', 'wss://nos.lol'];
// timeout for relay operations
jest.setTimeout(30000); 

describe('Form Lifecycle Behavioral Test', () => {
  let pool: SimplePool;
  let formSecretKey: string;
  let formPublicKey: string;
  let formId: string;

  beforeAll(() => {
    pool = new SimplePool();
    const secretKeyBytes = generateSecretKey();
    formSecretKey = bytesToHex(secretKeyBytes);
    formPublicKey = getPublicKey(secretKeyBytes);
    formId = `test-form-${Date.now()}`;
  });

  afterAll(() => {
    if (pool) {
      pool.close(TEST_RELAYS);
    }
  });

  test('should publish a form, fetch it, submit responses, and verify visibility', async () => {
    const formTags: Tag[] = [
      ["d", formId],
      ["name", "Sanity Check Test Form"],
      ["field", "q1", "shortText", "What is your name?", "{}"],
      ["field", "q2", "paragraph", "Tell us about yourself", "{}"],
      ["settings", JSON.stringify({ public: true })]
    ];

    // Create and publish the form
    const result = await createForm(
      formTags,
      TEST_RELAYS,
      new Set<string>(), 
      new Set<string>(), 
      false, 
      (url: string) => console.log(`Form accepted by relay: ${url}`),
      formSecretKey
    );

    expect(result).toBeDefined();
    expect(result.acceptedRelays).toBeDefined();
    expect(Array.isArray(result.acceptedRelays)).toBe(true);
    expect(result.acceptedRelays.length).toBeGreaterThan(0);

    // Wait for form to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify we can find the published form
    let formFound = false;
    await new Promise<void>((resolve) => {
      const sub = pool.subscribeMany(
        TEST_RELAYS,
        [{ kinds: [30168], authors: [formPublicKey] }],
        {
          onevent: (event) => {
            if (event.pubkey === formPublicKey &&
                event.tags.some(tag => tag[0] === "d" && tag[1] === formId)) {
              formFound = true;
              sub.close();
              if (timeoutId) clearTimeout(timeoutId);
              resolve();
            }
          }
        }
      );

      // timeout to resolve if form isn't found
      const timeoutId = setTimeout(() => {
        sub.close();
        resolve();
      }, 5000);
    });

    expect(formFound).toBe(true);

    // Submit responses
    const responderSecretKey = generateSecretKey();
    const responses: Response[] = [
      ["response", "q1", "Test User", ""],
      ["response", "q2", "This is a test response for the sanity check.", ""]
    ];

    // Submit the responses
    const sendResult = await sendResponses(
      formPublicKey,
      formId,
      responses,
      responderSecretKey,
      false,
      TEST_RELAYS,
      (url: string) => console.log(`Response accepted by relay: ${url}`)
    );

    // Allow time for response to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for responses
    let responseReceived = false;
    await new Promise<void>((resolve) => {
      const closer = fetchFormResponses(
        formPublicKey,
        formId,
        pool,
        (event: Event) => {
          if (event.tags.some(tag =>
              tag[0] === "a" &&
              tag[1] === `30168:${formPublicKey}:${formId}`)) {
            responseReceived = true;
            closer.close();
            if (timeoutId) clearTimeout(timeoutId);
            resolve();
          }
        },
        undefined,
        TEST_RELAYS
      );

      // timeout to resolve if no responses found
      const timeoutId = setTimeout(() => {
        closer.close();
        resolve();
      }, 5000);
    });

    expect(responseReceived).toBe(true);
  });
});