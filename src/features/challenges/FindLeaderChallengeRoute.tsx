import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PlayPage from "../play/PlayPage";
import { usePlayChallenges } from "./ChallengeProvider";

export default function FindLeaderChallengeRoute() {
  const location = useLocation();
  const { activeProfile, getChallenge, markOpened } = usePlayChallenges();
  const challengeCode = new URLSearchParams(location.search).get("challenge")?.toUpperCase() ?? "";
  const challenge = challengeCode ? getChallenge(challengeCode) : null;

  useEffect(() => {
    if (
      challenge
      && activeProfile?.id === challenge.recipientId
      && !challenge.openedAt
      && !challenge.completedAt
    ) {
      markOpened(challenge.code);
    }
  }, [activeProfile?.id, challenge, markOpened]);

  return <PlayPage />;
}
