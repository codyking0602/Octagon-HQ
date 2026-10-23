import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import BarTriviaCasualPage from "../play/BarTriviaCasualPage";
import {
  NBA_BAR_TRIVIA_UNIQUE_APPEARANCES,
  buildNbaBarTriviaDailyBoard,
} from "./nbaBarTriviaDailyRotation";

/** Daily-only owner sandbox; NEVER submits official Daily progress or scores. */
export default function NbaBarTriviaOwnerPreviewPage() {
  const [searchParams] = useSearchParams();
  const requested = Number(searchParams.get("slot") ?? "0");
  const slot = Number.isSafeInteger(requested)
    ? Math.max(0, Math.min(NBA_BAR_TRIVIA_UNIQUE_APPEARANCES - 1, requested))
    : 0;
  const board = useMemo(() => buildNbaBarTriviaDailyBoard(slot), [slot]);

  return (
    <div data-testid="nba-bar-trivia-owner-preview">
      <BarTriviaCasualPage
        key={slot}
        scope="nba"
        runOverride={board.questions}
        doubleRoundOverride={board.doubleRound}
        onSettled={() => undefined}
        ownerNote={`OWNER-ONLY DAILY PREVIEW · APPEARANCE ${slot + 1}/${NBA_BAR_TRIVIA_UNIQUE_APPEARANCES} · NO OFFICIAL RESULTS OR LEADERBOARD WRITES`}
      />
    </div>
  );
}
