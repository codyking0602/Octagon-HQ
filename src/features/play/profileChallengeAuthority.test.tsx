import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import type { ChallengeJson, PlayChallenge } from "../challenges/challengeModel";
import { BLIND_RESUME_V3_GAME_VERSION } from "./blindResumeV3";
import { createStoredHitTheNumberProfileRun } from "./HitTheNumberPage";
import { blindRankPool } from "./playFighterPool";
import TodayChallengeGameRoute, { storedProfileChallengeSetupIsUsable } from "./TodayChallengeGameRoute";
import type { DailyGameType } from "./todaysChallengeAdapters";

vi.mock("../challenges/challengeRuntime", () => ({
  useProfileChallengeMatch: vi.fn(),
}));

vi.mock("./OfficialTodayChallengePage", () => ({
  default: () => <div>OFFICIAL DAILY</div>,
}));

const mockProfileMatch = vi.mocked(useProfileChallengeMatch);
const ufcCareerIds = blindRankPool("ufc-careers").map((fighter) => fighter.id);

function challenge(
  gameId: PlayChallenge["gameId"],
  gameVersion: string,
  setup: ChallengeJson,
): PlayChallenge {
  return {
    code: "MATCH42",
    gameId,
    gameVersion,
    gameTitle: "Challenge",
    summary: "Stored challenge",
    creatorId: "11111111-1111-4111-8111-111111111111",
    recipientId: "22222222-2222-4222-8222-222222222222",
    playUrl: "https://example.test/play/test",
    setup,
    creatorResult: {},
    responderResult: null,
    createdAt: "2026-08-19T20:00:00.000Z",
    openedAt: "2026-08-19T20:01:00.000Z",
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-09-18T20:00:00.000Z",
    hiddenFor: [],
  };
}

function matchReturn(row: PlayChallenge | null) {
  return {
    code: "MATCH42",
    challenge: row,
    creator: null,
    isRecipient: false,
    activeProfile: null,
    submitResult: vi.fn(),
  } as ReturnType<typeof useProfileChallengeMatch>;
}

const routeCases: Array<{
  gameType: DailyGameType;
  gameId: PlayChallenge["gameId"];
  gameVersion: string;
  setup: ChallengeJson;
}> = [
  {
    gameType: "blind_resume",
    gameId: "blind-resume",
    gameVersion: BLIND_RESUME_V3_GAME_VERSION,
    setup: { seed: "resume-seed", v3Card: { stored: true } },
  },
  {
    gameType: "blind_rank_5",
    gameId: "blind-rank",
    gameVersion: "blind-rank-v2",
    setup: { packId: "ufc-careers", lineupIds: ufcCareerIds.slice(0, 5) },
  },
  {
    gameType: "keep_4_cut_4",
    gameId: "keep-cut",
    gameVersion: "keep-cut-v3",
    setup: { packId: "ufc-careers", lineupIds: ufcCareerIds.slice(0, 8) },
  },
  {
    gameType: "hit_the_number",
    gameId: "hit-the-number",
    gameVersion: "hit-the-number-v1",
    setup: { seed: "number-seed", publicSetup: { stored: true }, format: { stored: true } },
  },
];

describe("profile challenge authority", () => {
  beforeEach(() => {
    mockProfileMatch.mockReset();
  });

  it.each(routeCases)("does not mount $gameId before the stored challenge is available", ({
    gameType,
    gameId,
    gameVersion,
    setup,
  }) => {
    mockProfileMatch.mockReturnValue(matchReturn(null));
    const view = render(
      <MemoryRouter initialEntries={["/play/test?match=MATCH42"]}>
        <TodayChallengeGameRoute gameType={gameType} casual={<div>CASUAL {gameId}</div>} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading challenge…")).toBeInTheDocument();
    expect(screen.queryByText(`CASUAL ${gameId}`)).toBeNull();

    const stored = challenge(gameId, gameVersion, setup);
    mockProfileMatch.mockReturnValue(matchReturn(stored));
    view.rerender(
      <MemoryRouter initialEntries={["/play/test?match=MATCH42"]}>
        <TodayChallengeGameRoute gameType={gameType} casual={<div>CASUAL {gameId}</div>} />
      </MemoryRouter>,
    );

    expect(screen.getByText(`CASUAL ${gameId}`)).toBeInTheDocument();
    expect(screen.queryByText("Loading challenge…")).toBeNull();
  });

  it("fails closed when a profile challenge does not contain its stored setup", () => {
    const invalid = challenge("blind-rank", "blind-rank-v2", {
      packId: "ufc-careers",
      lineupIds: ufcCareerIds.slice(0, 1),
    });
    expect(storedProfileChallengeSetupIsUsable(invalid)).toBe(false);
    mockProfileMatch.mockReturnValue(matchReturn(invalid));

    render(
      <MemoryRouter initialEntries={["/play/blind-rank?match=MATCH42"]}>
        <TodayChallengeGameRoute gameType="blind_rank_5" casual={<div>CASUAL blind-rank</div>} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Challenge unavailable")).toBeInTheDocument();
    expect(screen.queryByText("CASUAL blind-rank")).toBeNull();
  });

  it("rehydrates Hit the Number from the stored board instead of the seed", () => {
    const run = createStoredHitTheNumberProfileRun({
      seed: "historical-seed-that-may-generate-differently-now",
      publicSetup: {
        version: "hit-the-number-v1",
        statId: "ufc-wins",
        boardType: "open-roster",
        target: 37,
        pickCount: 4,
        filter: {},
        fighterIds: ["fighter-a", "fighter-b", "fighter-c", "fighter-d"],
      },
      format: {
        formatId: "classic",
        label: "Classic",
        configurationId: null,
        configurationLabel: null,
        rules: [],
        slots: [],
      },
    }, "MATCH42");

    expect(run).not.toBeNull();
    expect(run?.seed).toBe("historical-seed-that-may-generate-differently-now");
    expect(run?.board.publicSetup.target).toBe(37);
    expect(run?.format.formatId).toBe("classic");
    expect(run?.identity.challengeId).toContain("MATCH42");
  });
});
