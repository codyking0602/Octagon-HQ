import { describe, expect, it } from "vitest";
import casualSource from "./MillionaireCasualPage.tsx?raw";
import officialSource from "./OfficialMillionaireDailyView.tsx?raw";
import nbaStyles from "../../styles/nba-millionaire.css?raw";

describe("NBA Official Daily Millionaire stage parity", () => {
  it("shares the approved Casual NBA studio, separate host and styling", () => {
    // NBA hosts are transparent subjects, not full-size stage backgrounds.
    // Guard against regressing to the oversized face/background seen in Daily.
    expect(casualSource).toContain('MILLIONAIRE_NBA_STUDIO_ASSET');
    expect(officialSource).toContain('MILLIONAIRE_NBA_STUDIO_ASSET');
    expect(officialSource).toMatch(/stageBackground = league === "nba"\s*\? MILLIONAIRE_NBA_STUDIO_ASSET/);
    expect(officialSource).toContain('MILLIONAIRE_HOSTS.nba[hostNumber - 1]');
    expect(officialSource).toContain('className="millionaire-nba-host"');
    expect(casualSource).toContain('className="millionaire-nba-host"');
    expect(officialSource).toContain('import "../../styles/nba-millionaire.css"');
    expect(casualSource).toContain('import "../../styles/nba-millionaire.css"');
    expect(nbaStyles).toContain('.millionaire-nba-host');
  });

  it("keeps other leagues on their original stage plates and preserves Daily authority", () => {
    expect(officialSource).toContain('MILLIONAIRE_HOSTS[league][hostNumber - 1] ?? MILLIONAIRE_HOSTS[league][0]');
    expect(officialSource).toContain('onAdvance: (action: JsonRecord) => void');
    expect(officialSource).toContain('projection.officialAttempt');
  });
});
