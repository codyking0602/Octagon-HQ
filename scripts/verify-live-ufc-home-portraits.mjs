/**
 * Exact-byte production proof for ALL owner-approved UFC Home-only ESPN portraits.
 * This is separate from canonical thumbnail verification: no thumb or ranking changes.
 */
import fs from "node:fs";
import crypto from "node:crypto";

const manifest = JSON.parse(
  fs.readFileSync("src/features/home/ufcHomeEspnSources.json", "utf8"),
);
const origin = process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://the.hq-app.workers.dev";
if (!/^https:\/\/[a-z0-9.-]+\/?$/.test(origin)) {
  throw new Error("Trusted HTTPS production origin is required");
}

async function verifyExact(path) {
  const expected = fs.readFileSync(path);
  if (expected.length < 12000 || expected.toString("ascii", 0, 4) !== "RIFF"
    || expected.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("Missing or invalid source Home WebP: " + path);
  }
  const url = origin.replace(/\/$/, "") + "/" + path.replace(/^public\//, "");
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const deployed = Buffer.from(await response.arrayBuffer());
      const same = deployed.length === expected.length
        && crypto.timingSafeEqual(
          crypto.createHash("sha256").update(deployed).digest(),
          crypto.createHash("sha256").update(expected).digest(),
        );
      if (!same) throw new Error("Live bytes differ from committed reviewed portrait");
      return;
    } catch (cause) {
      error = cause;
    }
  }
  throw new Error(path + " failed live production verification: " + error.message);
}

const portraits = Object.keys(manifest.sources).sort();
if (portraits.length + manifest.blocked.length !== manifest.rankedTotal
  || portraits.length < 35
  || !portraits.includes("ciryl-gane")
  || !portraits.includes("kayla-harrison")
  || !portraits.includes("amanda-nunes")) {
  throw new Error("Ranked UFC Home portrait source coverage is inconsistent");
}
let next = 0;
let verified = 0;
async function worker() {
  while (next < portraits.length) {
    const slug = portraits[next++];
    await verifyExact("public/assets/fighters/" + slug + ".home.webp");
    verified++;
    console.log("Verified UFC Home " + verified + "/" + portraits.length + ": " + slug);
  }
}
await Promise.all(Array.from({ length: 6 }, () => worker()));
console.log("Verified exact production bytes for ALL " + verified
  + " UFC Home-only ESPN portraits on " + origin
  + "; canonical ranking thumbnails were not touched.");
