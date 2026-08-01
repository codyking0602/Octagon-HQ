import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { appRoutes } from "../../app/router";
import { AppProviders } from "../../app/providers";
import { PLAY_ROUTE_BY_GAME } from "../challenges/challengeRuntime";
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

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe("auction public product contract", () => {
  it("registers exactly one preview game with one canonical route owner", () => {
    const auctionGames = playGames.filter((game) => game.id === "auction");
    expect(auctionGames).toHaveLength(1);
    expect(playGameDefinition("auction")).toMatchObject({
      title: "Auction",
      availability: "preview",
      lineup: { challengeEligible: true },
    });
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

  it("renders the shell and all modes through only the canonical SPA route", async () => {
    renderRoute("/play/auction");
    expect(await screen.findByRole("heading", { name: "Auction" })).toBeInTheDocument();
    expect(screen.getByText("GAMEPLAY NOT YET ENABLED")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(16);
    for (const mode of auctionModes) {
      expect(screen.getByText(mode.displayName)).toBeInTheDocument();
    }
    cleanup();

    const competingRoute = renderRoute("/auction");
    expect(await screen.findByRole("heading", { name: "Welcome to Octagon HQ" })).toBeInTheDocument();
    expect(competingRoute.state.location.pathname).toBe("/");
  });
});
