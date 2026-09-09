import {
  footballCareerAffiliationHistoryFor,
  type FootballCareerAffiliationHistory,
} from "../back-room/footballCareerAffiliationProjection";
import {
  getFootballFactualRecord,
  type FootballFactMetricId,
} from "../back-room/footballFactualStatsCore";
import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";

export const WHO_AM_I_IDENTITY_FACT_FAMILIES = [
  "role-position",
  "era",
  "school-team",
  "recognition",
  "draft-path",
  "awards",
  "championships",
  "postseason",
  "career-production",
  "career-path",
  "relationships",
  "rivalry-moment",
  "nickname",
  "style-archetype",
  "nationality",
  "sport-specific",
] as const;

export type WhoAmIIdentityFactFamily = (typeof WHO_AM_I_IDENTITY_FACT_FAMILIES)[number];

export type WhoAmIIdentityFactSourceOwner =
  | "ufc-factual-ledger"
  | "football-subject-registry"
  | "football-factual-stats"
  | "football-career-affiliation";

export type WhoAmIIdentityFactValue =
  | { type: "scalar"; value: string | number | boolean }
  | { type: "list"; values: readonly (string | number)[] }
  | { type: "window"; start: number; end: number }
  | {
      type: "relationship";
      relation: "beat" | "lost-to" | "faced";
      name: string;
      result?: "win" | "loss" | "draw" | "no-contest";
    };

export interface WhoAmIIdentityFactSource {
  owner: WhoAmIIdentityFactSourceOwner;
  subjectId: string;
  referenceId?: string;
}

/**
 * Canonical Who Am I knowledge is structured data first. Player-facing wording,
 * clue strength, reveal ordering, and replay selection intentionally do not live
 * on the fact model; the clue assembler owns those concerns in a later phase.
 */
export interface WhoAmIIdentityFact {
  id: string;
  family: WhoAmIIdentityFactFamily;
  value: WhoAmIIdentityFactValue;
  source: WhoAmIIdentityFactSource;
}

export interface WhoAmIIdentityFactBank {
  subjectId: string;
  sport: "ufc" | "football";
  league: "UFC" | "NFL" | "CFB";
  facts: readonly WhoAmIIdentityFact[];
}

/** Quality targets for the enrichment PRs; PR 2 does not make them playability gates. */
export const WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET = 15;
export const WHO_AM_I_IDENTITY_FACT_PREFERRED_TARGET = 20;

const recognizableUfcNames = new Set(ufcFactualLedgerSubjects.map((subject) => subject.name.toLowerCase()));

function source(
  owner: WhoAmIIdentityFactSourceOwner,
  subjectId: string,
  referenceId?: string,
): WhoAmIIdentityFactSource {
  return { owner, subjectId, ...(referenceId ? { referenceId } : {}) };
}

function scalar(
  id: string,
  family: WhoAmIIdentityFactFamily,
  value: string | number | boolean,
  factSource: WhoAmIIdentityFactSource,
): WhoAmIIdentityFact {
  return { id, family, value: { type: "scalar", value }, source: factSource };
}

function list(
  id: string,
  family: WhoAmIIdentityFactFamily,
  values: readonly (string | number)[],
  factSource: WhoAmIIdentityFactSource,
): WhoAmIIdentityFact {
  return { id, family, value: { type: "list", values }, source: factSource };
}

function windowFact(
  id: string,
  family: WhoAmIIdentityFactFamily,
  start: number,
  end: number,
  factSource: WhoAmIIdentityFactSource,
): WhoAmIIdentityFact {
  return { id, family, value: { type: "window", start, end }, source: factSource };
}

function relationship(
  id: string,
  family: WhoAmIIdentityFactFamily,
  relation: "beat" | "lost-to" | "faced",
  name: string,
  factSource: WhoAmIIdentityFactSource,
  result?: "win" | "loss" | "draw" | "no-contest",
): WhoAmIIdentityFact {
  return {
    id,
    family,
    value: { type: "relationship", relation, name, ...(result ? { result } : {}) },
    source: factSource,
  };
}

function finishBank(bank: WhoAmIIdentityFactBank): WhoAmIIdentityFactBank {
  const ids = new Set<string>();
  for (const fact of bank.facts) {
    if (!fact.id.trim()) throw new Error(`Who Am I ${bank.subjectId} has a fact with no id.`);
    if (ids.has(fact.id)) throw new Error(`Who Am I ${bank.subjectId} has duplicate fact id ${fact.id}.`);
    if (fact.source.subjectId !== bank.subjectId) {
      throw new Error(`Who Am I ${bank.subjectId} fact ${fact.id} points at ${fact.source.subjectId}.`);
    }
    if (fact.value.type === "scalar" && typeof fact.value.value === "string" && !fact.value.value.trim()) {
      throw new Error(`Who Am I ${bank.subjectId} fact ${fact.id} has an empty value.`);
    }
    if (fact.value.type === "list" && !fact.value.values.length) {
      throw new Error(`Who Am I ${bank.subjectId} fact ${fact.id} has an empty list.`);
    }
    if (fact.value.type === "relationship" && !fact.value.name.trim()) {
      throw new Error(`Who Am I ${bank.subjectId} fact ${fact.id} has an empty relationship.`);
    }
    ids.add(fact.id);
  }
  return bank;
}

function ufcRelation(result: UfcFactualSubject["fights"][number]["result"]) {
  if (result === "win") return "beat" as const;
  if (result === "loss") return "lost-to" as const;
  return "faced" as const;
}

export function ufcWhoAmIIdentityFactBank(subject: UfcFactualSubject): WhoAmIIdentityFactBank {
  const wins = subject.fights.filter((fight) => fight.result === "win");
  const koWins = wins.filter((fight) => fight.methodCategory === "ko-tko");
  const submissionWins = wins.filter((fight) => fight.methodCategory === "submission");
  const titleFights = subject.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  const divisions = [...new Set([
    subject.primaryDivision,
    ...subject.secondaryDivisions,
    ...subject.fights.map((fight) => fight.division),
  ])];
  const startYear = Number(subject.activeFrom.slice(0, 4));
  const endYear = Number(subject.activeTo.slice(0, 4));
  const activeDecades = [...new Set(subject.fights.map((fight) => (
    Math.floor(Number(fight.date.slice(0, 4)) / 10) * 10
  )))].sort((left, right) => left - right);
  const recognizableFights = subject.fights.filter((fight) => recognizableUfcNames.has(fight.opponent.toLowerCase()));
  const ledger = source("ufc-factual-ledger", subject.id);
  const facts: WhoAmIIdentityFact[] = [
    scalar("primary-division", "role-position", subject.primaryDivision, ledger),
    list("divisions", "role-position", divisions, ledger),
    windowFact("career-window", "era", startYear, endYear, ledger),
    list("active-decades", "era", activeDecades, ledger),
    scalar("ufc-fight-count", "career-production", subject.fights.length, ledger),
    scalar("ufc-win-count", "career-production", wins.length, ledger),
    scalar("ufc-ko-wins", "style-archetype", koWins.length, ledger),
    scalar("ufc-submission-wins", "style-archetype", submissionWins.length, ledger),
    scalar("ufc-title-fights", "championships", titleFights.length, ledger),
  ];

  if (titleWins.length) facts.push(scalar("ufc-title-wins", "championships", titleWins.length, ledger));
  if (koWins.length > submissionWins.length && koWins.length >= 3) {
    facts.push(scalar("finish-tendency", "style-archetype", "knockout", ledger));
  } else if (submissionWins.length > koWins.length && submissionWins.length >= 3) {
    facts.push(scalar("finish-tendency", "style-archetype", "submission", ledger));
  }

  for (const fight of recognizableFights) {
    facts.push(relationship(
      `opponent:${fight.id}`,
      "relationships",
      ufcRelation(fight.result),
      fight.opponent,
      source("ufc-factual-ledger", subject.id, fight.id),
      fight.result,
    ));
  }

  return finishBank({ subjectId: subject.id, sport: "ufc", league: "UFC", facts });
}

function footballMetricFamily(metricId: FootballFactMetricId): WhoAmIIdentityFactFamily {
  if (/postseason/.test(metricId)) return "postseason";
  if (/mvp|heisman|all-pro|player-of-year/.test(metricId)) return "awards";
  if (/super-bowl|national-title|conference-title/.test(metricId)) return "championships";
  return "career-production";
}

function factIdSegment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nflDraftSelectionBand(subject: FootballSubjectProfile) {
  if (subject.undrafted) return "undrafted";
  if (subject.draftPick != null) {
    if (subject.draftPick <= 5) return "top-five";
    if (subject.draftPick <= 10) return "top-ten";
  }
  if (subject.draftRound === 1) return "first-round";
  if (subject.draftRound != null && subject.draftRound <= 3) return "rounds-two-three";
  if (subject.draftRound != null) return "round-four-or-later";
  return null;
}

function careerDurationBand(seasons: number) {
  if (seasons >= 15) return "15-plus-seasons";
  if (seasons >= 10) return "10-to-14-seasons";
  if (seasons >= 6) return "6-to-9-seasons";
  return "1-to-5-seasons";
}

function nflATierEnrichmentFacts(
  subject: FootballSubjectProfile,
  history: FootballCareerAffiliationHistory | null,
): WhoAmIIdentityFact[] {
  if (subject.league !== "NFL" || subject.recognizabilityTier !== "A") return [];

  const registry = source("football-subject-registry", subject.id);
  const affiliationSource = source("football-career-affiliation", subject.id);
  const facts: WhoAmIIdentityFact[] = [];
  const observedSeasons = history?.seasons.map((row) => row.season) ?? [];
  const observedStart = observedSeasons.length ? Math.min(...observedSeasons) : null;
  const observedEnd = observedSeasons.length ? Math.max(...observedSeasons) : null;
  const startSeason = subject.startSeason ?? observedStart;
  const endSeason = subject.endSeason ?? observedEnd;
  const careerSource = subject.startSeason != null && subject.endSeason != null ? registry : affiliationSource;

  if (startSeason != null && endSeason != null) {
    const startDecade = Math.floor(startSeason / 10) * 10;
    const endDecade = Math.floor(endSeason / 10) * 10;
    const careerSpan = endSeason - startSeason + 1;
    const decadeCount = Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1;
    const midpointSeason = Math.floor((startSeason + endSeason) / 2);
    const midpointDecade = Math.floor(midpointSeason / 10) * 10;

    if (subject.startSeason == null || subject.endSeason == null) {
      facts.push(windowFact("career-window", "era", startSeason, endSeason, careerSource));
    }
    if (!subject.activeDecades?.length) {
      facts.push(list(
        "active-decades",
        "era",
        Array.from({ length: decadeCount }, (_, index) => startDecade + index * 10),
        careerSource,
      ));
    }
    facts.push(
      scalar("career-span-seasons", "era", careerSpan, careerSource),
      scalar("career-start-season", "era", startSeason, careerSource),
      scalar("career-end-season", "era", endSeason, careerSource),
      scalar("career-start-decade", "era", startDecade, careerSource),
      scalar("career-end-decade", "era", endDecade, careerSource),
      scalar("career-decade-count", "era", decadeCount, careerSource),
      scalar("career-spans-multiple-decades", "era", startDecade !== endDecade, careerSource),
      scalar("career-duration-band", "era", careerDurationBand(careerSpan), careerSource),
      scalar("career-midpoint-decade", "era", midpointDecade, careerSource),
    );
  }

  if (subject.draftYear != null) {
    facts.push(scalar(
      "draft-decade",
      "draft-path",
      Math.floor(subject.draftYear / 10) * 10,
      registry,
    ));
  }
  const draftSelectionBand = nflDraftSelectionBand(subject);
  if (draftSelectionBand) {
    facts.push(scalar("draft-selection-band", "draft-path", draftSelectionBand, registry));
  }

  if (history?.affiliations.length) {
    facts.push(scalar(
      "career-affiliation-count",
      "career-path",
      history.affiliations.length,
      affiliationSource,
    ));

    for (const affiliation of history.affiliations) {
      const idSegment = factIdSegment(affiliation);
      const rows = history.seasons.filter((row) => row.affiliation === affiliation);
      facts.push(scalar(
        `career-affiliation:${idSegment}`,
        "career-path",
        affiliation,
        source("football-career-affiliation", subject.id, affiliation),
      ));
      if (rows.length) {
        const seasons = rows.map((row) => row.season);
        facts.push(windowFact(
          `career-affiliation-window:${idSegment}`,
          "career-path",
          Math.min(...seasons),
          Math.max(...seasons),
          source("football-career-affiliation", subject.id, affiliation),
        ));
      }
    }
  } else if (subject.franchises?.length) {
    facts.push(list("registered-franchises", "career-path", subject.franchises, registry));
    facts.push(scalar("career-affiliation-count", "career-path", subject.franchises.length, registry));
  }

  return facts;
}

export function footballWhoAmIIdentityFactBank(subject: FootballSubjectProfile): WhoAmIIdentityFactBank {
  const registry = source("football-subject-registry", subject.id);
  const facts: WhoAmIIdentityFact[] = [];
  const isCoach = subject.kind === "coach";

  if (isCoach) facts.push(scalar("role", "role-position", "head-coach", registry));
  else if (subject.position) facts.push(scalar("position", "role-position", subject.position, registry));

  if (subject.activeDecades?.length) facts.push(list("active-decades", "era", subject.activeDecades, registry));
  if (subject.startSeason != null && subject.endSeason != null) {
    facts.push(windowFact("career-window", "era", subject.startSeason, subject.endSeason, registry));
  }
  if (subject.school) facts.push(scalar("school", "school-team", subject.school, registry));
  if (subject.conference) facts.push(scalar("conference", "school-team", subject.conference, registry));
  if (subject.draftYear != null) facts.push(scalar("draft-year", "draft-path", subject.draftYear, registry));
  if (subject.draftRound != null) facts.push(scalar("draft-round", "draft-path", subject.draftRound, registry));
  if (subject.draftPick != null) facts.push(scalar("draft-pick", "draft-path", subject.draftPick, registry));
  if (subject.firstOverallPick) facts.push(scalar("draft-status", "draft-path", "first-overall", registry));
  else if (subject.firstRoundPick) facts.push(scalar("draft-status", "draft-path", "first-round", registry));
  else if (subject.undrafted) facts.push(scalar("draft-status", "draft-path", "undrafted", registry));
  if (subject.nationalChampion) facts.push(scalar("national-champion", "championships", true, registry));

  const factualRecord = getFootballFactualRecord(subject.id);
  const metricFacts = (factualRecord?.facts ?? []).filter((fact) => Number(fact.value) !== 0);
  const hasHeismanMetric = metricFacts.some((fact) => fact.metricId === "cfb-heisman-awards");
  if (subject.heismanWinner && !hasHeismanMetric) facts.push(scalar("heisman", "awards", true, registry));

  for (const fact of metricFacts) {
    facts.push(scalar(
      `metric:${fact.metricId}`,
      footballMetricFamily(fact.metricId),
      fact.value,
      source("football-factual-stats", subject.id, fact.metricId),
    ));
  }

  const history = footballCareerAffiliationHistoryFor(subject);
  if (history?.affiliations.length) {
    facts.push(list(
      "career-affiliations",
      "career-path",
      history.affiliations,
      source("football-career-affiliation", subject.id),
    ));
  }
  if (history?.conferences.length) {
    facts.push(list(
      "historical-conferences",
      "school-team",
      history.conferences,
      source("football-career-affiliation", subject.id),
    ));
  }

  facts.push(...nflATierEnrichmentFacts(subject, history));

  return finishBank({ subjectId: subject.id, sport: "football", league: subject.league, facts });
}
