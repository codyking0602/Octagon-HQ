import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import type { ChallengeJson, PlayChallenge } from "../challenges/challengeModel";
import { BLIND_RESUME_V3_GAME_VERSION } from "./blindResumeV3";
import OfficialTodayChallengePage from "./OfficialTodayChallengePage";
import type { PlayGameId } from "./playRegistry";
import type { DailyGameType } from "./todaysChallengeAdapters";

const PROFILE_CHALLENGE_GAME_ID: Partial<Record<DailyGameType, PlayGameId>> = {
  blind_resume: "blind-resume",
  blind_rank_5: "blind-rank",
  keep_4_cut_4: "keep-cut",
  hit_the_number: "hit-the-number",
};

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function strings(value: ChallengeJson | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function storedProfileChallengeSetupIsUsable(challenge: PlayChallenge) {
  const setup = record(challenge.setup);
  if (!setup) return false;

  switch (challenge.gameId) {
    case "blind-resume": {
      if (typeof setup.seed !== "string" || !setup.seed) return false;
      if (challenge.gameVersion === BLIND_RESUME_V3_GAME_VERSION) {
        return Boolean(record(setup.v3Card));
      }
      const roundSet = record(setup.roundSet);
      return Boolean(roundSet && Array.isArray(roundSet.pairs) && roundSet.pairs.length === 5);
    }
    case "blind-rank":
      return typeof setup.packId === "string" && strings(setup.lineupIds).length === 5;
    case "keep-cut":
      return typeof setup.packId === "string" && strings(setup.lineupIds).length === 8;
    case "hit-the-number":
      return typeof setup.seed === "string"
        && Boolean(record(setup.publicSetup))
        && Boolean(record(setup.format));
    default:
      return true;
  }
}

function ProfileChallengeGate({ gameId, casual }: { gameId: PlayGameId; casual: ReactElement }) {
  const profileMatch = useProfileChallengeMatch(gameId);

  if (!profileMatch.code) return casual;
  if (!profileMatch.challenge) {
    return (
      <div className="page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">PROFILE CHALLENGE</p>
          <h1>Loading challenge…</h1>
          <p>Locking the exact challenge that was sent to you.</p>
        </section>
      </div>
    );
  }
  if (!storedProfileChallengeSetupIsUsable(profileMatch.challenge)) {
    return (
      <div className="page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">PROFILE CHALLENGE</p>
          <h1>Challenge unavailable</h1>
          <p>This matchup does not contain a valid stored game setup.</p>
        </section>
      </div>
    );
  }

  return casual;
}

export function isOfficialDailyRoute(gameType: DailyGameType, search: string) {
  const params = new URLSearchParams(search);
  if (params.get("mode") === "daily") return true;
  if (gameType !== "find_leader") return false;

  return !params.get("mode")
    && !params.get("challenge")
    && !params.get("match")
    && !params.get("day")
    && !params.get("definition")
    && !params.get("seed");
}

export default function TodayChallengeGameRoute({
  gameType,
  casual,
}: {
  gameType: DailyGameType;
  casual: ReactElement;
}) {
  const location = useLocation();
  if (isOfficialDailyRoute(gameType, location.search)) {
    return <OfficialTodayChallengePage expectedGameType={gameType} />;
  }

  const profileGameId = PROFILE_CHALLENGE_GAME_ID[gameType];
  return profileGameId
    ? <ProfileChallengeGate gameId={profileGameId} casual={casual} />
    : casual;
}
