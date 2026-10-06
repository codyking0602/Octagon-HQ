import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FootballMatchupBreakdowns } from "./FootballMatchupBreakdowns";
import { FOOTBALL_MATCHUP_BREAKDOWNS } from "./footballMatchupBreakdowns";
import { usePicks } from "./PicksProvider";

vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("../picks-control/pickControlRepository", () => ({
  createPickControlRepository: vi.fn(() => ({})),
}));
vi.mock("../picks-control/FootballPushControl", () => ({
  default: () => <button type="button">SEND PUSH</button>,
}));

beforeEach(() => {
  vi.mocked(usePicks).mockReturnValue({ event: null } as never);
});

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

  it("opens the exact compact Chiefs-Raiders breakdown requested by this week's canonical Football Picks URL", async () => {
    window.history.replaceState({}, "", "/football/picks?matchup=2026-chiefs-raiders");
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Chiefs at Raiders");
    expect(dialog).toHaveTextContent("THE HQ’S NFL GAME OF THE WEEK");
    expect(dialog).toHaveTextContent("3 THINGS THAT MATTER");
    expect(dialog).not.toHaveTextContent("AP NR");
    expect(screen.getByRole("link", { name: "Kansas City Chiefs" })).toHaveAttribute(
      "href",
      "https://www.pro-football-reference.com/teams/kan/2026.htm",
    );
    expect(screen.getByRole("link", { name: "Las Vegas Raiders" })).toHaveAttribute(
      "href",
      "https://www.pro-football-reference.com/teams/rai/2026.htm",
    );
    expect(screen.getByRole("link", { name: "Patrick Mahomes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brock Bowers" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close matchup breakdown" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the compact Alabama-Mississippi State preview with AP ranks and Sports Reference links", async () => {
    window.history.replaceState({}, "", "/football/picks?matchup=2026-alabama-mississippi-state");
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Alabama at Mississippi State");
    expect(dialog).toHaveTextContent("THE HQ’S CFB GAME OF THE WEEK");
    expect(dialog).not.toHaveTextContent("THE HQ · MATCHUP BREAKDOWN");
    expect(screen.queryByRole("heading", { name: "Alabama at Mississippi State" })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent("AP #7");
    expect(dialog).toHaveTextContent("AP #16");
    expect(dialog).toHaveTextContent("3 THINGS THAT MATTER");
    expect(dialog).toHaveTextContent("THE BOTTOM LINE");
    expect(screen.queryByText("HOW EACH TEAM WINS")).not.toBeInTheDocument();
    expect(screen.queryByText("PLAYERS TO WATCH")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Alabama" })).toHaveAttribute(
      "href",
      "https://www.sports-reference.com/cfb/schools/alabama/2026.html",
    );
    expect(screen.getByRole("link", { name: "Mississippi State" })).toHaveAttribute(
      "href",
      "https://www.sports-reference.com/cfb/schools/mississippi-state/2026.html",
    );
    expect(screen.getByRole("link", { name: "Keelon Russell" })).toHaveAttribute(
      "href",
      "https://www.sports-reference.com/cfb/players/keelon-russell-1.html",
    );
    expect(screen.getByRole("link", { name: "Kamario Taylor" })).toHaveAttribute(
      "href",
      "https://www.sports-reference.com/cfb/players/kamario-taylor-1.html",
    );
  });

  it("opens the current 49ers-Seahawks compact sheet with linked teams, players and logo pills", async () => {
    window.history.replaceState({}, "", "/football/picks?matchup=2026-49ers-seahawks");
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("49ers at Seahawks");
    expect(dialog).toHaveTextContent("THE HQ’S NFL GAME OF THE WEEK");
    expect(dialog).toHaveTextContent("3 THINGS THAT MATTER");
    expect(screen.getByRole("link", { name: "San Francisco 49ers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Seattle Seahawks" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brock Purdy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jaxon Smith-Njigba" })).toBeInTheDocument();
    expect(dialog.querySelectorAll(".football-matchup-breakdown-feature-team__logo img")).toHaveLength(2);
  });

  it("opens the current Georgia-Alabama compact sheet with AP ranks, linked players and logo pills", async () => {
    window.history.replaceState({}, "", "/football/picks?matchup=2026-georgia-alabama");
    render(<FootballMatchupBreakdowns breakdowns={FOOTBALL_MATCHUP_BREAKDOWNS} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Georgia at Alabama");
    expect(dialog).toHaveTextContent("THE HQ’S CFB GAME OF THE WEEK");
    expect(dialog).toHaveTextContent("AP #2");
    expect(dialog).toHaveTextContent("AP #6");
    expect(screen.getByRole("link", { name: "Gunner Stockton" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Keelon Russell" })).toBeInTheDocument();
    expect(dialog.querySelectorAll(".football-matchup-breakdown-feature-team__logo img")).toHaveLength(2);
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

  it("keeps SEND PUSH visible in the published Football owner tools even without a matchup breakdown", () => {
    vi.mocked(usePicks).mockReturnValue({
      event: {
        eventId: "football-picks-2026-09-08",
        sport: "football",
        canControl: true,
      },
    } as never);

    render(<FootballMatchupBreakdowns breakdowns={[]} />);

    expect(screen.getByRole("button", { name: "SEND PUSH" })).toBeInTheDocument();
  });
});
