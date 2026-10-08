import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const audit = JSON.parse(readFileSync("data/curated/football/cfb/gm-2026-classification-evidence.json", "utf8")) as {
  population:number; classified:number; officialOverrides:number;
  players:Array<{id:string;classification:string|null;confidence:string;matchStatus:string;sourceUrl:string;
    remainingEligibility:number|null;earliestDraftYear:number|null;draftEligible2027:boolean|null;
    calibration?:{sources:string[];development:{breakout:number;improve:number;steady:number;decline:number}};}>;
};
const overrides = JSON.parse(readFileSync("data/curated/football/cfb/gm-2026-official-class-overrides.json", "utf8")) as {
  rows:Array<{id:string;classification:string;sourceUrl:string}>;
};

describe("CFB GM classification evidence integrity", () => {
  it("covers exactly the 468 distinct owner-preview subjects", () => {
    expect(audit.population).toBe(468);
    expect(audit.players).toHaveLength(audit.population);
    expect(new Set(audit.players.map((row) => row.id)).size).toBe(468);
    expect(audit.classified).toBe(audit.players.filter((row) => row.classification !== null).length);
  });
  it("uses official 2026 class evidence for all 468 players, including two documented extended-year graduates", () => {
    expect(audit.classified).toBe(468);
    const unresolved = audit.players.filter((row) => row.classification === null).map((row) => row.id).sort();
    expect(unresolved).toEqual([]);
    expect(overrides.rows).toHaveLength(89);
    expect(audit.players.find((row) => row.id === "texas|archmanning")?.classification).toBe("SR");
    expect(audit.players.find((row) => row.id === "miami|mohamedtoure")?.classification).toBe("8TH");
    expect(audit.players.find((row) => row.id === "smu|jimmywyrick")?.classification).toBe("6TH");
    expect(audit.players.find((row) => row.id === "usc|lukewafle")?.classification).toBe("FR");
    expect(audit.players.find((row) => row.id === "ohio-state|jaytimmons")?.classification).toBe("FR");
    expect(audit.players.find((row) => row.id === "pittsburgh|jakyrianturner")?.classification).toBe("SO");
    expect(audit.players.find((row) => row.id === "mississippi-state|willwhitson")?.classification).toBe("7TH");
  });
  it("retains unknown eligibility where research has not established the fact", () => {
    const valid = new Set(["FR","SO","JR","SR","5TH","6TH","7TH","8TH","3RD"]);
    expect(audit.players.filter((row) => row.calibration)).toHaveLength(47);
    expect(audit.players.filter((row) => row.remainingEligibility !== null)).toHaveLength(12);
    for (const row of audit.players) {
      if (row.classification !== null) expect(valid.has(row.classification)).toBe(true);
      if (!row.calibration) {
        expect(row.remainingEligibility).toBeNull();
        expect(row.earliestDraftYear).toBeNull();
        expect(row.draftEligible2027).toBeNull();
      }
      if (row.calibration) {
        expect(row.calibration.sources.length).toBeGreaterThan(0);
        const d = row.calibration.development;
        expect(d.breakout+d.improve+d.steady+d.decline).toBe(100);
      }
    }
  });
  it("reconciles official roster overrides by exact identity without duplication", () => {
    expect(new Set(overrides.rows.map((row) => row.id)).size).toBe(overrides.rows.length);
    expect(audit.officialOverrides).toBe(overrides.rows.length);
    for (const official of overrides.rows) {
      const row = audit.players.find((x) => x.id === official.id);
      expect(row).toBeTruthy();
      expect(row?.classification).toBe(official.classification);
      expect(row?.sourceUrl).toBe(official.sourceUrl);
      expect(row?.matchStatus).toBe("official-school-roster");
    }
  });
});
