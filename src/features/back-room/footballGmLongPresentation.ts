import type { NflGmLongCoach } from "./footballGmLongCoaches";
import type { NflGmLongSlot } from "./footballGmLongFoundation";

export interface NflGmLongFitPlayer {
  name: string;
  slot: NflGmLongSlot;
  grade: number;
  age: number | null;
}
export interface NflGmLongFitEffects {
  passingMatchupPct: number;
  rushingMatchupPct: number;
  pressurePct: number;
  coveragePct: number;
  developmentOpportunityPct: number;
  chemistryResiliencePct: number;
}

/** The pointer is at 12 o'clock. Each coach owns a complete equal-sized sector. */
export function nflGmLongCoachPointerRotation(current: number, index: number, count: number, spins = 4) {
  if (!Number.isInteger(index) || !Number.isInteger(count) || index < 0 || count < 1 || index >= count) {
    throw new Error("Invalid coaching-wheel segment.");
  }
  const slice = 360 / count;
  const desired = (((-(index + 0.5) * slice) % 360) + 360) % 360;
  const currentMod = ((current % 360) + 360) % 360;
  return current + spins * 360 + ((desired - currentMod + 360) % 360);
}

/** Explanations come from the same roster-specific effects used by the forecast. */
export function nflGmLongCoachFit(
  coach: NflGmLongCoach,
  roster: readonly NflGmLongFitPlayer[],
  effects: NflGmLongFitEffects,
) {
  const bySlot = (slot: NflGmLongSlot) => roster.find(player => player.slot === slot);
  const bestName = (slots: readonly NflGmLongSlot[]) =>
    roster.filter(player => slots.includes(player.slot))
      .sort((a, b) => b.grade - a.grade)[0]?.name ?? "your starters";
  const youth = roster.filter(player => player.age != null && player.age <= 26);
  const youngName = youth.sort((a, b) => b.grade - a.grade)[0]?.name;
  const influences = [
    { key: "passing", value: effects.passingMatchupPct, label: "Passing matchups" },
    { key: "rushing", value: effects.rushingMatchupPct, label: "Run game" },
    { key: "pressure", value: effects.pressurePct, label: "Pass rush" },
    { key: "coverage", value: effects.coveragePct, label: "Coverage" },
    { key: "development", value: effects.developmentOpportunityPct, label: "Player development" },
    { key: "culture", value: effects.chemistryResiliencePct, label: "Roster stability" },
  ] as const;
  const realized = [...influences].filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  const top = realized[0]?.key ?? "culture";
  const qb = bySlot("QB")?.name ?? "your quarterback";
  const ol = bySlot("OL")?.name ?? "your offensive line";
  const phrases: Record<typeof top, { headline: string; detail: string }> = {
    passing: {
      headline: "Passing-game fit",
      detail: `${coach.name}'s approach gives ${qb} and the receiving group more favorable passing matchups, with ${ol} helping set the platform.`,
    },
    rushing: {
      headline: "Run-game fit",
      detail: `${coach.name}'s rushing concepts make ${bestName(["RB"])} and ${ol} important pieces of this offense.`,
    },
    pressure: {
      headline: "Front-seven fit",
      detail: `${coach.name}'s pressure approach leans on ${bestName(["DL", "LB"])} to disrupt opposing quarterbacks.`,
    },
    coverage: {
      headline: "Secondary fit",
      detail: `${coach.name}'s coverage approach is best positioned to use ${bestName(["DB", "DB2"])} and the rest of your secondary.`,
    },
    development: {
      headline: "Young-core development fit",
      detail: youngName
        ? `${coach.name}'s developmental approach gives young talent such as ${youngName} more opportunities to improve; it does not change their ability ceilings.`
        : `${coach.name}'s development focus has limited immediate application to this more veteran roster.`,
    },
    culture: {
      headline: "Roster-stability fit",
      detail: `${coach.name}'s leadership approach is most valuable for keeping this roster steady through transitions and close-game pressure.`,
    },
  };
  const strength = phrases[top];
  const impactLabels = realized.slice(0, 2).map(item => item.label);
  return {
    headline: strength.headline,
    explanation: strength.detail,
    limitation: coach.limitation,
    influences: impactLabels,
  };
}

export function nflGmLongYearTwoCapOverage(projectedSpend: number, cap: number) {
  return Math.max(0, projectedSpend - cap);
}
