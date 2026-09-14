import {
  createFootballWavelengthRound,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
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

function buildWavelengthSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|wavelength|${scheduleVersion}|${day}`;
  const round = createFootballWavelengthRound(seed);
  const opening = round.clues[0]!;
  return {
    setupKey: `football-wavelength:${scheduleVersion}:${day}`,
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
  return persistenceSetup(gameType, day, scheduleVersion, buildWavelengthSetup(day, scheduleVersion));
}
