/**
 * NBA GM's read-only, evidence-gated foundation. This is deliberately NOT a
 * second GM backend, an NBA release route, or a published player-rating owner.
 * Football GM's established lifecycle is the integration reference.
 */
export const NBA_GM_VERSION = "nba-gm-foundation-v1";
export const NBA_GM_SEASON_COUNT = 3;
export const NBA_GM_REGULAR_SEASON_GAMES = 82;
export const NBA_GM_ROSTER_SLOTS = ["PG", "SG", "SF", "PF", "C", "GUARD", "BIG"] as const;
export const NBA_GM_STARTER_POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
/** OWNER LOCKED: exactly six NBA GM basketball skill dimensions; no seventh skill. */
export const NBA_GM_SKILL_KEYS = [
  "scoring",
  "playmaking",
  "shooting",
  "perimeterDefense",
  "interiorDefense",
  "rebounding",
] as const;
export const NBA_GM_TEAM_CODES = [
  "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
  "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
  "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
] as const;

/** Calibration scenarios ONLY: no one has approved a live salary limit yet. */
export const NBA_GM_BUDGET_SCENARIOS = [185_000_000, 192_500_000, 200_000_000] as const;
export type NbaGmSlot = typeof NBA_GM_ROSTER_SLOTS[number];
export type NbaGmPosition = typeof NBA_GM_STARTER_POSITIONS[number];
export type NbaGmSkill = typeof NBA_GM_SKILL_KEYS[number];
export type NbaGmTeamCode = typeof NBA_GM_TEAM_CODES[number];
export type NbaGmSalaryWindow = readonly [number, number, number];

/**
 * Future-year salary windows are GAME values, not assertions that a real player
 * has three guaranteed seasons. The future repricing method must be sourced
 * and reviewed before connecting this contract to a live game.
 */
export interface NbaGmPlayer {
  id: string;
  name: string;
  teamCode: NbaGmTeamCode;
  positions: readonly NbaGmPosition[];
  currentGrade: number;
  salaries: NbaGmSalaryWindow;
  skills: Readonly<Record<NbaGmSkill, number>>;
  sources: {
    rosterUrl: string;
    contractUrl: string;
    abilityUrls: readonly string[];
  };
}

export interface NbaGmPick {
  slot: NbaGmSlot;
  playerId: string;
}

export interface NbaGmRosterReview {
  errors: string[];
  valid: boolean;
  complete: boolean;
  spendBySeason: NbaGmSalaryWindow;
}

const positionSet = new Set<string>(NBA_GM_STARTER_POSITIONS);
const slotSet = new Set<string>(NBA_GM_ROSTER_SLOTS);
const teamSet = new Set<string>(NBA_GM_TEAM_CODES);

export function nbaGmEligibleForSlot(player: Pick<NbaGmPlayer, "positions">, slot: NbaGmSlot): boolean {
  // A wing only plays backup guard or big when his verified secondary
  // eligibility includes SG or PF respectively. Pure SF stays at SF.
  return slot === "GUARD"
    ? player.positions.some(position => position === "PG" || position === "SG")
    : slot === "BIG"
      ? player.positions.some(position => position === "PF" || position === "C")
      : player.positions.includes(slot);
}

/** Hard provenance and coverage guard. An empty future research bank is NOT ready. */
export function nbaGmCatalogErrors(players: readonly NbaGmPlayer[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const validUrl = (url: string) => /^https:\/\/[^ /]+\/\S*/.test(url);
  for (const player of players) {
    if (!player.id.trim() || seen.has(player.id)) errors.push("Duplicate or empty NBA player identity: " + player.id);
    seen.add(player.id);
    if (!player.name.trim()) errors.push("Missing NBA player name: " + player.id);
    if (!teamSet.has(player.teamCode)) errors.push("Invalid NBA team: " + player.id);
    if (player.positions.length === 0 || player.positions.some(position => !positionSet.has(position))) {
      errors.push("Invalid NBA position eligibility: " + player.id);
    }
    if (!Number.isFinite(player.currentGrade) || player.currentGrade < 0 || player.currentGrade > 100) {
      errors.push("Invalid NBA overall grade: " + player.id);
    }
    if (player.salaries.length !== 3 || player.salaries.some(amount => !Number.isSafeInteger(amount) || amount < 0)) {
      errors.push("Invalid three-season NBA game salary: " + player.id);
    }
    if (NBA_GM_SKILL_KEYS.some(key => !Number.isFinite(player.skills[key]) || player.skills[key] < 0 || player.skills[key] > 99)) {
      errors.push("Missing or invalid NBA skill grade: " + player.id);
    }
    if (!validUrl(player.sources.rosterUrl) || !validUrl(player.sources.contractUrl)
      || player.sources.abilityUrls.length === 0
      || player.sources.abilityUrls.some(url => !validUrl(url))) {
      errors.push("Missing evidence for NBA player: " + player.id);
    }
  }
  if (!players.length) errors.push("NBA research catalog is empty; no players may be published.");
  return errors;
}

export function nbaGmRosterReview(
  picks: readonly NbaGmPick[],
  players: ReadonlyMap<string, NbaGmPlayer>,
  caps: NbaGmSalaryWindow,
  requireComplete = false,
): NbaGmRosterReview {
  const errors: string[] = [];
  const seenSlots = new Set<NbaGmSlot>();
  const seenPlayers = new Set<string>();
  const spend = [0, 0, 0];
  if (caps.length !== 3 || caps.some(cap => !Number.isSafeInteger(cap) || cap < 0)) {
    errors.push("Invalid three-season salary budget.");
  }
  if (picks.length > NBA_GM_ROSTER_SLOTS.length) errors.push("Too many NBA roster picks.");
  for (const pick of picks) {
    if (!slotSet.has(pick.slot)) errors.push("Invalid NBA roster slot: " + pick.slot);
    if (seenSlots.has(pick.slot)) errors.push("Duplicate NBA roster slot: " + pick.slot);
    if (seenPlayers.has(pick.playerId)) errors.push("Duplicate NBA player selection: " + pick.playerId);
    seenSlots.add(pick.slot);
    seenPlayers.add(pick.playerId);
    const player = players.get(pick.playerId);
    if (!player) {
      errors.push("Unknown NBA player: " + pick.playerId);
      continue;
    }
    if (!nbaGmEligibleForSlot(player, pick.slot)) {
      errors.push("NBA player not eligible for slot: " + pick.playerId + " / " + pick.slot);
    }
    for (let season = 0; season < 3; season += 1) {
      spend[season] = spend[season]! + player.salaries[season]!;
    }
  }
  const complete = NBA_GM_ROSTER_SLOTS.every(slot => seenSlots.has(slot)) && picks.length === 7;
  if (requireComplete && !complete) errors.push("NBA roster must fill all seven distinct slots.");
  for (let season = 0; season < 3; season += 1) {
    if (spend[season]! > caps[season]!) {
      errors.push("NBA salary budget exceeded for season " + (season + 1) + ".");
    }
  }
  return { errors, valid: errors.length === 0, complete, spendBySeason: spend as unknown as NbaGmSalaryWindow };
}

/**
 * Conservative candidate preview for an already-authorized team wheel result.
 * The server must own the spin/selection and repeat these checks at commit.
 * Final roster affordability still requires a full completion simulation.
 */
export function nbaGmTeamCandidates(
  teamCode: NbaGmTeamCode,
  slot: NbaGmSlot,
  picks: readonly NbaGmPick[],
  catalog: readonly NbaGmPlayer[],
  caps: NbaGmSalaryWindow,
): NbaGmPlayer[] {
  if (!slotSet.has(slot) || picks.some(pick => pick.slot === slot)) return [];
  const byId = new Map(catalog.map(player => [player.id, player]));
  const alreadyOwned = new Set(picks.map(pick => pick.playerId));
  return catalog
    .filter(player => player.teamCode === teamCode
      && !alreadyOwned.has(player.id)
      && nbaGmEligibleForSlot(player, slot)
      && nbaGmRosterReview([...picks, { slot, playerId: player.id }], byId, caps).valid)
    .sort((a, b) => b.currentGrade - a.currentGrade || a.name.localeCompare(b.name));
}

/** Trait visibility only—not an unreviewed chemistry or championship formula. */
export function nbaGmRosterTraitAverages(
  picks: readonly NbaGmPick[],
  players: ReadonlyMap<string, NbaGmPlayer>,
): Record<NbaGmSkill, number> | null {
  const roster = picks.map(pick => players.get(pick.playerId));
  if (!roster.length || roster.some(player => !player)) return null;
  return Object.fromEntries(
    NBA_GM_SKILL_KEYS.map(key => [
      key,
      Math.round(roster.reduce((sum, player) => sum + player!.skills[key], 0) / roster.length * 10) / 10,
    ]),
  ) as Record<NbaGmSkill, number>;
}
