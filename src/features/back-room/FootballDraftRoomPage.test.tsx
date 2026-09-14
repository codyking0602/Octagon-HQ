// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import FootballDraftRoomPage, {
  BUILD_A_QB_TRAITS,
  BUILD_A_QB_TRAIT_HELP,
  formatTrioFinalScore,
  hasDraftRoomAdminAccess,
  parseTrioPackageLabel,
} from "./FootballDraftRoomPage";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: vi.fn(),
}));

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: vi.fn(),
}));

const mockedUseIdentity = vi.mocked(useIdentity);
const mockedUsePlayChallenges = vi.mocked(usePlayChallenges);

function identity(canControlPicks: boolean | undefined) {
  return {
    status: "ready",
    ready: true,
    profile: {
      id: "profile-1",
      displayName: "CODY",
      initials: "C",
      canControlPicks,
    },
    busy: false,
    error: "",
    dialogOpen: false,
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    clearError: vi.fn(),
    signIn: vi.fn(),
    createProfile: vi.fn(),
    signOut: vi.fn(),
  } as ReturnType<typeof useIdentity>;
}

function renderRoute(entry = "/football/draft-room") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/football/draft-room" element={<FootballDraftRoomPage />} />
        <Route path="/football" element={<div>Football home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Football Draft Room", () => {
  beforeEach(() => {
    mockedUseIdentity.mockReset();
    mockedUsePlayChallenges.mockReset();
    mockedUsePlayChallenges.mockReturnValue({
      configured: true,
      enabled: true,
      loading: false,
      error: "",
      profiles: [],
      activeProfile: null,
      members: [],
      challenges: [],
      composer: null,
      resultCode: "",
      preferredRecipientName: "",
      prepareRecipient: vi.fn(),
      clearPreparedRecipient: vi.fn(),
      beginChallenge: vi.fn(),
      refresh: vi.fn(),
      findProfile: vi.fn(),
      openComposer: vi.fn(),
      closeComposer: vi.fn(),
      sendChallenge: vi.fn(),
      getChallenge: vi.fn(),
      markOpened: vi.fn(),
      submitResult: vi.fn(),
      dismissChallenge: vi.fn(),
      cancelPendingAuction: vi.fn(),
      viewResults: vi.fn(),
    } as ReturnType<typeof usePlayChallenges>);
  });

  it("reuses the existing Picks owner projection as the only preview gate", () => {
    expect(hasDraftRoomAdminAccess(null)).toBe(false);
    expect(hasDraftRoomAdminAccess(identity(false).profile)).toBe(false);
    expect(hasDraftRoomAdminAccess(identity(true).profile)).toBe(true);
  });

  it("keeps the approved four-trait explanations player-facing and concise", () => {
    expect(BUILD_A_QB_TRAIT_HELP).toEqual({
      Arm: "Throwing power, velocity, and ability to drive difficult throws",
      Accuracy: "Ball placement and consistent catchable precision at all levels",
      Processing: "Speed and quality of reads, decisions, and getting to the right answer",
      Mobility: "Movement, escape ability, rushing value, and creation outside structure",
    });
  });

  it("redirects a non-admin direct route back to Football", () => {
    mockedUseIdentity.mockReturnValue(identity(false));
    renderRoute();
    expect(screen.getByText("Football home")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Draft Room" })).not.toBeInTheDocument();
  });

  it("keeps close Trio outcomes visibly distinct instead of rounding both to the same integer", () => {
    expect(formatTrioFinalScore(87.2222)).toBe("87.2");
    expect(formatTrioFinalScore(86.8888)).toBe("86.9");
    expect(formatTrioFinalScore(87)).toBe("87.0");
  });

  it("parses one Trio package into exactly QB, RB, and WR presentation rows", () => {
    expect(parseTrioPackageLabel("Patrick Mahomes | Derrick Henry | Calvin Johnson")).toEqual([
      { position: "QB", label: "Patrick Mahomes" },
      { position: "RB", label: "Derrick Henry" },
      { position: "WR", label: "Calvin Johnson" },
    ]);
    expect(parseTrioPackageLabel("Joe Burrow · LSU 2019 | Reggie Bush · USC 2005 | Travis Hunter · Colorado 2024"))
      .toEqual([
        { position: "QB", label: "Joe Burrow · LSU 2019" },
        { position: "RB", label: "Reggie Bush · USC 2005" },
        { position: "WR", label: "Travis Hunter · Colorado 2024" },
      ]);
  });

  it("uses the UFC-parallel Draft Room hero and defaults the browse board to NFL only", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute();

    expect(screen.getByRole("heading", { name: "Draft Room" })).toBeInTheDocument();
    expect(screen.getByText("SEALED BID CHALLENGE")).toBeInTheDocument();
    expect(screen.getByText("Pick a format and challenge another member. Bid privately to build the stronger roster.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "NFL Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cowboys Since 2007" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CFB Build a QB" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CFB QB / RB / WR Trio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Longhorns Since 2003" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Longhorns Teams Since 2003" })).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/build-qb-andrew-luck-hero.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-trio-nfl.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-cowboys-jason-witten.webp"]')).toBeInTheDocument();
  });

  it("filters the visual browse board to CFB without mixing NFL modes", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute();

    fireEvent.click(screen.getByRole("button", { name: "CFB" }));

    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "CFB Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CFB QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Best CFB Teams" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Longhorns Since 2003" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Longhorns Teams Since 2003" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "NFL Build a QB" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "NFL QB / RB / WR Trio" })).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/build-qb-cam-newton-auburn-hero.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-trio-cfb-ohio-state.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-longhorns-vince-young.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-longhorns-teams-mack-brown.webp"]')).toBeInTheDocument();
  });

  it("keeps mode selection and opponent selection as one shared two-step setup flow", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute();

    fireEvent.click(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" }));
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("SELECTED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CHOOSE OPPONENT →" }));
    expect(screen.getByRole("heading", { name: "Choose opponent" })).toBeInTheDocument();
    expect(screen.getByText("SELECTED FORMAT")).toBeInTheDocument();
    expect(screen.getByText("NFL QB / RB / WR Trio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← CHANGE FORMAT" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← CHANGE FORMAT" }));
    expect(screen.getByRole("heading", { name: "Choose a format" })).toBeInTheDocument();
  });

  it("honors a direct Trio mode link without exposing the other sport", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute("/football/draft-room?mode=trio-nfl");

    expect(screen.getByRole("button", { name: "NFL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "CFB QB / RB / WR Trio" })).not.toBeInTheDocument();
  });

  it("resolves Cowboys Since 2007 as an NFL Draft Room mode with canonical Jason Witten art", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute("/football/draft-room?mode=cowboys-2007");

    expect(screen.getByRole("button", { name: "NFL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Cowboys Since 2007" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "NFL Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CFB Build a QB" })).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-cowboys-jason-witten.webp"]')).toBeInTheDocument();
  });

  it("resolves Longhorns Since 2003 as a CFB Draft Room mode", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute("/football/draft-room?mode=longhorns-2005");

    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Longhorns Since 2003" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "CFB Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CFB QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "NFL Build a QB" })).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-longhorns-vince-young.webp"]')).toBeInTheDocument();
  });

  it("resolves Longhorns Teams Since 2003 as a CFB Draft Room mode with canonical team-season art", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute("/football/draft-room?mode=longhorns-teams-2005");

    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Longhorns Teams Since 2003" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Longhorns Since 2003" })).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-longhorns-teams-mack-brown.webp"]')).toBeInTheDocument();
  });

  it("resolves Best CFB Teams as a CFB Draft Room mode", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    const { container } = renderRoute("/football/draft-room?mode=cfb-best-teams");

    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Best CFB Teams" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "NFL Build a QB" })).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/draft-room-trio-cfb-ohio-state.webp"]')).toBeInTheDocument();
  });

  it("resolves the CFB launch mode without weakening the canonical private gate", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute("/football/draft-room?mode=build-qb-cfb");
    expect(screen.getByRole("button", { name: "CFB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "CFB Build a QB" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "NFL Build a QB" })).not.toBeInTheDocument();

    mockedUseIdentity.mockReturnValue(identity(false));
    renderRoute("/football/draft-room?mode=build-qb-cfb");
    expect(screen.getAllByText("Football home").length).toBeGreaterThan(0);
  });
});
