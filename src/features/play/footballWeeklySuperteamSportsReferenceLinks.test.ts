import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballWeeklySuperteamSportsReferenceUrl } from "../back-room/footballWeeklySuperteamVisualIdentity";

const gate = readFileSync("src/features/back-room/FootballWeeklySuperteamGate.tsx", "utf8");
const table = readFileSync("src/features/back-room/FootballWeeklySuperteamTableDialog.tsx", "utf8");

describe("CFB Superteam Sports-Reference links", () => {
  it("uses Sports-Reference's CFB resolver instead of guessing unstable player URL suffixes", () => {
    const url = new URL(footballWeeklySuperteamSportsReferenceUrl("Caleb Williams"));
    expect(url.origin).toBe("https://www.sports-reference.com");
    expect(url.pathname).toBe("/cfb/search/search.fcgi");
    expect(url.searchParams.get("search")).toBe("Caleb Williams");
  });

  it("links current candidates and every persisted roster/result surface", () => {
    expect(gate).toContain("SportsReferenceName displayName={card.display_name}");
    expect(gate).toContain("SportsReferenceName displayName={result.display_name}");
    expect((gate.match(/SportsReferenceName displayName={item\.display_name}/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(table).toContain("footballWeeklySuperteamSportsReferenceUrl(item.display_name)");
  });

  it("opens links separately so auction state is preserved", () => {
    expect(gate).toContain('target="_blank"');
    expect(gate).toContain('rel="noopener noreferrer"');
    expect(table).toContain('target="_blank"');
  });
});
