import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RankingFighter } from "../rankings/rankingModel";
import { UfcHomeFighterPortrait, UFC_HOME_PORTRAIT_PROOFS } from "./UfcHomeFighterPortrait";
import { UFC_HOME_PORTRAIT_SLUGS } from "./ufcHomePortraitSlugs";

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

describe("UFC Home-only ranked fighter sourced portraits", () => {
  it("uses the full verified Home-only portrait list (and keeps the three original approvals)", () => {
    expect([...UFC_HOME_PORTRAIT_PROOFS].sort()).toEqual([...UFC_HOME_PORTRAIT_SLUGS].sort());
    for (const slug of ["amanda-nunes", "ciryl-gane", "kayla-harrison"]) {
      expect(UFC_HOME_PORTRAIT_PROOFS.has(slug)).toBe(true);
    }
    expect(UFC_HOME_PORTRAIT_PROOFS.size).toBeGreaterThan(35);
  });

  it("loads an independently sourced Home asset without altering the standard thumbnail", () => {
    const view = render(<UfcHomeFighterPortrait fighter={fighter("ciryl-gane")} />);
    const home = view.container.querySelector("img")!;
    expect(home).toHaveAttribute("src", "/assets/fighters/ciryl-gane.home.webp");
    expect(screen.queryByTestId("canonical-thumb-fallback")).not.toBeInTheDocument();
    fireEvent.error(home);
    expect(screen.getByTestId("canonical-thumb-fallback"))
      .toHaveAttribute("src", "/assets/fighters/ciryl-gane-thumb.webp");
  });

  it("works for every other sourced ranked fighter, without changing the fallback", () => {
    const slug = UFC_HOME_PORTRAIT_SLUGS.find((item) =>
      !["amanda-nunes", "ciryl-gane", "kayla-harrison"].includes(item),
    );
    expect(slug).toBeTruthy();
    const view = render(<UfcHomeFighterPortrait fighter={fighter(slug!)} />);
    expect(view.container.querySelector("img")).toHaveAttribute(
      "src", "/assets/fighters/" + slug + ".home.webp",
    );
    fireEvent.error(view.container.querySelector("img")!);
    expect(screen.getByTestId("canonical-thumb-fallback")).toHaveAttribute(
      "src", "/assets/fighters/" + slug + "-thumb.webp",
    );
  });

  it("does not let one fighter's photo failure block the next rotated fighter", () => {
    const view = render(<UfcHomeFighterPortrait fighter={fighter("ciryl-gane")} />);
    fireEvent.error(view.container.querySelector("img")!);
    view.rerender(<UfcHomeFighterPortrait fighter={fighter("kayla-harrison")} />);
    expect(view.container.querySelector("img"))
      .toHaveAttribute("src", "/assets/fighters/kayla-harrison.home.webp");
  });

  it("keeps unlisted fighters on the canonical thumbnails", () => {
    render(<UfcHomeFighterPortrait fighter={fighter("not-an-hq-ranked-fighter")} />);
    expect(screen.getByTestId("canonical-thumb-fallback"))
      .toHaveAttribute("src", "/assets/fighters/not-an-hq-ranked-fighter-thumb.webp");
  });
});
