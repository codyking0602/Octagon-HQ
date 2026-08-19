import {
  buildFindLeaderBoard,
  centralDay,
  findLeaderQuestions,
  type FindLeaderBoard,
} from "./findLeaderEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "./lineupModel";

export interface FindLeaderRun {
  board: FindLeaderBoard;
  identity: PlayLineupIdentity;
}

export function resolveSeededFindLeaderBoard(
  definitionId: string,
  seed: string,
  day = centralDay(),
) {
  const definition = findLeaderQuestions.find((row) => row.id === definitionId);
  return definition ? buildFindLeaderBoard(definition, seed, day) : null;
}

export function buildReplayableFindLeaderBoard(seed: string, day = centralDay()) {
  const definitions = shuffleLineup(
    findLeaderQuestions,
    seededLineupRandom("find-leader", "definition", seed),
  );

  for (const definition of definitions) {
    const board = buildFindLeaderBoard(definition, seed, day);
    if (board) return board;
  }

  throw new Error("Find the Leader could not build a valid replayable board.");
}

function lineupItemIds(board: FindLeaderBoard) {
  const decoyIds = board.candidates
    .filter((fighter) => fighter.id !== board.leaderId)
    .map((fighter) => fighter.id);
  return [
    `category:${board.definitionId}`,
    `leader:${board.leaderId}`,
    ...decoyIds.slice(0, 8),
  ];
}

export function createReplayableFindLeaderRun(day = centralDay()): FindLeaderRun {
  const selected = selectReplayLineup({
    gameId: "find-leader",
    scopeId: "casual",
    lineupSize: 10,
    attempts: 18,
    build: (seed) => {
      const board = buildReplayableFindLeaderBoard(seed, day);
      const fighterIds = board.candidates.map((fighter) => fighter.id);
      return {
        value: board,
        itemIds: lineupItemIds(board),
        fighterIds,
      };
    },
  });

  return { board: selected.value, identity: selected.identity };
}
