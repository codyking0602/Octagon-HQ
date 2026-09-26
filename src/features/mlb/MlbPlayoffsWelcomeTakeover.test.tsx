import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MlbPlayoffsWelcomeTakeover } from "./MlbPlayoffsWelcomeTakeover";

describe("MLB playoffs welcome takeover", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.style.overflow = "";
  });

  it("renders one locked poster with one real acknowledgement action", () => {
    const { container, getByAltText, getByRole } = render(
      <MlbPlayoffsWelcomeTakeover profileId="profile-a" />,
    );

    expect(getByRole("dialog")).toBeTruthy();

    const poster = getByAltText(/MLB Playoff Challenge/i);
    expect(poster.getAttribute("src")).toBe(
      "/assets/mlb/69608B72-2CD3-4A50-A271-8CC234EFBD11.png",
    );
    expect(poster.getAttribute("alt")).toContain("How can you not be romantic about baseball?");
    expect(poster.getAttribute("alt")).toContain("Series Picks");
    expect(poster.getAttribute("alt")).toContain("Bracket");
    expect(poster.getAttribute("alt")).toContain("Featured Challenges");
    expect(poster.getAttribute("alt")).toContain("Championship Race");
    expect(poster.getAttribute("alt")).not.toContain("Track the standings");

    expect(getByRole("button", { name: /enter the playoffs/i })).toBeTruthy();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("stays dismissed for that profile after acknowledgement", () => {
    const key = "octagon-hq:mlb-playoffs-welcome:2026-v3:preview:profile-a";
    const first = render(<MlbPlayoffsWelcomeTakeover profileId="profile-a" mode="preview" />);

    fireEvent.click(first.getByRole("button", { name: /enter the playoffs/i }));

    expect(first.queryByRole("dialog")).toBeNull();
    expect(window.localStorage.getItem(key)).toBe("dismissed");

    first.unmount();

    const second = render(<MlbPlayoffsWelcomeTakeover profileId="profile-a" mode="preview" />);
    expect(second.queryByRole("dialog")).toBeNull();

    second.unmount();

    const otherProfile = render(<MlbPlayoffsWelcomeTakeover profileId="profile-b" mode="preview" />);
    expect(otherProfile.getByRole("dialog")).toBeTruthy();
  });

  it("keeps owner preview dismissal separate from the real public launch", () => {
    window.localStorage.setItem(
      "octagon-hq:mlb-playoffs-welcome:2026-v3:preview:profile-a",
      "dismissed",
    );

    const launch = render(
      <MlbPlayoffsWelcomeTakeover profileId="profile-a" mode="launch" />,
    );

    expect(launch.getByRole("dialog")).toBeTruthy();
  });
});
