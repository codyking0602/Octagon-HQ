import {
  getFootballPersonIdentityKnowledge,
  getFootballPersonIdentityKnowledgeForPerson,
  type FootballPersonIdentityFact,
} from "../back-room/footballPersonIdentityKnowledge";
import { footballRecognitionEvidenceFor } from "../back-room/footballRecognitionEvidence";
import {
  footballFactMetricDefinitions,
  formatFootballFact,
  getFootballFactualRecord,
  type FootballFactMetricId,
  type FootballFactValue,
} from "../back-room/footballFactualStatsCore";
import {
  footballPlayerCareerSubjectsForPerson,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";
import { getUfcPersonIdentityKnowledge } from "../back-room/ufcPersonIdentityKnowledge";
import { whoAmIIdentityKnowledgeClue } from "./whoAmIClueAssembler";
import {
  createWhoAmIRound,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmIClueBand,
  type WhoAmIEraBand,
  type WhoAmIRound,
  type WhoAmIUniverse,
} from "./whoAmIEngine";

const metricLabelById = new Map(footballFactMetricDefinitions.map((metric) => [metric.id, metric.label]));

const FOOTBALL_WHO_AM_I_METRICS = new Set<FootballFactMetricId>(
  footballFactMetricDefinitions
    .map((metric) => metric.id as FootballFactMetricId)
    .filter((metricId) => (
      metricId.startsWith("nfl-career-")
      || metricId.startsWith("cfb-career-")
      || metricId.startsWith("cfb-best-season-")
      || metricId === "cfb-all-america-selections"
      || metricId === "cfb-first-team-all-conference-selections"
      || metricId === "cfb-nfl-draft-overall-pick"
      || metricId === "cfb-national-championships-won"
      || metricId === "cfb-coach-career-ties"
      || metricId === "nfl-ap-mvp-awards"
      || metricId === "nfl-super-bowl-titles"
      || metricId === "nfl-defensive-player-of-year-awards"
      || metricId === "nfl-first-team-all-pros"
      || metricId === "nfl-coach-seasons-since-1999"
      || metricId === "nfl-coach-win-percentage-since-1999"
      || metricId === "nfl-coach-postseason-resume-since-1999"
      || metricId === "cfb-heisman-awards"
      || metricId === "cfb-coach-career-wins"
      || metricId === "cfb-coach-career-losses"
      || metricId === "cfb-coach-national-titles"
      || metricId === "cfb-coach-conference-titles"
    )),
);

const NFL_TEAM_NAMES: Readonly<Record<string, string>> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills",
  CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs",
  LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clue(id: string, text: string, band: WhoAmIClueBand): WhoAmIClue {
  return { id, text, band };
}

function distinctClues(clues: readonly WhoAmIClue[]) {
  const seen = new Set<string>();
  return clues.filter((row) => {
    const key = row.text.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ufcPersonIdentityClues(subject: UfcFactualSubject): WhoAmIClue[] {
  const knowledge = getUfcPersonIdentityKnowledge(subject.id);
  if (!knowledge) return [];
  return knowledge.facts.map((fact) => whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind: "fighter",
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
  }));
}

const SHARED_PERSON_IDENTITY_TAGS = new Set([
  "childhood",
  "family",
  "high-school",
  "multi-sport",
  "baseball",
  "basketball",
  "lacrosse",
  "track",
  "hockey",
  "education",
  "off-field",
  "work",
  "training",
  "community",
  "military",
  "media",
  "media-identity",
  "music",
  "faith",
  "hometown",
  "ranching",
  "personality",
  "labor",
  "relationship",
  "relationships",
  "teammate",
  "teammates",
  "origin-story",
  "identity",
]);

const STAGE_SPECIFIC_IDENTITY_TAGS = new Set([
  "college",
  "junior-college",
  "iconic-moment",
  "franchise",
  "super-bowl",
  "award",
  "hall-of-fame",
  "championship",
  "playing-career",
  "coaching",
  "coaching-path",
  "coach",
  "team-impact",
  "league-history",
  "career-start",
  "career-turning-point",
  "breakthrough",
  "turning-point",
  "special-teams",
  "career-path",
  "position-path",
  "scoring",
]);

function footballIdentityFactScope(fact: FootballPersonIdentityFact): "person-shared" | "transition" | "stage-specific" {
  const tags = new Set(fact.tags ?? []);
  const concept = fact.conceptId.toLowerCase().split("--").at(-1) ?? fact.conceptId.toLowerCase();
  const words = new Set(concept.split(/[^a-z0-9]+/).filter(Boolean));
  const hasConcept = (...terms: readonly string[]) => terms.some((term) => (
    concept.includes(term) || words.has(term)
  ));

  if (
    tags.has("draft")
    || tags.has("transition")
    || hasConcept("draft", "transition")
  ) return "transition";

  const sharedByConcept = hasConcept(
    "childhood", "family", "father", "mother", "parent", "brother", "sister",
    "high-school", "prep", "multisport", "multi-sport", "baseball", "basketball",
    "lacrosse", "track", "hockey", "education", "degree", "training", "workout",
    "upbringing", "hometown", "off-field", "community", "charity", "donation",
    "gift", "mentor", "nickname", "name", "media", "music", "faith", "military",
    "ranch", "personality", "book", "lifestyle", "soccer",
  );
  if (
    [...tags].some((tag) => SHARED_PERSON_IDENTITY_TAGS.has(tag))
    || sharedByConcept
  ) return "person-shared";

  if (
    [...tags].some((tag) => STAGE_SPECIFIC_IDENTITY_TAGS.has(tag))
    || hasConcept(
      "college", "recruit", "redshirt", "freshman", "scout-team", "award",
      "heisman", "all-america", "championship", "super-bowl", "franchise",
      "career", "breakthrough", "turning-point",
    )
  ) return "stage-specific";

  return "stage-specific";
}

export interface FootballWhoAmIApplicableIdentityFact {
  sourceSubjectId: string;
  fact: FootballPersonIdentityFact;
  applicability: "subject-stage" | "person-shared" | "transition";
}

export function footballWhoAmIApplicableIdentityFacts(subject: FootballSubjectProfile): FootballWhoAmIApplicableIdentityFact[] {
  const direct = getFootballPersonIdentityKnowledge(subject.id);
  const applicable: FootballWhoAmIApplicableIdentityFact[] = [];
  const seenConcepts = new Set<string>();

  if (direct) {
    for (const fact of direct.facts) {
      applicable.push({ sourceSubjectId: direct.subjectId, fact, applicability: "subject-stage" });
      seenConcepts.add(fact.conceptId);
    }
  }

  if (subject.kind !== "player-career") return applicable;

  for (const knowledge of getFootballPersonIdentityKnowledgeForPerson(subject)) {
    if (knowledge.subjectId === direct?.subjectId) continue;
    for (const fact of knowledge.facts) {
      if (seenConcepts.has(fact.conceptId)) continue;
      const scope = footballIdentityFactScope(fact);
      if (scope === "stage-specific") continue;
      applicable.push({
        sourceSubjectId: knowledge.subjectId,
        fact,
        applicability: scope,
      });
      seenConcepts.add(fact.conceptId);
    }
  }

  return applicable;
}

function footballPersonIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const subjectKind = subject.kind === "coach" ? "coach" : "player";
  return footballWhoAmIApplicableIdentityFacts(subject).map(({ fact }) => whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind,
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
    tags: fact.tags,
  }));
}

function ufcDivision(value: string) {
  return value
    .replace(/^women-s-/, "Women's ")
    .replace(/^womens-/, "Women's ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function eraBand(startYear: number, endYear: number): WhoAmIEraBand {
  return ((startYear + endYear) / 2) >= 2000 ? "modern" : "legacy";
}

function footballEraBand(subject: FootballSubjectProfile): WhoAmIEraBand | undefined {
  if (subject.startSeason == null && subject.endSeason == null) return undefined;
  const start = subject.startSeason ?? subject.endSeason!;
  const end = subject.endSeason ?? subject.startSeason!;
  return eraBand(start, end);
}

function displayAffiliation(league: "NFL" | "CFB", value: string) {
  return league === "NFL" ? NFL_TEAM_NAMES[value] ?? value : value;
}

function nflProfileDepth(subject: FootballSubjectProfile) {
  const recordDepth = getFootballFactualRecord(subject.id)?.facts.length ?? 0;
  const identityDepth = [
    subject.startSeason,
    subject.endSeason,
    subject.draftYear,
    subject.draftRound,
    subject.draftPick,
    subject.franchises?.length,
  ].filter((value) => value != null).length;
  return recordDepth * 10 + identityDepth;
}

function hasFootballDraftIdentity(subject: FootballSubjectProfile) {
  return (
    subject.draftYear != null
    || subject.draftRound != null
    || subject.draftPick != null
    || subject.firstRoundPick
    || subject.firstOverallPick
    || subject.undrafted
  );
}

function footballDraftProfile(subject: FootballSubjectProfile) {
  if (hasFootballDraftIdentity(subject)) return subject;
  if (subject.kind !== "player-career") return subject;
  return [...footballPlayerCareerSubjectsForPerson(subject)]
    .filter((candidate) => candidate.league === "NFL")
    .filter(hasFootballDraftIdentity)
    .sort((left, right) => (
      Number(right.draftPick != null) - Number(left.draftPick != null)
      || Number(right.draftRound != null) - Number(left.draftRound != null)
      || Number(right.draftYear != null) - Number(left.draftYear != null)
      || nflProfileDepth(right) - nflProfileDepth(left)
      || left.id.localeCompare(right.id)
    ))[0] ?? subject;
}

function ufcCandidate(subject: UfcFactualSubject): WhoAmICandidate {
  const wins = subject.fights.filter((fight) => fight.result === "win");
  const losses = subject.fights.filter((fight) => fight.result === "loss");
  const koWins = wins.filter((fight) => fight.methodCategory === "ko-tko");
  const submissionWins = wins.filter((fight) => fight.methodCategory === "submission");
  const titleFights = subject.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  const divisions = [...new Set([subject.primaryDivision, ...subject.secondaryDivisions, ...subject.fights.map((fight) => fight.division)])];
  const debutYear = Number(subject.activeFrom.slice(0, 4));
  const lastYear = Number(subject.activeTo.slice(0, 4));
  const activeDecades = [...new Set(subject.fights.map((fight) => Math.floor(Number(fight.date.slice(0, 4)) / 10) * 10))].sort();
  const recognizableNames = new Set(ufcFactualLedgerSubjects.map((fighter) => fighter.name.toLowerCase()));
  const recognizableFights = subject.fights.filter((fight) => recognizableNames.has(fight.opponent.toLowerCase()));

  const clues: WhoAmIClue[] = [
    clue("division", `My primary UFC division is ${ufcDivision(subject.primaryDivision)}.`, "broad"),
    clue("debut-decade", `I made my UFC debut in the ${Math.floor(debutYear / 10) * 10}s.`, "broad"),
    clue("active-window", `My UFC career stretched from ${debutYear} to ${lastYear}.`, "helpful"),
    clue("fight-count", `I had ${subject.fights.length} UFC fights.`, "helpful"),
    clue("win-count", `I earned ${wins.length} UFC wins.`, "helpful"),
    clue("ko-wins", `I earned ${koWins.length} UFC wins by KO or TKO.`, "strong"),
    clue("submission-wins", `I earned ${submissionWins.length} UFC submission wins.`, "strong"),
    clue("title-fights", `I competed in ${titleFights.length} UFC title fights.`, "strong"),
  ];

  if (divisions.length > 1) clues.push(clue("division-count", `I competed in ${divisions.length} UFC divisions.`, "helpful"));
  if (activeDecades.length > 1) clues.push(clue("decades", `My UFC career crossed ${activeDecades.length} decades.`, "helpful"));
  if (titleWins.length) clues.push(clue("title-wins", `I won ${titleWins.length} UFC title fights.`, "strong"));
  if (koWins.length > submissionWins.length && koWins.length >= 3) clues.push(clue("finish-style", "My UFC wins leaned much more toward knockouts than submissions.", "helpful"));
  if (submissionWins.length > koWins.length && submissionWins.length >= 3) clues.push(clue("finish-style", "My UFC wins leaned more toward submissions than knockouts.", "helpful"));

  for (const fight of recognizableFights) {
    if (fight.result === "win") clues.push(clue(`beat:${fight.id}`, `I defeated ${fight.opponent} in the UFC.`, "giveaway"));
    else if (fight.result === "loss") clues.push(clue(`lost:${fight.id}`, `I lost to ${fight.opponent} in the UFC.`, "giveaway"));
    else clues.push(clue(`faced:${fight.id}`, `I fought ${fight.opponent} in the UFC.`, "giveaway"));
  }

  for (const fight of recognizableFights) {
    clues.push(clue(`faced-any:${fight.id}`, `I shared the Octagon with ${fight.opponent}.`, "strong"));
  }

  return {
    id: subject.id,
    name: subject.name,
    kind: "fighter",
    eraBand: eraBand(debutYear, lastYear),
    rescueGroup: subject.primaryDivision,
    clues: distinctClues([...clues, ...ufcPersonIdentityClues(subject)]),
  };
}

function footballMetricText(metricId: FootballFactMetricId, value: unknown, label: string) {
  const numericValue = Number(value);
  const formatted = formatFootballFact(metricId, numericValue);
  const clueFormatted = Number.isInteger(numericValue) ? numericValue.toLocaleString("en-US") : formatted;
  switch (metricId) {
    case "cfb-career-games": return `I played in ${clueFormatted} college games.`;
    case "cfb-career-starts": return `I made ${clueFormatted} career starts in college.`;
    case "cfb-career-tackles": return `I recorded ${clueFormatted} career tackles in college.`;
    case "cfb-career-tackles-for-loss": return `I recorded ${clueFormatted} career tackles for loss in college.`;
    case "cfb-all-america-selections": return numericValue === 1 ? "I earned All-America honors in one college season." : `I earned All-America honors in ${clueFormatted} college seasons.`;
    case "cfb-first-team-all-conference-selections": return numericValue === 1 ? "I earned first-team all-conference honors once." : `I earned first-team all-conference honors ${clueFormatted} times.`;
    case "cfb-nfl-draft-overall-pick": return `I was selected No. ${clueFormatted} overall in the NFL Draft.`;
    case "cfb-national-championships-won": return numericValue === 1 ? "I won a college national championship." : `I won ${clueFormatted} college national championships.`;
    case "cfb-career-passing-yards": return `I finished my college career with ${clueFormatted} passing yards.`;
    case "cfb-career-passing-touchdowns": return `I finished my college career with ${clueFormatted} passing touchdowns.`;
    case "cfb-career-rushing-yards": return `I finished my college career with ${clueFormatted} rushing yards.`;
    case "cfb-career-rushing-touchdowns": return `I finished my college career with ${clueFormatted} rushing touchdowns.`;
    case "cfb-career-receptions": return `I finished my college career with ${clueFormatted} receptions.`;
    case "cfb-career-receiving-yards": return `I finished my college career with ${clueFormatted} receiving yards.`;
    case "cfb-career-receiving-touchdowns": return `I finished my college career with ${clueFormatted} receiving touchdowns.`;
    case "cfb-career-total-touchdowns": return `I finished my college career with ${clueFormatted} total touchdowns.`;
    case "cfb-career-defensive-interceptions": return `I finished my college career with ${clueFormatted} defensive interceptions.`;
    case "cfb-career-sacks": return `I finished my college career with ${clueFormatted} sacks.`;
    case "cfb-career-pass-breakups": return `I finished my college career with ${clueFormatted} pass breakups.`;
    case "cfb-career-forced-fumbles": return `I finished my college career with ${clueFormatted} forced fumbles.`;
    case "cfb-career-fumble-recoveries": return `I finished my college career with ${clueFormatted} fumble recoveries.`;
    case "cfb-best-season-passing-yards": return `My best college season produced ${clueFormatted} passing yards.`;
    case "cfb-best-season-passing-touchdowns": return `My best college season produced ${clueFormatted} passing touchdowns.`;
    case "cfb-best-season-interceptions": return `My best college season included ${clueFormatted} interceptions thrown.`;
    case "cfb-best-season-passer-rating": return `My best college season included a ${clueFormatted} passer rating.`;
    case "cfb-best-season-rushing-yards": return `My best college season produced ${clueFormatted} rushing yards.`;
    case "cfb-best-season-rushing-touchdowns": return `My best college season produced ${clueFormatted} rushing touchdowns.`;
    case "cfb-best-season-receptions": return `My best college season included ${clueFormatted} receptions.`;
    case "cfb-best-season-receiving-yards": return `My best college season produced ${clueFormatted} receiving yards.`;
    case "cfb-best-season-receiving-touchdowns": return `My best college season produced ${clueFormatted} receiving touchdowns.`;
    case "cfb-best-season-sacks": return `My best college season included ${clueFormatted} sacks.`;
    case "cfb-best-season-tackles-for-loss": return `My best college season included ${clueFormatted} tackles for loss.`;
    case "cfb-best-season-defensive-interceptions": return `My best college season included ${clueFormatted} defensive interceptions.`;
    case "cfb-heisman-awards": return numericValue === 1 ? "I won the Heisman Trophy." : `I won the Heisman Trophy ${formatted} times.`;
    case "nfl-career-starts": return `I made ${clueFormatted} career NFL starts.`;
    case "nfl-career-pro-bowl-selections": return numericValue === 1 ? "I was selected to one Pro Bowl." : `I was selected to ${clueFormatted} Pro Bowls.`;
    case "nfl-ap-mvp-awards": return numericValue === 1 ? "I won the AP NFL MVP award." : `I won ${formatted} AP NFL MVP awards.`;
    case "nfl-super-bowl-titles": return numericValue === 1 ? "I won a Super Bowl title." : `I won ${formatted} Super Bowl titles.`;
    case "nfl-defensive-player-of-year-awards": return numericValue === 1 ? "I won NFL Defensive Player of the Year." : `I won NFL Defensive Player of the Year ${formatted} times.`;
    case "nfl-first-team-all-pros": return numericValue === 1 ? "I was a first-team All-Pro." : `I was a first-team All-Pro ${formatted} times.`;
    case "cfb-coach-national-titles": return numericValue === 1 ? "I won a national championship as a head coach." : `I won ${formatted} national championships as a head coach.`;
    case "cfb-coach-conference-titles": return numericValue === 1 ? "I won a conference title as a head coach." : `I won ${formatted} conference titles as a head coach.`;
    default: return `I recorded ${formatted} ${label.toLowerCase()}.`;
  }
}

function footballMetricAppliesToSubject(subject: FootballSubjectProfile, metricId: FootballFactMetricId) {
  if (subject.kind === "player-career") {
    return metricId.startsWith(subject.league === "NFL" ? "nfl-" : "cfb-");
  }
  return true;
}

export interface FootballWhoAmIApplicableMetricFact {
  sourceSubjectId: string;
  fact: FootballFactValue;
}

export function footballWhoAmIApplicableMetricFacts(subject: FootballSubjectProfile): FootballWhoAmIApplicableMetricFact[] {
  const related = subject.kind === "player-career"
    ? [...footballPlayerCareerSubjectsForPerson(subject)].sort((left, right) => {
        const leftScopeRank = left.id === subject.id ? 0 : left.league === subject.league ? 1 : 2;
        const rightScopeRank = right.id === subject.id ? 0 : right.league === subject.league ? 1 : 2;
        return leftScopeRank - rightScopeRank
          || (getFootballFactualRecord(right.id)?.facts.length ?? 0) - (getFootballFactualRecord(left.id)?.facts.length ?? 0)
          || left.id.localeCompare(right.id);
      })
    : [subject];
  const byMetric = new Map<FootballFactMetricId, FootballWhoAmIApplicableMetricFact>();

  for (const relatedSubject of related) {
    const record = getFootballFactualRecord(relatedSubject.id);
    if (!record) continue;
    for (const fact of record.facts) {
      if (!FOOTBALL_WHO_AM_I_METRICS.has(fact.metricId)) continue;
      if (!footballMetricAppliesToSubject(subject, fact.metricId)) continue;
      if (Number(fact.value) === 0) continue;

      // The selected game subject owns its stage first. Other same-person records are
      // canonical gap-fill sources only; they never replace an already-owned metric.
      if (!byMetric.has(fact.metricId)) {
        byMetric.set(fact.metricId, { sourceSubjectId: relatedSubject.id, fact });
      }
    }
  }

  return [...byMetric.values()];
}

function footballMetricBand(metricId: FootballFactMetricId): WhoAmIClueBand {
  if (
    /mvp|heisman|super-bowl|all-pro|player-of-year|defensive-player-of-year|national-titles|national-championships|all-america|first-team-all-conference|draft-overall-pick|coach-career-wins|coach-postseason-resume/.test(metricId)
  ) return "strong";

  if (
    /(?:percentage|ratio|career-games|career-starts|coach-career-losses|coach-career-ties|coach-seasons|coach-win-percentage)/.test(metricId)
  ) return "helpful";

  return "strong";
}

function footballMetricClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  return footballWhoAmIApplicableMetricFacts(subject)
    .map(({ fact }) => {
      const label = metricLabelById.get(fact.metricId) ?? fact.metricId;
      return clue(
        `fact:${fact.metricId}`,
        footballMetricText(fact.metricId, fact.value, label),
        footballMetricBand(fact.metricId),
      );
    });
}

function footballRecognitionClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  if (subject.league !== "CFB" || subject.kind !== "player-career") return [];
  const evidence = footballRecognitionEvidenceFor(subject);
  if (!evidence) return [];

  if (evidence.basis === "first-team-all-america") {
    return [{
      ...clue("recognition:first-team-all-america", "I earned first-team All-America recognition in college.", "strong"),
      conceptId: "recognition:first-team-all-america",
      facet: "accomplishments",
      revealPriority: 15,
    }];
  }

  if (evidence.basis === "major-award-or-hall-of-fame") {
    return [{
      ...clue("recognition:major-award-or-hall-of-fame", "My college résumé includes a major national award or Hall of Fame recognition.", "strong"),
      conceptId: "recognition:major-award-or-hall-of-fame",
      facet: "accomplishments",
      revealPriority: 15,
    }];
  }

  return [];
}

function footballIdentityClues(subject: FootballSubjectProfile): WhoAmIClue[] {
  const isCoach = subject.kind === "coach";
  const clues: WhoAmIClue[] = [];

  if (isCoach) clues.push(clue("role", "I am a head coach.", "broad"));
  else if (subject.position) clues.push(clue("position", `I played ${subject.position}.`, "broad"));

  const decades = subject.activeDecades ?? [];
  if (decades.length === 1) clues.push(clue("era", `I was active in the ${decades[0]}s.`, "broad"));
  else if (decades.length > 1) {
    clues.push(clue("era", `I was active in the ${decades[0]}s and ${decades[decades.length - 1]}s.`, "broad"));
  }
  if (subject.startSeason != null && subject.endSeason != null) {
    clues.push(clue(
      "career-span",
      isCoach
        ? `I spent ${subject.endSeason - subject.startSeason + 1} seasons as a ${subject.league} head coach.`
        : `My ${subject.league} career lasted ${subject.endSeason - subject.startSeason + 1} seasons.`,
      "helpful",
    ));
  }
  if (isCoach && subject.startSeason != null) {
    clues.push(clue("coach-start", `I first became a ${subject.league} head coach in ${subject.startSeason}.`, "helpful"));
  }
  if (isCoach && subject.endSeason != null) {
    clues.push(clue("coach-end", `My ${subject.league} head-coaching career most recently reached ${subject.endSeason}.`, "strong"));
  }
  if (!isCoach && subject.startSeason != null) {
    clues.push({
      ...clue(
        "player-career-start",
        subject.league === "NFL"
          ? `My NFL career began in ${subject.startSeason}.`
          : `My college career began in ${subject.startSeason}.`,
        "helpful",
      ),
      facet: "era",
    });
  }
  if (!isCoach && subject.endSeason != null) {
    clues.push({
      ...clue(
        "player-career-end",
        subject.league === "NFL"
          ? `My NFL career ended in ${subject.endSeason}.`
          : `My college career ended in ${subject.endSeason}.`,
        "strong",
      ),
      facet: "era",
    });
  }

  if (subject.school) clues.push(clue("school", `I played college football at ${subject.school}.`, subject.league === "NFL" ? "helpful" : "broad"));
  if (subject.conference) clues.push(clue("conference", `I competed in the ${subject.conference}.`, "helpful"));
  const draftProfile = footballDraftProfile(subject);
  if (draftProfile.draftYear != null && draftProfile.draftPick != null) {
    clues.push(clue(
      "draft-pick",
      `I was selected No. ${draftProfile.draftPick} overall in the ${draftProfile.draftYear} NFL Draft.`,
      "strong",
    ));
  } else if (draftProfile.draftYear != null && draftProfile.draftRound != null) {
    clues.push(clue(
      "draft-round",
      `I was selected in round ${draftProfile.draftRound} of the ${draftProfile.draftYear} NFL Draft.`,
      "strong",
    ));
  } else if (draftProfile.draftYear != null) {
    clues.push(clue("draft-year", `I entered the NFL draft in ${draftProfile.draftYear}.`, "helpful"));
  } else if (draftProfile.firstOverallPick) {
    clues.push(clue("first-overall", "I was the No. 1 overall NFL draft pick.", "strong"));
  } else if (draftProfile.firstRoundPick) {
    clues.push(clue("first-round", "I was a first-round NFL draft pick.", "strong"));
  } else if (draftProfile.undrafted) {
    clues.push(clue("undrafted", "I entered the NFL undrafted.", "strong"));
  }
  if (subject.heismanWinner) clues.push(clue("heisman", "I won the Heisman Trophy.", "strong"));
  if (subject.nationalChampion) clues.push(clue("national-champion", "I was part of a college national championship team.", "strong"));

  // Who Am I only needs the compact canonical affiliations already owned by the subject profile.
  // Pulling full season-by-season affiliation history here drags ~19 MB of normalized source corpora
  // into both lazy game routes on mobile without changing launch membership or clue ownership.
  const profileAffiliations = subject.franchises?.length
    ? subject.franchises
    : subject.school
      ? [subject.school]
      : [];
  const uniqueAffiliations = [...new Set(
    profileAffiliations.map((affiliation) => displayAffiliation(subject.league, affiliation)),
  )];
  if (isCoach && uniqueAffiliations.length) {
    clues.push(clue(
      "coach-affiliation-count",
      `I was a ${subject.league} head coach for ${uniqueAffiliations.length} ${uniqueAffiliations.length === 1 ? "team" : "teams"}.`,
      "helpful",
    ));
  }
  if (uniqueAffiliations.length > 1) {
    clues.push(clue(
      "career-path",
      subject.league === "NFL"
        ? isCoach
          ? `I was an NFL head coach for the ${uniqueAffiliations.join(" and ")}.`
          : `I played for ${uniqueAffiliations.join(" and ")} in the NFL.`
        : isCoach
          ? `I was a college head coach at ${uniqueAffiliations.join(" and ")}.`
          : `My college career included ${uniqueAffiliations.join(" and ")}.`,
      "strong",
    ));
  }
  for (const affiliation of uniqueAffiliations) {
    if (subject.league === "CFB" && subject.school && slug(affiliation) === slug(subject.school)) continue;
    clues.push(clue(
      `affiliation:${slug(affiliation)}`,
      subject.league === "NFL"
        ? isCoach
          ? `I was an NFL head coach for the ${affiliation}.`
          : `I played for the ${affiliation}.`
        : isCoach
          ? `I was a college head coach at ${affiliation}.`
          : `My college career included ${affiliation}.`,
      "giveaway",
    ));
  }

  return clues;
}

function footballCandidate(subject: FootballSubjectProfile): WhoAmICandidate {
  const kind = subject.kind === "coach" ? "coach" : "player";
  return {
    id: subject.id,
    name: subject.name,
    kind,
    eraBand: footballEraBand(subject),
    rescueGroup: kind === "coach" ? `${subject.league}:coach` : `${subject.league}:${subject.position ?? "player"}`,
    clues: distinctClues([
      ...footballIdentityClues(subject),
      ...footballMetricClues(subject),
      ...footballRecognitionClues(subject),
      ...footballPersonIdentityClues(subject),
    ]),
  };
}

export type FootballWhoAmIPositionGroup = "QB" | "RB" | "WR" | "TE" | "OL" | "DL/EDGE" | "LB" | "DB";

export interface FootballWhoAmILaunchPool {
  league: "NFL" | "CFB";
  players: readonly FootballSubjectProfile[];
  coaches: readonly FootballSubjectProfile[];
  subjects: readonly FootballSubjectProfile[];
}

const FOOTBALL_WHO_AM_I_POSITION_GROUPS: readonly FootballWhoAmIPositionGroup[] = [
  "QB", "RB", "WR", "TE", "OL", "DL/EDGE", "LB", "DB",
];

export const FOOTBALL_WHO_AM_I_PLAYER_TARGETS: Readonly<Record<"NFL" | "CFB", Readonly<Record<FootballWhoAmIPositionGroup, number>>>> = {
  NFL: { QB: 29, RB: 26, WR: 32, TE: 13, OL: 12, "DL/EDGE": 26, LB: 18, DB: 24 },
  CFB: { QB: 31, RB: 30, WR: 23, TE: 12, OL: 12, "DL/EDGE": 24, LB: 20, DB: 28 },
};

const FOOTBALL_WHO_AM_I_COACH_TARGET = 20;
const RECOGNITION_TIER_RANK = { A: 0, B: 1 } as const;

export function footballWhoAmIPositionGroup(position: FootballSubjectProfile["position"]): FootballWhoAmIPositionGroup | null {
  switch (position) {
    case "QB": return "QB";
    case "RB": return "RB";
    case "WR": return "WR";
    case "TE": return "TE";
    case "OL": return "OL";
    case "DL": return "DL/EDGE";
    case "LB": return "LB";
    case "DB": return "DB";
    case "K":
    case "P":
    case undefined:
      return null;
  }
}

function stableTextCompare(left: string, right: string) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function footballLaunchSubjectCompare(left: FootballSubjectProfile, right: FootballSubjectProfile) {
  const tierDifference = RECOGNITION_TIER_RANK[left.recognizabilityTier as "A" | "B"]
    - RECOGNITION_TIER_RANK[right.recognizabilityTier as "A" | "B"];
  if (tierDifference !== 0) return tierDifference;
  const nameDifference = stableTextCompare(left.name.toLowerCase(), right.name.toLowerCase());
  return nameDifference || stableTextCompare(left.id, right.id);
}

function preserveEraDiversityWithinTier(
  selectedSubjects: readonly FootballSubjectProfile[],
  availableSubjects: readonly FootballSubjectProfile[],
) {
  const selected = [...selectedSubjects];
  for (const era of ["modern", "legacy"] as const) {
    if (selected.some((subject) => footballEraBand(subject) === era)) continue;
    const replacement = [...availableSubjects]
      .filter((subject) => footballEraBand(subject) === era)
      .sort(footballLaunchSubjectCompare)
      .find((candidate) => selected.some((subject) => subject.recognizabilityTier === candidate.recognizabilityTier));
    if (!replacement) continue;
    const replaceIndex = [...selected.keys()]
      .reverse()
      .find((index) => selected[index]!.recognizabilityTier === replacement.recognizabilityTier);
    if (replaceIndex != null) selected[replaceIndex] = replacement;
  }
  return selected.sort(footballLaunchSubjectCompare);
}

function selectedFootballSubjects(league: "NFL" | "CFB") {
  const queried = queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach");

  const byPerson = new Map<string, FootballSubjectProfile>();
  for (const subject of queried) {
    const key = `${subject.kind}:${subject.name.toLowerCase()}`;
    const current = byPerson.get(key);
    const currentDepth = current ? (getFootballFactualRecord(current.id)?.facts.length ?? 0) : -1;
    const nextDepth = getFootballFactualRecord(subject.id)?.facts.length ?? 0;
    if (
      !current
      || nextDepth > currentDepth
      || (nextDepth === currentDepth && stableTextCompare(subject.id, current.id) < 0)
    ) {
      byPerson.set(key, subject);
    }
  }
  return [...byPerson.values()];
}

function requireLaunchCount(
  league: "NFL" | "CFB",
  label: string,
  available: readonly FootballSubjectProfile[],
  count: number,
) {
  if (available.length < count) {
    throw new Error(`Who Am I ${league} launch pool needs ${count} ${label}; canonical A/B registry has ${available.length}.`);
  }
}

function footballLaunchPool(league: "NFL" | "CFB"): FootballWhoAmILaunchPool {
  const recognized = selectedFootballSubjects(league);
  const playerCandidates = recognized.filter((subject) => subject.kind === "player-career");
  const coachCandidates = recognized.filter((subject) => subject.kind === "coach");
  const targets = FOOTBALL_WHO_AM_I_PLAYER_TARGETS[league];

  const players = FOOTBALL_WHO_AM_I_POSITION_GROUPS.flatMap((group) => {
    const available = playerCandidates
      .filter((subject) => footballWhoAmIPositionGroup(subject.position) === group)
      .sort(footballLaunchSubjectCompare);
    const target = targets[group];
    requireLaunchCount(league, `${group} players`, available, target);
    return preserveEraDiversityWithinTier(available.slice(0, target), available);
  });

  const sortedCoaches = [...coachCandidates].sort(footballLaunchSubjectCompare);
  requireLaunchCount(league, "head coaches", sortedCoaches, FOOTBALL_WHO_AM_I_COACH_TARGET);
  const coaches = sortedCoaches.slice(0, FOOTBALL_WHO_AM_I_COACH_TARGET);

  return { league, players, coaches, subjects: [...players, ...coaches] };
}

const nflLaunchPool = footballLaunchPool("NFL");
const cfbLaunchPool = footballLaunchPool("CFB");

function footballUniverse(launchPool: FootballWhoAmILaunchPool): WhoAmIUniverse {
  return {
    sport: "football",
    league: launchPool.league,
    candidates: launchPool.subjects.map(footballCandidate),
  };
}

const ufcUniverse: WhoAmIUniverse = {
  sport: "ufc",
  league: "UFC",
  candidates: ufcFactualLedgerSubjects.map(ufcCandidate),
};

const nflUniverse = footballUniverse(nflLaunchPool);
const cfbUniverse = footballUniverse(cfbLaunchPool);

export function getUfcWhoAmIUniverse() {
  return ufcUniverse;
}

export function getFootballWhoAmILaunchPool(league: "NFL" | "CFB") {
  return league === "NFL" ? nflLaunchPool : cfbLaunchPool;
}

export function getFootballWhoAmIUniverse(league: "NFL" | "CFB") {
  return league === "NFL" ? nflUniverse : cfbUniverse;
}

export function createUfcWhoAmIRound(random: () => number = Math.random): WhoAmIRound {
  return createWhoAmIRound(ufcUniverse, random);
}

export function createFootballWhoAmIRound(random: () => number = Math.random): WhoAmIRound {
  const league = random() < 0.5 ? "NFL" : "CFB";
  return createWhoAmIRound(getFootballWhoAmIUniverse(league), random);
}
