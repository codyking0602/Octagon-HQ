import type { PickEvent } from "./picksModel";

export interface PickEventPoster {
  src: string;
  aspectRatio: string;
}

const posterByMainEvent: Readonly<Record<string, PickEventPoster>> = {
  "daniel-rodriguez:uros-medic": {
    src: "/events/ufc-fight-night-belgrade.svg",
    aspectRatio: "480 / 321",
  },
};

function mainEventKey(event: PickEvent) {
  const bout = event.bouts.slice().sort((left, right) => left.position - right.position)[0];
  if (!bout) return null;
  return [bout.redFighterSlug, bout.blueFighterSlug].sort().join(":");
}

export function pickEventPoster(event: PickEvent | null): PickEventPoster | null {
  if (!event) return null;
  const key = mainEventKey(event);
  return key ? posterByMainEvent[key] ?? null : null;
}
