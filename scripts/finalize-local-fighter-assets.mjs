#!/usr/bin/env node

import fs from "node:fs";

function replaceOnce(content, before, after, label) {
  const first = content.indexOf(before);
  if (first < 0) throw new Error(`Missing expected ${label} block.`);
  if (content.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one ${label} block.`);
  }
  return content.replace(before, after);
}

fs.writeFileSync(
  "src/config/brand.ts",
  `export const brand = {
  name: "Octagon HQ",
  logoUrl: "/assets/app-icon.png",
  fighterAssetBase: "/assets/fighters",
} as const;

export function fighterAsset(slug: string, kind: "thumb" | "profile" = "profile") {
  const suffix = kind === "thumb" ? "-thumb.webp" : ".webp";
  return \`${"${brand.fighterAssetBase}/${slug}${suffix}"}\`;
}
`,
  "utf8",
);

const rankingPath = "src/features/rankings/rankingModel.ts";
let ranking = fs.readFileSync(rankingPath, "utf8");
ranking = replaceOnce(
  ranking,
  'const LEGACY_APP_ROOT = "https://codyking0602.github.io/ufc-goat-rankings/";\n',
  "",
  "legacy app root",
);
ranking = replaceOnce(
  ranking,
  `function resolveAsset(path: string | null, slug: string, kind: "thumb" | "profile") {
  if (!path) return fighterAsset(slug, kind);
  if (/^https?:\\/\\//i.test(path)) return path;
  return \`${"${LEGACY_APP_ROOT}${path.replace(/^\\/+/, \"\")}"}\`;
}`,
  `function resolveAsset(assetPath: string | null, slug: string, kind: "thumb" | "profile") {
  if (!assetPath) return fighterAsset(slug, kind);
  if (/^https?:\\/\\//i.test(assetPath)) {
    throw new Error(\`External fighter asset URL is not allowed for \${slug}.\`);
  }
  return \`/\${assetPath.replace(/^\\/+/, "")}\`;
}`,
  "fighter asset resolver",
);
fs.writeFileSync(rankingPath, ranking, "utf8");

fs.writeFileSync(
  "src/features/rankings/fighterAssets.test.ts",
  `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { brand, fighterAsset } from "../../config/brand";
import { allTime } from "./rankingModel";

const publicRoot = fileURLToPath(new URL("../../../public/", import.meta.url));
const fighterDirectory = path.join(publicRoot, "assets", "fighters");

function fileHeader(filePath: string, length: number) {
  const descriptor = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(descriptor, buffer, 0, length, 0);
    return buffer;
  } finally {
    fs.closeSync(descriptor);
  }
}

function expectWebP(filePath: string) {
  expect(fs.existsSync(filePath), filePath).toBe(true);
  const header = fileHeader(filePath, 12);
  expect(header.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(header.subarray(8, 12).toString("ascii")).toBe("WEBP");
}

describe("local V2 fighter assets", () => {
  it("owns the brand logo and fighter asset base locally", () => {
    expect(brand.logoUrl).toBe("/assets/app-icon.png");
    expect(brand.fighterAssetBase).toBe("/assets/fighters");
    expect(brand.logoUrl).not.toContain("ufc-goat-rankings");

    const logoPath = path.join(publicRoot, "assets", "app-icon.png");
    expect(fs.existsSync(logoPath)).toBe(true);
    const header = fileHeader(logoPath, 4);
    expect([...header]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("reconciles all 80 fighters to exactly 160 valid local WebP files", () => {
    expect(allTime).toHaveLength(80);
    const expectedFiles = new Set<string>();

    allTime.forEach((fighter) => {
      const expectedThumb = fighterAsset(fighter.slug, "thumb");
      const expectedProfile = fighterAsset(fighter.slug, "profile");

      expect(fighter.thumbUrl).toBe(expectedThumb);
      expect(fighter.profileUrl).toBe(expectedProfile);
      expect(fighter.thumbUrl.startsWith("/assets/fighters/")).toBe(true);
      expect(fighter.profileUrl.startsWith("/assets/fighters/")).toBe(true);
      expect(fighter.thumbUrl).not.toMatch(/^https?:\\/\\//i);
      expect(fighter.profileUrl).not.toMatch(/^https?:\\/\\//i);
      expect(fighter.thumbUrl).not.toContain("ufc-goat-rankings");
      expect(fighter.profileUrl).not.toContain("ufc-goat-rankings");

      const thumbName = \`${"${fighter.slug}-thumb.webp"}\`;
      const profileName = \`${"${fighter.slug}.webp"}\`;
      expectedFiles.add(thumbName);
      expectedFiles.add(profileName);
      expectWebP(path.join(fighterDirectory, thumbName));
      expectWebP(path.join(fighterDirectory, profileName));
    });

    const actualFiles = fs
      .readdirSync(fighterDirectory)
      .filter((name) => name.endsWith(".webp"))
      .sort();
    expect(actualFiles).toEqual([...expectedFiles].sort());
    expect(actualFiles).toHaveLength(160);
  });
});
`,
  "utf8",
);

const handoffPath = "docs/HANDOFF.md";
let handoff = fs.readFileSync(handoffPath, "utf8");
handoff = replaceOnce(
  handoff,
  `## Temporary V1 asset dependency

V2 still reads real fighter images from the V1 GitHub Pages asset host when presentation metadata provides V1 paths. Before V1 is retired:

- copy the real logo and fighter images into V2;
- use local V2 paths;
- preserve source photographs;
- crop, resize, recenter, lightly sharpen, and convert only;
- never AI-regenerate fighter photos unless Cody explicitly asks.`,
  `## Local fighter asset ownership

V2 owns the real Octagon HQ logo and all ranked-fighter images locally:

- \`public/assets/app-icon.png\` owns the app icon;
- \`public/assets/fighters/\` contains one 160x160 thumbnail and one profile WebP for each of the 80 ranked fighters;
- \`src/config/brand.ts\` owns the local asset base;
- automated tests reconcile the calculated fighter set to exactly 160 valid local WebP files and reject external fighter-photo URLs;
- source photographs are preserved exactly; crop, resize, recenter, light sharpening, and WebP conversion remain the only allowed processing unless Cody explicitly requests an AI-generated edit;
- V1 no longer serves any runtime V2 image asset.`,
  "handoff asset ownership",
);
handoff = replaceOnce(
  handoff,
  "- Native V2 Octagon Verdict JSON/Markdown exporter and reproducible artifact workflow.\n- Disposable static ranking source deleted.",
  "- Native V2 Octagon Verdict JSON/Markdown exporter and reproducible artifact workflow.\n- Local V2 ownership of the app icon and all 160 ranked-fighter image files.\n- Disposable static ranking source deleted.",
  "handoff complete list",
);
handoff = replaceOnce(
  handoff,
  "- Routed desktop profile drawer.\n- Local V2 ownership of all fighter image files.\n- Real Home personalization, onboarding, favorite fighter, Top 10/profile-photo reminders, and persistence.",
  "- Routed desktop profile drawer.\n- Real Home personalization, onboarding, favorite fighter, Top 10/profile-photo reminders, and persistence.",
  "handoff incomplete list",
);
handoff = replaceOnce(
  handoff,
  `Finish the routed desktop profile drawer and local V2 ownership of all real fighter images. Preserve the current mobile full-screen profile and canonical \`/fighters/:slug\` route.

After those two remaining Rankings-adjacent migrations, begin real Home personalization and onboarding.`,
  `Begin real Home personalization and onboarding: Daily streak, Current Picks record, Favorite fighter, Open challenges, and the locked Top 10/profile-photo setup reminders.

Keep the routed desktop profile drawer as a later Rankings enhancement; the current mobile full-screen profile and canonical \`/fighters/:slug\` route remain approved.`,
  "handoff next action",
);
handoff = handoff.replace(
  "final Intelligence handoff, and native V2 Octagon Verdict exporter are complete.",
  "final Intelligence handoff, native V2 Octagon Verdict exporter, and complete local fighter-asset ownership are complete.",
).replace(
  "The next safe milestones are the routed desktop profile drawer and local V2 ownership of real fighter photos, followed by Home personalization.",
  "The next safe milestone is real Home personalization and onboarding; the desktop profile drawer remains a later Rankings enhancement.",
);
fs.writeFileSync(handoffPath, handoff, "utf8");

const migrationPath = "docs/RANKINGS-MIGRATION.md";
let migration = fs.readFileSync(migrationPath, "utf8");
migration = replaceOnce(
  migration,
  `## Remaining Rankings-adjacent work

### Desktop profile behavior

- add the routed right-side profile drawer on desktop while preserving \`/fighters/:slug\`;
- keep the current full-screen route on mobile;
- do not create a second profile data owner.

### Local fighter assets

- copy real fighter photos into V2 in controlled batches;
- preserve source photographs;
- crop, resize, recenter, lightly sharpen, and convert only;
- remove the temporary V1 asset-host dependency before V1 retirement.`,
  `## Rankings-adjacent status

### Local fighter assets — complete

- the real app icon and all 80 ranked fighters' thumbnail/profile WebPs are owned in \`public/assets/\`;
- the calculated fighter model resolves only local \`/assets/fighters/\` paths;
- automated tests require exactly 160 valid WebP files and reject external fighter-photo URLs;
- V1 is no longer a runtime image host for V2.

### Desktop profile behavior — later enhancement

- add the routed right-side profile drawer on desktop while preserving \`/fighters/:slug\`;
- keep the current full-screen route on mobile;
- do not create a second profile data owner.`,
  "rankings asset status",
);
migration = migration.replace(
  "Intelligence handoffs, and native V2 Octagon Verdict exporter are finished.",
  "Intelligence handoffs, native V2 Octagon Verdict exporter, and local fighter-asset migration are finished.",
).replace(
  "The next Rankings-adjacent milestones are the routed desktop profile drawer and local fighter-photo ownership.",
  "The desktop profile drawer remains a later Rankings enhancement; the next product milestone is Home personalization and onboarding.",
);
fs.writeFileSync(migrationPath, migration, "utf8");

console.log("Finalized local V2 fighter asset ownership and reconciliation tests.");
