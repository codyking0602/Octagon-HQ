import fs from "node:fs";

const path = "scripts/generate-football-recognizability.mjs";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'else if (major && strong) { tier = "C"; evidence.push("sustained high-end production at a nationally prominent program"); }',
    'else if (singleMajorProgram && strong) { tier = "C"; evidence.push("sustained high-end production at one observed nationally prominent program"); }',
  ],
  [
    'Tier C requires sustained high-end production at a nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role.',
    'Tier C requires sustained high-end production tied to one observed nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role.',
  ],
  [
    '- Duplicate CFB source names are left D until a stable identity key can reconcile them safely.\\n- CFB historical games remain D',
    '- Duplicate CFB source names are left D until a stable identity key can reconcile them safely.\\n- Multi-team CFB source identities are not auto-promoted from program reputation; they need explicit source-window approval or a chronologically reconciled NFL identity.\\n- CFB historical games remain D',
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) throw new Error(`Expected PR6 generator text not found: ${from}`);
  source = source.replace(from, to);
}

fs.writeFileSync(path, source);
