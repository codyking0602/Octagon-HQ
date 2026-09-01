import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FootballMatchupBreakdowns } from "./FootballMatchupBreakdowns";
import { FOOTBALL_MATCHUP_BREAKDOWNS } from "./footballMatchupBreakdowns";

describe("FootballMatchupBreakdowns", () => {
  it("opens the featured breakdown sheet and switches between authored matchups", () => {
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    fireEvent.click(screen.getByRole("button", { name: "MATCHUP BREAKDOWNS" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("LSU vs. Clemson");
    expect(screen.getByText("LSU 27, Clemson 17")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Louisville vs. Ole Miss" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Louisville vs. Ole Miss");
    expect(screen.getByText("Ole Miss 31, Louisville 24")).toBeInTheDocument();
    expect(screen.getByText("OLE MISS OFFENSE vs. LOUISVILLE DEFENSE")).toBeInTheDocument();
    expect(screen.getByText("LOUISVILLE OFFENSE vs. OLE MISS DEFENSE")).toBeInTheDocument();
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
