from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected exactly one match, found {count}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1))


def replace_many(path: str, replacements: list[tuple[str, str]]) -> None:
    for old, new in replacements:
        replace_once(path, old, new)


strategy = "src/features/back-room/footballGmStrategy.ts"
replace_once(
    strategy,
    'export const FOOTBALL_GM_VERSION = "football-gm-v8-head-to-head";',
    'export const FOOTBALL_GM_VERSION = "football-gm-v9-grade-driven-playoffs";',
)

curve_replacements = [
    ('  { grade: 89, "Missed Playoffs": 0.05, "Wild Card": 0.18, Divisional: 0.26, "Conference Championship": 0.22, "Super Bowl Loss": 0.17, Champion: 0.12 },',
     '  { grade: 89, "Missed Playoffs": 0.02, "Wild Card": 0.08, Divisional: 0.21, "Conference Championship": 0.27, "Super Bowl Loss": 0.23, Champion: 0.19 },'),
    ('  { grade: 90, "Missed Playoffs": 0.025, "Wild Card": 0.115, Divisional: 0.235, "Conference Championship": 0.235, "Super Bowl Loss": 0.21, Champion: 0.18 },',
     '  { grade: 90, "Missed Playoffs": 0.005, "Wild Card": 0.035, Divisional: 0.14, "Conference Championship": 0.26, "Super Bowl Loss": 0.24, Champion: 0.32 },'),
    ('  { grade: 91, "Missed Playoffs": 0.01, "Wild Card": 0.06, Divisional: 0.18, "Conference Championship": 0.23, "Super Bowl Loss": 0.25, Champion: 0.27 },',
     '  { grade: 91, "Missed Playoffs": 0.001, "Wild Card": 0.009, Divisional: 0.07, "Conference Championship": 0.20, "Super Bowl Loss": 0.26, Champion: 0.46 },'),
    ('  { grade: 92, "Missed Playoffs": 0.005, "Wild Card": 0.02, Divisional: 0.12, "Conference Championship": 0.215, "Super Bowl Loss": 0.27, Champion: 0.37 },',
     '  { grade: 92, "Missed Playoffs": 0, "Wild Card": 0.003, Divisional: 0.027, "Conference Championship": 0.12, "Super Bowl Loss": 0.25, Champion: 0.60 },'),
    ('  { grade: 93, "Missed Playoffs": 0.002, "Wild Card": 0.01, Divisional: 0.07, "Conference Championship": 0.178, "Super Bowl Loss": 0.28, Champion: 0.46 },',
     '  { grade: 93, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.014, "Conference Championship": 0.07, "Super Bowl Loss": 0.245, Champion: 0.67 },'),
    ('  { grade: 94, "Missed Playoffs": 0, "Wild Card": 0.005, Divisional: 0.04, "Conference Championship": 0.14, "Super Bowl Loss": 0.315, Champion: 0.50 },',
     '  { grade: 94, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.009, "Conference Championship": 0.04, "Super Bowl Loss": 0.23, Champion: 0.72 },'),
    ('  { grade: 95, "Missed Playoffs": 0, "Wild Card": 0.004, Divisional: 0.03, "Conference Championship": 0.12, "Super Bowl Loss": 0.346, Champion: 0.50 },',
     '  { grade: 95, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.005, "Conference Championship": 0.03, "Super Bowl Loss": 0.205, Champion: 0.76 },'),
    ('  { grade: 96, "Missed Playoffs": 0, "Wild Card": 0.003, Divisional: 0.02, "Conference Championship": 0.10, "Super Bowl Loss": 0.377, Champion: 0.50 },',
     '  { grade: 96, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.003, "Conference Championship": 0.022, "Super Bowl Loss": 0.185, Champion: 0.79 },'),
    ('  { grade: 97, "Missed Playoffs": 0, "Wild Card": 0.002, Divisional: 0.015, "Conference Championship": 0.085, "Super Bowl Loss": 0.398, Champion: 0.50 },',
     '  { grade: 97, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.002, "Conference Championship": 0.013, "Super Bowl Loss": 0.165, Champion: 0.82 },'),
    ('  { grade: 98, "Missed Playoffs": 0, "Wild Card": 0.001, Divisional: 0.01, "Conference Championship": 0.07, "Super Bowl Loss": 0.419, Champion: 0.50 },',
     '  { grade: 98, "Missed Playoffs": 0, "Wild Card": 0, Divisional: 0.001, "Conference Championship": 0.009, "Super Bowl Loss": 0.14, Champion: 0.85 },'),
]
replace_many(strategy, curve_replacements)

replace_once(
    strategy,
    '''export function footballGmSeasonRoll(seed: string, year: 1 | 2 | 3) {
  const salts = ["blue-17", "silver-43", "gold-89"] as const;
  return avalancheHash(`gm-season-v3:${salts[year - 1]}:${seed}`) / 0x1_0000_0000;
}''',
    '''export function footballGmOutcomeSeed(seed: string) {
  const match = seed.match(/^([0-9a-f]{32}):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  return match?.[1] ?? seed;
}

export function footballGmSeasonRoll(seed: string, year: 1 | 2 | 3) {
  const salts = ["blue-17", "silver-43", "gold-89"] as const;
  const outcomeSeed = footballGmOutcomeSeed(seed);
  return avalancheHash(`gm-season-v4:${salts[year - 1]}:${outcomeSeed}`) / 0x1_0000_0000;
}''',
)

replace_once(
    strategy,
    '''export function footballGmFinalResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
}) : FootballGmFinalResultV2 {
  const seasons = [
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.yearOneRoster, year: 1 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 2 }),
    footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 3 }),
  ] as const;''',
    '''export function footballGmFinalResultV2(input: {
  seed: string;
  yearOneRoster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  resolvedSeasons?: readonly FootballGmSeasonResultV2[];
}) : FootballGmFinalResultV2 {
  const seasons = (input.resolvedSeasons?.length === 3
    ? [input.resolvedSeasons[0]!, input.resolvedSeasons[1]!, input.resolvedSeasons[2]!]
    : [
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.yearOneRoster, year: 1 }),
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 2 }),
        footballGmSeasonResultV2({ seed: input.seed, yearOneRoster: input.yearOneRoster, roster: input.finalRoster, year: 3 }),
      ]) as readonly [FootballGmSeasonResultV2, FootballGmSeasonResultV2, FootballGmSeasonResultV2];''',
)

mode = "src/features/back-room/FootballGmModePage.tsx"
replace_once(
    mode,
    '  type FootballGmNegotiationConsequences,\n  type FootballGmTradeProposal,',
    '  type FootballGmNegotiationConsequences,\n  type FootballGmSeasonResultV2,\n  type FootballGmTradeProposal,',
)
replace_once(
    mode,
    '  finalRoster: FootballGmRosterEntry[];\n  tradeChipPlayerIds: string[];',
    '  finalRoster: FootballGmRosterEntry[];\n  resolvedSeasons: FootballGmSeasonResultV2[];\n  tradeChipPlayerIds: string[];',
)
replace_once(
    mode,
    '''function challengeSeed(value: ChallengeJson | undefined) {
  const row = record(value);
  return row?.version === FOOTBALL_GM_VERSION && typeof row.seed === "string"
    ? row.seed
    : null;
}''',
    '''function challengeSeed(value: ChallengeJson | undefined) {
  const row = record(value);
  const compatibleVersion = row?.version === FOOTBALL_GM_VERSION || row?.version === "football-gm-v8-head-to-head";
  return compatibleVersion && typeof row?.seed === "string"
    ? row.seed
    : null;
}''',
)
replace_once(mode, '    finalRoster: [],\n    tradeChipPlayerIds: [],', '    finalRoster: [],\n    resolvedSeasons: [],\n    tradeChipPlayerIds: [],')
replace_once(
    mode,
    '''  if (
    parsed.version !== FOOTBALL_GM_VERSION
    || typeof parsed.seed !== "string"
    || typeof parsed.phase !== "string"
    || !Array.isArray(parsed.roster)
    || !Array.isArray(parsed.finalRoster)
  ) return null;
  return parsed as PersistedRun;''',
    '''  const compatibleVersion = parsed.version === FOOTBALL_GM_VERSION || parsed.version === "football-gm-v8-head-to-head";
  if (
    !compatibleVersion
    || typeof parsed.seed !== "string"
    || typeof parsed.phase !== "string"
    || !Array.isArray(parsed.roster)
    || !Array.isArray(parsed.finalRoster)
  ) return null;
  return {
    ...parsed,
    version: FOOTBALL_GM_VERSION,
    resolvedSeasons: Array.isArray(parsed.resolvedSeasons) ? parsed.resolvedSeasons : [],
  } as PersistedRun;''',
)
replace_once(
    mode,
    '      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster, finalRoster })',
    '      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster, finalRoster, resolvedSeasons: run.resolvedSeasons })',
)
replace_once(
    mode,
    '    [finalRoster, run.phase, run.seed, yearOneRoster],',
    '    [finalRoster, run.phase, run.resolvedSeasons, run.seed, yearOneRoster],',
)
replace_once(
    mode,
    '''            <button className="primary-action" type="button" onClick={() => patch({
              phase: "offseason",
              finalRoster: [...run.roster],
            })}>ENTER THE OFFSEASON</button>''',
    '''            <button className="primary-action" type="button" onClick={() => patch({
              phase: "offseason",
              finalRoster: [...run.roster],
              resolvedSeasons: [footballGmSeasonResultV2({
                seed: run.seed,
                yearOneRoster: run.roster,
                roster: run.roster,
                year: 1,
              })],
            })}>ENTER THE OFFSEASON</button>''',
)
replace_once(
    mode,
    '''                      onClick={() => patch({ phase: "years23" })}
                    >SIMULATE YEARS 2 & 3</button>''',
    '''                      onClick={() => {
                        const yearOne = run.resolvedSeasons[0] ?? footballGmSeasonResultV2({
                          seed: run.seed,
                          yearOneRoster: run.roster,
                          roster: run.roster,
                          year: 1,
                        });
                        patch({
                          phase: "years23",
                          resolvedSeasons: [
                            yearOne,
                            footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 2 }),
                            footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 3 }),
                          ],
                        });
                      }}
                    >SIMULATE YEARS 2 & 3</button>''',
)
replace_once(
    mode,
    '''export function SeasonCard({
  seed,
  year,
  yearOneRoster,
  roster,
}: {
  seed: string;
  year: 1 | 2 | 3;
  yearOneRoster: readonly FootballGmRosterEntry[];
  roster: readonly FootballGmRosterEntry[];
}) {
  const result = footballGmSeasonResultV2({ seed, yearOneRoster, roster, year });''',
    '''export function SeasonCard({
  seed,
  year,
  yearOneRoster,
  roster,
  resolvedResult,
}: {
  seed: string;
  year: 1 | 2 | 3;
  yearOneRoster: readonly FootballGmRosterEntry[];
  roster: readonly FootballGmRosterEntry[];
  resolvedResult?: FootballGmSeasonResultV2;
}) {
  const result = resolvedResult ?? footballGmSeasonResultV2({ seed, yearOneRoster, roster, year });''',
)
replace_once(
    mode,
    '''            <SeasonCard seed={run.seed} year={2} yearOneRoster={run.roster} roster={run.finalRoster} />
            <SeasonCard seed={run.seed} year={3} yearOneRoster={run.roster} roster={run.finalRoster} />''',
    '''            <SeasonCard seed={run.seed} year={2} yearOneRoster={run.roster} roster={run.finalRoster} resolvedResult={run.resolvedSeasons[1]} />
            <SeasonCard seed={run.seed} year={3} yearOneRoster={run.roster} roster={run.finalRoster} resolvedResult={run.resolvedSeasons[2]} />''',
)

report = "src/features/back-room/FootballGmFranchiseReport.tsx"
replace_once(
    report,
    '  type FootballGmNegotiationConsequences,\n} from "./footballGmStrategy";',
    '  type FootballGmNegotiationConsequences,\n  type FootballGmSeasonResultV2,\n} from "./footballGmStrategy";',
)
replace_once(
    report,
    '  finalRoster: readonly FootballGmRosterEntry[];\n  negotiationConsequences: FootballGmNegotiationConsequences;',
    '  finalRoster: readonly FootballGmRosterEntry[];\n  resolvedSeasons?: readonly FootballGmSeasonResultV2[];\n  negotiationConsequences: FootballGmNegotiationConsequences;',
)
replace_once(
    report,
    '''  const result = footballGmFinalResultV2({
    seed: run.seed,
    yearOneRoster: run.roster,
    finalRoster: end,
  });''',
    '''  const result = footballGmFinalResultV2({
    seed: run.seed,
    yearOneRoster: run.roster,
    finalRoster: end,
    resolvedSeasons: run.resolvedSeasons,
  });''',
)

repo = "src/features/play/footballGmMatchRepository.ts"
replace_once(
    repo,
    'import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterSlot } from "../back-room/footballGmEngine";',
    'import { FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry, type FootballGmRosterSlot } from "../back-room/footballGmEngine";\nimport { footballGmSeasonResultV2, type FootballGmSeasonResultV2 } from "../back-room/footballGmStrategy";',
)
replace_once(
    repo,
    '''    async finishOffseason(code, runState) {
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(runState),
      }));
    },''',
    '''    async finishOffseason(code, runState) {
      const state = stateSchema.parse(await rpc(client, "get_my_football_gm_match", { p_code: code }));
      const row = runState && typeof runState === "object" && !Array.isArray(runState)
        ? runState as Record<string, unknown>
        : null;
      const seed = typeof row?.seed === "string" ? row.seed : null;
      const yearOneRoster = Array.isArray(row?.roster) ? row.roster as FootballGmRosterEntry[] : null;
      const finalRoster = Array.isArray(row?.finalRoster) ? row.finalRoster as FootballGmRosterEntry[] : null;
      const participant = seed
        ? state.participants.find((candidate) => seed === `${state.seed}:${candidate.id}`) ?? null
        : null;
      const yearOneResult = participant?.year1_result as FootballGmSeasonResultV2 | null | undefined;
      const resolvedSeasons = seed && yearOneRoster?.length === 7 && finalRoster?.length === 7 && yearOneResult
        ? [
            yearOneResult,
            footballGmSeasonResultV2({ seed, yearOneRoster, roster: finalRoster, year: 2 }),
            footballGmSeasonResultV2({ seed, yearOneRoster, roster: finalRoster, year: 3 }),
          ]
        : null;
      const lockedRunState = row && resolvedSeasons
        ? { ...row, resolvedSeasons }
        : runState;
      return stateSchema.parse(await rpc(client, "finish_football_gm_offseason", {
        p_code: code,
        p_run_state: asJson(lockedRunState),
      }));
    },''',
)

# Update stale calibration assertions and add shared-environment coverage.
test = "src/features/back-room/footballGmStrategy.test.ts"
replace_many(test, [
    ('expect(footballGmTitleOdds(90)).toBeCloseTo(0.18, 6);', 'expect(footballGmTitleOdds(90)).toBeCloseTo(0.32, 6);'),
    ('expect(footballGmTitleOdds(91)).toBeCloseTo(0.27, 6);', 'expect(footballGmTitleOdds(91)).toBeCloseTo(0.46, 6);'),
    ('expect(footballGmTitleOdds(92)).toBeCloseTo(0.37, 6);', 'expect(footballGmTitleOdds(92)).toBeCloseTo(0.60, 6);'),
    ('expect(footballGmTitleOdds(93)).toBeCloseTo(0.46, 6);', 'expect(footballGmTitleOdds(93)).toBeCloseTo(0.67, 6);'),
    ('expect(footballGmTitleOdds(94)).toBeCloseTo(0.50, 6);', 'expect(footballGmTitleOdds(94)).toBeCloseTo(0.72, 6);'),
    ('expect(footballGmTitleOdds(98)).toBeCloseTo(0.50, 6);', 'expect(footballGmTitleOdds(98)).toBeCloseTo(0.85, 6);'),
    ('      [89, 0.05, 0.12],', '      [89, 0.02, 0.19],'),
    ('      [90, 0.025, 0.18],', '      [90, 0.005, 0.32],'),
    ('      [91, 0.01, 0.27],', '      [91, 0.001, 0.46],'),
    ('      [92, 0.005, 0.37],', '      [92, 0, 0.60],'),
    ('      [93, 0.002, 0.46],', '      [93, 0, 0.67],'),
    ('      [94, 0, 0.50],', '      [94, 0, 0.72],'),
    ('      [95, 0, 0.50],', '      [95, 0, 0.76],'),
    ('      [96, 0, 0.50],', '      [96, 0, 0.79],'),
    ('      [97, 0, 0.50],', '      [97, 0, 0.82],'),
    ('      [98, 0, 0.50],', '      [98, 0, 0.85],'),
    ('expect(footballGmOutcomeProbabilities(90)["Missed Playoffs"]).toBe(0.025);', 'expect(footballGmOutcomeProbabilities(90)["Missed Playoffs"]).toBe(0.005);'),
    ('expect(footballGmOutcomeProbabilities(90).Divisional).toBe(0.235);', 'expect(footballGmOutcomeProbabilities(90).Divisional).toBe(0.14);'),
    ('expect(footballGmOutcomeProbabilities(90)["Conference Championship"]).toBe(0.235);', 'expect(footballGmOutcomeProbabilities(90)["Conference Championship"]).toBe(0.26);'),
    ('expect(footballGmOutcomeProbabilities(90)["Super Bowl Loss"]).toBe(0.21);', 'expect(footballGmOutcomeProbabilities(90)["Super Bowl Loss"]).toBe(0.24);'),
    ('const repeatAt94 = (2 * (0.50 ** 2)) - (0.50 ** 3);', 'const repeatAt94 = (2 * (0.72 ** 2)) - (0.72 ** 3);'),
    ('const threePeatAt94 = 0.50 ** 3;', 'const threePeatAt94 = 0.72 ** 3;'),
    ('expect(repeatAt94).toBeCloseTo(0.375, 6);', 'expect(repeatAt94).toBeCloseTo(0.663552, 6);'),
    ('expect(threePeatAt94).toBeCloseTo(0.125, 6);', 'expect(threePeatAt94).toBeCloseTo(0.373248, 6);'),
    ('expect(expectedScore(90)).toBeCloseTo(94.6, 1);', 'expect(expectedScore(90)).toBeCloseTo(95.7, 1);'),
    ('expect(expectedScore(94)).toBeCloseTo(98.4, 1);', 'expect(expectedScore(94)).toBeCloseTo(99.0, 1);'),
])

# Insert grade dominance and shared H2H season-roll regression tests immediately
# before the existing independent-year roll test.
replace_once(
    test,
    '''  it("uses independent deterministic season rolls instead of carrying the same luck year to year", () => {''',
    '''  it("makes stronger grades stochastically dominate weaker grades at every playoff cutoff", () => {
    const finishes = ["Missed Playoffs", "Wild Card", "Divisional", "Conference Championship", "Super Bowl Loss"] as const;
    for (let grade = 78; grade < 98; grade += 1) {
      const lower = footballGmOutcomeProbabilities(grade);
      const higher = footballGmOutcomeProbabilities(grade + 1);
      let lowerCumulative = 0;
      let higherCumulative = 0;
      for (const finish of finishes) {
        lowerCumulative += lower[finish];
        higherCumulative += higher[finish];
        expect(higherCumulative).toBeLessThanOrEqual(lowerCumulative + 1e-10);
      }
    }
  });

  it("uses the same season environment for both GMs in a head-to-head match", () => {
    const matchSeed = "96b8202df6524e01aefad824674dde84";
    const tyler = `${matchSeed}:14470970-7900-4571-b737-db289bced19d`;
    const lib = `${matchSeed}:210b27ce-6c25-406c-b772-0ff725379e3e`;
    expect(footballGmSeasonRoll(tyler, 1)).toBe(footballGmSeasonRoll(lib, 1));
    expect(footballGmSeasonRoll(tyler, 2)).toBe(footballGmSeasonRoll(lib, 2));
    expect(footballGmSeasonRoll(tyler, 3)).toBe(footballGmSeasonRoll(lib, 3));
  });

  it("uses independent deterministic season rolls instead of carrying the same luck year to year", () => {''',
)

# Final sanity assertions before handing the branch to CI.
strategy_text = (ROOT / strategy).read_text()
assert 'football-gm-v9-grade-driven-playoffs' in strategy_text
assert 'gm-season-v4' in strategy_text
assert 'resolvedSeasons?: readonly FootballGmSeasonResultV2[];' in strategy_text
mode_text = (ROOT / mode).read_text()
assert 'resolvedSeasons: FootballGmSeasonResultV2[];' in mode_text
assert 'football-gm-v8-head-to-head' in mode_text
repo_text = (ROOT / repo).read_text()
assert 'resolvedSeasons' in repo_text

# Remove the temporary patch machinery from the final source commit.
(ROOT / "scripts/tmp_gm_recalibrate.py").unlink()
workflow = ROOT / ".github/workflows/tmp-gm-recalibrate.yml"
if workflow.exists():
    workflow.unlink()
