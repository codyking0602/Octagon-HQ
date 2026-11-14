import type { PickEvent, PickHistory } from "../picks/picksModel";
import { pickEventStartsAt } from "../picks/picksModel";
import type { RankingFighter } from "../rankings/rankingModel";

const centralDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function centralCalendarDay(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  const parts = centralDateFormatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return [get("year"), get("month"), get("day")].join("-");
}

type SpotlightBout = PickEvent["bouts"][number] | PickHistory["events"][number]["bouts"][number];
type SpotlightCard = { startsAt: string; bouts: readonly SpotlightBout[] };

export interface EventDayRankedFighter {
  fighter: RankingFighter;
  opponentName: string;
  weightClass: string;
}

/** Match the same canonical slug/ranking identity used by UFC Picks' HQ badges. */
export function rankedUfcEventDaySpotlights(
  event: PickEvent | null,
  history: PickHistory | null,
  fighters: readonly RankingFighter[],
  centralDay: string,
): EventDayRankedFighter[] {
  const activeCard: SpotlightCard | null = event && event.sport !== "football"
    ? { startsAt: pickEventStartsAt(event), bouts: event.bouts }
    : null;
  const cards: SpotlightCard[] = [
    ...(activeCard ? [activeCard] : []),
    ...(history?.events ?? []).map((past) => ({ startsAt: past.startsAt, bouts: past.bouts })),
  ];
  const card = cards.find((candidate) =>
    centralCalendarDay(new Date(candidate.startsAt)) === centralDay
  );
  if (!card) return [];

  const rankedBySlug = new Map(fighters.map((fighter) => [fighter.slug, fighter]));
  const used = new Set<string>();
  const selected: EventDayRankedFighter[] = [];

  for (const bout of [...card.bouts].sort((left, right) => left.position - right.position)) {
    if (bout.resultStatus === "cancelled") continue;
    for (const [slug, opponentName] of [
      [bout.redFighterSlug, bout.blueFighterName],
      [bout.blueFighterSlug, bout.redFighterName],
    ]) {
      if (used.has(slug)) continue;
      const fighter = rankedBySlug.get(slug);
      if (!fighter) continue;
      used.add(slug);
      selected.push({ fighter, opponentName, weightClass: bout.weightClass });
    }
  }
  return selected;
}
