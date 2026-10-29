import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";

const source=(path:string)=>readFileSync(path,"utf8");

describe("Picks screen visual parity",()=>{
  it("keeps NBA Cup art free of copy and shows one concise progress indicator",()=>{
    const hero=source("src/features/nba/NbaCupHero.tsx");
    const cup=source("src/features/nba/NbaCup2026Page.tsx");
    const page=source("src/features/nba/NbaFuturesPage.tsx");
    expect(hero).toContain('role="img"');
    expect(hero).not.toMatch(/<h1>|<p|<button|<span/);
    expect(cup).toContain("<h1>NBA Cup 2026</h1>");
    expect(cup).toContain("December knockout bracket coming next.");
    expect(cup).toContain("OCT 30 – NOV 27");
    expect(cup).toContain('className="nba-cup__progress-line"');
    expect(cup).not.toContain('className="nba-cup__next"');
    expect(cup).not.toContain("CUP_POINTS");
    expect(cup).toContain("dirty&&!locked?<section");
    expect(page).toContain("<NbaCupHero/><NbaCupGroups/>");
  });
  it("shares one muted Chevron treatment among NBA, Football and UFC",()=>{
    const styles=source("src/styles/picks-disclosures.css");
    const shell=source("src/app/AppShell.tsx");
    const nba=source("src/features/nba/NbaFuturesPage.tsx");
    const football=source("src/features/picks/FootballPicksPage.tsx");
    const futures=source("src/features/picks/FootballFuturesCard.tsx");
    const ufc=source("src/features/picks/PicksPage.tsx");
    const archive=source("src/features/picks/PicksSeasonHub.tsx");
    expect(shell).toContain('import "../styles/picks-disclosures.css"');
    expect(shell).toContain('sport === "nba" ? "NBA"');
    for(const view of [nba,football,futures,ufc,archive]){
      expect(view).toContain("hq-picks-disclosure");
    }
    expect(styles).toContain("details.hq-picks-disclosure > summary");
    expect(styles).toContain(".hq-picks-disclosure__chevron");
    expect(styles).toContain(".hq-picks-disclosure--archive");
    expect(football).not.toContain("<strong>HOW IT WORKS</strong>");
    expect(ufc).toContain('hq-picks-disclosure__title">SCORING &amp; UNDERDOG LOCK RULES');
  });
});
