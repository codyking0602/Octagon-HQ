import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilePreferencesProvider, useProfilePreferences } from "./ProfilePreferencesProvider";
import type { ProfilePreferencesRepository } from "./profilePreferencesRepository";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    profile: {
      id: "11111111-1111-4111-8111-111111111111",
      displayName: "CODY",
      initials: "CK",
    },
    openDialog: () => undefined,
  }),
}));

afterEach(cleanup);

function Probe() {
  const preferences = useProfilePreferences();
  return (
    <div>
      <span>{preferences.avatarPhotoData ?? "NO PHOTO"}</span>
      <span>{preferences.favoriteFighterSlug ?? "NO FIGHTER"}</span>
      <span>{preferences.footballTeam ?? "NO TEAM"}</span>
      <button type="button" onClick={() => void preferences.refresh()}>MANUAL REFRESH</button>
    </div>
  );
}

function testRepository() {
  const loadSnapshot = vi.fn().mockResolvedValue({
    favoriteFighterSlug: "jon-jones",
    avatarPhotoData: "data:image/webp;base64,photo",
    footballTeam: "cowboys",
  });
  const loadFavoriteFighter = vi.fn().mockResolvedValue("jon-jones");
  const loadAvatarPhoto = vi.fn().mockResolvedValue("data:image/webp;base64,photo");
  const loadFootballTeam = vi.fn().mockResolvedValue("cowboys");
  const repository: ProfilePreferencesRepository = {
    loadSnapshot,
    loadFavoriteFighter,
    loadAvatarPhoto,
    loadFootballTeam,
    saveFavoriteFighter: async (slug) => slug,
    saveAvatarPhoto: async (photo) => photo,
    saveFootballTeam: async (team) => team,
  };
  return { repository, loadSnapshot, loadFavoriteFighter, loadAvatarPhoto, loadFootballTeam };
}

describe("Supabase profile egress", () => {
  it("loads one snapshot instead of downloading the avatar three times", async () => {
    const mocked = testRepository();
    render(<ProfilePreferencesProvider repository={mocked.repository}><Probe /></ProfilePreferencesProvider>);
    await waitFor(() => expect(screen.getByText("jon-jones")).toBeTruthy());
    expect(screen.getByText("data:image/webp;base64,photo")).toBeTruthy();
    expect(screen.getByText("cowboys")).toBeTruthy();
    expect(mocked.loadSnapshot).toHaveBeenCalledTimes(1);
    expect(mocked.loadFavoriteFighter).not.toHaveBeenCalled();
    expect(mocked.loadAvatarPhoto).not.toHaveBeenCalled();
    expect(mocked.loadFootballTeam).not.toHaveBeenCalled();

    // Focus + visibility should not redownload a fresh base64 image.
    fireEvent.focus(window);
    fireEvent(document, new Event("visibilitychange"));
    expect(mocked.loadSnapshot).toHaveBeenCalledTimes(1);

    // A user-initiated refresh is never throttled.
    fireEvent.click(screen.getByText("MANUAL REFRESH"));
    await waitFor(() => expect(mocked.loadSnapshot).toHaveBeenCalledTimes(2));
  });

  it("preserves compatibility with repositories that implement the original fields", async () => {
    const mocked = testRepository();
    const legacyRepository: ProfilePreferencesRepository = {
      ...mocked.repository,
      loadSnapshot: undefined,
    };
    render(<ProfilePreferencesProvider repository={legacyRepository}><Probe /></ProfilePreferencesProvider>);
    await waitFor(() => expect(screen.getByText("jon-jones")).toBeTruthy());
    expect(mocked.loadSnapshot).not.toHaveBeenCalled();
    expect(mocked.loadFavoriteFighter).toHaveBeenCalledTimes(1);
    expect(mocked.loadAvatarPhoto).toHaveBeenCalledTimes(1);
    expect(mocked.loadFootballTeam).toHaveBeenCalledTimes(1);
  });
});
