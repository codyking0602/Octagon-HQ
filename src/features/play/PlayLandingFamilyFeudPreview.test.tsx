import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLandingGameLibrary } from "./PlayLandingPresentation";

describe("Sports Feud owner Casual entry", () => {
  it("shows the owner preview card only when explicitly enabled", () => {
    const onNavigate = vi.fn();
    const { rerender } = render(
      <PlayLandingGameLibrary
        sport="football"
        onNavigate={onNavigate}
        familyFeudVisible={false}
      />,
    );

    expect(screen.queryByRole("button", { name: /Sports Feud/i })).not.toBeInTheDocument();

    rerender(
      <PlayLandingGameLibrary
        sport="football"
        onNavigate={onNavigate}
        familyFeudVisible
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Sports Feud/i }));
    expect(onNavigate).toHaveBeenCalledWith("/football/sports-feud");
    expect(screen.getByText("OWNER PREVIEW")).toBeInTheDocument();
  });

  it("routes the UFC owner preview through UFC Casual", () => {
    const onNavigate = vi.fn();
    render(
      <PlayLandingGameLibrary
        sport="ufc"
        onNavigate={onNavigate}
        familyFeudVisible
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Sports Feud/i }));
    expect(onNavigate).toHaveBeenCalledWith("/play/sports-feud");
  });
});
