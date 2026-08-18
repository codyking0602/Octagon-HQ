import { createRoot } from "react-dom/client";
import { OfficialBlindResumeV3DailyView } from "../../src/features/play/OfficialBlindResumeV3DailyView";
import { OfficialTodayChallengeView } from "../../src/features/play/OfficialTodayChallengePage";
import type { DailyGameType } from "../../src/features/play/todaysChallengeAdapters";
import type { TodayChallengeProjection } from "../../src/features/play/todayChallengeRepository";
import "../../src/styles/tokens.css";
import "../../src/styles/global.css";
import "../../src/styles/play.css";
import "../../src/styles/today-challenge.css";
import "../../src/styles/wavelength.css";
import "../../src/styles/blind-games.css";
import "../../src/styles/final-play-games.css";

function presentedFighter(id: string, name: string) {
  return {
    id,
    name,
    gender: "men",
    divisions: ["Lightweight"],
    main_era: "Modern",
    thumb_url: "",
    profile_url: "",
  };
}

function projection(
  gameType: DailyGameType,
  publicSetup: Record<string, unknown>,
  publicState: Record<string, unknown>,
  overrides: Partial<TodayChallengeProjection> = {},
): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-05",
    scheduleVersion: "find-leader-v1",
    gameType,
    setupKey: `${gameType}:phone-proof`,
    contentVersion: `${gameType}-v1`,
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup,
    progressRevision: 2,
    publicState,
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "phone-proof",
    ...overrides,
  };
}

const fighters = Array.from({ length: 10 }, (_, index) => presentedFighter(
  `fighter-${index + 1}`,
  `Fighter ${index + 1}`,
));

const fixtures: Record<DailyGameType, TodayChallengeProjection> = {
  find_leader: projection(
    "find_leader",
    {
      question: "Who has the most UFC wins?",
      context: "Leave the fighter with the most UFC wins among this group.",
      stat_label: "UFC WINS",
      candidates: fighters.map((row) => ({
        id: row.id,
        name: row.name,
        division: "Lightweight",
        thumb_url: "",
      })),
    },
    { complete: false, eliminated_ids: ["fighter-1", "fighter-2"], native_progress: 2 },
  ),
  wavelength: projection(
    "wavelength",
    { clue_count: 4 },
    {
      complete: false,
      guesses: [50],
      clues: [{ id: "clue-1", category: "STYLE", text: "Pressure-heavy striker" }],
      next_guess_number: 2,
    },
  ),
  blind_resume: projection(
    "blind_resume",
    {
      round_count: 5,
      reveal_counts: [2, 4, 6, 8],
      correct_points: [20, 19, 18, 17],
      miss_points: [2, 4, 6, 8],
    },
    {
      complete: false,
      round_index: 1,
      results: [],
      current_round: {
        round_index: 1,
        round_number: 2,
        revealed_count: 2,
        correct_points: 20,
        miss_points: 2,
        stats: [
          { label: "PRIME UFC RECORD", revealed: true, value_a: "11-0-1", value_b: "9-2" },
          { label: "FINISH RATE", revealed: true, value_a: "100%", value_b: "66.7%" },
          { label: "UFC TITLE-FIGHT WINS", revealed: false, value_a: null, value_b: null },
          { label: "TOP-5 WINS", revealed: false, value_a: null, value_b: null },
          { label: "MAIN UFC ERA", revealed: false, value_a: null, value_b: null },
          { label: "APEX RATING", revealed: false, value_a: null, value_b: null },
          { label: "ROUNDS WON", revealed: false, value_a: null, value_b: null },
          { label: "ACTIVE ELITE YEARS", revealed: false, value_a: null, value_b: null },
        ],
      },
    },
    {
      scheduleVersion: "play-rotation-v3",
      setupKey: "blind-resume-v3:play-rotation-v3:phone-proof",
      contentVersion: "blind-resume-v3",
      scoringVersion: "play-official-score-v3",
    },
  ),
  blind_rank_5: projection(
    "blind_rank_5",
    { pack: { name: "UFC Careers", prompt: "Rank these careers", intro: "Every slot locks." } },
    {
      complete: false,
      reveal_index: 1,
      slots: [presentedFighter("locked", "Locked Fighter"), null, null, null, null],
      current_fighter: presentedFighter("current", "Current Fighter"),
    },
  ),
  keep_4_cut_4: projection(
    "keep_4_cut_4",
    { pack: { group: "Careers", name: "UFC Careers", prompt: "Build the best four", description: "Eight blind reveals." } },
    {
      complete: false,
      reveal_index: 6,
      kept: ["one", "two", "three", "four"].map((id) => presentedFighter(id, `Kept ${id}`)),
      cut: ["five", "six"].map((id) => presentedFighter(id, `Cut ${id}`)),
      current_fighter: presentedFighter("seven", "Current Fighter"),
      forced_choice: "cut",
    },
  ),
};

const requested = new URLSearchParams(window.location.search).get("game") as DailyGameType | null;
const gameType = requested && requested in fixtures ? requested : "find_leader";
const fixture = fixtures[gameType];

createRoot(document.getElementById("root")!).render(
  gameType === "blind_resume" ? (
    <OfficialBlindResumeV3DailyView
      projection={fixture}
      busy={false}
      onAdvance={() => undefined}
      onNavigate={() => undefined}
    />
  ) : (
    <OfficialTodayChallengeView
      projection={fixture}
      busy={false}
      onAdvance={() => undefined}
      onNavigate={() => undefined}
    />
  ),
);