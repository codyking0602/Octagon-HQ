import fs from "node:fs";

const generatorPath = "scripts/generate-football-recognizability.mjs";
let generator = fs.readFileSync(generatorPath, "utf8");

function replaceExact(label, before, after) {
  if (!generator.includes(before)) throw new Error(`Missing expected ${label} block`);
  generator = generator.replace(before, after);
}

replaceExact(
  "CFB Tier C single-program gate",
  `  else if (major && strong) { tier = "C"; evidence.push("sustained high-end production at a nationally prominent program"); }`,
  `  else if (cCandidate) { tier = "C"; evidence.push("sustained high-end production at a single nationally prominent program"); }`,
);

replaceExact(
  "audit Tier C single-program methodology",
  `Tier C requires sustained high-end production at a nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role.`,
  `Tier C requires sustained high-end production tied to one nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role.`,
);

fs.writeFileSync(generatorPath, generator);
