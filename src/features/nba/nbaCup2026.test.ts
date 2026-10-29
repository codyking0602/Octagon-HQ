import {describe,expect,it} from "vitest";
import {existsSync,readFileSync} from "node:fs";
import {CUP_GROUPS,CUP_POINTS,cupPickCount,validCupPicks} from "./nbaCup2026";

describe("2026 NBA Cup public group-picks release",()=>{
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
  it("opens the Cup to members while retaining authenticated per-profile access and manual lock",()=>{
    const gate=readFileSync("src/features/nba/NbaCupOwnerGate.tsx","utf8");
    expect(gate).toContain("canPreviewNba(identity.profile)");
    expect(gate).not.toContain("canAccessNbaGames");
    const sql=readFileSync("supabase/migrations/202612310886_nba_cup_owner_group_preview.sql","utf8");
    expect(sql).toContain("public.pick_control_owners");
    expect(sql).toContain("upper(trim(p.display_name))='CODY'");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on public.nba_cup_group_preview_2026");
    expect(sql).toContain("manually_locked");
    const publicSql=readFileSync("supabase/migrations/202612310887_nba_cup_public_group_picks.sql","utf8");
    expect(publicSql).toContain("public.get_nba_cup_group_preview()");
    expect(publicSql).toContain("public.save_nba_cup_group_preview(p_picks jsonb)");
    expect(publicSql).toContain("auth.uid()");
    expect(publicSql).not.toContain("pick_control_owners");
    expect(publicSql).toContain("nba_cup_group_picks_locked");
    expect(publicSql).toContain("nba_cup_invalid_group_pick_");
    expect(publicSql).toContain("to authenticated;");
    expect(publicSql).toContain("from public,anon;");
    expect(sql).not.toContain("now()>=");
    const router=readFileSync("src/app/router.tsx","utf8");
    expect(router).toContain('path: "nba/cup", element: <NbaCupOwnerGate><NbaCup2026Page /></NbaCupOwnerGate>');
    const futures=readFileSync("src/features/nba/NbaFuturesPage.tsx","utf8");
    expect(futures).toContain("const cupAvailable=NBA_PUBLIC_ENABLED;");
    expect(futures).toContain("<NbaCupHero/>");
    expect(futures).toContain("<NbaCupGroups/>");
  });
  it("keeps the Cup, team selections and all Futures on one Basketball Picks screen",()=>{
    const page=readFileSync("src/features/nba/NbaFuturesPage.tsx","utf8");
    const hero=readFileSync("src/features/nba/NbaCupHero.tsx","utf8");
    const cup=readFileSync("src/features/nba/NbaCup2026Page.tsx","utf8");
    const styles=readFileSync("src/features/nba/nbaCup2026.css","utf8");
    expect(page).toContain("<NbaCupHero/>");
    expect(page).toContain("<NbaCupGroups/>");
    expect(page.indexOf("<NbaCupHero/>")).toBeLessThan(page.indexOf("<NbaCupGroups/>"));
    expect(page.indexOf("<NbaCupGroups/>")).toBeLessThan(page.indexOf('<details className="nba-picks__futures hq-picks-disclosure">'));
    expect(page).toContain('hq-picks-disclosure__title">FUTURES</strong>');
    expect(page).not.toMatch(/GROUP FUTURES|SEASON FUTURES/);
    expect(page).toContain("nba-futures-group-entry--mine");
    expect(page).toContain("otherEntries.map(entry=><NbaFuturesGroupEntry");
    expect(page).toContain("entry.profile_id!==identity.profile?.id");
    expect(hero).not.toMatch(/MAKE CUP PICKS|linked/);
    expect(hero).not.toContain('to="/nba/cup"');
    expect(hero).toContain('role="img"');
    expect(hero).not.toContain("<h1>");
    expect(cup).toContain("<h1>NBA Cup 2026</h1>");
    expect(styles).toContain('/images/9D9EDB43-8AF0-4851-80BA-AB30D2DDF78A.png');
    expect(existsSync("public/images/9D9EDB43-8AF0-4851-80BA-AB30D2DDF78A.png")).toBe(true);
    expect(cup).toContain('export function NbaCupGroups()');
    expect(cup).toContain('return <Navigate to="/nba/picks" replace/>');
  });
  it("retains private Cup access while avoiding duplicate save controls",()=>{
    const cup=readFileSync("src/features/nba/NbaCup2026Page.tsx","utf8");
    expect(cup).not.toMatch(/private owner test|owner test|owner preview|test only/i);
    expect(cup).toContain("nba-cup__floating-save");
    expect(cup).toContain("IntersectionObserver");
    expect(cup).toContain("!saveVisible");
    expect(cup).toContain("PICKS SAVED ✓");
    expect(cup).toContain("December knockout bracket coming next.");
    expect(cup).not.toContain('className="nba-cup__next"');
    expect(cup).not.toContain("CUP_POINTS");
    expect(cup).not.toContain('<div><strong>{locked?"PICKS LOCKED"');
    expect(cup).toContain('aria-pressed={chosen}');
    expect(cup).toContain("CONTINUE TO WEST GROUPS");
    expect(cup).toContain('disabled={locked||saving}');
    
  });
});
