import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const bundles = [
  {
    label: "UFC daily runtime",
    entry: resolve(repoRoot, "src/features/play/todaysChallengeRuntime.ts"),
    fileName: "runtime.generated.mjs",
    requiredExports: ["advanceOfficialDailyRuntime", "buildOfficialDailySetup"],
  },
  {
    label: "Football daily runtime",
    entry: resolve(repoRoot, "src/features/play/footballTodayChallengeSession.ts"),
    fileName: "football-runtime.generated.mjs",
    requiredExports: ["buildFootballTodayPersistenceSetup", "buildFootballTodayRuntimeSnapshot"],
  },
];

// The Football runtime imports this generated relationship projection. Keep the
// bundle command self-contained for clean deployment checkouts instead of relying
// on pretypecheck/pretest having populated ignored generated files first.
await import("./generate-football-career-media-context.mjs");

for (const bundle of bundles) {
  const output = resolve(outDir, bundle.fileName);
  await rm(output, { force: true });

  await build({
    configFile: false,
    root: repoRoot,
    publicDir: false,
    logLevel: "warn",
    build: {
      target: "es2022",
      minify: false,
      sourcemap: false,
      emptyOutDir: false,
      copyPublicDir: false,
      outDir,
      lib: {
        entry: bundle.entry,
        formats: ["es"],
        fileName: () => bundle.fileName,
      },
      rollupOptions: {
        output: {
          entryFileNames: bundle.fileName,
          inlineDynamicImports: true,
        },
      },
    },
  });

  const bundled = await readFile(output, "utf8");
  for (const requiredExport of bundle.requiredExports) {
    if (!bundled.includes(requiredExport)) {
      throw new Error(`${bundle.label} bundle is missing ${requiredExport}.`);
    }
  }
  if (/(?:from\s*|import\s*\()\s*["']\.{1,2}\//.test(bundled)) {
    throw new Error(`${bundle.label} bundle still contains a relative source import.`);
  }

  const digest = createHash("sha256").update(bundled).digest("hex");
  console.log(`Generated canonical ${bundle.label} bundle ${digest}.`);
}
