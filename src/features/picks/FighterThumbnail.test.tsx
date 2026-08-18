import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FighterThumbnail, fighterThumbnailPath } from "./FighterThumbnail";

describe("fighterThumbnailPath", () => {
  it("resolves Jan Błachowicz's canonical ASCII asset", () => {
    expect(fighterThumbnailPath("jan-blachowicz"))
      .toBe("/assets/fighters/jan-blachowicz-thumb.webp");
  });

  it("keeps the currently published malformed Jan slug working", () => {
    expect(fighterThumbnailPath("jan-b-achowicz"))
      .toBe("/assets/fighters/jan-blachowicz-thumb.webp");
  });

  it("accepts the accented filename-style variant without duplicating the asset", () => {
    expect(fighterThumbnailPath("jan-błachowicz"))
      .toBe("/assets/fighters/jan-blachowicz-thumb.webp");
  });

  it("resolves every UFC 330 card thumbnail that ships with this asset update", () => {
    const slugs = [
      "ian-machado-garry",
      "gillian-robertson",
      "mansur-abdul-malik",
      "dustin-stoltzfus",
      "esteban-ribovics",
      "chidi-njokuani",
      "joel-alvarez",
      "jalin-turner",
      "kaue-fernandes",
      "donte-johnson",
      "eric-mcconico",
      "tresean-gore",
    ];

    for (const slug of slugs) {
      expect(fighterThumbnailPath(slug))
        .toBe(`/assets/fighters/${slug}-thumb.webp`);
    }
  });

  it("resolves the Sacramento main-card thumbnails", () => {
    const slugs = [
      "anthony-hernandez",
      "gregory-rodrigues",
      "serghei-spivac",
      "vitor-petrino",
      "reinier-de-ridder",
      "roman-dolidze",
      "marquel-mederos",
      "mason-jones",
      "carli-judice",
      "jeisla-chaves",
      "kennedy-nzechukwu",
      "shamil-gaziev",
    ];

    for (const slug of slugs) {
      expect(fighterThumbnailPath(slug))
        .toBe(`/assets/fighters/${slug}-thumb.webp`);
    }
  });
});

describe("FighterThumbnail", () => {
  it("renders an intentional silhouette when no fighter photo is published", () => {
    render(<FighterThumbnail name="New Fighter" slug="fighter-without-published-photo" />);

    const fallback = screen.getByRole("img", { name: "New Fighter photo unavailable" });
    expect(fallback).toHaveClass("pick-fighter-thumbnail", "pick-fighter-thumbnail--fallback");
    expect(fallback.querySelector("svg")).toBeInTheDocument();
    expect(fallback).toHaveTextContent("");
  });

  it("falls back to the same silhouette when a published thumbnail fails to load", () => {
    const { container } = render(<FighterThumbnail name="Anthony Hernandez" slug="anthony-hernandez" />);
    const image = container.querySelector("img.pick-fighter-thumbnail");

    expect(image).toHaveAttribute("src", "/assets/fighters/anthony-hernandez-thumb.webp");
    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByRole("img", { name: "Anthony Hernandez photo unavailable" }))
      .toHaveClass("pick-fighter-thumbnail--fallback");
  });
});
