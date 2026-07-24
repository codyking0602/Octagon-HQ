import type { RankingInputDataset } from "../rankings/data/rankingInputs";
import type { DivisionRankingReport } from "../rankings/rankingControls";
import type { RankingFighter } from "../rankings/rankingModel";

const VERDICT_TIE_EPSILON = 0.005;

function finite(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function round(value: unknown, digits = 2) {
  const parsed = finite(value);
  return parsed === undefined ? undefined : Number(parsed.toFixed(digits));
}

function clean(value: unknown, maxLength = 900) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function normalizedName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pairKey(first: RankingFighter, second: RankingFighter) {
  return [first.slug, second.slug].sort().join("--");
}

function arrayRecords(value: unknown) {
  return Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
      return true;
    }),
  );
}

export const octagonVerdictGuidance = {
  sourceOfTruth: "Retrieve both fighter objects and compare totalScore numerically. The higher totalScore is the UFC-only GOAT verdict winner.",
  divisionRule: "For division-only questions, use each fighter's matching divisionBoards entry and compare divisionScore and divisional stats. Do not substitute overall rank for the division verdict.",
  scope: "Judge UFC accomplishments by default. Non-UFC achievements may be mentioned only as context.",
  verdictRule: "Use verdictWinner exactly when a direct-fight matchup object exists. headToHead.seriesWinner is context only and never overrides the ranking verdict.",
  retrievalRule: "Do not issue a verdict until both fighter records have been found. If either fighter is missing, say the data is incomplete.",
  explainWith: [
    "current rank and OVR",
    "UFC record",
    "title-fight wins and adjusted title credit",
    "Top-5 and ranked wins",
    "prime record and rounds won",
    "finish percentage",
    "active elite years",
    "Peak Apex",
    "loss context",
    "division-only resume when asked",
  ],
  writingStyle: [
    "Start with the verdict",
    "Give the losing fighter a real counterargument",
    "Explain why the winner still wins",
    "Separate better fighter from better UFC-only GOAT resume when relevant",
  ],
  avoid: [
    "hypothetical fight analysis unless directly asked",
    "raw formula narration in normal answers",
    "database or model language",
    "outside citations unless asked",
    "letting a head-to-head winner override totalScore",
    "mentioning knowledge filenames",
  ],
} as const;

export interface BuildOctagonVerdictExportOptions {
  fighters: readonly RankingFighter[];
  inputs: RankingInputDataset;
  divisionReport: DivisionRankingReport;
  generatedAt?: string;
}

interface DirectFightRow {
  date: string;
  winner?: string;
  loser?: string;
  outcome: "win" | "draw" | "no-contest";
  method: string;
  division?: string;
  championshipType: string;
  scoringDisposition: string;
  technicalException: boolean;
}

function qualityWinLedger(fighter: RankingFighter) {
  return arrayRecords((fighter.traces.opponentQuality as { inputs?: unknown }).inputs)
    .map((input) => compactRecord({
      fightId: input.fightId,
      opponent: input.opponent,
      date: input.date,
      finalCredit: round(input.finalCredit),
      countedCredit: round(input.countedCredit),
      tier: clean(input.tierLabel ?? input.qualityTier, 80),
      context: clean(input.context ?? input.note ?? input.notes, 260),
    }))
    .filter((row) => row.opponent)
    .slice(0, 16);
}

function titleWinLedger(fighter: RankingFighter) {
  return arrayRecords((fighter.traces.championship as { inputs?: unknown }).inputs)
    .filter((input) => Number(input.finalAdjustedCredit) > 0)
    .map((input) => compactRecord({
      fightId: input.fightId,
      opponent: input.opponent,
      date: input.date,
      adjustedCredit: round(input.finalAdjustedCredit),
      type: input.type,
      context: clean(input.context ?? input.note ?? input.notes, 260),
    }))
    .filter((row) => row.opponent)
    .slice(0, 20);
}

function lossContextEvents(fighter: RankingFighter) {
  return arrayRecords((fighter.traces.penalty as { events?: unknown }).events)
    .map((event) => compactRecord({
      fightId: event.fightId,
      opponent: event.opponent,
      date: event.date,
      phase: event.phase,
      method: event.methodCategory,
      divisionContext: event.divisionContext,
      upwardDivision: event.upwardDivision,
      technicalException: event.technicalException,
      rawPenalty: round(event.rawPenalty),
      finishExtra: round(event.finishExtra),
      context: clean(event.note ?? event.context, 260),
    }))
    .filter((row) => row.opponent)
    .slice(0, 16);
}

function exportDivisionBoards(divisionReport: DivisionRankingReport) {
  return Object.fromEntries(
    Object.entries(divisionReport.boards).map(([division, rows]) => [
      division,
      (rows ?? []).map((row) => ({
        fighter: row.fighter.name,
        slug: row.fighter.slug,
        division: row.division,
        divisionLabel: row.divisionLabel,
        role: row.role,
        rankEligible: row.rankEligible,
        rank: row.rank,
        overallRank: row.fighter.rank,
        overallOvr: row.fighter.ovr,
        overallScore: round(row.fighter.rawScore),
        divisionScore: round(row.divisionScore),
        resumeSharePct: round(row.resumeSharePct),
        components: row.components,
        stats: row.stats,
      })),
    ]),
  );
}

function deriveDirectMatchups(
  fighters: readonly RankingFighter[],
  inputs: RankingInputDataset,
) {
  const fighterByNormalizedName = new Map(
    fighters.map((fighter) => [normalizedName(fighter.name), fighter]),
  );
  const fighterByName = new Map(fighters.map((fighter) => [fighter.name, fighter]));
  const fightsByPair = new Map<string, { fighters: [string, string]; fights: Map<string, DirectFightRow> }>();

  for (const input of inputs.fighters) {
    const source = fighterByName.get(input.fighter);
    if (!source) continue;

    for (const fight of input.facts.fights) {
      const opponent = fighterByNormalizedName.get(normalizedName(fight.opponent));
      if (!opponent || opponent.name === source.name) continue;

      const key = pairKey(source, opponent);
      const names = [source.name, opponent.name].sort((left, right) => left.localeCompare(right)) as [string, string];
      const bucket = fightsByPair.get(key) ?? { fighters: names, fights: new Map<string, DirectFightRow>() };
      const fightKey = `${fight.date}|${normalizedName(fight.methodCategory)}`;
      const winner = fight.officialResult === "win"
        ? source.name
        : fight.officialResult === "loss"
          ? opponent.name
          : undefined;
      const loser = winner === source.name ? opponent.name : winner === opponent.name ? source.name : undefined;
      const row: DirectFightRow = {
        date: fight.date,
        winner,
        loser,
        outcome: winner ? "win" : fight.officialResult === "draw" ? "draw" : "no-contest",
        method: fight.methodCategory,
        division: fight.division ?? undefined,
        championshipType: fight.championshipType,
        scoringDisposition: fight.scoringDisposition,
        technicalException: fight.scoringDisposition === "technical-exception",
      };

      const existing = bucket.fights.get(fightKey);
      if (existing && (existing.winner !== row.winner || existing.outcome !== row.outcome)) {
        throw new Error(`Canonical direct-fight records disagree for ${key} on ${fight.date}.`);
      }
      bucket.fights.set(fightKey, row);
      fightsByPair.set(key, bucket);
    }
  }

  return [...fightsByPair.entries()]
    .map(([key, bucket]) => {
      const [firstName, secondName] = bucket.fighters;
      const first = fighterByName.get(firstName)!;
      const second = fighterByName.get(secondName)!;
      const fights = [...bucket.fights.values()].sort((left, right) => left.date.localeCompare(right.date));
      const firstWins = fights.filter((fight) => fight.winner === firstName).length;
      const secondWins = fights.filter((fight) => fight.winner === secondName).length;
      const draws = fights.filter((fight) => fight.outcome === "draw").length;
      const noContests = fights.filter((fight) => fight.outcome === "no-contest").length;
      const seriesWinner = firstWins === secondWins ? undefined : firstWins > secondWins ? firstName : secondName;
      const scoreDifference = Math.abs(first.rawScore - second.rawScore);
      const tied = scoreDifference < VERDICT_TIE_EPSILON;
      const verdictWinner = tied ? undefined : first.rawScore > second.rawScore ? first : second;
      const verdictLoser = tied ? undefined : first.rawScore > second.rawScore ? second : first;
      const suffix = [draws ? `${draws} draw${draws === 1 ? "" : "s"}` : "", noContests ? `${noContests} no contest${noContests === 1 ? "" : "s"}` : ""]
        .filter(Boolean)
        .join(", ");
      const summary = seriesWinner
        ? `${seriesWinner} leads the UFC series ${Math.max(firstWins, secondWins)}-${Math.min(firstWins, secondWins)}${suffix ? ` with ${suffix}` : ""}.`
        : `The UFC series is even ${firstWins}-${secondWins}${suffix ? ` with ${suffix}` : ""}.`;

      return {
        pairKey: key,
        fighters: [firstName, secondName],
        slugs: [first.slug, second.slug],
        verdictRule: "The higher totalScore is the UFC-only GOAT comparison winner. Real head-to-head results are context only.",
        verdictStatus: tied ? "essentially-even" : "decided-by-totalScore",
        verdictWinner: verdictWinner?.name,
        verdictLoser: verdictLoser?.name,
        winnerScore: round(verdictWinner?.rawScore),
        loserScore: round(verdictLoser?.rawScore),
        winnerRank: verdictWinner?.rank,
        loserRank: verdictLoser?.rank,
        margin: round(scoreDifference),
        headToHead: {
          seriesWinner,
          fights: fights.length,
          record: {
            [firstName]: firstWins,
            [secondName]: secondWins,
            draws,
            noContests,
          },
          summary,
          fightLedger: fights,
          contextOnly: true,
          doesNotOverrideVerdict: true,
        },
      };
    })
    .sort((left, right) => left.pairKey.localeCompare(right.pairKey));
}

function renderKnowledgeMarkdown(feed: Record<string, unknown>) {
  const fighters = feed.fighters as Array<Record<string, unknown>>;
  const matchups = feed.directFightMatchups as Array<Record<string, unknown>>;
  const lines = [
    "# Octagon Verdict — UFC-Only GOAT Knowledge",
    "",
    `Generated: ${feed.generatedAt}`,
    `Model through: ${(feed.sourceVersions as Record<string, unknown>).modelAsOfDate}`,
    "",
    "## Operating rules",
    "",
    `- ${octagonVerdictGuidance.sourceOfTruth}`,
    `- ${octagonVerdictGuidance.divisionRule}`,
    `- ${octagonVerdictGuidance.scope}`,
    `- ${octagonVerdictGuidance.verdictRule}`,
    `- ${octagonVerdictGuidance.retrievalRule}`,
    "- Start with the verdict, give the losing fighter's real counterargument, and explain why the winner still wins.",
    "- Separate better fighter from better UFC-only GOAT resume when relevant.",
    "",
    "## Current boards",
    "",
    "### Men's all-time board",
    ...fighters.filter((fighter) => fighter.group === "men").map((fighter) => `${fighter.rank}. ${fighter.name} — ${fighter.appOvr} OVR — ${fighter.totalScore} total score`),
    "",
    "### Women's all-time board",
    ...fighters.filter((fighter) => fighter.group === "women").map((fighter) => `${fighter.rank}. ${fighter.name} — ${fighter.appOvr} OVR — ${fighter.totalScore} total score`),
    "",
    "## Fighter records",
    "",
  ];

  for (const fighter of fighters) {
    const categories = fighter.categories as Record<string, unknown>;
    lines.push(
      `### ${fighter.name}`,
      "",
      `- Board/rank: ${fighter.group} #${fighter.rank}`,
      `- OVR / total score: ${fighter.appOvr} / ${fighter.totalScore}`,
      `- Division: ${fighter.division}`,
      `- UFC record: ${fighter.ufcRecord}`,
      `- Title-fight wins / adjusted title wins: ${fighter.titleFightWins} / ${fighter.adjustedTitleWins}`,
      `- Top-5 wins / ranked wins: ${fighter.topFiveWins} / ${fighter.rankedWins}`,
      `- Prime record / rounds won: ${fighter.primeRecord} / ${fighter.roundsWonPct}%`,
      `- Finish rate / active elite years: ${fighter.finishRatePct}% / ${fighter.activeEliteYears}`,
      `- Categories: Championship ${categories.championship}; Opponent Quality ${categories.opponentQuality}; Prime Dominance ${categories.primeDominance}; Longevity ${categories.longevity}; Peak Apex ${categories.apexPeak}; Loss Context ${categories.lossPenalty}; Era Depth ${categories.divisionEraDepth}`,
      `- Case: ${fighter.shortCase}`,
      `- Why ranked here: ${fighter.whyRankedHere}`,
      `- Why not higher: ${fighter.whyNotHigher}`,
      `- Final takeaway: ${fighter.finalTakeaway}`,
      "",
    );
  }

  lines.push("## Direct UFC matchups", "");
  for (const matchup of matchups) {
    const headToHead = matchup.headToHead as Record<string, unknown>;
    lines.push(
      `### ${(matchup.fighters as string[]).join(" vs. ")}`,
      "",
      `- UFC-only GOAT verdict winner: ${matchup.verdictWinner ?? "Essentially even"}`,
      `- Score margin: ${matchup.margin}`,
      `- Head-to-head context: ${headToHead.summary}`,
      "- The head-to-head result is context only and never overrides the current total-score verdict.",
      "",
    );
  }

  return `${lines.join("\n").trim()}\n`;
}

export function buildOctagonVerdictExport({
  fighters,
  inputs,
  divisionReport,
  generatedAt = new Date().toISOString(),
}: BuildOctagonVerdictExportOptions) {
  if (!divisionReport.passed) throw new Error("Division ranking report must pass before export.");
  if (fighters.length !== inputs.counts.fighters) {
    throw new Error(`Expected ${inputs.counts.fighters} fighters, received ${fighters.length}.`);
  }

  const names = new Set(fighters.map((fighter) => fighter.name));
  const slugs = new Set(fighters.map((fighter) => fighter.slug));
  if (names.size !== fighters.length || slugs.size !== fighters.length) {
    throw new Error("Fighter names and slugs must be unique before export.");
  }

  const inputByName = new Map(inputs.fighters.map((input) => [input.fighter, input]));
  const divisionBoards = exportDivisionBoards(divisionReport);
  const divisionRowsBySlug = new Map<string, Array<Record<string, unknown>>>();
  Object.values(divisionBoards).flat().forEach((row) => {
    const bucket = divisionRowsBySlug.get(row.slug) ?? [];
    bucket.push(row);
    divisionRowsBySlug.set(row.slug, bucket);
  });

  const exportedFighters = fighters
    .slice()
    .sort((left, right) => left.board !== right.board ? (left.board === "men" ? -1 : 1) : left.rank - right.rank)
    .map((fighter) => {
      const input = inputByName.get(fighter.name);
      if (!input) throw new Error(`Missing canonical inputs for ${fighter.name}.`);
      const qualityWins = qualityWinLedger(fighter);
      const primeStats = (fighter.traces.primeDominance as { stats?: Record<string, unknown> }).stats ?? {};
      const apex = fighter.traces.apex as { performances?: unknown; components?: unknown; notes?: unknown };
      return compactRecord({
        slug: fighter.slug,
        name: fighter.name,
        group: fighter.board,
        rank: fighter.rank,
        appOvr: fighter.ovr,
        totalScore: round(fighter.rawScore),
        displayName: fighter.name,
        profileDisplayName: fighter.name,
        photoUrl: fighter.profileUrl,
        thumbUrl: fighter.thumbUrl,
        watchUrl: input.presentation.watchUrl,
        watchLabel: input.presentation.watchLabel,
        signatureFightUrl: input.presentation.signatureFightUrl,
        signatureFightLabel: input.presentation.signatureFightLabel,
        categories: {
          championship: round(fighter.championship),
          opponentQuality: round(fighter.opponentQuality),
          primeDominance: round(fighter.primeDominance),
          longevity: round(fighter.longevity),
          apexPeak: round(fighter.apexPeak),
          lossPenalty: round(fighter.penalty),
          divisionEraDepth: round(fighter.eraDepth),
        },
        division: fighter.division,
        divisionBoards: divisionRowsBySlug.get(fighter.slug) ?? [],
        tag: fighter.resumeTag,
        ufcRecord: fighter.visibleStats.ufcRecord,
        titleFightWins: fighter.visibleStats.titleFightWins,
        adjustedTitleWins: round(fighter.visibleStats.adjustedTitleWins),
        topFiveWins: fighter.visibleStats.topFiveWins,
        rankedWins: fighter.visibleStats.rankedWins,
        bestWins: qualityWins.slice(0, 8).map((win) => win.opponent),
        qualityWinLedger: qualityWins,
        titleWinLedger: titleWinLedger(fighter),
        primeRecord: fighter.visibleStats.primeRecord,
        primeWindow: {
          startFightId: input.facts.primeWindow.startFightId,
          endFightId: input.facts.primeWindow.endFightId,
          open: input.facts.primeWindow.open,
          startDate: primeStats.eraStartDate,
          endDate: primeStats.eraEndDate,
        },
        roundsWonPct: round(fighter.visibleStats.roundsWonPct),
        finishRatePct: round(fighter.visibleStats.finishRatePct),
        activeEliteYears: round(fighter.visibleStats.activeEliteYears),
        timesFinishedPrime: fighter.visibleStats.timesFinishedPrime,
        apexPeakDetail: {
          bonus: round(fighter.apexPeak),
          performances: apex.performances ?? [],
          components: apex.components ?? {},
          notes: clean(apex.notes, 400),
        },
        lossContextEvents: lossContextEvents(fighter),
        divisionEraDepthDetail: {
          adjustment: round(fighter.eraDepth),
          depthIndex: round((fighter.traces.eraDepth as { depthIndex?: unknown }).depthIndex),
          source: (fighter.traces.eraDepth as { source?: unknown }).source,
        },
        shortCase: clean(fighter.oneLiner, 650),
        bestArgument: clean(fighter.finalTakeaway, 650),
        counterArgument: clean(fighter.whyNotHigher, 650),
        whyRankedHere: clean(fighter.whyRankedHere, 750),
        whyNotHigher: clean(fighter.whyNotHigher, 750),
        finalTakeaway: clean(fighter.finalTakeaway, 650),
        keyJudgmentCalls: fighter.judgmentCalls,
        divisionStrength: fighter.divisionStrength,
      });
    });

  const directFightMatchups = deriveDirectMatchups(fighters, inputs);
  if (!directFightMatchups.length) throw new Error("No direct ranked-fighter matchups were derived.");

  const sourceVersions = {
    app: "Octagon HQ V2",
    rankingInputSchema: inputs.schemaVersion,
    modelAsOfDate: inputs.source.modelAsOfDate,
    sourceRepository: inputs.source.repository,
    sourceCommit: inputs.source.commit,
    factsVersion: inputs.source.factsVersion,
    judgmentVersion: inputs.source.judgmentVersion,
    eraLedgerVersion: inputs.source.eraLedgerVersion,
    eraDepthVersion: inputs.source.eraDepthVersion,
  };
  const feed = {
    name: "Octagon Verdict Data",
    version: inputs.source.modelAsOfDate,
    generatedAt,
    source: "octagon-hq-v2-calculated-typescript",
    sourceVersions,
    defaultScope: octagonVerdictGuidance.scope,
    guidance: octagonVerdictGuidance,
    fighterCount: exportedFighters.length,
    divisionBoards,
    fighters: exportedFighters,
    directFightMatchups,
  };
  const index = {
    name: "Octagon Verdict Index",
    version: inputs.source.modelAsOfDate,
    generatedAt,
    source: feed.source,
    sourceVersions,
    guidance: octagonVerdictGuidance,
    fighterCount: exportedFighters.length,
    divisionBoardCount: Object.keys(divisionBoards).length,
    directMatchupCount: directFightMatchups.length,
    fighters: exportedFighters.map((fighter) => compactRecord({
      slug: fighter.slug,
      name: fighter.name,
      group: fighter.group,
      rank: fighter.rank,
      appOvr: fighter.appOvr,
      totalScore: fighter.totalScore,
      division: fighter.division,
      tag: fighter.tag,
    })),
    directFightMatchups: directFightMatchups.map((matchup) => ({
      pairKey: matchup.pairKey,
      fighters: matchup.fighters,
      verdictWinner: matchup.verdictWinner,
      verdictLoser: matchup.verdictLoser,
      margin: matchup.margin,
      headToHead: matchup.headToHead,
    })),
  };

  return {
    feed,
    index,
    fighters: exportedFighters,
    matchups: directFightMatchups,
    knowledgeMarkdown: renderKnowledgeMarkdown(feed),
  };
}
