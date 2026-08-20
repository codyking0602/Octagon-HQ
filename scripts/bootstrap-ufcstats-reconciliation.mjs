#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfPath = fileURLToPath(import.meta.url);

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function write(relativePath, content) {
  await fs.writeFile(path.join(root, relativePath), content, "utf8");
}

function replaceOnce(content, before, after, label) {
  const first = content.indexOf(before);
  if (first < 0) throw new Error(`Missing bootstrap marker: ${label}`);
  if (content.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Bootstrap marker is not unique: ${label}`);
  }
  return `${content.slice(0, first)}${after}${content.slice(first + before.length)}`;
}

function replaceRegexOnce(content, pattern, after, label) {
  const matches = [...content.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} marker; found ${matches.length}.`);
  }
  return content.replace(pattern, after);
}

async function patchV2RankingOwner() {
  const file = "src/features/rankings/data/v2RankingRoster.ts";
  let content = await read(file);
  const marker = `const baselineFighter = (fighter: string) => {\n  const input = historicalMigrationSeedJson.fighters.find(\n    (candidate) => candidate.fighter === fighter,\n  );\n  if (!input)\n    throw new Error(\`${"${fighter}"} is missing from the sealed ranking baseline.\`);\n  return input;\n};`;
  const correctionBlock = `${marker}\n\n/**\n * Factual UFC-only corrections discovered while reconciling the canonical\n * ledger against the pinned UFCStats export. The sealed migration baseline is\n * evidence only, so corrections remain in the existing V2 ranking owner.\n */\nconst aljamainSterlingFactsCorrected = (() => {\n  const fighter = baselineFighter("Aljamain Sterling");\n  const duplicateFightId = "2015-04-18-manny-gamburyan";\n  const staleMizugakiFightId = "2014-09-20-takeya-mizugaki";\n  const mizugakiFightId = "2015-04-18-takeya-mizugaki";\n  return {\n    ...fighter,\n    facts: {\n      ...fighter.facts,\n      fights: fighter.facts.fights\n        .filter((fight) => fight.id !== duplicateFightId)\n        .map((fight) =>\n          fight.id === staleMizugakiFightId\n            ? { ...fight, id: mizugakiFightId, date: "2015-04-18" }\n            : fight,\n        ),\n    },\n    judgments: {\n      ...fighter.judgments,\n      opponentQuality: {\n        ...fighter.judgments.opponentQuality,\n        inputs: fighter.judgments.opponentQuality.inputs\n          .filter((input) => input.fightId !== duplicateFightId)\n          .map((input) =>\n            input.fightId === staleMizugakiFightId\n              ? {\n                  ...input,\n                  fightId: mizugakiFightId,\n                  date: "2015-04-18",\n                  event: "UFC on Fox: Machida vs. Rockhold",\n                }\n              : input,\n          ),\n      },\n    },\n  };\n})();\n\nconst bjPennFactsCorrected = (() => {\n  const fighter = baselineFighter("B.J. Penn");\n  const nonUfcFightId = "2003-04-25-duane-ludwig";\n  return {\n    ...fighter,\n    facts: {\n      ...fighter.facts,\n      fights: fighter.facts.fights.filter((fight) => fight.id !== nonUfcFightId),\n    },\n    judgments: {\n      ...fighter.judgments,\n      opponentQuality: {\n        ...fighter.judgments.opponentQuality,\n        inputs: fighter.judgments.opponentQuality.inputs.filter(\n          (input) => input.fightId !== nonUfcFightId,\n        ),\n      },\n    },\n  };\n})();\n\nconst titoOrtizFactsCorrected = (() => {\n  const fighter = baselineFighter("Tito Ortiz");\n  const staleFightId = "1998-03-13-jerry-bohlander";\n  const correctedFightId = "1999-01-08-jerry-bohlander";\n  return {\n    ...fighter,\n    facts: {\n      ...fighter.facts,\n      fights: fighter.facts.fights.map((fight) =>\n        fight.id === staleFightId\n          ? { ...fight, id: correctedFightId, date: "1999-01-08" }\n          : fight,\n      ),\n    },\n    judgments: {\n      ...fighter.judgments,\n      opponentQuality: {\n        ...fighter.judgments.opponentQuality,\n        inputs: fighter.judgments.opponentQuality.inputs.map((input) =>\n          input.fightId === staleFightId\n            ? {\n                ...input,\n                fightId: correctedFightId,\n                date: "1999-01-08",\n                event: "UFC 18",\n              }\n            : input,\n        ),\n      },\n    },\n  };\n})();\n\nconst lyotoMachidaFactsCorrected = (() => {\n  const fighter = baselineFighter("Lyoto Machida");\n  const staleFightId = "2007-05-26-david-heath";\n  const correctedFightId = "2007-04-21-david-heath";\n  return {\n    ...fighter,\n    facts: {\n      ...fighter.facts,\n      fights: fighter.facts.fights.map((fight) =>\n        fight.id === staleFightId\n          ? { ...fight, id: correctedFightId, date: "2007-04-21" }\n          : fight,\n      ),\n    },\n    judgments: {\n      ...fighter.judgments,\n      opponentQuality: {\n        ...fighter.judgments.opponentQuality,\n        inputs: fighter.judgments.opponentQuality.inputs.map((input) =>\n          input.fightId === staleFightId\n            ? {\n                ...input,\n                fightId: correctedFightId,\n                date: "2007-04-21",\n                event: "UFC 70",\n              }\n            : input,\n        ),\n      },\n    },\n  };\n})();\n\nconst robbieLawlerFactsCorrected = (() => {\n  const fighter = baselineFighter("Robbie Lawler");\n  const cancelledFightId = "2022-12-10-santiago-ponzinibbio";\n  return {\n    ...fighter,\n    facts: {\n      ...fighter.facts,\n      fights: fighter.facts.fights.filter((fight) => fight.id !== cancelledFightId),\n    },\n  };\n})();`;
  content = replaceOnce(content, marker, correctionBlock, "V2 correction block");

  for (const [fighter, owner] of [
    ["Aljamain Sterling", "aljamainSterlingFactsCorrected"],
    ["B.J. Penn", "bjPennFactsCorrected"],
    ["Tito Ortiz", "titoOrtizFactsCorrected"],
    ["Lyoto Machida", "lyotoMachidaFactsCorrected"],
    ["Robbie Lawler", "robbieLawlerFactsCorrected"],
  ]) {
    content = replaceOnce(
      content,
      `"${fighter}": intentionalEditorialReview(\n      baselineFighter("${fighter}"),`,
      `"${fighter}": intentionalEditorialReview(\n      ${owner},`,
      `${fighter} replacement owner`,
    );
  }
  await write(file, content);
}

async function patchGenerator() {
  const file = "scripts/backfill-ufcstats-supplemental.mjs";
  let content = await read(file);
  content = replaceRegexOnce(
    content,
    /const KNOWN_UNRECONCILED = new Set\(\[\n[\s\S]*?\n\]\);/g,
    `const KNOWN_UNRECONCILED = new Set([\n  "Royce Gracie|1993-11-12-art-jimmerson",\n  "Royce Gracie|1993-11-12-ken-shamrock",\n  "Royce Gracie|1993-11-12-gerard-gordeau",\n]);`,
    "known unreconciled UFCStats rows",
  );
  await write(file, content);
}

async function patchFocusedTest() {
  const file = "src/features/rankings/data/ufcStatsSupplementalFacts.test.ts";
  let content = await read(file);
  content = replaceRegexOnce(
    content,
    /const EXPECTED_UNRECONCILED = \[\n[\s\S]*?\n\]\.sort\(\);/g,
    `const EXPECTED_UNRECONCILED = [\n  "Royce Gracie|1993-11-12-art-jimmerson",\n  "Royce Gracie|1993-11-12-gerard-gordeau",\n  "Royce Gracie|1993-11-12-ken-shamrock",\n].sort();`,
    "expected unreconciled UFCStats rows",
  );
  content = replaceOnce(
    content,
    '  it("keeps shared fight evidence symmetric when two ranked fighters faced each other", () => {',
    `  it("keeps UFCStats-discovered factual corrections in the V2 canonical owner", () => {\n    const byName = new Map(canonicalRankingInputs.fighters.map((fighter) => [fighter.fighter, fighter]));\n    const sterling = byName.get("Aljamain Sterling");\n    expect(sterling?.facts.fights.some((fight) => fight.id === "2015-04-18-takeya-mizugaki")).toBe(true);\n    expect(sterling?.facts.fights.some((fight) => fight.id === "2014-09-20-takeya-mizugaki")).toBe(false);\n    expect(sterling?.facts.fights.some((fight) => fight.id === "2015-04-18-manny-gamburyan")).toBe(false);\n\n    expect(byName.get("B.J. Penn")?.facts.fights.some((fight) => fight.id === "2003-04-25-duane-ludwig")).toBe(false);\n    expect(byName.get("Robbie Lawler")?.facts.fights.some((fight) => fight.id === "2022-12-10-santiago-ponzinibbio")).toBe(false);\n    expect(byName.get("Tito Ortiz")?.facts.fights.some((fight) => fight.id === "1999-01-08-jerry-bohlander")).toBe(true);\n    expect(byName.get("Lyoto Machida")?.facts.fights.some((fight) => fight.id === "2007-04-21-david-heath")).toBe(true);\n  });\n\n  it("keeps shared fight evidence symmetric when two ranked fighters faced each other", () => {`,
    "canonical reconciliation regression test",
  );
  await write(file, content);
}

async function writeFinalWorkflow() {
  const file = ".github/workflows/refresh-ufcstats-supplemental.yml";
  const workflow = `name: Refresh UFCStats Supplemental Facts\n\non:\n  workflow_dispatch:\n\npermissions:\n  contents: write\n\nconcurrency:\n  group: ufcstats-supplemental-\${{ github.ref }}\n  cancel-in-progress: false\n\njobs:\n  refresh:\n    if: github.ref_name != 'main'\n    runs-on: ubuntu-latest\n    timeout-minutes: 15\n    steps:\n      - name: Check out exact refresh branch\n        uses: actions/checkout@v4\n        with:\n          ref: \${{ github.ref_name }}\n          fetch-depth: 1\n\n      - name: Set up Node\n        uses: actions/setup-node@v4\n        with:\n          node-version: 22.13.0\n          cache: npm\n\n      - name: Install locked app dependencies\n        run: npm ci\n\n      - name: Refresh checked-in UFCStats supplemental snapshot\n        run: node scripts/backfill-ufcstats-supplemental.mjs\n\n      - name: Verify supplemental snapshot and TypeScript boundary\n        run: |\n          npm run typecheck\n          npx vitest run src/features/rankings/data/ufcStatsSupplementalFacts.test.ts\n          git diff --check\n\n      - name: Commit generated snapshot to this branch\n        shell: bash\n        run: |\n          set -euo pipefail\n          snapshot=\"src/features/rankings/data/generated/ufcstats-supplemental-facts-v1.json\"\n          if git diff --quiet -- \"$snapshot\"; then\n            echo \"UFCStats supplemental snapshot is already current.\"\n            exit 0\n          fi\n          git config user.name \"github-actions[bot]\"\n          git config user.email \"41898282+github-actions[bot]@users.noreply.github.com\"\n          git add -- \"$snapshot\"\n          git commit -m \"Refresh UFCStats supplemental fight facts\"\n          git push origin \"HEAD:\${{ github.ref_name }}\"\n`;
  await write(file, workflow);
}

await patchV2RankingOwner();
await patchGenerator();
await patchFocusedTest();
await writeFinalWorkflow();
await fs.unlink(selfPath);
