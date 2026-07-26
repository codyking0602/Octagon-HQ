import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { memberAchievements, type MemberProfileSummary } from "./memberProfilesModel";

const profilePage = readFileSync(new URL("./MemberProfilePage.tsx", import.meta.url), "utf8");
const directoryPage = readFileSync(new URL("./MemberDirectoryPage.tsx", import.meta.url), "utf8");
const avatarEditor = readFileSync(new URL("./MemberAvatarEditor.tsx", import.meta.url), "utf8");
const identityControl = readFileSync(new URL("../identity/IdentityControl.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../home/HomePage.tsx", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../../../supabase/migrations/202607290002_member_profile_polish.sql", import.meta.url),
  "utf8",
);

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
  picksCorrect: 0,
  picksIncorrect: 13,
  picksPending: 6,
  picksEventsEntered: 2,
  recentActivity: [],
  isCurrentUser: true,
};

describe("Member Profile polish contracts", () => {
  it("keeps the personal avatar separate from the favorite fighter everywhere the profile is presented", () => {
    expect(profilePage).toContain("avatarPhotoData");
    expect(profilePage).toContain("member-profile-favorite-card");
    expect(profilePage).toContain("MemberAvatarEditor");
    expect(directoryPage).toContain("member.avatarPhotoData");
    expect(directoryPage).toContain("FAVORITE FIGHTER");
    expect(identityControl).toContain("preferences.avatarPhotoData");
  });

  it("uses the canonical preference owner for a cropped phone upload", () => {
    expect(avatarEditor).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(avatarEditor).toContain("MAX_INPUT_BYTES = 12 * 1024 * 1024");
    expect(avatarEditor).toContain('type="range"');
    expect(avatarEditor).toContain("await onSave(photo)");
    expect(avatarEditor).toContain("await onSave(null)");
    expect(avatarEditor).toContain("for (const outputSize of [320, 280, 240])");
    expect(profilePage).toContain("onSave={preferences.setAvatarPhoto}");
  });

  it("keeps Find the Leader, UFC Picks, achievements, recent activity, and challenges as distinct profile sections", () => {
    expect(profilePage).toContain('id="member-find-leader-title">Find the Leader');
    expect(profilePage).toContain('id="member-picks-title">Current season');
    expect(profilePage).toContain('id="member-achievements-title">Octagon HQ résumé');
    expect(profilePage).toContain('id="member-activity-title">Latest results');
    expect(profilePage).toContain("CHALLENGE ACTIVITY");
    expect(profilePage).not.toContain("<span>PICKS EVENTS</span>");
  });

  it("loads the safe profile projection for the signed-in member so Picks activity can join provider results", () => {
    expect(profilePage).toContain("setLoading(!isOwnProfile)");
    expect(profilePage).toContain("remoteMember?.recentActivity?.length");
    expect(profilePage).toContain("fallbackOwnActivity");
  });

  it("derives achievements from real profile activity rather than decorative hard-coded counts", () => {
    const achievements = memberAchievements(member, {
      open: 0,
      completed: 1,
      sent: 1,
      received: 0,
    });
    expect(achievements).toHaveLength(6);
    expect(achievements.every((achievement) => achievement.unlocked)).toBe(true);
  });

  it("persists only safe authenticated avatar data and does not broaden Home in this PR", () => {
    expect(migration).toContain("add column if not exists avatar_photo_data text");
    expect(migration).toContain("grant execute on function public.set_my_avatar_photo(text) to authenticated");
    expect(migration).toContain("char_length(avatar_photo_data) <= 240000");
    expect(migration).not.toMatch(/service_role|pin_hash|internal_email|failed_attempts|locked_until/);
    expect(homePage).not.toContain("Member Profiles");
    expect(homePage).not.toContain('to="/members"');
  });
});
