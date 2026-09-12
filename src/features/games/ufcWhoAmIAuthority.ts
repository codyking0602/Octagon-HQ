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
  type WhoAmIRound,
  type WhoAmIUniverse,
} from "./whoAmIEngine";
import {
  distinctWhoAmIClues as distinctClues,
  whoAmIClue as clue,
  whoAmIEraBand as eraBand,
} from "./whoAmIAuthorityShared";

function ufcPersonIdentityClues(subject: UfcFactualSubject): WhoAmIClue[] {
  const knowledge = getUfcPersonIdentityKnowledge(subject.id);
  if (!knowledge) return [];
  return knowledge.facts.map((fact) => whoAmIIdentityKnowledgeClue({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectKind: "fighter",
    league: "UFC",
    factId: fact.factId,
    conceptId: fact.conceptId,
    value: fact.value,
  }));
}

function ufcDivision(value: string) {
  return value
    .replace(/^women-s-/, "Women's ")
    .replace(/^womens-/, "Women's ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

const ufcUniverse: WhoAmIUniverse = {
  sport: "ufc",
  league: "UFC",
  candidates: ufcFactualLedgerSubjects.map(ufcCandidate),
};

export function getUfcWhoAmIUniverse() {
  return ufcUniverse;
}

export function createUfcWhoAmIRound(
  random: () => number = Math.random,
  excludedSubjectIds: ReadonlySet<string> = new Set(),
): WhoAmIRound {
  return createWhoAmIRound(ufcUniverse, random, excludedSubjectIds);
}
