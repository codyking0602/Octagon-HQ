import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {CUP_GROUPS,CUP_POINTS,cupPickCount,validCupPicks} from "./nbaCup2026";

describe("2026 NBA Cup owner group-picks preview",()=>{
  it("has exactly six valid groups, five teams apiece, and no repeated teams",()=>{
    expect(CUP_GROUPS).toHaveLength(6);
    const ids=CUP_GROUPS.flatMap(g=>[...g.teams]);
    expect(ids).toHaveLength(30);
    expect(new Set(ids).size).toBe(30);
    expect(CUP_GROUPS.filter(g=>g.conference==="East")).toHaveLength(3);
    expect(CUP_GROUPS.filter(g=>g.conference==="West")).toHaveLength(3);
    expect(CUP_GROUPS.find(g=>g.id==="EA")?.teams).toEqual(["DET","TOR","ORL","MIL","BKN"]);
    expect(CUP_GROUPS.find(g=>g.id==="WA")?.teams).toEqual(["DEN","HOU","PHX","DAL","UTA"]);
  });
  it("retains approved 100-point scoring with six 5-point group winners",()=>{
    expect(CUP_POINTS).toEqual({groups:30,quarterfinals:20,semifinals:20,champion:30});
    expect(Object.values(CUP_POINTS).reduce((sum,v)=>sum+v,0)).toBe(100);
  });
  it("validates partial picks and rejects unknown and cross-group teams",()=>{
    expect(validCupPicks({EA:"DET",WC:"SAS"})).toBe(true);
    expect(cupPickCount({EA:"DET",WC:"SAS"})).toBe(2);
    expect(validCupPicks({EA:"DEN"})).toBe(false);
    expect(validCupPicks({UN:"DET"})).toBe(false);
    expect(validCupPicks({EA:10})).toBe(false);
    expect(validCupPicks([])).toBe(false);
    expect(validCupPicks(null)).toBe(false);
  });
  it("is protected by both an owner-only route and separate server permissions",()=>{
    const gate=readFileSync("src/features/nba/NbaCupOwnerGate.tsx","utf8");
    expect(gate).toContain("canPreviewNbaWhoAmI(identity.profile)");
    expect(gate).not.toContain("canAccessNbaGames");
    const sql=readFileSync("supabase/migrations/202612310886_nba_cup_owner_group_preview.sql","utf8");
    expect(sql).toContain("public.pick_control_owners");
    expect(sql).toContain("upper(trim(p.display_name))='CODY'");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on public.nba_cup_group_preview_2026");
    expect(sql).toContain("manually_locked");
    expect(sql).not.toContain("now()>=");
    const router=readFileSync("src/app/router.tsx","utf8");
    expect(router).toContain('path: "nba/cup", element: <NbaCupOwnerGate><NbaCup2026Page /></NbaCupOwnerGate>');
    const futures=readFileSync("src/features/nba/NbaFuturesPage.tsx","utf8");
    expect(futures).toContain("canPreviewNbaWhoAmI(identity.profile)");
    expect(futures).toContain('to="/nba/cup"');
  });
});
