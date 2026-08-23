import { shareCanonicalDestination, type NativeShareOutcome, type NativeShareRuntime } from "../../app/nativeShare";
import type { PlaySport } from "./playRegistry";

const DAILY_ROUTES = {
  ufc: "/play",
  football: "/back-room/football/today",
} as const satisfies Record<PlaySport, string>;

export function dailyChallengeShareContent({
  sport,
  score,
  centralDay,
}: {
  sport: PlaySport;
  score: number;
  centralDay: string;
}) {
  const label = sport === "football" ? "Football Daily" : "Octagon HQ Daily";
  return {
    title: `${label} · ${centralDay}`,
    text: `${label} ${centralDay}\n${score}/100 · Can you beat my official score?`,
    route: DAILY_ROUTES[sport],
  };
}

export function shareDailyChallengeResult(
  result: { sport: PlaySport; score: number; centralDay: string },
  runtime?: NativeShareRuntime,
): Promise<NativeShareOutcome> {
  const content = dailyChallengeShareContent(result);
  return shareCanonicalDestination({
    destination: { kind: "daily-challenge", sport: result.sport },
    title: content.title,
    text: content.text,
    fallbackText: content.text,
  }, runtime);
}
