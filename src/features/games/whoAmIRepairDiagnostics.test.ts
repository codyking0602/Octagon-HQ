import { describe, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import {
  footballPersonIdentityKnowledgeRecords,
  getFootballPersonIdentityKnowledge,
} from "../back-room/footballPersonIdentityKnowledge";
import {
  footballCanonicalPlayerSourceBindingFor,
  footballCanonicalPlayerSubjectIdForSourceSubjectId,
} from "../back-room/footballRecognizabilityProjection";
import {
  getFootballSubject,
  queryFootballSubjects,
} from "../back-room/footballSubjectRegistry";
import { footballCareerAffiliationHistoryFor } from "../back-room/footballCareerAffiliationProjection";
import { footballRankFivePacks } from "../back-room/footballComparisonDepthCatalog";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";

describe("Who Am I repair diagnostics", () => {
  it("prints canonical integrity diagnostics", () => {
    for (const league of ["NFL", "CFB"] as const) {
      const launch = getFootballWhoAmILaunchPool(league);
      const universe = getFootballWhoAmIUniverse(league);
      const shallow = universe.candidates
        .map((candidate) => ({ id: candidate.id, name: candidate.name, clues: candidate.clues.length }))
        .sort((a, b) => a.clues - b.clues || a.id.localeCompare(b.id))
        .slice(0, 20);
      console.log("DIAG shallow", league, JSON.stringify(shallow));
      console.log("DIAG launch tiers", league, JSON.stringify(Object.fromEntries(
        ["A","B","C","D"].map((tier) => [tier, launch.subjects.filter((subject) => subject.recognizabilityTier === tier).length])
      )));
    }

    const nflLaunch = getFootballWhoAmILaunchPool("NFL");
    const nflLaunchById = new Map(nflLaunch.subjects.map((subject) => [subject.id, subject]));
    const nflKnowledge = footballPersonIdentityKnowledgeRecords
      .filter((record) => getFootballSubject(record.subjectId)?.league === "NFL")
      .map((record) => ({
        id: record.subjectId,
        launchTier: nflLaunchById.get(record.subjectId)?.recognizabilityTier ?? null,
        canonical: getFootballSubject(record.subjectId)?.id ?? null,
      }))
      .filter((row) => row.launchTier !== "A")
      .slice(0, 80);
    console.log("DIAG nfl knowledge not A", JSON.stringify(nflKnowledge));

    const cfbLaunch = getFootballWhoAmILaunchPool("CFB");
    const cfbA = cfbLaunch.subjects.filter((subject) => subject.recognizabilityTier === "A");
    const cfbB = cfbLaunch.subjects.filter((subject) => subject.recognizabilityTier === "B");
    console.log("DIAG cfb A ids", JSON.stringify(cfbA.map((subject) => subject.id)));
    console.log("DIAG cfb B ids", JSON.stringify(cfbB.map((subject) => subject.id)));

    const cfbKnowledgeIds = footballPersonIdentityKnowledgeRecords
      .filter((record) => getFootballSubject(record.subjectId)?.league === "CFB")
      .map((record) => record.subjectId);
    const cfbLaunchAB = new Set([...cfbA, ...cfbB].map((subject) => subject.id));
    console.log("DIAG cfb knowledge outside launch AB", JSON.stringify(cfbKnowledgeIds.filter((id) => !cfbLaunchAB.has(id))));
    console.log("DIAG cfb launch AB without knowledge", JSON.stringify([...cfbLaunchAB].filter((id) => !getFootballPersonIdentityKnowledge(id))));

    for (const id of ["nfl-jason-kelce","nfl-joe-thomas","adrian-peterson","nfl-adrian-peterson","cam-newton","nfl-lamar-jackson","cfb-andrew-luck","andrew-luck"]) {
      const subject = getFootballSubject(id);
      if (!subject) {
        console.log("DIAG subject", id, "MISSING");
        continue;
      }
      console.log("DIAG subject", id, JSON.stringify({
        resolvedId: subject.id,
        name: subject.name,
        league: subject.league,
        tier: subject.recognizabilityTier,
        position: subject.position,
        school: subject.school,
        franchises: subject.franchises,
        startSeason: subject.startSeason,
        endSeason: subject.endSeason,
        sourceIdentityKeys: subject.sourceIdentityKeys,
        binding: footballCanonicalPlayerSourceBindingFor(subject.id),
        history: footballCareerAffiliationHistoryFor(subject),
        factCount: getFootballFactualRecord(subject.id)?.facts.length ?? 0,
        knowledgeCount: getFootballPersonIdentityKnowledge(subject.id)?.facts.length ?? 0,
      }));
    }

    for (const sourceId of ["nflverse-player-00-0025394","nflverse-player-00-0021306","nflverse-player-00-0027939","nflverse-player-00-0023382","nflverse-player-00-0034796","nflverse-player-00-0036152"]) {
      console.log("DIAG source binding", sourceId, footballCanonicalPlayerSubjectIdForSourceSubjectId(sourceId));
    }

    const counts = queryFootballSubjects({ includeProjectedCanonicalRecognition: true })
      .filter((subject) => subject.kind === "player-career" && subject.league === "NFL")
      .reduce<Record<string, number>>((acc, subject) => {
        acc[subject.position ?? "unknown"] = (acc[subject.position ?? "unknown"] ?? 0) + 1;
        return acc;
      }, {});
    console.log("DIAG NFL canonical position counts", JSON.stringify(counts));

    for (const packId of ["nfl-quarterbacks","nfl-running-backs","nfl-wide-receivers","nfl-tight-ends","nfl-front-seven","nfl-secondary","college-quarterbacks","college-running-backs"]) {
      const pack = footballRankFivePacks.find((candidate) => candidate.id === packId);
      console.log("DIAG pack", packId, JSON.stringify(pack?.items.map((item) => item.id)));
    }
  });
});
