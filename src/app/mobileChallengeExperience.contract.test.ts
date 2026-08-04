import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const bottomNavigation = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const challengeStyles = readFileSync("src/styles/challenge-member-picker.css", "utf8");
const challengeProvider = readFileSync("src/features/challenges/ChallengeProvider.tsx", "utf8");
const challengeCenter = readFileSync("src/features/challenges/ChallengeCenter.tsx", "utf8");
const auctionPage = readFileSync("src/features/play/AuctionPage.tsx", "utf8");

describe("mobile challenge experience", () => {
  it("keeps the bottom navigation owned by the document viewport and hides it above the keyboard", () => {
    expect(bottomNavigation).toContain("window.visualViewport");
    expect(bottomNavigation).toContain("return createPortal(navigation, document.body)");
    expect(bottomNavigation).toContain('keyboardOpen ? " is-keyboard-open" : ""');
    expect(challengeStyles).toContain(".bottom-nav.is-keyboard-open");
    expect(challengeStyles).toContain("pointer-events: none");
  });

  it("uses one member picker for standard challenges and Auction", () => {
    expect(challengeProvider).toContain("createMemberProfilesRepository");
    expect(challengeProvider).toContain("<ChallengeMemberPicker");
    expect(auctionPage).toContain("<ChallengeMemberPicker");
    expect(auctionPage).not.toContain('list="auction-opponent-suggestions"');
  });

  it("shows the opponent photo and full name in Challenge Center", () => {
    expect(challengeCenter).toContain("counterpart?.avatarPhotoData");
    expect(challengeCenter).toContain('<strong>{counterpart?.displayName ?? "Octagon HQ profile"}</strong>');
    expect(challengeStyles).toContain(".challenge-center__member-link");
    expect(challengeStyles).toContain("grid-template-columns: minmax(0, 1fr) auto");
  });
});
