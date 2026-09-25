import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FighterThumbnail, fighterThumbnailPath, normalizeRuntimeFighterMediaMap } from "./FighterThumbnail";

afterEach(cleanup);

describe("runtime fighter media", () => {
  it("accepts only slug-keyed HTTPS runtime photos", () => {
    expect(normalizeRuntimeFighterMediaMap({
      "melissa-amaya": "https://dmxg5wxfqgb4u.cloudfront.net/styles/card/s3/melissa.png",
      "bad slug": "https://example.test/bad.png",
      "ilimbek-akylbek": "http://example.test/not-secure.png",
      "mehemmedeli-osmanli": 42,
    })).toEqual({
      "melissa-amaya": "https://dmxg5wxfqgb4u.cloudfront.net/styles/card/s3/melissa.png",
    });
  });
});

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
      "michael-page",
      "michael-venom-page",
      "nursulton-ruziboev",
      "punahele-soriano",
      "kurtis-campbell",
      "trevor-peek",
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

  it("maps the three current missing-card slugs to their curated portraits", () => {
    expect(fighterThumbnailPath("michael-page")).toBe(
      "https://a.espncdn.com/i/headshots/mma/players/full/3022067.png",
    );
    expect(fighterThumbnailPath("kurtis-campbell")).toBe(
      "https://a.espncdn.com/i/headshots/mma/players/full/5310075.png",
    );
    expect(fighterThumbnailPath("trevor-peek")).toBe(
      "https://a.espncdn.com/i/headshots/mma/players/full/5048900.png",
    );
  });

  it("resolves every missing Noche UFC portrait, including both main-event Spotlight photos", () => {
    const portraits = new Map([
      ["jean-silva", "5145766"],
      ["jose-miguel-delgado", "5223435"],
      ["joseph-morales", "4238229"],
      ["marwan-rahiki", "5302274"],
      ["waldo-cortes-acosta", "4903365"],
      ["david-martinez", "4503229"],
    ]);

    for (const [slug, id] of portraits) {
      expect(fighterThumbnailPath(slug)).toBe(
        `https://a.espncdn.com/i/headshots/mma/players/full/${id}.png`,
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

  it("leaves Sep. 26 newcomers blank when UFC and ESPN do not have acceptable thumbs", () => {
    for (const slug of ["mehemmedeli-osmanli", "ilimbek-akylbek", "melissa-amaya"]) {
      expect(fighterThumbnailPath(slug)).toBeNull();
    }
  });

  it("uses the existing missing-thumbnail presentation for a blank UFC thumb", () => {
    render(<FighterThumbnail name="Melissa Amaya" slug="melissa-amaya" />);

    expect(screen.getByLabelText("Melissa Amaya photo unavailable")).toBeInTheDocument();
  });
});

describe("Shane contender fighter-tile treatment", () => {
  it("marks Bilal Hasan's thumbnail with the canonical #3 Shane badge", () => {
    render(<FighterThumbnail name="Bilal Hasan" slug="bilal-hasan" />);

    const badges = screen.getByLabelText("Shane King’s Contender Series fighters");
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #3")).toBeInTheDocument();
    expect(badges.closest(".pick-fighter-thumbnail-wrap")).toHaveClass("is-shane-contender");
  });

  it("uses the same canonical fighter-tile treatment for other Shane contenders", () => {
    render(<FighterThumbnail name="Quillan Salkilld" slug="quillan-salkilld" />);

    const badges = screen.getByLabelText("Shane King’s Contender Series fighters");
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #1")).toBeInTheDocument();
    expect(badges.closest(".pick-fighter-thumbnail-wrap")).toHaveClass("is-shane-contender");
  });

  it("marks Raul Rosas Jr. with Shane’s #4 badge on the Picks fighter tile", () => {
    render(<FighterThumbnail name="Raul Rosas Jr." slug="raul-rosas-jr" />);

    const badges = screen.getByLabelText("Shane King’s Contender Series fighters");
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #4")).toBeInTheDocument();
    expect(badges.closest(".pick-fighter-thumbnail-wrap")).toHaveClass("is-shane-contender");
  });

  it("does not decorate a fighter who is not on Shane's canonical board", () => {
    render(<FighterThumbnail name="Alex Perez" slug="alex-perez" />);

    expect(screen.queryByLabelText("Shane King’s Contender Series fighters")).not.toBeInTheDocument();
  });
});
