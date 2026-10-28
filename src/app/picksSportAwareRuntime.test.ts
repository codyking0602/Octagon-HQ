import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repository = readFileSync("src/features/picks/picksRepository.ts", "utf8");
const provider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202612310067_sport_aware_current_pick_event.sql", "utf8");

describe("sport-aware canonical Picks runtime", () => {
  it("keeps the zero-argument UFC RPC and adds one filtered canonical overload", () => {
    expect(migration).toContain("create function public.get_current_pick_event(p_sport text)");
    expect(migration).toContain("and event.sport = case lower(trim(p_sport))");
    expect(migration).not.toContain("drop function");
    expect(repository).toContain('client.rpc("get_current_pick_event", { p_sport: sport })');
  });

  it("uses the same repository and provider for both sport contexts", () => {
    expect(provider).toContain('sport = "mma"');
    expect(provider).toContain("repository.loadCurrentEvent(sport)");
    expect(repository).toContain('client.rpc("list_my_event_picks"');
    expect(repository).toContain('client.rpc("save_my_event_pick"');

    const pickFiles = readdirSync("src/features/picks");
    expect(pickFiles).not.toContain("footballPicksRepository.ts");
    expect(pickFiles).not.toContain("FootballPicksProvider.tsx");
  });
});
