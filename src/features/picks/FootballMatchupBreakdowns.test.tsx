import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FootballMatchupBreakdowns } from "./FootballMatchupBreakdowns";
import { FOOTBALL_MATCHUP_BREAKDOWNS } from "./footballMatchupBreakdowns";

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("FootballMatchupBreakdowns", () => {
  it("opens the featured breakdown sheet and switches between authored matchups without a read or prediction section", () => {
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    fireEvent.click(screen.getByRole("button", { name: "MATCHUP BREAKDOWNS" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("LSU vs. Clemson");
    expect(screen.queryByText("THE HQ READ")).not.toBeInTheDocument();
    expect(screen.queryByText("LSU 27, Clemson 17")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Louisville vs. Ole Miss" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Louisville vs. Ole Miss");
    expect(screen.getByText("OLE MISS OFFENSE vs. LOUISVILLE DEFENSE")).toBeInTheDocument();
    expect(screen.getByText("LOUISVILLE OFFENSE vs. OLE MISS DEFENSE")).toBeInTheDocument();
    expect(screen.queryByText("THE HQ READ")).not.toBeInTheDocument();
    expect(screen.queryByText("Ole Miss 31, Louisville 24")).not.toBeInTheDocument();
  });

  it("opens the exact authored breakdown requested by the canonical Football Picks URL", async () => {
    window.history.replaceState({}, "", "/football/picks?matchup=2026-louisville-ole-miss");
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    expect(await screen.findByRole("dialog")).toHaveTextContent("Louisville vs. Ole Miss");
    fireEvent.click(screen.getByRole("button", { name: "Close matchup breakdown" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("portals the open breakdown above the Picks stacking context and locks background scrolling", () => {
    render(
      <div data-testid="picks-tools">
        <FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "MATCHUP BREAKDOWNS" }));
    const dialog = screen.getByRole("dialog");

    expect(screen.getByTestId("picks-tools")).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Close matchup breakdown" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("renders optional YouTube links only when a matchup has Watch content", () => {
    const breakdown = {
      ...FOOTBALL_MATCHUP_BREAKDOWNS[0],
      id: "video-test",
      videos: [{ title: "Team preview", url: "https://www.youtube.com/watch?v=test" }],
    };

    render(<FootballMatchupBreakdowns breakdowns={[breakdown]} />);
    fireEvent.click(screen.getByRole("button", { name: "MATCHUP BREAKDOWN" }));

    const video = screen.getByRole("link", { name: /Team preview/ });
    expect(video).toHaveAttribute("href", "https://www.youtube.com/watch?v=test");
    expect(video).toHaveTextContent("YOUTUBE");
  });
});
