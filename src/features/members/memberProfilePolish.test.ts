import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { memberAchievements, type MemberProfileSummary } from "./memberProfilesModel";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const profilePage = source("src/features/members/MemberProfilePage.tsx");
const directoryPage = source("src/features/members/MemberDirectoryPage.tsx");
const avatarEditor = source("src/features/members/MemberAvatarEditor.tsx");
const identityControl = source("src/features/identity/IdentityControl.tsx");
const homePage = source("src/features/home/HomePage.tsx");
const router = source("src/app/router.tsx");
const providers = source("src/app/providers.tsx");
const mainEntry = source("src/main.tsx");
const compactStyles = source("src/styles/member-profile-compact.css");
const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202607290002_member_profile_polish.sql"),
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
  it("keeps the personal avatar while the universal Profile omits favorite sections", () => {
    expect(profilePage).toContain("avatarPhotoData");
    expect(profilePage).toContain("MemberAvatarEditor");
    expect(profilePage).not.toContain("member-profile-favorite-card");
    expect(profilePage).not.toContain("EDIT FAVORITE FIGHTER");
    expect(profilePage).not.toContain("FAVORITE FIGHTER");
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

  it("keeps daily history, both Picks sports, achievements, activity, and challenges distinct", () => {
    expect(profilePage).toContain('id="member-find-leader-title">Find the Leader');
    expect(profilePage).toContain('id="member-ufc-picks-title">Current season');
    expect(profilePage).toContain('id="member-football-picks-title">Current season');
    expect(profilePage).toContain('id="member-achievements-title">The HQ résumé');
    expect(profilePage).toContain('id="member-activity-title">Latest results');
    expect(profilePage).toContain("CHALLENGE HISTORY");
    expect(profilePage).not.toContain("<span>PICKS EVENTS</span>");
  });

  it("composes the signed-in profile from canonical owners without a duplicate member query", () => {
    expect(profilePage).toContain("if (isOwnProfile) {");
    expect(profilePage).toContain("const ownRecentActivity = useMemo");
    expect(profilePage).toContain("picks.history.events");
    expect(profilePage).toContain("picks.footballHistory.events");
    expect(profilePage).toContain("useTodayChallengeOverview");
    expect(profilePage).toContain("picks.footballSummary");
  });

  it("keeps the existing profile route and single app-level provider ownership", () => {
    expect(router).toContain('const MemberProfilePage = lazy(() => import("../features/members/MemberProfilePage"))');
    expect(router).toContain('{ path: "members/:memberName", element: <MemberProfilePage /> }');
    expect(providers.match(/<IdentityProvider>/g)).toHaveLength(1);
    expect(providers.match(/<ProfilePreferencesProvider>/g)).toHaveLength(1);
    expect(providers.match(/<PicksProvider includeFootballSummary>/g)).toHaveLength(1);
    expect(providers.match(/<ChallengeProvider>/g)).toHaveLength(1);
  });

  it("keeps the full profile dense and removes duplicate empty-state bulk", () => {
    expect(mainEntry).toContain('import "./styles/member-profile-compact.css"');
    expect(compactStyles).toContain("min-height: 82px");
    expect(compactStyles).toContain("min-height: 62px");
    expect(compactStyles).toContain("min-height: 58px");
    expect(compactStyles).toContain(".member-profile-page .member-avatar-editor__preview");
    expect(compactStyles).toContain(".member-profile-challenges:has(.member-profile-empty) .member-challenge-metrics");
    expect(compactStyles).toContain("opacity: .62");
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
