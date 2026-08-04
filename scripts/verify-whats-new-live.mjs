import fs from "node:fs";
import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectId = process.env.SUPABASE_PROJECT_ID?.trim();
const productionOrigin = (process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev").replace(/\/$/, "");
const screenshotPath = process.env.WHATS_NEW_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/whats-new-gable-proof.png`;
const auctionScreenshotPath = process.env.AUCTION_UI_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/auction-ui-release-proof.png`;

if (!accessToken || !projectId) {
  throw new Error("Live What's New verification requires Supabase project credentials.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readBody(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid JSON response." };
  }
}

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${stage}: HTTP ${response.status}; ${body?.message ?? body?.error ?? "request failed"}`);
  }
  return body;
}

const keys = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret" && item.disabled !== true)?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!publishableKey || !secretKey) throw new Error("Required Supabase project keys are unavailable.");

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `HQNEWS${suffix}`.slice(0, 24);
const authEmail = `hqnews-${suffix}@login.octagon-hq.app`;
const internalEmail = `hqnews-pin-${suffix}@login.octagon-hq.app`;
const password = `HealthCheck-${suffix}!Aa1`;
const pin = "4826";
let userId = "";
let browser;

try {
  const created = await request(
    "Disposable Auth user creation",
    `${supabaseOrigin}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      }),
    },
  );
  userId = created?.id ?? "";
  if (!userId) throw new Error("Disposable Auth user creation returned no user ID.");

  await request(
    "Disposable PIN profile registration",
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "H",
        p_internal_email: internalEmail,
        p_pin: pin,
      }),
    },
  );

  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const page = await context.newPage();
  const diagnostics = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      diagnostics.push(`console:${message.type()}: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("supabase.co")) {
      diagnostics.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
    }
  });

  await page.goto(`${productionOrigin}/whats-new?auction-release-proof=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByRole("heading", { name: "What's New", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "Sign in to Octagon HQ" }).click();
  await page.getByLabel("YOUR NAME").fill(displayName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(pin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();
  await page.getByRole("button", { name: `Open ${displayName} profile menu` })
    .waitFor({ state: "visible", timeout: 15_000 });

  const gableTitle = page.getByText("Gable Steveson added to Fighters to Watch", { exact: true });
  try {
    await gableTitle.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const body = await page.locator("body").innerText().catch(() => "");
    throw new Error([
      "The signed-in live What's New feed did not render Gable Steveson's automatic item.",
      `Visible feed text: ${body.slice(0, 1800)}`,
      ...diagnostics,
    ].join("\n"));
  }

  const gableLink = gableTitle.locator("xpath=ancestor::a[contains(@class,'whats-new-item')][1]");
  await gableLink.getByText("VIEW WATCHLIST", { exact: false }).waitFor({ state: "visible" });
  const gableHref = await gableLink.getAttribute("href");
  if (gableHref !== "/fighters-to-watch") {
    throw new Error(`Gable What's New item links to ${gableHref ?? "no route"}, expected /fighters-to-watch.`);
  }

  const auctionTitle = page.getByText("Auction is now playable", { exact: true });
  try {
    await auctionTitle.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const body = await page.locator("body").innerText().catch(() => "");
    throw new Error([
      "The signed-in live What's New feed did not render the canonical Auction release item.",
      `Visible feed text: ${body.slice(0, 2200)}`,
      ...diagnostics,
    ].join("\n"));
  }

  const auctionLink = auctionTitle.locator("xpath=ancestor::a[contains(@class,'whats-new-item')][1]");
  await auctionLink.getByText("PLAY AUCTION", { exact: false }).waitFor({ state: "visible" });
  const auctionHref = await auctionLink.getAttribute("href");
  if (auctionHref !== "/play/auction") {
    throw new Error(`Auction What's New item links to ${auctionHref ?? "no route"}, expected /play/auction.`);
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (!fs.existsSync(screenshotPath) || fs.statSync(screenshotPath).size < 5_000) {
    throw new Error("The signed-in What's New screenshot was not created correctly.");
  }

  await page.goto(`${productionOrigin}/play?auction-release-proof=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByRole("heading", { name: "Pick your debate", exact: true })
    .waitFor({ state: "visible", timeout: 15_000 });

  const gameCards = page.locator(".play-games__grid .play-game-card");
  if (await gameCards.count() !== 7) {
    throw new Error(`The live Play registry rendered ${await gameCards.count()} games, expected 7.`);
  }
  const firstGame = gameCards.first();
  const firstGameText = await firstGame.innerText();
  if (!firstGameText.includes("Auction") || !firstGameText.includes("$")) {
    throw new Error(`Auction is not the first live Play game with the approved icon. First card: ${firstGameText}`);
  }
  if (/\bNEW\b/i.test(firstGameText)) {
    throw new Error(`The live Auction game card incorrectly includes a NEW badge: ${firstGameText}`);
  }
  await firstGame.click();

  await page.getByRole("heading", { name: "Auction", exact: true })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.getByText("SEALED BID CHALLENGE", { exact: true }).waitFor({ state: "visible" });
  const auctionBody = await page.locator("body").innerText();
  if (/asynchronous/i.test(auctionBody)) {
    throw new Error("The live Auction setup still contains the removed asynchronous copy.");
  }

  const formatCards = page.locator(".auction-catalog li");
  if (await formatCards.count() !== 16) {
    throw new Error(`The live Auction setup rendered ${await formatCards.count()} formats, expected 16.`);
  }
  for (const tab of ["ALL", "FIGHTERS", "SKILLS", "PERFORMANCES", "UFC HISTORY"]) {
    await page.getByRole("button", { name: tab, exact: true }).waitFor({ state: "visible" });
  }

  const grapplersCard = formatCards.filter({ hasText: "Best Grapplers" });
  if (await grapplersCard.count() !== 1) {
    throw new Error("The live grouped Auction setup did not expose exactly one Best Grapplers format.");
  }
  await grapplersCard.getByRole("button").click();
  await page.getByRole("button", { name: /CHOOSE OPPONENT/ }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: /CHOOSE OPPONENT/ }).click();
  await page.getByRole("heading", { name: "Choose opponent", exact: true })
    .waitFor({ state: "visible", timeout: 10_000 });
  await page.getByText("SELECTED AUCTION", { exact: true }).waitFor({ state: "visible" });
  await page.getByText("Best Grapplers", { exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "← CHANGE FORMAT", exact: true }).waitFor({ state: "visible" });
  if (await page.locator(".auction-catalog").count() !== 0) {
    throw new Error("The live opponent step still renders the sixteen-format catalog.");
  }

  await page.screenshot({ path: auctionScreenshotPath, fullPage: true });
  if (!fs.existsSync(auctionScreenshotPath) || fs.statSync(auctionScreenshotPath).size < 5_000) {
    throw new Error("The signed-in Auction release screenshot was not created correctly.");
  }

  console.log("PASS: signed-in live What's New renders the Auction release item and the released 390x844 Auction setup is first, grouped, compact, and split into two steps.");
} finally {
  if (browser) await browser.close();
  if (userId) {
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
