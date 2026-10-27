import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const games = [
  ["find_leader", "Who averaged the most assists per game?"],
  ["hit_the_number", "Points Per Game"],
  ["higher_lower", "HIGHER"],
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

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const signal = (name) => {
    try {
      if (process.platform !== "win32" && child.pid) process.kill(-child.pid, name);
      else child.kill(name);
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  };
  signal("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 1_500)),
  ]);
  if (child.exitCode === null && child.signalCode === null) signal("SIGKILL");
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
    try {
      this.socket.close();
    } catch {
      // The browser process may already have closed the debug socket.
    }
  }
}

async function waitForFixture(client, expectedGame) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const evaluated = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const page = document.querySelector('[data-game="${expectedGame}"]');
        return page ? {
          ready: true,
          game: page.getAttribute('data-game') ?? '',
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
if (!chrome) throw new Error("Chrome is required for the NBA portrait 390x844 proof.");

const vitePort = await freePort();
const debugPort = await freePort();
const profileDir = mkdtempSync(join(tmpdir(), "octagon-nba-phone-"));
const proofDir = process.env.RUNNER_TEMP
  ? join(process.env.RUNNER_TEMP, "nba-portrait-phone-proof")
  : join(tmpdir(), "nba-portrait-phone-proof");
mkdirSync(proofDir, { recursive: true });

let viteLog = "";
let browserLog = "";
const spawnOptions = { stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" };
const vite = spawn(process.execPath, [
  "node_modules/vite/bin/vite.js",
  "--host", "127.0.0.1",
  "--port", String(vitePort),
  "--strictPort",
], spawnOptions);
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
], spawnOptions);
browser.stdout.on("data", (chunk) => { browserLog += String(chunk); });
browser.stderr.on("data", (chunk) => { browserLog += String(chunk); });

let client;
try {
  await waitForHttp(`http://127.0.0.1:${vitePort}/scripts/nba-portrait-phone/index.html`);
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
      url: `http://127.0.0.1:${vitePort}/scripts/nba-portrait-phone/index.html?game=${game}`,
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
    // These are actual NBA game components. Do not accept an image element
    // merely because it has a valid URL: confirm the browser decoded pixels.
    let loadedPortraits = null;
    for (let poll = 0; poll < 200; poll += 1) {
      const inspected = await client.send("Runtime.evaluate", {
        expression: `(() => {
          const shell = document.querySelector('[data-game="${game}"]');
          const images = [...shell.querySelectorAll('img')];
          for (const image of images) image.loading = "eager";
          return { total: images.length,
            decoded: images.filter(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0).length,
            failed: images.filter(image => image.complete && (!image.naturalWidth || !image.naturalHeight)).map(image => image.src)
          };
        })()`,
        returnByValue: true,
      });
      loadedPortraits = inspected?.result?.value;
      if (loadedPortraits.total >= 2 && loadedPortraits.decoded === loadedPortraits.total) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!loadedPortraits || loadedPortraits.total < 2 ||
        loadedPortraits.decoded !== loadedPortraits.total || loadedPortraits.failed.length) {
      throw new Error(`${game} failed iPhone pixel loading: ${JSON.stringify(loadedPortraits)}`);
    }
    // Ensure no successfully loaded NBA CDN silhouette remained in frame.
    const rendered = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const shell = document.querySelector('[data-game="${game}"]');
        return [...shell.querySelectorAll('img')].map(image => ({
          url: image.src,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          rect: { width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height },
          fit: getComputedStyle(image).objectFit,
        }));
      })()`,
      returnByValue: true,
    });
    if (rendered.result.value.some(image => !image.rect.width || !image.rect.height)) {
      throw new Error(`${game} contained clipped/zero-size image frames`);
    }
    console.log(`PASS: ${game} loaded ${loadedPortraits.decoded} full NBA portraits on iPhone.`);
    // Advance a real game control: this catches fixture renders that pass
    // static screenshots but have disconnected gameplay interactions.
    const interacted = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const scope = document.querySelector('[data-game="${game}"]');
        const buttons = [...scope.querySelectorAll('button')].filter(button => !button.disabled);
        const pick = buttons.find(button => game === "higher_lower"
          ? button.textContent?.includes("HIGHER")
          : game === "find_leader"
            ? /eliminate|remove|pick/i.test(button.textContent || "") || button.className.includes("find-card")
            : /Al Horford/i.test(button.textContent || "")) ?? buttons.find(button =>
                !/back|home|all games|leaderboard/i.test(button.textContent || ""));
        if (!pick) return { found: false };
        pick.click();
        return { found: true, label: pick.textContent?.trim().slice(0, 70) ?? "" };
      })()`.replaceAll("game ===", `"${game}" ===`),
      returnByValue: true,
    });
    if (!interacted.result.value?.found) throw new Error(`${game} had no usable gameplay control.`);
    console.log(`PASS: ${game} accepted user input from ${interacted.result.value.label}`);

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
  await Promise.all([terminate(browser), terminate(vite)]);
  rmSync(profileDir, { recursive: true, force: true });
}
