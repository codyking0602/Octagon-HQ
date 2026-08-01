import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemberAvatarEditor } from "./MemberAvatarEditor";
import { memberAchievements, type MemberProfileSummary } from "./memberProfilesModel";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202607290002_member_profile_polish.sql"),
  "utf8",
);
const directorySource = readFileSync(resolve(process.cwd(), "src/features/members/MemberDirectoryPage.tsx"), "utf8");
const profileSource = readFileSync(resolve(process.cwd(), "src/features/members/MemberProfilePage.tsx"), "utf8");

const member: MemberProfileSummary = {
  displayName: "CODY",
  initials: "CK",
  avatarPhotoData: "data:image/webp;base64,AAAA",
  favoriteFighterSlug: "dustin-poirier",
  currentStreak: 2,
  bestStreak: 7,
  perfectRuns: 4,
  recordedDays: 9,
  bestFindLeaderScore: 10,
  picksCorrect: 3,
  picksIncorrect: 1,
  picksPending: 2,
  picksEventsEntered: 2,
  isCurrentUser: true,
};

afterEach(cleanup);

describe("Member profile polish", () => {
  it("keeps a personal avatar separate from the favorite fighter across profile surfaces", () => {
    expect(directorySource).toContain("member.avatarPhotoData");
    expect(directorySource).toContain("FAVORITE FIGHTER");
    expect(profileSource).toContain("MemberAvatarEditor");
    expect(profileSource).toContain("preferences.avatarPhotoData");
    expect(profileSource).toContain("EDIT FAVORITE FIGHTER");
  });

  it("lets the profile owner replace or remove a custom avatar", async () => {
    const save = vi.fn(async () => undefined);
    render(
      <MemberAvatarEditor
        photoData="data:image/webp;base64,AAAA"
        initials="CK"
        disabled={false}
        saving={false}
        onSave={save}
      />,
    );

    expect(screen.getByRole("img", { name: "Your current Octagon HQ avatar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CHANGE PHOTO" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "REMOVE" }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(null));
  });

  it("publishes only an authenticated, validated avatar preference and carries forward V1 data when available", () => {
    expect(migration).toContain("create or replace function public.set_my_avatar_photo");
    expect(migration).toContain("grant execute on function public.set_my_avatar_photo(text) to authenticated");
    expect(migration).toContain("char_length(avatar_photo_data) <= 240000");
    expect(migration).toContain("legacy.profile_photo_data");
    expect(migration).toContain("daily.game_type = 'find-leader'");
    expect(migration).not.toMatch(/service_role|pin_hash|failed_attempts|locked_until/);
  });

  it("builds a compact resume from real profile signals", () => {
    const achievements = memberAchievements(member, {
      open: 1,
      completed: 2,
      sent: 2,
      received: 1,
    });
    expect(achievements).toHaveLength(6);
    expect(achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.title)).toEqual([
      "Profile Ready",
      "Perfect 10",
      "Three-Day Run",
      "Daily Regular",
      "Picks Player",
      "Challenge Competitor",
    ]);
  });
});
