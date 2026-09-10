import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const parts = [1, 2, 3].map((n) => readFileSync(`scripts/pr7-raw-payload-0${n}.txt`, "utf8").trim());
const payload = parts.join("");
const people = JSON.parse(gunzipSync(Buffer.from(payload, "base64")).toString("utf8"));

const fail = (message) => { throw new Error(message); };
if (people.length !== 99) fail(`Expected 99 PR7 identities, got ${people.length}.`);
if (people.some((person) => !person.id || !person.name || !person.role || !Array.isArray(person.facts))) fail("Missing required PR7 person fields.");
if (people.some((person) => person.facts.length !== 5)) fail("Every PR7 identity must have exactly five retained concepts.");
const factCount = people.reduce((sum, person) => sum + person.facts.length, 0);
if (factCount !== 495) fail(`Expected 495 PR7 concepts, got ${factCount}.`);
if (new Set(people.map((person) => person.id)).size !== people.length) fail("Duplicate PR7 canonical subject id.");
const concepts = people.flatMap((person) => person.facts.map((fact) => fact.concept));
if (new Set(concepts).size !== concepts.length) fail("Duplicate PR7 concept id.");

const suspicious = [];
for (const person of people) {
  for (const fact of person.facts) {
    if (![fact.concept, fact.fact, fact.why, fact.source, fact.url].every((value) => typeof value === "string" && value.trim())) {
      fail(`Missing required PR7 concept fields for ${person.id}.`);
    }
    if (!fact.url.startsWith("https://")) fail(`Invalid PR7 source URL for ${fact.concept}.`);
    if (fact.fact.trim().split(/\s+/).length < 8) fail(`PR7 fact is too shallow: ${fact.concept}.`);
    const text = `${fact.concept} ${fact.fact} ${fact.why}`.toLowerCase();
    if (/generic filler|seed-generated|placeholder|notable career|known for his career|professional football career|distinctive detail for|research needed|todo|tbd/.test(text)) suspicious.push(`${person.id}:${fact.concept}`);
  }
}
if (suspicious.length) fail(`Suspicious generic/seed filler: ${suspicious.join(", ")}`);

const hampton = people.find((person) => person.name === "Dan Hampton");
if (!hampton) fail("Dan Hampton missing from PR7 payload.");
const hamptonRuntime = hampton.facts.map((fact) => `${fact.concept} ${fact.fact}`).join(" ");
if (!hamptonRuntime.toLowerCase().includes("double-digit knee operations")) fail("Dan Hampton conservative knee-operations wording is missing.");
if (/\b(?:10|11|12|13|14|15|16|17|18|19|20)\s+knee operations\b/i.test(hamptonRuntime)) fail("Dan Hampton runtime research contains a disputed exact knee-operation count.");

const quote = (value) => JSON.stringify(value);
const rows = [];
for (const person of people) {
  for (const fact of person.facts) {
    rows.push(`  [${quote(person.id)}, ${quote(fact.concept)}, ${quote(fact.fact)}, ${quote(fact.source)}, ${quote(fact.url)}],`);
  }
}

const ownerBlock = `type Pr7PersonIdentityResearchRow = readonly [
  subjectId: string,
  conceptId: string,
  value: string,
  publisher: string,
  url: string,
];

const PR7_REVIEWED_ON = "2026-09-10";
const pr7PersonIdentityResearchRows: readonly Pr7PersonIdentityResearchRow[] = [
${rows.join("\n")}
];

const pr7FactsBySubjectId = new Map<string, FootballPersonIdentityFact[]>();
const mutablePersonIdentitySources = footballPersonIdentityKnowledgeSources as unknown as FootballFactSource[];
const mutablePersonIdentityRecords = footballPersonIdentityKnowledgeRecords as unknown as FootballPersonIdentityKnowledgeRecord[];

for (const [subjectId, conceptId, value, publisher, url] of pr7PersonIdentityResearchRows) {
  const sourceId = \`identity-pr7-\${conceptId}\`;
  mutablePersonIdentitySources.push({
    id: sourceId,
    publisher,
    title: \`PR7 verified research: \${conceptId}\`,
    url,
    reviewedOn: PR7_REVIEWED_ON,
    coverage: \`Verified NFL B-tier person-identity concept \${conceptId}.\`,
  });
  const facts = pr7FactsBySubjectId.get(subjectId) ?? [];
  facts.push(fact(conceptId, conceptId, value, [sourceId], ["pr7", "nfl-b"]));
  pr7FactsBySubjectId.set(subjectId, facts);
}

for (const [subjectId, facts] of pr7FactsBySubjectId) {
  mutablePersonIdentityRecords.push({ subjectId, facts });
}

`;

const ownerPath = "src/features/back-room/footballPersonIdentityKnowledge.ts";
const owner = readFileSync(ownerPath, "utf8");
const marker = "const sourceById = new Map(footballPersonIdentityKnowledgeSources.map((item) => [item.id, item]));";
if (owner.includes("pr7PersonIdentityResearchRows")) fail("PR7 owner block already present.");
if (!owner.includes(marker)) fail("Canonical person-identity owner marker not found.");
writeFileSync(ownerPath, owner.replace(marker, ownerBlock + marker));

const audit = [];
audit.push("# Who Am I Rebuild PR7 — NFL B-tier person identity audit", "");
audit.push("Review-only audit for the canonical NFL B-tier person-identity knowledge added in PR7.", "");
audit.push("- Canonical runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`");
audit.push("- Population source: `getFootballWhoAmILaunchPool(\"NFL\").subjects` filtered to `recognizabilityTier === \"B\"`");
audit.push("- Audited identities: 99");
audit.push("- Retained concepts: 495");
audit.push("- Required class: `distinctive-identity`");
audit.push("- Required verification: `verified`");
audit.push("- Reviewed: 2026-09-10", "");
audit.push("## Boundary review", "");
audit.push("PR7 adds person-level NFL B-tier knowledge only. It does not change recognizability, launch membership, clue generation, clue wording, clue ordering, clue bands, scoring, replay/recovery/endgame behavior, UI, CFB knowledge, UFC behavior, Daily, 20 Questions, or rankings.", "");
people.forEach((person, index) => {
  audit.push(`## ${index + 1}. ${person.name} — ${person.role}`, "");
  audit.push(`- Canonical ID: \`${person.id}\``);
  audit.push("- Retained concepts: 5", "");
  for (const fact of person.facts) {
    audit.push(`### \`${fact.concept}\``, "");
    audit.push(`- Neutral fact: ${fact.fact}`);
    audit.push(`- Why distinctive: ${fact.why}`);
    audit.push(`- Provenance: ${fact.source} — ${fact.url}`, "");
  }
  if (person.rejects) audit.push(`- Rejected / caution: ${person.rejects}`, "");
});
writeFileSync("docs/who-am-i-pr7-nfl-b-person-identity-audit.md", audit.join("\n").trimEnd() + "\n");

writeFileSync("scripts/pr7-materialize-validation.json", JSON.stringify({ identities: people.length, concepts: factCount, uniqueIdentityIds: new Set(people.map((person) => person.id)).size, uniqueConceptIds: new Set(concepts).size, suspiciousGenericFiller: suspicious, danHamptonConservativeWording: true }, null, 2) + "\n");
console.log(`PR7_RECOVERY_OK identities=${people.length} concepts=${factCount} uniqueIds=${new Set(people.map((person) => person.id)).size} uniqueConcepts=${new Set(concepts).size}`);
