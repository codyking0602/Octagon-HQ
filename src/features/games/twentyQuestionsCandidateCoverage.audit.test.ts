import { describe, expect, it } from "vitest";
import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import {
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";

type League = "NFL" | "CFB";
type Role = "player" | "coach";
type Person = { role: Role; records: FootballSubjectProfile[] };

const tierRank = (tier: FootballSubjectProfile["recognizabilityTier"]) => tier === "A" ? 2 : tier === "B" ? 1 : 0;

function roleRecords(person: Person) {
  return person.records.filter((record) => person.role === "player" ? record.kind === "player-career" : record.kind === "coach");
}

function rolePosition(person: Person) {
  if (person.role === "coach") return "Coach";
  const positions = [...new Set(roleRecords(person).flatMap((record) => {
    const canonical = getFootballSubject(record.id);
    const position = canonical?.position ?? record.position;
    return position ? [position] : [];
  }))];
  return positions.length === 1 ? positions[0]! : null;
}

function roleWindow(person: Person) {
  const records = roleRecords(person);
  const starts = records.flatMap((record) => record.startSeason == null ? [] : [record.startSeason]);
  const ends = records.flatMap((record) => record.endSeason == null ? [] : [record.endSeason]);
  if (!starts.length || !ends.length) return null;
  return { start: Math.min(...starts), end: Math.max(...ends) };
}

function roleSchool(person: Person) {
  const schools = [...new Set(roleRecords(person).flatMap((record) => {
    const canonical = getFootballSubject(record.id);
    const school = canonical?.school ?? record.school;
    return school ? [school] : [];
  }))];
  return schools.length === 1 ? schools[0]! : null;
}

function factsCount(person: Person) {
  return new Set(roleRecords(person).flatMap((record) => getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? [])).size;
}

function exactAffiliation(person: Person) {
  return roleRecords(person).some((record) => footballCareerAffiliationHistoryFor(record)?.complete);
}

function peopleFor(league: League, role: Role) {
  const byIdentity = new Map<string, Person>();
  for (const record of queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).filter((subject) => role === "player" ? subject.kind === "player-career" : subject.kind === "coach")) {
    const canonicalId = getFootballSubject(record.id)?.id ?? record.id;
    const key = `${role}:${canonicalId}`;
    const existing = byIdentity.get(key) ?? { role, records: [] };
    if (!existing.records.some((candidate) => candidate.id === record.id && candidate.kind === record.kind)) existing.records.push(record);
    byIdentity.set(key, existing);
  }
  return [...byIdentity.values()].filter((person) => Math.max(0, ...roleRecords(person).map((record) => tierRank(record.recognizabilityTier))) > 0);
}

function summarize(people: readonly Person[]) {
  const windows = people.map(roleWindow);
  return {
    count: people.length,
    positionKnown: people.filter((person) => rolePosition(person) != null).length,
    windowKnown: windows.filter(Boolean).length,
    schoolKnown: people.filter((person) => roleSchool(person) != null).length,
    exactAffiliation: people.filter(exactAffiliation).length,
    factsAny: people.filter((person) => factsCount(person) > 0).length,
    facts3Plus: people.filter((person) => factsCount(person) >= 3).length,
    facts5Plus: people.filter((person) => factsCount(person) >= 5).length,
    coreReady: people.filter((person) => rolePosition(person) != null && roleWindow(person) != null).length,
    coreReadyWithFacts: people.filter((person) => rolePosition(person) != null && roleWindow(person) != null && factsCount(person) > 0).length,
    pre2000WindowKnown: people.filter((person) => (roleWindow(person)?.start ?? 9999) < 2000).length,
    pre1990WindowKnown: people.filter((person) => (roleWindow(person)?.start ?? 9999) < 1990).length,
  };
}

describe("Football 20 Questions candidate factual depth probe", () => {
  for (const league of ["NFL", "CFB"] as const) {
    it(`${league} reports aggregate A/B factual depth without roster spoilers`, () => {
      const players = peopleFor(league, "player");
      const coaches = peopleFor(league, "coach");
      console.log(`TWENTY_QUESTIONS_CANDIDATE_DEPTH_${league}=${JSON.stringify({ players: summarize(players), coaches: summarize(coaches) })}`);
      expect(players.length).toBeGreaterThanOrEqual(100);
      expect(coaches.length).toBeGreaterThanOrEqual(20);
    });
  }
});
