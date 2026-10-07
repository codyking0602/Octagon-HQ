from pathlib import Path


def replace(path: str, old: str, new: str, count: int = 1) -> None:
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f"{path}: expected {count} matches, found {actual}")
    p.write_text(text.replace(old, new, count))


strategy = "src/features/back-room/footballGmStrategy.ts"
replace(
    strategy,
    'export const FOOTBALL_GM_VERSION = "football-gm-v8-head-to-head";',
    'export const FOOTBALL_GM_VERSION = "football-gm-v9-grade-driven-playoffs";',
)

old_curve = '''  { grade: 89, "Missed Playoffs": 0.05, "Wild Card": 0.18, Divisional: 0.26, "Conference Championship": 0.22, "Super Bowl Loss": 0.17, Champion: 0.12 },
  { grade: 90, "Missed Playoffs": 0.025, "Wild Card": 0.115, Divisional: 0.235, "Conference Championship": 0.235, "Super Bowl Loss": 0.21, Champion: 0.18 },
  { grade: 91, "Missed Playoffs": 0.01, "Wild Card": 0.06, Divisional: 0.18, "Conference Championship": 0.23, "Super Bowl Loss": 0.25, Champion: 0.27 },
  { grade: 92, "Missed Playoffs": 0.005, "Wild Card": 0.02, Divisional: 0.12, "Conference Championship": 0.215, "Super Bowl Loss": 0.27, Champion: 0.37 },
  { grade: 93, "Missed Playoffs": 0.002, "Wild Card": 0.01, Divisional: 0.07, "Conference Championship": 0.178, "Super Bowl Loss": 0.28, Champion: 0.46 },
  { grade: 94, "Missed Playoffs": 0, "Wild Card": 0.005, Divisional: 0.04, "Conference Championship": 0.14, "Super Bowl Loss": 0.315, Champion: 0.50 },
  { grade: 95, "Missed Playoffs": 0, "Wild Card": 0.004, Divisional: 0.03, "Conference Championship": 0.12, "Super Bowl Loss": 0.346, Champion: 0.50 },
  { grade: 96, "Missed Playoffs": 0, "Wild Card": 0.003, Divisional: 0.02, "Conference Championship": 0.10, "Super Bowl Loss": 0.377, Champion: 0.50 },
  { grade: 97, "Missed Playoffs": 0, "Wild Card": 0.002, Divisional: 0.015, "Conference Championship": 0.085, "Super Bowl Loss": 0.398, Champion: 0.50 },
  { grade: 98, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.01, "Conference Championship": 0.07, "Super Bowl Loss": 0.419, Champion: 0.50 },'''
new_curve = '''  { grade: 89, "Missed Playoffs": 0.02, "Wild Card": 0.08, Divisional: 0.21, "Conference Championship": 0.27, "Super Bowl Loss": 0.23, Champion: 0.19 },
  { grade: 90, "Missed Playoffs": 0.005, "Wild Card": 0.035, Divisional: 0.14, "Conference Championship": 0.26, "Super Bowl Loss": 0.24, Champion: 0.32 },
  { grade: 91, "Missed Playoffs": 0.001, "Wild Card": 0.009, Divisional: 0.07, "Conference Championship": 0.20, "Super Bowl Loss": 0.26, Champion: 0.46 },
  { grade: 92, "Missed Playoffs": 0, "Wild Card": 0.003, Divisional: 0.027, "Conference Championship": 0.12, "Super Bowl Loss": 0.25, Champion: 0.60 },
  { grade: 93, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.014, "Conference Championship": 0.07, "Super Bowl Loss": 0.245, Champion: 0.67 },
  { grade: 94, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.009, "Conference Championship": 0.04, "Super Bowl Loss": 0.23, Champion: 0.72 },
  { grade: 95, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.005, "Conference Championship": 0.03, "Super Bowl Loss": 0.205, Champion: 0.76 },
  { grade: 96, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.003, "Conference Championship": 0.022, "Super Bowl Loss": 0.185, Champion: 0.79 },
  { grade: 97, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.002, "Conference Championship": 0.013, "Super Bowl Loss": 0.165, Champion: 0.82 },
  { grade: 98, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.001, "Conference Championship": 0.009, "Super Bowl Loss": 0.14, Champion: 0.85 },'''
replace(strategy, old_curve, new_curve)

old_roll = '''export function footballGmSeasonRoll(seed: string, year: 1 | 2 | 3) {
  const salts = ["blue-17", "silver-43", "gold-89"] as const;
  return avalancheHash(`gm-season-v3:${salts[year - 1]}:${seed}`) / 0x1_0000_0000;
}'''
new_roll = '''function footballGmOutcomeSeed(seed: string) {
  const sharedMatchSeed = seed.match(/^([0-9a-f]{32}):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  return sharedMatchSeed?.[1] ?? seed;
}

export function footballGmSeasonRoll(seed: string, year: 1 | 2 | 3) {
  const salts = ["blue-17", "silver-43", "gold-89"] as const;
  return avalancheHash(`gm-season-v4:${salts[year - 1]}:${footballGmOutcomeSeed(seed)}`) / 0x1_0000_0000;
}'''
replace(strategy, old_roll, new_roll)

old_final = '''export function footballGmFinalResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
}) : FootballGmFinalResultV2 {
  const seasons = [
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.yearOneRoster, year: 1 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 2 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 3 }),
  ] as const;'''
new_final = '''export function footballGmFinalResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  resolvedSeasons?: readonly FootballGmSeasonResultV2[];
}) : FootballGmFinalResultV2 {
  const seasons = input.resolvedSeasons?.length === 3
    ? input.resolvedSeasons
    : [
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.yearOneRoster, year: 1 }),
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 2 }),
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 3 }),
      ];'''
replace(strategy, old_final, new_final)

report = "src/features/back-room/FootballGmFranchiseReport.tsx"
replace(
    report,
    '  footballGmFinalResultV2,\n  type FootballGmNegotiationConsequences,',
    '  footballGmFinalResultV2,\n  type FootballGmNegotiationConsequences,\n  type FootballGmSeasonResultV2,',
)
replace(
    report,
    '  negotiationConsequences: FootballGmNegotiationConsequences;\n}',
    '  negotiationConsequences: FootballGmNegotiationConsequences;\n  resolvedSeasons?: readonly FootballGmSeasonResultV2[];\n}',
)
replace(
    report,
    '    finalRoster: end,\n  });',
    '    finalRoster: end,\n    resolvedSeasons: run.resolvedSeasons,\n  });',
)

repo = "src/features/play/footballGmMatchRepository.ts"
replace(
    repo,
    'import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterSlot } from "../back-room/footballGmEngine";',
    'import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry, type FootballGmRosterSlot } from "../back-room/footballGmEngine";\nimport { FOOTBALL_GM_VERSION, footballGmSeasonResultV2, type FootballGmSeasonResultV2 } from "../back-room/footballGmStrategy";',
)
helper_anchor = '''function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}
'''
helper_new = '''function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function resolvableRunState(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.seed !== "string" || !Array.isArray(row.roster) || !Array.isArray(row.finalRoster)) return null;
  return row as Record<string, unknown> & {
    seed: string;
    roster: FootballGmRosterEntry[];
    finalRoster: FootballGmRosterEntry[];
  };
}

function storedYearOneResult(value: unknown): FootballGmSeasonResultV2 | null {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    row.year !== 1
    || typeof row.rawTeamGrade !== "number"
    || typeof row.weakLinkPenalty !== "number"
    || typeof row.continuityAdjustment !== "number"
    || typeof row.teamGrade !== "number"
    || typeof row.finish !== "string"
    || typeof row.postseasonBonus !== "number"
    || typeof row.titleOdds !== "number"
  ) return null;
  return row as unknown as FootballGmSeasonResultV2;
}
'''
replace(repo, helper_anchor, helper_new)
old_finish = '''    async finishOffseason(code, runState) {
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(runState),
      }));
    },'''
new_finish = '''    async finishOffseason(code, runState) {
      const resolved = resolvableRunState(runState);
      let lockedRunState = runState;
      if (resolved && resolved.roster.length === 7 && resolved.finalRoster.length === 7) {
        const beforeFinish = stateSchema.parse(await rpc(client, "get_my_football_gm_match", { p_code: code }));
        const activeParticipant = beforeFinish.participants.find(
          (participant) => participant.id === beforeFinish.current_turn_profile_id,
        );
        const yearOne = storedYearOneResult(activeParticipant?.year1_result)
          ?? footballGmSeasonResultV2({
            seed: resolved.seed,
            yearOneRoster: resolved.roster,
            roster: resolved.roster,
            year: 1,
          });
        const resolvedSeasons = [
          yearOne,
          footballGmSeasonResultV2({
            seed: resolved.seed,
            yearOneRoster: resolved.roster,
            roster: resolved.finalRoster,
            year: 2,
          }),
          footballGmSeasonResultV2({
            seed: resolved.seed,
            yearOneRoster: resolved.roster,
            roster: resolved.finalRoster,
            year: 3,
          }),
        ];
        lockedRunState = {
          ...resolved,
          version: FOOTBALL_GM_VERSION,
          resolvedSeasons,
        };
      }
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(lockedRunState),
      }));
    },'''
replace(repo, old_finish, new_finish)

mode = "src/features/back-room/FootballGmModePage.tsx"
old_parse = '''  if (
    parsed.version !== FOOTBALL_GM_VERSION
    || typeof parsed.seed !== "string"
    || typeof parsed.phase !== "string"
    || !Array.isArray(parsed.roster)
    || !Array.isArray(parsed.finalRoster)
  ) return null;
  return parsed as PersistedRun;'''
new_parse = '''  const compatibleVersion = parsed.version === FOOTBALL_GM_VERSION
    || parsed.version === "football-gm-v8-head-to-head";
  if (
    !compatibleVersion
    || typeof parsed.seed !== "string"
    || typeof parsed.phase !== "string"
    || !Array.isArray(parsed.roster)
    || !Array.isArray(parsed.finalRoster)
  ) return null;
  return { ...parsed, version: FOOTBALL_GM_VERSION } as PersistedRun;'''
replace(mode, old_parse, new_parse)

tests = "src/features/back-room/footballGmStrategy.test.ts"
replace(
    tests,
    '''    expect(footballGmTitleOdds(90)).toBeCloseTo(0.18, 6);
    expect(footballGmTitleOdds(91)).toBeCloseTo(0.27, 6);
    expect(footballGmTitleOdds(92)).toBeCloseTo(0.37, 6);
    expect(footballGmTitleOdds(93)).toBeCloseTo(0.46, 6);
    expect(footballGmTitleOdds(94)).toBeCloseTo(0.50, 6);
    expect(footballGmTitleOdds(98)).toBeCloseTo(0.50, 6);''',
    '''    expect(footballGmTitleOdds(90)).toBeCloseTo(0.32, 6);
    expect(footballGmTitleOdds(91)).toBeCloseTo(0.46, 6);
    expect(footballGmTitleOdds(92)).toBeCloseTo(0.60, 6);
    expect(footballGmTitleOdds(93)).toBeCloseTo(0.67, 6);
    expect(footballGmTitleOdds(94)).toBeCloseTo(0.72, 6);
    expect(footballGmTitleOdds(98)).toBeCloseTo(0.85, 6);''',
)
old_expected = '''      [89, 0.05, 0.12],
      [90, 0.025, 0.18],
      [91, 0.01, 0.27],
      [92, 0.005, 0.37],
      [93, 0.002, 0.46],
      [94, 0, 0.50],
      [95, 0, 0.50],
      [96, 0, 0.50],
      [97, 0, 0.50],
      [98, 0, 0.50],'''
new_expected = '''      [89, 0.02, 0.19],
      [90, 0.005, 0.32],
      [91, 0.001, 0.46],
      [92, 0, 0.60],
      [93, 0, 0.67],
      [94, 0, 0.72],
      [95, 0, 0.76],
      [96, 0, 0.79],
      [97, 0, 0.82],
      [98, 0, 0.85],'''
replace(tests, old_expected, new_expected)
replace(
    tests,
    '''    expect(footballGmOutcomeProbabilities(90)["Missed Playoffs"]).toBe(0.025);
    expect(footballGmOutcomeProbabilities(90).Divisional).toBe(0.235);
    expect(footballGmOutcomeProbabilities(90)["Conference Championship"]).toBe(0.235);
    expect(footballGmOutcomeProbabilities(90)["Super Bowl Loss"]).toBe(0.21);

    const repeatAt94 = (2 * (0.50 ** 2)) - (0.50 ** 3);
    const threePeatAt94 = 0.50 ** 3;
    expect(repeatAt94).toBeCloseTo(0.375, 6);
    expect(threePeatAt94).toBeCloseTo(0.125, 6);''',
    '''    expect(footballGmOutcomeProbabilities(90)["Missed Playoffs"]).toBe(0.005);
    expect(footballGmOutcomeProbabilities(90).Divisional).toBe(0.14);
    expect(footballGmOutcomeProbabilities(90)["Conference Championship"]).toBe(0.26);
    expect(footballGmOutcomeProbabilities(90)["Super Bowl Loss"]).toBe(0.24);

    const repeatAt94 = (2 * (0.72 ** 2)) - (0.72 ** 3);
    const threePeatAt94 = 0.72 ** 3;
    expect(repeatAt94).toBeCloseTo(0.663552, 6);
    expect(threePeatAt94).toBeCloseTo(0.373248, 6);''',
)
replace(
    tests,
    '''    expect(expectedScore(90)).toBeCloseTo(94.6, 1);
    expect(expectedScore(94)).toBeCloseTo(98.4, 1);''',
    '''    expect(expectedScore(90)).toBeCloseTo(95.7, 1);
    expect(expectedScore(94)).toBeCloseTo(99.0, 1);''',
)
independent_anchor = '''    expect(Math.abs(correlation)).toBeLessThan(0.15);
    expect(footballGmSeasonRoll("stable-seed", 1)).toBe(footballGmSeasonRoll("stable-seed", 1));
  });'''
independent_new = '''    expect(Math.abs(correlation)).toBeLessThan(0.15);
    expect(footballGmSeasonRoll("stable-seed", 1)).toBe(footballGmSeasonRoll("stable-seed", 1));

    const matchSeed = "0123456789abcdef0123456789abcdef";
    const left = `${matchSeed}:11111111-1111-4111-8111-111111111111`;
    const right = `${matchSeed}:22222222-2222-4222-8222-222222222222`;
    for (const year of [1, 2, 3] as const) {
      expect(footballGmSeasonRoll(left, year)).toBe(footballGmSeasonRoll(right, year));
    }
  });'''
replace(tests, independent_anchor, independent_new)
score_test_anchor = '''  it("lands expected GM scores in intuitive bands across the locked outcome curve", () => {'''
monotonic_test = '''  it("keeps shared-roll postseason floors monotonic from 89 through 98", () => {
    const finishes = ["Missed Playoffs", "Wild Card", "Divisional", "Conference Championship", "Super Bowl Loss"] as const;
    let previous = Object.fromEntries(finishes.map((finish) => [finish, 1])) as Record<(typeof finishes)[number], number>;
    for (let grade = 89; grade <= 98; grade += 1) {
      const probabilities = footballGmOutcomeProbabilities(grade);
      let cumulative = 0;
      for (const finish of finishes) {
        cumulative += probabilities[finish];
        expect(cumulative).toBeLessThanOrEqual(previous[finish] + 1e-12);
        previous[finish] = cumulative;
      }
    }
  });

  it("honors persisted season results instead of rerolling a completed franchise", () => {
    const roster = codyRunRoster();
    const baseline = footballGmFinalResultV2({ seed: "locked-results", yearOneRoster: roster, finalRoster: roster });
    const locked = baseline.seasons.map((season, index) => ({
      ...season,
      finish: index === 0 ? "Champion" as const : season.finish,
    }));
    const result = footballGmFinalResultV2({
      seed: "a-different-seed-that-must-not-reroll",
      yearOneRoster: roster,
      finalRoster: roster,
      resolvedSeasons: locked,
    });
    expect(result.seasons).toEqual(locked);
    expect(result.seasons[0]!.finish).toBe("Champion");
  });

  it("lands expected GM scores in intuitive bands across the locked outcome curve", () => {'''
replace(tests, score_test_anchor, monotonic_test)

repo_test = Path("src/features/play/footballGmMatchRepository.test.ts")
repo_test.write_text('''import { describe, expect, it } from "vitest";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry } from "../back-room/footballGmEngine";
import { FOOTBALL_GM_VERSION, footballGmSeasonResultV2 } from "../back-room/footballGmStrategy";
import { createFootballGmMatchRepository } from "./footballGmMatchRepository";

function roster(): FootballGmRosterEntry[] {
  const used = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL.find((candidate) => !used.has(candidate.id) && candidate.eligibleSlots.includes(slot));
    if (!player) throw new Error(`missing ${slot}`);
    used.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function state(year1Result: ReturnType<typeof footballGmSeasonResultV2>) {
  const active = "11111111-1111-4111-8111-111111111111";
  return {
    code: "GM1234",
    seed: "0123456789abcdef0123456789abcdef",
    phase: "offseason",
    turn_count: 14,
    current_turn_profile_id: active,
    pending_team_code: null,
    offseason_first_profile_id: active,
    participants: [
      { id: active, display_name: "A", seat_order: 0, accepted: true, run_state: {}, year1_result: year1Result, year1_acknowledged: true, offseason_complete: false },
      { id: "22222222-2222-4222-8222-222222222222", display_name: "B", seat_order: 1, accepted: true, run_state: {}, year1_result: year1Result, year1_acknowledged: true, offseason_complete: false },
    ],
    opened_at: null,
    completed_at: null,
    declined_at: null,
    forfeited_by_profile_id: null,
    forfeited_at: null,
  };
}

describe("footballGmMatchRepository", () => {
  it("locks the submitted Year 1 result and persists all three resolved seasons at offseason completion", async () => {
    const team = roster();
    const seed = "0123456789abcdef0123456789abcdef:11111111-1111-4111-8111-111111111111";
    const year1 = footballGmSeasonResultV2({ seed, yearOneRoster: team, roster: team, year: 1 });
    const calls: Array<{ name: string; args?: Record<string, unknown> }> = [];
    const client = {
      async rpc(name: string, args?: Record<string, unknown>) {
        calls.push({ name, args });
        return { data: state(year1), error: null };
      },
    };
    const repository = createFootballGmMatchRepository(client)!;
    await repository.finishOffseason("GM1234", {
      version: "football-gm-v8-head-to-head",
      seed,
      roster: team,
      finalRoster: team,
    });
    expect(calls.map((call) => call.name)).toEqual(["get_my_football_gm_match", "finish_football_gm_offseason"]);
    const payload = calls[1]!.args?.p_run_state as Record<string, unknown>;
    expect(payload.version).toBe(FOOTBALL_GM_VERSION);
    const seasons = payload.resolvedSeasons as Array<Record<string, unknown>>;
    expect(seasons).toHaveLength(3);
    expect(seasons[0]).toEqual(year1);
    expect(seasons.map((season) => season.year)).toEqual([1, 2, 3]);
  });
});
''')
