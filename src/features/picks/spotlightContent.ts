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
type Edge = { score: number; text: string };

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

function strengthEdges(fighter: SpotlightStatsFighter) {
  const edges: Edge[] = [];

  if (finite(fighter.slpm)) {
    edges.push({
      score: fighter.slpm / 6,
      text: fighter.slpm >= 4.5 ? "High-volume striking" : "Striking volume",
    });
  }
  if (finite(fighter.strikingAccuracy)) {
    edges.push({ score: fighter.strikingAccuracy / 100, text: "Efficient striking" });
  }
  if (finite(fighter.strikingDefense)) {
    edges.push({ score: fighter.strikingDefense / 100, text: "Defensive striking" });
  }
  if (finite(fighter.takedownAverage)) {
    edges.push({
      score: fighter.takedownAverage / 4,
      text: fighter.takedownAverage >= 4 ? "Relentless takedown pressure" : "Wrestling pressure",
    });
  }
  if (finite(fighter.takedownAccuracy)) {
    edges.push({ score: fighter.takedownAccuracy / 100, text: "Efficient takedowns" });
  }
  if (finite(fighter.takedownDefense)) {
    edges.push({ score: fighter.takedownDefense / 100, text: "Takedown resistance" });
  }
  if (finite(fighter.submissionAverage)) {
    edges.push({ score: fighter.submissionAverage / 1.5, text: "Submission threat" });
  }
  if (finite(fighter.sapm)) {
    edges.push({ score: Math.max(0, (5.5 - fighter.sapm) / 5.5), text: "Damage avoidance" });
  }

  return edges.sort((left, right) => right.score - left.score);
}

function advantageEdges(fighter: SpotlightStatsFighter, opponent: SpotlightStatsFighter) {
  const edges: Edge[] = [];
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

  for (const edge of strengthEdges(fighter)) {
    if (selected.length >= 3) break;
    if (!selected.includes(edge.text)) selected.push(edge.text);
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
        ? "make this a scramble-heavy wrestling fight"
        : "grind behind relentless takedown pressure";
    }
    return "force a wrestling-heavy fight";
  }

  if (style === "submission") {
    return "create scrambles and hunt submissions";
  }

  if (style === "striking") {
    if (
      (opponentStyle === "wrestling" || opponentStyle === "submission")
      && finite(fighter.takedownDefense)
      && fighter.takedownDefense >= 70
    ) {
      return finite(fighter.slpm) && fighter.slpm >= 4.5
        ? "keep space for a high-volume striking pace and make the takedown defense hold"
        : "keep it standing and make the takedown defense hold";
    }
    if (hasReachEdge) {
      return "manage range behind the longer reach";
    }
    if (finite(fighter.slpm) && fighter.slpm >= 4.5) {
      return "keep space and push a high-output striking pace";
    }
    if (finite(fighter.strikingAccuracy) && fighter.strikingAccuracy >= 50) {
      return "keep it standing and win the cleaner exchanges";
    }
    return "keep it standing and dictate range";
  }

  if (opponentStyle === "wrestling" || opponentStyle === "submission") {
    return "deny long grappling exchanges and win the cleaner moments";
  }
  return "stay adaptable and impose the better phase";
}

function isGrapplingStyle(style: FightStyle) {
  return style === "wrestling" || style === "submission";
}

function surname(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

function matchupKey(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  const redStyle = primaryStyle(red);
  const blueStyle = primaryStyle(blue);

  if (isGrapplingStyle(redStyle) && blueStyle === "striking") {
    return `the key is whether ${surname(blue.name)} can stay separated`;
  }
  if (redStyle === "striking" && isGrapplingStyle(blueStyle)) {
    return `the key is whether ${surname(red.name)} can stay separated`;
  }
  if (isGrapplingStyle(redStyle) && isGrapplingStyle(blueStyle)) {
    return "the key is who controls the first scramble";
  }
  if (redStyle === "striking" && blueStyle === "striking") {
    return "the key is who owns the range";
  }
  return "the key is who imposes the better phase";
}

function editorialPreview(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  return `${red.name} wants to ${gamePlan(red, blue)}. ${blue.name} needs to ${gamePlan(blue, red)}; ${matchupKey(red, blue)}.`;
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
