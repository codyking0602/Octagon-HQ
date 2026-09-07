import { describe, expect, it } from "vitest";
import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";

type League = "NFL" | "CFB";
type Role = "player" | "coach";
type Person = { key: string; role: Role; records: FootballSubjectProfile[] };

const PLAYER_TARGET = 100;
const COACH_TARGET = 20;

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const stableHash = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const tierRank = (tier: FootballSubjectProfile["recognizabilityTier"]) => tier === "A" ? 2 : tier === "B" ? 1 : 0;

function roleRecords(person: Person) {
  return person.records.filter((record) => person.role === "player" ? record.kind === "player-career" : record.kind === "coach");
}

function strongestRoleTier(records: readonly FootballSubjectProfile[], role: Role) {
  return Math.max(0, ...records
    .filter((record) => role === "player" ? record.kind === "player-career" : record.kind === "coach")
    .map((record) => tierRank(record.recognizabilityTier)));
}

function rawPeople(league: League) {
  const byPerson = new Map<string, FootballSubjectProfile[]>();
  for (const record of queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach")) {
    const key = normalize(record.name);
    const records = byPerson.get(key) ?? [];
    if (!records.some((existing) => existing.id === record.id && existing.kind === record.kind)) records.push(record);
    byPerson.set(key, records);
  }
  return [...byPerson.entries()].map(([key, records]) => ({ key, records }));
}

function sortRoleCandidates(candidates: readonly { key: string; records: FootballSubjectProfile[] }[], role: Role) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => strongestRoleTier(b.records, role) - strongestRoleTier(a.records, role) || stableHash(a.key) - stableHash(b.key));
}

function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachKeys = new Set(coaches.map((person) => person.key));
  const players = sortRoleCandidates(people.filter((person) => !coachKeys.has(person.key)), "player").slice(0, PLAYER_TARGET);
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}

function hasKnownField(person: Person, field: keyof FootballSubjectProfile) {
  return roleRecords(person).some((record) => record[field] != null);
}

function coverage(pool: readonly Person[]) {
  const players = pool.filter((person) => person.role === "player");
  const coaches = pool.filter((person) => person.role === "coach");
  const completeAffiliation = (people: readonly Person[]) => people.filter((person) => (
    roleRecords(person).some((record) => footballCareerAffiliationHistoryFor(record)?.complete)
  )).length;
  const withAnyAffiliation = (people: readonly Person[]) => people.filter((person) => (
    roleRecords(person).some((record) => footballCareerAffiliationHistoryFor(record) != null)
  )).length;
  const bothWindowEnds = (people: readonly Person[]) => people.filter((person) => (
    roleRecords(person).some((record) => record.startSeason != null)
    && roleRecords(person).some((record) => record.endSeason != null)
  )).length;
  const countField = (people: readonly Person[], field: keyof FootballSubjectProfile) => (
    people.filter((person) => hasKnownField(person, field)).length
  );

  return {
    total: pool.length,
    players: {
      count: players.length,
      position: countField(players, "position"),
      startAndEnd: bothWindowEnds(players),
      school: countField(players, "school"),
      franchises: countField(players, "franchises"),
      draftYear: countField(players, "draftYear"),
      draftRound: countField(players, "draftRound"),
      draftPick: countField(players, "draftPick"),
      firstRoundPick: countField(players, "firstRoundPick"),
      undrafted: countField(players, "undrafted"),
      heismanWinner: countField(players, "heismanWinner"),
      nationalChampion: countField(players, "nationalChampion"),
      anyCareerAffiliation: withAnyAffiliation(players),
      completeCareerAffiliation: completeAffiliation(players),
    },
    coaches: {
      count: coaches.length,
      startAndEnd: bothWindowEnds(coaches),
      school: countField(coaches, "school"),
      franchises: countField(coaches, "franchises"),
      anyCareerAffiliation: withAnyAffiliation(coaches),
      completeCareerAffiliation: completeAffiliation(coaches),
    },
  };
}

describe("Football 20 Questions metadata coverage probe", () => {
  for (const league of ["NFL", "CFB"] as const) {
    it(`${league} reports spoiler-safe canonical metadata coverage for the launch census`, () => {
      const pool = selectLaunchPool(league);
      const result = coverage(pool);
      console.log(`TWENTY_QUESTIONS_METADATA_${league}=${JSON.stringify(result)}`);
      expect(pool).toHaveLength(PLAYER_TARGET + COACH_TARGET);
    });
  }
});
