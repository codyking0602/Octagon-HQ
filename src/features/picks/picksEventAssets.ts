export interface PickEventPoster {
  src: string;
  aspectRatio: string;
}

interface PosterEvent {
  bouts: readonly {
    position: number;
    redFighterSlug: string;
    blueFighterSlug: string;
  }[];
}

const posterByMainEvent: Readonly<Record<string, PickEventPoster>> = {
  "daniel-rodriguez:uros-medic": {
    src: "/events/ufc-fight-night-belgrade.svg",
    aspectRatio: "480 / 321",
  },
  "mateusz-gamrot:quillan-salkilld": {
    src: "/events/ufc-fight-night-gamrot-salkilld.svg",
    aspectRatio: "480 / 221",
  },
  "ian-machado-garry:islam-makhachev": {
    src: "https://www.xfinitymobilearena.com/assets/img/1440x535-be7725b165.png",
    aspectRatio: "760 / 377",
  },
};

function mainEventKey(event: PosterEvent) {
  const bout = event.bouts.slice().sort((left, right) => left.position - right.position)[0];
  if (!bout) return null;
  return [bout.redFighterSlug, bout.blueFighterSlug].sort().join(":");
}

export function pickEventPoster(event: PosterEvent | null): PickEventPoster | null {
  if (!event) return null;
  const key = mainEventKey(event);
  return key ? posterByMainEvent[key] ?? null : null;
}
