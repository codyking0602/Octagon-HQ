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
type EditorialMatchup = {
  preview: string;
  edgesBySlug: ReadonlyMap<string, string[]>;
  watchSpotlights?: PickSpotlight["watchSpotlights"];
};

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
  if (!selected.length) selected.push("No UFCStats sample yet");
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

function matchupEditorial(red: SpotlightStatsFighter, blue: SpotlightStatsFighter): EditorialMatchup | null {
  const slugs = new Set([red.fighterSlug, blue.fighterSlug]);

  if (slugs.has("jean-silva") && slugs.has("jose-miguel-delgado")) {
    return {
      preview: "Jean Silva wants to force a pressure fight where his power and pace can break Delgado down. Jose Miguel Delgado brings the longer frame, switch-stance looks, and dangerous counters; the key is whether he can punish Silva’s entries.",
      edgesBySlug: new Map([
        ["jean-silva", ["Pressure and finishing power", "Proven UFC competition", "Takedown threat"]],
        ["jose-miguel-delgado", ["Reach and frame advantage", "Switch-stance offense", "High-output striking"]],
      ]),
      watchSpotlights: [{
        fighterSlug: "jean-silva",
        url: "https://youtu.be/Ht9emLnMNrQ?is=8EdgTqQQ7hKKe4XK",
      }],
    };
  }

  if (slugs.has("dan-hooker") && slugs.has("salahdine-parnasse")) {
    return {
      preview: "Dan Hooker wants to stretch the fight out with reach, volume, and veteran timing. Salahdine Parnasse needs to stay unpredictable, blend his southpaw striking with level changes, and force Hooker to defend every phase.",
      edgesBySlug: new Map([
        ["dan-hooker", ["Reach and range control", "Sustained striking volume", "UFC veteran experience"]],
        ["salahdine-parnasse", ["Dynamic southpaw offense", "Seamless phase changes", "Wrestling and submission threat"]],
      ]),
    };
  }

  if (slugs.has("joshua-van") && slugs.has("alexandre-pantoja")) {
    return {
      preview: "Joshua Van brings relentless combination volume into a rematch with Alexandre Pantoja’s pressure grappling. Van wants long exchanges and clean exits; Pantoja’s clearest path is forcing clinches, takedowns, and back-control sequences.",
      edgesBySlug: new Map([
        ["joshua-van", ["Elite combination volume", "Five-round pace", "Strong takedown defense"]],
        ["alexandre-pantoja", ["Championship grappling", "Back-control and submissions", "Pressure-fighting experience"]],
      ]),
    };
  }

  if (slugs.has("arman-tsarukyan") && slugs.has("mauricio-ruffy")) {
    return {
      preview: "Arman Tsarukyan can turn a striking fight into repeated wrestling and control exchanges. Mauricio Ruffy’s threat is keeping space for his reach, accuracy, and knockout power; over five rounds, Ruffy must make every entry expensive.",
      edgesBySlug: new Map([
        ["arman-tsarukyan", ["Chain wrestling", "Damage avoidance", "Five-round control game"]],
        ["mauricio-ruffy", ["Long-range striking", "Knockout power", "Takedown resistance"]],
      ]),
    };
  }

  if (slugs.has("patricio-pitbull") && slugs.has("dooho-choi")) {
    return {
      preview: "Patricio Pitbull brings veteran counter craft, power, and a layered grappling threat against Dooho Choi’s clean high-output boxing. Choi can win minutes behind combinations; Pitbull can change the fight with counters, takedowns, or front-headlock attacks.",
      edgesBySlug: new Map([
        ["patricio-pitbull", ["Veteran counter craft", "Submission threat", "Wrestling defense"]],
        ["dooho-choi", ["High-output boxing", "Reach and range control", "Recent finishing momentum"]],
      ]),
    };
  }

  if (slugs.has("alonzo-menifield") && slugs.has("iwo-baraniewski")) {
    return {
      preview: "Alonzo Menifield is the proven veteran with power and strong takedown defense. Unbeaten Iwo Baraniewski is an early-round accelerator; the key is whether Menifield can make the fight structured before Baraniewski’s blitz creates damage.",
      edgesBySlug: new Map([
        ["alonzo-menifield", ["UFC veteran experience", "Power countering", "Takedown resistance"]],
        ["iwo-baraniewski", ["Unbeaten finishing record", "Explosive early pace", "Judo and grappling base"]],
      ]),
    };
  }

  if (slugs.has("gable-steveson") && slugs.has("sean-sharaf")) {
    return {
      preview: "Gable Steveson’s Olympic wrestling is the matchup’s defining weapon, but his heavyweight hands have been fast and damaging. Sean Sharaf is the taller, longer puncher; he needs to punish entries before Steveson can turn exchanges into clinch control.",
      edgesBySlug: new Map([
        ["gable-steveson", ["Olympic wrestling", "Explosive athleticism", "Fast finishing power"]],
        ["sean-sharaf", ["Height and reach", "Heavyweight knockout power", "High striking output"]],
      ]),
    };
  }

  if (slugs.has("marlon-vera") && slugs.has("charles-jourdain")) {
    return {
      preview: "Charles Jourdain brings the higher striking pace and cleaner defensive numbers, while Marlon Vera remains dangerous deep into fights. Jourdain wants movement and combinations; Vera can flip rounds with body work, leg kicks, and sudden power.",
      edgesBySlug: new Map([
        ["marlon-vera", ["Fight-changing power", "Deep-round experience", "Submission threat"]],
        ["charles-jourdain", ["Higher striking volume", "Defensive striking", "Switch-stance movement"]],
      ]),
    };
  }

  if (slugs.has("tai-tuivasa") && slugs.has("robelis-despaigne")) {
    return {
      preview: "Tai Tuivasa has the UFC experience and proven pocket power, but Robelis Despaigne owns a massive reach advantage and dangerous straight-line offense. Tuivasa needs to get inside the long weapons; Despaigne wants clean space and first-contact damage.",
      edgesBySlug: new Map([
        ["tai-tuivasa", ["UFC veteran experience", "Pocket knockout power", "Leg-kick threat"]],
        ["robelis-despaigne", ["Massive reach advantage", "Long-range power", "Efficient striking"]],
      ]),
    };
  }

  if (slugs.has("michael-aswell-jr") && slugs.has("joosang-yoo")) {
    return {
      preview: "Michael Aswell Jr. pushes one of the card’s fastest striking paces, while JooSang Yoo is the more accurate counter striker with a reach edge. Aswell wants sustained boxing volume; Yoo’s opportunity is making that pressure pay with cleaner counters.",
      edgesBySlug: new Map([
        ["michael-aswell-jr", ["Relentless striking pace", "Pressure boxing", "Battle-tested volume"]],
        ["joosang-yoo", ["Accurate counter striking", "Reach and range control", "Counterpunching power"]],
      ]),
    };
  }

  return null;
}

function editorialPreview(red: SpotlightStatsFighter, blue: SpotlightStatsFighter) {
  return matchupEditorial(red, blue)?.preview
    ?? `${red.name} wants to ${gamePlan(red, blue)}. ${blue.name} needs to ${gamePlan(blue, red)}; ${matchupKey(red, blue)}.`;
}

function fighterPackage(
  fighter: SpotlightStatsFighter,
  opponent: SpotlightStatsFighter,
  eventStartsAt: string,
  editorialEdges?: string[],
): PickSpotlightFighter {
  return {
    fighterSlug: fighter.fighterSlug,
    record: fighter.record || "--",
    age: ageAt(fighter.dob, eventStartsAt),
    height: fighter.height || "--",
    reach: fighter.reach || "--",
    stance: fighter.stance || "--",
    edges: editorialEdges ?? advantageEdges(fighter, opponent),
  };
}

export function buildPickSpotlightContent(input: {
  boutId: string;
  eventStartsAt: string;
  red: SpotlightStatsFighter;
  blue: SpotlightStatsFighter;
  generatedAt?: string;
}): PickSpotlight {
  const editorial = matchupEditorial(input.red, input.blue);
  return {
    boutId: input.boutId,
    preview: editorial?.preview ?? editorialPreview(input.red, input.blue),
    red: fighterPackage(
      input.red,
      input.blue,
      input.eventStartsAt,
      editorial?.edgesBySlug.get(input.red.fighterSlug),
    ),
    blue: fighterPackage(
      input.blue,
      input.red,
      input.eventStartsAt,
      editorial?.edgesBySlug.get(input.blue.fighterSlug),
    ),
    watchSpotlights: editorial?.watchSpotlights ?? [],
    source: "UFCStats",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}