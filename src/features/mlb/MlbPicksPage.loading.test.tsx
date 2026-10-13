import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import MlbPicksPage from "./MlbPicksPage";
import { useMlbChampionship } from "./useMlbChampionship";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import type { MlbPlayoffsHub } from "./mlbPlayoffsRepository";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./useMlbPlayoffs", () => ({ useMlbPlayoffs: vi.fn() }));
vi.mock("./useMlbChampionship", () => ({ useMlbChampionship: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function showHub(hub: MlbPlayoffsHub | null) {
  vi.mocked(useMlbPlayoffs).mockReturnValue({
    hub,
    loading: hub === null,
    error: "",
    saving: "",
    reload: vi.fn(),
    saveBracket: vi.fn(),
    saveSeriesPick: vi.fn(),
  } as unknown as ReturnType<typeof useMlbPlayoffs>);
}

describe("MLB Picks asynchronous page loading", () => {
  it("can go from loading to a populated bracket and back without changing React hook order", () => {
    vi.mocked(useIdentity).mockReturnValue({
      ready: true,
      profile: { id: "shane-test", displayName: "Shane", canControlPicks: false },
      openDialog: vi.fn(),
    } as unknown as ReturnType<typeof useIdentity>);
    vi.mocked(useMlbChampionship).mockReturnValue({
      championship: null,
      loading: false,
      error: "",
      reload: vi.fn(),
    } as unknown as ReturnType<typeof useMlbChampionship>);

    showHub(null);
    const { rerender } = render(
      <MemoryRouter><MlbPicksPage /></MemoryRouter>,
    );
    expect(screen.getByText("Loading MLB Playoffs…")).toBeInTheDocument();

    showHub(MLB_OWNER_PREVIEW_HUB);
    rerender(<MemoryRouter><MlbPicksPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Playoff bracket" })).toBeInTheDocument();

    showHub(null);
    rerender(<MemoryRouter><MlbPicksPage /></MemoryRouter>);
    expect(screen.getByText("Loading MLB Playoffs…")).toBeInTheDocument();
  });
});
