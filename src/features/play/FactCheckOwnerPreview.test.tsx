// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLandingGameLibrary } from "./PlayLandingPresentation";

describe("Fact Check owner Casual entry", () => {
  it("stays hidden by default and routes the Football owner preview when enabled", () => {
    const onNavigate = vi.fn();
    const { rerender } = render(
      <PlayLandingGameLibrary sport="football" onNavigate={onNavigate} />,
    );

    expect(screen.queryByRole("button", { name: /Fact Check/i })).not.toBeInTheDocument();

    rerender(
      <PlayLandingGameLibrary
        sport="football"
        onNavigate={onNavigate}
        factCheckVisible
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Fact Check/i }));
    expect(onNavigate).toHaveBeenCalledWith("/football/fact-check");
    expect(screen.getByRole("button", { name: /Fact Check/i })).toHaveTextContent("CASUAL · OWNER ONLY");
  });

  it("never exposes the Football Fact Check preview in the UFC library", () => {
    render(
      <PlayLandingGameLibrary
        sport="ufc"
        onNavigate={vi.fn()}
        factCheckVisible
      />,
    );

    expect(screen.queryByRole("button", { name: /Fact Check/i })).not.toBeInTheDocument();
  });
});
