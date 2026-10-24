import { SPORT_ORDER, type SelectedSport, type HomeSport } from "./SportProvider";
import type { NotificationPushSports } from "../features/notifications/notificationModel";

/** Only enabled push SPORTS affect ordering; device delivery being off is
 * irrelevant. Unknown/loading preferences preserve the stable default. */
export function prioritizedSports(push: NotificationPushSports | null | undefined): SelectedSport[] {
  if (!push) return [...SPORT_ORDER];
  return [...SPORT_ORDER.filter(s => push[s]), ...SPORT_ORDER.filter(s => !push[s])];
}

/** Home is frozen. All Sports intentionally follows last activity across Picks/Play. */
export function entrySport(home: HomeSport, lastUsed: SelectedSport): SelectedSport {
  return home === "all" ? lastUsed : home;
}

export function sportsForDisplay(order: readonly SelectedSport[], showMlb: boolean, showNba: boolean) {
  return order.filter(s => (showMlb || s !== "mlb") && (showNba || s !== "nba"));
}

export const sportNames: Record<SelectedSport, string> = {
  football: "Football", ufc: "UFC", nba: "Basketball", mlb: "MLB",
};
