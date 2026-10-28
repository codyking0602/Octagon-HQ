import { describe, expect, it } from "vitest";
import {
  normalizeDisplayName,
  parseIdentityCredentials,
  profileInitials,
} from "./identityModel";

describe("identity model", () => {
  it("keeps the public identity to a simple uppercase friend name", () => {
    expect(normalizeDisplayName("  Cody  ")).toBe("CODY");
    expect(normalizeDisplayName("Cody   King")).toBe("CODY KING");
    expect(profileInitials("Cody")).toBe("C");
    expect(profileInitials("Cody King")).toBe("CK");
  });

  it("requires one memorable four-digit PIN", () => {
    expect(parseIdentityCredentials("Cody", "1234")).toEqual({
      success: true,
      data: { displayName: "CODY", pin: "1234" },
    });
    expect(parseIdentityCredentials("Cody", "123")).toEqual({
      success: false,
      error: "Enter a 4-digit PIN.",
    });
    expect(parseIdentityCredentials("Cody", "12A4")).toEqual({
      success: false,
      error: "Enter a 4-digit PIN.",
    });
  });
});
