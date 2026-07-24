import {
  getPlayFighter,
  rankedPlayFighters,
  type PlayFighter,
} from "./playFighterPool";

export type BetterThanLensId =
  | "overall"
  | "striking"
  | "boxing"
  | "kickboxing"
  | "wrestling"
  | "grappling"
  | "submissions"
  | "cardio"
  | "durability"
  | "power"
  | "ufc-resume";

export type BetterThanPoolId =
  | "all"
  | "men"
  | "women"
  | "same-division"
  | "205-plus"
  | "170-below"
  | `division:${string}`;

export interface BetterThanLens {
  id: BetterThanLensId;
  label: string;
  phrase: string;
}

export interface BetterThanPool {
  id: BetterThanPoolId;
  label: string;
  phrase: string;
}

export interface BetterThanChallenge {
  target: PlayFighter;
  lens: BetterThanLens;
  pool: BetterThanPool;
  claimCount: number;
  selections: PlayFighter[];
}

export interface BetterThanComparison {
  shared: PlayFighter[];
  creatorOnly: PlayFighter[];
  responderOnly: PlayFighter[];
  overlapPct: number;
  narrower: "creator" | "responder" | "same";
}

export const BETTER_THAN_LENSES: readonly BetterThanLens[] = [
  { id: "overall", label: "Overall fighter", phrase: "overall" },
  { id: "striking", label: "Striking", phrase: "striking" },
  { id: "boxing", label: "Boxing", phrase: "boxing" },
  { id: "kickboxing", label: "Kickboxing", phrase: "kickboxing" },
  { id: "wrestling", label: "Wrestling", phrase: "wrestling" },
  { id: "grappling", label: "Grappling", phrase: "grappling" },
  { id: "submissions", label: "Submissions", phrase: "submissions" },
  { id: "cardio", label: "Cardio", phrase: "cardio" },
  { id: "durability", label: "Durability", phrase: "durability" },
  { id: "power", label: "Power", phrase: "power" },
  { id: "ufc-resume", label: "UFC-only resume", phrase: "UFC-only resume" },
] as const;

export const BETTER_THAN_DIVISIONS = [
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
  "Strawweight",
] as const;

export const DEFAULT_BETTER_THAN_TARGET = "charles-oliveira";
export const BETTER_THAN_MAX_CLAIM = 15;

export function betterThanLens(lensId: BetterThanLensId): BetterThanLens {
  return BETTER_THAN_LENSES.find((lens) => lens.id === lensId) ?? BETTER_THAN_LENSES[0]!;
}

export function betterThanPoolOptions(target: PlayFighter): readonly BetterThanPool[] {
  const pools: BetterThanPool[] = [
    { id: "all", label: `Full ${rankedPlayFighters.length}-fighter pool`, phrase: "UFC fighter" },
    { id: "men", label: "Men's pool", phrase: "male UFC fighter" },
    { id: "women", label: "Women's pool", phrase: "female UFC fighter" },
    { id: "same-division", label: "Same division as target", phrase: `UFC fighter from ${target.name}'s division pool` },
    { id: "205-plus", label: "205+ divisions", phrase: "UFC light heavyweight or heavyweight fighter" },
    { id: "170-below", label: "170 lb divisions and below", phrase: "UFC fighter from welterweight or below" },
    ...BETTER_THAN_DIVISIONS.map((division): BetterThanPool => ({
      id: `division:${division}`,
      label: division,
      phrase: `UFC ${division.toLowerCase()}`,
    })),
  ];
  return pools.map((pool): BetterThanPool => pool.id === "same-division"
    ? { ...pool, label: `Same division as ${target.name}` }
    : pool);
}

export function betterThanPool(target: PlayFighter, poolId: BetterThanPoolId): BetterThanPool {
  const options = betterThanPoolOptions(target);
  return options.find((pool) => pool.id === poolId) ?? options[0]!;
}

function matchesPool(fighter: PlayFighter, target: PlayFighter, poolId: BetterThanPoolId) {
  if (poolId === "all") return true;
  if (poolId === "men" || poolId === "women") return fighter.gender === poolId;
  if (poolId === "same-division") {
    const targetDivisions = new Set(target.divisions);
    return fighter.divisions.some((division) => targetDivisions.has(division));
  }
  if (poolId === "205-plus") {
    return fighter.divisions.some((division) => division === "Heavyweight" || division === "Light Heavyweight");
  }
  if (poolId === "170-below") {
    return fighter.divisions.some((division) => [
      "Welterweight",
      "Lightweight",
      "Featherweight",
      "Bantamweight",
      "Flyweight",
      "Strawweight",
    ].includes(division));
  }
  if (poolId.startsWith("division:")) return fighter.divisions.includes(poolId.slice(9));
  return true;
}

export function betterThanEligible(targetId: string, poolId: BetterThanPoolId) {
  const target = getPlayFighter(targetId) ?? getPlayFighter(DEFAULT_BETTER_THAN_TARGET) ?? rankedPlayFighters[0];
  if (!target) return [];
  return rankedPlayFighters.filter((fighter) => fighter.id !== target.id && matchesPool(fighter, target, poolId));
}

export function betterThanMaxClaim(targetId: string, poolId: BetterThanPoolId) {
  return Math.max(1, Math.min(BETTER_THAN_MAX_CLAIM, betterThanEligible(targetId, poolId).length));
}

function pluralizePool(pool: BetterThanPool, count: number) {
  if (count === 1) return pool.phrase;
  if (pool.id === "205-plus") return "UFC light heavyweight or heavyweight fighters";
  if (pool.id === "170-below") return "UFC fighters from welterweight or below";
  if (pool.id === "same-division") return `${pool.phrase}s`;
  return `${pool.phrase}s`;
}

function comparisonClause(lens: BetterThanLens, target: PlayFighter, count: number) {
  const singular = count === 1;
  switch (lens.id) {
    case "overall":
      return singular
        ? `who is a better overall fighter than ${target.name}`
        : `who are better overall fighters than ${target.name}`;
    case "striking":
      return singular
        ? `who is a better striker than ${target.name}`
        : `who are better strikers than ${target.name}`;
    case "boxing":
      return singular
        ? `who is a better boxer than ${target.name}`
        : `who are better boxers than ${target.name}`;
    case "kickboxing":
      return singular
        ? `who is a better kickboxer than ${target.name}`
        : `who are better kickboxers than ${target.name}`;
    case "wrestling":
      return singular
        ? `who is a better wrestler than ${target.name}`
        : `who are better wrestlers than ${target.name}`;
    case "grappling":
      return singular
        ? `who is a better grappler than ${target.name}`
        : `who are better grapplers than ${target.name}`;
    case "submissions":
      return singular
        ? `who is a better submission artist than ${target.name}`
        : `who are better submission artists than ${target.name}`;
    case "cardio":
      return `who ${singular ? "has" : "have"} better cardio than ${target.name}`;
    case "durability":
      return `who ${singular ? "is" : "are"} more durable than ${target.name}`;
    case "power":
      return `who ${singular ? "has" : "have"} more power than ${target.name}`;
    case "ufc-resume":
      return singular
        ? `who has a better UFC-only résumé than ${target.name}`
        : `who have better UFC-only résumés than ${target.name}`;
    default:
      return `who ${singular ? "is" : "are"} better than ${target.name}`;
  }
}

export function betterThanStatement(
  target: PlayFighter,
  lens: BetterThanLens,
  pool: BetterThanPool,
  count: number,
  subject = "I",
) {
  return `${subject} can name ${count} ${pluralizePool(pool, count)} ${comparisonClause(lens, target, count)}.`;
}

export function betterThanChallengeUrl(challenge: BetterThanChallenge) {
  const url = new URL("/play/better-than", window.location.origin);
  url.searchParams.set("target", challenge.target.id);
  url.searchParams.set("lens", challenge.lens.id);
  url.searchParams.set("pool", challenge.pool.id);
  url.searchParams.set("count", String(challenge.claimCount));
  url.searchParams.set("selections", challenge.selections.map((fighter) => fighter.id).join(","));
  return url.toString();
}

export function resolveBetterThanChallenge(values: {
  targetId: string | null;
  lensId: string | null;
  poolId: string | null;
  claimCount: string | null;
  selectionIds: string | null;
}): BetterThanChallenge | null {
  const target = values.targetId ? getPlayFighter(values.targetId) : null;
  const lens = BETTER_THAN_LENSES.find((row) => row.id === values.lensId);
  if (!target || !target.model || !lens) return null;

  const poolId = (values.poolId || "all") as BetterThanPoolId;
  const pool = betterThanPool(target, poolId);
  if (pool.id !== poolId) return null;

  const eligible = betterThanEligible(target.id, pool.id);
  const allowed = new Set(eligible.map((fighter) => fighter.id));
  const ids = (values.selectionIds ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  const claimCount = Number(values.claimCount);
  if (!Number.isInteger(claimCount) || claimCount < 1 || claimCount > betterThanMaxClaim(target.id, pool.id)) return null;
  if (ids.length !== claimCount || new Set(ids).size !== ids.length || ids.some((id) => !allowed.has(id))) return null;
  const selections = ids.map((id) => getPlayFighter(id)).filter((fighter): fighter is PlayFighter => Boolean(fighter));
  if (selections.length !== claimCount) return null;
  return { target, lens, pool, claimCount, selections };
}

export function compareBetterThanClaims(
  creator: BetterThanChallenge,
  responderCount: number,
  responderSelections: readonly PlayFighter[],
): BetterThanComparison {
  const creatorIds = new Set(creator.selections.map((fighter) => fighter.id));
  const responderIds = new Set(responderSelections.map((fighter) => fighter.id));
  const shared = creator.selections.filter((fighter) => responderIds.has(fighter.id));
  const creatorOnly = creator.selections.filter((fighter) => !responderIds.has(fighter.id));
  const responderOnly = responderSelections.filter((fighter) => !creatorIds.has(fighter.id));
  const union = new Set([...creatorIds, ...responderIds]);
  const overlapPct = union.size ? Math.round((shared.length / union.size) * 100) : 100;
  return {
    shared,
    creatorOnly,
    responderOnly,
    overlapPct,
    narrower: responderCount === creator.claimCount ? "same" : responderCount < creator.claimCount ? "responder" : "creator",
  };
}
