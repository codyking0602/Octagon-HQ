import { createRoot } from "react-dom/client";
import { OfficialTodayChallengeView } from "../../src/features/play/OfficialTodayChallengePage";
import type { DailyGameType } from "../../src/features/play/todaysChallengeAdapters";
import type { TodayChallengeProjection } from "../../src/features/play/todayChallengeRepository";
import "../../src/styles/tokens.css";
import "../../src/styles/global.css";
import "../../src/styles/today-challenge.css";

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
    { round_count: 5 },
    {
      complete: false,
      round_index: 1,
      results: [],
      current_round: {
        round_number: 2,
        stats: [
          { label: "UFC WINS", value_a: "14", value_b: "12" },
          { label: "TITLE WINS", value_a: "2", value_b: "4" },
          { label: "TOP-10 WINS", value_a: "8", value_b: "7" },
        ],
      },
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
    { pack: { prompt: "Build the best four", description: "Eight blind reveals." } },
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

createRoot(document.getElementById("root")!).render(
  <OfficialTodayChallengeView
    projection={fixtures[gameType]}
    busy={false}
    onAdvance={() => undefined}
    onNavigate={() => undefined}
  />,
);
