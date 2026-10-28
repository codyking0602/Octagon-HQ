/**
 * Player Spotlight links open the clip itself on YouTube, never a publisher's
 * article, third-party player, search results, or a lookalike hostname.
 */
export function isYouTubeVideoUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;

  const videoPath = /^\/[a-z0-9_-]+\/?$/i;
  if (url.hostname === "youtu.be") return videoPath.test(url.pathname);

  if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) return false;
  if (url.pathname === "/watch") return /^[a-z0-9_-]+$/i.test(url.searchParams.get("v") ?? "");
  return /^\/(shorts|live|embed)\/[a-z0-9_-]+\/?$/i.test(url.pathname);
}
