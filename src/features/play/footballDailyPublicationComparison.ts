import {
  buildFootballKeepCutLineup,
  footballKeepCutPacks,
} from "../back-room/footballKeepCutModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  type FootballLeague,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "../back-room/footballRankFivePlayableModel";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION,
  FOOTBALL_DAILY_RUNTIME_VERSION,
  SHARED_DAILY_DOUBLE_GRADING_VERSION,
  SHARED_DAILY_DOUBLE_SCORING_VERSION,
  persistenceSetup,
  type FootballDailyPersistenceSetup,
} from "./footballDailyPublicationShared";

function footballItemPresentation(item: FootballRankFiveItem) {
  return { id: item.id, name: item.name, subtitle: item.subtitle, league: item.league };
}

function itemMap(items: readonly FootballRankFiveItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, footballItemPresentation(item)]));
}

function dailyLeague(day: string): FootballLeague {
  return stableLineupHash(`${FOOTBALL_DAILY_RUNTIME_VERSION}|daily-double|${day}`) % 2 === 0 ? "NFL" : "CFB";
}

function packLeague(pack: { items: readonly FootballRankFiveItem[] }) {
  return pack.items[0]?.league ?? "NFL";
}

function dailyComparisonPack(day: string, scheduleVersion: string, half: "rank" | "keep") {
  const rankLeague = dailyLeague(day);
  const league: FootballLeague = half === "rank" ? rankLeague : rankLeague === "NFL" ? "CFB" : "NFL";
  const source = half === "rank" ? footballRankFivePacks : footballKeepCutPacks;
  const candidates = source.filter((pack) => packLeague(pack) === league);
  if (!candidates.length) throw new Error(`Football ${half} daily has no ${league} pack.`);
  const random = seededLineupRandom(
    FOOTBALL_DAILY_RUNTIME_VERSION,
    "daily-double",
    scheduleVersion,
    day,
    half,
  );
  return candidates[Math.floor(random() * candidates.length)]!;
}

function buildBlindRankSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = dailyComparisonPack(day, scheduleVersion, "rank");
  const lineup = buildFootballRankFiveLineup(
    pack.id as FootballRankFivePackId,
    `${FOOTBALL_DAILY_RUNTIME_VERSION}|rank|${scheduleVersion}|${day}`,
  );
  const presentations = itemMap(lineup);
  const ratings = Object.fromEntries(lineup.map((item) => [item.id, item.rating]));
  return {
    setupKey: `football-blind-rank:${scheduleVersion}:${day}:${pack.id}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      pack: {
        id: pack.id,
        name: pack.name,
        prompt: pack.prompt,
        intro: pack.intro,
        league: packLeague(pack),
      },
      initial_state: {
        complete: false,
        reveal_index: 0,
        slots: [null, null, null, null, null],
        current_subject: footballItemPresentation(lineup[0]!),
      },
    },
    revealSetup: {
      subjects: lineup.map((item) => ({ ...footballItemPresentation(item), rating: item.rating })),
    },
    privateSetupEvidence: {
      fighter_ids: lineup.map((item) => item.id),
      presentations,
    },
    privateGradingEvidence: {
      fighter_ids: lineup.map((item) => item.id),
      ratings,
      tolerance: 1,
    },
  };
}

function buildKeepCutSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = dailyComparisonPack(day, scheduleVersion, "keep");
  const lineup = buildFootballKeepCutLineup(
    pack.id,
    `${FOOTBALL_DAILY_RUNTIME_VERSION}|keep|${scheduleVersion}|${day}`,
  );
  const presentations = itemMap(lineup);
  const ratings = Object.fromEntries(lineup.map((item) => [item.id, item.rating]));
  return {
    setupKey: `football-keep-cut:${scheduleVersion}:${day}:${pack.id}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      pack: {
        id: pack.id,
        name: pack.name,
        prompt: pack.prompt,
        intro: pack.intro,
        league: packLeague(pack),
      },
      initial_state: {
        complete: false,
        reveal_index: 0,
        kept: [],
        cut: [],
        current_subject: footballItemPresentation(lineup[0]!),
        forced_choice: null,
      },
    },
    revealSetup: {
      subjects: lineup.map((item) => ({ ...footballItemPresentation(item), rating: item.rating })),
    },
    privateSetupEvidence: {
      fighter_ids: lineup.map((item) => item.id),
      presentations,
    },
    privateGradingEvidence: {
      fighter_ids: lineup.map((item) => item.id),
      ratings,
      tolerance: 1,
    },
  };
}

function persistenceChild(publication: OfficialDailySetupPublication) {
  return {
    setup_key: publication.setupKey,
    public_setup: publication.publicSetup,
    reveal_setup: publication.revealSetup,
    private_setup_evidence: publication.privateSetupEvidence,
    private_grading_evidence: publication.privateGradingEvidence,
  };
}

function buildDailyDoublePersistence(
  day: string,
  scheduleVersion: string,
): FootballDailyPersistenceSetup {
  const rank = buildBlindRankSetup(day, scheduleVersion);
  const keep = buildKeepCutSetup(day, scheduleVersion);
  return {
    gameType: "keep_4_cut_4",
    scheduleVersion,
    setupKey: `${FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION,
    scoringVersion: SHARED_DAILY_DOUBLE_SCORING_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      stage_count: 2,
      initial_state: {
        complete: false,
        combo_stage: "blind_rank_5",
        blind_rank_5: rank.publicSetup.initial_state,
      },
    },
    revealSetup: {
      blind_rank_5: rank.revealSetup,
      keep_4_cut_4: keep.revealSetup,
    },
    privateSetupEvidence: {
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      blind_rank_5: persistenceChild(rank),
      keep_4_cut_4: persistenceChild(keep),
    },
    privateGradingEvidence: {
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      blind_rank: rank.privateGradingEvidence,
      keep_cut: keep.privateGradingEvidence,
    },
  };
}

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType === "blind_rank_5") {
    return persistenceSetup(gameType, day, scheduleVersion, buildBlindRankSetup(day, scheduleVersion));
  }
  if (gameType === "keep_4_cut_4") {
    return buildDailyDoublePersistence(day, scheduleVersion);
  }
  throw new Error("Football comparison publication runtime received the wrong game type.");
}
