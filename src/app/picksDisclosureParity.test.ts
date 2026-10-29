import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";

const read=(path:string)=>readFileSync(path,"utf8");

describe("Picks disclosure parity across UFC, Football, and NBA",()=>{
  it("uses one muted title and chevron treatment for all sport footers",()=>{
    const css=read("src/styles/picks-disclosures.css");
    const app=read("src/app/AppShell.tsx");
    expect(app).toContain('import "../styles/picks-disclosures.css"');
    for(const selector of [".picks-scoring-guide",".picks-season-hub",".football-futures",".football-picks-grading",".nba-picks__futures",".nba-picks__scoring"]){
      expect(css).toContain(selector);
    }
    expect(css).toContain("rotate(45deg)");
    expect(css).toContain("color:#83868c");
    const football=read("src/features/picks/FootballPicksPage.tsx");
    expect(football).toContain("<summary><span>SCORING &amp; GRADING</span></summary>");
    const nba=read("src/features/nba/NbaFuturesPage.tsx");
    expect(nba).toContain("<summary><strong>FUTURES</strong></summary>");
    expect(nba).toContain("<summary><strong>SCORING &amp; GRADING</strong></summary>");
  });
  it("leaves the trophy image entirely free of text overlays and shows one Cup status",()=>{
    const hero=read("src/features/nba/NbaCupHero.tsx");
    const cup=read("src/features/nba/NbaCup2026Page.tsx");
    expect(hero).toContain('role="img"');
    expect(hero).not.toMatch(/<h1>|<p\b|<span\b/);
    expect(cup).toContain("<h1>NBA Cup 2026</h1>");
    expect(cup).toContain("DECEMBER BRACKET COMING");
    expect(cup).not.toContain("nba-cup__next");
    expect(cup).toContain("nba-cup__progress");
    expect(cup).toContain("!saveVisible");
    expect(cup).toContain('className="sr-only"');
  });
});
