import { test, expect } from "@playwright/test";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { publishToLocalRelay, LOCAL_RELAY_URL } from "./helpers";

/**
 * Smoke test for the zap-gated (paid) form filler UI.
 *
 * A full Lightning round-trip can't run here — it would need a real LNURL-pay
 * endpoint and a wallet — so this test seeds a PUBLIC paid form template
 * (kind 30168 with `collectsPayments` + `paymentLud16` + `paymentAmountSats` in
 * its settings tag) directly on the local relay, opens it as a respondent, and
 * asserts the filler renders the zap-gated submit control: a "Pay <n> sats"
 * button in place of the normal Submit button. It deliberately does NOT click
 * the button (which would try to resolve the lud16 over the network).
 */

const PAYMENT_SATS = 1000;

test("a paid form shows the Pay button with the configured amount", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });

  // 1. Publish a public, zap-gated form template directly to the local relay.
  const authorSk = generateSecretKey();
  const authorPub = getPublicKey(authorSk);
  const formId = `paid-e2e-${Date.now()}`;
  const settings = {
    collectsPayments: true,
    paymentLud16: "test@wallet.example",
    paymentAmountSats: PAYMENT_SATS,
    contact: "test@example.com",
    formstrBranding: true,
  };

  await publishToLocalRelay(
    {
      kind: 30168,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["d", formId],
        ["name", "Paid E2E Form"],
        ["settings", JSON.stringify(settings)],
        // FormFields does JSON.parse on the field's options + config, so they
        // must be valid JSON (empty strings throw "Unexpected end of JSON input").
        ["field", "q1", "text", "What is your name?", "[]", '{"required":false}'],
        ["relay", LOCAL_RELAY_URL],
      ],
      content: "",
    },
    authorSk,
  );

  // 2. Open it as a respondent via its naddr (relays folded in for the read).
  const naddr = nip19.naddrEncode({
    identifier: formId,
    pubkey: authorPub,
    kind: 30168,
    relays: [LOCAL_RELAY_URL],
  });
  await page.goto(`/f/${naddr}`);

  // 3. The form renders its question, and the submit control is the zap-gated
  //    "Pay <amount> sats" button rather than the normal "Submit".
  await expect(
    page.getByText("What is your name?", { exact: false }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("button", { name: `Pay ${PAYMENT_SATS} sats` }),
  ).toBeVisible({ timeout: 10_000 });
});
