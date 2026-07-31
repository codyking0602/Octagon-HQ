import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLocation } from "react-router-dom";
import { brand } from "../config/brand";
import { usePlayChallenges } from "../features/challenges/ChallengeProvider";
import { useIdentity } from "../features/identity/IdentityProvider";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { usePicks } from "../features/picks/PicksProvider";
import { useFindLeaderHistory } from "../features/play/FindLeaderHistoryProvider";
import { useProfilePreferences } from "../features/profile/ProfilePreferencesProvider";
import { useWarRoom } from "../features/war-room/WarRoomProvider";
import { useWhatsNew } from "../features/whats-new/WhatsNewProvider";
import {
  PULL_REFRESH_THRESHOLD,
  pullRefreshReady,
  pullRefreshScope,
  resistedPullDistance,
} from "./pullRefreshModel";

type PullPhase = "idle" | "pulling" | "ready" | "refreshing" | "complete";

const COMPLETE_HOLD_MS = 420;
const IGNORED_PULL_TARGETS = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[aria-modal='true']",
  "[data-pull-refresh-ignore]",
].join(",");

function pulseHaptic(pattern: number | number[]) {
  try {
    if (typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch {
    // Haptics are optional and must never block refresh.
  }
}

export function BrandedPullToRefresh() {
  const identity = useIdentity();
  const location = useLocation();
  const notifications = useNotifications();
  const whatsNew = useWhatsNew();
  const warRoom = useWarRoom();
  const profilePreferences = useProfilePreferences();
  const picks = usePicks();
  const findLeader = useFindLeaderHistory();
  const challenges = usePlayChallenges();
  const scope = pullRefreshScope(location.pathname);
  const eligible = Boolean(identity.profile && scope);
  const [phase, setPhase] = useState<PullPhase>("idle");
  const [distance, setDistance] = useState(0);
  const phaseRef = useRef<PullPhase>(phase);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const thresholdReachedRef = useRef(false);
  const refreshingRef = useRef(false);
  const completeTimerRef = useRef<number | null>(null);
  phaseRef.current = phase;

  const reset = useCallback(() => {
    startRef.current = null;
    thresholdReachedRef.current = false;
    refreshingRef.current = false;
    setDistance(0);
    setPhase("idle");
  }, []);

  const refreshCurrentRoute = useCallback(async () => {
    if (!scope) return;
    const tasks: Promise<unknown>[] = [];

    switch (scope) {
      case "home":
        tasks.push(
          notifications.refresh(),
          whatsNew.refresh(),
          picks.refresh(),
          challenges.refresh(),
          profilePreferences.refresh(),
          findLeader.refresh(),
        );
        break;
      case "picks":
        tasks.push(notifications.refresh(), picks.refresh());
        break;
      case "play":
        tasks.push(notifications.refresh(), challenges.refresh(), findLeader.refresh());
        break;
      case "find-leader":
        tasks.push(notifications.refresh(), challenges.refresh(), findLeader.refresh());
        if (findLeader.dailyLeaderboardDay) {
          tasks.push(findLeader.loadDailyLeaderboard(findLeader.dailyLeaderboardDay));
        }
        break;
      case "notifications":
        tasks.push(notifications.refresh());
        break;
      case "whats-new":
        tasks.push(notifications.refresh(), whatsNew.refresh());
        break;
      case "war-room":
        tasks.push(notifications.refresh(), warRoom.refresh());
        break;
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
    scope,
    warRoom.refresh,
    whatsNew.refresh,
  ]);

  useEffect(() => reset(), [location.key, reset]);

  useEffect(() => {
    if (!eligible) return undefined;
    document.documentElement.classList.add("octagon-pull-refresh");

    const cancelPull = () => {
      startRef.current = null;
      thresholdReachedRef.current = false;
      if (!refreshingRef.current) {
        setDistance(0);
        setPhase("idle");
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1
        || window.scrollY > 0
        || refreshingRef.current
        || phaseRef.current === "complete"
      ) return;
      const target = event.target;
      if (target instanceof Element && target.closest(IGNORED_PULL_TARGETS)) return;
      const touch = event.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
      thresholdReachedRef.current = false;
      setPhase("pulling");
    };

    const onTouchMove = (event: TouchEvent) => {
      const start = startRef.current;
      if (!start || event.touches.length !== 1 || refreshingRef.current) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (window.scrollY > 0 || deltaY <= 0 || Math.abs(deltaX) > deltaY) {
        cancelPull();
        return;
      }

      const nextDistance = resistedPullDistance(deltaY);
      if (nextDistance <= 0) return;
      event.preventDefault();
      setDistance(nextDistance);

      const ready = pullRefreshReady(nextDistance);
      if (ready && !thresholdReachedRef.current) pulseHaptic(8);
      thresholdReachedRef.current = ready;
      setPhase(ready ? "ready" : "pulling");
    };

    const onTouchEnd = () => {
      if (!startRef.current || refreshingRef.current) return;
      startRef.current = null;

      if (!thresholdReachedRef.current) {
        cancelPull();
        return;
      }

      thresholdReachedRef.current = false;
      refreshingRef.current = true;
      setDistance(PULL_REFRESH_THRESHOLD);
      setPhase("refreshing");
      void refreshCurrentRoute().finally(() => {
        pulseHaptic(12);
        setPhase("complete");
        completeTimerRef.current = window.setTimeout(reset, COMPLETE_HOLD_MS);
      });
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", cancelPull, { passive: true });

    return () => {
      document.documentElement.classList.remove("octagon-pull-refresh");
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", cancelPull);
      if (completeTimerRef.current !== null) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      startRef.current = null;
      thresholdReachedRef.current = false;
      refreshingRef.current = false;
    };
  }, [eligible, refreshCurrentRoute, reset]);

  if (!eligible) return null;

  const progress = Math.min(1, distance / PULL_REFRESH_THRESHOLD);
  const label = phase === "ready"
    ? "RELEASE TO REFRESH"
    : phase === "refreshing"
      ? "REFRESHING HQ"
      : phase === "complete"
        ? "UPDATED"
        : "PULL TO REFRESH";
  const indicatorStyle = {
    opacity: phase === "idle" ? 0 : Math.max(0.08, progress),
    transform: `translate3d(-50%, ${Math.round(-58 + distance)}px, 0) scale(${(0.78 + progress * 0.22).toFixed(3)})`,
  } satisfies CSSProperties;

  return (
    <div
      className={`pull-refresh-indicator pull-refresh-indicator--${phase}`}
      style={indicatorStyle}
      aria-hidden={phase === "idle"}
      aria-live="polite"
    >
      <span className="pull-refresh-indicator__badge">
        <img src={brand.logoUrl} alt="" decoding="async" />
      </span>
      <span className="pull-refresh-indicator__label">{label}</span>
    </div>
  );
}
