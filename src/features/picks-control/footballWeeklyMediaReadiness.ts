import type { FootballWeeklyContentPackage } from "../home/footballWeeklyContentRepository";

type Sport = "cfb" | "nfl";
type ImageSize = Readonly<{ width: number; height: number }>;

export function expectedFootballEditorialAssetPaths(weekOf: string, sport: Sport) {
  const base = "/assets/football/weekly/" + weekOf + "/" + sport + "/";
  return { spotlight: base + "spotlight.webp", header: base + "game-header.webp" };
}

export async function checkFootballImageDimensions(src: string, expected: ImageSize): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error("Timed out checking the prepared Football image.")), 12000);
    image.onload = () => {
      window.clearTimeout(timer);
      if (image.naturalWidth !== expected.width || image.naturalHeight !== expected.height) {
        reject(new Error("Published Football image has unexpected dimensions: " + src));
      } else resolve();
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("Prepared Football image is not live: " + src));
    };
    image.src = src + "?verify=" + Date.now();
  });
}

export async function verifyFootballWeeklyMedia(
  content: FootballWeeklyContentPackage,
  sport: Sport,
  checkImage: (src: string, expected: ImageSize) => Promise<void> = checkFootballImageDimensions,
  loadSha: () => Promise<string> = async () => {
    const response = await fetch("/deployment.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to verify current deployed version.");
    const raw: unknown = await response.json();
    if (!raw || typeof raw !== "object" || !("sha" in raw) || typeof raw.sha !== "string") {
      throw new Error("Missing deployment verification marker.");
    }
    return raw.sha;
  },
) {
  const expected = expectedFootballEditorialAssetPaths(content.week_of, sport);
  const spotlight = sport === "cfb" ? content.cfb_spotlight : content.nfl_spotlight;
  const game = sport === "cfb" ? content.cfb_game_of_week : content.nfl_game_of_week;
  const production = content.production[sport];
  if (!production || !spotlight || !game) throw new Error("Featured content is not prepared.");
  if (spotlight.photo_asset_path !== expected.spotlight ||
      game.header_asset_path !== expected.header) {
    throw new Error("Football media does not match the selected Tuesday week.");
  }
  const sha = await loadSha();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error("Deployed media commit SHA is invalid.");
  // Fail closed if either real image cannot load or fails its canonical geometry.
  await checkImage(expected.spotlight, { width: 720, height: 900 });
  await checkImage(expected.header, { width: 1600, height: 900 });
  return {
    spotlight_url: "https://octagon.hq-app.workers.dev" + expected.spotlight,
    header_url: "https://octagon.hq-app.workers.dev" + expected.header,
    deployed_sha: sha,
  };
}
