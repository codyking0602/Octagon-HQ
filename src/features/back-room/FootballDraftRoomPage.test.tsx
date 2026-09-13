// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import FootballDraftRoomPage, {
  BUILD_A_QB_TRAITS,
  hasDraftRoomAdminAccess,
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

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/football/draft-room"]}>
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

  it("redirects a non-admin direct route back to Football", () => {
    mockedUseIdentity.mockReturnValue(identity(false));
    renderRoute();
    expect(screen.getByText("Football home")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Draft Room" })).not.toBeInTheDocument();
  });

  it("shows the public-facing Build a QB presentation only through the existing owner gate", () => {
    mockedUseIdentity.mockReturnValue(identity(true));
    renderRoute();

    expect(screen.getByRole("heading", { name: "Draft Room" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build a QB" })).toBeInTheDocument();
    expect(screen.getAllByText("DRAFT ROOM").length).toBeGreaterThan(0);
    expect(screen.queryByText(/ADMIN PREVIEW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ADMIN RELEASE GATE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PRIVATE UNTIL/i)).not.toBeInTheDocument();
    for (const trait of BUILD_A_QB_TRAITS) {
      expect(screen.getByText(trait)).toBeInTheDocument();
    }
  });
});
