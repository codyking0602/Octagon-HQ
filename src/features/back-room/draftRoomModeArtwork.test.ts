import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { draftRoomModeArtwork } from "./draftRoomModeArtwork";

describe("Draft Room mode artwork", () => {
  it("reuses canonical Build a QB heroes and the locked Draft Room assets", () => {
    expect(draftRoomModeArtwork("build-qb")).toEqual({
      src: "/assets/football/build-qb-andrew-luck-hero.webp",
      objectPosition: "50% 36%",
    });
    expect(draftRoomModeArtwork("build-qb-cfb")).toEqual({
      src: "/assets/football/build-qb-cam-newton-auburn-hero.webp",
      objectPosition: "50% 36%",
    });
    expect(draftRoomModeArtwork("trio-nfl")).toEqual({
      src: "/assets/football/draft-room-trio-nfl.webp",
      objectPosition: "50% 50%",
    });
    expect(draftRoomModeArtwork("trio-cfb")).toEqual({
      src: "/assets/football/draft-room-trio-cfb-ohio-state.webp",
      objectPosition: "50% 50%",
    });
    expect(draftRoomModeArtwork("nfl-divisions")).toEqual({
      src: "/assets/football/draft-room-trio-nfl.webp",
      objectPosition: "50% 50%",
    });
    expect(draftRoomModeArtwork("cfb-best-teams")).toEqual({
      src: "/assets/football/draft-room-trio-cfb-ohio-state.webp",
      objectPosition: "50% 50%",
    });
    expect(draftRoomModeArtwork("longhorns-2005")).toEqual({
      src: "/assets/football/draft-room-longhorns-vince-young.webp",
      objectPosition: "50% 36%",
    });
    expect(draftRoomModeArtwork("longhorns-teams-2005")).toEqual({
      src: "/assets/football/draft-room-longhorns-teams-mack-brown.webp",
      objectPosition: "50% 40%",
    });
    expect(draftRoomModeArtwork("cowboys-2007")).toEqual({
      src: "/assets/football/draft-room-cowboys-jason-witten.webp",
      objectPosition: "50% 42%",
    });
    expect(draftRoomModeArtwork("cowboys-teams-2007")).toEqual({
      src: "/assets/football/draft-room-cowboys-teams.webp",
      objectPosition: "50% 42%",
    });
  });

  it("keeps the supplied Cowboys Teams hero as a valid WebP asset", () => {
    const image = readFileSync(resolve(process.cwd(), "public/assets/football/draft-room-cowboys-teams.webp"));
    expect(image.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(image.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(image.byteLength).toBeGreaterThan(5_000);
  });
});
