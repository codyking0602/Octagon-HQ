import fs from "node:fs";

const generatorPath = "scripts/generate-football-recognizability.mjs";
const testPath = "src/features/back-room/footballRecognizabilityProjection.test.ts";

let generator = fs.readFileSync(generatorPath, "utf8");

function replaceExact(label, before, after) {
  if (!generator.includes(before)) throw new Error(`Missing expected ${label} block`);
  generator = generator.replace(before, after);
}

replaceExact(
  "CFB program context",
  `  const major = [...p.teams].some((team) => majorCfbPrograms.has(normalize(team)));`,
  `  const major = [...p.teams].some((team) => majorCfbPrograms.has(normalize(team)));
  const singleMajorProgram = p.teams.size === 1 && major;`,
);

replaceExact(
  "CFB major peak gates",
  `  const eliteMajorPeak =
    major && ((position === "QB" && passYards >= 9000 && peak(p, "passYards") >= 3500) ||
      (position === "RB" && rushYards >= 3500 && peak(p, "rushYards") >= 1500) ||
      ((position === "WR" || position === "TE") && recYards >= 2800 && peak(p, "receivingYards") >= 1100));
  const headlineMajor =
    major && ((position === "QB" && passYards >= 6500 && peak(p, "passYards") >= 3000) ||
      (position === "RB" && rushYards >= 2500 && peak(p, "rushYards") >= 1200) ||
      ((position === "WR" || position === "TE") && recYards >= 1800 && peak(p, "receivingYards") >= 900));`,
  `  const eliteMajorPeak =
    singleMajorProgram && ((position === "QB" && passYards >= 9000 && peak(p, "passYards") >= 3500) ||
      (position === "RB" && rushYards >= 3500 && peak(p, "rushYards") >= 1500) ||
      ((position === "WR" || position === "TE") && recYards >= 2800 && peak(p, "receivingYards") >= 1100));
  const headlineMajor =
    singleMajorProgram && ((position === "QB" && passYards >= 6500 && peak(p, "passYards") >= 3000) ||
      (position === "RB" && rushYards >= 2500 && peak(p, "rushYards") >= 1200) ||
      ((position === "WR" || position === "TE") && recYards >= 1800 && peak(p, "receivingYards") >= 900));`,
);

replaceExact(
  "CFB tier policy",
  `  if (headlineMajor || eliteMajorPeak) { tier = "B"; evidence.push("headline major-program college production"); }
  else if (major && meaningful) { tier = "C"; evidence.push("meaningful production at a nationally prominent program"); }
  else if (strong) { tier = "C"; evidence.push("sustained high-end college production"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }
  if (approvedBPlayers.has(p.name) && nflMatch && meaningful && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval on a chronologically reconciled identity"); }
  if (approvedAPlayers.has(p.name) && nflMatch && meaningful) { tier = "A"; evidence.push("explicit iconic-player approval on a chronologically reconciled identity"); }`,
  `  if (eliteMajorPeak) { tier = "B"; evidence.push("exceptional sustained production at one nationally prominent program"); }
  else if (headlineMajor) { tier = "C"; evidence.push("headline production at one nationally prominent program"); }
  else if (strong) { tier = "C"; evidence.push("sustained high-end college production"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }`,
);

replaceExact(
  "audit methodology",
  `CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Tier B requires headline major-program production or an explicit approval on a chronologically reconciled identity; program prominence never promotes a player without meaningful production. Awards/draft/cultural-game markers that are absent from the source are not invented.`,
  `CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Automatic Tier B requires exceptional sustained production within one nationally prominent program; multi-program source careers are not allowed to borrow one school's brand across aggregated career totals. Name-only manual A/B player approvals are not applied to CFB source rows without a stable source-identity mapping. Conservative underclassification is preferred to a false recognizability promotion. Awards/draft/cultural-game markers that are absent from the source are not invented.`,
);

fs.writeFileSync(generatorPath, generator);

let test = fs.readFileSync(testPath, "utf8");
test = test.replace(
  `    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Bijan Robinson")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "C.J. Stroud")?.tier).toBe("B");`,
  `    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Baker Mayfield")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "A.J. Brown")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Bijan Robinson")?.tier).toBe("C");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "C.J. Stroud")?.tier).toBe("C");
    for (const name of ["Aidan O'Connell", "Alan Bowman", "Amba Etta-Tawo", "Athan Kaliakmanis"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)?.tier).not.toBe("B");
    }`,
);
fs.writeFileSync(testPath, test);
