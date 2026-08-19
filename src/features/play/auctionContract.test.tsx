import { cleanup, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { appRoutes } from "../../app/router";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { PLAY_ROUTE_BY_GAME } from "../challenges/challengeRuntime";
import { IdentityProvider } from "../identity/IdentityProvider";
import {
  AUCTION_MODE_IDS,
  ULTIMATE_FIGHTER_CATEGORIES,
  auctionModeDefinition,
  auctionModeGroups,
  auctionModes,
  auctionModesForGroup,
  isAuctionModeId,
  parseAuctionModeId,
  usesUltimateFighterPlacement,
} from "./auctionContract";
import { playGameDefinition, playGames } from "./playRegistry";

afterEach(cleanup);

const canonicalChildRoutes = appRoutes.flatMap((route) => route.children ?? []);
const retiredPerformanceModes = ["championship-performances", "dominant-performances"] as const;

describe("auction public product contract", () => {
  it("registers exactly one playable game with one canonical route owner", () => {
    const auctionGames = playGames.filter((game) => game.id === "auction");
    expect(auctionGames).toHaveLength(1);
    expect(playGames[0]?.id).toBe("auction");
    expect(playGameDefinition("auction")).toMatchObject({
      icon: "$",
      title: "Auction",
      description: "Choose a UFC auction, bid privately, and build the stronger collection.",
      lineup: { challengeEligible: true },
    });
    expect(playGameDefinition("auction")).not.toHaveProperty("availability");
    expect(PLAY_ROUTE_BY_GAME.auction).toBe("/play/auction");
  });

  it("offers fourteen current modes while retaining all historical mode IDs", () => {
    expect(AUCTION_MODE_IDS).toHaveLength(16);
    expect(auctionModes).toHaveLength(14);
    expect(new Set(auctionModes.map((mode) => mode.id)).size).toBe(14);
    for (const mode of auctionModes) {
      expect(isAuctionModeId(mode.id)).toBe(true);
      expect(parseAuctionModeId(mode.id)).toBe(mode.id);
      expect(mode.displayName.trim()).not.toBe("");
      expect(mode.family).toMatch(/-auction$/);
    }
    for (const retiredMode of retiredPerformanceModes) {
      expect(auctionModes.some((mode) => mode.id === retiredMode)).toBe(false);
      expect(isAuctionModeId(retiredMode)).toBe(true);
      expect(parseAuctionModeId(retiredMode)).toBe(retiredMode);
      expect(auctionModeDefinition(retiredMode).displayName).toMatch(/Performances$/);
    }
    expect(parseAuctionModeId("future-mode")).toBeNull();
  });

  it("groups every current mode once and keeps the consolidated performance choices focused", () => {
    const groupedIds = auctionModeGroups.flatMap((group) => group.modeIds);
    expect(auctionModeGroups.map((group) => group.id)).toEqual([
      "fighters",
      "skills",
      "performances",
      "history",
    ]);
    expect(groupedIds).toHaveLength(14);
    expect(new Set(groupedIds).size).toBe(14);
    expect([...groupedIds].sort()).toEqual([...auctionModes.map((mode) => mode.id)].sort());
    expect(auctionModesForGroup("performances").map((mode) => mode.id)).toEqual([
      "fighter-performances",
      "finishes",
    ]);
    expect(auctionModesForGroup("all")).toEqual(auctionModes);
    for (const group of auctionModeGroups) {
      expect(auctionModesForGroup(group.id).map((mode) => mode.id)).toEqual(group.modeIds);
    }
  });

  it("preserves Best Finishes and the newer UFC-history modes", () => {
    expect(auctionModes.map((mode) => mode.id)).toEqual(expect.arrayContaining([
      "fighter-performances",
      "finishes",
      "rivalries",
      "iconic-moments",
      "nicknames",
    ]));
    expect(auctionModeDefinition("finishes").displayName).toBe("Best Finishes");
  });

  it("limits career-performance auctions to the three locked fighter careers", () => {
    expect(
      auctionModes
        .filter((mode) => mode.family === "career-performance-auction")
        .map((mode) => mode.id),
    ).toEqual([
      "jon-jones-performances",
      "conor-mcgregor-performances",
      "charles-oliveira-performances",
    ]);
    expect(auctionModeDefinition("fighter-performances").family).toBe("historical-collection-auction");
  });

  it("locks the Ultimate Fighter structure and categories", () => {
    expect(auctionModeDefinition("ultimate-fighter")).toMatchObject({
      rounds: 10,
      requiredSelectionsPerPlayer: 5,
      startingBankroll: 50,
      usesUltimateFighterPlacement: true,
      categories: ULTIMATE_FIGHTER_CATEGORIES,
    });
    expect(ULTIMATE_FIGHTER_CATEGORIES).toEqual(["Striking", "Grappling", "Frame", "Power", "Heart"]);
    expect(usesUltimateFighterPlacement("ultimate-fighter")).toBe(true);
  });

  it("locks the shared structure for every other current and historical mode", () => {
    for (const modeId of AUCTION_MODE_IDS.filter((candidate) => candidate !== "ultimate-fighter")) {
      const mode = auctionModeDefinition(modeId);
      expect(mode).toMatchObject({
        rounds: 6,
        requiredSelectionsPerPlayer: 3,
        startingBankroll: 30,
        usesUltimateFighterPlacement: false,
        categories: [],
      });
      expect(usesUltimateFighterPlacement(mode.id)).toBe(false);
    }
  });

  it("renders the signed-out state from the only canonical auction SPA route", async () => {
    const auctionRoutes = canonicalChildRoutes.filter((route) => route.path === "play/auction");
    expect(auctionRoutes).toHaveLength(1);
    expect(canonicalChildRoutes.some((route) => route.path === "auction" || route.path === "/auction")).toBe(false);

    render(
      <IdentityProvider gateway={null}>
        <ChallengeProvider repository={null}>
          <MemoryRouter>
            <Suspense fallback={null}>{auctionRoutes[0]?.element}</Suspense>
          </MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Auction" })).toBeInTheDocument();
    expect(screen.getByText("SEALED BID CHALLENGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO PLAY" })).toBeInTheDocument();
  });

  it("keeps the exact private Auction destination while a participant signs in", async () => {
    const auctionRoute = canonicalChildRoutes.find((route) => route.path === "play/auction");
    expect(auctionRoute).toBeDefined();

    render(
      <IdentityProvider gateway={null}>
        <ChallengeProvider repository={null}>
          <MemoryRouter
            initialEntries={[
              "/play/auction?auction=123e4567-e89b-42d3-a456-426614174000",
            ]}
          >
            <Suspense fallback={null}>{auctionRoute?.element}</Suspense>
          </MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Sign in to open this Auction" })).toBeInTheDocument();
    expect(screen.getByText(/exact destination will stay here while you sign in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO CONTINUE" })).toBeInTheDocument();
  });
});
