import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  WAVELENGTH_CALIBRATION_AUDIT,
  WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD,
  WAVELENGTH_INHERITED_REVIEW_EVIDENCE,
  WAVELENGTH_QUARANTINE_EVIDENCE,
  validateWavelengthCalibrationAudit,
} from "./wavelengthCalibrationAudit";
import {
  WAVELENGTH_CATEGORY_ANCHORS,
  WAVELENGTH_RATING_BANDS,
  approvedWavelengthCatalog,
  type WavelengthCategory,
} from "./wavelengthCatalog";
import {
  WAVELENGTH_CONTRACT_VERSIONS,
  WAVELENGTH_RELAXATION_POLICY,
  chooseWavelengthClue,
  wavelengthClues,
  wavelengthScore,
  type WavelengthClue,
} from "./wavelengthEngine";
import {
  materializeWavelengthOfficialSetup,
  serializeWavelengthOfficialProjection,
} from "./wavelengthOfficialPrivacy";

function normalizedTokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean));
}

function similarity(left: string, right: string) {
  const leftTokens = normalizedTokens(left);
  const rightTokens = normalizedTokens(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 1;
}

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("Wavelength calibration evidence", () => {
  it("reconciles inherited ratings through auditable non-averaged review decisions", () => {
    expect(validateWavelengthCalibrationAudit()).toBe(true);
    expect(WAVELENGTH_CALIBRATION_AUDIT.disagreementThreshold).toBe(
      WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD,
    );
    expect(WAVELENGTH_INHERITED_REVIEW_EVIDENCE.length).toBeGreaterThanOrEqual(10);

    const materialDisagreements = WAVELENGTH_INHERITED_REVIEW_EVIDENCE.filter((evidence) => (
      Math.abs(evidence.reviewedRating - evidence.baselineRating)
        >= WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD
    ));
    expect(materialDisagreements.length).toBeGreaterThan(0);
    for (const evidence of materialDisagreements) {
      expect(evidence.resolution).not.toBe("confirmed");
      expect(evidence.reviewedRating).not.toBe(
        Math.round((evidence.baselineRating + evidence.reviewedRating) / 2),
      );
    }

    expect(WAVELENGTH_QUARANTINE_EVIDENCE).toHaveLength(1);
  });

  it("keeps meaningful category and score-band coverage without material near-duplicate copy", () => {
    const categoryBands = new Map<WavelengthCategory, Set<string>>();
    for (const item of approvedWavelengthCatalog) {
      const band = WAVELENGTH_RATING_BANDS.find((candidate) => (
        item.rating >= candidate.min && item.rating <= candidate.max
      ));
      if (band) {
        const bands = categoryBands.get(item.category) ?? new Set<string>();
        bands.add(band.label);
        categoryBands.set(item.category, bands);
      }
    }

    expect(categoryBands.size).toBe(WAVELENGTH_CATEGORY_ANCHORS.length);
    for (const bands of categoryBands.values()) expect(bands.size).toBeGreaterThanOrEqual(3);

    for (let left = 0; left < approvedWavelengthCatalog.length; left += 1) {
      for (let right = left + 1; right < approvedWavelengthCatalog.length; right += 1) {
        expect(
          similarity(approvedWavelengthCatalog[left].text, approvedWavelengthCatalog[right].text),
          `${approvedWavelengthCatalog[left].id} is too similar to ${approvedWavelengthCatalog[right].id}`,
        ).toBeLessThan(0.82);
      }
    }
  });

  it("excludes unfixed rapidly changing clue language from the approved projection", () => {
    const unstable = /\b(this week|today|tonight|latest|currently|right now)\b/i;
    expect(approvedWavelengthCatalog.filter((item) => unstable.test(item.text))).toEqual([]);
  });
});

describe("Wavelength sequence and score contracts", () => {
  it("avoids a recent exact target-and-clue sequence prefix when alternatives exist", () => {
    const first = chooseWavelengthClue(70, { target: 70, random: () => 0 });
    const alternate = chooseWavelengthClue(70, {
      target: 70,
      recent: { clueSequenceKeys: [`70|${first.id}|unused-future-clue`] },
      random: () => 0,
    });
    expect(alternate.id).not.toBe(first.id);
  });

  it("uses one explicit deterministic relaxation path when sequence exclusions exhaust the bank", () => {
    const allFirstClueSequences = wavelengthClues.map((clue) => `70|${clue.id}`);
    const selected = chooseWavelengthClue(70, {
      target: 70,
      recent: { clueSequenceKeys: allFirstClueSequences },
      random: () => 0,
    });
    expect(wavelengthClues).toContain(selected);
    expect(WAVELENGTH_RELAXATION_POLICY.version).toBe("wavelength-relaxation-v1");
    expect(WAVELENGTH_RELAXATION_POLICY.rule).toContain("same canonical candidate pool");
  });

  it("scores only the fourth locked guess", () => {
    const firstPath = [1, 100, 1, 68];
    const secondPath = [100, 1, 100, 68];
    expect(wavelengthScore(firstPath[3], 75)).toBe(86);
    expect(wavelengthScore(secondPath[3], 75)).toBe(86);
  });
});

describe("Wavelength official wire privacy", () => {
  const privateClues: WavelengthClue[] = [
    { id: "private-one", category: "FIGHTER SKILL", text: "PRIVATE FIRST CLUE", rating: 11 },
    { id: "public-current", category: "UFC RESUME", text: "PUBLIC CURRENT CLUE", rating: 22 },
    { id: "private-three", category: "CHAMPIONSHIP", text: "PRIVATE FUTURE CLUE", rating: 33 },
    { id: "private-four", category: "UFC CULTURE", text: "PRIVATE FINAL CLUE", rating: 44 },
  ];
  const setup = materializeWavelengthOfficialSetup({
    target: 73,
    clues: privateClues,
    versions: WAVELENGTH_CONTRACT_VERSIONS,
  });

  it("serializes only the current public clue before reveal", () => {
    const wire = serializeWavelengthOfficialProjection(setup, {
      stage: "pre-reveal",
      currentClueIndex: 1,
    });
    const payload = JSON.parse(wire) as Record<string, unknown>;

    expect(Object.keys(payload).sort()).toEqual(["clueCount", "currentClue", "gameId", "versions"]);
    expect(wire).toContain("PUBLIC CURRENT CLUE");
    expect(wire).not.toContain("PRIVATE FIRST CLUE");
    expect(wire).not.toContain("PRIVATE FUTURE CLUE");
    expect(wire).not.toContain("PRIVATE FINAL CLUE");
    expect(wire).not.toContain("rating");
    expect(wire).not.toContain("73");
  });

  it("reveals only answer-stage public data and never serializes private clue ratings", () => {
    const wire = serializeWavelengthOfficialProjection(setup, { stage: "reveal", finalGuess: 70 });
    const payload = JSON.parse(wire) as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual([
      "finalScore", "gameId", "revealedClues", "target", "versions",
    ]);
    expect(payload.target).toBe(73);
    expect(payload.finalScore).toBe(94);
    expect(wire).not.toContain("rating");
  });

  it("keeps the future official materialized setup out of current browser game owners", () => {
    const playDirectory = dirname(fileURLToPath(import.meta.url));
    const browserImports = sourceFiles(playDirectory)
      .filter((path) => /\.(ts|tsx)$/.test(path))
      .filter((path) => !path.endsWith("wavelengthOfficialPrivacy.ts"))
      .filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"))
      .filter((path) => readFileSync(path, "utf8").includes("wavelengthOfficialPrivacy"));
    expect(browserImports).toEqual([]);
  });
});
