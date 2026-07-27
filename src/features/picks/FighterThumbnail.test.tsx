import { describe, expect, it } from "vitest";
import { fighterThumbnailPath } from "./FighterThumbnail";

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
});
