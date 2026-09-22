import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand } from "./whoAmIEngine";
import { whoAmIRevealProfile } from "./whoAmIRevealArchitecture";

const POWERHOUSE_SCHOOL_TERMS = [
  "alabama",
  "ohio state",
  "georgia",
  "lsu",
  "clemson",
  "oklahoma",
  "texas",
  "usc",
  "michigan",
  "notre dame",
  "florida",
  "florida state",
  "miami",
  "penn state",
  "tennessee",
  "auburn",
  "oregon",
  "texas a&m",
] as const;

const DISTINCTIVE_CFB_SCHOOL_TERMS = [
  "oregon state",
  "mississippi valley state",
  "hawaii",
  "boston college",
  "fresno state",
  "marshall",
  "northern illinois",
  "boise state",
  "memphis",
  "utah state",
  "san diego state",
] as const;

const STRONG_IDENTITY_SIGNALS = /\b(?:heisman|all-america|all-american|player of the year|national championship|conference championship|bowl|playoff|record|first player|only player|unanimous|consensus|draft|selected no\.|overall pick|transferred|transfer|junior college|juco|walk-on|walk on|position change|converted from|switched from)\b/i;
const SIGNATURE_SIGNALS = /\b(?:nickname|known as|called the|jersey number|wore no\.|wear no\.|no\. \d{1,2}\b|historic play|game-winning|last-second|walk-off|miracle)\b/i;
const GENERIC_VOLUME = /\b(?:career|across \d+ seasons?|in \d+ games?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i;
const SUPERLATIVE_SIGNAL = /\b(?:record|leader|most|fewest|first|only|single-season|single game|school record|conference record|ncaa|nation|nationally)\b/i;

function pr3Clue(
  id: string,
  text: string,
  band: WhoAmIClueBand,
  facet: NonNullable<WhoAmIClue["facet"]>,
  revealPriority = 16,
): WhoAmIClue {
  return {
    id: `pr3:${id}`,
    conceptId: `pr3:${id}`,
    text,
    band,
    facet,
    revealPriority,
  };
}

const CFB_PR3_SUPPLEMENTAL = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-eric-weddle", [
    pr3Clue("weddle-two-mwc-dpoy", "I was the Mountain West Defensive Player of the Year in both 2005 and 2006.", "strong", "accomplishments", 14),
  ]],
  ["cfb-joe-burrow", [
    pr3Clue("burrow-2019-sec-title", "I led LSU to the 2019 SEC championship before the Tigers completed a 15-0 national-title season.", "strong", "accomplishments", 14),
    pr3Clue("burrow-peach-bowl", "I threw seven touchdown passes in the first half of LSU's 2019 Peach Bowl semifinal win over Oklahoma.", "strong", "accomplishments", 15),
  ]],
  ["cfb-braylon-edwards", [
    pr3Clue("edwards-biletnikoff", "I won the 2004 Biletnikoff Award and was a unanimous first-team All-American at Michigan.", "giveaway", "accomplishments", 8),
    pr3Clue("edwards-three-straight-1000", "I became the first Big Ten receiver to post three consecutive 1,000-yard seasons.", "strong", "accomplishments", 15),
  ]],
  ["cfb-ernie-davis", [
    pr3Clue("davis-cotton-bowl", "As a sophomore I was Cotton Bowl MVP, scoring twice in Syracuse's 23-14 win over Texas that completed an 11-0 national-championship season.", "giveaway", "accomplishments", 8),
    pr3Clue("davis-two-time-all-american", "I earned All-America honors in both 1960 and 1961, with the second selection unanimous.", "strong", "identity"),
    pr3Clue("davis-liberty-bowl", "In my final college game I rushed for 140 yards and a touchdown as Syracuse erased a 14-0 halftime deficit to beat Miami in the Liberty Bowl.", "strong", "identity"),
    pr3Clue("davis-1960-efficiency", "In 1960 I averaged 7.8 yards per carry, a Syracuse single-season record.", "strong", "production"),
    pr3Clue("davis-versatility", "At Syracuse I also caught passes, returned punts and kickoffs, and threw a touchdown pass.", "helpful", "style"),
  ]],
  ["cfb-hunter-henry", [
    pr3Clue("henry-full-career", "Across my Arkansas career, I caught 116 passes for 1,661 yards and nine touchdowns, becoming one of eight SEC tight ends to reach 100 receptions.", "strong", "identity"),
  ]],
  ["cfb-christian-mccaffrey", [
    pr3Clue("mccaffrey-ap-player-year", "I was the 2015 AP College Football Player of the Year and finished second in Heisman Trophy voting.", "strong", "accomplishments"),
    pr3Clue("mccaffrey-pac12-rose", "In 2015 I helped Stanford win the Pac-12 and Rose Bowl championships and was named Pac-12 Offensive Player of the Year.", "strong", "identity"),
    pr3Clue("mccaffrey-pac12-title-game", "In the 2015 Pac-12 Championship Game I became the only FBS player to post 200 rushing, 100 receiving and 100 kickoff-return yards in one game.", "giveaway", "identity", 8),
  ]],
  ["cfb-kyle-hamilton", [
    pr3Clue("hamilton-consensus-all-america", "I was a consensus All-American safety in 2021 despite being limited to seven games by injury.", "strong", "accomplishments"),
    pr3Clue("hamilton-fsu-two-picks", "I intercepted two passes in Notre Dame's 2021 season-opening overtime win at Florida State.", "strong", "identity"),
    pr3Clue("hamilton-purdue", "Against Purdue in 2021 I made 10 tackles, stopped a fourth-down conversion and later intercepted a pass in the red zone.", "strong", "identity"),
  ]],
  ["cfb-brandon-scherff", [
    pr3Clue("scherff-unanimous-all-america", "At Iowa I was a unanimous consensus first-team All-American in 2014.", "strong", "identity"),
  ]],
  ["cfb-dak-prescott", [
    pr3Clue("dak-two-time-all-sec", "I was a two-time All-American and earned first-team All-SEC honors in both 2014 and 2015.", "strong", "accomplishments"),
    pr3Clue("dak-bowl-mvps", "I earned MVP honors in both the 2013 Liberty Bowl and the 2015 Belk Bowl for Mississippi State.", "strong", "accomplishments"),
    pr3Clue("dak-38-school-records", "I finished my Mississippi State career owning 38 school records across single-game, single-season and career categories.", "giveaway", "identity", 9),
    pr3Clue("dak-9000-2500", "I became one of four FBS players to finish a career with more than 9,000 passing yards and 2,500 rushing yards.", "strong", "identity"),
  ]],
  ["cfb-vince-young", [
    pr3Clue("young-2005-awards-title", "I won the Maxwell Award and Davey O'Brien Award in 2005 while leading Texas to the national championship.", "giveaway", "accomplishments", 8),
    pr3Clue("young-rose-bowl-mvp", "I earned Rose Bowl Offensive MVP honors twice, including after rushing for 200 yards and three touchdowns in the 41-38 title-game win over USC.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-deshaun-watson", [
    pr3Clue("watson-title-winner", "I threw the national-championship-winning touchdown pass to Hunter Renfrow with one second left against Alabama.", "giveaway", "accomplishments", 9),
    pr3Clue("watson-two-time-qb-awards", "I won both the Davey O'Brien Award and Manning Award in consecutive seasons.", "strong", "accomplishments"),
  ]],
  ["cfb-eddie-george", [
    pr3Clue("george-1995-awards", "In 1995 I won the Heisman Trophy, Doak Walker Award, Maxwell Award and Walter Camp Player of the Year honor.", "giveaway", "accomplishments", 9),
    pr3Clue("george-illinois-record", "I set an Ohio State single-game rushing record with 314 yards against Illinois in 1995.", "giveaway", "identity", 8),
    pr3Clue("george-1995-all-america", "I was a first-team All-American, Big Ten MVP and Ohio State team co-captain in 1995.", "strong", "accomplishments"),
  ]],
  ["cfb-marvin-harrison-jr", [
    pr3Clue("harrison-biletnikoff", "I won the 2023 Biletnikoff Award as college football's outstanding receiver and was a Heisman Trophy finalist.", "giveaway", "accomplishments", 9),
    pr3Clue("harrison-two-time-unanimous", "I became Ohio State's first two-time All-American receiver, earning unanimous honors in both 2022 and 2023.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-brady-quinn", [
    pr3Clue("quinn-2006-awards", "In 2006 I won the Maxwell Award as college football's player of the year and the Johnny Unitas Golden Arm Award.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-colt-mccoy", [
    pr3Clue("mccoy-2008-awards", "In 2008 I won the Walter Camp Player of the Year and Archie Griffin Award and finished second in the Heisman voting.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-danny-wuerffel", [
    pr3Clue("wuerffel-heisman-title", "In 1996 I won the Heisman Trophy, Maxwell Award and Davey O'Brien Award before leading Florida to the national championship.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-archie-griffin", [
    pr3Clue("griffin-two-heismans", "I remain the only player to win the Heisman Trophy twice, taking it in 1974 and 1975.", "giveaway", "accomplishments", 9),
    pr3Clue("griffin-four-rose-bowls", "I am the only player to start in four Rose Bowl games, one after each of my four Ohio State seasons.", "giveaway", "identity", 8),
    pr3Clue("griffin-big-ten-titles", "I helped Ohio State win four consecutive Big Ten championships and was a three-time first-team All-American.", "strong", "accomplishments"),
  ]],
  ["cfb-earl-campbell", [
    pr3Clue("campbell-1977-heisman", "I won the 1977 Heisman Trophy after leading the nation in both rushing and scoring.", "giveaway", "accomplishments", 9),
    pr3Clue("campbell-1977-swc", "I led Texas through an 11-0 regular season and a Southwest Conference championship in 1977.", "strong", "accomplishments"),
    pr3Clue("campbell-all-america", "I was a two-time consensus All-American at Texas.", "strong", "accomplishments"),
  ]],
  ["cfb-eric-crouch", [
    pr3Clue("crouch-option-style", "I quarterbacked Nebraska's option offense and was a major rushing threat from the position.", "helpful", "style", 25),
    pr3Clue("crouch-2001-heisman", "I won the 2001 Heisman Trophy after a season in which I ran, passed and even caught a 63-yard touchdown against Oklahoma.", "giveaway", "accomplishments", 9),
    pr3Clue("crouch-fiesta-mvp", "I was the offensive MVP of Nebraska's Fiesta Bowl win over Tennessee after the 1999 season.", "strong", "accomplishments"),
  ]],
  ["cfb-luke-kuechly", [
    pr3Clue("kuechly-acc-role", "I played middle linebacker in the ACC.", "helpful", "style", 22),
    pr3Clue("kuechly-2011-awards", "In 2011 I won the Butkus, Nagurski and Lombardi awards and was named ACC Defensive Player of the Year.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-a-j-brown", [
    pr3Clue("aj-brown-2018-all-sec", "In 2018 I earned first-team All-SEC honors after breaking my own Ole Miss single-season receiving-yardage record.", "strong", "accomplishments"),
  ]],
  ["cfb-aaron-ross", [
    pr3Clue("aaron-ross-thorpe", "I won the 2006 Jim Thorpe Award as college football's top defensive back.", "giveaway", "accomplishments", 9),
    pr3Clue("aaron-ross-title-team", "I was a key member of Texas's 2005 national championship team that beat USC in the Rose Bowl.", "strong", "accomplishments", 15),
  ]],
  ["cfb-brock-bowers", [
    pr3Clue("bowers-two-mackeys", "I became the first two-time winner of the John Mackey Award, taking the honor in both 2022 and 2023.", "giveaway", "accomplishments", 8),
    pr3Clue("bowers-three-all-america", "I became just the third Georgia player to earn first-team All-America recognition in three different seasons.", "strong", "accomplishments"),
  ]],
  ["cfb-champ-bailey", [
    pr3Clue("bailey-1070-snaps", "In 1998 I played 1,070 snaps across defense, offense and special teams for Georgia.", "strong", "style", 15),
  ]],
  ["cfb-charles-woodson", [
    pr3Clue("woodson-ohio-state-three-way", "Against Ohio State in 1997, I returned a punt 78 yards for a touchdown, intercepted a pass in the end zone and caught a 37-yard pass that set up a touchdown.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-dalvin-cook", [
    pr3Clue("cook-orange-bowl-mvp", "I was Orange Bowl MVP after rushing for 145 yards against Michigan in my final college game.", "strong", "accomplishments"),
    pr3Clue("cook-fsu-rushing-record", "I broke Florida State's 20-year-old career rushing record and finished as the program's all-time leading rusher.", "giveaway", "identity", 9),
  ]],
  ["cfb-darqueze-dennard", [
    pr3Clue("dennard-thorpe", "In 2013 I became the first Michigan State player to win the Jim Thorpe Award.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-deion-sanders", [
    pr3Clue("deion-thorpe-three-sport", "I won the 1988 Jim Thorpe Award and was also a three-sport athlete in football, baseball and track at Florida State.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-devonta-smith", [
    pr3Clue("devonta-title-first-half", "In the national-title game against Ohio State, I had 215 receiving yards and three touchdown catches in the first half alone.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-jalen-ramsey", [
    pr3Clue("ramsey-true-freshman", "I became Florida State's first true freshman to start at cornerback since Deion Sanders, then started all 14 games for the 2013 national champions.", "strong", "career-path"),
  ]],
  ["cfb-jeremy-shockey", [
    pr3Clue("shockey-fsu-winner", "My first touchdown catch for Miami was a 13-yard score in the final minute that beat then-No. 1 Florida State in 2000.", "giveaway", "accomplishments", 8),
    pr3Clue("shockey-juco-path", "I reached Miami after one season at Northeast Oklahoma A&M, where I was a first-team junior-college All-American.", "strong", "career-path"),
    pr3Clue("shockey-title-season", "I was a first-team All-Big East tight end on Miami's undefeated 2001 national championship team.", "strong", "accomplishments", 14),
  ]],
  ["cfb-malaki-starks", [
    pr3Clue("starks-freshman-champ", "As a true freshman I started 14 games, earned FWAA Freshman All-America honors and helped Georgia win the 2022 national championship.", "strong", "accomplishments"),
  ]],
  ["cfb-marqise-lee", [
    pr3Clue("lee-arizona-record", "I set a Pac-12 single-game record with 345 receiving yards against Arizona in 2012.", "giveaway", "identity", 9),
  ]],
  ["cfb-jj-watt", [
    pr3Clue("watt-cmu-wisconsin-path", "I began my college career as a tight end at Central Michigan before transferring home to Wisconsin and walking on as a defensive end.", "strong", "career-path", 14),
  ]],
  ["cfb-michael-huff", [
    pr3Clue("huff-title-stop", "Late in the 2005 national-title game, I stopped LenDale White on fourth-and-two to give Texas the ball for its winning drive.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-mike-evans", [
    pr3Clue("evans-bama-record", "I broke Texas A&M's long-standing single-game receiving record with 279 yards against Alabama in 2013.", "strong", "identity"),
    pr3Clue("evans-auburn-record", "Later that season I reset the school single-game receiving record with 287 yards against Auburn and tied the school mark with four touchdown catches.", "strong", "accomplishments", 15),
  ]],
  ["cfb-minkah-fitzpatrick", [
    pr3Clue("minkah-double-awards", "In 2017 I became just the third player in NCAA history to win the Bednarik and Jim Thorpe awards in the same season.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-morris-claiborne", [
    pr3Clue("claiborne-thorpe-sec", "In 2011 I won the Jim Thorpe Award and was voted SEC Defensive Player of the Year.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-paul-posluszny", [
    pr3Clue("posluszny-2005-awards", "In 2005 I won the Butkus Award and the first of my two Bednarik Awards while Penn State won the Big Ten and Orange Bowl.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-rolando-mcclain", [
    pr3Clue("mcclain-butkus-captain", "I won the 2009 Butkus Award and served as a team captain for Alabama's national-championship defense.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-sammy-watkins", [
    pr3Clue("watkins-orange-bowl", "In my final college game I was Orange Bowl MVP with 16 catches for 227 yards and two touchdowns against Ohio State.", "giveaway", "accomplishments", 8),
  ]],
  ["urban-meyer-cfb", [
    pr3Clue("meyer-first-cfp-title", "I coached Ohio State to a 42-20 win over Oregon in the first College Football Playoff National Championship.", "giveaway", "accomplishments", 8),
  ]],
]);

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function bandRank(band: WhoAmIClueBand) {
  return ({ broad: 0, helpful: 1, strong: 2, giveaway: 3 } as const)[band];
}

function atLeastBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) >= bandRank(band) ? clue : { ...clue, band };
}

function atMostBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) <= bandRank(band) ? clue : { ...clue, band };
}

function annotateCfbCategoryMetadata(clue: WhoAmIClue): WhoAmIClue {
  if (clue.id === "position" || clue.id === "role" || clue.id === "pr3:position" || clue.id === "pr3:role") {
    return { ...clue, facet: "role" };
  }
  if (
    clue.id === "era"
    || clue.id === "pr3:era"
    || clue.id === "player-career-start"
    || clue.id === "player-career-end"
    || clue.id === "coach-start"
    || clue.id === "coach-end"
  ) {
    return { ...clue, facet: "era" };
  }
  if (clue.id === "school" || clue.id === "conference") {
    return { ...clue, facet: "background" };
  }
  if (!clue.facet) {
    return { ...clue, facet: whoAmIClueFacet(clue) };
  }
  return clue;
}

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function normalizeCfbDraftCopy(clue: WhoAmIClue): WhoAmIClue {
  if (!/draft|overall pick/i.test(`${clue.id} ${clue.text}`)) return clue;
  const match = clue.text.match(/\bNo\.\s*(\d+)\s+overall\b/i);
  if (!match) return clue;
  const pick = Number(match[1]);
  if (!Number.isFinite(pick)) return clue;
  const replacement = pick === 1 ? "first overall" : `${ordinal(pick)} overall`;
  return { ...clue, text: clue.text.replace(match[0], replacement) };
}

function cfbSchoolReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "school") return clue;

  const text = `${clue.id} ${clue.conceptId ?? ""} ${clue.text}`.toLowerCase();
  if (clue.id === "conference" || clue.id === "pr3:conference") {
    return { ...clue, band: "helpful" as const };
  }
  if (includesAny(text, DISTINCTIVE_CFB_SCHOOL_TERMS)) {
    return atLeastBand(clue, "strong");
  }
  if (includesAny(text, POWERHOUSE_SCHOOL_TERMS)) {
    return { ...clue, band: "helpful" as const };
  }

  // Most school clues are useful foundation at clue 4. Only unusually
  // identifying programs are promoted into the strong band above.
  return { ...clue, band: "helpful" as const };
}

function cfbSportsBiographyReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "sports-biography") return clue;
  return profile.identifyingPower === "signature"
    ? atLeastBand(clue, "strong")
    : atLeastBand(clue, "helpful");
}

function cfbLateAnchorReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "nickname-persona" || profile.category === "jersey-number") {
    return { ...clue, band: "giveaway" as const };
  }
  if (profile.category === "signature-moment") {
    return atLeastBand(clue, "strong");
  }
  if (profile.category === "records" && profile.identifyingPower === "signature") {
    return atLeastBand(clue, "strong");
  }
  return clue;
}

function cfbProductionReband(clue: WhoAmIClue) {
  if (whoAmIClueFacet(clue) !== "production") return clue;
  if (!GENERIC_VOLUME.test(clue.text) || SUPERLATIVE_SIGNAL.test(clue.text)) return clue;

  // Raw career volume is supporting information, not a near-giveaway merely
  // because the number is large. Preserve genuinely record-setting totals.
  return atMostBand(clue, "strong");
}

function cfbAccomplishmentReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "accomplishments" && profile.category !== "championships") return clue;
  if (SIGNATURE_SIGNALS.test(clue.text)) return { ...clue, band: "giveaway" as const };
  if (STRONG_IDENTITY_SIGNALS.test(clue.text)) return atLeastBand(clue, "strong");
  return clue;
}

function cfbOrientationReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "role" || profile.category === "era") {
    return atMostBand(clue, "helpful");
  }
  return clue;
}

function isPersonalBiography(clue: WhoAmIClue) {
  return whoAmIRevealProfile(clue).category === "personal-biography";
}

function personalBiographyValue(clue: WhoAmIClue) {
  const selectionClass = whoAmIClueSelectionClass(clue);
  let score = selectionClass === "sports-identity" ? 100 : selectionClass === "identity-color" ? 40 : 0;
  if (STRONG_IDENTITY_SIGNALS.test(clue.text) || SIGNATURE_SIGNALS.test(clue.text)) score += 40;
  if (clue.facet === "off-field") score -= 15;
  score += bandRank(clue.band) * 5;
  return score;
}

function capPersonalBiography(clues: readonly WhoAmIClue[]) {
  const personal = clues
    .map((clue, index) => ({ clue, index, score: personalBiographyValue(clue) }))
    .filter(({ clue }) => isPersonalBiography(clue))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (personal.length === 0) return [...clues];
  const nonPersonal = clues.filter((clue) => !isPersonalBiography(clue));
  if (nonPersonal.length >= 12) return nonPersonal;
  if (personal.length === 1) return [...clues];
  const keepId = personal[0]!.clue.id;
  return clues.filter((clue) => !isPersonalBiography(clue) || clue.id === keepId);
}

function ensureOrientationClues(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
) {
  const next = [...clues];

  if (subject.kind === "coach") {
    if (!next.some((clue) => clue.id === "role" || whoAmIClueFacet(clue) === "role")) {
      next.unshift({
        id: "pr3:role",
        conceptId: "pr3:role",
        text: "I am a college football head coach.",
        band: "broad",
        facet: "role",
        revealPriority: 10,
      });
    }
  } else if (
    subject.position
    && !next.some((clue) => clue.id === "position")
  ) {
    next.unshift({
      id: "pr3:position",
      conceptId: "pr3:position",
      text: `I played ${subject.position}.`,
      band: "broad",
      facet: "role",
      revealPriority: 10,
    });
  }

  if (!next.some((clue) => clue.id === "era" || clue.id === "pr3:era")) {
    const decades = subject.activeDecades ?? [];
    if (decades.length === 1) {
      next.push({
        id: "pr3:era",
        conceptId: "pr3:era",
        text: `My college football career came in the ${decades[0]}s.`,
        band: "broad",
        facet: "era",
        revealPriority: 20,
      });
    } else if (decades.length > 1) {
      next.push({
        id: "pr3:era",
        conceptId: "pr3:era",
        text: `My college football career spanned the ${decades[0]}s and ${decades[decades.length - 1]}s.`,
        band: "broad",
        facet: "era",
        revealPriority: 20,
      });
    }
  }

  return next;
}

function productionValue(clue: WhoAmIClue) {
  const text = `${clue.id} ${clue.text}`.toLowerCase();
  let score = 0;
  if (SUPERLATIVE_SIGNAL.test(text)) score += 100;
  if (/best-season|single-season|in \d{4}/.test(text)) score += 45;
  if (/career/.test(text)) score -= 20;
  if (clue.band === "giveaway") score += 20;
  if (clue.band === "strong") score += 10;
  return score;
}

function capGenericProduction(clues: readonly WhoAmIClue[]) {
  const production = clues
    .map((clue, index) => ({ clue, index, score: productionValue(clue) }))
    .filter(({ clue }) => whoAmIClueFacet(clue) === "production")
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (production.length <= 2) return [...clues];
  const nonProductionCount = clues.length - production.length;
  const keepCount = Math.max(2, Math.min(production.length, 12 - nonProductionCount));
  const keep = new Set(production.slice(0, keepCount).map(({ clue }) => clue.id));
  return clues.filter((clue) => whoAmIClueFacet(clue) !== "production" || keep.has(clue.id));
}

function capSignatureCategory(
  clues: readonly WhoAmIClue[],
  category: "jersey-number" | "nickname-persona",
) {
  const matches = clues.filter((clue) => whoAmIRevealProfile(clue).category === category);
  if (matches.length <= 1) return [...clues];

  const keep = [...matches].sort((left, right) => (
    bandRank(right.band) - bandRank(left.band)
    || (right.revealPriority ?? 50) - (left.revealPriority ?? 50)
  ))[0]!;
  const filtered = clues.filter((clue) => (
    whoAmIRevealProfile(clue).category !== category || clue.id === keep.id
  ));
  return filtered.length >= 10 ? filtered : [...clues];
}

function trimCategoryRepetition(clues: readonly WhoAmIClue[]) {
  return capSignatureCategory(
    capSignatureCategory(clues, "jersey-number"),
    "nickname-persona",
  );
}

function cfbPoolRetentionValue(clue: WhoAmIClue) {
  const selectionClass = whoAmIClueSelectionClass(clue);
  const profile = whoAmIRevealProfile(clue);
  let score = selectionClass === "sports-identity" ? 100 : selectionClass === "identity-color" ? 35 : 0;

  if (
    clue.id === "position"
    || clue.id === "pr3:position"
    || clue.id === "role"
    || clue.id === "pr3:role"
    || clue.id === "school"
    || clue.id === "era"
    || clue.id === "pr3:era"
  ) score += 150;

  if (
    profile.category === "accomplishments"
    || profile.category === "championships"
    || profile.category === "records"
    || profile.category === "signature-moment"
    || profile.category === "sports-biography"
    || profile.category === "team-path"
  ) score += 45;

  if (profile.category === "production") {
    score += SUPERLATIVE_SIGNAL.test(clue.text) ? 20 : -20;
  }
  if (profile.category === "personal-biography") score -= 100;

  score += bandRank(clue.band) * 12;
  if (clue.id.startsWith("pr3:")) score += 10;
  return score;
}

function capCfbPlayablePool(clues: readonly WhoAmIClue[], target = 16) {
  if (clues.length <= target) return [...clues];

  const ranked = clues
    .map((clue, index) => ({ clue, index, score: cfbPoolRetentionValue(clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const keep = new Set(ranked.slice(0, target).map(({ clue }) => clue.id));
  return clues.filter((clue) => keep.has(clue.id));
}

function ensureConferenceFoundation(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
) {
  if (!subject.conference || clues.some((clue) => clue.id === "conference" || clue.id === "pr3:conference")) {
    return [...clues];
  }
  return [
    ...clues,
    {
      id: "pr3:conference",
      conceptId: "pr3:conference",
      text: `I competed in the ${subject.conference}.`,
      band: "helpful" as const,
      facet: "background" as const,
      revealPriority: 30,
    },
  ];
}

function rebandCfbClue(clue: WhoAmIClue) {
  let next = annotateCfbCategoryMetadata(clue);
  next = cfbOrientationReband(next);
  next = cfbSchoolReband(next);
  next = cfbSportsBiographyReband(next);
  next = cfbAccomplishmentReband(next);
  next = cfbLateAnchorReband(next);
  next = cfbProductionReband(next);

  if (isPersonalBiography(next)) {
    next = { ...next, band: "giveaway" as const };
  }

  return next;
}

/**
 * PR3 is a CFB content pass, not planner rescue logic.
 *
 * The four existing 50-subject curation batches remain the authority for which
 * facts are available. This pass fixes the editorial meaning of those facts:
 * reband overly-identifying schools/routes, keep orientation clues early,
 * demote generic volume, force true signature clues late, and cap personal
 * biography. PR2 then orders the already-selected clue set normally.
 */
export function refineCfbWhoAmIContent(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
): WhoAmIClue[] {
  if (subject.league !== "CFB") return [...clues];
  const withSupplemental = [
    ...clues,
    ...(CFB_PR3_SUPPLEMENTAL.get(subject.id) ?? []),
  ];
  const subjectAdjusted = (subject.id === "cfb-ernie-davis" || subject.id === "cfb-lamichael-james")
    ? withSupplemental.map((clue) => {
      if (subject.id === "cfb-ernie-davis" && clue.text.includes("while wearing the program's famous No. 44")) {
        return { ...clue, text: clue.text.replace(" while wearing the program's famous No. 44", "") };
      }
      if (subject.id === "cfb-lamichael-james" && whoAmIRevealProfile(clue).category === "jersey-number") {
        return null;
      }
      return clue;
    }).filter((clue): clue is WhoAmIClue => clue !== null)
    : withSupplemental;
  const withOrientation = ensureOrientationClues(subject, subjectAdjusted);
  const withConference = ensureConferenceFoundation(subject, withOrientation);
  const rebanded = withConference.map(rebandCfbClue);
  const withoutStatSoup = capGenericProduction(rebanded);
  const withoutRepeatedSignatures = trimCategoryRepetition(withoutStatSoup);
  const withoutPersonalBiography = capPersonalBiography(withoutRepeatedSignatures);
  if (withoutPersonalBiography.length >= 12) return capCfbPlayablePool(withoutPersonalBiography);

  // Keep the signature-category cleanup even for thin legacy pools, then restore
  // only the highest-value non-signature clues needed for replay depth.
  const retainedIds = new Set(withoutPersonalBiography.map((clue) => clue.id));
  const restored = [...withoutPersonalBiography];
  for (const clue of rebanded) {
    if (restored.length >= 12) break;
    if (retainedIds.has(clue.id)) continue;
    const category = whoAmIRevealProfile(clue).category;
    if (category === "jersey-number" || category === "nickname-persona" || category === "personal-biography") continue;
    restored.push(clue);
    retainedIds.add(clue.id);
  }
  return capCfbPlayablePool(restored.length >= 12 ? restored : withoutPersonalBiography);
}
