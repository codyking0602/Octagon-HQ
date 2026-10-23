import { createNbaFindLeaderBoard, type NbaLeaderBoard } from "./nbaFindTheLeaderModel";
import { buildTwoGameDailyPublication } from "../play/dailyTwoGameRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";

const NBA_FIND_LEADER_SERVER_CONTENT_VERSION = "nba-find-leader-official-v1";

function boardFor(
  day: string, scheduleVersion: string, ordinal: number, roundIndex: number,
  excludeDefinitionId?: string,
): NbaLeaderBoard {
  for (let attempt = 0; attempt < 24; attempt++) {
    const board = createNbaFindLeaderBoard(
      `${NBA_FIND_LEADER_SERVER_CONTENT_VERSION}|${scheduleVersion}|${day}|${ordinal}|${roundIndex}|${attempt}`,
    );
    if (board.definitionId !== excludeDefinitionId) return board;
  }
  throw new Error("NBA Find the Leader cannot provide two distinct daily boards.");
}

function single(day: string, scheduleVersion: string, board: NbaLeaderBoard, roundIndex: number): OfficialDailySetupPublication {
  const candidates = board.candidates.map(({ id, name, displayName, subtitle, season, seasonLabel }) => ({
    id, name, display_name: displayName, subtitle,
    ...(season == null ? {} : { season }),
    ...(seasonLabel ? { season_label: seasonLabel } : {}),
  }));
  return {
    setupKey: `${NBA_FIND_LEADER_SERVER_CONTENT_VERSION}:${scheduleVersion}:${day}:${roundIndex + 1}:${board.definitionId}`,
    contentVersion: NBA_FIND_LEADER_SERVER_CONTENT_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: NBA_FIND_LEADER_SERVER_CONTENT_VERSION, league: "NBA",
      question: board.question, context: board.context, stat_label: board.statLabel,
      candidates,
      initial_state: { complete: false, eliminated_ids: [], native_progress: 0 },
    },
    revealSetup: {
      leader_id: board.leaderId, leader_value: board.leaderValue,
      candidates: board.candidates,
    },
    privateSetupEvidence: {
      candidate_ids: board.candidates.map(row => row.id),
      leader_id: board.leaderId,
    },
    privateGradingEvidence: {
      candidate_ids: board.candidates.map(row => row.id),
      leader_id: board.leaderId,
    },
  };
}

export function buildNbaFindLeaderDailyPublication(
  day: string, scheduleVersion: string, ordinal: number,
): OfficialDailySetupPublication {
  const first = boardFor(day, scheduleVersion, ordinal, 0);
  const second = boardFor(day, scheduleVersion, ordinal, 1, first.definitionId);
  return buildTwoGameDailyPublication({
    sport: "nba", gameType: "find_leader", day, scheduleVersion,
    children: [single(day, scheduleVersion, first, 0), single(day, scheduleVersion, second, 1)],
  });
}
