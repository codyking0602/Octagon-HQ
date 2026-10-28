import {
  FOOTBALL_FUTURES_RULES,
  type FootballFuturesPicks,
} from "./footballPicksScoring";
import {
  CFB_POWER4_CONFERENCES,
  NFL_CONFERENCES,
  NFL_DIVISION_GROUPS,
  getCfbPower4Conference,
  getNflConference,
  getNflTeamGroup,
  isCfbPower4Team,
} from "./footballFuturesTeams";

export const EMPTY_FOOTBALL_FUTURES_PICKS: FootballFuturesPicks = {
  cfbPower4Champions: [],
  cfbPlayoffTeams: [],
  cfbSemifinalists: [],
  cfbHeisman: "",
  cfbNationalChampion: "",
  nflDivisionChampions: [],
  nflPlayoffTeams: [],
  nflConferenceChampionshipTeams: [],
  nflMvp: "",
  nflSuperBowlChampion: "",
};

function clean(value: string) {
  return value.trim();
}

function cleanList(values: readonly string[]) {
  return values.map(clean).filter(Boolean);
}

function normalizedSet(values: readonly string[]) {
  return new Set(cleanList(values).map((value) => value.toLocaleLowerCase()));
}

function validateList(label: string, values: readonly string[], limit: number, errors: string[]) {
  const cleaned = cleanList(values);
  if (cleaned.length > limit) errors.push(`${label} allows ${limit} selections.`);
  if (normalizedSet(cleaned).size !== cleaned.length) errors.push(`${label} cannot contain duplicates.`);
}

function validateSubset(label: string, child: readonly string[], parent: readonly string[], errors: string[]) {
  const parentSet = normalizedSet(parent);
  const missing = cleanList(child).find((value) => !parentSet.has(value.toLocaleLowerCase()));
  if (missing) errors.push(`${label} must also appear in the parent playoff field.`);
}

function validateSingleInList(label: string, value: string, parent: readonly string[], errors: string[]) {
  const cleaned = clean(value);
  if (!cleaned) return;
  if (!normalizedSet(parent).has(cleaned.toLocaleLowerCase())) errors.push(`${label} must also appear in the parent field.`);
}

function includesAll(parent: readonly string[], required: readonly string[]) {
  const parentSet = normalizedSet(parent);
  return cleanList(required).every((value) => parentSet.has(value.toLocaleLowerCase()));
}

function validateConferenceAndDivisionRules(picks: FootballFuturesPicks, errors: string[]) {
  if (picks.cfbPower4Champions.length === FOOTBALL_FUTURES_RULES.cfb.power4Champions.selections) {
    const conferences = picks.cfbPower4Champions.map(getCfbPower4Conference);
    const hasEveryConference = CFB_POWER4_CONFERENCES.every(
      (conference) => conferences.filter((value) => value === conference).length === 1,
    );
    if (!hasEveryConference) errors.push("Power 4 champions must include exactly one ACC, Big Ten, Big 12, and SEC team.");
  }

  if (picks.cfbPlayoffTeams.length === FOOTBALL_FUTURES_RULES.cfb.playoffTeams.selections) {
    if (!includesAll(picks.cfbPlayoffTeams, picks.cfbPower4Champions)) {
      errors.push("The 12-team CFP must include every Power 4 champion you picked.");
    }
    if (!picks.cfbPlayoffTeams.some((team) => !isCfbPower4Team(team))) {
      errors.push("The 12-team CFP must include at least one non-Power 4 team.");
    }
  }

  if (picks.nflDivisionChampions.length === FOOTBALL_FUTURES_RULES.nfl.divisionChampions.selections) {
    const groups = picks.nflDivisionChampions.map((team) => getNflTeamGroup(team)?.label ?? null);
    const hasEveryDivision = NFL_DIVISION_GROUPS.every(
      (group) => groups.filter((value) => value === group.label).length === 1,
    );
    if (!hasEveryDivision) errors.push("NFL division champions must include exactly one team from each division.");
  }

  if (picks.nflPlayoffTeams.length === FOOTBALL_FUTURES_RULES.nfl.playoffTeams.selections) {
    const conferences = picks.nflPlayoffTeams.map(getNflConference);
    const hasKnownTeams = conferences.every(Boolean);
    const hasSevenPerConference = hasKnownTeams && NFL_CONFERENCES.every(
      (conference) => conferences.filter((value) => value === conference).length === 7,
    );
    if (!hasSevenPerConference) errors.push("NFL playoffs must include exactly 7 AFC and 7 NFC teams.");
    if (!includesAll(picks.nflPlayoffTeams, picks.nflDivisionChampions)) {
      errors.push("NFL playoffs must include every division champion you picked.");
    }
  }

  if (picks.nflConferenceChampionshipTeams.length === FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.selections) {
    const conferences = picks.nflConferenceChampionshipTeams.map(getNflConference);
    const hasTwoPerConference = conferences.every(Boolean) && NFL_CONFERENCES.every(
      (conference) => conferences.filter((value) => value === conference).length === 2,
    );
    if (!hasTwoPerConference) errors.push("Conference title teams must include exactly 2 AFC and 2 NFC teams.");
  }
}

export function normalizeFootballFuturesPicks(picks: FootballFuturesPicks): FootballFuturesPicks {
  return {
    cfbPower4Champions: cleanList(picks.cfbPower4Champions),
    cfbPlayoffTeams: cleanList(picks.cfbPlayoffTeams),
    cfbSemifinalists: cleanList(picks.cfbSemifinalists),
    cfbHeisman: clean(picks.cfbHeisman),
    cfbNationalChampion: clean(picks.cfbNationalChampion),
    nflDivisionChampions: cleanList(picks.nflDivisionChampions),
    nflPlayoffTeams: cleanList(picks.nflPlayoffTeams),
    nflConferenceChampionshipTeams: cleanList(picks.nflConferenceChampionshipTeams),
    nflMvp: clean(picks.nflMvp),
    nflSuperBowlChampion: clean(picks.nflSuperBowlChampion),
  };
}

export function validateFootballFuturesPicks(picks: FootballFuturesPicks) {
  const normalized = normalizeFootballFuturesPicks(picks);
  const errors: string[] = [];

  validateList("Power 4 champions", normalized.cfbPower4Champions, FOOTBALL_FUTURES_RULES.cfb.power4Champions.selections, errors);
  validateList("CFP teams", normalized.cfbPlayoffTeams, FOOTBALL_FUTURES_RULES.cfb.playoffTeams.selections, errors);
  validateList("CFP semifinalists", normalized.cfbSemifinalists, FOOTBALL_FUTURES_RULES.cfb.semifinalists.selections, errors);
  validateList("NFL division champions", normalized.nflDivisionChampions, FOOTBALL_FUTURES_RULES.nfl.divisionChampions.selections, errors);
  validateList("NFL playoff teams", normalized.nflPlayoffTeams, FOOTBALL_FUTURES_RULES.nfl.playoffTeams.selections, errors);
  validateList("Conference championship teams", normalized.nflConferenceChampionshipTeams, FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.selections, errors);

  validateSubset("CFP semifinalists", normalized.cfbSemifinalists, normalized.cfbPlayoffTeams, errors);
  validateSingleInList("National champion", normalized.cfbNationalChampion, normalized.cfbSemifinalists, errors);
  validateSubset("NFL division champions", normalized.nflDivisionChampions, normalized.nflPlayoffTeams, errors);
  validateSubset("Conference championship teams", normalized.nflConferenceChampionshipTeams, normalized.nflPlayoffTeams, errors);
  validateSingleInList("Super Bowl champion", normalized.nflSuperBowlChampion, normalized.nflConferenceChampionshipTeams, errors);
  validateConferenceAndDivisionRules(normalized, errors);

  return { normalized, errors };
}
