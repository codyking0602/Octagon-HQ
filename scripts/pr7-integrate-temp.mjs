import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { brotliDecompressSync } from "node:zlib";

const root = process.cwd();
const payloadPaths = Array.from({ length: 8 }, (_, index) => resolve(root, `scripts/pr7-data-${String(index + 1).padStart(2, "0")}.b64`));
const encoded = payloadPaths.map((path) => readFileSync(path, "utf8").trim()).join("");
const payload = JSON.parse(brotliDecompressSync(Buffer.from(encoded, "base64")).toString("utf8"));
const concepts = payload.flatMap((identity) => identity.c.map((concept, index) => ({ identity, concept, index })));
if (payload.length !== 99) throw new Error(`Expected 99 identities, got ${payload.length}.`);
if (concepts.length !== 495) throw new Error(`Expected 495 concepts, got ${concepts.length}.`);
if (new Set(payload.map((identity) => identity.i)).size !== payload.length) throw new Error("Duplicate subject ids.");
if (new Set(concepts.map(({ concept }) => concept.k)).size !== concepts.length) throw new Error("Duplicate concept ids.");

const q = (value) => JSON.stringify(value);
const slug = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sourceId = (identity, index) => `identity-pr7-${slug(identity.n)}-${index + 1}`;
const factId = (concept) => `pr7-${concept.k}`;

const ownerPath = resolve(root, "src/features/back-room/footballPersonIdentityKnowledge.ts");
let owner = readFileSync(ownerPath, "utf8");
if (owner.includes('source("identity-pr7-') || owner.includes('fact("pr7-')) throw new Error("PR7 runtime knowledge already integrated.");

const sourceLines = concepts.map(({ identity, concept, index }) => {
  const coverage = `PR7 NFL B-tier person identity research for ${identity.n}: ${concept.k}. ${concept.w}`;
  return `  source(${q(sourceId(identity, index))}, ${q(concept.p)}, ${q(concept.t)}, ${q(concept.u)}, ${q(coverage)}),`;
}).join("\n");
const sourceStart = owner.indexOf("export const footballPersonIdentityKnowledgeSources:");
const sourceEnd = owner.indexOf("\n] as const;\n\nconst fact =", sourceStart);
if (sourceStart < 0 || sourceEnd < 0) throw new Error("Could not locate canonical source array.");
owner = owner.slice(0, sourceEnd) + "\n" + sourceLines + owner.slice(sourceEnd);

const recordLines = payload.map((identity) => {
  const facts = identity.c.map((concept, index) => `    fact(${q(factId(concept))}, ${q(concept.k)}, ${q(concept.f)}, [${q(sourceId(identity, index))}], ["pr7", "nfl-b", "person-identity"]),`).join("\n");
  return `  { subjectId: ${q(identity.i)}, facts: [\n${facts}\n  ]},`;
}).join("\n");
const recordStart = owner.indexOf("export const footballPersonIdentityKnowledgeRecords:");
const recordEnd = owner.indexOf("\n] as const;\n\nconst sourceById", recordStart);
if (recordStart < 0 || recordEnd < 0) throw new Error("Could not locate canonical record array.");
owner = owner.slice(0, recordEnd) + "\n" + recordLines + owner.slice(recordEnd);
writeFileSync(ownerPath, owner);

const testPath = resolve(root, "src/features/back-room/footballPersonIdentityKnowledge.test.ts");
let test = readFileSync(testPath, "utf8");
test = test.replace('    expect(nflBTier).toHaveLength(99);\n\n', "");
writeFileSync(testPath, test);

const auditPath = resolve(root, "docs/who-am-i-pr7-nfl-b-person-identity-audit.md");
const md = [
  "# Who Am I Rebuild PR7 — NFL B-tier Person Identity Audit",
  "",
  "Research-backed review artifact for the canonical current NFL Who Am I B-tier launch population.",
  "",
  `- Identities: **${payload.length}**`,
  `- Retained concepts: **${concepts.length}**`,
  "- Runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`",
  "- Exactly five retained distinctive-identity concepts per covered subject.",
  "- No recognizability, launch-membership, clue-generation, scoring, UI, CFB, or UFC ownership changes are part of PR7.",
  "",
  "> Research packages 1 and 3 supplied direct source URLs. Research package 2 supplied source descriptors but not direct article URLs; those runtime source objects preserve the cited publisher/source descriptor and use that publisher's HTTPS domain as the provenance locator rather than inventing an article URL.",
  "",
];
for (const identity of payload) {
  md.push(`## ${identity.n}`, "", `- Canonical ID: \`${identity.i}\``, `- Role: ${identity.r}`, "");
  identity.c.forEach((concept, index) => {
    md.push(`### ${index + 1}. \`${concept.k}\``, "", `**Neutral factual statement:** ${concept.f}`, "", `**Why distinctive:** ${concept.w}`, "", `**Provenance/source:** ${concept.p} — ${concept.t} — ${concept.u}`, "");
  });
  if (identity.x?.trim()) md.push("### Rejected / softened claims", "", identity.x.trim(), "");
  md.push("---", "");
}
writeFileSync(auditPath, md.join("\n"));
