import type {
  FootballRecognitionCompletenessCandidate,
  FootballRecognitionSourceDispositionTier,
} from "./footballRecognitionCompletenessEvidence";

export interface FootballNflMvpRecognitionDisposition {
  name: string;
  awardYear: number;
  disposition: FootballRecognitionSourceDispositionTier;
  reason: string;
  source: string;
}

const NFL_MVP_HISTORY = "https://www.nfl.com/news/national-football-league-mvps-09000d5d8269ea1b";
const NFL_RECORD_FACT_BOOK_2024 = "https://static.www.nfl.com/image/upload/league/apps/league-site/media-guides/2024/2024_Record_and_Fact_Book_incl_Supplemental.pdf";
const NFL_MVP_2024 = "https://www.nfl.com/news/list-of-nfl-honors-award-winners-from-2024-nfl-season";
const NFL_MVP_2025 = "https://www.nfl.com/news-migrated-v2/matthew-stafford-rams-qb-most-valuable-player-2025";

function sourceForAwardYear(awardYear: number) {
  if (awardYear <= 2011) return NFL_MVP_HISTORY;
  if (awardYear <= 2023) return NFL_RECORD_FACT_BOOK_2024;
  if (awardYear === 2024) return NFL_MVP_2024;
  return NFL_MVP_2025;
}

function nflMvpDispositionReason(disposition: FootballRecognitionSourceDispositionTier) {
  if (disposition === "D") {
    return "AP NFL MVP winner reviewed, but the player-career identity does not clear the Stage 13.5 recognizability bar for its era.";
  }
  if (disposition === "A") {
    return "AP NFL MVP plus enduring national and cross-era NFL identity clears the A player-career recognition bar.";
  }
  if (disposition === "B") {
    return "AP NFL MVP plus sustained football recognition clears the B player-career bar without requiring A-icon status.";
  }
  return "Modern AP NFL MVP remains recognizable enough for C career depth without requiring broad B-level recognition.";
}

const NFL_MVP_RECIPIENT_ROWS = [
  [1957, "Jim Brown", "A"],
  [1958, "Jim Brown", "A"],
  [1959, "Johnny Unitas", "A"],
  [1960, "Norm Van Brocklin", "D"],
  [1961, "Paul Hornung", "A"],
  [1962, "Jim Taylor", "D"],
  [1963, "Y.A. Tittle", "A"],
  [1964, "Johnny Unitas", "A"],
  [1965, "Jim Brown", "A"],
  [1966, "Bart Starr", "A"],
  [1967, "Johnny Unitas", "A"],
  [1968, "Earl Morrall", "D"],
  [1969, "Roman Gabriel", "D"],
  [1970, "John Brodie", "D"],
  [1971, "Alan Page", "A"],
  [1972, "Larry Brown", "D"],
  [1973, "O.J. Simpson", "A"],
  [1974, "Ken Stabler", "B"],
  [1975, "Fran Tarkenton", "A"],
  [1976, "Bert Jones", "D"],
  [1977, "Walter Payton", "A"],
  [1978, "Terry Bradshaw", "A"],
  [1979, "Earl Campbell", "A"],
  [1980, "Brian Sipe", "D"],
  [1981, "Ken Anderson", "B"],
  [1982, "Mark Moseley", "B"],
  [1983, "Joe Theismann", "B"],
  [1984, "Dan Marino", "A"],
  [1985, "Marcus Allen", "A"],
  [1986, "Lawrence Taylor", "A"],
  [1987, "John Elway", "A"],
  [1988, "Boomer Esiason", "B"],
  [1989, "Joe Montana", "A"],
  [1990, "Joe Montana", "A"],
  [1991, "Thurman Thomas", "B"],
  [1992, "Steve Young", "A"],
  [1993, "Emmitt Smith", "A"],
  [1994, "Steve Young", "A"],
  [1995, "Brett Favre", "A"],
  [1996, "Brett Favre", "A"],
  [1997, "Brett Favre", "A"],
  [1997, "Barry Sanders", "A"],
  [1998, "Terrell Davis", "B"],
  [1999, "Kurt Warner", "A"],
  [2000, "Marshall Faulk", "A"],
  [2001, "Kurt Warner", "A"],
  [2002, "Rich Gannon", "B"],
  [2003, "Peyton Manning", "A"],
  [2003, "Steve McNair", "B"],
  [2004, "Peyton Manning", "A"],
  [2005, "Shaun Alexander", "B"],
  [2006, "LaDainian Tomlinson", "A"],
  [2007, "Tom Brady", "A"],
  [2008, "Peyton Manning", "A"],
  [2009, "Peyton Manning", "A"],
  [2010, "Tom Brady", "A"],
  [2011, "Aaron Rodgers", "A"],
  [2012, "Adrian Peterson", "A"],
  [2013, "Peyton Manning", "A"],
  [2014, "Aaron Rodgers", "A"],
  [2015, "Cam Newton", "A"],
  [2016, "Matt Ryan", "B"],
  [2017, "Tom Brady", "A"],
  [2018, "Patrick Mahomes", "A"],
  [2019, "Lamar Jackson", "A"],
  [2020, "Aaron Rodgers", "A"],
  [2021, "Aaron Rodgers", "A"],
  [2022, "Patrick Mahomes", "A"],
  [2023, "Lamar Jackson", "A"],
  [2024, "Josh Allen", "A"],
  [2025, "Matthew Stafford", "B"],
] as const satisfies readonly (readonly [number, string, FootballRecognitionSourceDispositionTier])[];

/**
 * Exhaustive review of every AP NFL MVP recipient from the award's 1957 inception through the latest completed
 * season (2025). Shared awards remain separate recipient rows. D means reviewed/archive-only for player-career
 * recognition and is not a missing canonical subject.
 */
export const footballNflMvpRecognitionDispositions: readonly FootballNflMvpRecognitionDisposition[] = NFL_MVP_RECIPIENT_ROWS.map(
  ([awardYear, name, disposition]) => ({
    name,
    awardYear,
    disposition,
    reason: nflMvpDispositionReason(disposition),
    source: sourceForAwardYear(awardYear),
  }),
);

const TIER_RANK = { A: 3, B: 2 } as const;

function identityAliases(name: string): readonly string[] | undefined {
  if (name === "O.J. Simpson") return ["O. J. Simpson", "OJ Simpson"];
  if (name === "Y.A. Tittle") return ["Y. A. Tittle"];
  return undefined;
}

const nflMvpCareerCandidatesByName = new Map<string, FootballRecognitionCompletenessCandidate>();
for (const disposition of footballNflMvpRecognitionDispositions) {
  if (disposition.disposition !== "A" && disposition.disposition !== "B") continue;
  const candidate: FootballRecognitionCompletenessCandidate = {
    name: disposition.name,
    ...(identityAliases(disposition.name) ? { identityAliases: identityAliases(disposition.name) } : {}),
    league: "NFL",
    kind: "player-career",
    minimumTier: disposition.disposition,
    evidenceFamily: "mvp-all-pro",
    source: disposition.source,
  };
  const existing = nflMvpCareerCandidatesByName.get(disposition.name);
  if (!existing || TIER_RANK[candidate.minimumTier] > TIER_RANK[existing.minimumTier]) {
    nflMvpCareerCandidatesByName.set(disposition.name, candidate);
  }
}

export const footballNflMvpCareerRecognitionCandidates = [...nflMvpCareerCandidatesByName.values()];
