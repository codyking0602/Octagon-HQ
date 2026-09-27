// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLandingGameLibrary } from "./PlayLandingPresentation";

describe("Bar Trivia owner Casual entry", () => {
  it("stays hidden by default and routes Football owner access when enabled", () => {
    const onNavigate = vi.fn();
    const { rerender } = render(<PlayLandingGameLibrary sport="football" onNavigate={onNavigate} />);
    expect(screen.queryByRole("button", { name: /Bar Trivia/i })).not.toBeInTheDocument();

    rerender(<PlayLandingGameLibrary sport="football" onNavigate={onNavigate} barTriviaVisible />);
    const card = screen.getByRole("button", { name: /Bar Trivia/i });
    expect(card).toHaveTextContent("CASUAL · OWNER ONLY");
    fireEvent.click(card);
    expect(onNavigate).toHaveBeenCalledWith("/football/bar-trivia");
  });

  it("routes UFC owner access through its separate Casual route", () => {
    const onNavigate = vi.fn();
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={onNavigate} barTriviaVisible />);
    const card = screen.getByRole("button", { name: /Bar Trivia/i });
    fireEvent.click(card);
    expect(onNavigate).toHaveBeenCalledWith("/play/bar-trivia");
  });
});
