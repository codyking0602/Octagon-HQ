import {
  FOOTBALL_FUTURES_RULES,
  type FootballFuturesPicks,
} from "./footballPicksScoring";

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

  return { normalized, errors };
}
