import { describe, expect, it } from "vitest";
import { assembleWhoAmIClues, whoAmIIdentityKnowledgeClue } from "./whoAmIClueAssembler";
import type { WhoAmIClue } from "./whoAmIEngine";
import {
  whoAmIClueEditorialIssues,
  whoAmIClueInformationKeys,
  whoAmICluesShareInformation,
} from "./whoAmISemanticQuality";

function clue(
  id: string,
  text: string,
  informationKeys?: readonly string[],
): WhoAmIClue {
  return {
    id,
    text,
    band: "helpful",
    facet: "identity",
    ...(informationKeys ? { informationKeys } : {}),
  };
}

describe("Who Am I semantic quality model", () => {
  it("treats role-school as the same information as standalone school and role clues", () => {
    const position = clue("position", "I played DB.");
    const school = clue("school", "I played college football at Florida State.");
    const roleSchool = clue("role-school", "At Florida State, I played DB.");

    expect(whoAmIClueInformationKeys(roleSchool)).toEqual(expect.arrayContaining([
      "school:florida-state",
      "role:db",
    ]));
    expect(whoAmICluesShareInformation(roleSchool, position)).toBe(true);
    expect(whoAmICluesShareInformation(roleSchool, school)).toBe(true);
  });

  it("collapses the same award even when source layers use different IDs and wording", () => {
    const research = clue(
      "identity:resume-cfb-tyrann-mathieu-03",
      "I won the 2011 Bednarik Award as the nation's top defensive player.",
    );
    const curated = clue(
      "curated-cfb4:mathieu-bednarik",
      "The Bednarik Award was mine in 2011 as the nation's top defensive player.",
    );

    expect(whoAmICluesShareInformation(research, curated)).toBe(true);
  });

  it("does not mistake award-named subjects for award claims from clue IDs", () => {
    const fredSuperBowl = clue(
      "curated2:biletnikoff-sb11",
      "I was named MVP of Super Bowl XI after Oakland's first championship.",
    );
    const fredHall = clue(
      "curated2:biletnikoff-hof",
      "I was inducted into the Pro Football Hall of Fame in 1988.",
    );
    const chuckSchool = clue(
      "curated3:bednarik-penn",
      "I played college football at Penn.",
    );
    const chuckDraft = clue(
      "curated3:bednarik-first",
      "Philadelphia selected me first overall in the 1949 NFL Draft.",
    );
    const actualAward = clue(
      "award-copy",
      "I won the Bednarik Award as the nation's top defensive player.",
    );

    expect(whoAmIClueInformationKeys(fredSuperBowl)).not.toContain("award:biletnikoff");
    expect(whoAmICluesShareInformation(fredSuperBowl, fredHall)).toBe(false);
    expect(whoAmIClueInformationKeys(chuckSchool)).not.toContain("award:bednarik");
    expect(whoAmICluesShareInformation(chuckSchool, chuckDraft)).toBe(false);
    expect(whoAmIClueInformationKeys(actualAward)).toContain("award:bednarik");
  });

  it("supports explicit semantic claims for facts that copy heuristics cannot infer safely", () => {
    const canonical = clue("fact-one", "I produced a signature season.", ["season:signature:2003"]);
    const research = clue("research-two", "My 2003 season became my defining college year.", ["season:signature:2003"]);
    expect(whoAmICluesShareInformation(canonical, research)).toBe(true);
  });

  it("never selects two alternate wordings of the same semantic fact", () => {
    const clues: WhoAmIClue[] = [
      { ...clue("dup-a", "I won a major defensive honor.", ["award:test"]), band: "strong" },
      { ...clue("dup-b", "A major defensive honor was one of my signature awards.", ["award:test"]), band: "strong" },
      ...Array.from({ length: 10 }, (_value, index) => ({
        ...clue(`unique-${index}`, `I have unique identity clue ${index + 1}.`, [`unique:${index}`]),
        band: index < 2 ? "broad" as const : index < 5 ? "helpful" as const : "strong" as const,
      })),
    ];

    const selected = assembleWhoAmIClues(clues, 10, () => 0.5);
    expect(selected).toHaveLength(10);
    expect(selected.filter((entry) => entry.informationKeys?.includes("award:test"))).toHaveLength(1);
  });

  it("flags malformed first-person copy and zero-value stat filler as hard editorial defects", () => {
    expect(whoAmIClueEditorialIssues(clue("bad-1", "Despite my boxing base, me says wrestling came first.")))
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "malformed-first-person" })]));
    expect(whoAmIClueEditorialIssues(clue("bad-2", "I remains the only player to do this.")))
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "malformed-first-person" })]));
    expect(whoAmIClueEditorialIssues(clue("bad-3", "I competed in 0 UFC title fights.")))
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "zero-value-production" })]));
  });

  it("does not rewrite a named third party's pronoun into the hidden subject", () => {
    const transformed = whoAmIIdentityKnowledgeClue({
      subjectId: "ufc:diego-lopes",
      subjectName: "Diego Lopes",
      subjectKind: "fighter",
      league: "UFC",
      factId: "favorite-fighter-training",
      conceptId: "favorite-fighter-training",
      value: "He named Donald Cerrone as a favorite fighter and later had the chance to train with him before he reached the UFC.",
    });

    expect(transformed.text).toMatch(/train with him/i);
    expect(transformed.text).toMatch(/before I reached the UFC/i);
    expect(transformed.text).not.toMatch(/train with me/i);
  });
});
