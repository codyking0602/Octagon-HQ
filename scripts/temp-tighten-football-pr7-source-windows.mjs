import fs from "node:fs";

const path = "scripts/generate-football-find-leader-runtime.mjs";
let text = fs.readFileSync(path, "utf8");

function replaceExact(label, before, after) {
  if (!text.includes(before)) throw new Error(`Missing ${label}`);
  text = text.replace(before, after);
}

replaceExact(
  "NFL career-window start",
  `  pushSubject({\n    id: recognized.id,\n    name: recognized.name,\n    kind: "player-career",\n    league: "NFL",`,
  `  const careerCoverageComplete = recognized.startSeason >= 1999;\n  if (careerCoverageComplete) {\n    pushSubject({\n    id: recognized.id,\n    name: recognized.name,\n    kind: "player-career",\n    league: "NFL",`,
);
replaceExact(
  "NFL career-window end",
  `  pushRecord(recognized.id, "nfl-player-career", careerFacts);\n\n  if (position === "QB") {`,
  `  pushRecord(recognized.id, "nfl-player-career", careerFacts);\n  }\n\n  if (position === "QB") {`,
);
replaceExact(
  "CFB left-censor guard",
  `  const position = recognized.position;\n  if (!["QB", "RB", "WR", "TE", "DL", "LB", "DB"].includes(position)) continue;\n\n  const bySeason = new Map();`,
  `  const position = recognized.position;\n  if (!["QB", "RB", "WR", "TE", "DL", "LB", "DB"].includes(position)) continue;\n  // The normalized player corpus begins in 2014. A career whose first observed row is the source floor may have\n  // earlier seasons outside the corpus, so do not claim a career-wide best season from that left-censored window.\n  if (recognized.startSeason <= 2014) continue;\n\n  const bySeason = new Map();`,
);
replaceExact(
  "artifact eligibility metadata",
  `  eligibility: {\n    recognizabilityTiers: ["A", "B", "C"],\n    nflQbSeasonMinimumAttempts: 200,\n  },`,
  `  eligibility: {\n    recognizabilityTiers: ["A", "B", "C"],\n    nflCareerMinimumStartSeason: 1999,\n    cfbCareerMinimumStartSeason: 2015,\n    nflQbSeasonMinimumAttempts: 200,\n  },`,
);

fs.writeFileSync(path, text);
