import fs from "node:fs";

const path = "src/features/back-room/footballComparisonGeneration.ts";
const original = fs.readFileSync(path, "utf8");
const from = '    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad";\n';
const to = '    const repeatedTargetDepth = targets.filter((tier) => tier === targetTier).length;\n    const exactTierDepth = availableTierCount(items, targetTier);\n    const preferDeepExactTier = (\n      targetTier !== "elite"\n      && targetTier !== "bad"\n      && exactTierDepth >= Math.max(3, repeatedTargetDepth)\n      && random() < 0.55\n    );\n    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad" || preferDeepExactTier;\n';

if (!original.includes(from)) {
  throw new Error(`Expected Keep/Cut repair anchor missing in ${path}`);
}

fs.writeFileSync(path, original.replace(from, to));
console.log("Applied narrow Stage 13 Keep/Cut selection repair.");
