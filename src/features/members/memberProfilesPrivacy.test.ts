import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  challengeIsComparisonOnly,
  memberProfilePath,
  normalizeMemberName,
  summarizeMemberChallenges,
} from "./memberProfilesModel";
import type { PlayChallenge } from "../challenges/challengeModel";

const migration = readFileSync(
  new URL("../../../supabase/migrations/202607290001_member_profiles.sql", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("./memberProfilesRepository.ts", import.meta.url),
  "utf8",
);

function challenge(overrides: Partial<PlayChallenge>): PlayChallenge {
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: "v1",
    gameTitle: "Find the Leader",
    summary: "Test",
    creatorId: "11111111-1111-4111-8111-111111111111",
    recipientId: "22222222-2222-4222-8222-222222222222",
    playUrl: "https://octagon.test/play",
    setup: {},
    creatorResult: { score: 8 },
    responderResult: null,
    createdAt: "2026-07-25T00:00:00Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-25T00:00:00Z",
    hiddenFor: [],
    ...overrides,
  };
}

describe("Member Profiles privacy and presentation contracts", () => {
  it("uses authenticated safe RPCs without exposing credentials, UUID columns, or raw tables to the directory repository", () => {
    expect(migration).toContain("grant execute on function public.list_member_cards() to authenticated");
    expect(migration).toContain("grant execute on function public.get_member_profile(text) to authenticated");
    expect(migration).toContain("where auth.uid() is not null");
    expect(migration).not.toMatch(/internal_email|pin_hash|failed_attempts|locked_until|service_role/);
    expect(repository).toContain('client.rpc("list_member_cards")');
    expect(repository).toContain('client.rpc("get_member_profile"');
    expect(repository).not.toContain('.from("profiles")');
    expect(repository).not.toMatch(/localStorage|sessionStorage|getSession|auth\.users/);
  });

  it("builds direct name routes without leaking database identifiers", () => {
    expect(normalizeMemberName("  Shane   King ")).toBe("SHANE KING");
    expect(memberProfilePath("Shane King")).toBe("/members/SHANE%20KING");
    expect(memberProfilePath("Shane King")).not.toMatch(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
  });

  it("summarizes only honest challenge lifecycle data and preserves comparison-only games", () => {
    const profileId = "11111111-1111-4111-8111-111111111111";
    const rows = [
      challenge({ code: "OPEN0001" }),
      challenge({ code: "DONE0001", completedAt: "2026-07-25T01:00:00Z", responderResult: { score: 7 } }),
      challenge({
        code: "COMPARE1",
        gameId: "better-than",
        completedAt: "2026-07-25T02:00:00Z",
        responderResult: { selections: [] },
      }),
    ];
    expect(summarizeMemberChallenges(rows, profileId)).toEqual({
      open: 1,
      completed: 2,
      sent: 3,
      received: 0,
    });
    expect(challengeIsComparisonOnly(rows[2]!)).toBe(true);
    expect(challengeIsComparisonOnly(rows[0]!)).toBe(false);
  });
});
