// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineAvatar, MemberInlineAvatar } from "./MemberInlineAvatar";

vi.mock("../challenges/ChallengeProvider", () => ({
  useOptionalPlayChallenges: () => ({
    activeProfile: { id: "one", displayName: "CODY", initials: "CK" },
    members: [{ displayName: "SHANE", initials: "S", avatarPhotoData: "/shane-photo.png" }],
  }),
}));
vi.mock("../profile/ProfilePreferencesProvider", () => ({
  useOptionalProfilePreferences: () => ({ avatarPhotoData: "/cody-photo.png" }),
}));

describe("shared member avatars", () => {
  it("renders Daily leaderboard photos and initials fallbacks", () => {
    const { container } = render(<>
      <InlineAvatar displayName="TROY" photo="/troy-photo.png" />
      <InlineAvatar displayName="TROY" />
    </>);
    expect(container.querySelector("img")).toHaveAttribute("src", "/troy-photo.png");
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("reuses current member and directory photos", () => {
    const { container } = render(<>
      <MemberInlineAvatar displayName="CODY" profileId="one" isCurrentUser />
      <MemberInlineAvatar displayName="SHANE" />
    </>);
    const photos = container.querySelectorAll("img");
    expect(photos).toHaveLength(2);
    expect(photos[0]).toHaveAttribute("src", "/cody-photo.png");
    expect(photos[1]).toHaveAttribute("src", "/shane-photo.png");
  });
});
