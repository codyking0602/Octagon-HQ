import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FighterThumbnail, faceFocusUfcThumbSlugs } from "./FighterThumbnail";

describe("October 31 UFC Picks thumbnail framing", () => {
  it.each([
    ["tom-nolan", "Tom Nolan"],
    ["jacobe-smith", "Jacobe Smith"],
    ["ode-osbourne", "Ode' Osbourne"],
    ["cody-durden", "Cody Durden"],
    ["yana-santos", "Yana Santos"],
    ["luana-santos", "Luana Santos"],
    ["farman-hasanov", "Farman Hasanov"],
  ])("frames %s as a face-dominant crop without changing the verified real photo", (slug, name) => {
    expect(faceFocusUfcThumbSlugs.has(slug)).toBe(true);
    const { container } = render(<FighterThumbnail slug={slug} name={name} />);
    const frame = container.querySelector(".pick-fighter-thumbnail--face-focus");
    expect(frame).not.toBeNull();
    const image = frame?.querySelector("img.pick-fighter-thumbnail__face-image");
    expect(image?.getAttribute("src")).toContain(`/assets/fighters/${slug}-thumb.webp`);
  });

  it.each([
    ["renato-moicano", "Renato Moicano"],
    ["randy-brown", "Randy Brown"],
    ["jean-paul-lebosnoyani", "Jean-Paul Lebosnoyani"],
  ])("preserves %s's already-correct tight portrait", (slug, name) => {
    expect(faceFocusUfcThumbSlugs.has(slug)).toBe(false);
    const { container } = render(<FighterThumbnail slug={slug} name={name} />);
    expect(container.querySelector(".pick-fighter-thumbnail--face-focus")).toBeNull();
    expect(container.querySelector("img.pick-fighter-thumbnail")?.getAttribute("src"))
      .toContain(`/assets/fighters/${slug}-thumb.webp`);
  });
});
