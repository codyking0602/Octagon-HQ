import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  forbiddenBrowserCredentialPatterns,
  isPublicSupabaseKey,
  validatePublicSupabaseConfig,
} from "./public-supabase-config.mjs";

const requiredApplicationMarkers = [
  "Your event recaps",
  "get_my_pick_history",
  "HOW SCORING WORKS",
  "Correct pick +4",
  "MAKE THIS MY UNDERDOG LOCK",
  "pick-fighter-thumbnail",
  "get_my_event_underdog_lock",
  "set_my_event_underdog_lock",
  "PICKS LOCKED",
  "AWAITING RESULTS",
  "NOT PICKED",
  "VIEW FIGHT-BY-FIGHT RESULTS",
  "+400+",
  "HOW EVERYONE PICKED",
  "group_picks",
  "Fight Night Control",
  "LOCK PICKS & BEGIN RESULTS",
  "COMPLETE EVENT",
  "get_pick_control_event",
];

export async function verifyProductionArtifact({ dist = "dist", env = process.env } = {}) {
  const config = validatePublicSupabaseConfig({
    url: env.VITE_SUPABASE_URL,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
  });
  const files = await walk(dist);
  if (!files.some((file) => file.endsWith("index.html"))) throw new Error("dist/index.html is missing.");
  const compiledFiles = files.filter((file) => file.endsWith(".html") || file.endsWith(".js"));
  const contents = await Promise.all(compiledFiles.map((file) => readFile(file, "utf8")));
  const artifact = contents.join("\n");

  for (const placeholder of ["your-project-id", "your-publishable-key"]) {
    if (artifact.includes(placeholder)) throw new Error(`Compiled artifact contains forbidden placeholder ${placeholder}.`);
  }
  if (!artifact.includes(config.expectedHostname)) {
    throw new Error(`Compiled artifact does not contain expected hostname ${config.expectedHostname}.`);
  }
  if (!artifact.includes(config.publishableKey) || !isPublicSupabaseKey(config.publishableKey)) {
    throw new Error("Compiled artifact does not contain the validated public Supabase key.");
  }
  for (const pattern of forbiddenBrowserCredentialPatterns) {
    if (pattern.test(artifact)) throw new Error(`Compiled artifact contains an administrative credential pattern: ${pattern}.`);
  }
  for (const marker of requiredApplicationMarkers) {
    if (!artifact.includes(marker)) throw new Error(`Compiled artifact is missing required application marker: ${marker}.`);
  }

  return { files: compiledFiles.length, hostname: config.expectedHostname };
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = await verifyProductionArtifact();
  console.log(`Verified ${result.files} compiled files for ${result.hostname}.`);
}
