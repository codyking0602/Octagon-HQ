import type { NotificationItem } from "./notificationModel";

function isFootballRecap(item: Pick<NotificationItem, "title" | "summary">) {
  return /\b(football|ats|nfl|cfb|week)\b/i.test(`${item.title} ${item.summary}`);
}

/**
 * Keeps already-cached recap notifications useful while the backend repair reaches
 * every device. The destination still resolves through the canonical Picks archive.
 */
export function notificationDestination(
  item: Pick<NotificationItem, "kind" | "route" | "title" | "summary"> & Partial<Pick<NotificationItem, "aggregationKey">>,
): string | null {
  if (item.kind === "football_gotw_starting") {
    // Existing bell items still point at /football. The source key identifies
    // the actual published week and league, even after the next week begins.
    if (item.route?.startsWith("/football/gotw?")) return item.route;
    const match = /^football-gotw-starting:(\\d{4}-\\d{2}-\\d{2}):(nfl|cfb)$/.exec(item.aggregationKey ?? "");
    const league = match?.[2] ?? (/^NFL\\b/i.test(item.title) ? "nfl" : /^CFB\\b/i.test(item.title) ? "cfb" : null);
    if (league) return `/football/gotw?league=${league}${match ? `&week=${match[1]}` : ""}`;
  }

  if (item.kind === "picks_recap_ready") {
    if (item.route?.startsWith("/football/picks")) {
      if (item.route.includes("view=recap")) return item.route;
      return `${item.route}${item.route.includes("?") ? "&" : "?"}view=recap`;
    }

    if (!item.route || item.route === "/picks") {
      return isFootballRecap(item) ? "/football/picks?view=recap" : "/picks?view=recap";
    }
  }

  return item.route;
}
