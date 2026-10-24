import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { PlayChallenge } from "../challenges/challengeModel";
import type { RankingFighter } from "../rankings/rankingModel";
import { outstandingUfcChallengeCount } from "./HomePage";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";

vi.mock("../rankings/rankingPresentation", () => ({
  resolveWatchMomentAction: () => ({ url: "https://www.youtube.com/watch?v=abc123" }),
}));
vi.mock("../rankings/FighterPhoto", () => ({
  FighterPhoto: ({ name, className }: { name: string; className?: string }) =>
    <img className={className} src="/fighter.webp" alt={name} />,
}));

describe("UFC HQ finishing refinements", () => {
  const fighter = {
    displayName: "Islam Makhachev",
    slug: "islam-makhachev",
    thumbUrl: "/fighter.webp",
    rank: 5,
    division: "LW / WW",
    visibleStats: { ufcRecord: "18-1" },
    ovr: 94,
    resumeTag: "Modern lightweight standard",
  } as RankingFighter;

  it("links the fighter photo and name without a visible Profile button and retains a Football-sized Watch Moment", () => {
    render(<MemoryRouter><RankingSpotlightCard fighter={fighter} compact /></MemoryRouter>);
    const spotlight = screen.getByRole("article", { name: "UFC Fighter Spotlight" });
    expect(within(spotlight).getByRole("link", { name: "View Islam Makhachev profile photo" }))
      .toHaveAttribute("href", "/fighters/islam-makhachev");
    expect(within(spotlight).getByRole("link", { name: "Islam Makhachev" }))
      .toHaveAttribute("href", "/fighters/islam-makhachev");
    expect(within(spotlight).getByRole("link", { name: "WATCH MOMENT ↗" }))
      .toHaveAttribute("href", "https://www.youtube.com/watch?v=abc123");
    expect(within(spotlight).queryByText("VIEW PROFILE →")).not.toBeInTheDocument();
    expect(within(spotlight).queryByText("WATCH HIGHLIGHTS ↗")).not.toBeInTheDocument();

    const css = readFileSync("src/styles/home-ufc-hq.css", "utf8");
    expect(css).toContain(".ufc-fighter-spotlight__name-link:focus-visible");
    expect(css).toContain("text-decoration: none;");
    expect(css).toContain(".ufc-fighter-spotlight__watch { width: 100%;");
    expect(css).not.toContain(".ufc-fighter-spotlight__actions");
  });

  it("centers Shane's ranked #1 inside the unchanged three-fighter and full-board card", () => {
    render(<MemoryRouter><ShanesWatchlistCard compact /></MemoryRouter>);
    const board = screen.getByRole("region", { name: "SHANE'S CONTENDER SERIES" });
    expect(within(board).getByRole("link", { name: /Quillan Salkilld/ }))
      .toHaveAttribute("href", "/fighters-to-watch#quillan-salkilld");
    expect(within(board).getByRole("link", { name: /Raul Rosas Jr/ }))
      .toHaveAttribute("href", "/fighters-to-watch#raul-rosas-jr");
    expect(within(board).getByRole("link", { name: /Abdul Rakhman Yakhyaev/ }))
      .toHaveAttribute("href", "/fighters-to-watch#abdul-rakhman-yakhyaev");
    expect(within(board).getByRole("link", { name: "FULL BOARD →" }))
      .toHaveAttribute("href", "/fighters-to-watch");
    const css = readFileSync("src/styles/home-ufc-hq.css", "utf8");
    expect(css).toMatch(/\.ufc-contender-series__lead\s*\{[^}]*justify-content:\s*center/s);
  });

  it("counts only actionable incoming UFC challenges, not Football, sent, hidden, or expired challenges", () => {
    const incoming: PlayChallenge = {
      code: "ABCD1234", gameId: "who-am-i", gameVersion: "ufc-who-am-i-v1",
      gameTitle: "Who Am I?", summary: "", creatorId: "friend", recipientId: "owner",
      playUrl: "/play/who-am-i", setup: null, creatorResult: null,
      responderResult: null, createdAt: "2026-10-22T00:00:00Z", openedAt: null,
      completedAt: null, declinedAt: null, expiresAt: "2026-11-22T00:00:00Z", hiddenFor: [],
    };
    const at = new Date("2026-10-24T12:00:00Z").getTime();
    expect(outstandingUfcChallengeCount([
      incoming,
      { ...incoming, code: "BBBB2222", openedAt: "2026-10-24T00:00:00Z" },
      { ...incoming, code: "CCCC3333", gameVersion: "football-who-am-i-v1", playUrl: "/football/who-am-i" },
      { ...incoming, code: "DDDD4444", recipientId: "friend", creatorId: "owner" },
      { ...incoming, code: "EEEE5555", responderResult: 85 },
      { ...incoming, code: "FFFF6666", declinedAt: "2026-10-24T00:00:00Z" },
      { ...incoming, code: "GGGG7777", hiddenFor: ["owner"] },
      { ...incoming, code: "HHHH8888", expiresAt: "2026-10-23T00:00:00Z" },
    ], "owner", at)).toBe(2);
  });

  it("retains neutral compact HQ and spotlight backgrounds without adding blue bleed to Football", () => {
    const css = readFileSync("src/styles/home-ufc-hq.css", "utf8");
    expect(css).toMatch(/\.ufc-hq--compact\s*\{[^}]*background:\s*linear-gradient\(160deg/s);
    expect(css).toMatch(/\.ufc-hq--compact \.ufc-fighter-spotlight\s*\{[^}]*background:/s);
    expect(css).not.toContain("radial-gradient(circle at 95% 110%");
  });
});
