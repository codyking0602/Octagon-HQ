import { describe, expect, it } from "vitest";
import { fighterProfilePhotoFraming } from "./fighterProfilePhotoFraming";

describe("UFC fighter profile photo framing", () => {
  it("fills Gane's profile card without side bars, preserving his center", () => {
    expect(fighterProfilePhotoFraming("ciryl-gane")).toEqual({
      objectFit: "cover",
      objectPosition: "51% 34%",
    });
  });

  it("protects Silva's raised belt and face in her vertical image", () => {
    expect(fighterProfilePhotoFraming("natalia-silva")).toEqual({
      objectFit: "cover",
      objectPosition: "50% 16%",
    });
  });

  it("leaves existing fighters on their previously approved default framing", () => {
    expect(fighterProfilePhotoFraming("jon-jones")).toBeUndefined();
    expect(fighterProfilePhotoFraming("alexander-volkanovski")).toBeUndefined();
  });
});
