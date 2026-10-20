import { nbaFindLeaderHeadshot } from "./nbaFindTheLeaderModel";
import type { NbaHigherLowerSubject } from "./nbaHigherLowerModel";

/**
 * Player-identified editorial photographs for NBA historical headshots that
 * return a generic gray silhouette with HTTP 200 (so img.onerror never fires).
 *
 * Odom: US Magazine's 2010s Lakers portrait via Yahoo's image CDN.
 * Hardaway: Golden State Warriors Hall-of-Fame portrait (NBA-hosted).
 * Both are independently identified by the publishing articles, not guessed
 * from jersey numbers, positional similarity, or a different player's ID.
 */
export const NBA_HIGHER_LOWER_EDITORIAL_PHOTOS: Readonly<Record<string, string>> = {
  lamarodom: "https://s.yimg.com/lo/mysterio/api/de665c0b6051542112123e980c2cab7ed2d7b4e3be1b299bf45560ba52749b92/lightyear_networkapi/resizefill_w976%3Bquality_80%3Bformat_webp/https%3A/media.zenfs.com/en/us_magazine_896/1ffcd4045a3b62e2c5b8da15cdd5b217",
  timhardaway: "https://cdn.nba.com/teams/uploads/sites/1610612744/2022/09/hardaway-1920.jpg",
};
export function nbaHigherLowerPortraitSource(subject: Pick<NbaHigherLowerSubject,"name"|"nbaId">) {
  const key = subject.name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");
  return NBA_HIGHER_LOWER_EDITORIAL_PHOTOS[key]
    ?? nbaFindLeaderHeadshot(subject);
}
/**
 * Guard against "successful" CDN placeholder images on browsers where canvas
 * inspection is permitted. A real photograph has many different tones; the
 * NBA generic silhouette is predominantly one flat gray. If a CDN blocks
 * canvas reads, keep the loaded photo (do not falsely reject all real players).
 */
export function nbaHigherLowerIsGenericSilhouette(image: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 28;
    canvas.height = 20;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    if (!ctx) return false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let samples = 0, flat = 0;
    for (let index = 0; index < data.length; index += 4) {
      const [r, g, b, a] = [data[index]!,data[index+1]!,data[index+2]!,data[index+3]!];
      if (a < 220) continue;
      samples++;
      if (r >= 125 && r <= 180 && Math.max(r,g,b)-Math.min(r,g,b) <= 7) flat++;
    }
    return samples >= 24 && flat / samples > .82;
  } catch {
    // CDN may not permit cross-origin canvas access; that isn't photo failure.
    return false;
  }
}
