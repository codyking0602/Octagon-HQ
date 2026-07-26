import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FighterThumbnail, fighterThumbnailPath } from "./FighterThumbnail";

afterEach(cleanup);

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
