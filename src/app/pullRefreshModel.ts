export const PULL_REFRESH_THRESHOLD = 72;
export const PULL_REFRESH_MAX_DISTANCE = 112;
export const PULL_REFRESH_RESISTANCE = 0.5;

export type PullRefreshScope =
  | "home"
  | "picks"
  | "play"
  | "find-leader"
  | "notifications"
  | "whats-new"
  | "war-room";

export function pullRefreshScope(pathname: string): PullRefreshScope | null {
  switch (pathname) {
    case "/":
      return "home";
    case "/picks":
      return "picks";
    case "/play":
      return "play";
    case "/play/find-leader":
      return "find-leader";
    case "/notifications":
      return "notifications";
    case "/whats-new":
      return "whats-new";
    case "/war-room":
      return "war-room";
    default:
      return null;
  }
}

export function resistedPullDistance(deltaY: number) {
  return Math.min(
    PULL_REFRESH_MAX_DISTANCE,
    Math.max(0, deltaY) * PULL_REFRESH_RESISTANCE,
  );
}

export function pullRefreshReady(distance: number) {
  return distance >= PULL_REFRESH_THRESHOLD;
}
