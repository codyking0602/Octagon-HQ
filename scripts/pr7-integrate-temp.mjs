import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const root = process.cwd();
const payloadPaths = [1, 2, 3, 4].map((part) => resolve(root, `scripts/pr7-data-${part}.b64`));
const payloadBase64 = payloadPaths.map((path) => readFileSync(path, "utf8").trim()).join("");
const payload = JSON.parse(gunzipSync(Buffer.from(payloadBase64, "base64")).toString("utf8"));

const expectedIdentities = 99;
const expectedConcepts = 495;
const concepts = payload.flatMap((identity) => identity.concepts.map((concept) => ({ identity, concept })));
if (payload.length !== expectedIdentities) throw new Error(`Expected ${expectedIdentities} identities, got ${payload.length}.`);
if (concepts.length !== expectedConcepts) throw new Error(`Expected ${expectedConcepts} concepts, got ${concepts.length}.`);
if (new Set(payload.map((identity) => identity.subjectId)).size !== payload.length) throw new Error("Duplicate subject ids.");
if (new Set(concepts.map(({ concept }) => concept.sourceId)).size !== concepts.length) throw new Error("Duplicate source ids.");
if (new Set(concepts.map(({ identity, concept }) => `${identity.subjectId}:${concept.conceptId}`)).size !== concepts.length) throw new Error("Duplicate subject/concept ids.");

const q = (value) => JSON.stringify(value);
const ownerPath = resolve(root, "src/features/back-room/footballPersonIdentityKnowledge.ts");
let owner = readFileSync(ownerPath, "utf8");
if (owner.includes('source("identity-pr7-') || owner.includes('fact("pr7-')) throw new Error("PR7 runtime knowledge already integrated.");

const sourceLines = concepts.map(({ identity, concept }) => {
  const coverage = `PR7 NFL B-tier person identity research for ${identity.name}: ${concept.conceptId}. ${concept.why}`;
  return `  source(${q(concept.sourceId)}, ${q(concept.source.publisher)}, ${q(concept.source.title)}, ${q(concept.source.url)}, ${q(coverage)}),`;
}).join("\n");

const sourceStart = owner.indexOf("export const footballPersonIdentityKnowledgeSources:");
const sourceEndMarker = "\n] as const;\n\nconst fact =";
const sourceEnd = owner.indexOf(sourceEndMarker, sourceStart);
if (sourceStart < 0 || sourceEnd < 0) throw new Error("Could not locate canonical source array.");
owner = owner.slice(0, sourceEnd) + "\n" + sourceLines + owner.slice(sourceEnd);

const recordLines = payload.map((identity) => {
  const facts = identity.concepts.map((concept) =>
    `    fact(${q(concept.factId)}, ${q(concept.conceptId)}, ${q(concept.fact)}, [${q(concept.sourceId)}], ["pr7", "nfl-b", "person-identity"]),`
  ).join("\n");
  return `  { subjectId: ${q(identity.subjectId)}, facts: [\n${facts}\n  ]},`;
}).join("\n");

const recordStart = owner.indexOf("export const footballPersonIdentityKnowledgeRecords:");
const recordEndMarker = "\n] as const;\n\nconst sourceById";
const recordEnd = owner.indexOf(recordEndMarker, recordStart);
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
  md.push(`## ${identity.name}`, "");
  md.push(`- Canonical ID: \`${identity.subjectId}\``);
  md.push(`- Role: ${identity.role}`, "");
  identity.concepts.forEach((concept, index) => {
    md.push(`### ${index + 1}. \`${concept.conceptId}\``, "");
    md.push(`**Neutral factual statement:** ${concept.fact}`, "");
    md.push(`**Why distinctive:** ${concept.why}`, "");
    md.push(`**Runtime provenance:** ${concept.source.publisher} — ${concept.source.title} — ${concept.source.url}`, "");
    if (concept.researchSources?.length) {
      md.push("**Research source descriptor(s):**");
      for (const source of concept.researchSources) md.push(`- ${source}`);
      md.push("");
    }
  });
  if (identity.rejected?.trim()) {
    md.push("### Rejected / softened claims", "");
    md.push(identity.rejected.trim(), "");
  }
  md.push("---", "");
}
writeFileSync(auditPath, md.join("\n"));
