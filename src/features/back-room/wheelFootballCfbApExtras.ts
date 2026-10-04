import type { WheelFootballCfbBaselineTeam } from "./wheelFootballCfbPriority";

export const WHEEL_FOOTBALL_CFB_AP_EXTRA_PRIORITIES: Readonly<
  Record<string, WheelFootballCfbBaselineTeam>
> = {
  "boise-state": {
    school: "Boise State",
    conference: "Pac-12",
    espnId: "68",
    depthChartUrl: "https://secure.ourlads.com/ncaa-football-depth-charts/depth-chart/boise-state/90130",
    rosterUrl: "https://www.espn.com/college-football/team/roster/_/id/68/boise-state-broncos",
    QB: ["Maddux Madsen", "Max Cutforth"],
    RB: ["Dylan Riley", "Sire Gaines", "Juelz Goff"],
    WR: ["Rasean Jones", "Akeem Wright", "Cam Bates", "Ben Ford"],
    TE: ["Matt Wagner", "Troy Grizzle"],
    Flex: ["Dylan Riley", "Rasean Jones", "Matt Wagner", "Sire Gaines"],
    "Front Seven": [
      "Jayden Virgin-Morgan",
      "Boen Phelps",
      "Max Stege",
      "David Latu",
      "Jake Ripp",
      "Mikaio Edward",
    ],
    Secondary: [
      "JeRico Washington Jr.",
      "Jaden Mickey",
      "Derek Ganter Jr.",
      "Travis Anderson",
      "Sherrod Smith",
      "Roman Tillmon",
    ],
    "Head Coach": ["Spencer Danielson"],
    reconciliationWarnings: [],
  },
};
