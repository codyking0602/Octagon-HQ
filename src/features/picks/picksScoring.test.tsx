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

  it("uses an intentional silhouette without rendering a broken image when no file exists", () => {
    render(<FighterThumbnail name="Unknown Fighter" slug="unknown-fighter" />);
    const fallback = screen.getByRole("img", { name: "Unknown Fighter photo unavailable" });
    expect(fallback).toHaveClass("pick-fighter-thumbnail--fallback");
    expect(fallback.querySelector("svg")).toBeInTheDocument();
    expect(fallback).toHaveTextContent("");
  });

  it("falls back to the same silhouette if a known image fails to load", () => {
    const { container } = render(<FighterThumbnail name="Bogdan Guskov" slug="bogdan-guskov" />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByRole("img", { name: "Bogdan Guskov photo unavailable" }))
      .toHaveClass("pick-fighter-thumbnail--fallback");
  });
});
