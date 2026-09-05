import { useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { OfficialBlindResumeV3DailyView } from "./OfficialBlindResumeV3DailyView";
import {
  OfficialBlindRankCanonicalOrder,
  OfficialBlindRankComboResult,
  OfficialBlindRankScoreSummary,
} from "./OfficialBlindRankResult";
import { OfficialHitTheNumberDailyView } from "./OfficialHitTheNumberDailyView";
import {
  DailyRankKeepComboStatus,
  dailyRankKeepComboComponentScore,
} from "./DailyRankKeepComboStatus";
import { OfficialTodayChallengeView } from "./OfficialTodayChallengePresentation";
import {
  todayChallengeAdapter,
  type DailyGameType,
} from "./todaysChallengeAdapters";
import type {
  TodayChallengeProjection,
  TodayChallengeRepository,
} from "./todayChallengeRepository";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

export { OfficialTodayChallengeView } from "./OfficialTodayChallengePresentation";

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Today’s Challenge could not be updated.";
}

export function officialDailyGameAllowsCasualReplay(gameType: DailyGameType) {
  return gameType !== "blind_rank_5" && gameType !== "keep_4_cut_4";
}

function OfficialResultActions({
  casualRoute,
  onNavigate,
}: {
  casualRoute: string | null;
  onNavigate: (route: string) => void;
}) {
  return (
    <div className="official-daily-result-actions">
      {casualRoute ? <button type="button" onClick={() => onNavigate(casualRoute)}>PLAY CASUAL</button> : null}
      <button type="button" onClick={() => onNavigate("/play")}>ALL GAMES</button>
    </div>
  );
}

export function OfficialTodayChallengeContent({
  projection,
  busy,
  onAdvance,
  onNavigate,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onNavigate: (route: string) => void;
}) {
  const adapter = todayChallengeAdapter(projection.gameType);
  const blindResumeV3 = projection.gameType === "blind_resume"
    && projection.contentVersion === "blind-resume-v3";
  const keepCutComponentScore = dailyRankKeepComboComponentScore(projection, "keep_cut");
  const presentationProjection = keepCutComponentScore !== null && projection.officialAttempt
    ? {
        ...projection,
        officialAttempt: {
          ...projection.officialAttempt,
          normalizedScore: keepCutComponentScore,
        },
      }
    : projection;

  return (
    <>
      <DailyRankKeepComboStatus projection={projection} />
      <OfficialBlindRankScoreSummary projection={projection} />
      <OfficialBlindRankComboResult projection={projection} />
      {blindResumeV3 ? (
        <OfficialBlindResumeV3DailyView
          projection={projection}
          busy={busy}
          onAdvance={onAdvance}
          onNavigate={onNavigate}
        />
      ) : projection.gameType === "hit_the_number" ? (
        <OfficialHitTheNumberDailyView
          projection={projection}
          busy={busy}
          onAdvance={onAdvance}
        />
      ) : (
        <OfficialTodayChallengeView
          projection={presentationProjection}
          busy={busy}
          onAdvance={onAdvance}
          onNavigate={onNavigate}
        />
      )}
      <OfficialBlindRankCanonicalOrder projection={projection} />
      {projection.officialAttempt && adapter ? (
        <OfficialResultActions
          casualRoute={officialDailyGameAllowsCasualReplay(projection.gameType) ? adapter.casualRoute : null}
          onNavigate={onNavigate}
        />
      ) : null}
    </>
  );
}

export default function OfficialTodayChallengePage({
  expectedGameType,
  repository,
}: {
  expectedGameType: DailyGameType;
  repository?: TodayChallengeRepository | null;
}) {
  const identity = useIdentity();
  const navigate = useNavigate();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const runtime = useTodayChallengeRuntime({
    profileId: identity.profile?.id ?? "signed-out",
    enabled: signedIn,
    repository,
  });
  const adapter = useMemo(
    () => runtime.projection ? todayChallengeAdapter(runtime.projection.gameType) : null,
    [runtime.projection],
  );

  if (!signedIn) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate">
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>Sign in to play the official daily.</h1>
          <p>Your first attempt, unfinished progress, streak, and leaderboard result follow your profile across devices.</p>
          <button type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      </div>
    );
  }

  if (!runtime.configured) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error"><h1>Today’s Challenge is not connected.</h1></section>
      </div>
    );
  }

  if (!runtime.projection && runtime.loading) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-loading" aria-live="polite"><span /><strong>Loading today’s official game…</strong></section>
      </div>
    );
  }

  if (!runtime.projection) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error">
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>The official game did not load.</h1>
          <p>{errorMessage(runtime.error)}</p>
          <button type="button" onClick={() => void runtime.refresh()}>TRY AGAIN</button>
        </section>
      </div>
    );
  }

  if (runtime.projection.gameType !== expectedGameType && adapter) {
    return <Navigate replace to={adapter.dailyRoute} />;
  }

  return (
    <div className="official-daily-page">
      <RuntimeStatus error={runtime.error} onRefresh={() => { void runtime.refresh(); }} />
      <OfficialTodayChallengeContent
        projection={runtime.projection}
        busy={runtime.busy}
        onAdvance={(action) => { void runtime.advance(action); }}
        onNavigate={(route) => navigate(route)}
      />
    </div>
  );
}
