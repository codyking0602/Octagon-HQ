import {
  createFootballWavelengthRound,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import { dailyUsesTwoGameAverage } from "./dailyTwoGameContract";
import { buildTwoGameDailyPublication } from "./dailyTwoGameRuntime";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

function cluePresentation(clue: FootballWavelengthClue) {
  return { id: clue.id, category: clue.category, text: clue.text };
}

function buildWavelengthRound(day: string, scheduleVersion: string, gameIndex: number) {
  const gameOneSeed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|wavelength|${scheduleVersion}|${day}`;
  const gameOne = createFootballWavelengthRound(gameOneSeed);
  if (gameIndex === 0) return { seed: gameOneSeed, round: gameOne };

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const seed = `${gameOneSeed}|game-2|${attempt}`;
    const round = createFootballWavelengthRound(seed);
    if (
      round.target !== gameOne.target
      && round.clues[0]?.id !== gameOne.clues[0]?.id
      && round.clues[0]?.category !== gameOne.clues[0]?.category
    ) {
      return { seed, round };
    }
  }
  throw new Error("Football Wavelength could not build a distinct second Daily game.");
}

function buildWavelengthSetup(day: string, scheduleVersion: string, gameIndex = 0): OfficialDailySetupPublication {
  const { seed, round } = buildWavelengthRound(day, scheduleVersion, gameIndex);
  const opening = round.clues[0]!;
  return {
    setupKey: `football-wavelength:${scheduleVersion}:${day}${gameIndex === 0 ? "" : ":game-2"}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      initial_state: {
        complete: false,
        guesses: [],
        clues: [cluePresentation(opening)],
        next_guess_number: 1,
        reveal: null,
      },
    },
    revealSetup: {},
    privateSetupEvidence: { seed, target: round.target, opening_clue_id: opening.id },
    privateGradingEvidence: { target: round.target },
  };
}

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "wavelength") throw new Error("Football Wavelength publication runtime received the wrong game type.");
  const publication = dailyUsesTwoGameAverage(gameType, day)
    ? buildTwoGameDailyPublication({
        sport: "football",
        gameType,
        day,
        scheduleVersion,
        children: [
          buildWavelengthSetup(day, scheduleVersion, 0),
          buildWavelengthSetup(day, scheduleVersion, 1),
        ],
      })
    : buildWavelengthSetup(day, scheduleVersion);
  return persistenceSetup(gameType, day, scheduleVersion, publication);
}
