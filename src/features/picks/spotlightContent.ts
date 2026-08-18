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

type FightStyle = "striking" | "wrestling" | "submission" | "balanced";

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
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
    edges.push({ score: (fighterReach - opponentReach) / 4, text: "Range and length" });
  }
  if (finite(fighter.slpm) && finite(opponent.slpm) && fighter.slpm - opponent.slpm >= 0.45) {
    edges.push({ score: (fighter.slpm - opponent.slpm) / 2, text: "High-volume striking" });
  }
  if (
    finite(fighter.strikingAccuracy)
    && finite(opponent.strikingAccuracy)
    && fighter.strikingAccuracy - opponent.strikingAccuracy >= 5
  ) {
    edges.push({ score: (fighter.strikingAccuracy - opponent.strikingAccuracy) / 20, text: "Efficient striking" });
  }
  if (
    finite(fighter.strikingDefense)
    && finite(opponent.strikingDefense)
    && fighter.strikingDefense - opponent.strikingDefense >= 5
  ) {
    edges.push({ score: (fighter.strikingDefense - opponent.strikingDefense) / 20, text: "Defensive striking" });
  }
  if (
    finite(fighter.takedownAverage)
    && finite(opponent.takedownAverage)
    && fighter.takedownAverage - opponent.takedownAverage >= 0.6
  ) {
    edges.push({
      score: (fighter.takedownAverage - opponent.takedownAverage) / 2,
      text: fighter.takedownAverage >= 4 ? "Relentless takedown pressure" : "Wrestling pressure",
    });
  }
  if (
    finite(fighter.takedownAccuracy)
    && finite(opponent.takedownAccuracy)
    && fighter.takedownAccuracy - opponent.takedownAccuracy >= 8
  ) {
    edges.push({ score: (fighter.takedownAccuracy - opponent.takedownAccuracy) / 25, text: "Efficient takedowns" });
  }
  if (
    finite(fighter.takedownDefense)
    && finite(opponent.takedownDefense)
    && fighter.takedownDefense - opponent.takedownDefense >= 8
  ) {
    edges.push({ score: (fighter.takedownDefense - opponent.takedownDefense) / 25, text: "Takedown resistance" });
  }
  if (
    finite(fighter.submissionAverage)
    && finite(opponent.submissionAverage)
    && fighter.submissionAverage - opponent.submissionAverage >= 0.4
  ) {
    edges.push({ score: (fighter.submissionAverage - opponent.submissionAverage) / 1.5, text: "Submission threat" });
  }
  if (finite(fighter.sapm) && finite(opponent.sapm) && opponent.sapm - fighter.sapm >= 0.6) {
    edges.push({ score: (opponent.sapm - fighter.sapm) / 2, text: "Damage avoidance" });
  }

  edges.sort((left, right) => right.score - left.score);
  const selected = edges.slice(0, 3).map((edge) => edge.text);

  const fillers = [
    finite(fighter.takedownDefense)
      && fighter.takedownDefense >= 70
      && (!finite(opponent.takedownDefense) || fighter.takedownDefense >= opponent.takedownDefense)
      ? "Takedown resistance"
      : null,
    finite(fighter.slpm)
      && fighter.slpm >= 4.5
      && (!finite(opponent.slpm) || fighter.slpm >= opponent.slpm)
      ? "High-volume striking"
      : null,
    finite(fighter.takedownAverage)
      && fighter.takedownAverage >= 2
      && (!finite(opponent.takedownAverage) || fighter.takedownAverage >= opponent.takedownAverage)
      ? fighter.takedownAverage >= 4 ? "Relentless takedown pressure" : "Wrestling pressure"
      : null,
    finite(fighter.submissionAverage)
      && fighter.submissionAverage >= 0.8
      && (!finite(opponent.submissionAverage) || fighter.submissionAverage >= opponent.submissionAverage)
      ? "Submission threat"
      : null,
    finite(fighter.strikingAccuracy)
      && fighter.strikingAccuracy >= 50
      && (!finite(opponent.strikingAccuracy) || fighter.strikingAccuracy >= opponent.strikingAccuracy)
      ? "Efficient striking"
      : null,
    finite(fighter.strikingDefense)
      && fighter.strikingDefense >= 55
      && (!finite(opponent.strikingDefense) || fighter.strikingDefense >= opponent.strikingDefense)
      ? "Defensive striking"
      : null,
  ].filter((value): value is string => Boolean(value));

  for (const filler of fillers) {
    if (selected.length >= 3) break;
    if (!selected.includes(filler)) selected.push(filler);
  }
  return selected.slice(0, 3);
}

function primaryStyle(fighter: SpotlightStatsFighter): FightStyle {
  const striking = finite(fighter.slpm) ? fighter.slpm / 4.5 : 0;
  const wrestling = finite(fighter.takedownAverage) ? fighter.takedownAverage / 2.2 : 0;
  const submission = finite(fighter.submissionAverage) ? fighter.submissionAverage / 0.8 : 0;
  const strongest = Math.max(striking, wrestling, submission);

  if (strongest < 0.75) return "balanced";
  if (wrestling >= striking && wrestling >= submission) return "wrestling";
  if (submission > striking && submission > wrestling) return "submission";
  return "striking";
}

function gamePlan(fighter: SpotlightStatsFighter, opponent: SpotlightStatsFighter) {
  const style = primaryStyle(fighter);
  const opponentStyle = primaryStyle(opponent);
  const fighterReach = reachInches(fighter.reach);
  const opponentReach = reachInches(opponent.reach);
  const hasReachEdge = finite(fighterReach) && finite(opponentReach) && fighterReach - opponentReach >= 1.5;

  if (style === "wrestling") {
    if (finite(fighter.takedownAverage) && fighter.takedownAverage >= 4) {
      return finite(fighter.submissionAverage) && fighter.submissionAverage >= 0.8
        ? "turn this into a grinding grappling fight, using relentless takedown pressure to create long scrambles and submission threats"
        : "turn this into a grinding grappling fight and keep returning to relentless takedown pressure";
    }
    return "force a wrestling-heavy fight and keep returning to takedowns whenever the striking opens up";
  }

  if (style === "submission") {
    return "create scrambles, threaten submissions, and keep the fight from settling into a clean striking rhythm";
  }

  if (style === "striking") {
    if (
      (opponentStyle === "wrestling" || opponentStyle === "submission")
      && finite(fighter.takedownDefense)
      && fighter.takedownDefense >= 70
    ) {
      return finite(fighter.slpm) && fighter.slpm >= 4.5
        ? "keep the fight in open space, build a high-output striking pace, and make the takedown defense hold up"
        : "keep the fight standing, dictate range, and make the takedown defense hold up";
    }
    if (hasReachEdge) {
      return "manage range behind the longer reach and keep the exchanges at striking distance";
    }
    if (finite(fighter.slpm) && fighter.slpm >= 4.5) {
      return "keep the fight in open space and build a high-output striking pace";
    }
    if (finite(fighter.strikingAccuracy) && fighter.strikingAccuracy >= 50) {
      return "keep the fight standing and make the cleaner striking exchanges count";
    }
    return "keep the fight standing and dictate the striking range";
  }

  if (opponentStyle === "wrestling" || opponentStyle === "submission") {
    return "stay disciplined in the transitions, deny extended grappling exchanges, and make the cleaner moments happen on the feet";
  }
  return "stay adaptable, win position first, and force the matchup into the phase that is working best";
}

function isGrapplingStyle(style: FightStyle) {
  return style === "wrestling" || style === "submission";
}

function swingPoint(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  const redStyle = primaryStyle(red);
  const blueStyle = primaryStyle(blue);

  if (isGrapplingStyle(redStyle) && blueStyle === "striking") {
    return `The fight hinges on whether ${red.name} can keep forcing grappling exchanges or ${blue.name} can keep enough separation to make the fight happen at range.`;
  }
  if (redStyle === "striking" && isGrapplingStyle(blueStyle)) {
    return `The fight hinges on whether ${blue.name} can keep forcing grappling exchanges or ${red.name} can keep enough separation to make the fight happen at range.`;
  }
  if (isGrapplingStyle(redStyle) && isGrapplingStyle(blueStyle)) {
    return "The swing point is who wins the first layer of grappling and keeps the other fighter from resetting.";
  }
  if (redStyle === "striking" && blueStyle === "striking") {
    return "The swing point is range: whoever dictates distance and forces the other fighter to react should control the cleaner exchanges.";
  }
  return "The swing point is who imposes the preferred phase first and keeps the fight there.";
}

function editorialPreview(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  return `${red.name} wants to ${gamePlan(red, blue)}. ${blue.name} counters by trying to ${gamePlan(blue, red)}. ${swingPoint(red, blue)}`;
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
  return {
    boutId: input.boutId,
    preview: editorialPreview(input.red, input.blue),
    red: fighterPackage(input.red, input.blue, input.eventStartsAt),
    blue: fighterPackage(input.blue, input.red, input.eventStartsAt),
    watchSpotlights: [],
    source: "UFCStats",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
