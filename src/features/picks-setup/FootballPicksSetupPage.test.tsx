import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickSetupDraft, PickSetupFootballWeekPreview } from "./pickSetupModel";
import FootballPicksSetupPage from "./FootballPicksSetupPage";
import type { PickSetupRepository } from "./pickSetupRepository";

const owner = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: owner.id }), subscribe: () => () => undefined,
    loadProfile: async () => owner, signIn: async () => undefined, createProfile: async () => undefined, signOut: async () => undefined,
  };
}

const footballDraft: PickSetupDraft = {
  draftId: "football-draft", source: "espn+the-odds-api", sourceEventKey: "football-slate:2099-09-08",
  sourceUrl: "https://www.espn.com/football/", eventId: "football-picks-2099-09-08",
  sport: "football", league: "mixed", eventKind: "slate", name: "Football Picks · Week of Sep 08",
  subtitle: "Weekly ATS slate", venue: "Multiple venues", location: "NFL + College Football",
  startsAt: "2099-09-10T00:00:00.000Z", locksAt: "2099-09-10T00:00:00.000Z", season: 2099,
  state: "staged", syncedAt: "2099-09-01T12:00:00.000Z", updatedAt: "2099-09-01T12:00:00.000Z",
  warnings: [], canPublish: true, spotlights: [],
  bouts: [{
    boutId: "football-nfl-401", position: 1, weightClass: "NFL ATS",
    redFighterSlug: "home-one", redFighterName: "Home One", blueFighterSlug: "away-one", blueFighterName: "Away One", included: true,
    kickoffAt: "2099-09-10T00:00:00.000Z", homeTeamSlug: "home-one", awayTeamSlug: "away-one",
    spreadHome: -3.5, spreadSource: "the-odds-api", spreadUpdatedAt: "2099-09-09T20:00:00.000Z",
  }, {
    boutId: "football-college-football-402", position: 2, weightClass: "COLLEGE-FOOTBALL ATS",
    redFighterSlug: "home-two", redFighterName: "Home Two", blueFighterSlug: "away-two", blueFighterName: "Away Two", included: true,
    kickoffAt: "2099-09-12T19:30:00.000Z", homeTeamSlug: "home-two", awayTeamSlug: "away-two",
    spreadHome: 2.5, spreadSource: "the-odds-api", spreadUpdatedAt: "2099-09-11T20:00:00.000Z",
  }],
};

const weekPreview: PickSetupFootballWeekPreview = {
  weekStart: "2026-09-08",
  weekEnd: "2026-09-14",
  requiredCollegeCount: 8,
  nflGames: [{
    espnEventId: "401", league: "nfl", name: "NFL One", kickoffAt: "2026-09-10T00:00:00.000Z",
    homeTeamName: "NFL Home One", awayTeamName: "NFL Away One", homeRank: null, awayRank: null,
  }, {
    espnEventId: "402", league: "nfl", name: "NFL Two", kickoffAt: "2026-09-13T17:00:00.000Z",
    homeTeamName: "NFL Home Two", awayTeamName: "NFL Away Two", homeRank: null, awayRank: null,
  }],
  collegeCandidates: Array.from({ length: 8 }, (_, index) => ({
    espnEventId: `50${index + 1}`, league: "college-football" as const, name: `College ${index + 1}`,
    kickoffAt: `2026-09-12T${String(12 + index).padStart(2, "0")}:00:00.000Z`,
    homeTeamName: `College Home ${index + 1}`, awayTeamName: `College Away ${index + 1}`,
    homeRank: index < 4 ? index + 1 : null, awayRank: null, candidateRank: index + 1,
  })),
};

function repository(
  loadDraft = vi.fn().mockResolvedValue(footballDraft),
  previewFootballWeek = vi.fn().mockResolvedValue(weekPreview),
): PickSetupRepository {
  return {
    loadDraft,
    syncNextEvent: vi.fn().mockResolvedValue(undefined),
    syncFootballGame: vi.fn().mockResolvedValue(undefined),
    previewFootballWeek,
    stageFootballWeek: vi.fn().mockResolvedValue(undefined),
    previewSource: vi.fn(), applySourcePreview: vi.fn().mockResolvedValue(undefined),
    updateMetadata: vi.fn().mockResolvedValue(undefined), saveBout: vi.fn().mockResolvedValue(undefined),
    removeBout: vi.fn().mockResolvedValue(undefined), reorderBouts: vi.fn().mockResolvedValue(undefined),
    publishDraft: vi.fn().mockResolvedValue(undefined), discardDraft: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: PickSetupRepository) {
  return render(<MemoryRouter><IdentityProvider gateway={gateway()}><FootballPicksSetupPage repository={repo} /></IdentityProvider></MemoryRouter>);
}

beforeEach(() => vi.spyOn(window, "confirm").mockReturnValue(true));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Football weekly slate owner setup", () => {
  it("auto-loads a weekly workspace, includes every NFL game, and stages eight selected college games in one action", async () => {
    const loadDraft = vi.fn().mockResolvedValueOnce(null).mockResolvedValue(footballDraft);
    const previewFootballWeek = vi.fn().mockResolvedValue(weekPreview);
    const repo = repository(loadDraft, previewFootballWeek);
    renderPage(repo);

    expect(await screen.findByRole("region", { name: "Football weekly builder" })).toBeInTheDocument();
    await waitFor(() => expect(previewFootballWeek).toHaveBeenCalled());
    expect(screen.queryByLabelText("ESPN event ID")).not.toBeInTheDocument();
    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText(/NFL Away One/)).toBeInTheDocument();
    expect(screen.getByText(/NFL Away Two/)).toBeInTheDocument();

    for (let index = 1; index <= 8; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`College Away ${index}`) }));
    }
    fireEvent.click(screen.getByRole("button", { name: "STAGE 10-GAME SLATE" }));

    await waitFor(() => expect(repo.stageFootballWeek).toHaveBeenCalledWith(
      "2026-09-08",
      ["501", "502", "503", "504", "505", "506", "507", "508"],
    ));
    await waitFor(() => expect(loadDraft).toHaveBeenLastCalledWith("football"));
    expect(repo.syncFootballGame).not.toHaveBeenCalled();
  });

  it("reviews the staged weekly slate with kickoff, league, source, and ATS line", async () => {
    renderPage(repository());
    expect(await screen.findByRole("region", { name: "Football slate review" })).toBeInTheDocument();
    expect(screen.getByText(/Away One/)).toBeInTheDocument();
    expect(screen.getByText(/Away Two/)).toBeInTheDocument();
    expect(screen.getByText("-3.5")).toBeInTheDocument();
    expect(screen.getByText("+2.5")).toBeInTheDocument();
    expect(screen.getAllByText("NFL")).not.toHaveLength(0);
    expect(screen.getByText("COLLEGE FOOTBALL")).toBeInTheDocument();
    expect(screen.getAllByText(/the-odds-api/)).toHaveLength(2);
  });

  it("publishes through the existing canonical draft publication method", async () => {
    const repo = repository();
    renderPage(repo);
    fireEvent.click(await screen.findByRole("button", { name: "PUBLISH FOOTBALL SLATE" }));
    await waitFor(() => expect(repo.publishDraft).toHaveBeenCalledWith("football-draft"));
    expect(window.confirm).toHaveBeenCalledWith("Publish this reviewed Football slate? ATS spreads freeze at publication.");
  });
});
