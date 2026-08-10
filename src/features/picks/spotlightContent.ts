import type { PickSpotlight, PickSpotlightFighter } from "./spotlightModel";

export interface SpotlightStatsFighter {
  fighterSlug: string;
  name: string;
  record: string;
  dob: string | null;
  height: string;
  reach: string;
  stance: string;
  slpm: number | null;
  strikingAccuracy: number | null;
  sapm: number | null;
  strikingDefense: number | null;
  takedownAverage: number | null;
  takedownAccuracy: number | null;
  takedownDefense: number | null;
  submissionAverage: number | null;
}

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function decimal(value: number) {
  return value.toFixed(1);
}

function reachInches(value: string) {
  const match = value.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function ageAt(dob: string | null, eventStartsAt: string) {
  if (!dob) return "--";
  const birth = new Date(`${dob}T00:00:00Z`);
  const event = new Date(eventStartsAt);
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(event.getTime())) return "--";
  let age = event.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = event.getUTCMonth() < birth.getUTCMonth()
    || (event.getUTCMonth() === birth.getUTCMonth() && event.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 18 && age <= 60 ? String(age) : "--";
}

function advantageEdges(fighter: SpotlightStatsFighter, opponent: SpotlightStatsFighter) {
  const edges: Array<{ score: number; text: string }> = [];
  const fighterReach = reachInches(fighter.reach);
  const opponentReach = reachInches(opponent.reach);

  if (finite(fighterReach) && finite(opponentReach) && fighterReach - opponentReach >= 1.5) {
    const edge = fighterReach - opponentReach;
    edges.push({ score: edge / 4, text: `${edge.toFixed(edge % 1 ? 1 : 0)}\" reach advantage` });
  }
  if (finite(fighter.slpm) && finite(opponent.slpm) && fighter.slpm - opponent.slpm >= 0.45) {
    edges.push({ score: (fighter.slpm - opponent.slpm) / 2, text: `${decimal(fighter.slpm)} significant strikes landed/min` });
  }
  if (finite(fighter.strikingAccuracy) && finite(opponent.strikingAccuracy) && fighter.strikingAccuracy - opponent.strikingAccuracy >= 5) {
    edges.push({ score: (fighter.strikingAccuracy - opponent.strikingAccuracy) / 20, text: `${pct(fighter.strikingAccuracy)} striking accuracy` });
  }
  if (finite(fighter.strikingDefense) && finite(opponent.strikingDefense) && fighter.strikingDefense - opponent.strikingDefense >= 5) {
    edges.push({ score: (fighter.strikingDefense - opponent.strikingDefense) / 20, text: `${pct(fighter.strikingDefense)} striking defense` });
  }
  if (finite(fighter.takedownAverage) && finite(opponent.takedownAverage) && fighter.takedownAverage - opponent.takedownAverage >= 0.6) {
    edges.push({ score: (fighter.takedownAverage - opponent.takedownAverage) / 2, text: `${decimal(fighter.takedownAverage)} takedowns per 15 min` });
  }
  if (finite(fighter.takedownAccuracy) && finite(opponent.takedownAccuracy) && fighter.takedownAccuracy - opponent.takedownAccuracy >= 8) {
    edges.push({ score: (fighter.takedownAccuracy - opponent.takedownAccuracy) / 25, text: `${pct(fighter.takedownAccuracy)} takedown accuracy` });
  }
  if (finite(fighter.takedownDefense) && finite(opponent.takedownDefense) && fighter.takedownDefense - opponent.takedownDefense >= 8) {
    edges.push({ score: (fighter.takedownDefense - opponent.takedownDefense) / 25, text: `${pct(fighter.takedownDefense)} takedown defense` });
  }
  if (finite(fighter.submissionAverage) && finite(opponent.submissionAverage) && fighter.submissionAverage - opponent.submissionAverage >= 0.4) {
    edges.push({ score: (fighter.submissionAverage - opponent.submissionAverage) / 1.5, text: `${decimal(fighter.submissionAverage)} submission attempts per 15 min` });
  }
  if (finite(fighter.sapm) && finite(opponent.sapm) && opponent.sapm - fighter.sapm >= 0.6) {
    edges.push({ score: (opponent.sapm - fighter.sapm) / 2, text: `Absorbs only ${decimal(fighter.sapm)} significant strikes/min` });
  }

  edges.sort((left, right) => right.score - left.score);
  const selected = edges.slice(0, 3).map((edge) => edge.text);

  const fillers = [
    finite(fighter.takedownDefense) && fighter.takedownDefense >= 70 ? `${pct(fighter.takedownDefense)} takedown defense` : null,
    finite(fighter.slpm) && fighter.slpm >= 4 ? `${decimal(fighter.slpm)} significant strikes landed/min` : null,
    finite(fighter.takedownAverage) && fighter.takedownAverage >= 2 ? `${decimal(fighter.takedownAverage)} takedowns per 15 min` : null,
    finite(fighter.submissionAverage) && fighter.submissionAverage >= 0.8 ? `${decimal(fighter.submissionAverage)} submission attempts per 15 min` : null,
    finite(fighter.strikingDefense) ? `${pct(fighter.strikingDefense)} striking defense` : null,
  ].filter((value): value is string => Boolean(value));

  for (const filler of fillers) {
    if (selected.length >= 3) break;
    if (!selected.includes(filler)) selected.push(filler);
  }
  return selected.slice(0, 3);
}

function primaryProfile(fighter: SpotlightStatsFighter) {
  const striking = finite(fighter.slpm) ? fighter.slpm / 4.5 : 0;
  const wrestling = finite(fighter.takedownAverage) ? fighter.takedownAverage / 2.2 : 0;
  const submission = finite(fighter.submissionAverage) ? fighter.submissionAverage / 0.8 : 0;
  if (wrestling >= striking && wrestling >= submission && wrestling >= 0.9) {
    return `a ${decimal(fighter.takedownAverage!)}-takedown-per-15 wrestling pace`;
  }
  if (submission > striking && submission >= 1) {
    return `${decimal(fighter.submissionAverage!)} submission attempts per 15 minutes`;
  }
  if (finite(fighter.slpm)) {
    return `${decimal(fighter.slpm)} significant strikes landed per minute`;
  }
  return "a balanced UFCStats profile";
}

function comparisonSentence(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  const redReach = reachInches(red.reach);
  const blueReach = reachInches(blue.reach);
  const facts: string[] = [];

  if (finite(redReach) && finite(blueReach) && Math.abs(redReach - blueReach) >= 1.5) {
    const longer = redReach > blueReach ? red : blue;
    facts.push(`${longer.name} owns the longer reach at ${longer.reach}`);
  }
  if (finite(red.takedownDefense) && finite(blue.takedownDefense)) {
    const better = red.takedownDefense >= blue.takedownDefense ? red : blue;
    facts.push(`${better.name} carries the stronger takedown-defense rate at ${pct(better.takedownDefense!)}`);
  }
  if (finite(red.strikingAccuracy) && finite(blue.strikingAccuracy)) {
    const cleaner = red.strikingAccuracy >= blue.strikingAccuracy ? red : blue;
    facts.push(`${cleaner.name} has the better striking-accuracy mark at ${pct(cleaner.strikingAccuracy!)}`);
  }

  return facts.length
    ? `${facts.slice(0, 2).join(", while ")}.`
    : "Their UFCStats profiles are close enough that the matchup is more about who imposes the preferred phase first.";
}

function fighterPackage(
  fighter: SpotlightStatsFighter,
  opponent: SpotlightStatsFighter,
  eventStartsAt: string,
): PickSpotlightFighter {
  return {
    fighterSlug: fighter.fighterSlug,
    record: fighter.record || "--",
    age: ageAt(fighter.dob, eventStartsAt),
    height: fighter.height || "--",
    reach: fighter.reach || "--",
    stance: fighter.stance || "--",
    edges: advantageEdges(fighter, opponent),
  };
}

export function buildPickSpotlightContent(input: {
  boutId: string;
  eventStartsAt: string;
  red: SpotlightStatsFighter;
  blue: SpotlightStatsFighter;
  generatedAt?: string;
}): PickSpotlight {
  const redProfile = primaryProfile(input.red);
  const blueProfile = primaryProfile(input.blue);
  return {
    boutId: input.boutId,
    preview: `${input.red.name} enters with ${redProfile}; ${input.blue.name} answers with ${blueProfile}. ${comparisonSentence(input.red, input.blue)}`,
    red: fighterPackage(input.red, input.blue, input.eventStartsAt),
    blue: fighterPackage(input.blue, input.red, input.eventStartsAt),
    watchSpotlights: [],
    source: "UFCStats",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
