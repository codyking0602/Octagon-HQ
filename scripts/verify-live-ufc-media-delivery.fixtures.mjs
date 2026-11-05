import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import {
  isRealWebp, selectedUfcAssets, verifiedSameAsset,
} from "./verify-live-ufc-media-delivery.mjs";

test("live delivery verification selects real fighter files, never traversal or SPA pages", () => {
  const path = "public/assets/fighters/yousri-belgaroui-thumb.webp";
  assert.ok(fs.existsSync(path), "approved source file exists on current release");
  const got = selectedUfcAssets([path, path, "../escape-thumb.webp", "public/assets/fighters/not-here-thumb.webp"]);
  assert.ok(got.includes(path));
  assert.ok(got.includes("public/assets/fighters/cesar-almeida-thumb.webp"));
  assert.ok(!got.some((v) => v.includes("escape") || v.includes("not-here")));
});

test("live delivery fails closed on HTML fallback or changed WebP bytes", () => {
  const original = Buffer.alloc(2048, 0);
  original.write("RIFF", 0, "ascii");
  original.writeUInt32LE(2040, 4);
  original.write("WEBP", 8, "ascii");
  assert.ok(isRealWebp(original));
  assert.ok(verifiedSameAsset(original, Buffer.from(original)));
  const tampered = Buffer.from(original);
  tampered[90] = 1;
  assert.equal(verifiedSameAsset(original, tampered), false);
  assert.equal(verifiedSameAsset(original, Buffer.from("<html>fallback</html>")), false);
  assert.equal(isRealWebp(Buffer.from("RIFF WEBP")), false);
});
