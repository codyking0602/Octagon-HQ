import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { expect, it } from "vitest";

const runFile = promisify(execFile);
const chrome = [
  process.env.OCTAGON_CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((value): value is string => Boolean(value)).find(existsSync);

it("renders all five official daily games in a real 390x844 browser", async () => {
  if (!chrome) {
    if (process.env.CI) throw new Error("CI did not provide Chrome for the required phone proof.");
    return;
  }

  const { stdout, stderr } = await runFile(
    process.execPath,
    ["scripts/verify-todays-challenge-phone.mjs"],
    {
      env: { ...process.env, OCTAGON_CHROME_PATH: chrome },
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  expect(stderr).toBe("");
  for (const game of [
    "find_leader",
    "wavelength",
    "blind_resume",
    "blind_rank_5",
    "keep_4_cut_4",
  ]) {
    expect(stdout).toContain(`PASS: ${game} rendered at 390x844 without horizontal overflow`);
  }
}, 130_000);
