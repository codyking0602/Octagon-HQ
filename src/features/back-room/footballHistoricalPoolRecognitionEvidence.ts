import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

type FootballHistoricalPoolKind = "game" | "era";
type FootballHistoricalPoolLeague = "NFL" | "CFB";
type FootballHistoricalPoolEvidenceFamily =
  | "nfl-100-games"
  | "espn-cfb150-games"
  | "nfl-game-of-year-refresh"
  | "espn-season-refresh"
  | "reviewed-nfl-era";

export interface FootballHistoricalPoolRecognitionSubject {
  id: string;
  name: string;
  kind: FootballHistoricalPoolKind;
  league: FootballHistoricalPoolLeague;
  franchises?: readonly string[];
  season?: number;
  startSeason?: number;
  endSeason?: number;
  activeDecades?: readonly number[];
  aliases?: readonly string[];
}

export interface FootballHistoricalPoolRecognitionRecord {
  subject: FootballHistoricalPoolRecognitionSubject;
  tier: FootballRecognizabilityTier;
  sourceIdentityKey: { provider: "octagon-hq"; id: string };
  evidenceFamily: FootballHistoricalPoolEvidenceFamily;
  sourceRank?: number;
}

type GameSeed = readonly [
  id: string,
  name: string,
  league: FootballHistoricalPoolLeague,
  season: number,
  tier: Exclude<FootballRecognizabilityTier, "D">,
  evidenceFamily: Exclude<FootballHistoricalPoolEvidenceFamily, "reviewed-nfl-era">,
  sourceId: string,
  sourceRank?: number,
];

type EraSeed = readonly [
  id: string,
  name: string,
  startSeason: number,
  endSeason: number,
  tier: Exclude<FootballRecognizabilityTier, "D">,
  franchises: readonly string[],
  sourceId: string,
];

function decades(startSeason: number, endSeason: number) {
  return Array.from(
    { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
    (_, index) => (Math.floor(startSeason / 10) + index) * 10,
  );
}

/**
 * Reviewed A-C survivors from the NFL 100 Greatest Games census plus a small post-2019 refresh.
 * NFL 100 rank is retained only as provenance. It is never consumed as a football ranking score.
 */
const nflGameSeeds: readonly GameSeed[] = [
  ["nfl-game-1958-championship", "1958 NFL Championship — Colts vs Giants", "NFL", 1958, "A", "nfl-100-games", "nfl100:1", 1],
  ["nfl-game-1967-ice-bowl", "1967 NFL Championship — Cowboys vs Packers (Ice Bowl)", "NFL", 1967, "A", "nfl-100-games", "nfl100:3", 3],
  ["nfl-game-1968-super-bowl-iii", "Super Bowl III — Jets vs Colts", "NFL", 1968, "A", "nfl-100-games", "nfl100:6", 6],
  ["nfl-game-1966-championship", "1966 NFL Championship — Packers vs Cowboys", "NFL", 1966, "A", "nfl-100-games", "nfl100:38", 38],
  ["nfl-game-1968-heidi", "1968 Jets at Raiders — Heidi Game", "NFL", 1968, "A", "nfl-100-games", "nfl100:41", 41],
  ["nfl-game-1971-dolphins-chiefs", "1971 AFC Divisional — Dolphins vs Chiefs", "NFL", 1971, "B", "nfl-100-games", "nfl100:18", 18],
  ["nfl-game-1972-immaculate-reception", "1972 AFC Divisional — Raiders vs Steelers (Immaculate Reception)", "NFL", 1972, "A", "nfl-100-games", "nfl100:13", 13],
  ["nfl-game-1974-sea-of-hands", "1974 AFC Divisional — Dolphins vs Raiders (Sea of Hands)", "NFL", 1974, "B", "nfl-100-games", "nfl100:23", 23],
  ["nfl-game-1975-hail-mary", "1975 NFC Divisional — Cowboys vs Vikings (Hail Mary)", "NFL", 1975, "A", "nfl-100-games", "nfl100-bracket:hail-mary"],
  ["nfl-game-1977-ghost-to-post", "1977 AFC Divisional — Raiders vs Colts (Ghost to the Post)", "NFL", 1977, "B", "nfl-100-games", "nfl100:28", 28],
  ["nfl-game-1978-holy-roller", "1978 Chargers vs Raiders — Holy Roller", "NFL", 1978, "B", "nfl-100-games", "nfl100:56", 56],
  ["nfl-game-1978-miracle-meadowlands", "1978 Eagles at Giants — Miracle at the Meadowlands", "NFL", 1978, "B", "nfl-100-games", "nfl100:48", 48],
  ["nfl-game-1978-super-bowl-xiii", "Super Bowl XIII — Steelers vs Cowboys", "NFL", 1978, "B", "nfl-100-games", "nfl100:17", 17],
  ["nfl-game-1981-nfc-title", "1981 NFC Championship — Cowboys vs 49ers (The Catch)", "NFL", 1981, "A", "nfl-100-games", "nfl100:2", 2],
  ["nfl-game-1981-epic-miami", "1981 AFC Divisional — Chargers vs Dolphins (Epic in Miami)", "NFL", 1981, "B", "nfl-100-games", "nfl100:4", 4],
  ["nfl-game-1981-freezer-bowl", "1981 AFC Championship — Chargers vs Bengals (Freezer Bowl)", "NFL", 1981, "B", "nfl-100-games", "nfl100:67", 67],
  ["nfl-game-1985-bears-dolphins", "1985 Bears at Dolphins", "NFL", 1985, "B", "nfl-100-games", "nfl100:29", 29],
  ["nfl-game-1986-the-drive", "1986 AFC Championship — Broncos vs Browns (The Drive)", "NFL", 1986, "A", "nfl-100-games", "nfl100:11", 11],
  ["nfl-game-1987-the-fumble", "1987 AFC Championship — Browns vs Broncos (The Fumble)", "NFL", 1987, "B", "nfl-100-games", "nfl100:22", 22],
  ["nfl-game-1988-fog-bowl", "1988 NFC Divisional — Eagles vs Bears (Fog Bowl)", "NFL", 1988, "B", "nfl-100-games", "nfl100:50", 50],
  ["nfl-game-1988-super-bowl-xxiii", "Super Bowl XXIII — 49ers vs Bengals", "NFL", 1988, "B", "nfl-100-games", "nfl100:19", 19],
  ["nfl-game-1990-super-bowl-xxv", "Super Bowl XXV — Giants vs Bills (Wide Right)", "NFL", 1990, "A", "nfl-100-games", "nfl100:10", 10],
  ["nfl-game-1990-nfc-title", "1990 NFC Championship — Giants vs 49ers", "NFL", 1990, "B", "nfl-100-games", "nfl100:25", 25],
  ["nfl-game-1992-comeback", "1992 AFC Wild Card — Oilers vs Bills (The Comeback)", "NFL", 1992, "A", "nfl-100-games", "nfl100:7", 7],
  ["nfl-game-1992-nfc-title", "1992 NFC Championship — Cowboys vs 49ers", "NFL", 1992, "B", "nfl-100-games", "nfl100:60", 60],
  ["nfl-game-1993-emmitt-shoulder", "1993 Cowboys at Giants — Emmitt Smith shoulder game", "NFL", 1993, "B", "nfl-100-games", "nfl100:70", 70],
  ["nfl-game-1994-fake-spike", "1994 Dolphins at Jets — Fake Spike", "NFL", 1994, "B", "nfl-100-games", "nfl100:83", 83],
  ["nfl-game-1994-nfc-title", "1994 NFC Championship — Cowboys vs 49ers", "NFL", 1994, "B", "nfl-100-games", "nfl100:90", 90],
  ["nfl-game-1995-afc-title", "1995 AFC Championship — Colts vs Steelers", "NFL", 1995, "B", "nfl-100-games", "nfl100:87", 87],
  ["nfl-game-1996-jaguars-broncos", "1996 AFC Divisional — Jaguars vs Broncos", "NFL", 1996, "B", "nfl-100-games", "nfl100:78", 78],
  ["nfl-game-1997-super-bowl-xxxii", "Super Bowl XXXII — Packers vs Broncos", "NFL", 1997, "B", "nfl-100-games", "nfl100:27", 27],
  ["nfl-game-1998-nfc-title", "1998 NFC Championship — Falcons vs Vikings", "NFL", 1998, "B", "nfl-100-games", "nfl100:34", 34],
  ["nfl-game-1998-catch-ii", "1998 NFC Wild Card — Packers vs 49ers (Catch II)", "NFL", 1998, "B", "nfl-100-games", "nfl100:46", 46],
  ["nfl-game-1999-music-city-miracle", "1999 AFC Wild Card — Bills vs Titans (Music City Miracle)", "NFL", 1999, "A", "nfl-100-games", "nfl100:26", 26],
  ["nfl-game-1999-super-bowl-xxxiv", "Super Bowl XXXIV — Rams vs Titans (One Yard Short)", "NFL", 1999, "A", "nfl-100-games", "nfl100:16", 16],
  ["nfl-game-1999-nfc-title", "1999 NFC Championship — Buccaneers vs Rams", "NFL", 1999, "B", "nfl-100-games", "nfl100:99", 99],
  ["nfl-game-2000-monday-night-miracle", "2000 Dolphins at Jets — Monday Night Miracle", "NFL", 2000, "B", "nfl-100-games", "nfl100:43", 43],
  ["nfl-game-2001-tuck-rule", "2001 AFC Divisional — Raiders vs Patriots (Tuck Rule)", "NFL", 2001, "A", "nfl-100-games", "nfl100:15", 15],
  ["nfl-game-2001-super-bowl-xxxvi", "Super Bowl XXXVI — Rams vs Patriots", "NFL", 2001, "B", "nfl-100-games", "nfl100:20", 20],
  ["nfl-game-2002-49ers-giants", "2002 NFC Wild Card — Giants vs 49ers", "NFL", 2002, "B", "nfl-100-games", "nfl100:39", 39],
  ["nfl-game-2003-panthers-rams", "2003 NFC Divisional — Panthers vs Rams", "NFL", 2003, "B", "nfl-100-games", "nfl100:86", 86],
  ["nfl-game-2003-we-want-ball", "2003 NFC Wild Card — Seahawks vs Packers", "NFL", 2003, "B", "nfl-100-games", "nfl100:72", 72],
  ["nfl-game-2003-fourth-and-26", "2003 NFC Divisional — Packers vs Eagles (4th-and-26)", "NFL", 2003, "B", "nfl-100-games", "nfl100:69", 69],
  ["nfl-game-2003-favre-mnf", "2003 Packers at Raiders — Favre Monday night", "NFL", 2003, "C", "nfl-100-games", "nfl100:52", 52],
  ["nfl-game-2005-steelers-colts", "2005 AFC Divisional — Steelers vs Colts", "NFL", 2005, "B", "nfl-100-games", "nfl100:89", 89],
  ["nfl-game-2006-afc-title", "2006 AFC Championship — Patriots vs Colts", "NFL", 2006, "B", "nfl-100-games", "nfl100:21", 21],
  ["nfl-game-2006-romo-hold", "2006 NFC Wild Card — Cowboys vs Seahawks", "NFL", 2006, "B", "nfl-100-games", "nfl100:84", 84],
  ["nfl-game-2007-super-bowl-xlii", "Super Bowl XLII — Giants vs Patriots", "NFL", 2007, "A", "nfl-100-games", "nfl100:5", 5],
  ["nfl-game-2007-nfc-title", "2007 NFC Championship — Giants vs Packers", "NFL", 2007, "B", "nfl-100-games", "nfl100:54", 54],
  ["nfl-game-2008-super-bowl-xliii", "Super Bowl XLIII — Steelers vs Cardinals", "NFL", 2008, "B", "nfl-100-games", "nfl100:12", 12],
  ["nfl-game-2008-afc-title", "2008 AFC Championship — Ravens vs Steelers", "NFL", 2008, "B", "nfl-100-games", "nfl100:98", 98],
  ["nfl-game-2009-cardinals-packers", "2009 NFC Wild Card — Packers vs Cardinals", "NFL", 2009, "B", "nfl-100-games", "nfl100:47", 47],
  ["nfl-game-2009-nfc-title", "2009 NFC Championship — Vikings vs Saints", "NFL", 2009, "B", "nfl-100-games", "nfl100:42", 42],
  ["nfl-game-2010-new-meadowlands", "2010 Eagles at Giants — Miracle at the New Meadowlands", "NFL", 2010, "B", "nfl-100-games", "nfl100:88", 88],
  ["nfl-game-2011-49ers-saints", "2011 NFC Divisional — Saints vs 49ers", "NFL", 2011, "B", "nfl-100-games", "nfl100:64", 64],
  ["nfl-game-2012-mile-high-miracle", "2012 AFC Divisional — Ravens vs Broncos (Mile High Miracle)", "NFL", 2012, "B", "nfl-100-games", "nfl100:40", 40],
  ["nfl-game-2013-colts-chiefs", "2013 AFC Wild Card — Chiefs vs Colts", "NFL", 2013, "B", "nfl-100-games", "nfl100:61", 61],
  ["nfl-game-2013-nfc-title", "2013 NFC Championship — 49ers vs Seahawks", "NFL", 2013, "B", "nfl-100-games", "nfl100:68", 68],
  ["nfl-game-2014-super-bowl-xlix", "Super Bowl XLIX — Seahawks vs Patriots", "NFL", 2014, "A", "nfl-100-games", "nfl100:8", 8],
  ["nfl-game-2014-nfc-title", "2014 NFC Championship — Packers vs Seahawks", "NFL", 2014, "B", "nfl-100-games", "nfl100:44", 44],
  ["nfl-game-2015-cardinals-packers", "2015 NFC Divisional — Packers vs Cardinals", "NFL", 2015, "B", "nfl-100-games", "nfl100:31", 31],
  ["nfl-game-2016-super-bowl-li", "Super Bowl LI — Falcons vs Patriots", "NFL", 2016, "A", "nfl-100-games", "nfl100:9", 9],
  ["nfl-game-2017-minneapolis-miracle", "2017 NFC Divisional — Saints vs Vikings (Minneapolis Miracle)", "NFL", 2017, "A", "nfl-100-games", "nfl100:24", 24],
  ["nfl-game-2017-super-bowl-lii", "Super Bowl LII — Patriots vs Eagles", "NFL", 2017, "A", "nfl-100-games", "nfl100:14", 14],
  ["nfl-game-2018-rams-chiefs", "2018 Chiefs at Rams — 54-51", "NFL", 2018, "B", "nfl-100-games", "nfl100:33", 33],
  ["nfl-game-2018-afc-title", "2018 AFC Championship — Patriots vs Chiefs", "NFL", 2018, "B", "nfl-100-games", "nfl100:36", 36],
  ["nfl-game-2018-nfc-title", "2018 NFC Championship — Rams vs Saints", "NFL", 2018, "B", "nfl-100-games", "nfl100:57", 57],
  ["nfl-game-2021-bills-chiefs", "2021 AFC Divisional — Bills vs Chiefs (13 Seconds)", "NFL", 2021, "A", "nfl-game-of-year-refresh", "refresh:2021-bills-chiefs"],
  ["nfl-game-2022-super-bowl-lvii", "Super Bowl LVII — Chiefs vs Eagles", "NFL", 2022, "B", "nfl-game-of-year-refresh", "refresh:2022-super-bowl-lvii"],
  ["nfl-game-2023-super-bowl-lviii", "Super Bowl LVIII — 49ers vs Chiefs", "NFL", 2023, "B", "nfl-game-of-year-refresh", "refresh:2023-super-bowl-lviii"],
  ["nfl-game-2024-super-bowl-lix", "Super Bowl LIX — Chiefs vs Eagles", "NFL", 2024, "C", "nfl-game-of-year-refresh", "refresh:2024-super-bowl-lix"],
  ["nfl-game-2025-rams-seahawks-week-16", "2025 Rams at Seahawks — Week 16 overtime comeback", "NFL", 2025, "C", "nfl-game-of-year-refresh", "nfl-game-of-year:2025-rams-seahawks-week16"],
  ["nfl-game-2025-super-bowl-lx", "Super Bowl LX — Seahawks vs Patriots", "NFL", 2025, "C", "nfl-game-of-year-refresh", "refresh:2025-super-bowl-lx"],
];

/**
 * Reviewed A-C survivors from ESPN's 150-game CFB150 census plus 2019-2025 refresh evidence.
 * The source rank is provenance only; recognizability tiers are independently reviewed and historical-policy constrained.
 */
const cfbGameSeeds: readonly GameSeed[] = [
  ["cfb-game-1924-notre-dame-army", "1924 Notre Dame vs Army — Four Horsemen", "CFB", 1924, "A", "espn-cfb150-games", "espn-cfb150:17", 17],
  ["cfb-game-1928-notre-dame-army", "1928 Notre Dame vs Army — Win One for the Gipper", "CFB", 1928, "A", "espn-cfb150-games", "espn-cfb150:16", 16],
  ["cfb-game-1935-notre-dame-ohio-state", "1935 Notre Dame at Ohio State — Game of the Century", "CFB", 1935, "A", "espn-cfb150-games", "espn-cfb150:40", 40],
  ["cfb-game-1946-army-notre-dame", "1946 Army vs Notre Dame — Game of the Century", "CFB", 1946, "A", "espn-cfb150-games", "espn-cfb150:26", 26],
  ["cfb-game-1957-notre-dame-oklahoma", "1957 Notre Dame at Oklahoma — 47-game streak ends", "CFB", 1957, "A", "espn-cfb150-games", "espn-cfb150:15", 15],
  ["cfb-game-1959-lsu-ole-miss", "1959 LSU vs Ole Miss — Billy Cannon punt return", "CFB", 1959, "A", "espn-cfb150-games", "espn-cfb150:9", 9],
  ["cfb-game-1966-notre-dame-michigan-state", "1966 Notre Dame vs Michigan State — Game of the Century", "CFB", 1966, "A", "espn-cfb150-games", "espn-cfb150:20", 20],
  ["cfb-game-1967-usc-ucla", "1967 USC vs UCLA", "CFB", 1967, "A", "espn-cfb150-games", "espn-cfb150:14", 14],
  ["cfb-game-1969-texas-arkansas", "1969 Texas at Arkansas — Big Shootout", "CFB", 1969, "A", "espn-cfb150-games", "espn-cfb150:29", 29],
  ["cfb-game-1969-michigan-ohio-state", "1969 Michigan vs Ohio State — start of the Ten-Year War", "CFB", 1969, "A", "espn-cfb150-games", "espn-cfb150:42", 42],
  ["cfb-game-1971-nebraska-oklahoma", "1971 Nebraska at Oklahoma — Game of the Century", "CFB", 1971, "A", "espn-cfb150-games", "espn-cfb150:1", 1],
  ["cfb-game-1972-punt-bama-punt", "1972 Iron Bowl — Punt Bama Punt", "CFB", 1972, "A", "espn-cfb150-games", "espn-cfb150:38", 38],
  ["cfb-game-1973-notre-dame-alabama", "1973 Sugar Bowl — Notre Dame vs Alabama", "CFB", 1973, "A", "espn-cfb150-games", "espn-cfb150:10", 10],
  ["cfb-game-1978-alabama-penn-state", "1978 Sugar Bowl — Alabama vs Penn State goal-line stand", "CFB", 1978, "A", "espn-cfb150-games", "espn-cfb150:12", 12],
  ["cfb-game-1978-notre-dame-houston", "1978 Cotton Bowl — Notre Dame vs Houston", "CFB", 1978, "A", "espn-cfb150-games", "espn-cfb150:30", 30],
  ["cfb-game-1980-georgia-florida", "1980 Georgia vs Florida — Run Lindsay", "CFB", 1980, "B", "espn-cfb150-games", "espn-cfb150:86", 86],
  ["cfb-game-1982-cal-stanford", "1982 California vs Stanford — The Play", "CFB", 1982, "A", "espn-cfb150-games", "espn-cfb150:22", 22],
  ["cfb-game-1983-orange-bowl", "1983 Orange Bowl — Miami vs Nebraska", "CFB", 1983, "A", "espn-cfb150-games", "espn-cfb150:2", 2],
  ["cfb-game-1984-hail-flutie", "1984 Boston College at Miami — Hail Flutie", "CFB", 1984, "A", "espn-cfb150-games", "espn-cfb150:4", 4],
  ["cfb-game-1985-iron-bowl", "1985 Iron Bowl — Alabama vs Auburn", "CFB", 1985, "B", "espn-cfb150-games", "espn-cfb150:91", 91],
  ["cfb-game-1986-fiesta-bowl", "1986 Fiesta Bowl — Penn State vs Miami", "CFB", 1986, "A", "espn-cfb150-games", "espn-cfb150:5", 5],
  ["cfb-game-1987-miami-florida-state", "1987 Miami vs Florida State", "CFB", 1987, "B", "espn-cfb150-games", "espn-cfb150:27", 27],
  ["cfb-game-1988-catholics-convicts", "1988 Notre Dame vs Miami — Catholics vs Convicts", "CFB", 1988, "A", "espn-cfb150-games", "espn-cfb150:6", 6],
  ["cfb-game-1988-earthquake", "1988 LSU vs Auburn — Earthquake Game", "CFB", 1988, "B", "espn-cfb150-games", "espn-cfb150:85", 85],
  ["cfb-game-1990-fifth-down", "1990 Colorado at Missouri — Fifth Down Game", "CFB", 1990, "A", "espn-cfb150-games", "espn-cfb150:87", 87],
  ["cfb-game-1991-wide-right-i", "1991 Miami at Florida State — Wide Right I", "CFB", 1991, "A", "espn-cfb150-games", "espn-cfb150:48", 48],
  ["cfb-game-1992-sugar-bowl", "1992 Sugar Bowl — Alabama vs Miami", "CFB", 1992, "B", "espn-cfb150-games", "espn-cfb150:62", 62],
  ["cfb-game-1993-notre-dame-florida-state", "1993 Notre Dame vs Florida State", "CFB", 1993, "B", "espn-cfb150-games", "espn-cfb150:46", 46],
  ["cfb-game-1994-miracle-michigan", "1994 Colorado at Michigan — Miracle at Michigan", "CFB", 1994, "A", "espn-cfb150-games", "espn-cfb150:21", 21],
  ["cfb-game-1994-choke-doak", "1994 Florida at Florida State — Choke at Doak", "CFB", 1994, "B", "espn-cfb150-games", "espn-cfb150:51", 51],
  ["cfb-game-1994-sec-title", "1994 SEC Championship — Florida vs Alabama", "CFB", 1994, "B", "espn-cfb150-games", "espn-cfb150:79", 79],
  ["cfb-game-1995-virginia-florida-state", "1995 Virginia vs Florida State", "CFB", 1995, "B", "espn-cfb150-games", "espn-cfb150:120", 120],
  ["cfb-game-1996-florida-florida-state", "1996 Florida at Florida State", "CFB", 1996, "B", "espn-cfb150-games", "espn-cfb150:102", 102],
  ["cfb-game-1997-flea-kicker", "1997 Nebraska at Missouri — Flea Kicker", "CFB", 1997, "B", "espn-cfb150-games", "espn-cfb150:69", 69],
  ["cfb-game-1998-miami-ucla", "1998 Miami vs UCLA", "CFB", 1998, "B", "espn-cfb150-games", "espn-cfb150:84", 84],
  ["cfb-game-1998-kansas-state-nebraska", "1998 Kansas State vs Nebraska", "CFB", 1998, "B", "espn-cfb150-games", "espn-cfb150:105", 105],
  ["cfb-game-1998-big-12-title", "1998 Big 12 Championship — Texas A&M vs Kansas State", "CFB", 1998, "B", "espn-cfb150-games", "espn-cfb150:106", 106],
  ["cfb-game-1998-tennessee-arkansas", "1998 Tennessee vs Arkansas — Stoerner fumble", "CFB", 1998, "B", "espn-cfb150-games", "espn-cfb150:131", 131],
  ["cfb-game-2000-wide-right-iii", "2000 Miami vs Florida State — Wide Right III", "CFB", 2000, "B", "espn-cfb150-games", "espn-cfb150:58", 58],
  ["cfb-game-2001-arkansas-ole-miss", "2001 Arkansas at Ole Miss — seven overtimes", "CFB", 2001, "B", "espn-cfb150-games", "espn-cfb150:125", 125],
  ["cfb-game-2001-big-12-title", "2001 Big 12 Championship — Colorado vs Texas", "CFB", 2001, "B", "espn-cfb150-games", "espn-cfb150:123", 123],
  ["cfb-game-2002-bluegrass-miracle", "2002 LSU at Kentucky — Bluegrass Miracle", "CFB", 2002, "B", "espn-cfb150-games", "espn-cfb150:113", 113],
  ["cfb-game-2003-fiesta-bowl", "2003 Fiesta Bowl — Ohio State vs Miami", "CFB", 2002, "A", "espn-cfb150-games", "espn-cfb150:25", 25],
  ["cfb-game-2005-rose-bowl-texas-michigan", "2005 Rose Bowl — Texas vs Michigan", "CFB", 2004, "B", "espn-cfb150-games", "espn-cfb150:49", 49],
  ["cfb-game-2005-bush-push", "2005 USC at Notre Dame — Bush Push", "CFB", 2005, "A", "espn-cfb150-games", "espn-cfb150:34", 34],
  ["cfb-game-2006-rose-bowl", "2006 Rose Bowl — Texas vs USC", "CFB", 2005, "A", "espn-cfb150-games", "espn-cfb150:7", 7],
  ["cfb-game-2007-fiesta-bowl", "2007 Fiesta Bowl — Boise State vs Oklahoma", "CFB", 2006, "A", "espn-cfb150-games", "espn-cfb150:19", 19],
  ["cfb-game-2006-ohio-state-michigan", "2006 Ohio State vs Michigan — No. 1 vs No. 2", "CFB", 2006, "B", "espn-cfb150-games", "espn-cfb150:101", 101],
  ["cfb-game-2007-app-state-michigan", "2007 Appalachian State at Michigan", "CFB", 2007, "A", "espn-cfb150-games", "espn-cfb150:3", 3],
  ["cfb-game-2007-lsu-florida", "2007 LSU vs Florida", "CFB", 2007, "C", "espn-cfb150-games", "espn-cfb150:138", 138],
  ["cfb-game-2007-pitt-west-virginia", "2007 Pitt at West Virginia — 13-9", "CFB", 2007, "B", "espn-cfb150-games", "espn-cfb150:65", 65],
  ["cfb-game-2007-stanford-usc", "2007 Stanford at USC", "CFB", 2007, "B", "espn-cfb150-games", "espn-cfb150:90", 90],
  ["cfb-game-2008-texas-tech-texas", "2008 Texas at Texas Tech", "CFB", 2008, "A", "espn-cfb150-games", "espn-cfb150:72", 72],
  ["cfb-game-2010-bcs-title", "2010 BCS Championship — Alabama vs Texas", "CFB", 2009, "B", "espn-season-refresh", "refresh:2009-alabama-texas"],
  ["cfb-game-2010-auburn-oregon", "2011 BCS Championship — Auburn vs Oregon", "CFB", 2010, "B", "espn-cfb150-games", "espn-cfb150:144", 144],
  ["cfb-game-2011-game-of-the-century", "2011 Alabama vs LSU", "CFB", 2011, "B", "espn-cfb150-games", "espn-cfb150:137", 137],
  ["cfb-game-2011-iowa-state-oklahoma-state", "2011 Iowa State vs Oklahoma State", "CFB", 2011, "B", "espn-cfb150-games", "espn-cfb150:97", 97],
  ["cfb-game-2012-sec-title", "2012 SEC Championship — Alabama vs Georgia", "CFB", 2012, "B", "espn-cfb150-games", "espn-cfb150:54", 54],
  ["cfb-game-2013-kick-six", "2013 Iron Bowl — Alabama vs Auburn", "CFB", 2013, "A", "espn-cfb150-games", "espn-cfb150:18", 18],
  ["cfb-game-2013-prayer-jordan-hare", "2013 Georgia at Auburn — Prayer at Jordan-Hare", "CFB", 2013, "B", "espn-cfb150-games", "espn-cfb150:100", 100],
  ["cfb-game-2014-bcs-title", "2014 BCS Championship — Florida State vs Auburn", "CFB", 2013, "B", "espn-cfb150-games", "espn-cfb150:50", 50],
  ["cfb-game-2014-baylor-tcu", "2014 TCU at Baylor — 61-58", "CFB", 2014, "C", "espn-cfb150-games", "espn-cfb150:145", 145],
  ["cfb-game-2014-ohio-state-alabama", "2014 Sugar Bowl CFP — Ohio State vs Alabama", "CFB", 2014, "B", "espn-season-refresh", "refresh:2014-ohio-state-alabama"],
  ["cfb-game-2014-cfp-title", "2014 CFP National Championship — Ohio State vs Oregon", "CFB", 2014, "B", "espn-season-refresh", "refresh:2014-ohio-state-oregon"],
  ["cfb-game-2015-michigan-state-michigan", "2015 Michigan State at Michigan — trouble with the snap", "CFB", 2015, "B", "espn-cfb150-games", "espn-cfb150:82", 82],
  ["cfb-game-2015-arkansas-ole-miss", "2015 Arkansas at Ole Miss — 4th-and-25", "CFB", 2015, "B", "espn-cfb150-games", "espn-cfb150:143", 143],
  ["cfb-game-2016-ohio-state-michigan", "2016 Ohio State vs Michigan — double overtime", "CFB", 2016, "B", "espn-cfb150-games", "espn-cfb150:118", 118],
  ["cfb-game-2017-cfp-title", "2017 CFP National Championship — Clemson vs Alabama", "CFB", 2016, "B", "espn-cfb150-games", "espn-cfb150:39", 39],
  ["cfb-game-2018-rose-bowl", "2018 Rose Bowl — Georgia vs Oklahoma", "CFB", 2017, "B", "espn-cfb150-games", "espn-cfb150:60", 60],
  ["cfb-game-2018-cfp-title", "2018 CFP National Championship — Alabama vs Georgia", "CFB", 2017, "A", "espn-cfb150-games", "espn-cfb150:13", 13],
  ["cfb-game-2019-cfp-title", "2019 CFP National Championship — Clemson vs Alabama", "CFB", 2018, "B", "espn-season-refresh", "refresh:2018-clemson-alabama"],
  ["cfb-game-2020-cfp-title", "2020 CFP National Championship — LSU vs Clemson", "CFB", 2019, "B", "espn-season-refresh", "refresh:2019-lsu-clemson"],
  ["cfb-game-2021-cfp-title", "2021 CFP National Championship — Alabama vs Ohio State", "CFB", 2020, "C", "espn-season-refresh", "refresh:2020-alabama-ohio-state"],
  ["cfb-game-2022-cfp-title", "2022 CFP National Championship — Georgia vs Alabama", "CFB", 2021, "B", "espn-season-refresh", "refresh:2021-georgia-alabama"],
  ["cfb-game-2022-tennessee-alabama", "2022 Tennessee vs Alabama", "CFB", 2022, "B", "espn-season-refresh", "refresh:2022-tennessee-alabama"],
  ["cfb-game-2022-peach-bowl", "2022 Peach Bowl CFP — Georgia vs Ohio State", "CFB", 2022, "A", "espn-season-refresh", "refresh:2022-georgia-ohio-state"],
  ["cfb-game-2023-iron-bowl", "2023 Iron Bowl — Alabama vs Auburn", "CFB", 2023, "C", "espn-season-refresh", "refresh:2023-gravedigger"],
  ["cfb-game-2024-rose-bowl", "2024 Rose Bowl CFP — Michigan vs Alabama", "CFB", 2023, "B", "espn-season-refresh", "refresh:2023-michigan-alabama"],
  ["cfb-game-2024-sugar-bowl", "2024 Sugar Bowl CFP — Washington vs Texas", "CFB", 2023, "B", "espn-season-refresh", "refresh:2023-washington-texas"],
  ["cfb-game-2024-cfp-title", "2024 CFP National Championship — Michigan vs Washington", "CFB", 2023, "B", "espn-season-refresh", "refresh:2023-michigan-washington"],
  ["cfb-game-2024-oregon-ohio-state", "2024 Oregon vs Ohio State", "CFB", 2024, "C", "espn-season-refresh", "refresh:2024-oregon-ohio-state"],
  ["cfb-game-2024-texas-arizona-state", "2024 Peach Bowl CFP — Texas vs Arizona State", "CFB", 2024, "B", "espn-season-refresh", "refresh:2024-texas-arizona-state"],
  ["cfb-game-2025-cfp-title", "2025 CFP National Championship — Ohio State vs Notre Dame", "CFB", 2024, "B", "espn-season-refresh", "refresh:2024-ohio-state-notre-dame"],
  ["cfb-game-2025-indiana-miami-title", "2025 CFP National Championship — Indiana vs Miami", "CFB", 2025, "B", "espn-season-refresh", "espn-2025-games:1"],
  ["cfb-game-2025-miami-ole-miss", "2025 CFP Semifinal — Miami vs Ole Miss", "CFB", 2025, "C", "espn-season-refresh", "espn-2025-games:2"],
  ["cfb-game-2025-texas-am-notre-dame", "2025 Texas A&M at Notre Dame", "CFB", 2025, "C", "espn-season-refresh", "espn-2025-games:4"],
  ["cfb-game-2025-indiana-ohio-state", "2025 Big Ten Championship — Indiana vs Ohio State", "CFB", 2025, "C", "espn-season-refresh", "espn-2025-games:20"],
];

/**
 * NFL era repair. Older dynasty boundaries follow NFL.com's own dynasty-era descriptions where available;
 * modern C tiers are deliberately limited to coherent multi-season contender windows rather than every good team.
 */
const nflEraSeeds: readonly EraSeed[] = [
  ["nfl-era-browns-paul-brown", "Cleveland Browns — Paul Brown NFL dynasty", 1950, 1955, "A", ["CLE"], "nfl-era-review:browns-1950-1955"],
  ["nfl-era-packers-lombardi", "Green Bay Packers — Lombardi dynasty", 1960, 1967, "A", ["GB"], "nfl-dynasty:packers-1960-1967"],
  ["nfl-era-cowboys-landry", "Dallas Cowboys — Landry first dynasty", 1966, 1982, "B", ["DAL"], "nfl-dynasty:cowboys-1966-1982"],
  ["nfl-era-dolphins-shula", "Miami Dolphins — Shula early dynasty", 1971, 1974, "B", ["MIA"], "nfl-era-review:dolphins-1971-1974"],
  ["nfl-era-steelers-steel-curtain", "Pittsburgh Steelers — Steel Curtain dynasty", 1972, 1979, "A", ["PIT"], "nfl-dynasty:steelers-1972-1979"],
  ["nfl-era-vikings-purple-people-eaters", "Minnesota Vikings — Purple People Eaters era", 1968, 1978, "B", ["MIN"], "nfl-era-review:vikings-1968-1978"],
  ["nfl-era-raiders-madden-flores", "Oakland Raiders — Madden/Flores contender era", 1970, 1983, "B", ["LV"], "nfl-era-review:raiders-1970-1983"],
  ["nfl-era-49ers-montana-walsh", "San Francisco 49ers — Montana/Walsh dynasty", 1981, 1989, "A", ["SF"], "nfl-dynasty:49ers-1981-1989"],
  ["nfl-era-washington-gibbs", "Washington — Joe Gibbs championship era", 1982, 1991, "B", ["WAS"], "nfl-dynasty:washington-1982-1991"],
  ["nfl-era-bills-four-super-bowls", "Buffalo Bills — four straight Super Bowls", 1990, 1993, "B", ["BUF"], "nfl-era-review:bills-1990-1993"],
  ["nfl-era-cowboys-triplets", "Dallas Cowboys — Triplets dynasty", 1992, 1995, "A", ["DAL"], "nfl-dynasty:cowboys-1992-1995"],
  ["nfl-era-49ers-steve-young", "San Francisco 49ers — Steve Young contender era", 1991, 1998, "B", ["SF"], "nfl-dynasty:49ers-1991-1998"],
  ["nfl-era-packers-favre-holmgren", "Green Bay Packers — Favre/Holmgren era", 1995, 1998, "B", ["GB"], "nfl-era-review:packers-1995-1998"],
  ["nfl-era-broncos-elway-shanahan", "Denver Broncos — Elway/Shanahan title era", 1996, 1998, "B", ["DEN"], "nfl-era-review:broncos-1996-1998"],
  ["nfl-era-ravens-ray-lewis", "Baltimore Ravens — Ray Lewis era", 1996, 2012, "B", ["BAL"], "nfl-era-review:ravens-1996-2012"],
  ["nfl-era-colts-peyton-manning", "Indianapolis Colts — Peyton Manning era", 1998, 2010, "B", ["IND"], "nfl-era-review:colts-1998-2010"],
  ["nfl-era-rams-greatest-show-on-turf", "St. Louis Rams — Greatest Show on Turf", 1999, 2001, "A", ["LAR"], "nfl-era-review:rams-1999-2001"],
  ["nfl-era-patriots-belichick-brady", "New England Patriots — Belichick/Brady era", 2001, 2019, "A", ["NE"], "nfl-dynasty:patriots-2001-2019"],
  ["nfl-era-steelers-roethlisberger", "Pittsburgh Steelers — Roethlisberger era", 2004, 2021, "B", ["PIT"], "nfl-era-review:steelers-2004-2021"],
  ["nfl-era-saints-brees-payton", "New Orleans Saints — Brees/Payton era", 2006, 2020, "B", ["NO"], "nfl-era-review:saints-2006-2020"],
  ["nfl-era-packers-rodgers", "Green Bay Packers — Aaron Rodgers era", 2008, 2022, "B", ["GB"], "nfl-era-review:packers-2008-2022"],
  ["nfl-era-seahawks-legion-of-boom", "Seattle Seahawks — Legion of Boom era", 2012, 2015, "B", ["SEA"], "nfl-era-review:seahawks-2012-2015"],
  ["nfl-era-broncos-peyton-manning", "Denver Broncos — Peyton Manning era", 2012, 2015, "B", ["DEN"], "nfl-era-review:broncos-2012-2015"],
  ["nfl-era-rams-mcvay", "Los Angeles Rams — McVay first contender era", 2017, 2021, "C", ["LAR"], "nfl-era-review:rams-2017-2021"],
  ["nfl-era-chiefs-mahomes-reid", "Kansas City Chiefs — Mahomes/Reid era", 2018, 2025, "A", ["KC"], "nfl-era-review:chiefs-2018-2025"],
  ["nfl-era-bills-allen-mcdermott", "Buffalo Bills — Allen/McDermott contender era", 2020, 2025, "C", ["BUF"], "nfl-era-review:bills-2020-2025"],
  ["nfl-era-buccaneers-brady", "Tampa Bay Buccaneers — Brady era", 2020, 2022, "C", ["TB"], "nfl-era-review:buccaneers-2020-2022"],
  ["nfl-era-eagles-hurts-sirianni", "Philadelphia Eagles — Hurts/Sirianni contender era", 2022, 2025, "C", ["PHI"], "nfl-era-review:eagles-2022-2025"],
];

const gameRecords: readonly FootballHistoricalPoolRecognitionRecord[] = [
  ...nflGameSeeds,
  ...cfbGameSeeds,
].map(([id, name, league, season, tier, evidenceFamily, sourceId, sourceRank]) => ({
  subject: {
    id,
    name,
    kind: "game",
    league,
    season,
    startSeason: season,
    endSeason: season,
    activeDecades: [Math.floor(season / 10) * 10],
  },
  tier,
  sourceIdentityKey: { provider: "octagon-hq", id: `reviewed-recognition:${sourceId}` },
  evidenceFamily,
  ...(sourceRank == null ? {} : { sourceRank }),
}));

const eraRecords: readonly FootballHistoricalPoolRecognitionRecord[] = nflEraSeeds.map(([
  id,
  name,
  startSeason,
  endSeason,
  tier,
  franchises,
  sourceId,
]) => ({
  subject: {
    id,
    name,
    kind: "era",
    league: "NFL",
    franchises,
    startSeason,
    endSeason,
    activeDecades: decades(startSeason, endSeason),
  },
  tier,
  sourceIdentityKey: { provider: "octagon-hq", id: `reviewed-recognition:${sourceId}` },
  evidenceFamily: "reviewed-nfl-era",
}));

export const footballHistoricalPoolRecognitionRecords: readonly FootballHistoricalPoolRecognitionRecord[] = [
  ...gameRecords,
  ...eraRecords,
];

export const FOOTBALL_HISTORICAL_POOL_RECOGNITION_CENSUS = {
  nflGames: {
    reviewedCandidates: 100,
    source: "NFL 100 Greatest Games (NFL/AP blue-ribbon review)",
    refreshThroughSeason: 2025,
    canonicalSurvivors: nflGameSeeds.length,
  },
  cfbGames: {
    reviewedCandidates: 150,
    source: "ESPN CFB150 Greatest Games (150-person panel; 202 finalists)",
    refreshThroughSeason: 2025,
    canonicalSurvivors: cfbGameSeeds.length,
  },
  nflEras: {
    source: "NFL.com dynasty retrospectives plus reviewed championship/contender windows",
    refreshThroughSeason: 2025,
    canonicalSurvivors: nflEraSeeds.length,
  },
} as const;
