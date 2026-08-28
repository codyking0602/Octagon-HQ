import { describe, expect, it } from "vitest";
import { footballSubjects } from "./footballSubjectRegistry";
import { footballWavelengthClues } from "./footballWavelengthModel";
import { footballWavelengthCanonicalSubjectForClue } from "./footballWavelengthSubjectAuthority";

function clue(category: string, text: string) {
  const found = footballWavelengthClues.find((row) => row.category === category && row.text === text);
  if (!found) throw new Error(`Missing Wavelength clue ${category}:${text}`);
  return found;
}

describe("Football Wavelength canonical subject authority", () => {
  it("resolves exact unambiguous canonical entity clues through the shared Football subject owner", () => {
    const subjectsByName = new Map<string, typeof footballSubjects[number][]>();
    for (const subject of footballSubjects) {
      const values = subjectsByName.get(subject.name) ?? [];
      values.push(subject);
      subjectsByName.set(subject.name, values);
    }
    const exactEntityClues = footballWavelengthClues.filter((row) => subjectsByName.get(row.text)?.length === 1);

    expect(exactEntityClues.length).toBeGreaterThan(75);
    for (const row of exactEntityClues) {
      expect(footballWavelengthCanonicalSubjectForClue(row)?.id, `${row.category}:${row.text}`).toBe(
        subjectsByName.get(row.text)![0]!.id,
      );
    }
  });

  it("does not collapse league-ambiguous career names back into one identity", () => {
    expect(footballSubjects.filter((subject) => subject.name === "Urban Meyer").map(({ league }) => league).sort())
      .toEqual(["CFB", "NFL"]);
    expect(footballWavelengthCanonicalSubjectForClue(clue("COACHING CHAOS", "Urban Meyer"))).toBeNull();
  });

  it("collapses category-local aliases onto one canonical subject identity", () => {
    const mahomes = footballSubjects.find((subject) => subject.name === "Patrick Mahomes");
    const brady = footballSubjects.find((subject) => subject.name === "Tom Brady");
    expect(mahomes).toBeDefined();
    expect(brady).toBeDefined();

    expect(footballWavelengthCanonicalSubjectForClue(clue("NFL LEGACY", "Patrick Mahomes"))?.id).toBe(mahomes!.id);
    expect(footballWavelengthCanonicalSubjectForClue(clue("GUNSLINGER", "Patrick Mahomes"))?.id).toBe(mahomes!.id);
    expect(footballWavelengthCanonicalSubjectForClue(clue("NFL LEGACY", "Tom Brady"))?.id).toBe(brady!.id);
    expect(footballWavelengthCanonicalSubjectForClue(clue("GUNSLINGER", "Tom Brady"))?.id).toBe(brady!.id);
  });

  it("keeps Wavelength-only concepts explicit instead of inventing a second canonical roster", () => {
    expect(footballWavelengthCanonicalSubjectForClue(clue("OFFENSIVE CHAOS", "Cal–Stanford band play"))).toBeNull();
  });
});
