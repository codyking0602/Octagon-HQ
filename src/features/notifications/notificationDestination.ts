import type { NotificationItem } from "./notificationModel";

/**
 * Keeps already-cached recap notifications useful while the backend repair reaches
 * every device. The destination still resolves through the canonical Picks archive.
 */
export function notificationDestination(
  item: Pick<NotificationItem, "kind" | "route">,
): string | null {
  if (
    item.kind === "picks_recap_ready"
    && (!item.route || item.route === "/picks")
  ) {
    return "/picks?view=recap";
  }

  return item.route;
}
