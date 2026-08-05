import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const games = [
  ["find_leader", "ELIMINATE"],
  ["wavelength", "LOCK GUESS 2"],
  ["blind_resume", "PICK FIGHTER A"],
  ["blind_rank_5", "PLACE HERE"],
  ["keep_4_cut_4", "KEEP IS FULL — THIS FIGHTER MUST BE CUT"],
];

function chromePath() {
  return [
    process.env.OCTAGON_CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean).find((candidate) => existsSync(candidate)) ?? null;
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForHttp(url, attempts = 120) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError ?? new Error(`${url} did not become ready.`);
}

async function waitForJson(url, attempts = 120) {
  const response = await waitForHttp(url, attempts);
  return response.json();
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      await new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve, { once: true });
        this.socket.addEventListener("error", reject, { once: true });
      });
    }
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForFixture(client, expectedGame) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const evaluated = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const page = document.querySelector('[data-testid="official-daily-page"]');
        return page ? {
          ready: true,
          game: page.querySelector('[data-game]')?.getAttribute('data-game') ?? '',
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          text: document.body.innerText,
        } : { ready: false };
      })()`,
      returnByValue: true,
    });
    const value = evaluated?.result?.value;
    if (value?.ready && value.game === expectedGame) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${expectedGame} did not render its official fixture.`);
}

const chrome = chromePath();
if (!chrome) throw new Error("Chrome is required for the Today’s Challenge 390x844 proof.");

const vitePort = await freePort();
const debugPort = await freePort();
const profileDir = mkdtempSync(join(tmpdir(), "octagon-today-phone-"));
const proofDir = process.env.RUNNER_TEMP
  ? join(process.env.RUNNER_TEMP, "todays-challenge-phone-proof")
  : join(tmpdir(), "todays-challenge-phone-proof");
mkdirSync(proofDir, { recursive: true });

let viteLog = "";
let browserLog = "";
const vite = spawn(process.execPath, [
  "node_modules/vite/bin/vite.js",
  "--host", "127.0.0.1",
  "--port", String(vitePort),
  "--strictPort",
], { stdio: ["ignore", "pipe", "pipe"] });
vite.stdout.on("data", (chunk) => { viteLog += String(chunk); });
vite.stderr.on("data", (chunk) => { viteLog += String(chunk); });

const browser = spawn(chrome, [
  "--headless=new",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  "--window-size=390,844",
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });
browser.stdout.on("data", (chunk) => { browserLog += String(chunk); });
browser.stderr.on("data", (chunk) => { browserLog += String(chunk); });

let client;
try {
  await waitForHttp(`http://127.0.0.1:${vitePort}/scripts/todays-challenge-phone/index.html`);
  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!pageTarget) throw new Error("Chrome did not expose a debuggable page target.");

  client = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });

  for (const [game, expectedText] of games) {
    await client.send("Page.navigate", {
      url: `http://127.0.0.1:${vitePort}/scripts/todays-challenge-phone/index.html?game=${game}`,
    });
    const result = await waitForFixture(client, game);
    if (result.viewportWidth !== 390) {
      throw new Error(`${game} rendered at ${result.viewportWidth}px instead of 390px.`);
    }
    if (result.documentWidth > 390 || result.bodyWidth > 390) {
      throw new Error(`${game} overflowed horizontally: document ${result.documentWidth}px, body ${result.bodyWidth}px.`);
    }
    if (!String(result.text).includes(expectedText)) {
      throw new Error(`${game} did not render its expected progressive control: ${expectedText}`);
    }
    if (String(result.text).includes("Future Fighter") || String(result.text).includes("Eighth Fighter")) {
      throw new Error(`${game} exposed a future hidden fighter.`);
    }

    const captured = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    const screenshotPath = join(proofDir, `${game}-390x844.png`);
    writeFileSync(screenshotPath, Buffer.from(captured.data, "base64"));
    console.log(`PASS: ${game} rendered at 390x844 without horizontal overflow (${screenshotPath}).`);
  }
} catch (error) {
  throw new Error(`${error instanceof Error ? error.message : String(error)}\nVite:\n${viteLog}\nChrome:\n${browserLog}`);
} finally {
  client?.close();
  browser.kill("SIGTERM");
  vite.kill("SIGTERM");
  rmSync(profileDir, { recursive: true, force: true });
}
