import { describe, expect, it } from "vitest";
import {
  WHO_AM_I_AUTHORED_RECENCY_COOLDOWN,
  selectWhoAmIAuthoredIdentity,
  type WhoAmIAuthoredPublicationHistoryEntry,
  type WhoAmIAuthoredSelectionCandidate,
} from "./whoAmIAuthoredDailySelection";

const candidates: WhoAmIAuthoredSelectionCandidate<"A" | "B">[] = Array.from(
  { length: 10 },
  (_value, index) => ({
    subjectId: `subject-${index + 1}`,
    earlyRotation: index === 9 ? "deprioritized" : "normal",
    scriptIds: ["A", "B"],
  }),
);

function historyEntry(
  subjectId: string,
  roundIndex: number,
  scriptId: "A" | "B" | null = null,
): WhoAmIAuthoredPublicationHistoryEntry {
  return {
    day: `2026-10-${String(roundIndex + 1).padStart(2, "0")}`,
    roundIndex,
    subjectId,
    league: "UFC",
    scriptId,
  };
}

describe("Who Am I authored Daily selection", () => {
  it("blocks the short recency window without requiring full-roster exhaustion", () => {
    const history = Array.from(
      { length: WHO_AM_I_AUTHORED_RECENCY_COOLDOWN },
      (_value, index) => historyEntry(`subject-${index + 1}`, index),
    );
    const pick = selectWhoAmIAuthoredIdentity(candidates, history, ["cooldown-proof"]);
    expect(history.slice(-WHO_AM_I_AUTHORED_RECENCY_COOLDOWN).map((row) => row.subjectId))
      .not.toContain(pick.subjectId);
    expect(["subject-7", "subject-8", "subject-9", "subject-10"]).toContain(pick.subjectId);
  });

  it("allows a cooled-down repeat while unseen identities still exist", () => {
    const history = [
      historyEntry("subject-1", 0, "A"),
      historyEntry("subject-2", 1, "A"),
      historyEntry("subject-3", 2, "A"),
      historyEntry("subject-4", 3, "A"),
      historyEntry("subject-5", 4, "A"),
      historyEntry("subject-6", 5, "A"),
      historyEntry("subject-7", 6, "A"),
    ];
    const eligibleRepeat = candidates.find((candidate) => candidate.subjectId === "subject-1")!;
    const unseen = candidates.find((candidate) => candidate.subjectId === "subject-8")!;
    expect(history.slice(-WHO_AM_I_AUTHORED_RECENCY_COOLDOWN).some((row) => row.subjectId === eligibleRepeat.subjectId)).toBe(false);
    expect(history.some((row) => row.subjectId === unseen.subjectId)).toBe(false);
  });

  it("alternates authored scripts from the last published script", () => {
    const history = [historyEntry("subject-1", 0, "A")];
    const one = candidates.filter((candidate) => candidate.subjectId === "subject-1");
    expect(selectWhoAmIAuthoredIdentity(one, history, ["script-b"]).scriptId).toBe("B");

    const nextHistory = [historyEntry("subject-1", 0, "A"), historyEntry("subject-1", 1, "B")];
    expect(selectWhoAmIAuthoredIdentity(one, nextHistory, ["script-a"]).scriptId).toBe("A");
  });

  it("is deterministic for the same published history and seed", () => {
    const history = [historyEntry("subject-1", 0, "A")];
    expect(selectWhoAmIAuthoredIdentity(candidates, history, ["same-day", 1]))
      .toEqual(selectWhoAmIAuthoredIdentity(candidates, history, ["same-day", 1]));
  });
});
