import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(repoRoot, "src/features/play/dailyRuntimeBundle.ts");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const output = resolve(outDir, "runtime.generated.mjs");

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
      entry,
      formats: ["es"],
      fileName: () => "runtime.generated.mjs",
    },
    rollupOptions: {
      output: {
        entryFileNames: "runtime.generated.mjs",
        inlineDynamicImports: true,
      },
    },
  },
});

const bundled = await readFile(output, "utf8");
for (const requiredExport of [
  "advanceOfficialDailyRuntime",
  "buildOfficialDailySetup",
  "buildFootballTodayProjection",
]) {
  if (!bundled.includes(requiredExport)) {
    throw new Error(`Daily runtime bundle is missing ${requiredExport}.`);
  }
}
if (/(?:from\s*|import\s*\()\s*["']\.{1,2}\//.test(bundled)) {
  throw new Error("Daily runtime bundle still contains a relative source import.");
}

const digest = createHash("sha256").update(bundled).digest("hex");
console.log(`Generated canonical daily runtime bundle ${digest}.`);
