import contractArtifact from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import qbGradesArtifact from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbGradesArtifact from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrGradesArtifact from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import teGradesArtifact from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSevenGradesArtifact from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryGradesArtifact from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import {
  WHEEL_FOOTBALL_GM_CAP,
  WHEEL_FOOTBALL_GM_ROSTER_SLOTS,
  projectWheelFootballGmExtensionApy,
  projectWheelFootballGmGrade,
  wheelFootballGmMarketPositionForContract,
  wheelFootballGmOutlook,
  wheelFootballGmSalaryWindow,
  type WheelFootballGmContractRow,
  type WheelFootballGmMarketPosition,
  type WheelFootballGmRosterSlot,
} from "./wheelFootballGmEconomy";

type GradeRow = {
  team: string;
  player: string;
  grade: number;
};

type GradeArtifact = {
  grades: GradeRow[];
};

type ContractArtifact = {
  players: WheelFootballGmContractRow[];
};

const gradeArtifacts = [
  ["QB", qbGradesArtifact],
  ["RB", rbGradesArtifact],
  ["WR", wrGradesArtifact],
  ["TE", teGradesArtifact],
  ["Front Seven", frontSevenGradesArtifact],
  ["Secondary", secondaryGradesArtifact],
] as const satisfies readonly [
  WheelFootballGmContractRow["family"],
  unknown,
][];

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(?:iii|ii|iv|jr|sr|v)$/, "");
}

const grades = new Map<string, number>();
for (const [family, artifact] of gradeArtifacts) {
  for (const row of (artifact as GradeArtifact).grades) {
    grades.set(`${row.team}|${family}|${normalized(row.player)}`, row.grade);
  }
}

export type WheelFootballGmPlayer = WheelFootballGmContractRow & {
  id: string;
  playerKey: string;
  currentGrade: number;
  marketPosition: WheelFootballGmMarketPosition;
  projectedExtensionApy: number;
  salaryWindow: readonly [number, number, number];
  outlook: "ELITE UPSIDE" | "RISING" | "DECLINE RISK" | "STABLE";
};

export type WheelFootballGmRosterPick = {
  slot: WheelFootballGmRosterSlot;
  playerId: string;
  acquiredYear: 1 | 2;
};

const contractRows = (contractArtifact as unknown as ContractArtifact).players;

export const wheelFootballGmPlayers: readonly WheelFootballGmPlayer[] = contractRows.map((contract) => {
  const currentGrade = grades.get(
    `${contract.team}|${contract.family}|${normalized(contract.player)}`,
  );
  if (currentGrade == null) {
    throw new Error(`Missing GM grade for ${contract.team} ${contract.family} ${contract.player}`);
  }

  const marketPosition = wheelFootballGmMarketPositionForContract(contract);
  const projectedExtensionApy = projectWheelFootballGmExtensionApy({
    currentGrade,
    age: contract.age,
    position: marketPosition,
    draftYear: contract.draftYear,
    draftOverall: contract.draftOverall,
  });

  return {
    ...contract,
    id: `${contract.team}|${contract.family}|${contract.normalizedName}`,
    playerKey: `${contract.team}|${contract.normalizedName}`,
    currentGrade,
    marketPosition,
    projectedExtensionApy,
    salaryWindow: wheelFootballGmSalaryWindow({
      gameContract: contract.gameContract,
      salaryApy: contract.salaryApy,
      projectedExtensionApy,
    }),
    outlook: wheelFootballGmOutlook({
      currentGrade,
      age: contract.age,
      position: marketPosition,
      draftYear: contract.draftYear,
      draftOverall: contract.draftOverall,
    }),
  };
});

export const wheelFootballGmPlayerById = new Map(
  wheelFootballGmPlayers.map((player) => [player.id, player] as const),
);

const playersByTeam = new Map<string, WheelFootballGmPlayer[]>();
for (const player of wheelFootballGmPlayers) {
  const list = playersByTeam.get(player.team) ?? [];
  list.push(player);
  playersByTeam.set(player.team, list);
}

export function wheelFootballGmPlayersForTeam(teamCode: string) {
  return playersByTeam.get(teamCode.toUpperCase()) ?? [];
}

export function wheelFootballGmOpenSlots(
  roster: readonly WheelFootballGmRosterPick[],
) {
  const filled = new Set(roster.map((pick) => pick.slot));
  return WHEEL_FOOTBALL_GM_ROSTER_SLOTS.filter((slot) => !filled.has(slot));
}

export function wheelFootballGmPlayerSalary(
  player: WheelFootballGmPlayer,
  year: 1 | 2 | 3,
) {
  return player.salaryWindow[year - 1];
}

export function wheelFootballGmPlayerGrade(
  player: WheelFootballGmPlayer,
  year: 1 | 2 | 3,
) {
  return projectWheelFootballGmGrade({
    currentGrade: player.currentGrade,
    age: player.age,
    position: player.marketPosition,
    yearsAhead: (year - 1) as 0 | 1 | 2,
    draftYear: player.draftYear,
    draftOverall: player.draftOverall,
  });
}

export function wheelFootballGmRosterSpend(
  roster: readonly WheelFootballGmRosterPick[],
  year: 1 | 2 | 3,
) {
  return roster.reduce((total, pick) => {
    const player = wheelFootballGmPlayerById.get(pick.playerId);
    return total + (player ? wheelFootballGmPlayerSalary(player, year) : 0);
  }, 0);
}

export function wheelFootballGmRosterGrade(
  roster: readonly WheelFootballGmRosterPick[],
  year: 1 | 2 | 3,
) {
  if (!roster.length) return null;
  const values = roster
    .map((pick) => wheelFootballGmPlayerById.get(pick.playerId))
    .filter((player): player is WheelFootballGmPlayer => Boolean(player))
    .map((player) => wheelFootballGmPlayerGrade(player, year));
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function wheelFootballGmThreeYearGrade(
  yearOneRoster: readonly WheelFootballGmRosterPick[],
  finalRoster: readonly WheelFootballGmRosterPick[],
) {
  const gradesByYear = [
    wheelFootballGmRosterGrade(yearOneRoster, 1),
    wheelFootballGmRosterGrade(finalRoster, 2),
    wheelFootballGmRosterGrade(finalRoster, 3),
  ].filter((value): value is number => value != null);
  if (!gradesByYear.length) return null;
  return Math.round(
    (gradesByYear.reduce((sum, value) => sum + value, 0) / gradesByYear.length) * 10,
  ) / 10;
}

export function wheelFootballGmMinimumRemainingCap(input: {
  openSlots: readonly WheelFootballGmRosterSlot[];
  year: 1 | 2;
  usedPlayerKeys: ReadonlySet<string>;
}) {
  let total = 0;
  for (const slot of input.openSlots) {
    let cheapest = Number.POSITIVE_INFINITY;
    for (const player of wheelFootballGmPlayers) {
      if (input.usedPlayerKeys.has(player.playerKey)) continue;
      if (!player.gmEligibleSlots.includes(slot)) continue;
      cheapest = Math.min(cheapest, wheelFootballGmPlayerSalary(player, input.year));
    }
    if (!Number.isFinite(cheapest)) return Number.POSITIVE_INFINITY;
    total += cheapest;
  }
  return total;
}

export function wheelFootballGmCandidateFits(input: {
  player: WheelFootballGmPlayer;
  slot: WheelFootballGmRosterSlot;
  openSlots: readonly WheelFootballGmRosterSlot[];
  year: 1 | 2;
  remainingCap: number;
  usedPlayerKeys: ReadonlySet<string>;
}) {
  if (!input.openSlots.includes(input.slot)) return false;
  if (!input.player.gmEligibleSlots.includes(input.slot)) return false;
  if (input.usedPlayerKeys.has(input.player.playerKey)) return false;

  const salary = wheelFootballGmPlayerSalary(input.player, input.year);
  if (salary > input.remainingCap) return false;

  const nextUsed = new Set(input.usedPlayerKeys);
  nextUsed.add(input.player.playerKey);
  const nextOpen = input.openSlots.filter((slot) => slot !== input.slot);
  const floor = wheelFootballGmMinimumRemainingCap({
    openSlots: nextOpen,
    year: input.year,
    usedPlayerKeys: nextUsed,
  });
  return salary + floor <= input.remainingCap;
}

export function wheelFootballGmCandidatesForTeam(input: {
  teamCode: string;
  slot: WheelFootballGmRosterSlot;
  openSlots: readonly WheelFootballGmRosterSlot[];
  year: 1 | 2;
  remainingCap: number;
  usedPlayerKeys: ReadonlySet<string>;
}) {
  return wheelFootballGmPlayersForTeam(input.teamCode)
    .filter((player) => wheelFootballGmCandidateFits({
      player,
      slot: input.slot,
      openSlots: input.openSlots,
      year: input.year,
      remainingCap: input.remainingCap,
      usedPlayerKeys: input.usedPlayerKeys,
    }))
    .sort((left, right) => (
      wheelFootballGmPlayerSalary(left, input.year) - wheelFootballGmPlayerSalary(right, input.year)
      || right.currentGrade - left.currentGrade
      || left.player.localeCompare(right.player)
    ));
}

export function wheelFootballGmEligibleTeamCodes(input: {
  teamCodes: readonly string[];
  openSlots: readonly WheelFootballGmRosterSlot[];
  year: 1 | 2;
  remainingCap: number;
  usedPlayerKeys: ReadonlySet<string>;
}) {
  return input.teamCodes.filter((teamCode) => input.openSlots.some((slot) => (
    wheelFootballGmCandidatesForTeam({
      teamCode,
      slot,
      openSlots: input.openSlots,
      year: input.year,
      remainingCap: input.remainingCap,
      usedPlayerKeys: input.usedPlayerKeys,
    }).length > 0
  )));
}

export function wheelFootballGmCapRoom(spend: number) {
  return WHEEL_FOOTBALL_GM_CAP - spend;
}

export function formatWheelFootballGmMoney(value: number) {
  const millions = value / 1_000_000;
  if (Math.abs(millions) >= 100) return `$${Math.round(millions)}M`;
  if (Math.abs(millions) >= 10) return `$${millions.toFixed(1).replace(/\.0$/, "")}M`;
  return `$${millions.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
}
