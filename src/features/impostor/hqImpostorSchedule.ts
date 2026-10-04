import type { HqImpostorState } from "./hqImpostorRepository";

export const HQ_IMPOSTOR_V1_LAUNCH_AT = "2026-10-13T05:00:00.000Z";
export const HQ_IMPOSTOR_V1_CLOSE_AT = "2026-10-20T05:00:00.000Z";

export function hqImpostorV1Window(now = new Date()) {
  const time = now.getTime();
  const opens = new Date(HQ_IMPOSTOR_V1_LAUNCH_AT).getTime();
  const closes = new Date(HQ_IMPOSTOR_V1_CLOSE_AT).getTime();
  return {
    before: time < opens,
    active: time >= opens && time < closes,
    after: time >= closes,
  };
}

export function hqImpostorDailyGateRequired(state: HqImpostorState | null) {
  const event = state?.event ?? null;
  if (!event) return true;

  const phase = event.current_round.phase;
  return phase === "assignment"
    || phase === "clue"
    || phase === "board_ready"
    || phase === "vote"
    || phase === "resolved";
}
