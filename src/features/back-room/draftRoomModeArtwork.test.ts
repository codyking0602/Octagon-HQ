import { describe, expect, it } from "vitest";
import { draftRoomModeArtwork } from "./draftRoomModeArtwork";

describe("Draft Room mode artwork", () => {
  it("reuses canonical Build a QB heroes and the locked Trio card assets", () => {
    expect(draftRoomModeArtwork("build-qb")).toEqual({
      src: "/assets/football/build-qb-andrew-luck-hero.webp",
      objectPosition: "50% 36%",
    });
    expect(draftRoomModeArtwork("build-qb-cfb")).toEqual({
      src: "/assets/football/build-qb-trevor-lawrence-clemson-hero.webp",
      objectPosition: "50% 36%",
    });
    expect(draftRoomModeArtwork("trio-nfl")).toEqual({
      src: "/assets/football/draft-room-trio-nfl.webp",
      objectPosition: "50% 50%",
    });
    expect(draftRoomModeArtwork("trio-cfb")).toEqual({
      src: "/assets/football/draft-room-trio-cfb.webp",
      objectPosition: "50% 50%",
    });
  });
});
