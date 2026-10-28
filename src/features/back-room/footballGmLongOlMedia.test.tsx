// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { nflGmLongOlBiosFromEspn, nflGmLongOlNameKey } from "./footballGmLongOlMedia";
import { LongCandidateBoard, LongRosterGrid } from "./FootballGmLongDraftPresentation";
import { NFL_GM_LONG_PLAYER_POOL } from "./footballGmLongCatalog";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS } from "./footballGmLongFoundation";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const fakeHeadshot = "https://a.espncdn.com/i/headshots/nfl/players/full/12345.png";
const fixture = {
  athletes: [
    { position: "offense", items: [
      { id: "ol-penei", displayName: "Penei Sewell", position: { abbreviation: "OT" },
        age: 25, headshot: { href: fakeHeadshot } },
      { id: "ol-mahogany", fullName: "Christian Mahogany", position: { abbreviation: "G" },
        dateOfBirth: "2000-10-13", headshot: { href: "https://a.espncdn.com/i/headshots/nfl/players/full/23456.png" } },
      { id: "ol-ratledge", displayName: "Tate Ratledge", position: { abbreviation: "G" },
        age: 24, headshot: { href: "https://untrusted.example/photo.png" } },
      { id: "wrong-position", displayName: "Juice Scruggs", position: { abbreviation: "QB" },
        age: 28, headshot: { href: fakeHeadshot } },
    ] },
  ],
};

describe("Long GM OL ESPN portrait and age enrichment", () => {
  it("matches only real offensive linemen and restricts images to ESPN", () => {
    const bios = nflGmLongOlBiosFromEspn(fixture, new Date("2026-10-12T18:00:00Z"));
    expect(bios.get("peneisewell")).toEqual({ age: 25, headshotUrl: fakeHeadshot });
    expect(bios.get("christianmahogany")?.age).toBe(25); // Birthday tomorrow.
    expect(bios.get("tateratledge")).toEqual({ age: 24, headshotUrl: null });
    expect(bios.has("juicescruggs")).toBe(false); // QB must never fill an OL identity.
    expect(nflGmLongOlNameKey("Brian O’Neill")).toBe(nflGmLongOlNameKey("Brian O'Neill"));
  });

  it("rejects two same-named players rather than inventing an identity", () => {
    const ambiguous = { athletes: [
      { items: [
        { displayName: "Player X", position: { abbreviation: "T" }, age: 30 },
        { displayName: "Player X", position: { abbreviation: "C" }, age: 21 },
      ] },
    ] };
    expect(nflGmLongOlBiosFromEspn(ambiguous).size).toBe(0);
    expect(nflGmLongOlBiosFromEspn({ athletes: [] }).size).toBe(0);
  });

  it("displays an ESPN OL headshot and AGE in Detroit selection, preserving the other scouting pills", async () => {
    const mock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => fixture,
    }));
    vi.stubGlobal("fetch", mock);
    const { container } = render(<LongCandidateBoard teamCode="DET" picks={[]} onPick={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "OL" }));
    const penei = screen.getByRole("button", { name: /^Select Penei Sewell for/ });
    await waitFor(() => expect(penei.textContent).toContain("T · AGE 25"));
    const portrait = penei.querySelector(".football-wheel-picker__headshot img");
    expect(portrait?.getAttribute("src")).toBe(fakeHeadshot);
    expect(penei.querySelector(".football-gm__candidate-tags")?.children).toHaveLength(4);
    const missing = screen.getByRole("button", { name: /^Select Juice Scruggs for/ });
    expect(missing.textContent).toContain("AGE —");
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith("/api/football/nfl-roster?team=DET");
    expect(container.querySelectorAll(".gm-long__candidate-select").length).toBeGreaterThan(0);
  });

  it("shows the same resolved age and portrait on the nine-player roster, not only candidate cards", async () => {
    const player = NFL_GM_LONG_PLAYER_POOL.find(p => p.team === "DET" && p.name === "Penei Sewell")!;
    expect(player.age).toBeNull(); // Audited OL grades and contracts are not changed.
    const { container } = render(<LongRosterGrid picks={[{ slot: "OL", playerId: player.id }]} />);
    await waitFor(() => expect(container.textContent).toContain("DET · T · AGE 25"));
    const ol = [...container.querySelectorAll(".football-gm__roster-grid article")]
      .find(article => article.textContent?.includes("Penei Sewell"))!;
    expect(ol.querySelector("img")?.getAttribute("src")).toBe(fakeHeadshot);
  });

  it("preserves Short GM's original seven-slot authority and $150M cap", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
  });
});
