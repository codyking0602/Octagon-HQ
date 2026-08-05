import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";

const fighterSlugs = [
  "al-iaquinta",
  "anthony-smith",
  "bo-nickal",
  "brian-ortega",
  "calvin-kattar",
  "cat-zingano",
  "ciryl-gane",
  "claudia-gadelha",
  "curtis-blaydes",
  "cynthia-calvillo",
  "dan-hardy",
  "dan-ige",
  "derek-brunson",
  "dominick-reyes",
  "edmen-shahbazyan",
  "felice-herrig",
  "gilbert-burns",
  "james-vick",
  "jared-vanderaa",
  "johnny-walker",
  "joseph-benavidez",
  "josh-emmett",
  "joshua-culibao",
  "katlyn-chookagian",
  "kenny-florian",
  "kris-moutinho",
  "lauren-murphy",
  "marlon-moraes",
  "marvin-vettori",
  "megan-anderson",
  "michael-johnson",
  "mickey-gall",
  "mike-jackson",
  "ovince-saint-preux",
  "patrick-cummins",
  "randa-markos",
  "raul-rosas-jr",
  "roy-nelson",
  "ryan-bader",
  "sara-mcmann",
  "sean-sherk",
  "stefan-struve",
  "tony-kelley",
  "uriah-hall",
  "volkan-oezdemir",
  "yair-rodriguez",
] as const;

const canvasSize = 160;
const targetForegroundHeight = 168;
const maximumForegroundWidth = 176;
const topOffset = 4;

interface AlphaBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

async function alphaBounds(input: Buffer): Promise<AlphaBounds> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alphaIndex = info.channels - 1;
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + alphaIndex];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) throw new Error("Thumbnail has no visible fighter pixels");
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function repairThumbnail(source: Buffer): Promise<Buffer> {
  const bounds = await alphaBounds(source);
  const scale = Math.min(
    targetForegroundHeight / bounds.height,
    maximumForegroundWidth / bounds.width,
  );
  const resizedWidth = Math.max(1, Math.round(bounds.width * scale));
  const resizedHeight = Math.max(1, Math.round(bounds.height * scale));
  const resized = await sharp(source)
    .extract(bounds)
    .resize(resizedWidth, resizedHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen(0.7)
    .png()
    .toBuffer();

  const desiredLeft = Math.round((canvasSize - resizedWidth) / 2);
  const desiredTop = topOffset;
  const cropLeft = Math.max(0, -desiredLeft);
  const cropTop = Math.max(0, -desiredTop);
  const visibleLeft = Math.max(0, desiredLeft);
  const visibleTop = Math.max(0, desiredTop);
  const visibleWidth = Math.min(resizedWidth - cropLeft, canvasSize - visibleLeft);
  const visibleHeight = Math.min(resizedHeight - cropTop, canvasSize - visibleTop);
  const visible = await sharp(resized)
    .extract({ left: cropLeft, top: cropTop, width: visibleWidth, height: visibleHeight })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: visible, left: visibleLeft, top: visibleTop }])
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toBuffer();
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

async function comparisonTile(slug: string, original: Buffer, repaired: Buffer): Promise<Buffer> {
  const oldPng = await sharp(original).flatten({ background: "#050505" }).png().toBuffer();
  const newPng = await sharp(repaired).flatten({ background: "#050505" }).png().toBuffer();
  const svg = Buffer.from(`
    <svg width="370" height="215" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="362" height="207" rx="12" fill="#161616" stroke="#333333"/>
      <text x="12" y="21" fill="#f3f3f3" font-family="Arial" font-size="13">${escapeXml(slug)}</text>
      <text x="12" y="39" fill="#999999" font-family="Arial" font-size="11">OLD</text>
      <text x="194" y="39" fill="#29ef78" font-family="Arial" font-size="11">NEW</text>
    </svg>
  `);
  return sharp(svg)
    .composite([
      { input: oldPng, left: 12, top: 43 },
      { input: newPng, left: 194, top: 43 },
    ])
    .png()
    .toBuffer();
}

describe("temporary Play thumbnail framing generator", () => {
  it("produces a reviewable, full-card crop for all 46 repaired thumbnails", async () => {
    const proofDirectory = path.join(
      process.env.RUNNER_TEMP ?? "/tmp",
      "todays-challenge-phone-proof",
    );
    await mkdir(proofDirectory, { recursive: true });
    const tiles: Buffer[] = [];

    for (const slug of fighterSlugs) {
      const assetPath = path.resolve(
        process.cwd(),
        "public",
        "assets",
        "fighters",
        `${slug}-thumb.webp`,
      );
      const original = await readFile(assetPath);
      const repaired = await repairThumbnail(original);
      const bounds = await alphaBounds(repaired);

      expect(bounds.top, `${slug} top headroom`).toBeLessThanOrEqual(6);
      expect(bounds.height, `${slug} foreground height`).toBeGreaterThanOrEqual(150);
      expect(bounds.width, `${slug} foreground width`).toBeGreaterThanOrEqual(70);
      expect(repaired.byteLength, `${slug} encoded quality`).toBeGreaterThan(4_000);

      await writeFile(assetPath, repaired);
      await writeFile(path.join(proofDirectory, `asset-${slug}.png`), repaired);
      tiles.push(await comparisonTile(slug, original, repaired));
    }

    const columns = 4;
    const tileWidth = 370;
    const tileHeight = 215;
    const rows = Math.ceil(tiles.length / columns);
    const composites = tiles.map((input, index) => ({
      input,
      left: (index % columns) * tileWidth,
      top: Math.floor(index / columns) * tileHeight,
    }));
    const sheet = await sharp({
      create: {
        width: columns * tileWidth,
        height: rows * tileHeight,
        channels: 3,
        background: "#050505",
      },
    })
      .composite(composites)
      .png()
      .toBuffer();
    await writeFile(path.join(proofDirectory, "play-thumbnail-comparison.png"), sheet);

    expect(fighterSlugs).toHaveLength(46);
    expect(tiles).toHaveLength(46);
  }, 120_000);
});
