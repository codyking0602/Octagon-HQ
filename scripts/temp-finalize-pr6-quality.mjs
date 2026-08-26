import fs from "node:fs";

const generatorPath = "scripts/generate-football-recognizability.mjs";
const testPath = "src/features/back-room/footballRecognizabilityProjection.test.ts";
let generator = fs.readFileSync(generatorPath, "utf8");

function replaceExact(label, before, after) {
  if (!generator.includes(before)) throw new Error(`Missing expected ${label} block`);
  generator = generator.replace(before, after);
}

replaceExact(
  "CFB identity approvals anchor",
  `const majorCfbPrograms = new Set([`,
  `const approvedCfbBIdentityWindows = new Map([
  ["a-j-brown", [2016, 2018]], ["ashton-jeanty", [2022, 2024]], ["baker-mayfield", [2015, 2017]],
  ["bijan-robinson", [2020, 2022]], ["bo-nix", [2019, 2023]], ["caleb-williams", [2021, 2023]],
  ["christian-mccaffrey", [2014, 2016]], ["derrick-henry", [2014, 2015]], ["jayden-daniels", [2019, 2023]],
  ["lamar-jackson", [2015, 2017]], ["saquon-barkley", [2015, 2017]], ["travis-hunter", [2022, 2024]],
  ["trevor-lawrence", [2018, 2020]], ["c-j-stroud", [2021, 2022]], ["travis-etienne", [2017, 2020]],
  ["amari-cooper", [2014, 2014]], ["ezekiel-elliott", [2014, 2015]], ["marcus-mariota", [2014, 2014]],
  ["jameis-winston", [2014, 2014]], ["melvin-gordon", [2014, 2014]], ["dak-prescott", [2014, 2015]],
  ["deshaun-watson", [2014, 2016]], ["leonard-fournette", [2014, 2016]], ["nick-chubb", [2014, 2017]],
  ["myles-garrett", [2014, 2016]], ["jalen-hurts", [2016, 2019]], ["kyler-murray", [2015, 2018]],
  ["ja-marr-chase", [2018, 2019]], ["devonta-smith", [2017, 2020]], ["brock-bowers", [2021, 2023]],
  ["marvin-harrison-jr", [2021, 2023]], ["will-anderson-jr", [2020, 2022]], ["micah-parsons", [2018, 2019]],
  ["chase-young", [2017, 2019]], ["joey-bosa", [2014, 2015]], ["nick-bosa", [2016, 2018]],
  ["dalvin-cook", [2014, 2016]], ["todd-gurley", [2014, 2014]],
]);
const majorCfbPrograms = new Set([`,
);

replaceExact(
  "NFL DB B threshold",
  `(position === "DB" && games >= 100 && ints >= 30) ||`,
  `(position === "DB" && games >= 100 && ints >= 35) ||`,
);

replaceExact(
  "CFB tier policy",
  `  if (eliteMajorPeak) { tier = "B"; evidence.push("exceptional sustained production at one nationally prominent program"); }
  else if (headlineMajor) { tier = "C"; evidence.push("headline production at one nationally prominent program"); }
  else if (strong) { tier = "C"; evidence.push("sustained high-end college production"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }`,
  `  const approvedBWindow = approvedCfbBIdentityWindows.get(normalize(p.name));
  const approvedBIdentity = approvedBWindow?.[0] === years[0] && approvedBWindow?.[1] === years.at(-1);
  if (approvedBIdentity) { tier = "B"; evidence.push("explicit source-window CFB star approval"); }
  else if (major && meaningful) { tier = "C"; evidence.push("meaningful production at a nationally prominent program"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }`,
);

replaceExact(
  "audit methodology",
  `CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Automatic Tier B requires exceptional sustained production within one nationally prominent program; multi-program source careers are not allowed to borrow one school's brand across aggregated career totals. Name-only manual A/B player approvals are not applied to CFB source rows without a stable source-identity mapping. Conservative underclassification is preferred to a false recognizability promotion. Awards/draft/cultural-game markers that are absent from the source are not invented.`,
  `CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Because the source does not carry awards, draft profile, or cultural-significance markers, Tier B is reserved for a small explicit set of star identities anchored to their exact observed CFB season window; name-only approvals are not used. Tier C requires meaningful production at a nationally prominent program or a chronologically reconciled recognizable NFL identity. Stat volume alone at an otherwise obscure program does not create casual-game recognizability. Conservative underclassification is preferred to false promotion.`,
);

replaceExact(
  "output manual approval metadata",
  `  manualBApprovals: [...approvedBPlayers].sort(),`,
  `  manualBApprovals: [...approvedBPlayers].sort(),
  manualCfbBIdentityApprovals: [...approvedCfbBIdentityWindows.entries()].map(([name, [startSeason, endSeason]]) => ({ name, startSeason, endSeason })),`,
);

fs.writeFileSync(generatorPath, generator);

let test = fs.readFileSync(testPath, "utf8");
test = test.replace(
`  it("uses exact NFL positions and blocks the observed substring regressions", () => {
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "Adam Vinatieri")).toMatchObject({ position: "K" });
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "AJ Cole")).toMatchObject({ position: "P" });
    const audit = fs.readFileSync("docs/football-recognizability-audit.md", "utf8");
    expect(audit).not.toContain("Adam Vinatieri (OL");
    expect(audit).not.toContain("AJ Cole (OL");
    expect(audit).not.toContain("A.J. Epenesa (DB");
  });`,
`  it("uses exact NFL positions and blocks the observed substring regressions", () => {
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "A.J. Epenesa")).toMatchObject({ position: "LB" });
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "A'Shawn Robinson")).toMatchObject({ position: "DL" });
    const audit = fs.readFileSync("docs/football-recognizability-audit.md", "utf8");
    expect(audit).not.toContain("Adam Vinatieri (OL");
    expect(audit).not.toContain("AJ Cole (OL");
    expect(audit).not.toContain("A.J. Epenesa (DB");
    const generator = fs.readFileSync("scripts/generate-football-recognizability.mjs", "utf8");
    expect(generator).toContain('["K", "K"]');
    expect(generator).toContain('["P", "P"]');
  });`);

test = test.replace(
`    expect(projection.records.filter((record) => record.league === "CFB" && record.tier === "A")).toHaveLength(0);`,
`    expect(projection.records.filter((record) => record.kind === "player-career" && record.league === "CFB" && record.tier === "A")).toHaveLength(0);`);

test = test.replace(
`    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Baker Mayfield")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "A.J. Brown")?.tier).toBe("B");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "Bijan Robinson")?.tier).toBe("C");
    expect(projection.records.find((record) => record.league === "CFB" && record.name === "C.J. Stroud")?.tier).toBe("C");
    for (const name of ["Aidan O'Connell", "Alan Bowman", "Amba Etta-Tawo", "Athan Kaliakmanis"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)?.tier).not.toBe("B");
    }`,
`    for (const name of ["Baker Mayfield", "A.J. Brown", "Bijan Robinson", "C.J. Stroud", "Travis Etienne"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)?.tier).toBe("B");
    }
    for (const name of ["Aidan O'Connell", "Alan Bowman", "Amba Etta-Tawo", "Athan Kaliakmanis", "Xavier Restrepo"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)?.tier).not.toBe("B");
    }`);

const fillerAnchor = `  it("does not turn ordinary CFB stat rows or kicker volume into casual filler", () => {`;
const fillerRegression = `  it("does not promote stat-volume-only CFB names without recognizable context", () => {
    for (const name of ["Aidan Bouman", "Adrian Hardy", "Ajalen Holley", "Amare Thomas"]) {
      expect(projection.records.find((record) => record.league === "CFB" && record.name === name)).toBeUndefined();
    }
  });

`;
if (!test.includes(fillerRegression.trim())) {
  if (!test.includes(fillerAnchor)) throw new Error("Missing filler regression insertion anchor");
  test = test.replace(fillerAnchor, fillerRegression + fillerAnchor);
}
fs.writeFileSync(testPath, test);
