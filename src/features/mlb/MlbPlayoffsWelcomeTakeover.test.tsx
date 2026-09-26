import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MlbPlayoffsWelcomeTakeover } from "./MlbPlayoffsWelcomeTakeover";

describe("MLB playoffs welcome takeover", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.style.overflow = "";
  });

  it("renders the locked launch explainer with one explicit dismissal action", () => {
    const { container, getByRole } = render(
      <MlbPlayoffsWelcomeTakeover profileId="profile-a" />,
    );

    expect(getByRole("dialog")).toBeTruthy();
    expect(container.textContent).toContain("How can you not be romantic about baseball?");
    expect(container.textContent).toContain("Series Picks");
    expect(container.textContent).toContain("Bracket");
    expect(container.textContent).toContain("Featured Challenges");
    expect(container.textContent).toContain("Championship Race");
    expect(container.textContent).not.toContain("Track the standings");
    expect(getByRole("button", { name: /enter the playoffs/i })).toBeTruthy();
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("stays dismissed for that profile after acknowledgement", () => {
    const key = "octagon-hq:mlb-playoffs-welcome:2026-v1:profile-a";
    const first = render(<MlbPlayoffsWelcomeTakeover profileId="profile-a" />);

    fireEvent.click(first.getByRole("button", { name: /enter the playoffs/i }));

    expect(first.queryByRole("dialog")).toBeNull();
    expect(window.localStorage.getItem(key)).toBe("dismissed");

    first.unmount();

    const second = render(<MlbPlayoffsWelcomeTakeover profileId="profile-a" />);
    expect(second.queryByRole("dialog")).toBeNull();

    second.unmount();

    const otherProfile = render(<MlbPlayoffsWelcomeTakeover profileId="profile-b" />);
    expect(otherProfile.getByRole("dialog")).toBeTruthy();
  });
});
