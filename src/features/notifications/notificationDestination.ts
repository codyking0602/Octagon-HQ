import type { NotificationItem } from "./notificationModel";

function isFootballRecap(item: Pick<NotificationItem, "title" | "summary">) {
  return /\b(football|ats|nfl|cfb|week)\b/i.test(`${item.title} ${item.summary}`);
}

/**
 * Keeps already-cached recap notifications useful while the backend repair reaches
 * every device. The destination still resolves through the canonical Picks archive.
 */
export function notificationDestination(
  item: Pick<NotificationItem, "kind" | "route" | "title" | "summary">,
): string | null {
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
