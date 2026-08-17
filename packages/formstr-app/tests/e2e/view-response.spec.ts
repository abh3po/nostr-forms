import { test, expect, Page, BrowserContext } from "@playwright/test";
import { gotoBuilder, publishAndGetUrls } from "./helpers";

/**
 * End-to-end coverage for the response permalink viewer at /view/:nevent.
 *
 * `buildResponsePermalink` (run after a successful submit) emits a capability
 * URL pointing at /view/:nevent, with the anonymous responder's ephemeral
 * secret in the #nkeys hash. The viewer decodes the nevent, fetches the kind
 * 1069 by id, recovers the form author + id from its `a` tag, fetches the form
 * template for labels, and decrypts the response with
 * ECDH(responderSecret, formAuthorPub) — the symmetric NIP-44 path.
 *
 * Two cases:
 *   1. The submitter reopens their own link (the same browser context that
 *      made the submission).
 *   2. A fresh context with no localStorage — the only thing it can decrypt
 *      with is the secret embedded in the link, so this is the real
 *      "anyone with the link" anonymous capability path.
 *
 * Both assert the unique answer makes the full round-trip: published, read
 * back by id, and decrypted for display.
 */

const uniqueAnswer = `e2e-view-${Date.now()}`;

async function addShortAnswerQuestion(page: Page) {
  const shortAnswer = page.getByRole("menuitem", { name: /Short answer/ });
  if (!(await shortAnswer.isVisible())) {
    await page.getByRole("button", { name: "+" }).first().click();
  }
  await shortAnswer.click();
}

/** Submit an anonymous response and read the permalink shown on the thank-you
 * screen. Returns the full permalink (origin + /view/:nevent + #nkeys…). */
async function submitAndReadPermalink(page: Page, fillUrl: string) {
  await page.goto(fillUrl);
  const answerInput = page.getByRole("textbox").first();
  await expect(answerInput).toBeVisible({ timeout: 20_000 });
  await answerInput.fill(uniqueAnswer);
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByAltText("Thank you")).toBeVisible({ timeout: 20_000 });

  // The thank-you screen renders the permalink as a real <a> link whose visible
  // text is the (truncated) URL; match on the /view/ path segment.
  const permalinkLink = page.getByRole("link", { name: /\/view\// });
  await expect(permalinkLink).toBeVisible({ timeout: 10_000 });
  const permalink = await permalinkLink.getAttribute("href");
  expect(
    permalink,
    "permalink should be present on thank-you screen",
  ).toBeTruthy();
  // Anonymous submissions embed the responder secret in the hash.
  expect(permalink!).toContain("#nkeys");
  return permalink!;
}

test("submitting a form produces a permalink that reopens the response", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });

  // 1. Build + publish a one-question form.
  await gotoBuilder(page);
  await addShortAnswerQuestion(page);
  const { fillUrl } = await publishAndGetUrls(page);

  // 2. Submit anonymously and grab the permalink from the thank-you screen.
  const permalink = await submitAndReadPermalink(page, fillUrl);

  // 3. Open the permalink. The viewer fetches the 1069 by id from the relays
  //    encoded in the nevent and decrypts it with the embedded secret.
  await page.goto(permalink);
  await expect(
    page.getByRole("heading", { name: "Your Response" }),
  ).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(uniqueAnswer, { exact: false })).toBeVisible({
    timeout: 20_000,
  });
});

test("the permalink works in a fresh context with no stored credentials", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });

  // 1. Build + publish + submit in the primary context, capturing the permalink.
  await gotoBuilder(page);
  await addShortAnswerQuestion(page);
  const { fillUrl } = await publishAndGetUrls(page);
  const permalink = await submitAndReadPermalink(page, fillUrl);

  // 2. Open the SAME permalink in a brand-new incognito context — no localStorage,
  //    no account, nothing but the link. The embedded secret must be sufficient
  //    to decrypt the response (the "anyone with the link" capability promise).
  const freshContext: BrowserContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  try {
    await freshPage.goto(permalink);
    await expect(
      freshPage.getByRole("heading", { name: "Your Response" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      freshPage.getByText(uniqueAnswer, { exact: false }),
    ).toBeVisible({ timeout: 20_000 });
  } finally {
    await freshPage.close();
    await freshContext.close();
  }
});
