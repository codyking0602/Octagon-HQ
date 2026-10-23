import "../../styles/nba-game-actions.css";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { nbaCentralDay } from "../nba/nbaDailySchedule";
import { nbaWhoAmIDailyPreviewRounds } from "./nbaWhoAmIDailyPreview";
import "../../styles/nba-owner-daily.css";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import { createNbaWhoAmIAuthoredCasualRound, rememberNbaWhoAmIAuthoredCasualRound } from "./nbaWhoAmIAuthoredCasual";
import WhoAmIPage from "./WhoAmIPage";
import {
  sharedWhoAmIRound,
  storedWhoAmIChallengeRound,
  whoAmIChallengeGameVersion,
  whoAmIChallengeResultJson,
  whoAmISharedChallengeUrl,
  whoAmIChallengeSetup,
  type WhoAmICompletedResult,
} from "./whoAmIChallenge";

export default function NbaWhoAmIPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("who-am-i");
  const day = nbaCentralDay();
  const daily = searchParams.get("mode") === "daily" && !profileMatch.code && !searchParams.has("subject");
  const dailyRounds = useMemo(() => nbaWhoAmIDailyPreviewRounds(day), [day]);
  const [dailyRoundIndex, setDailyRoundIndex] = useState(0);
  const [dailyScores, setDailyScores] = useState<(number | null)[]>([null, null]);
  const challengeRound = profileMatch.challenge
    ? storedWhoAmIChallengeRound(profileMatch.challenge.setup, "nba")
    : null;
  const sharedRound = profileMatch.code ? null : sharedWhoAmIRound(searchParams, "nba");
  const initialRound = challengeRound ?? sharedRound ?? (daily ? dailyRounds[dailyRoundIndex] : null);

  async function challengeSomeone(round: WhoAmIRound, result: WhoAmICompletedResult) {
    return beginChallenge({
      gameId: "who-am-i",
      gameVersion: whoAmIChallengeGameVersion("nba"),
      gameTitle: "Who Am I?",
      summary: "NBA · exact 10-clue board",
      setup: whoAmIChallengeSetup(round),
      creatorResult: whoAmIChallengeResultJson(result),
      shareTitle: "Who Am I? Challenge",
      shareText: "I challenged you to the same NBA Who Am I board. How early can you solve it?",
      shareUrl: whoAmISharedChallengeUrl(round, window.location.origin),
    });
  }

  function recordChallengeResult(_round: WhoAmIRound, result: WhoAmICompletedResult) {
    if (profileMatch.isRecipient && profileMatch.challenge && profileMatch.challenge.responderResult === null) {
      profileMatch.submitResult(whoAmIChallengeResultJson(result));
    }
  }

  if (profileMatch.code && !profileMatch.challenge) {
    return <div className="page who-am-i-page"><section className="surface-card" aria-live="polite">
      <p className="eyebrow">PROFILE CHALLENGE</p><h1>Loading challenge…</h1>
      <p>Locking the exact Who Am I board that was sent to you.</p>
    </section></div>;
  }
  if (profileMatch.challenge && !challengeRound) {
    return <div className="page who-am-i-page"><section className="surface-card">
      <p className="eyebrow">PROFILE CHALLENGE</p><h1>Challenge unavailable</h1>
      <p>This matchup does not contain a valid NBA Who Am I board.</p>
    </section></div>;
  }

  return <>
    {daily ? <section className="nba-whoami-owner-daily" role="status" aria-label="NBA Who Am I private Daily rehearsal">
      <strong>NBA DAILY · OWNER PREVIEW · GAME {dailyRoundIndex + 1} OF 2</strong>
      <span>Private test · not ranked · no official result is saved</span>
      {dailyRoundIndex === 0 && dailyScores[0] !== null ? <button type="button" onClick={() => { setDailyRoundIndex(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>NEXT GAME →</button> : null}
      {dailyRoundIndex === 1 && dailyScores[1] !== null ? <strong>
        TWO-GAME PREVIEW AVERAGE: {Math.round((dailyScores[0]! + dailyScores[1]!) / 2)}/100
      </strong> : null}
      {dailyRoundIndex === 1 && dailyScores[1] !== null ? <button type="button" onClick={() => navigate("/nba")}>ALL NBA GAMES →</button> : null}
    </section> : null}
    <WhoAmIPage
    key={daily ? "nba-owner-daily-" + day + "-" + dailyRoundIndex : "nba-casual"}
    sport="nba"
    initialRound={initialRound ?? undefined}
    challengeFrom={profileMatch.creator?.displayName}
    onChallenge={daily ? undefined : challengeSomeone}
    onAllGames={() => navigate("/nba")}
    onComplete={daily ? (_round, result) => {
      setDailyScores(previous => {
        if (previous[dailyRoundIndex] !== null) return previous;
        const next = [...previous]; next[dailyRoundIndex] = result.score; return next;
      });
    } : recordChallengeResult}
    onRoundShown={daily ? undefined : rememberNbaWhoAmIAuthoredCasualRound}
    createRound={(excluded) => daily ? dailyRounds[dailyRoundIndex] : createNbaWhoAmIAuthoredCasualRound(Math.random, excluded.NBA)}
    disableReplay={daily}
  />
  </>;
}
