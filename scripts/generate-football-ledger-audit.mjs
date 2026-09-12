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

  const [registry, factual, whoAmI, knowledge, comparison] = await Promise.all([
    server.ssrLoadModule("/src/features/back-room/footballSubjectRegistry.ts"),
    server.ssrLoadModule("/src/features/back-room/footballFactualStats.ts"),
    server.ssrLoadModule("/src/features/games/footballWhoAmIAuthority.ts"),
    server.ssrLoadModule("/src/features/back-room/footballPersonIdentityKnowledge.ts"),
    server.ssrLoadModule("/src/features/back-room/footballComparisonAuthority.ts"),
  ]);

  const launchByLeague = new Map(["NFL", "CFB"].map((league) => [
    league,
    whoAmI.getFootballWhoAmILaunchPool(league).subjects,
  ]));
  for (const league of ["NFL", "CFB"]) {
    const launch = launchByLeague.get(league);
    const launchIds = new Set(launch.map((subject) => subject.id));
    const knowledgeRows = knowledge.footballPersonIdentityKnowledgeRecords
      .map((record) => ({ record, subject: registry.getFootballSubject(record.subjectId) }))
      .filter(({ subject }) => subject?.league === league && subject.recognizabilityTier === "A");
    console.log("FOOTBALL_LEDGER_DEBUG_A_KNOWLEDGE", JSON.stringify({
      league,
      launchA: launch.filter((subject) => subject.recognizabilityTier === "A").map((subject) => subject.id),
      researchedAOutsideLaunch: knowledgeRows
        .filter(({ record }) => !launchIds.has(record.subjectId))
        .map(({ record, subject }) => ({ id: record.subjectId, name: subject?.name, position: subject?.position })),
    }));
  }

  const countedPositions = new Set(["RB", "TE", "DL", "DB"]);
  const droppedFactOwners = factual.footballFactualRecords
    .map((record) => ({ record, subject: registry.getFootballSubject(record.subjectId) }))
    .filter(({ subject }) => subject?.league === "NFL" && subject.kind === "player-career" && countedPositions.has(subject.position))
    .filter(({ subject }) => !["A", "B", "C"].includes(subject.recognizabilityTier))
    .map(({ record, subject }) => ({
      id: subject.id,
      name: subject.name,
      position: subject.position,
      tier: subject.recognizabilityTier,
      facts: record.facts.length,
      sourceIdentityKeys: subject.sourceIdentityKeys,
    }));
  console.log("FOOTBALL_LEDGER_DEBUG_DROPPED_NFL_FACT_OWNERS", JSON.stringify(droppedFactOwners));

  const cfbUniverse = whoAmI.getFootballWhoAmIUniverse("CFB");
  console.log("FOOTBALL_LEDGER_DEBUG_CFB_SHALLOW_CLUES", JSON.stringify(
    cfbUniverse.candidates
      .filter((candidate) => candidate.clues.length < 12)
      .map((candidate) => ({ id: candidate.id, name: candidate.name, clues: candidate.clues.length })),
  ));

  const anchors = [
    ["nfl-qb","tom-brady"],["nfl-qb","drew-brees"],["nfl-qb","eli-manning"],
    ["nfl-rb","jim-brown"],["nfl-rb","nfl-derrick-henry"],["nfl-rb","frank-gore"],
    ["nfl-wr","nfl-jerry-rice"],["nfl-wr","nfl-randy-moss"],["nfl-wr","antonio-brown"],["nfl-wr","julio-jones"],
    ["nfl-te","tony-gonzalez"],["nfl-te","shannon-sharpe"],["nfl-te","jason-witten"],
    ["nfl-front-seven","clay-matthews"],["nfl-secondary","morris-claiborne"],
    ["cfb-qb","cfb-lamar-jackson"],["cfb-qb","cfb-trevor-lawrence"],["cfb-qb","cfb-jake-fromm"],
    ["cfb-rb","cfb-bijan-robinson"],["cfb-rb","cfb-trent-richardson"],
  ];
  console.log("FOOTBALL_LEDGER_DEBUG_COMPARISON_ANCHORS", JSON.stringify(anchors.map(([packId, id]) => {
    const pack = comparison.footballComparisonCategoryPacks.find((candidate) => candidate.id === packId);
    return {
      packId,
      id,
      found: Boolean(pack?.items.find((item) => item.id === id)),
      sameNameish: pack?.items.filter((item) => item.id.includes(id.replace(/^(?:nfl|cfb)-/, ""))).map((item) => item.id) ?? [],
    };
  })));
} finally {
  await server.close();
}
