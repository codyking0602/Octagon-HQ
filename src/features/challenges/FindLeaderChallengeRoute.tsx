import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PlayPage from "../play/PlayPage";
import { usePlayChallenges } from "./ChallengeProvider";

export default function FindLeaderChallengeRoute() {
  const location = useLocation();
  const { activeProfile, getChallenge, markOpened } = usePlayChallenges();
  const searchParams = new URLSearchParams(location.search);
  const matchCode = searchParams.get("match")?.toUpperCase() ?? "";
  const legacyCode = searchParams.get("challenge")?.toUpperCase() ?? "";
  const challengeCode = matchCode || legacyCode;
  const challenge = challengeCode ? getChallenge(challengeCode) : null;

  useEffect(() => {
    if (
      challenge
      && activeProfile?.id === challenge.recipientId
      && !challenge.openedAt
      && !challenge.completedAt
      && !challenge.declinedAt
    ) {
      markOpened(challenge.code);
    }
  }, [activeProfile?.id, challenge, markOpened]);

  if (matchCode && !legacyCode) {
    searchParams.set("challenge", matchCode);
    return <Navigate replace to={`${location.pathname}?${searchParams.toString()}`} />;
  }

  return <PlayPage />;
}
