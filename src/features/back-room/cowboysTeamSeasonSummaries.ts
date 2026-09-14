export const COWBOYS_TEAM_SEASON_SUMMARIES = {
  "2007 Cowboys": "13-3 • NFC East Champion • NFC No. 1 seed",
  "2008 Cowboys": "9-7 • Third in NFC East • Missed playoffs",
  "2009 Cowboys": "11-5 • NFC East Champion • Won Wild Card",
  "2010 Cowboys": "6-10 • Third in NFC East",
  "2011 Cowboys": "8-8 • Third in NFC East",
  "2012 Cowboys": "8-8 • Third in NFC East",
  "2013 Cowboys": "8-8 • Second in NFC East",
  "2014 Cowboys": "12-4 • NFC East Champion • Won Wild Card",
  "2015 Cowboys": "4-12 • Fourth in NFC East",
  "2016 Cowboys": "13-3 • NFC East Champion • NFC No. 1 seed",
  "2017 Cowboys": "9-7 • Second in NFC East • Missed playoffs",
  "2018 Cowboys": "10-6 • NFC East Champion • Won Wild Card",
  "2019 Cowboys": "8-8 • Second in NFC East • Missed playoffs",
  "2020 Cowboys": "6-10 • Third in NFC East",
  "2021 Cowboys": "12-5 • NFC East Champion • Wild Card",
  "2022 Cowboys": "12-5 • Won Wild Card • Divisional Round",
  "2023 Cowboys": "12-5 • NFC East Champion • Wild Card",
  "2024 Cowboys": "7-10 • Third in NFC East",
  "2025 Cowboys": "7-9-1 • Second in NFC East",
} as const;

export type CowboysTeamSeasonLabel = keyof typeof COWBOYS_TEAM_SEASON_SUMMARIES;

export function cowboysTeamSeasonSummary(displayLabel: string | null | undefined) {
  if (!displayLabel) return "";
  return COWBOYS_TEAM_SEASON_SUMMARIES[displayLabel as CowboysTeamSeasonLabel] ?? "";
}
