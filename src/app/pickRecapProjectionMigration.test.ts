import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationPath = "supabase/migrations/202608010001_pick_history_group_results.sql";

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

describe("completed Picks recap projection migration", () => {
  const migration = executableSql(readRepositoryFile(migrationPath));

  it("extends the existing authenticated history projection instead of adding a second owner", () => {
    expect(migration).toContain(
      "create or replace function public.get_my_pick_history(p_season integer default null)",
    );
    expect(migration).toContain(
      "grant execute on function public.get_my_pick_history(integer) to authenticated",
    );
    expect(migration).not.toContain("create function public.get_group_pick_history");
  });

  it("derives compact event standings from submitted profile picks", () => {
    expect(migration).toContain("entered_profiles as");
    expect(migration).toContain("from public.profile_event_picks pick");
    expect(migration).toContain("'group_results'");
    expect(migration).toContain("'is_current_user'");
    expect(migration).toContain("order by correct desc, incorrect asc, missing asc, display_name asc");
  });

  it("preserves decisive, missing, and excluded scoring semantics", () => {
    expect(migration).toContain("when bout.result_status in ('draw', 'no_contest', 'cancelled') then 'excluded'");
    expect(migration).toContain("when pick.fighter_slug is null then 'missing'");
    expect(migration).toContain("when pick.fighter_slug = bout.winner_fighter_slug then 'correct'");
    expect(migration).toContain("else 'incorrect'");
  });

  it("does not expose any browser mutation path", () => {
    const provider = readRepositoryFile("src/features/picks/PicksProvider.tsx");
    const repository = readRepositoryFile("src/features/picks/picksRepository.ts");
    for (const owner of ["record_official_pick_bout_result", "transition_pick_event"]) {
      expect(provider).not.toContain(owner);
      expect(repository).not.toContain(owner);
    }
  });
});
