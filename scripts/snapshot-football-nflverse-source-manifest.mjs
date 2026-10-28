import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const REPOSITORY = "nflverse/nflverse-data";
const DATA_REPO_COMMIT = "9037aa840b8ff96ab3340d4c8a6daa403eed65f4";
const NFLREADR_COMMIT = "d072c08492067b578f27e562b6cc9c9e3b8589c3";
const LICENSE = "CC BY 4.0";
const SEASONS = Array.from({ length: 27 }, (_, index) => 1999 + index);
const OUTPUT = "public/data/football/nfl/historical-player-team-seasons.source-manifest.json";

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "Octagon-HQ-NFL-source-snapshot",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub source snapshot failed: ${response.status} ${response.statusText} (${url})`);
  return response.json();
}

async function getBytes(url) {
  const response = await fetch(url, { headers: { "user-agent": "Octagon-HQ-NFL-source-snapshot" } });
  if (!response.ok) throw new Error(`NFL source download failed: ${response.status} ${response.statusText} (${url})`);
  return Buffer.from(await response.arrayBuffer());
}

function expectedName(kind, season) {
  return `stats_${kind}_reg_${season}.csv`;
}

function normalizeAsset(asset) {
  if (!asset.digest?.startsWith("sha256:")) throw new Error(`NFL source asset ${asset.name} is missing a SHA-256 digest.`);
  return {
    season: Number(asset.name.match(/_(\d{4})\.csv$/)?.[1]),
    assetId: asset.id,
    name: asset.name,
    bytes: asset.size,
    sha256: asset.digest.slice("sha256:".length),
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    url: asset.browser_download_url,
  };
}

async function snapshotRelease(kind, tag) {
  const release = await getJson(`https://api.github.com/repos/${REPOSITORY}/releases/tags/${tag}`);
  const assets = SEASONS.map((season) => {
    const name = expectedName(kind, season);
    const matches = release.assets.filter((asset) => asset.name === name);
    if (matches.length !== 1) throw new Error(`Expected exactly one ${name}; found ${matches.length}.`);
    return normalizeAsset(matches[0]);
  });

  const latest = assets.at(-1);
  const bytes = await getBytes(latest.url);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== latest.bytes) throw new Error(`${latest.name} byte-size mismatch while capturing schema.`);
  if (digest !== latest.sha256) throw new Error(`${latest.name} SHA-256 mismatch while capturing schema.`);
  const header = bytes.toString("utf8").split(/\r?\n/, 1)[0].split(",");

  return {
    releaseTag: tag,
    releaseId: release.id,
    releaseName: release.name,
    releaseUpdatedAt: release.updated_at,
    summaryLevel: "reg",
    format: "csv",
    seasonStart: SEASONS[0],
    seasonEnd: SEASONS.at(-1),
    seasonCount: SEASONS.length,
    latestSchemaSeason: latest.season,
    latestSchemaColumns: header,
    assets,
  };
}

const players = await snapshotRelease("player", "stats_player");
const teams = await snapshotRelease("team", "stats_team");
const manifest = {
  schemaVersion: 1,
  league: "NFL",
  provider: "nflverse",
  repository: REPOSITORY,
  dataRepositoryCommit: DATA_REPO_COMMIT,
  nflreadrCommit: NFLREADR_COMMIT,
  license: LICENSE,
  licensePath: "LICENSE.md",
  termsNote: "nflverse distributes repository data under CC BY 4.0; preserve attribution and source provenance.",
  seasonStart: SEASONS[0],
  seasonEnd: SEASONS.at(-1),
  seasonCount: SEASONS.length,
  players,
  teams,
  generatedBy: "scripts/snapshot-football-nflverse-source-manifest.mjs",
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Pinned ${players.assets.length} NFL player and ${teams.assets.length} NFL team regular-season assets.`);
console.log(`Player release ${players.releaseId}; team release ${teams.releaseId}.`);
