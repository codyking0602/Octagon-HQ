import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FighterThumbnail, fighterThumbnailPath } from "./FighterThumbnail";

afterEach(cleanup);

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

  it("resolves the missing UFC Paris portraits from the canonical thumbnail owner", () => {
    const slugs = [
      "salahdine-parnasse",
      "fares-ziam",
      "michael-venom-page",
      "nursulton-ruziboev",
      "punahele-soriano",
      "morgan-charriere",
      "felipe-lima",
      "losene-keita",
      "muhammad-naimov",
    ];

    for (const slug of slugs) {
      expect(fighterThumbnailPath(slug)).toMatch(
        /^https:\/\/a\.espncdn\.com\/i\/headshots\/mma\/players\/full\/\d+\.png$/,
      );
    }
  });

  it("uses full-resolution portraits for both Hooker-Parnasse Spotlight fighters", () => {
    expect(fighterThumbnailPath("dan-hooker")).toBe(
      "https://a.espncdn.com/i/headshots/mma/players/full/3109135.png",
    );
    expect(fighterThumbnailPath("salahdine-parnasse")).toBe(
      "https://a.espncdn.com/i/headshots/mma/players/full/4312859.png",
    );
  });
});

describe("Shane contender fighter-tile treatment", () => {
  it("marks Bilal Hasan's thumbnail with the canonical #4 Shane badge", () => {
    render(<FighterThumbnail name="Bilal Hasan" slug="bilal-hasan" />);

    const badges = screen.getByLabelText("Shane King’s Contender Series fighters");
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #4")).toBeInTheDocument();
    expect(badges.closest(".pick-fighter-thumbnail-wrap")).toHaveClass("is-shane-contender");
  });

  it("uses the same canonical fighter-tile treatment for other Shane contenders", () => {
    render(<FighterThumbnail name="Quillan Salkilld" slug="quillan-salkilld" />);

    const badges = screen.getByLabelText("Shane King’s Contender Series fighters");
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #2")).toBeInTheDocument();
    expect(badges.closest(".pick-fighter-thumbnail-wrap")).toHaveClass("is-shane-contender");
  });

  it("does not decorate a fighter who is not on Shane's canonical board", () => {
    render(<FighterThumbnail name="Alex Perez" slug="alex-perez" />);

    expect(screen.queryByLabelText("Shane King’s Contender Series fighters")).not.toBeInTheDocument();
  });
});
