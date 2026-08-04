import { describe, expect, it } from "vitest";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import { challengeMemberOptions } from "./ChallengeMemberPicker";

const members: MemberCardSummary[] = [
  {
    displayName: "CODY",
    initials: "C",
    avatarPhotoData: null,
    favoriteFighterSlug: null,
    currentStreak: 0,
    picksCorrect: 0,
    picksIncorrect: 0,
    isCurrentUser: true,
  },
  {
    displayName: "SHANE",
    initials: "S",
    avatarPhotoData: "data:image/webp;base64,shane",
    favoriteFighterSlug: null,
    currentStreak: 0,
    picksCorrect: 0,
    picksIncorrect: 0,
    isCurrentUser: false,
  },
  {
    displayName: "TYLER",
    initials: "T",
    avatarPhotoData: null,
    favoriteFighterSlug: null,
    currentStreak: 0,
    picksCorrect: 0,
    picksIncorrect: 0,
    isCurrentUser: false,
  },
];

describe("challenge member picker", () => {
  it("shows every eligible member and puts recent opponents first", () => {
    expect(challengeMemberOptions(members, "", ["TYLER"]).map((member) => member.displayName))
      .toEqual(["TYLER", "SHANE"]);
  });

  it("keeps search optional and filters only when text is entered", () => {
    expect(challengeMemberOptions(members, "sha").map((member) => member.displayName))
      .toEqual(["SHANE"]);
  });
});
