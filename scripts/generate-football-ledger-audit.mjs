import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "docs/football-ledger-stage13-5-review.md");

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { footballLedgerAudit, formatFootballLedgerAuditMarkdown } = await server.ssrLoadModule(
    "/src/features/back-room/footballLedgerAudit.ts",
  );
  fs.writeFileSync(outputPath, formatFootballLedgerAuditMarkdown(footballLedgerAudit));
  console.log(`Generated ${path.relative(root, outputPath)} from canonical Football owners.`);
} finally {
  await server.close();
}
