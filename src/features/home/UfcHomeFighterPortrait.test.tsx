import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RankingFighter } from "../rankings/rankingModel";
import { UfcHomeFighterPortrait, UFC_HOME_PORTRAIT_PROOFS } from "./UfcHomeFighterPortrait";

vi.mock("../rankings/FighterPhoto", () => ({
  FighterPhoto: ({ name, src, className }: { name: string; src: string; className: string }) =>
    <img data-testid="canonical-thumb-fallback" className={className} src={src} alt={name} />,
}));

function fighter(slug: string): RankingFighter {
  return {
    slug,
    displayName: slug.replaceAll("-", " "),
    thumbUrl: "/assets/fighters/" + slug + "-thumb.webp",
  } as RankingFighter;
}

describe("UFC Home-only ranked fighter portrait proofs", () => {
  it("features only the approved three slugs before expanding the complete ranked roster", () => {
    expect([...UFC_HOME_PORTRAIT_PROOFS].sort()).toEqual(
      ["amanda-nunes", "ciryl-gane", "kayla-harrison"],
    );
  });

  it("loads the dedicated 4x Home asset without altering the standard thumbnails", () => {
    render(<UfcHomeFighterPortrait fighter={fighter("ciryl-gane")} />);
    const home = screen.getByRole("img", { hidden: true });
    expect(home).toHaveAttribute("src", "/assets/fighters/ciryl-gane.home.webp");
    expect(screen.queryByTestId("canonical-thumb-fallback")).not.toBeInTheDocument();
    fireEvent.error(home);
    expect(screen.getByTestId("canonical-thumb-fallback"))
      .toHaveAttribute("src", "/assets/fighters/ciryl-gane-thumb.webp");
  });

  it("does not let a failed photo for one fighter block the next rotated fighter", () => {
    const view = render(<UfcHomeFighterPortrait fighter={fighter("ciryl-gane")} />);
    fireEvent.error(screen.getByRole("img", { hidden: true }));
    view.rerender(<UfcHomeFighterPortrait fighter={fighter("kayla-harrison")} />);
    expect(screen.getByRole("img", { hidden: true }))
      .toHaveAttribute("src", "/assets/fighters/kayla-harrison.home.webp");
  });

  it("keeps every other HQ-ranked fighter on the canonical thumbnail", () => {
    render(<UfcHomeFighterPortrait fighter={fighter("frank-shamrock")} />);
    expect(screen.getByTestId("canonical-thumb-fallback"))
      .toHaveAttribute("src", "/assets/fighters/frank-shamrock-thumb.webp");
  });
});
