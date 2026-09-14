import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "data/generated/football/who-am-i-daily-universes.json");

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { getFootballWhoAmIUniverse } = await server.ssrLoadModule(
    "/src/features/games/footballWhoAmIAuthority.ts",
  );

  const universe = (league) => {
    const source = getFootballWhoAmIUniverse(league);
    return {
      sport: source.sport,
      league: source.league,
      candidates: source.candidates.map((candidate) => ({
        ...candidate,
        clues: candidate.clues.map((clue) => ({ ...clue })),
      })),
    };
  };

  const payload = {
    version: "football-who-am-i-daily-universes-v1",
    universes: {
      NFL: universe("NFL"),
      CFB: universe("CFB"),
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload));
  console.log(
    `Generated lightweight Football Who Am I Daily universes: NFL ${payload.universes.NFL.candidates.length}, CFB ${payload.universes.CFB.candidates.length}.`,
  );
} finally {
  await server.close();
}
