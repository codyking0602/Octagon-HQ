import fs from "node:fs";

const generatorPath = "scripts/generate-football-recognizability.mjs";
const testPath = "src/features/back-room/footballRecognizabilityProjection.test.ts";

let generator = fs.readFileSync(generatorPath, "utf8");

function replaceExact(label, before, after) {
  if (!generator.includes(before)) throw new Error(`Missing expected ${label} block`);
  generator = generator.replace(before, after);
}

replaceExact(
  "NFL B thresholds",
  `  const b =
    (position === "QB" && games >= 80 && (passYards >= 25000 || passTds >= 180)) ||
    (position === "RB" && games >= 80 && (rushYards >= 7000 || carries >= 1500)) ||
    ((position === "WR" || position === "TE") && games >= 80 && (recYards >= 7000 || receptions >= 500)) ||
    (["DL", "LB", "DB"].includes(position) && games >= 100 && (sacks >= 80 || ints >= 35)) ||
    (position === "K" && games >= 180 && fgm >= 300);`,
  `  const scrimmageYards = rushYards + recYards;
  const b =
    (position === "QB" && games >= 80 && (passYards >= 30000 || passTds >= 220)) ||
    (position === "RB" && games >= 70 && (rushYards >= 9000 || scrimmageYards >= 11000)) ||
    ((position === "WR" || position === "TE") && games >= 80 && (recYards >= 10000 || receptions >= 750)) ||
    ((position === "DL" || position === "LB") && games >= 100 && sacks >= 90) ||
    (position === "DB" && games >= 100 && ints >= 30) ||
    (position === "K" && games >= 200 && fgm >= 350);`,
);

replaceExact(
  "NFL manual B override",
  `if (approvedBPlayers.has(p.name) && tier === "D") { tier = "B"; evidence.push("explicit football-culture B approval"); }`,
  `if (approvedBPlayers.has(p.name) && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval"); }`,
);

replaceExact(
  "CFB headline threshold",
  `  const eliteMajorPeak =
    major && ((position === "QB" && passYards >= 9000 && peak(p, "passYards") >= 3500) ||
      (position === "RB" && rushYards >= 3500 && peak(p, "rushYards") >= 1500) ||
      ((position === "WR" || position === "TE") && recYards >= 2800 && peak(p, "receivingYards") >= 1100));`,
  `  const eliteMajorPeak =
    major && ((position === "QB" && passYards >= 9000 && peak(p, "passYards") >= 3500) ||
      (position === "RB" && rushYards >= 3500 && peak(p, "rushYards") >= 1500) ||
      ((position === "WR" || position === "TE") && recYards >= 2800 && peak(p, "receivingYards") >= 1100));
  const headlineMajor =
    major && ((position === "QB" && passYards >= 6500 && peak(p, "passYards") >= 3000) ||
      (position === "RB" && rushYards >= 2500 && peak(p, "rushYards") >= 1200) ||
      ((position === "WR" || position === "TE") && recYards >= 1800 && peak(p, "receivingYards") >= 900));`,
);

replaceExact(
  "CFB contextual tiers",
  `  if (nflMatch && ["A", "B"].includes(nflMatch.tier) && meaningful) { tier = "B"; evidence.push("recognizable NFL crossover with meaningful college role"); }
  else if (eliteMajorPeak && approvedBPlayers.has(p.name)) { tier = "B"; evidence.push("explicit B approval supported by exceptional major-program production"); }
  else if (nflMatch && nflMatch.tier === "C" && meaningful) { tier = "C"; evidence.push(nflMatch ? "recognized NFL crossover with meaningful college role" : "sustained high-end college production"); }
  if (approvedBPlayers.has(p.name) && meaningful && tier === "D") { tier = "B"; evidence.push("explicit football-culture B approval"); }
  if (approvedAPlayers.has(p.name) && meaningful) { tier = "A"; evidence.push("explicit iconic-player approval"); }`,
  `  if (headlineMajor || eliteMajorPeak) { tier = "B"; evidence.push("headline major-program college production"); }
  else if (major && meaningful) { tier = "C"; evidence.push("meaningful production at a nationally prominent program"); }
  else if (strong) { tier = "C"; evidence.push("sustained high-end college production"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }
  if (approvedBPlayers.has(p.name) && nflMatch && meaningful && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval on a chronologically reconciled identity"); }
  if (approvedAPlayers.has(p.name) && nflMatch && meaningful) { tier = "A"; evidence.push("explicit iconic-player approval on a chronologically reconciled identity"); }`,
);

replaceExact(
  "audit methodology",
  `Program prominence may support a strong college-production case but never independently promotes a player. Awards/draft/cultural-game markers that are absent from the source are not invented.`,
  `CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Tier B requires headline major-program production or an explicit approval on a chronologically reconciled identity; program prominence never promotes a player without meaningful production. Awards/draft/cultural-game markers that are absent from the source are not invented.`,
);

fs.writeFileSync(generatorPath, generator);

let test = fs.readFileSync(testPath, "utf8");
const anchor = `  it("does not turn ordinary CFB stat rows or kicker volume into casual filler", () => {`;
const regression = `  it("keeps NFL fame from overpromoting a separate CFB identity", () => {
    for (const name of ["Aaron Jones", "Alvin Kamara", "Tyler Lockett"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)?.tier).toBe("C");
    }
    expect(projection.records.filter((record) => record.league === "CFB" && record.tier === "A")).toHaveLength(0);
  });

  it("keeps Tier B reserved for headline stars rather than long-career volume", () => {
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "Benjamin Watson")?.tier).toBe("C");
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "Bobby Engram")?.tier).toBe("C");
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "A.J. Green")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Bijan Robinson")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "C.J. Stroud")?.tier).toBe("B");
  });

`;
if (!test.includes(regression.trim())) {
  if (!test.includes(anchor)) throw new Error("Missing test insertion anchor");
  test = test.replace(anchor, regression + anchor);
}
fs.writeFileSync(testPath, test);
