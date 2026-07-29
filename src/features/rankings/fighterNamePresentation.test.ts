import { describe, expect, it } from "vitest";
import {
  fighterNamePresentationBySlug,
  formatFighterDisplayName,
  formatPresentedFighterName,
} from "./fighterNamePresentation";
import { profileDisplayName } from "./profilePresentation";
import { getFighter } from "./rankingModel";

describe("fighter name presentation", () => {
  it("keeps standard ranking and app surfaces on the canonical fighter name", () => {
    const jon = getFighter("jon-jones");
    const conor = getFighter("conor-mcgregor");

    expect(jon?.displayName).toBe("Jon Jones");
    expect(conor?.displayName).toBe("Conor McGregor");
    expect(formatFighterDisplayName("jon-jones", "Jon Jones")).toBe("Jon Jones");
  });

  it("applies nicknames only through the fighter profile presenter", () => {
    const jon = getFighter("jon-jones");
    const conor = getFighter("conor-mcgregor");

    expect(jon ? profileDisplayName(jon) : "").toBe("Jon “Bones” Jones");
    expect(conor ? profileDisplayName(conor) : "").toBe("“The Notorious” Conor McGregor");
  });

  it("places prefix nicknames before the complete fighter name on profiles", () => {
    expect(formatFighterDisplayName("chan-sung-jung", "Chan Sung Jung", "profile")).toBe(
      "“The Korean Zombie” Chan Sung Jung",
    );
    expect(formatFighterDisplayName("sean-omalley", "Sean O'Malley", "profile")).toBe(
      "“Suga” Sean O’Malley",
    );
  });

  it("places middle nicknames after the fighter's first name on profiles", () => {
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
