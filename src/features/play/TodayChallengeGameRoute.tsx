import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import OfficialTodayChallengePage from "./OfficialTodayChallengePage";
import type { DailyGameType } from "./todaysChallengeAdapters";

export function isOfficialDailyRoute(gameType: DailyGameType, search: string) {
  const params = new URLSearchParams(search);
  if (params.get("mode") === "daily") return true;
  if (gameType !== "find_leader") return false;

  return !params.get("mode")
    && !params.get("challenge")
    && !params.get("match")
    && !params.get("day")
    && !params.get("definition")
    && !params.get("seed");
}

export default function TodayChallengeGameRoute({
  gameType,
  casual,
}: {
  gameType: DailyGameType;
  casual: ReactElement;
}) {
  const location = useLocation();
  return isOfficialDailyRoute(gameType, location.search)
    ? <OfficialTodayChallengePage expectedGameType={gameType} />
    : casual;
}
