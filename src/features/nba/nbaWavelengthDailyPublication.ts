import { createNbaWavelengthRound } from "./nbaWavelengthModel";
import { buildTwoGameDailyPublication } from "../play/dailyTwoGameRuntime";
import { WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";

export const NBA_WAVELENGTH_SERVER_VERSION = "nba-wavelength-official-v1";

export function buildNbaWavelengthDailyPublication(day: string, scheduleVersion: string, ordinal: number): OfficialDailySetupPublication {
  const seed = `${NBA_WAVELENGTH_SERVER_VERSION}|${scheduleVersion}|${day}|${ordinal}`;
  const first = createNbaWavelengthRound(seed + "|1");
  let secondSeed = seed + "|2";
  let second = createNbaWavelengthRound(secondSeed, { targets: [first.target], clueIds: [first.clues[0]!.id], subjects: [first.clues[0]!.subject] });
  if (second.target === first.target || second.clues[0]?.id === first.clues[0]?.id) {
    for(let attempt=0; attempt<24; attempt++) {
      secondSeed=seed+"|2|"+attempt;
      second = createNbaWavelengthRound(secondSeed, { targets: [first.target], clueIds: [first.clues[0]!.id], subjects: [first.clues[0]!.subject] });
      if (second.target !== first.target && second.clues[0]?.id !== first.clues[0]?.id) break;
    }
    if(second.target===first.target || second.clues[0]?.id===first.clues[0]?.id) throw new Error("NBA Wavelength second round is not distinct.");
  }
  const single = (round: typeof first, index: number): OfficialDailySetupPublication => {
    const opening = round.clues[0]!;
    const childSeed = index === 0 ? seed+"|1" : secondSeed;
    return {
      setupKey: `${NBA_WAVELENGTH_SERVER_VERSION}:${scheduleVersion}:${day}:${index+1}`,
      contentVersion: NBA_WAVELENGTH_SERVER_VERSION,
      scoringVersion: WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
      publicSetup: {
        runtime_version: NBA_WAVELENGTH_SERVER_VERSION,
        league: "NBA",
        initial_state: { complete:false,guesses:[],clues:[{id:opening.id,category:opening.category,text:opening.text}],next_guess_number:1,reveal:null },
      },
      revealSetup: {},
      privateSetupEvidence: { seed: childSeed, target:round.target, opening_clue_id:opening.id },
      privateGradingEvidence: { target:round.target },
    };
  };
  return buildTwoGameDailyPublication({
    sport:"nba", gameType:"wavelength",day,scheduleVersion,
    children:[single(first,0),single(second,1)],
  });
}
