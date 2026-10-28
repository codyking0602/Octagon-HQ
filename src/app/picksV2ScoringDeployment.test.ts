import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const prepareSql = readFileSync(
  "supabase/migrations/202608020000_prepare_picks_v2_scoring.sql",
  "utf8",
);
const verifySql = readFileSync(
  "supabase/migrations/202608020002_verify_picks_v2_scoring_rpc.sql",
  "utf8",
);

describe("Picks V2 scoring deployment order", () => {
  it("drops the prior summary function before changing its table return shape", () => {
    expect(prepareSql).toContain(
      "drop function if exists public.get_my_pick_summary(integer)",
    );
  });

  it("requires the new RPC signatures and reloads the PostgREST schema", () => {
    expect(verifySql).toContain(
      "to_regprocedure('public.get_my_event_underdog_lock(text)')",
    );
    expect(verifySql).toContain(
      "to_regprocedure('public.set_my_event_underdog_lock(text,text,text)')",
    );
    expect(verifySql).toContain(
      "to_regprocedure('public.clear_my_event_underdog_lock(text)')",
    );
    expect(verifySql).toContain("notify pgrst, 'reload schema'");
  });
});
