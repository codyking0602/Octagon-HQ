import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import WavelengthGame, { type WavelengthChallengeResult } from "./WavelengthGame";

function setupSeed(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return "";
  const setup = value as Record<string, unknown>;
  return typeof setup.seed === "string" ? setup.seed : "";
}

export default function WavelengthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeProfile,
    profiles,
    getChallenge,
    markOpened,
    submitResult,
  } = usePlayChallenges();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const profileChallengeCode = params.get("profileChallenge")?.toUpperCase() ?? "";
  const profileChallenge = profileChallengeCode ? getChallenge(profileChallengeCode) : null;
  const profileSeed = profileChallenge?.gameId === "wavelength" ? setupSeed(profileChallenge.setup) : "";
  const challengeSeed = useMemo(() => {
    const value = profileSeed || params.get("challenge") || "";
    return /^[a-z0-9-]{3,80}$/i.test(value) ? value : undefined;
  }, [params, profileSeed]);
  const creator = profileChallenge
    ? profiles.find((profile) => profile.id === profileChallenge.creatorId)
    : null;

  useEffect(() => {
    if (profileChallenge && activeProfile?.id === profileChallenge.recipientId) {
      markOpened(profileChallenge.code);
    }
  }, [activeProfile?.id, markOpened, profileChallenge]);

  function completeProfileChallenge(result: WavelengthChallengeResult) {
    if (!profileChallenge || activeProfile?.id !== profileChallenge.recipientId) return;
    submitResult(profileChallenge.code, result);
  }

  return (
    <WavelengthGame
      challengeFrom={creator?.displayName}
      challengeSeed={challengeSeed}
      onChallengeComplete={completeProfileChallenge}
      onExit={() => navigate("/play")}
    />
  );
}
