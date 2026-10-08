import {
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmPlayerById,
  footballGmProjectedGradeForPlayer,
  footballGmSpinTeam,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmIsOffseasonCompliantV2,
} from "./footballGmStrategy";

export interface FootballGmCpuDraftChoice {
  team: string;
  playerId: string;
  slot: FootballGmRosterSlot;
}

export interface FootballGmCpuTransaction {
  outgoingPlayerId: string;
  incomingPlayerId: string;
  slot: FootballGmRosterSlot;
}

function draftChoiceScore(playerId: string, slot: FootballGmRosterSlot) {
  const player = footballGmPlayerById(playerId);
  if (!player) return Number.NEGATIVE_INFINITY;
  const futureSalary = Math.max(player.salaryWindow[1], player.salaryWindow[2]);
  const controlBonus = player.gameContract === "3YR" ? 2.2 : 0;
  const slotBonus = slot === "QB" ? 2.4 : slot === "WR" || slot === "DL" || slot === "DB" ? 1.2 : 0.5;
  return player.currentGrade + controlBonus + slotBonus - (futureSalary / 25_000_000);
}

export function footballGmCpuDraftChoice(input: {
  roster: readonly FootballGmRosterEntry[];
  seed: string;
  spinIndex: number;
  previousTeam?: string | null;
  excludedPlayerIds?: readonly string[];
}): FootballGmCpuDraftChoice | null {
  const teams = footballGmEligibleTeams({
    roster: input.roster,
    previousTeam: input.previousTeam,
    year: 1,
    excludedPlayerIds: input.excludedPlayerIds,
  });
  const team = footballGmSpinTeam(input.seed, input.spinIndex, teams);
  if (!team) return null;
  const candidates = footballGmCandidatesForTeam({
    team,
    roster: input.roster,
    year: 1,
    excludedPlayerIds: input.excludedPlayerIds,
  });

  const choices = candidates.flatMap(({ player, legalSlots }) => (
    legalSlots.map((slot) => ({
      team,
      playerId: player.id,
      slot,
      score: draftChoiceScore(player.id, slot),
    }))
  )).sort((left, right) => (
    right.score - left.score
    || left.slot.localeCompare(right.slot)
    || left.playerId.localeCompare(right.playerId)
  ));

  const best = choices[0];
  return best ? { team: best.team, playerId: best.playerId, slot: best.slot } : null;
}

function replacementScore(input: {
  roster: readonly FootballGmRosterEntry[];
  outgoing: FootballGmRosterEntry;
  incomingPlayerId: string;
  seed: string;
}) {
  const outgoingPlayer = footballGmPlayerById(input.outgoing.playerId);
  const incoming = footballGmPlayerById(input.incomingPlayerId);
  if (!outgoingPlayer || !incoming) return null;

  const currentYear2 = footballGmAdjustedSalaryForPlayer(outgoingPlayer, 2, input.seed, {});
  const currentYear3 = footballGmAdjustedSalaryForPlayer(outgoingPlayer, 3, input.seed, {});
  const nextYear2 = footballGmAdjustedSalaryForPlayer(incoming, 2, input.seed, {});
  const nextYear3 = footballGmAdjustedSalaryForPlayer(incoming, 3, input.seed, {});
  const savings2 = currentYear2 - nextYear2;
  const savings3 = currentYear3 - nextYear3;
  // The CPU cannot "fix" one future cap by making the other future cap worse.
  // Every cleanup move is monotonic across both years.
  if (savings2 < 0 || savings3 < 0 || (savings2 === 0 && savings3 === 0)) return null;

  const gradeDelta = footballGmProjectedGradeForPlayer(incoming, 2, input.seed)
    - footballGmProjectedGradeForPlayer(outgoingPlayer, 2, input.seed);
  const usableSavings = Math.max(0, savings2) + Math.max(0, savings3);
  const controlBonus = incoming.gameContract === "3YR" ? 1.25 : 0;
  return (usableSavings / 1_000_000) + (gradeDelta * 1.8) + controlBonus;
}

export function footballGmCpuOffseason(input: {
  yearOneRoster: readonly FootballGmRosterEntry[];
  seed: string;
  excludedPlayerIds?: readonly string[];
}) {
  let roster = input.yearOneRoster.map((entry) => ({ ...entry }));
  const excluded = new Set(input.excludedPlayerIds ?? []);
  const transactions: FootballGmCpuTransaction[] = [];

  for (let pass = 0; pass < FOOTBALL_GM_ROSTER_SLOTS.length * 2; pass += 1) {
    if (footballGmIsOffseasonCompliantV2(roster, input.seed, {}, [])) break;

    const held = new Set(roster.map((entry) => entry.playerId));
    const overYear2 = Math.max(0, footballGmAdjustedRosterCap(roster, 2, input.seed, {}) - 150_000_000);
    const overYear3 = Math.max(0, footballGmAdjustedRosterCap(roster, 3, input.seed, {}) - 150_000_000);

    const options = roster.flatMap((outgoing) => {
      const outgoingPlayer = footballGmPlayerById(outgoing.playerId);
      if (!outgoingPlayer) return [];
      return FOOTBALL_GM_PLAYER_POOL
        .filter((candidate) => candidate.eligibleSlots.includes(outgoing.slot))
        .filter((candidate) => !held.has(candidate.id) && !excluded.has(candidate.id))
        .flatMap((candidate) => {
          const score = replacementScore({
            roster,
            outgoing,
            incomingPlayerId: candidate.id,
            seed: input.seed,
          });
          if (score === null) return [];

          const current2 = footballGmAdjustedSalaryForPlayer(outgoingPlayer, 2, input.seed, {});
          const current3 = footballGmAdjustedSalaryForPlayer(outgoingPlayer, 3, input.seed, {});
          const next2 = footballGmAdjustedSalaryForPlayer(candidate, 2, input.seed, {});
          const next3 = footballGmAdjustedSalaryForPlayer(candidate, 3, input.seed, {});
          const savings2 = current2 - next2;
          const savings3 = current3 - next3;
          const solves = savings2 >= overYear2 && savings3 >= overYear3;
          return [{
            outgoing,
            incomingPlayerId: candidate.id,
            score: score + (solves ? 1000 : 0),
          }];
        });
    }).sort((left, right) => (
      right.score - left.score
      || left.outgoing.slot.localeCompare(right.outgoing.slot)
      || left.incomingPlayerId.localeCompare(right.incomingPlayerId)
    ));

    const choice = options[0];
    if (!choice) break;
    roster = roster.map((entry) => (
      entry.playerId === choice.outgoing.playerId
        ? { slot: entry.slot, playerId: choice.incomingPlayerId, acquired: "trade" as const }
        : entry
    ));
    transactions.push({
      outgoingPlayerId: choice.outgoing.playerId,
      incomingPlayerId: choice.incomingPlayerId,
      slot: choice.outgoing.slot,
    });
  }

  return {
    roster,
    transactions,
    compliant: footballGmIsOffseasonCompliantV2(roster, input.seed, {}, []),
  };
}
