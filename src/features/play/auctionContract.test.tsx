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
  auctionModes,
  isAuctionModeId,
  parseAuctionModeId,
  usesUltimateFighterPlacement,
} from "./auctionContract";
import { playGameDefinition, playGames } from "./playRegistry";

afterEach(cleanup);

const canonicalChildRoutes = appRoutes.flatMap((route) => route.children ?? []);

describe("auction public product contract", () => {
  it("registers exactly one playable game with one canonical route owner", () => {
    const auctionGames = playGames.filter((game) => game.id === "auction");
    expect(auctionGames).toHaveLength(1);
    expect(playGameDefinition("auction")).toMatchObject({
      title: "Auction",
      lineup: { challengeEligible: true },
    });
    expect(playGameDefinition("auction")).not.toHaveProperty("availability");
    expect(PLAY_ROUTE_BY_GAME.auction).toBe("/play/auction");
  });

  it("publishes exactly sixteen unique, parseable mode IDs", () => {
    expect(auctionModes).toHaveLength(16);
    expect(auctionModes.map((mode) => mode.id)).toEqual(AUCTION_MODE_IDS);
    expect(new Set(auctionModes.map((mode) => mode.id)).size).toBe(16);
    for (const mode of auctionModes) {
      expect(isAuctionModeId(mode.id)).toBe(true);
      expect(parseAuctionModeId(mode.id)).toBe(mode.id);
      expect(mode.displayName.trim()).not.toBe("");
      expect(mode.family).toMatch(/-auction$/);
    }
    expect(parseAuctionModeId("future-mode")).toBeNull();
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

  it("locks the shared structure for every other mode", () => {
    for (const mode of auctionModes.filter((candidate) => candidate.id !== "ultimate-fighter")) {
      expect(mode).toMatchObject({
        rounds: 8,
        requiredSelectionsPerPlayer: 4,
        startingBankroll: 40,
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
