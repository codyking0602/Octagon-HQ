from pathlib import Path

model_path = Path('src/features/back-room/footballFindLeaderModel.ts')
model = model_path.read_text()
old_model = '''export function footballFindLeaderMetricRows(metricId: FootballFindLeaderMetricId): ScoredRow[] {
  const definition = footballFindLeaderMetricDefinitions.find((row) => row.id === metricId);
  if (!definition) return [];
  const poolDefinition = footballFindLeaderCandidatePools.find((row) => row.metricId === metricId);
  if (!poolDefinition) return [];
  const direction = footballFindLeaderMetricDirection(metricId);
  return queryFootballSubjects(poolDefinition.subjectQuery)
    .flatMap((subject) => {
      const fact = getFootballFact(subject.id, poolDefinition.canonicalMetricId);
      const record = getFootballFactualRecord(subject.id);
      if (!fact || !record || !(record.scopes ?? [record.scope]).includes(poolDefinition.factualScope)) return [];
      const subtitle = subject.kind === "player-season"
        ? `NFL quarterback season${subject.season ? ` · ${subject.season}` : ""}`
        : subject.kind === "team-season"
          ? `${subject.league} team season${subject.season ? ` · ${subject.season}` : ""}`
          : playerCareerSubtitle(subject);
      return [{
        id: subject.id,
        name: subject.name,
        subtitle,
        value: fact.fact.value,
        competitionValue: competitionValue(direction, fact.fact.value),
      }];
    })
    .sort((left, right) => right.competitionValue - left.competitionValue || left.name.localeCompare(right.name));
}
'''
new_model = '''const footballFindLeaderMetricRowCache = new Map<FootballFindLeaderMetricId, ScoredRow[]>();

export function footballFindLeaderMetricRows(metricId: FootballFindLeaderMetricId): ScoredRow[] {
  const cached = footballFindLeaderMetricRowCache.get(metricId);
  if (cached) return cached;
  const definition = footballFindLeaderMetricDefinitions.find((row) => row.id === metricId);
  if (!definition) return [];
  const poolDefinition = footballFindLeaderCandidatePools.find((row) => row.metricId === metricId);
  if (!poolDefinition) return [];
  const direction = footballFindLeaderMetricDirection(metricId);
  const rows = queryFootballSubjects(poolDefinition.subjectQuery)
    .flatMap((subject) => {
      const fact = getFootballFact(subject.id, poolDefinition.canonicalMetricId);
      const record = getFootballFactualRecord(subject.id);
      if (!fact || !record || !(record.scopes ?? [record.scope]).includes(poolDefinition.factualScope)) return [];
      const subtitle = subject.kind === "player-season"
        ? `NFL quarterback season${subject.season ? ` · ${subject.season}` : ""}`
        : subject.kind === "team-season"
          ? `${subject.league} team season${subject.season ? ` · ${subject.season}` : ""}`
          : playerCareerSubtitle(subject);
      return [{
        id: subject.id,
        name: subject.name,
        subtitle,
        value: fact.fact.value,
        competitionValue: competitionValue(direction, fact.fact.value),
      }];
    })
    .sort((left, right) => right.competitionValue - left.competitionValue || left.name.localeCompare(right.name));
  footballFindLeaderMetricRowCache.set(metricId, rows);
  return rows;
}
'''
if old_model not in model:
    raise SystemExit('expected metric-row function not found')
model_path.write_text(model.replace(old_model, new_model))

test_path = Path('src/features/back-room/footballFindLeaderModel.test.ts')
test = test_path.read_text()
anchor = '''  it("requires both numerical quality and explicit fan-interest approval", () => {'''
regression = '''  it("reuses immutable metric rows instead of rebuilding deep projected pools", () => {
    const first = footballFindLeaderMetricRows("qb-passing-yards");
    expect(first.length).toBeGreaterThanOrEqual(FOOTBALL_FIND_LEADER_MIN_POOL_SIZE);
    expect(footballFindLeaderMetricRows("qb-passing-yards")).toBe(first);
  });

'''
if regression.strip() not in test:
    if anchor not in test:
        raise SystemExit('metric-row cache test anchor not found')
    test = test.replace(anchor, regression + anchor)
test_path.write_text(test)
