import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FighterThumbnail, fighterThumbnailPath } from "./FighterThumbnail";
import { underdogBonus } from "./picksModel";

afterEach(cleanup);

describe("locked Picks scoring model", () => {
  it.each([
    [-110, 0], [100, 1], [149, 1], [150, 2], [199, 2], [200, 3], [249, 3],
    [250, 4], [299, 4], [300, 5], [349, 5], [350, 6], [399, 6], [400, 7], [900, 7],
  ])("maps American odds %i to bonus %i", (odds, bonus) => {
    expect(underdogBonus(odds)).toBe(bonus);
  });

  it("rejects even and negative odds as bonus-eligible", () => {
    expect(underdogBonus(0)).toBe(0);
    expect(underdogBonus(-100)).toBe(0);
  });
});

describe("fighter thumbnails", () => {
  it("uses a canonical real thumbnail path and lazy loading", () => {
    expect(fighterThumbnailPath("bogdan-guskov")).toMatch(/bogdan-guskov-thumb\.webp/);
    const { container } = render(<FighterThumbnail name="Bogdan Guskov" slug="bogdan-guskov" />);
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });

  it("uses initials without rendering a broken image when no file exists", () => {
    render(<FighterThumbnail name="Unknown Fighter" slug="unknown-fighter" />);
    expect(screen.getByText("UF")).toBeInTheDocument();
    expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();
  });

  it("falls back to initials if a known image fails to load", () => {
    const { container } = render(<FighterThumbnail name="Bogdan Guskov" slug="bogdan-guskov" />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("BG")).toBeInTheDocument();
  });
});
