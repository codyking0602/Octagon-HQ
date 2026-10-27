import { describe, expect, it } from "vitest";
import { fighterProfilePhotoFraming } from "./fighterProfilePhotoFraming";

describe("fighter profile photo framing", () => {
  it("fills Gane's wide championship photo with an individual focal point", () => {
    expect(fighterProfilePhotoFraming("ciryl-gane")).toEqual({
      objectFit: "cover",
      objectPosition: "50% 40%",
    });
  });

  it("keeps Silva's raised title belt near the top of her portrait", () => {
    expect(fighterProfilePhotoFraming("natalia-silva")).toEqual({
      objectFit: "cover",
      objectPosition: "50% 5%",
    });
  });

  it("preserves approved containment for every unconfigured fighter", () => {
    expect(fighterProfilePhotoFraming("alexander-volkanovski")).toBeUndefined();
  });
});
