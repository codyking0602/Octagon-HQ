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
  it("resolves exact canonical entity clues through the shared Football subject owner", () => {
    const canonicalByName = new Map(footballSubjects.map((subject) => [subject.name, subject]));
    const exactEntityClues = footballWavelengthClues.filter((row) => canonicalByName.has(row.text));

    expect(exactEntityClues.length).toBeGreaterThan(75);
    for (const row of exactEntityClues) {
      expect(footballWavelengthCanonicalSubjectForClue(row)?.id, `${row.category}:${row.text}`).toBe(
        canonicalByName.get(row.text)!.id,
      );
    }
  });

  it("collapses category-local aliases onto one canonical subject identity", () => {
    expect(footballWavelengthCanonicalSubjectForClue(clue("NFL LEGACY", "Patrick Mahomes"))?.id).toBe("patrick-mahomes");
    expect(footballWavelengthCanonicalSubjectForClue(clue("GUNSLINGER", "Patrick Mahomes"))?.id).toBe("patrick-mahomes");
    expect(footballWavelengthCanonicalSubjectForClue(clue("NFL LEGACY", "Tom Brady"))?.id).toBe("tom-brady");
    expect(footballWavelengthCanonicalSubjectForClue(clue("GUNSLINGER", "Tom Brady"))?.id).toBe("tom-brady");
  });

  it("keeps Wavelength-only concepts explicit instead of inventing a second canonical roster", () => {
    expect(footballWavelengthCanonicalSubjectForClue(clue("OFFENSIVE CHAOS", "Cal–Stanford band play"))).toBeNull();
  });
});
