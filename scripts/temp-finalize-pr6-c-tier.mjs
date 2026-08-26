import fs from "node:fs";

const generatorPath = "scripts/generate-football-recognizability.mjs";
const testPath = "src/features/back-room/footballRecognizabilityProjection.test.ts";
let generator = fs.readFileSync(generatorPath, "utf8");

function replaceExact(label, before, after) {
  if (!generator.includes(before)) throw new Error(`Missing expected ${label} block`);
  generator = generator.replace(before, after);
}

replaceExact(
  "CFB Tier C gate",
  `  if (approvedBIdentity) { tier = "B"; evidence.push("explicit source-window CFB star approval"); }
  else if (major && meaningful) { tier = "C"; evidence.push("meaningful production at a nationally prominent program"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }`,
  `  if (approvedBIdentity) { tier = "B"; evidence.push("explicit source-window CFB star approval"); }
  else if (major && strong) { tier = "C"; evidence.push("sustained high-end production at a nationally prominent program"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }`,
);

replaceExact(
  "audit Tier C methodology",
  `Tier C requires meaningful production at a nationally prominent program or a chronologically reconciled recognizable NFL identity. Stat volume alone at an otherwise obscure program does not create casual-game recognizability.`,
  `Tier C requires sustained high-end production at a nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role. Merely logging meaningful volume at a major program is not enough, and stat volume alone at an otherwise obscure program does not create casual-game recognizability.`,
);

fs.writeFileSync(generatorPath, generator);

let test = fs.readFileSync(testPath, "utf8");
const anchor = `  it("does not promote stat-volume-only CFB names without recognizable context", () => {`;
const regression = `  it("does not treat ordinary major-program contributors as football-fan recognizable", () => {
    for (const name of ["A.J. Duffy", "A.J. Erdely"]) {
      expect(projection.records.find((record) => record.kind === "player-career" && record.league === "CFB" && record.name === name)).toBeUndefined();
    }
    for (const name of ["Aaron Jones", "Alvin Kamara", "Tyler Lockett"]) {
      expect(projection.records.find((record) => record.kind === "player-career" && record.league === "CFB" && record.name === name)?.tier).toBe("C");
    }
  });

`;
if (!test.includes(regression.trim())) {
  if (!test.includes(anchor)) throw new Error("Missing C-tier regression insertion anchor");
  test = test.replace(anchor, regression + anchor);
}
fs.writeFileSync(testPath, test);
