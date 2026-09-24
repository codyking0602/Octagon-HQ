import { describe, expect, it } from "vitest";
import { getUfcFactualSubject } from "../back-room/ufcFactualLedger";
import { ufcWhoAmIAuthoredCanonicalExpansion } from "../back-room/ufcWhoAmIAuthoredCanonicalExpansion";
import { ufcWhoAmIAuthoredLaunchPool } from "./ufcWhoAmIAuthoredLaunchPool";

const EXPECTED_BANDS = [
  "broad",
  "broad",
  "helpful",
  "helpful",
  "helpful",
  "strong",
  "strong",
  "strong",
  "giveaway",
  "giveaway",
] as const;

const GENERIC_PATTERNS = [
  /primary UFC division/i,
  /UFC fights\.?$/i,
  /UFC wins\.?$/i,
  /wins by KO or TKO/i,
  /submission wins/i,
  /title fights\.?$/i,
  /career crossed .* decades/i,
];

const BRITTLE_PATTERNS = [
  /my final fight/i,
  /my most recent fight/i,
  /i currently hold/i,
  /i am currently/i,
  /my current streak/i,
  /still the record/i,
];

const EDITORIAL_FAILURE_PATTERNS = [
  /most recognizable UFC matchup/i,
  /defining UFC result/i,
  /\\bI'\\b/,
  /my first UFC title opportunity came after 1 earlier UFC appearances/i,
  /UFC gold at Ultimate Fighter/i,
  /championship victory at Ultimate Fighter/i,
  /appearances at both .*Ultimate Fighter .* Tournament/i,
];

const CALIBRATED_GENERATED_IDS = new Set([
  "ufc:aljamain-sterling",
  "ufc:kayla-harrison",
  "ufc:michael-chandler",
  "ufc:frank-shamrock",
  "ufc:jon-jones",
  "ufc:tj-dillashaw",
  "ufc:francis-ngannou",
  "ufc:justin-gaethje",
  "ufc:dustin-poirier",
  "ufc:tito-ortiz",
  "ufc:robbie-lawler",
  "ufc:henry-cejudo",
  "ufc:petr-yan",
  "ufc:lyoto-machida",
  "ufc:dricus-du-plessis",
  "ufc:khamzat-chimaev",
  "ufc:sean-omalley",
  "ufc:forrest-griffin",
  "ufc:chael-sonnen",
  "ufc:valentina-shevchenko",
  "ufc:rose-namajunas",
  "ufc:cris-cyborg",
  "ufc:miesha-tate",
  "ufc:jorge-masvidal",
  "ufc:brian-ortega",
  "ufc:ciryl-gane",
  "ufc:marlon-vera",
  "ufc:dominick-reyes",
  "ufc:dan-hooker",
  "ufc:islam-makhachev",
  "ufc:matt-hughes",
  "ufc:stipe-miocic",
  "ufc:merab-dvalishvili",
  "ufc:cain-velasquez",
  "ufc:junior-dos-santos",
  "ufc:tyron-woodley",
  "ufc:alex-pantoja",
  "ufc:ilia-topuria",
  "ufc:robert-whittaker",
  "ufc:chris-weidman",
  "ufc:sean-strickland",
  "ufc:brandon-moreno",
  "ufc:rashad-evans",
  "ufc:dominick-cruz",
  "ufc:michael-bisping",
  "ufc:quinton-jackson",
  "ufc:brock-lesnar",
  "ufc:paddy-pimblett",
  "ufc:zhang-weili",
  "ufc:ronda-rousey",
  "ufc:carla-esparza",
  "ufc:mackenzie-dern",
  "ufc:holly-holm",
  "ufc:nate-diaz",
  "ufc:colby-covington",
  "ufc:yair-rodriguez",
  "ufc:kevin-holland",
  "ufc:gilbert-burns",
  "ufc:nick-diaz",
  "ufc:alexander-volkanovski",
  "ufc:kamaru-usman",
  "ufc:daniel-cormier",
  "ufc:charles-oliveira",
  "ufc:frankie-edgar",
  "ufc:benson-henderson",
  "ufc:bj-penn",
  "ufc:glover-teixeira",
  "ufc:leon-edwards",
  "ufc:fabricio-werdum",
  "ufc:tony-ferguson",
  "ufc:deiveson-figueiredo",
  "ufc:vitor-belfort",
  "ufc:tom-aspinall",
  "ufc:royce-gracie",
  "ufc:anthony-pettis",
  "ufc:shogun-rua",
  "ufc:dan-henderson",
  "ufc:joanna-jedrzejczyk",
  "ufc:jessica-andrade",
  "ufc:alexa-grasso",
  "ufc:julianna-pena",
  "ufc:rafael-dos-anjos",
  "ufc:donald-cerrone",
  "ufc:stephen-thompson",
  "ufc:derrick-lewis",
  "ufc:paulo-costa",
  "ufc:tai-tuivasa",
  "ufc:diego-lopes",
]);

const MASS_TEMPLATE_PATTERNS = [
  /^My UFC debut ended with a (?:win|loss)/i,
  /^I reached my first UFC title opportunity/i,
  /^My first UFC title opportunity came after/i,
  /^One stretch of my UFC career reached/i,
  /^I spent most of my UFC career/i,
  /^My UFC career included appearances at/i,
  /^My UFC career includes a championship victory/i,
  /^I won \d+ of my first three UFC appearances/i,
  /^My UFC résumé includes a matchup against/i,
];

const EARLY_IDENTITY_SHORTCUTS = [
  /\bWaianae\b/i,
  /\bDagestan\b/i,
  /\bSaint-Isidore\b/i,
  /\bRio de Janeiro\b/i,
  /\bManaus\b/i,
  /\bAmerican Kickboxing Academy\b/i,
  /\bChute Boxe\b/i,
  /\bB\.A\. Baracus\b/i,
  /\bOlympic (?:gold|silver|bronze|medal)\b/i,
];

describe("UFC Who Am I authored launch pool", () => {
  it("covers all 133 canonical fighters with 2,660 authored clues", () => {
    expect(ufcWhoAmIAuthoredLaunchPool).toHaveLength(133);
    expect(new Set(ufcWhoAmIAuthoredLaunchPool.map((identity) => identity.subjectId)).size).toBe(133);

    let clueCount = 0;
    for (const identity of ufcWhoAmIAuthoredLaunchPool) {
      const canonical = getUfcFactualSubject(identity.subjectId);
      expect(canonical?.name).toBe(identity.name);
      expect(Object.keys(identity.scripts).sort()).toEqual(["A", "B"]);
      clueCount += identity.scripts.A!.clues.length + identity.scripts.B!.clues.length;
    }
    expect(clueCount).toBe(2_660);
  });

  it("keeps every authored script source-backed, distinct and progression-safe", () => {
    const globalClueIds = new Set<string>();

    for (const identity of ufcWhoAmIAuthoredLaunchPool) {
      for (const scriptId of ["A", "B"] as const) {
        const script = identity.scripts[scriptId]!;
        expect(script.clues).toHaveLength(10);
        expect(script.clues.map((clue) => clue.band)).toEqual(EXPECTED_BANDS);
        expect(new Set(script.clues.map((clue) => clue.text)).size).toBe(10);

        for (const clue of script.clues) {
          expect(clue.verification).toBe("verified");
          expect(clue.sourceIds.length).toBeGreaterThan(0);
          for (const sourceId of clue.sourceIds) {
            expect(identity.sources[sourceId]).toMatch(/^https:\/\//);
          }
          expect(clue.text.toLowerCase()).not.toContain(identity.name.toLowerCase());
          expect(GENERIC_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
          expect(BRITTLE_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
          expect(EDITORIAL_FAILURE_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
          expect(globalClueIds.has(clue.id)).toBe(false);
          globalClueIds.add(clue.id);
        }
      }

      const exactOverlap = identity.scripts.A!.clues.filter((left) =>
        identity.scripts.B!.clues.some((right) => right.text === left.text)
      );
      expect(exactOverlap).toHaveLength(0);
    }
  });

  it("keeps all 33 expansion fighters away from mass-authoring templates", () => {
    const expansionIds = new Set(ufcWhoAmIAuthoredCanonicalExpansion.map((subject) => subject.id));
    const expansion = ufcWhoAmIAuthoredLaunchPool.filter((identity) => expansionIds.has(identity.subjectId));

    expect(expansion).toHaveLength(33);
    for (const identity of expansion) {
      for (const scriptId of ["A", "B"] as const) {
        for (const clue of identity.scripts[scriptId]!.clues) {
          expect(MASS_TEMPLATE_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
        }
      }
    }
  });

  it("keeps the opening four clues broad instead of using identity shortcuts", () => {
    const canonicalNames = ufcWhoAmIAuthoredLaunchPool.map((identity) => identity.name.toLowerCase());

    for (const identity of ufcWhoAmIAuthoredLaunchPool) {
      for (const scriptId of ["A", "B"] as const) {
        for (const clue of identity.scripts[scriptId]!.clues.slice(0, 4)) {
          expect(EARLY_IDENTITY_SHORTCUTS.some((pattern) => pattern.test(clue.text))).toBe(false);

          const lower = clue.text.toLowerCase();
          const namedOtherCanonicalFighter = canonicalNames.some(
            (name) => name !== identity.name.toLowerCase() && lower.includes(name),
          );
          expect(namedOtherCanonicalFighter).toBe(false);
        }
      }
    }
  });

  it("locks the first recalibrated generated fighters away from the mass-authoring templates", () => {
    const calibrated = ufcWhoAmIAuthoredLaunchPool.filter((identity) =>
      CALIBRATED_GENERATED_IDS.has(identity.subjectId),
    );
    expect(calibrated).toHaveLength(CALIBRATED_GENERATED_IDS.size);

    for (const identity of calibrated) {
      for (const scriptId of ["A", "B"] as const) {
        const clues = identity.scripts[scriptId]!.clues;
        for (const clue of clues) {
          expect(MASS_TEMPLATE_PATTERNS.some((pattern) => pattern.test(clue.text))).toBe(false);
        }
        for (const clue of clues.slice(0, 4)) {
          expect(/\b(?:Petr Yan|Cory Sandhagen|Holly Holm|Julianna Peña|Charles Oliveira|Conor McGregor|Tito Ortiz|Kevin Jackson)\b/i.test(clue.text)).toBe(false);
        }
      }
    }
  });

  it("is comfortably larger than the six-appearance two-fighter cooldown", () => {
    expect(ufcWhoAmIAuthoredLaunchPool.length).toBeGreaterThan(6 + 2);
  });
});
