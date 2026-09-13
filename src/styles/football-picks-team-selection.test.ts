import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-picks-team-selection.css"), "utf8");
const main = readFileSync(resolve(process.cwd(), "src/main.tsx"), "utf8");

const powerFourTeams = [
  // ACC
  "Boston College Eagles",
  "California Golden Bears",
  "Clemson Tigers",
  "Duke Blue Devils",
  "Florida State Seminoles",
  "Georgia Tech Yellow Jackets",
  "Louisville Cardinals",
  "Miami Hurricanes",
  "NC State Wolfpack",
  "North Carolina Tar Heels",
  "Pittsburgh Panthers",
  "SMU Mustangs",
  "Stanford Cardinal",
  "Syracuse Orange",
  "Virginia Cavaliers",
  "Virginia Tech Hokies",
  "Wake Forest Demon Deacons",
  // Big Ten
  "Illinois Fighting Illini",
  "Indiana Hoosiers",
  "Iowa Hawkeyes",
  "Maryland Terrapins",
  "Michigan Wolverines",
  "Michigan State Spartans",
  "Minnesota Golden Gophers",
  "Nebraska Cornhuskers",
  "Northwestern Wildcats",
  "Ohio State Buckeyes",
  "Oregon Ducks",
  "Penn State Nittany Lions",
  "Purdue Boilermakers",
  "Rutgers Scarlet Knights",
  "UCLA Bruins",
  "USC Trojans",
  "Washington Huskies",
  "Wisconsin Badgers",
  // Big 12
  "Arizona Wildcats",
  "Arizona State Sun Devils",
  "Baylor Bears",
  "BYU Cougars",
  "Cincinnati Bearcats",
  "Colorado Buffaloes",
  "Houston Cougars",
  "Iowa State Cyclones",
  "Kansas Jayhawks",
  "Kansas State Wildcats",
  "Oklahoma State Cowboys",
  "TCU Horned Frogs",
  "Texas Tech Red Raiders",
  "UCF Knights",
  "Utah Utes",
  "West Virginia Mountaineers",
  // SEC
  "Alabama Crimson Tide",
  "Arkansas Razorbacks",
  "Auburn Tigers",
  "Florida Gators",
  "Georgia Bulldogs",
  "Kentucky Wildcats",
  "LSU Tigers",
  "Mississippi State Bulldogs",
  "Missouri Tigers",
  "Oklahoma Sooners",
  "Ole Miss Rebels",
  "South Carolina Gamecocks",
  "Tennessee Volunteers",
  "Texas Longhorns",
  "Texas A&M Aggies",
  "Vanderbilt Commodores",
] as const;

describe("Football Picks team-aware selection styling", () => {
  it("loads after the base Football Picks stylesheet", () => {
    const base = main.indexOf('import "./styles/football-picks.css";');
    const team = main.indexOf('import "./styles/football-picks-team-selection.css";');
    expect(base).toBeGreaterThanOrEqual(0);
    expect(team).toBeGreaterThan(base);
  });

  it("uses team identity colors for NFL selected states", () => {
    expect(css).toContain('[aria-label^="New England Patriots "]');
    expect(css).toContain('[aria-label^="Seattle Seahawks "]');
    expect(css).toContain('[aria-label^="San Francisco 49ers "]');
    expect(css).toContain('[aria-label^="Los Angeles Rams "]');
    expect(css).toContain("--football-pick-team-color");
    expect(css).toContain("color-mix(in srgb, var(--football-pick-team-color) 34%, #111415)");
  });

  it("has a team color mapping for every Power Four program", () => {
    expect(powerFourTeams).toHaveLength(67);
    for (const team of powerFourTeams) {
      expect(css, `missing team-color mapping for ${team}`).toContain(`[aria-label^="${team} "]`);
    }
  });

  it("keeps logos protected while making the selected edge unmistakable", () => {
    expect(css).toContain(".football-pick-team:not(.is-selected) .football-pick-team-mark { opacity: .78; }");
    expect(css).toContain(".football-pick-team.is-selected .football-pick-team-mark");
    expect(css).toContain("inset 3px 0");
    expect(css).toContain("inset -3px 0");
  });
});
