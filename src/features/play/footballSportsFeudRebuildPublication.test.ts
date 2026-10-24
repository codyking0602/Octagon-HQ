import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationSportsFeud";
import { buildFootballOfficialDailySetup } from "./footballTodayChallengeRuntime";
import {
  buildSportsFeudPack,
  buildFootballFeudRebuildPack,
  footballSportsFeudDomainForDay,
  FOOTBALL_FEUD_REBUILD_CUTOVER_DAY,
} from "./sportsFeudDailyBanks";

const nextDay = (day: string, offset: number) =>
  new Date(Date.parse(day + "T00:00:00Z") + offset * 86400000).toISOString().slice(0, 10);

describe("Football Sports Feud future-only official Daily rebuild", () => {
  it("preserves historical official v1 packs and future deterministic publisher parity", () => {
    expect(FOOTBALL_FEUD_REBUILD_CUTOVER_DAY).toBe("2026-10-29");
    for (const day of ["2026-09-23", "2026-09-25", "2026-10-17", "2026-10-23"]) {
      const domain = footballSportsFeudDomainForDay(day);
      expect(buildFootballFeudRebuildPack(domain, day)).toEqual(buildSportsFeudPack(domain, day));
      const publication = buildFootballDailyPersistenceSetup(day, "historical-audit", "sports_feud");
      const historical = buildFootballOfficialDailySetup("sports_feud", day, "historical-audit");
      expect(publication.privateSetupEvidence).toEqual(historical.privateSetupEvidence);
    }
    for (const day of ["2026-10-29", "2026-11-02", "2026-11-08"]) {
      const published = buildFootballDailyPersistenceSetup(day, "future-v2", "sports_feud");
      const canonical = buildFootballOfficialDailySetup("sports_feud", day, "future-v2");
      expect(published.privateSetupEvidence).toEqual(canonical.privateSetupEvidence);
      expect(String(published.publicSetup.pack_id)).toContain("sports-feud-bank-r2-");
      expect(String(published.publicSetup.presentation_domain)).toBe(footballSportsFeudDomainForDay(day));
    }
  });

  it("publishes 34 consecutive Feud appearances over the future six-month window with no repeated question", () => {
    const seen: Record<"nfl" | "cfb", Set<string>> = { nfl: new Set(), cfb: new Set() };
    const appearances: Record<"nfl" | "cfb", number> = { nfl: 0, cfb: 0 };
    const emitted = new Set<string>();
    const anchor = Date.parse("2026-09-29T00:00:00Z") / 86400000;
    for (let days = 0; days < 260 && appearances.nfl + appearances.cfb < 34; days += 1) {
      const day = nextDay(FOOTBALL_FEUD_REBUILD_CUTOVER_DAY, days);
      const offset = Date.parse(day + "T00:00:00Z") / 86400000 - anchor;
      if (![2, 8, 12, 18].includes(((offset % 22) + 22) % 22)) continue;
      const sport = footballSportsFeudDomainForDay(day);
      const pack = buildFootballFeudRebuildPack(sport, day);
      expect(pack).toEqual(buildFootballFeudRebuildPack(sport, day));
      expect(() => assertFamilyFeudPack(pack)).not.toThrow();
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
      const questions = [...pack.mainBoards, ...pack.fastMoney];
      const lanes = questions.map(q => q.id);
      expect(new Set(lanes).size).toBe(7);
      for (const question of questions) {
        expect(seen[sport].has(question.id), day + " repeated " + question.id).toBe(false);
        seen[sport].add(question.id);
        emitted.add(question.id);
        for (const entityId of question.candidateIds) {
          const entity = pack.entities.find(e => e.id === entityId)!;
          expect(matchFamilyFeudAnswer(pack, question, entity.displayName).status,
            day + " / " + question.id + " / " + entity.displayName).toBe("matched");
        }
      }
      appearances[sport] += 1;
    }
    expect(appearances).toEqual({ nfl: 17, cfb: 17 });
    expect(emitted.size).toBe(238);
  }, 60_000);
});
