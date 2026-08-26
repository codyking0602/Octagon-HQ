import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const proofDir = process.env.RUNNER_TEMP
  ? join(process.env.RUNNER_TEMP, "todays-challenge-phone-proof")
  : "/tmp/todays-challenge-phone-proof";
mkdirSync(proofDir, { recursive: true });

const install = spawnSync("python3", ["-m", "pip", "install", "--quiet", "requests", "mwparserfromhell"], {
  stdio: "inherit",
});
if (install.status !== 0) throw new Error("Failed to install the one-time coach source parser dependencies.");

const generate = spawnSync("python3", ["scripts/_tmp_generate_cfb_coach_source.py"], {
  stdio: "inherit",
});
if (generate.status !== 0) throw new Error("Failed to generate the pinned CFB coach source snapshot.");

const source = "public/data/football/cfb/cfb-coach-assignments-2002-2025.source.json";
const artifactPath = join(proofDir, "cfb-coach-source-snapshot.png");
copyFileSync(source, artifactPath);
console.log(`PASS: generated the pinned CFB coach source snapshot for artifact recovery (${artifactPath}).`);
