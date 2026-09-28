// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLandingGameLibrary } from "./PlayLandingPresentation";

describe("Bar Trivia Casual access", () => {
  it("does not surface a Casual Bar Trivia card on Football", () => {
    render(<PlayLandingGameLibrary sport="football" onNavigate={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Bar Trivia/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/CASUAL · OWNER ONLY/i)).not.toBeInTheDocument();
  });

  it("does not surface a Casual Bar Trivia card on UFC", () => {
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Bar Trivia/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/CASUAL · OWNER ONLY/i)).not.toBeInTheDocument();
  });
});
