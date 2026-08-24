import type { FootballRankFivePackId } from "./footballRankFiveModel";

export type FootballBlindResumeArchetype =
  | "team-season"
  | "player-career"
  | "player-season"
  | "coach"
  | "program-era";

export type FootballBlindResumeEvidenceValueTuple = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface FootballBlindResumeEvidenceRow {
  dimensionId: string;
  label: string;
  value: string;
}

export interface FootballBlindResumeEvidenceProfile {
  packId: FootballRankFivePackId;
  subjectId: string;
  league: "NFL" | "CFB";
  archetype: FootballBlindResumeArchetype;
  evidence: readonly FootballBlindResumeEvidenceRow[];
}

const ARCHETYPE_DIMENSIONS = {
  "team-season": [
    ["record", "Record / result"],
    ["offense", "Offensive production"],
    ["defense", "Defensive production"],
    ["opponent-quality", "Opponent quality"],
    ["signature-results", "Signature results"],
    ["star-power", "Star power"],
    ["postseason-path", "Postseason path"],
    ["historical-distinction", "Historical distinction"],
  ],
  "player-career": [
    ["career-production", "Career production"],
    ["efficiency", "Efficiency"],
    ["peak", "Peak performance"],
    ["awards", "Awards / honors"],
    ["team-success", "Postseason / team success"],
    ["longevity", "Longevity / consistency"],
    ["records", "Records / rankings"],
    ["career-distinction", "Defining career distinction"],
  ],
  "player-season": [
    ["season-production", "Season production"],
    ["efficiency-rank", "Efficiency / league rank"],
    ["awards", "Awards"],
    ["team-result", "Team result"],
    ["big-game", "Big-game / postseason"],
    ["secondary-production", "Secondary production"],
    ["record-book", "Record book"],
    ["season-distinction", "Defining season distinction"],
  ],
  coach: [
    ["win-loss", "W-L resume"],
    ["championships", "Championships"],
    ["conference-division", "Conference / division success"],
    ["peak-stretch", "Peak stretch"],
    ["elite-postseason", "Elite / postseason wins"],
    ["development", "Player / roster development"],
    ["longevity", "Longevity"],
    ["coach-distinction", "Defining accomplishment"],
  ],
  "program-era": [
    ["era-record", "Era record"],
    ["national-titles", "National championships"],
    ["conference-titles", "Conference titles"],
    ["elite-finishes", "Elite finishes / playoff trips"],
    ["dominance", "Dominance"],
    ["talent-pipeline", "Star talent / draft output"],
    ["postseason-results", "Postseason results"],
    ["era-distinction", "Historical distinction"],
  ],
} as const satisfies Record<
  FootballBlindResumeArchetype,
  readonly (readonly [dimensionId: string, label: string])[]
>;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function validateFootballBlindResumeEvidenceProfile(
  profile: FootballBlindResumeEvidenceProfile,
) {
  if (profile.evidence.length !== 8) {
    throw new Error(
      `Football Blind Resume evidence ${profile.packId}:${profile.subjectId} must contain exactly 8 rows.`,
    );
  }
  const dimensions = new Set<string>();
  const labels = new Set<string>();
  for (const row of profile.evidence) {
    if (!row.dimensionId.trim() || !row.label.trim() || !row.value.trim()) {
      throw new Error(
        `Football Blind Resume evidence ${profile.packId}:${profile.subjectId} contains an incomplete row.`,
      );
    }
    const dimension = normalize(row.dimensionId);
    const label = normalize(row.label);
    if (dimensions.has(dimension)) {
      throw new Error(
        `Football Blind Resume evidence ${profile.packId}:${profile.subjectId} repeats dimension ${row.dimensionId}.`,
      );
    }
    if (labels.has(label)) {
      throw new Error(
        `Football Blind Resume evidence ${profile.packId}:${profile.subjectId} repeats label ${row.label}.`,
      );
    }
    dimensions.add(dimension);
    labels.add(label);
  }
  return profile;
}

function profile(
  packId: FootballRankFivePackId,
  subjectId: string,
  league: "NFL" | "CFB",
  archetype: FootballBlindResumeArchetype,
  values: FootballBlindResumeEvidenceValueTuple,
): FootballBlindResumeEvidenceProfile {
  const dimensions = ARCHETYPE_DIMENSIONS[archetype];
  return validateFootballBlindResumeEvidenceProfile({
    packId,
    subjectId,
    league,
    archetype,
    evidence: dimensions.map(([dimensionId, label], index) => ({
      dimensionId,
      label,
      value: values[index]!,
    })),
  });
}

export const footballBlindResumeEvidenceProfiles: readonly FootballBlindResumeEvidenceProfile[] = [
  profile("nfl-quarterbacks", "tom-brady", "NFL", "player-career", [
    "89,214 passing yards · 649 passing TD",
    "97.2 career passer rating · 64.3% completions",
    "2007: 4,806 yards · 50 TD · 8 INT · 117.2 rating",
    "3× AP MVP · 3× first-team All-Pro",
    "7 championships · 10 title-game starts · 35 playoff wins",
    "23 seasons · 15 Pro Bowls",
    "NFL career leader in passing yards and passing TD",
    "Won championships 18 seasons apart and with two franchises",
  ]),
  profile("nfl-quarterbacks", "peyton-manning", "NFL", "player-career", [
    "71,940 passing yards · 539 passing TD",
    "96.5 career passer rating · 65.3% completions",
    "2013: 5,477 yards · 55 TD · 115.1 rating",
    "5× AP MVP · 7× first-team All-Pro",
    "2 championships · 4 title-game starts · 14 playoff wins",
    "18 seasons · 14 Pro Bowls",
    "Owns the NFL single-season records for passing yards and passing TD",
    "Started championship wins for two different franchises",
  ]),
  profile("nfl-quarterbacks", "joe-montana", "NFL", "player-career", [
    "40,551 passing yards · 273 passing TD",
    "92.3 career passer rating · 63.2% completions",
    "1989: 3,521 yards · 26 TD · 8 INT · 112.4 rating",
    "2× AP MVP · 3× first-team All-Pro",
    "4 championships · 16 playoff wins",
    "15 seasons · 8 Pro Bowls",
    "Title-game passing line: 11 TD · 0 INT · 127.8 rating",
    "Went 4–0 as the starter in championship games",
  ]),

  profile("nfl-running-backs", "barry-sanders", "NFL", "player-career", [
    "15,269 rushing yards · 99 rushing TD",
    "5.0 career yards per carry",
    "1997: 2,053 rushing yards · 6.1 yards per carry",
    "1997 AP MVP · 6× first-team All-Pro",
    "1 playoff win · no championship-game appearance",
    "10 seasons · 10 Pro Bowls · 10 straight 1,000-yard seasons",
    "4× NFL rushing champion",
    "Retired after a 1,491-yard season while still within range of the career rushing record",
  ]),
  profile("nfl-running-backs", "emmitt-smith", "NFL", "player-career", [
    "18,355 rushing yards · 164 rushing TD",
    "4.2 career yards per carry",
    "1995: 1,773 rushing yards · 25 rushing TD",
    "1993 AP MVP · 4× first-team All-Pro",
    "3 championships · championship-game MVP · 1,586 playoff rushing yards",
    "15 seasons · 8 Pro Bowls · 11 straight 1,000-yard seasons",
    "NFL career leader in rushing yards and rushing TD",
    "Won a rushing title, league MVP and championship-game MVP in the same season",
  ]),
  profile("nfl-running-backs", "walter-payton", "NFL", "player-career", [
    "16,726 rushing yards · 110 rushing TD",
    "4.4 career yards per carry",
    "1977: 1,852 rushing yards · 14 rushing TD",
    "1977 AP MVP · 5× first-team All-Pro",
    "1 championship · 632 career playoff rushing yards",
    "13 seasons · 9 Pro Bowls · 10 1,000-yard seasons",
    "Retired as the NFL career rushing-yards leader",
    "Set a 275-yard single-game rushing record that stood for 23 years",
  ]),

  profile("nfl-head-coaches", "bill-belichick", "NFL", "coach", [
    "302–165 regular season · 31–13 playoffs",
    "6 championships as head coach",
    "9 conference championships · 17 division titles",
    "2001–2018: 6 titles and 9 championship-game appearances",
    "31 postseason wins · most by an NFL head coach",
    "All 6 title teams finished top 10 in points allowed",
    "29 seasons as an NFL head coach",
    "Won 6 titles across an 18-season span",
  ]),
  profile("nfl-head-coaches", "don-shula", "NFL", "coach", [
    "328–156–6 regular season · 19–17 playoffs",
    "2 championships",
    "6 championship-game appearances across three decades",
    "1971–1973: 36–5–1 regular season · 8–1 playoffs",
    "19 postseason wins",
    "Reached championship games with three different Hall-of-Fame quarterbacks",
    "33 seasons as an NFL head coach · only 2 losing seasons",
    "Coached the only perfect season of the Super Bowl era",
  ]),
  profile("nfl-head-coaches", "bill-walsh", "NFL", "coach", [
    "92–59–1 regular season · 10–4 playoffs",
    "3 championships",
    "3 conference championships",
    "1981–1988: 3 titles in 8 seasons",
    "10 postseason wins",
    "Built a title core around a third-round quarterback and later an all-time receiver",
    "10 seasons as an NFL head coach · 7 playoff berths",
    "Went 3–0 in championship games",
  ]),

  profile("nfl-qb-seasons", "aaron-rodgers-2011", "NFL", "player-season", [
    "4,643 passing yards · 45 TD · 6 INT",
    "122.5 passer rating · 9.2 yards per attempt",
    "AP MVP · first-team All-Pro",
    "15–1 regular season · No. 1 conference seed",
    "264 passing yards · 2 TD · 1 INT in divisional-round loss",
    "257 rushing yards · 3 rushing TD",
    "122.5 remains the NFL single-season passer-rating record",
    "Historic efficiency paired with a 15-win regular season but no playoff win",
  ]),
  profile("nfl-qb-seasons", "patrick-mahomes-2022", "NFL", "player-season", [
    "5,250 passing yards · 41 TD · 12 INT",
    "105.2 passer rating · 8.1 yards per attempt",
    "AP MVP · first-team All-Pro",
    "14–3 regular season · championship winner",
    "7 playoff passing TD · 0 INT · championship-game MVP",
    "358 rushing yards · 4 rushing TD",
    "5,614 total offensive yards set an NFL single-season record",
    "Won league MVP and championship-game MVP in the same season",
  ]),
  profile("nfl-qb-seasons", "steve-young-1994", "NFL", "player-season", [
    "3,969 passing yards · 35 TD · 10 INT",
    "112.8 passer rating · 8.6 yards per attempt",
    "AP MVP · first-team All-Pro",
    "13–3 regular season · championship winner",
    "11 playoff passing TD · 0 INT",
    "293 rushing yards · 7 rushing TD",
    "Led the NFL in completion rate, passing TD and passer rating",
    "Threw a championship-game record 6 TD passes",
  ]),

  profile("nfl-team-seasons", "1972-miami-dolphins", "NFL", "team-season", [
    "17–0 overall · championship winner",
    "27.5 points per game · league-best 2,960 rushing yards",
    "12.2 points allowed per game · No. 1 scoring defense",
    "Three playoff opponents combined for a 32–10 regular-season record",
    "Won all three playoff games by 7 points or fewer",
    "Two 1,000-yard rushers powered the league's No. 1 rushing attack",
    "Postseason scores: 20–14 · 21–17 · 14–7",
    "Only perfect season of the Super Bowl era",
  ]),
  profile("nfl-team-seasons", "1985-chicago-bears", "NFL", "team-season", [
    "18–1 overall · championship winner",
    "28.5 points per game · No. 2 scoring offense",
    "12.4 points allowed per game · 64 sacks · No. 1 scoring defense",
    "Three playoff opponents combined for a 32–16 regular-season record",
    "Opened the playoffs with back-to-back shutouts",
    "Defensive Player of the Year plus a 1,551-yard Hall-of-Fame running back",
    "Outscored postseason opponents 91–10",
    "+258 regular-season point differential with only one loss",
  ]),
  profile("nfl-team-seasons", "1991-washington", "NFL", "team-season", [
    "17–2 overall · championship winner",
    "30.3 points per game · No. 1 scoring offense",
    "14.0 points allowed per game · No. 2 scoring defense",
    "Three playoff opponents combined for a 35–13 regular-season record",
    "Won all three playoff games by double digits",
    "Starting quarterback led the NFL in yards per attempt and made the Pro Bowl",
    "Outscored postseason opponents 102–41",
    "+261 regular-season point differential",
  ]),

  profile("college-quarterbacks", "cam-newton-2010", "CFB", "player-season", [
    "2,854 passing yards · 30 passing TD · 7 INT",
    "182.0 NCAA passer rating · 10.2 yards per attempt",
    "Heisman Trophy · AP Player of the Year",
    "14–0 · conference champion · national champion",
    "Won conference title game and national title game while accounting for 8 total TD",
    "1,473 rushing yards · 20 rushing TD · 1 receiving TD",
    "51 total TD responsible for",
    "Heisman season plus an undefeated championship in his only year as the starter",
  ]),
  profile("college-quarterbacks", "joe-burrow-2019", "CFB", "player-season", [
    "5,671 passing yards · 60 passing TD · 6 INT",
    "202.0 NCAA passer rating · 76.3% completions",
    "Heisman Trophy · AP Player of the Year",
    "15–0 · conference champion · national champion",
    "956 passing yards · 12 passing TD across the two CFP games",
    "368 rushing yards · 5 rushing TD",
    "Set a then-FBS single-season record with 60 passing TD",
    "Finished 15–0 after beating seven AP Top-10 opponents",
  ]),
  profile("college-quarterbacks", "vince-young-2005", "CFB", "player-season", [
    "3,036 passing yards · 26 passing TD · 10 INT",
    "163.9 NCAA passer rating · 65.2% completions",
    "Heisman runner-up · Maxwell Award",
    "13–0 · conference champion · national champion",
    "467 total yards · 3 rushing TD in the national title game",
    "1,050 rushing yards · 12 rushing TD",
    "First FBS player to pass for 3,000 and rush for 1,000 yards in one season",
    "Capped an undefeated season with the championship-winning TD in the final minute",
  ]),

  profile("college-head-coaches", "nick-saban-cfb", "CFB", "coach", [
    "297–71–1 college head-coaching record",
    "7 national championships",
    "9 SEC championships",
    "2009–2020: 151–15 with 6 national titles",
    "6–2 in national championship games during the 2009–2020 dynasty run",
    "Produced at least one first-round NFL pick in 16 straight drafts from 2009–2024",
    "28 college head-coaching seasons · winning record at every stop",
    "Won national championships at two programs and six in a 12-season span",
  ]),
  profile("college-head-coaches", "urban-meyer-cfb", "CFB", "coach", [
    "187–32 college head-coaching record",
    "3 national championships",
    "7 conference championships across three leagues",
    "2006–2009: 48–7 with 2 national titles",
    "12–3 bowl record",
    "Developed multiple first-round quarterbacks and Heisman-level offensive stars",
    "17 college head-coaching seasons · no losing season",
    "Won national championships at two different programs",
  ]),
  profile("college-head-coaches", "bob-stoops-cfb", "CFB", "coach", [
    "191–48 college head-coaching record",
    "1 national championship",
    "10 Big 12 championships",
    "2000–2004: 60–7 with 4 conference titles",
    "4 national championship-game appearances",
    "Coached two Heisman-winning quarterbacks and recruited a third eventual winner",
    "18 seasons at one program · 14 seasons with 10+ wins",
    "Won 10 conference titles in an 18-season tenure",
  ]),

  profile("college-program-eras", "alabama-2009-2020", "CFB", "program-era", [
    "151–15 over 12 seasons",
    "6 national championships",
    "7 SEC championships",
    "8 national championship-game appearances",
    "12 straight seasons with at least 10 wins",
    "Produced at least one first-round NFL pick in every draft from 2010–2021",
    "6–2 in national championship games",
    "Won 6 national titles in a 12-season span",
  ]),
  profile("college-program-eras", "usc-2002-2008", "CFB", "program-era", [
    "82–9 over 7 seasons",
    "2 national championships",
    "7 straight Pac-10 championships",
    "7 straight AP Top-4 finishes",
    "Won at least 11 games in all 7 seasons",
    "Produced 3 Heisman Trophy winners during the era",
    "6–1 in BCS bowl games",
    "Built a 34-game winning streak from 2003–2005",
  ]),
  profile("college-program-eras", "clemson-2015-2020", "CFB", "program-era", [
    "79–7 over 6 seasons",
    "2 national championships",
    "6 straight ACC championships",
    "6 straight CFP appearances · 4 title-game trips",
    "Five straight seasons with at least 12 wins",
    "Developed two top-12 NFL draft picks at quarterback, including a No. 1 pick",
    "6–4 in CFP games",
    "Only program to reach each of the first six CFPs from 2015–2020",
  ]),

  profile("college-team-seasons", "2020-alabama", "CFB", "team-season", [
    "13–0 · national champion",
    "48.5 points per game · 541.6 yards per game",
    "19.4 points allowed per game",
    "Played 11 SEC games plus two CFP opponents",
    "Beat five teams that finished in the AP Top 13",
    "Heisman winner at receiver · quarterback finished 3rd in Heisman voting",
    "Won CFP games 31–14 and 52–24",
    "Went undefeated without playing a non-Power-Five opponent",
  ]),
  profile("college-team-seasons", "2005-texas", "CFB", "team-season", [
    "13–0 · national champion",
    "50.2 points per game · 512.1 yards per game",
    "16.4 points allowed per game",
    "Beat two teams that finished in the AP Top 4",
    "Won the conference title game 70–3 before beating the No. 1 team",
    "Heisman runner-up at quarterback · Maxwell Award winner",
    "Won the national title game 41–38 after trailing in the fourth quarter",
    "Scored 652 points while finishing undefeated",
  ]),
  profile("college-team-seasons", "2013-florida-state", "CFB", "team-season", [
    "14–0 · national champion",
    "51.6 points per game · 519.4 yards per game",
    "12.1 points allowed per game",
    "Won a road game over a top-3 opponent by 37 points",
    "Every regular-season win came by at least 14 points",
    "Heisman-winning quarterback led the nation's No. 2 scoring offense",
    "Erased an 18-point deficit to win the national title game 34–31",
    "Scored an FBS-record 723 points at the time",
  ]),
] as const;

const PROFILE_BY_KEY = new Map(
  footballBlindResumeEvidenceProfiles.map((row) => [`${row.packId}:${row.subjectId}`, row]),
);

export function getFootballBlindResumeEvidenceProfile(
  packId: FootballRankFivePackId,
  subjectId: string,
) {
  const found = PROFILE_BY_KEY.get(`${packId}:${subjectId}`);
  if (!found) {
    throw new Error(
      `Football Blind Resume has no factual evidence profile for ${packId}:${subjectId}.`,
    );
  }
  return validateFootballBlindResumeEvidenceProfile(found);
}
