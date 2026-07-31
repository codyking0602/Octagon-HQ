export const PULL_REFRESH_INTENT_DISTANCE = 8;
export const PULL_REFRESH_THRESHOLD = 68;
export const PULL_REFRESH_HOLD_DISTANCE = 58;
export const PULL_REFRESH_MAX_DISTANCE = 112;
export const PULL_REFRESH_RESISTANCE = 0.52;

export function verticalPullIntent(deltaX: number, deltaY: number) {
  return (
    deltaY >= PULL_REFRESH_INTENT_DISTANCE
    && deltaY > Math.abs(deltaX) * 1.2
  );
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
