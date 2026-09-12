import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "src/features/picks-control/FootballHomeSpotlightPhotoControl.tsx"),
  "utf8",
);

describe("Football Home Spotlight phone photo preparation", () => {
  it("uses binary JPEG canvas output instead of the retired base64 character ceiling", () => {
    expect(source).toContain('canvas.toBlob');
    expect(source).toContain('"image/jpeg"');
    expect(source).toContain("MAX_PREPARED_BYTES = 4 * 1024 * 1024");
    expect(source).not.toContain("MAX_SAVED_CHARACTERS");
    expect(source).not.toContain("still too large after processing");
    expect(source).toContain("image/heic");
    expect(source).toContain("image/heif");
  });
});
