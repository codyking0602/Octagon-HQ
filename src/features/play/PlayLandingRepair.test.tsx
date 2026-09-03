// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLandingGameLibrary, PlayLandingHeader, playLandingGameIds } from "./PlayLandingPresentation";

describe("PR3 Play landing repair", () => {
  it("puts Auction first and leaves future slots unimplemented", () => {
    expect(playLandingGameIds("ufc")).toEqual(["auction", "find-leader", "wavelength", "blind-resume", "hit-the-number"]);
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={() => {}} />);
    const cards = within(screen.getByRole("region", { name: /pick a game/i })).getAllByRole("button");
    expect(cards[0]).toHaveTextContent("Auction");
    expect(screen.queryByText(/Who Am I|20 Questions|Draft Room/i)).not.toBeInTheDocument();
  });

  it("opens UFC Find the Leader as replayable instead of the official Daily route", () => {
    const navigate = vi.fn();
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={navigate} />);
    fireEvent.click(screen.getByRole("button", { name: /find the leader/i }));
    expect(navigate).toHaveBeenCalledWith("/play/find-leader?mode=replayable");
  });

  it("uses the compact shared header copy for both sports", () => {
    const { rerender } = render(<PlayLandingHeader sport="ufc" />);
    expect(screen.getByRole("heading", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("Daily games.")).toBeInTheDocument();
    expect(screen.queryByText("UFC · PLAY")).not.toBeInTheDocument();
    rerender(<PlayLandingHeader sport="football" />);
    expect(screen.getByText("Daily games.")).toBeInTheDocument();
    expect(screen.queryByText("FOOTBALL · PLAY")).not.toBeInTheDocument();
  });
});
