import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ufcAthletePageUrl } from "../features/picks-monitoring/ufcFighterMedia";

describe("Muhammad Saidov source profile and active UFC Wheel country",()=>{
  const sql=readFileSync("supabase/migrations/202612310603_ufc_saidov_identity_country.sql","utf8");
  it("binds official Muhammad Said source slug to canonical Saidov identity",()=>{
    expect(ufcAthletePageUrl("muhammad-saidov")).toBe("https://www.ufc.com/athlete/muhammad-said");
    expect(sql).toContain("fighter_id='muhammad-saidov'");
    expect(sql).toContain("'muhammad saidov'");
    expect(sql).toContain("country_code='RU',country_name='Russia'");
    expect(sql).toContain("country_code='TJ' and country_name='Tajikistan'");
  });
  it("retains grade, ranked slots, champions, fight result identities and old picks",()=>{
    expect(sql).toContain("hidden_grade=74");
    expect(sql).toContain("ranking=13");
    expect(sql).toContain("where active) <> 168");
    expect(sql).toContain("ranking between 1 and 15) <> 120");
    expect(sql).toContain("active and is_champion) <> 8");
    expect(sql).not.toMatch(/\bupdate\s+private\.wheel_ufc_picks\b/i);
    expect(sql).not.toMatch(/\bset\s+hidden_grade\s*=/i);
    expect(sql).not.toMatch(/\bset\s+ranking\s*=/i);
  });
});