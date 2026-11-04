import {afterEach,describe,expect,it,vi} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {readFileSync} from "node:fs";
import {CUP_GAMES,CUP_NIGHTS,cupGroupRecords,cupFixtureId} from "./nbaCupTracker";
import {normalizeCupScoreFeed} from "./nbaCupScoresRepository";
import {NbaCupLockedView} from "./NbaCupLockedView";
import {mergeCupGameScores,VERIFIED_CUP_OPENING_NIGHT} from "../../../worker/nbaCupScoreboard";
import {parseOfficialNbaCupSchedule} from "../../../worker/nbaCupNbaSchedule";

const picks={EA:"DET",EB:"PHI",EC:"BOS",WA:"HOU",WB:"OKC",WC:"SAS"} as const;
const now=Date.parse("2026-11-04T17:00:00.000Z");
afterEach(()=>vi.restoreAllMocks());
const sample=(events:unknown[])=>normalizeCupScoreFeed({source:"NBA+ESPN",events,refreshedAt:"2026-11-04T16:00:00Z"},now);

describe("NBA Cup actual results and Football-like follow-along",()=>{
  it("has the ten independently verified Oct 30 finals, restoring Detroit 1-0 +16",()=>{
    expect(VERIFIED_CUP_OPENING_NIGHT).toHaveLength(10);
    expect(new Set(VERIFIED_CUP_OPENING_NIGHT.map(x=>x.id)).size).toBe(10);
    expect(VERIFIED_CUP_OPENING_NIGHT.every(x=>x.status==="final")).toBe(true);
    const feed=sample(VERIFIED_CUP_OPENING_NIGHT);
    expect(feed.failedDates).toEqual([]);
    expect(feed.byGame["2026-10-30|DET|BKN"]).toMatchObject({awayScore:110,homeScore:94,status:"final"});
    const records=cupGroupRecords("EA",feed);
    expect(records.find(x=>x.teamId==="DET")).toMatchObject({wins:1,losses:0,differential:16});
    expect(records.find(x=>x.teamId==="BKN")).toMatchObject({wins:0,losses:1,differential:-16});
    expect(records.find(x=>x.teamId==="ORL")).toMatchObject({wins:1,losses:0,differential:7});
  });
  it("prefers an official corrected final while excluding any non-Cup contest",()=>{
    const id=cupFixtureId("2026-10-30","DET","BKN");
    const fixture=VERIFIED_CUP_OPENING_NIGHT.find(x=>x.id===id)!;
    const official={...fixture,awayScore:111,homeScore:94};
    const combined=mergeCupGameScores(VERIFIED_CUP_OPENING_NIGHT,[official,{
      ...official,id:"2026-11-02|DET|CHA",
    }]);
    expect(combined).toHaveLength(10);
    expect(combined.find(x=>x.id===id)?.awayScore).toBe(111);
    expect(sample([...combined,{...official,id:"2026-11-04|DET|PHI"}]).byGame["2026-11-04|DET|PHI"]).toBeUndefined();
  });
  it("validates the 2026-27 NBA CDN schedule and rejects unrelated fixtures",()=>{
    const games=CUP_GAMES.slice(0,10).map(game=>({
      gameCode:game.date.replaceAll("-","")+"/"+game.away+game.home,
      gameStatus:game.id==="2026-10-30|DET|BKN"?3:1,
      gameStatusText:"Final",
      awayTeam:{teamTricode:game.away,score:game.away==="DET"?110:0},
      homeTeam:{teamTricode:game.home,score:game.home==="BKN"?94:0},
    }));
    const result=parseOfficialNbaCupSchedule({leagueSchedule:{seasonYear:"2026-27",gameDates:[{games:[
      ...games,{gameCode:"20261104/PHIDET",gameStatus:3,
        awayTeam:{teamTricode:"PHI",score:1},homeTeam:{teamTricode:"DET",score:2}},
    ]}]}});
    expect(result).toHaveLength(10);
    expect(result.find(x=>x.id==="2026-10-30|DET|BKN")).toMatchObject({status:"final",awayScore:110,homeScore:94});
    expect(()=>parseOfficialNbaCupSchedule({leagueSchedule:{seasonYear:"2025-26",gameDates:[{games}]}})).toThrow();
  });
  it("shows all four selected teams playing Nov 6 and a final score card for Detroit",()=>{
    vi.spyOn(Date,"now").mockReturnValue(now);
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[]} loading={false} error=""
      scoreFeed={sample(VERIFIED_CUP_OPENING_NIGHT)}/>);
    expect(html).toContain("4 OF YOUR PICKS PLAYING");
    expect(html).toContain("Boston Celtics @ Charlotte Hornets");
    expect(html).toContain("Philadelphia 76ers @ Cleveland Cavaliers");
    expect(html).toContain("Oklahoma City Thunder @ Memphis Grizzlies");
    expect(html).toContain("San Antonio Spurs @ Sacramento Kings");
    expect(html).toContain("Oct 30");
    expect(html).toContain("110");
    expect(html).toContain("94");
    expect(html).toContain("WIN");
    expect(html).toContain("GROUP STANDINGS");
    expect(html.match(/nba-cup__locked-card"/g)).toHaveLength(6);
    expect(html).not.toContain("SAVE PICKS");
  });
  it("uses Cup W-L and differential instead of Pending in every collapsed card",()=>{
    vi.spyOn(Date,"now").mockReturnValue(now);
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[]} loading={false} error=""
      scoreFeed={sample(VERIFIED_CUP_OPENING_NIGHT)}/>);
    expect(html).toContain('aria-label="Cup record: 1–0 · +16"');
    expect(html).toContain('aria-label="Cup record: 0–0 · 0"');
    expect(html).not.toContain(">PENDING</span>");
    const incomplete=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[]} loading={false} error=""
      scoreFeed={sample([])}/>);
    expect(incomplete).toContain('aria-label="Cup record: —"');
  });
  it("keeps the next Cup night personalized without repeating the four featured games",()=>{
    vi.spyOn(Date,"now").mockReturnValue(now);
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[]} loading={false} error=""
      scoreFeed={sample(VERIFIED_CUP_OPENING_NIGHT)}/>);
    const nextNight=html.split('class="nba-cup__locked-section-heading"')[0];
    expect(nextNight).toContain("OTHER 5 CUP MATCHUPS");
    expect(nextNight).not.toContain("ALL 9 CUP MATCHUPS");
    expect((nextNight.match(/Boston Celtics @ Charlotte Hornets/g)??[])).toHaveLength(1);
    expect((nextNight.match(/Philadelphia 76ers @ Cleveland Cavaliers/g)??[])).toHaveLength(1);
    expect((nextNight.match(/Oklahoma City Thunder @ Memphis Grizzlies/g)??[])).toHaveLength(1);
    expect((nextNight.match(/San Antonio Spurs @ Sacramento Kings/g)??[])).toHaveLength(1);
    expect(nextNight).toContain("Washington Wizards @ Atlanta Hawks");
  });
  it("renders one compact final score row and eliminates locked-only bottom padding",()=>{
    vi.spyOn(Date,"now").mockReturnValue(now);
    const html=renderToStaticMarkup(<NbaCupLockedView picks={picks} members={[]} loading={false} error=""
      scoreFeed={sample(VERIFIED_CUP_OPENING_NIGHT)}/>);
    expect(html).toContain('class="nba-cup__game-final-main"');
    expect(html).toContain("110–94");
    expect(html).toContain("Oct 30 · FINAL");
    expect(html).not.toContain("nba-cup__game-final-score is-my-team");
    const css=readFileSync("src/features/nba/nbaCup2026.css","utf8");
    const page=readFileSync("src/features/nba/NbaCup2026Page.tsx","utf8");
    expect(css).toContain(".nba-picks-page .nba-cup__main--locked{padding-bottom:0}");
    expect(page).toContain('locked?" nba-cup__main--locked":""');
  });
  it("marks missing past scores without inventing records, but not future dates",()=>{
    const feed=sample([]);
    expect(feed.failedDates).toEqual(["2026-10-30"]);
    expect(sample(VERIFIED_CUP_OPENING_NIGHT).failedDates).toEqual([]);
    expect(CUP_NIGHTS).toHaveLength(7);
  });
});
