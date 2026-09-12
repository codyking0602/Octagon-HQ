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

  const [registry, factual, whoAmI, knowledge, rankFive] = await Promise.all([
    server.ssrLoadModule("/src/features/back-room/footballSubjectRegistry.ts"),
    server.ssrLoadModule("/src/features/back-room/footballFactualStats.ts"),
    server.ssrLoadModule("/src/features/games/footballWhoAmIAuthority.ts"),
    server.ssrLoadModule("/src/features/back-room/footballPersonIdentityKnowledge.ts"),
    server.ssrLoadModule("/src/features/back-room/footballRankFivePlayableModel.ts"),
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

  const cfbLaunchPlayers = whoAmI.getFootballWhoAmILaunchPool("CFB").players;
  const cfbSourceBacked = cfbLaunchPlayers
    .filter((subject) => ["QB", "RB", "WR", "TE"].includes(subject.position ?? ""))
    .filter((subject) => subject.startSeason != null && subject.endSeason != null)
    .flatMap((subject) => {
      const sourceId = subject.sourceIdentityKeys.find((key) => key.provider === "cfbfastR")?.id;
      if (!sourceId) return [];
      const required = subject.position === "QB"
        ? ["cfb-career-passing-attempts", "cfb-career-passing-yards", "cfb-best-season-passing-yards"]
        : subject.position === "RB"
          ? ["cfb-career-rushing-attempts", "cfb-career-rushing-yards", "cfb-best-season-rushing-yards"]
          : ["cfb-career-receptions", "cfb-career-receiving-yards", "cfb-best-season-receiving-yards"];
      const present = required.filter((metricId) => factual.getFootballFact(subject.id, metricId) != null);
      return [{
        id: subject.id,
        name: subject.name,
        position: subject.position,
        tier: subject.recognizabilityTier,
        school: subject.school,
        sourceId,
        startSeason: subject.startSeason,
        endSeason: subject.endSeason,
        required,
        present,
        complete: present.length === required.length,
      }];
    });
  console.log("FOOTBALL_LEDGER_DEBUG_CFB_SOURCE_FACTS", JSON.stringify({
    checked: cfbSourceBacked.filter((row) => row.complete).length,
    totalSourceBacked: cfbSourceBacked.length,
    incomplete: cfbSourceBacked.filter((row) => !row.complete),
  }));

  const cfbUniverse = whoAmI.getFootballWhoAmIUniverse("CFB");
  console.log("FOOTBALL_LEDGER_DEBUG_CFB_SHALLOW_CLUES", JSON.stringify(
    cfbUniverse.candidates
      .filter((candidate) => candidate.clues.length < 12)
      .map((candidate) => ({ id: candidate.id, name: candidate.name, clues: candidate.clues.length })),
  ));

  const anchors = [
    ["nfl-quarterbacks","tom-brady"],["nfl-quarterbacks","drew-brees"],["nfl-quarterbacks","eli-manning"],
    ["nfl-running-backs","jim-brown"],["nfl-running-backs","derrick-henry"],["nfl-running-backs","frank-gore"],
    ["nfl-wide-receivers","jerry-rice"],["nfl-wide-receivers","randy-moss"],["nfl-wide-receivers","antonio-brown"],["nfl-wide-receivers","julio-jones"],
    ["nfl-tight-ends","tony-gonzalez"],["nfl-tight-ends","shannon-sharpe"],["nfl-tight-ends","jason-witten"],
    ["nfl-front-seven","clay-matthews"],["nfl-secondary","morris-claiborne"],
    ["college-quarterbacks","lamar-jackson-2016"],["college-quarterbacks","trevor-lawrence-2018"],["college-quarterbacks","jake-fromm-career"],
    ["college-running-backs","bijan-robinson-cfb"],["college-running-backs","trent-richardson-cfb"],
  ];
  console.log("FOOTBALL_LEDGER_DEBUG_COMPARISON_ANCHORS", JSON.stringify(anchors.map(([packId, id]) => {
    const pack = rankFive.footballRankFivePacks.find((candidate) => candidate.id === packId);
    return {
      packId,
      id,
      found: Boolean(pack?.items.find((item) => item.id === id)),
      sameNameish: pack?.items.filter((item) => item.id.includes(id.replace(/-(?:2016|2018|career|cfb)$/, ""))).map((item) => item.id) ?? [],
    };
  })));

} finally {
  await server.close();
}
