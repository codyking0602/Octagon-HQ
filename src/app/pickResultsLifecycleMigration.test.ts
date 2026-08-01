import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationPath = "supabase/migrations/202607310001_pick_results_lifecycle.sql";

function readRepositoryFile(path: string) {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function executableSql(source: string) {
  return source
    .replace(/--.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

describe("official Picks result lifecycle migration", () => {
  const migration = executableSql(readRepositoryFile(migrationPath));

  it("adds explicit decisive, excluded, and pending bout outcomes", () => {
    for (const status of [
      "pending",
      "red_win",
      "blue_win",
      "draw",
      "no_contest",
      "cancelled",
    ]) {
      expect(migration).toContain(`'${status}'`);
    }
    expect(migration).toContain("add column if not exists result_status text");
    expect(migration).toContain("add column if not exists result_recorded_at timestamptz");
    expect(migration).toContain("add column if not exists completed_at timestamptz");
  });

  it("keeps official mutations behind exactly two service-role owners", () => {
    expect(migration).toContain(
      "create or replace function public.record_official_pick_bout_result( p_event_id text, p_bout_id text, p_result_status text )",
    );
    expect(migration).toContain(
      "create or replace function public.transition_pick_event( p_event_id text, p_target_status text )",
    );
    expect(migration).toContain(
      "grant execute on function public.record_official_pick_bout_result(text, text, text) to service_role;",
    );
    expect(migration).toContain(
      "grant execute on function public.transition_pick_event(text, text) to service_role;",
    );
    expect(migration).not.toMatch(
      /grant execute on function public\.(record_official_pick_bout_result|transition_pick_event)[^;]*to (anon|authenticated)/,
    );
  });

  it("requires a locked event and every bout result before atomic completion", () => {
    expect(migration).toContain("event must be locked before recording results");
    expect(migration).toContain("event must be locked before completion");
    expect(migration).toContain("all bout results must be resolved before completion");
    expect(migration).toContain("completed event results are immutable");
    expect(migration).toContain("completed event is immutable");
  });

  it("projects correct, incorrect, missing, and excluded recap verdicts", () => {
    expect(migration).toContain("create or replace function public.get_my_pick_history(p_season integer default null)");
    for (const verdict of ["correct", "incorrect", "missing", "excluded", "pending"]) {
      expect(migration).toContain(`'${verdict}'`);
    }
    expect(migration).toContain("bout.result_status in ('draw', 'no_contest', 'cancelled') then 'excluded'");
    expect(migration).toContain("bout.result_status in ('red_win', 'blue_win')");
  });

  it("leaves browser code read-only for official event administration", () => {
    const provider = readRepositoryFile("src/features/picks/PicksProvider.tsx");
    const repository = readRepositoryFile("src/features/picks/picksRepository.ts");
    for (const owner of ["record_official_pick_bout_result", "transition_pick_event"]) {
      expect(provider).not.toContain(owner);
      expect(repository).not.toContain(owner);
    }
  });
});
