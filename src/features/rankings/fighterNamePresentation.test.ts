import { describe, expect, it } from "vitest";
import {
  fighterNamePresentationBySlug,
  formatFighterDisplayName,
  formatPresentedFighterName,
} from "./fighterNamePresentation";

describe("fighter name presentation", () => {
  it("keeps standard ranking and app surfaces on the canonical fighter name", () => {
    expect(formatFighterDisplayName("jon-jones", "Jon Jones")).toBe("Jon Jones");
    expect(formatFighterDisplayName("conor-mcgregor", "Conor McGregor")).toBe(
      "Conor McGregor",
    );
  });

  it("places prefix nicknames before the complete fighter name on profiles", () => {
    expect(formatFighterDisplayName("conor-mcgregor", "Conor McGregor", "profile")).toBe(
      "“The Notorious” Conor McGregor",
    );
    expect(formatFighterDisplayName("chan-sung-jung", "Chan Sung Jung", "profile")).toBe(
      "“The Korean Zombie” Chan Sung Jung",
    );
    expect(formatFighterDisplayName("sean-omalley", "Sean O'Malley", "profile")).toBe(
      "“Suga” Sean O’Malley",
    );
  });

  it("places middle nicknames after the fighter's first name on profiles", () => {
    expect(formatFighterDisplayName("jon-jones", "Jon Jones", "profile")).toBe(
      "Jon “Bones” Jones",
    );
    expect(formatFighterDisplayName("mauricio-rua", "Mauricio Rua", "profile")).toBe(
      "Maurício “Shogun” Rua",
    );
  });

  it("supports suffix placement without treating it as a universal rule", () => {
    expect(
      formatPresentedFighterName("Example Fighter", {
        nickname: "The Example",
        position: "suffix",
      }),
    ).toBe("Example Fighter “The Example”");
  });

  it("leaves fighters without a curated nickname unchanged on profiles", () => {
    expect(formatFighterDisplayName("jose-aldo", "Jose Aldo", "profile")).toBe("Jose Aldo");
  });

  it("keeps every curated entry on an explicit supported position", () => {
    const positions = new Set(["prefix", "middle", "suffix"]);
    for (const presentation of Object.values(fighterNamePresentationBySlug)) {
      expect(presentation.nickname.trim()).not.toBe("");
      expect(positions.has(presentation.position)).toBe(true);
    }
  });
});
