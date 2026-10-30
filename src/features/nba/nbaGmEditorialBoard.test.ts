import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

/**
 * Editorial-doc quality gate, not gameplay. These are first-pass grades only.
 * This gate protects identity uniqueness, known-source links and anchor spread;
 * it does not establish that a player's ability or salary has been certified.
 */
const editorialFiles = [
  "docs/nba-gm-first-100-overall-proposals-2026-10-29.md",
  "docs/nba-gm-rotation-specialist-first-pass-2026-10-29.md",
  "docs/nba-gm-lower-rookie-overall-anchors-2026-10-29.md",
  "docs/nba-gm-east-depth-proposals-2026-10-29.md",
  "docs/nba-gm-west-depth-proposals-2026-10-29.md",
] as const;
type Candidate = {
  name: string;
  overall: number;
  fileIndex: number;
  team: string | null;
  rationale: string;
  evidence: string;
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(?:iii|ii|jr|sr)$/, "");
}

function extractEditorialCandidates(): Candidate[] {
  const candidates: Candidate[] = [];
  for (const [fileIndex, filename] of editorialFiles.entries()) {
    const text = readFileSync(filename, "utf8");
    for (const line of text.split("\n")) {
      const cells = line.split("|").map(cell => cell.trim());
      if (fileIndex === 0 && /^\d+$/.test(cells[1] ?? "") && /^\*\*\d+\*\*$/.test(cells[3] ?? "")) {
        candidates.push({
          name: cells[2]!,
          overall: Number(cells[3]!.replace(/\*/g, "")),
          fileIndex,
          team: null,
          rationale: cells[4] ?? "",
          evidence: "source-review discovery; individual current-team validation outstanding",
        });
      } else if ((fileIndex === 1 || fileIndex === 2) && /^\*\*\d+\*\*$/.test(cells[2] ?? "")) {
        candidates.push({
          name: cells[1]!,
          overall: Number(cells[2]!.replace(/\*/g, "")),
          fileIndex,
          team: null,
          rationale: (fileIndex === 2 ? cells[4] : cells[3]) ?? "",
          evidence: (fileIndex === 2 ? cells[5] : cells[4]) ?? "",
        });
      } else if (fileIndex >= 3 && /^[A-Z]{3}$/.test(cells[1] ?? "") && /^\*\*\d+\*\*$/.test(cells[3] ?? "")) {
        candidates.push({
          name: cells[2]!,
          overall: Number(cells[3]!.replace(/\*/g, "")),
          fileIndex,
          team: cells[1]!,
          rationale: cells[4] ?? "",
          evidence: cells[5] ?? "",
        });
      }
    }
  }
  return candidates;
}

const candidates = extractEditorialCandidates();

describe("NBA GM first-pass editorial rating board — not published game data", () => {
  it("has exactly 330 individually proposed, unique player identities across five source batches", () => {
    expect(candidates).toHaveLength(330);
    expect(editorialFiles.map((_, i) => candidates.filter(row => row.fileIndex === i).length))
      .toEqual([100, 38, 6, 94, 92]);
    const ids = candidates.map(row => normalize(row.name));
    expect(new Set(ids).size).toBe(330);
    expect(ids.every(Boolean)).toBe(true);
  });

  it("uses the 70–99 semantic anchor scale without granting an automatic 80 floor", () => {
    for (const row of candidates) {
      expect(Number.isInteger(row.overall), row.name).toBe(true);
      expect(row.overall, row.name).toBeGreaterThanOrEqual(70);
      expect(row.overall, row.name).toBeLessThanOrEqual(99);
      expect(row.rationale.length, row.name).toBeGreaterThan(12);
    }
    const atLeast80 = candidates.filter(row => row.overall >= 80).length;
    const atLeast90 = candidates.filter(row => row.overall >= 90).length;
    const below80 = candidates.filter(row => row.overall < 80).length;
    // Diagnostic counts only: don't require a quota or rank-to-score formula.
    expect([atLeast80, atLeast90, below80]).toEqual([132, 22, 198]);
    expect(candidates.filter(row => row.overall === 99).map(row => row.name)).toEqual(["Victor Wembanyama"]);
  });

  it("confirms all 30 clubs were checked in the current-team roster batches", () => {
    const currentTeamRows = candidates.filter(row => row.fileIndex >= 3);
    expect(currentTeamRows).toHaveLength(186);
    expect(new Set(currentTeamRows.map(row => row.team))).toEqual(new Set(NBA_GM_TEAM_CODES));
    for (const row of currentTeamRows) {
      expect(NBA_GM_TEAM_CODES).toContain(row.team);
      expect(row.evidence, row.name).toMatch(/https:\/\/hoopsnightly\.com\/teams\/[a-z0-9-]+\/roster/);
      expect(row.evidence, row.name).toContain("roster");
    }
  });

  it("reconciles the earlier 144 candidate names to documented current club snapshots", () => {
    const text = readFileSync("docs/nba-gm-original-144-team-crosswalk-2026-10-29.md", "utf8");
    const rows = text.split("\n").filter(line => /^\|\s*[^|]+\|\s*[A-Z]{3}\s*\|/.test(line));
    expect(rows).toHaveLength(144);
    const currentNames = rows.map(line => line.split("|")[1]!.trim());
    const reference = candidates.filter(candidate => candidate.fileIndex < 3).map(candidate => candidate.name);
    expect(new Set(currentNames.map(normalize))).toEqual(new Set(reference.map(normalize)));
    for (const line of rows) {
      const cells = line.split("|").map(cell => cell.trim());
      expect(NBA_GM_TEAM_CODES).toContain(cells[2]);
      expect(line).toMatch(/https:\/\/hoopsnightly\.com\/teams\/[a-z0-9-]+\/roster/);
    }
  });

  it("keeps provisional identity/ability files out of the actual game model", () => {
    const foundation = readFileSync("src/features/nba/nbaGmFoundation.ts", "utf8");
    expect(foundation).not.toContain("east-depth-proposals");
    expect(foundation).not.toContain("west-depth-proposals");
    expect(foundation).not.toContain("first-100-overall-proposals");
  });
});
