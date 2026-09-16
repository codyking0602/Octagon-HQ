import { useNavigate } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import { createFootballWhoAmIRound } from "../games/whoAmIAuthority";
import WhoAmIPage from "./WhoAmIPage";
import {
  storedWhoAmIChallengeRound,
  whoAmIChallengeGameVersion,
  whoAmIChallengePath,
  whoAmIChallengeResultJson,
  whoAmIChallengeSetup,
  type WhoAmICompletedResult,
} from "./whoAmIChallenge";

export default function FootballWhoAmIPage() {
  const navigate = useNavigate();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("who-am-i");
  const challengeRound = profileMatch.challenge
    ? storedWhoAmIChallengeRound(profileMatch.challenge.setup, "football")
    : null;

  async function challengeSomeone(round: WhoAmIRound, result: WhoAmICompletedResult) {
    const shareUrl = new URL(whoAmIChallengePath("football"), window.location.origin).toString();
    return beginChallenge({
      gameId: "who-am-i",
      gameVersion: whoAmIChallengeGameVersion("football"),
      gameTitle: "Who Am I?",
      summary: `${round.league} · exact 10-clue board`,
      setup: whoAmIChallengeSetup(round),
      creatorResult: whoAmIChallengeResultJson(result),
      shareTitle: "Who Am I? Challenge",
      shareText: `I challenged you to the same ${round.league} Who Am I board. How early can you solve it?`,
      shareUrl,
    });
  }

  function recordChallengeResult(_round: WhoAmIRound, result: WhoAmICompletedResult) {
    if (
      profileMatch.isRecipient
      && profileMatch.challenge
      && profileMatch.challenge.responderResult === null
    ) {
      profileMatch.submitResult(whoAmIChallengeResultJson(result));
    }
  }

  if (profileMatch.code && !profileMatch.challenge) {
    return (
      <div className="page who-am-i-page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">PROFILE CHALLENGE</p>
          <h1>Loading challenge…</h1>
          <p>Locking the exact Who Am I board that was sent to you.</p>
        </section>
      </div>
    );
  }

  if (profileMatch.challenge && !challengeRound) {
    return (
      <div className="page who-am-i-page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">PROFILE CHALLENGE</p>
          <h1>Challenge unavailable</h1>
          <p>This matchup does not contain a valid stored Who Am I board.</p>
        </section>
      </div>
    );
  }

  return (
    <WhoAmIPage
      sport="football"
      initialRound={challengeRound ?? undefined}
      challengeFrom={profileMatch.creator?.displayName}
      onChallenge={challengeSomeone}
      onAllGames={() => navigate("/football")}
      onComplete={recordChallengeResult}
      createRound={(excludedSubjectIdsByLeague) => (
        createFootballWhoAmIRound(Math.random, {
        NFL: excludedSubjectIdsByLeague.NFL,
        CFB: excludedSubjectIdsByLeague.CFB,
      })
      )}
    />
  );
}
