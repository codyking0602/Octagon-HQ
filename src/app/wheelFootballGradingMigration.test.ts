import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310241_wheel_football_current_roster_grading.sql",
  "utf8",
);
const priority = JSON.parse(
  readFileSync("data/generated/football/wheel-football-priorities.json", "utf8"),
) as {
  teams: Record<string, Record<string, string[]>>;
};

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

describe("Wheel of Football current-roster grading authority", () => {
  it("stores only the audited current Wheel population", () => {
    expect(migration.split("('wheel-current:")).toHaveLength(597);
    expect(migration.split("('coach:")).toHaveLength(33);
    expect(migration).not.toContain("fallback-unmatched-current-roster");
    expect(migration).not.toContain("hidden_grade := 70.0");
  });

  it("matches the current 32-team priority file exactly", () => {
    const families: Record<string, string> = {
      QB: "QB",
      RB: "RB",
      WR: "WR",
      TE: "TE",
      "Front Seven": "Front Seven",
      Secondary: "Secondary",
    };

    const expectedPlayerRows = new Set<string>();
    const uniquePlayers = new Set<string>();
    const expectedCoaches = new Set<string>();

    for (const [team, slots] of Object.entries(priority.teams)) {
      const coreNames = new Set<string>();

      for (const [slot, family] of Object.entries(families)) {
        for (const name of slots[slot] ?? []) {
          coreNames.add(normalized(name));
          uniquePlayers.add(`${team}|${normalized(name)}`);
          expectedPlayerRows.add(`${team}|${family}|${normalized(name)}`);
        }
      }

      for (const name of slots.Flex ?? []) {
        if (coreNames.has(normalized(name))) continue;
        uniquePlayers.add(`${team}|${normalized(name)}`);
        expectedPlayerRows.add(`${team}|TE|${normalized(name)}`);
      }

      const coach = slots["Head Coach"]?.[0];
      expect(coach).toBeTruthy();
      expectedCoaches.add(`${team}|${normalized(coach)}`);
    }

    const actualPlayers = new Set<string>();
    const playerRowPattern =
      /\('wheel-current:[^']+','((?:''|[^'])*)','([^']+)','([A-Z]+)',(?:null|[0-9.]+),([0-9.]+),'wheel-current-roster-2026-10-03'/g;

    let match: RegExpExecArray | null;
    while ((match = playerRowPattern.exec(migration))) {
      const displayName = match[1].replace(/''/g, "'");
      actualPlayers.add(`${match[3]}|${match[2]}|${normalized(displayName)}`);
    }

    const actualCoaches = new Set<string>();
    const coachRowPattern =
      /\('coach:([A-Z]+)','((?:''|[^'])*)','Head Coach','([A-Z]+)',null,([0-9.]+),'wheel-coach-audit-2026-10-03'/g;
    while ((match = coachRowPattern.exec(migration))) {
      actualCoaches.add(`${match[3]}|${normalized(match[2].replace(/''/g, "'"))}`);
    }

    expect(uniquePlayers.size).toBe(595);
    expect(expectedPlayerRows.size).toBe(596);
    expect(actualPlayers).toEqual(expectedPlayerRows);
    expect(actualCoaches).toEqual(expectedCoaches);
  });

  it("keeps grades private until a natural seven-pick completion", () => {
    expect(migration).toContain(
      "case when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade else null end",
    );
    expect(migration).toContain(
      "'result', case when match.phase = 'complete' and match.forfeited_at is null",
    );
    expect(migration).toContain("when count(*) = 7 and count(pick.hidden_grade) = 7");
    expect(migration).toContain("then round(avg(pick.hidden_grade), 1)");
  });

  it("uses the wider current-NFL display curve", () => {
    expect(migration).toContain("round((p_raw_grade * 2) - 100)");
    expect(migration).toContain(
      "raw 75/80/85/90/95/100 maps to 50/60/70/80/90/100",
    );
  });

  it("fails closed if a curated current player is ever missing a grade", () => {
    expect(migration).toContain("raise exception 'Wheel of Football grade could not be resolved'");
    expect(migration).toContain(
      "If a selectable name",
    );
    expect(migration).not.toContain("conservative fallback");
  });
});
