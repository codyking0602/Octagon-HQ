import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {readFileSync} from "node:fs";
import {NbaCupLockedView} from "./NbaCupLockedView";

const picks={EA:"DET",EB:"PHI",EC:"BOS",WA:"HOU",WB:"OKC",WC:"SAS"} as const;

describe("locked 2026 NBA Cup Football Picks parity",()=>{
  it("shows six read-only team cards, the compact standings scorecard, and no selection controls",()=>{
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[{
      profile_id:"member-1",display_name:"CODY",picks,
    }]} loading={false} error=""/>);
    expect(html).toContain("PICKS &amp; STANDINGS");
    expect(html).toContain("CORRECT PICKS");
    expect(html).toContain("GROUP RANK");
    expect(html).toContain("PICKS MADE");
    expect(html).toContain("VIEW STANDINGS");
    expect(html).toContain("3"); // entry count
    expect(html).toContain("Detroit Pistons");
    expect(html).toContain("Houston Rockets");
    expect(html).toContain("San Antonio Spurs");
    expect(html.match(/nba-cup__locked-card"/g)).toHaveLength(6);
    expect(html).not.toContain("SAVE PICKS");
    expect(html).not.toContain("aria-pressed");
    expect(html).not.toContain("CONTINUE TO WEST GROUPS");
  });
  it("reveals another member's saved picks in a collapsible read-only panel",()=>{
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[{
      profile_id:"member-2",display_name:"SHANE",picks:{EA:"ORL",EB:"CLE",EC:"BOS",WA:"HOU",WB:"OKC",WC:"LAL"},
    }]} loading={false} error=""/>);
    expect(html).toContain("SHANE");
    expect(html).toContain("Orlando Magic");
    expect(html).toContain("Los Angeles Lakers");
    expect(html).toContain("0 FINAL · 6 REMAINING");
  });
  it("does not expose group selections while the manual lock is off",()=>{
    const sql=readFileSync("supabase/migrations/202612310935_nba_cup_locked_member_standings.sql","utf8");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("if not coalesce(v_locked, false) then");
    expect(sql).toContain("'entries', '[]'::jsonb");
    expect(sql).toContain("to authenticated;");
    expect(sql).toContain("from public, anon, authenticated;");
    const page=readFileSync("src/features/nba/NbaCup2026Page.tsx","utf8");
    expect(page).toContain("picks&&locked?<NbaCupLockedView");
    expect(page).toContain("disabled={locked||saving}");
    expect(page).toContain("PICKS SAVED ✓");
  });
});
