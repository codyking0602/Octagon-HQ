import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocation } from "react-router-dom";
import { brand } from "../config/brand";
import { usePlayChallenges } from "../features/challenges/ChallengeProvider";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { usePicks } from "../features/picks/PicksProvider";
import { useFindLeaderHistory } from "../features/play/FindLeaderHistoryProvider";
import { useProfilePreferences } from "../features/profile/ProfilePreferencesProvider";
import { useWhatsNew } from "../features/whats-new/WhatsNewProvider";
import {
  PULL_REFRESH_HOLD_DISTANCE,
  PULL_REFRESH_INTENT_DISTANCE,
  PULL_REFRESH_THRESHOLD,
  pullRefreshReady,
  resistedPullDistance,
  verticalPullIntent,
} from "./pullRefreshModel";

type PullPhase = "idle" | "pulling" | "ready" | "refreshing";

type PullGesture = {
  x: number;
  y: number;
  accepted: boolean;
};

const IGNORED_PULL_TARGETS = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[data-pull-refresh-ignore]",
].join(",");

function pulseHaptic(pattern: number | number[]) {
  try {
    if (typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch {
    // Haptics are optional and must never block refresh.
  }
}

export function BrandedPullToRefresh({ children }: PropsWithChildren) {
  const location = useLocation();
  const notifications = useNotifications();
  const whatsNew = useWhatsNew();
  const profilePreferences = useProfilePreferences();
  const picks = usePicks();
  const findLeader = useFindLeaderHistory();
  const challenges = usePlayChallenges();
  const regionRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<PullGesture | null>(null);
  const thresholdReachedRef = useRef(false);
  const refreshingRef = useRef(false);
  const refreshRunRef = useRef(0);
  const [phase, setPhase] = useState<PullPhase>("idle");
  const phaseRef = useRef<PullPhase>(phase);
  phaseRef.current = phase;

  const applyDistance = useCallback((distance: number) => {
    const region = regionRef.current;
    if (!region) return;
    const normalizedDistance = Math.max(0, distance);
    region.style.setProperty("--pull-refresh-distance", `${Math.round(normalizedDistance)}px`);
    region.style.setProperty(
      "--pull-refresh-progress",
      String(Math.min(1, normalizedDistance / PULL_REFRESH_THRESHOLD)),
    );
  }, []);

  const setPullPhase = useCallback((nextPhase: PullPhase) => {
    if (phaseRef.current === nextPhase) return;
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const resetGesture = useCallback((cancelRefresh = false) => {
    gestureRef.current = null;
    thresholdReachedRef.current = false;
    if (cancelRefresh) {
      refreshRunRef.current += 1;
      refreshingRef.current = false;
    }
    applyDistance(0);
    setPullPhase("idle");
  }, [applyDistance, setPullPhase]);

  const refreshApp = useCallback(async () => {
    const tasks: Promise<unknown>[] = [
      notifications.refresh(),
      whatsNew.refresh(),
      picks.refresh(),
      challenges.refresh(),
      profilePreferences.refresh(),
      findLeader.refresh(),
    ];

    if (findLeader.dailyLeaderboardDay) {
      tasks.push(findLeader.loadDailyLeaderboard(findLeader.dailyLeaderboardDay));
    }

    await Promise.allSettled(tasks);
  }, [
    challenges.refresh,
    findLeader.dailyLeaderboardDay,
    findLeader.loadDailyLeaderboard,
    findLeader.refresh,
    notifications.refresh,
    picks.refresh,
    profilePreferences.refresh,
    whatsNew.refresh,
  ]);
  const refreshAppRef = useRef(refreshApp);
  refreshAppRef.current = refreshApp;

  useEffect(() => {
    resetGesture(true);
  }, [location.key, resetGesture]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    const cancelPull = () => {
      gestureRef.current = null;
      thresholdReachedRef.current = false;
      if (!refreshingRef.current) {
        applyDistance(0);
        setPullPhase("idle");
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1
        || window.scrollY > 0
        || refreshingRef.current
      ) return;
      const target = event.target;
      if (target instanceof Element && target.closest(IGNORED_PULL_TARGETS)) return;

      const touch = event.touches[0];
      gestureRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        accepted: false,
      };
      thresholdReachedRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || event.touches.length !== 1 || refreshingRef.current) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - gesture.x;
      const deltaY = touch.clientY - gesture.y;

      if (!gesture.accepted) {
        if (
          Math.abs(deltaX) < PULL_REFRESH_INTENT_DISTANCE
          && Math.abs(deltaY) < PULL_REFRESH_INTENT_DISTANCE
        ) return;
        if (!verticalPullIntent(deltaX, deltaY)) {
          cancelPull();
          return;
        }
        gesture.accepted = true;
        setPullPhase("pulling");
      }

      if (window.scrollY > 0 || deltaY <= 0) {
        cancelPull();
        return;
      }

      event.preventDefault();
      const nextDistance = resistedPullDistance(deltaY);
      applyDistance(nextDistance);

      const ready = pullRefreshReady(nextDistance);
      if (ready && !thresholdReachedRef.current) pulseHaptic(8);
      thresholdReachedRef.current = ready;
      setPullPhase(ready ? "ready" : "pulling");
    };

    const onTouchEnd = () => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (!gesture || refreshingRef.current) return;

      if (!gesture.accepted || !thresholdReachedRef.current) {
        thresholdReachedRef.current = false;
        applyDistance(0);
        setPullPhase("idle");
        return;
      }

      thresholdReachedRef.current = false;
      refreshingRef.current = true;
      const refreshRun = ++refreshRunRef.current;
      applyDistance(PULL_REFRESH_HOLD_DISTANCE);
      setPullPhase("refreshing");

      void refreshAppRef.current().finally(() => {
        if (refreshRun !== refreshRunRef.current) return;
        refreshingRef.current = false;
        pulseHaptic(12);
        applyDistance(0);
        setPullPhase("idle");
      });
    };

    content.addEventListener("touchstart", onTouchStart, { passive: true });
    content.addEventListener("touchmove", onTouchMove, { passive: false });
    content.addEventListener("touchend", onTouchEnd, { passive: true });
    content.addEventListener("touchcancel", cancelPull, { passive: true });

    return () => {
      content.removeEventListener("touchstart", onTouchStart);
      content.removeEventListener("touchmove", onTouchMove);
      content.removeEventListener("touchend", onTouchEnd);
      content.removeEventListener("touchcancel", cancelPull);
      refreshRunRef.current += 1;
      refreshingRef.current = false;
      gestureRef.current = null;
      thresholdReachedRef.current = false;
    };
  }, [applyDistance, setPullPhase]);

  return (
    <div
      ref={regionRef}
      className={`pull-refresh-region pull-refresh-region--${phase}`}
    >
      <div className="pull-refresh-reveal" aria-hidden="true">
        <span className="pull-refresh-logo">
          <img src={brand.logoUrl} alt="" decoding="async" />
          <span className="pull-refresh-logo__flash" />
        </span>
      </div>
      <div ref={contentRef} className="pull-refresh-content">
        {children}
      </div>
    </div>
  );
}
