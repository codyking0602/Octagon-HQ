export const LONGHORNS_TEAM_SEASON_SUMMARIES = {
  "2003 Texas": "10–3 • Holiday Bowl Appearance",
  "2004 Texas": "11–1 • Rose Bowl Champion",
  "2005 Texas": "13–0 • National Champion",
  "2006 Texas": "10–3 • Alamo Bowl Champion",
  "2007 Texas": "10–3 • Holiday Bowl Champion",
  "2008 Texas": "12–1 • BCS Bowl Champion",
  "2009 Texas": "13–1 • Big 12 Champion • National Runner-Up",
  "2010 Texas": "5–7 • Missed Bowl",
  "2011 Texas": "8–5 • Holiday Bowl Champion",
  "2012 Texas": "9–4 • Alamo Bowl Champion",
  "2013 Texas": "8–5 • Alamo Bowl Appearance",
  "2014 Texas": "6–7 • Texas Bowl Appearance",
  "2015 Texas": "5–7 • Missed Bowl",
  "2016 Texas": "5–7 • Missed Bowl",
  "2017 Texas": "7–6 • Texas Bowl Champion",
  "2018 Texas": "10–4 • New Year’s Six Bowl Champion",
  "2019 Texas": "8–5 • Alamo Bowl Champion",
  "2020 Texas": "7–3 • Alamo Bowl Champion",
  "2021 Texas": "5–7 • Missed Bowl",
  "2022 Texas": "8–5 • Alamo Bowl Appearance",
  "2023 Texas": "12–2 • Big 12 Champion • CFP Semifinalist",
  "2024 Texas": "13–3 • SEC Runner-Up • CFP Semifinalist",
  "2025 Texas": "10–3 • Citrus Bowl Champion",
} as const;

export type LonghornsTeamSeasonLabel = keyof typeof LONGHORNS_TEAM_SEASON_SUMMARIES;

export function longhornsTeamSeasonSummary(displayLabel: string | null | undefined) {
  if (!displayLabel) return "";
  return LONGHORNS_TEAM_SEASON_SUMMARIES[displayLabel as LonghornsTeamSeasonLabel] ?? "";
}
