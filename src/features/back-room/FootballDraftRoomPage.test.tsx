// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import FootballDraftRoomPage, {
  BUILD_A_QB_TRAITS,
  BUILD_A_QB_TRAIT_HELP,
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

  it("shows Build a QB and Trio modes only through the existing owner gate", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute();

    expect(screen.getByRole("heading", { name: "Draft Room" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NFL Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL Build a QB" })).toBeInTheDocument();
    expect(screen.getByText(/Bid from a \$40 bankroll; 8 QBs appear and each side finishes with 4\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CFB Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CFB QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.getAllByText("DRAFT ROOM").length).toBeGreaterThan(0);
    expect(screen.queryByText(/ADMIN PREVIEW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ADMIN RELEASE GATE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PRIVATE UNTIL/i)).not.toBeInTheDocument();
    for (const trait of BUILD_A_QB_TRAITS) {
      expect(screen.getByText(trait)).toBeInTheDocument();
    }
  });

  it("resolves the NFL Trio launch contract with six packages, three wins, and a $30 bankroll", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute("/football/draft-room?mode=trio-nfl");
    expect(screen.getByRole("heading", { name: "NFL QB / RB / WR Trio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL QB / RB / WR Trio" })).toHaveClass("is-selected");
    expect(screen.getByText(/Bid from a \$30 bankroll; 6 trios appear and each side finishes with 3\./)).toBeInTheDocument();
    expect(screen.getByText("QB")).toBeInTheDocument();
    expect(screen.getByText("RB")).toBeInTheDocument();
    expect(screen.getByText("WR")).toBeInTheDocument();
  });

  it("resolves the CFB launch mode without weakening the canonical private gate", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute("/football/draft-room?mode=build-qb-cfb");
    expect(screen.getByRole("heading", { name: "CFB Build a QB" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CFB Build a QB" })).toHaveClass("is-selected");

    mockedUseIdentity.mockReturnValue(identity(false));
    renderRoute("/football/draft-room?mode=build-qb-cfb");
    expect(screen.getAllByText("Football home").length).toBeGreaterThan(0);
  });
});
