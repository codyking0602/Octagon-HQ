import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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

describe("V1 history import retirement migration", () => {
  const migrationPath = "supabase/migrations/202607300005_retire_v1_history_import_rpcs.sql";
  const migration = executableSql(readRepositoryFile(migrationPath));

  it("retires only the two completed one-time import RPCs", () => {
    expect(migration.match(/\bdrop function\b/g)).toHaveLength(2);
    expect(migration).toContain("drop function public.import_v1_history_atomic(jsonb);");
    expect(migration).toContain("drop function public.import_v1_history_atomic_reconciled(jsonb);");
    expect(migration).not.toContain("cascade");
  });

  it("removes every remaining execute grant before dropping the functions", () => {
    for (const signature of [
      "public.import_v1_history_atomic(jsonb)",
      "public.import_v1_history_atomic_reconciled(jsonb)",
    ]) {
      expect(migration).toContain(
        `revoke all on function ${signature} from public, anon, authenticated, service_role;`,
      );
    }
  });

  it("cannot delete, rewrite, or structurally change imported data", () => {
    expect(migration).not.toMatch(/\b(insert|update|delete|truncate|merge)\b/);
    expect(migration).not.toMatch(/\b(create|alter|drop)\s+table\b/);
    expect(migration).not.toMatch(/\b(create|alter|drop)\s+(view|materialized view)\b/);
  });

  it("preserves the immutable migrations that originally created the RPCs", () => {
    expect(
      readRepositoryFile("supabase/migrations/202607300001_atomic_v1_history_import.sql"),
    ).toContain("create or replace function public.import_v1_history_atomic(p_payload jsonb)");
    expect(
      readRepositoryFile("supabase/migrations/202607300002_v1_history_import_reconciliation.sql"),
    ).toContain("create or replace function public.import_v1_history_atomic_reconciled(p_payload jsonb)");
  });
});
