import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_SKILL_KEYS, NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

const draft = JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json", "utf8")) as {
  players: Array<{name:string; teamCode:string; overall:number; skills:Record<string,number>; reviewStatus:string; gradeReviewStatus:string}>;
  published:boolean; certifiedCount:number;
};
const review = JSON.parse(readFileSync("docs/nba-gm-official-identity-and-evidence-review-2026-10-29.json", "utf8")) as {
  productionPublished:boolean; completeSixSkillCertified:number;
  officialRosterIdentity:Array<{name:string; teamCode:string; nbaPlayerId:number; officialPositionFamily:string; officialPlayerUrl:string; verificationStatus:string}>;
  official2026DraftIdentity:Array<{name:string; draftingTeam:string; pick:number; sourceUrl:string; verificationStatus:string}>;
  individualResearch:Array<{name:string; season:string; skillsReviewed:string[]; before:number|null; after:number|null; sourceUrl:string; status:string}>;
  roleFlags:Array<{name:string;why:string}>;
  rookieCollegeEvidence:Array<{name:string;season:string;competition:string;games:number;sourceUrl:string;sourceStatus:string;nba2025_26Production:boolean;limitations:string}>;
  sourceQualityExceptions:Array<{name:string;sourceUrl:string;decision:string}>;
};
const officialRosters = JSON.parse(readFileSync("docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json","utf8")) as {crosswalk:Array<{name:string;teamCode:string;officialRosterPosition:string;officialRosterUrl:string;officialNBAPlayerId:string|null}>; teamCount:number;playerCount:number;positionConflicts:Array<unknown>;published:boolean};

describe("NBA GM evidence-led provisional identity and skill review", () => {
  const players = new Map(draft.players.map(p => [p.name, p]));
  it("ties 19 official NBA player IDs and current teams to existing draft identities, without substituting generic roster URLs", () => {
    expect(review.officialRosterIdentity).toHaveLength(19);
    const ids = new Set<number>();
    const names = new Set<string>();
    for (const entry of review.officialRosterIdentity) {
      expect(ids.has(entry.nbaPlayerId), entry.name).toBe(false);
      expect(names.has(entry.name), entry.name).toBe(false);
      ids.add(entry.nbaPlayerId); names.add(entry.name);
      expect(players.get(entry.name)?.teamCode, entry.name).toBe(entry.teamCode);
      expect(NBA_GM_TEAM_CODES).toContain(entry.teamCode);
      expect(entry.officialPositionFamily).toMatch(/^(G|F|C)(-(G|F|C))?$/);
      expect(entry.officialPlayerUrl, entry.name).toMatch(new RegExp("^https://www\\.nba\\.com/player/" + entry.nbaPlayerId + "(?:/|$)"));
      expect(entry.verificationStatus).toBe("NBA_PLAYER_ID_AND_CURRENT_TEAM_VERIFIED_EXACT_SLOT_PENDING");
    }
    const indDraft = draft.players.filter(p => p.teamCode === "IND");
    expect(indDraft).toHaveLength(12);
    for (const p of indDraft) expect(names.has(p.name), p.name).toBe(true);
  });
  it("matches all 330 players to official October roster leads and keeps exact playable slots unresolved", () => {
    expect(officialRosters.teamCount).toBe(30);
    expect(officialRosters.playerCount).toBe(330);
    expect(officialRosters.published).toBe(false);
    expect(officialRosters.crosswalk).toHaveLength(330);
    expect(new Set(officialRosters.crosswalk.map(p => p.name)).size).toBe(330);
    const matches = new Map(officialRosters.crosswalk.map(p => [p.name, p]));
    for (const p of draft.players) {
      const row = matches.get(p.name);
      expect(row, p.name).toBeTruthy();
      expect(row?.teamCode, p.name).toBe(p.teamCode);
      expect(row?.officialRosterUrl, p.name).toMatch(/^https:\/\/www\.nba\.com\/team\//);
      expect(row?.officialRosterPosition.length,p.name).toBeGreaterThan(0);
    }
    expect(officialRosters.positionConflicts).toHaveLength(39);
  });
  it("records first 2026 draft identity and distinguishes pick origin from opening roster", () => {
    expect(review.official2026DraftIdentity).toHaveLength(13);
    const picks = new Set<number>();
    for (const p of review.official2026DraftIdentity) {
      expect(players.has(p.name), p.name).toBe(true);
      expect(picks.has(p.pick), p.name).toBe(false);
      picks.add(p.pick);
      expect(NBA_GM_TEAM_CODES).toContain(p.draftingTeam);
      expect(p.sourceUrl).toBe("https://www.nba.com/draft/2026");
      expect(p.verificationStatus).toBe("DRAFT_IDENTITY_AND_ORIGINAL_PICK_ONLY_NOT_CURRENT_ROSTER");
    }
    expect(review.official2026DraftIdentity.find(p => p.name === "Nate Ament")?.draftingTeam).toBe("MIA");
    expect(players.get("Nate Ament")?.teamCode).toBe("MIL");
  });
  it("separates all 13 rookie college profiles from NBA 2025-26 skill certification", () => {
    expect(review.rookieCollegeEvidence).toHaveLength(13);
    const eligible = new Set(review.official2026DraftIdentity.map(e => e.name));
    for (const r of review.rookieCollegeEvidence) {
      expect(eligible.has(r.name),r.name).toBe(true);
      expect(r.season).toBe("2025-26");
      expect(r.competition).toBe("NCAA Division I");
      expect(r.games).toBeGreaterThan(0);
      expect(r.nba2025_26Production).toBe(false);
      expect(r.sourceStatus).toBe("COLLEGE_EVIDENCE_VERIFIED_NOT_NBA_SIX_SKILL_CERTIFIED");
      expect(r.sourceUrl).toMatch(/^https:\/\//);
      expect(r.limitations.length).toBeGreaterThan(20);
    }
    expect(review.sourceQualityExceptions).toHaveLength(4);
    for(const e of review.sourceQualityExceptions) expect(eligible.has(e.name),e.name).toBe(true);
  });
  it("enforces targeted evidence and guards that source context is not all-six certification", () => {
    expect(draft.players).toHaveLength(330);
    expect(draft.published).toBe(false);
    expect(review.productionPublished).toBe(false);
    expect(draft.certifiedCount).toBe(0);
    expect(review.completeSixSkillCertified).toBe(0);
    expect(draft.players.every(p => p.reviewStatus === "PROVISIONAL_NOT_CERTIFIED")).toBe(true);
    const corrections = review.individualResearch.filter(p => p.after !== null);
    expect(corrections.map(p => p.name).sort()).toEqual(["Andrew Wiggins","Bub Carrington","Cam Spencer","Collin Sexton","Davion Mitchell","Dyson Daniels","Franz Wagner","Gradey Dick","Jaden McDaniels","Jalen Suggs","John Collins","Josh Hart","Julian Strawther","Kasparas Jakucionis","Kel'el Ware","Kevin Huerter","Matas Buzelis","Peyton Watson","Tre Mann"]);
    // The dated supplemental overlay contains 19 individually sourced adjustments.\n    // Four further practical adjustments are documented in the separate final closeout.\n    expect(corrections).toHaveLength(19);
    for (const c of corrections) {
      expect(c.season).toBe("2025-26");
      expect(c.skillsReviewed).toHaveLength(1);
      const skill = c.skillsReviewed[0]!;
      expect(["shooting", "playmaking", "interiorDefense"]).toContain(skill);
      expect(Number.isInteger(c.before)).toBe(true);
      expect(Number.isInteger(c.after)).toBe(true);
      expect(players.get(c.name)?.skills[skill]).toBe(c.after);
      expect(players.get(c.name)?.gradeReviewStatus).toBe("partially-evidence-reviewed-not-certified");
      expect(c.status).toBe("EVIDENCE_BACKED_PROVISIONAL_REGRADE_NOT_FULL_CERTIFICATION");
      expect(c.sourceUrl).toMatch(/^https:\/\//);
    }
    for (const e of review.individualResearch) {
      expect(players.has(e.name), e.name).toBe(true);
      expect(e.sourceUrl).toMatch(/^https:\/\//);
      expect(e.skillsReviewed.every(x => NBA_GM_SKILL_KEYS.includes(x as typeof NBA_GM_SKILL_KEYS[number]))).toBe(true);
    }
    expect(review.individualResearch.some(e => e.name === "Tyrese Haliburton" && e.status.startsWith("NO_2025_26"))).toBe(true);
    for (const flag of review.roleFlags) expect(players.has(flag.name), flag.name).toBe(true);
  });

  it("separately classifies every 2025-26 no-NBA-season exception without fabricating NBA performance", () => {
    const noSeason = JSON.parse(readFileSync("docs/nba-gm-2025-26-nba-api-301-player-stat-evidence-2026-10-29.json", "utf8")) as {
      noSeasonRowCandidates:Array<{name:string}>;
    };
    const categories = JSON.parse(readFileSync("docs/nba-gm-official-identity-and-evidence-review-2026-10-29.json", "utf8")) as {
      confirmedNo2025_26NbaSeason:Array<{name:string}>;
      rookieCollegeEvidence:Array<{name:string;nba2025_26Production:boolean}>;
      no2025_26NbaSeasonAlternateEvidence:Array<{
        name:string;season:string;nbaRegularSeasonGames:number;
        category:string;sourceUrl:string;sixSkillCertification:string;
      }>;
      noSeasonSourcePartition:{nbaApiNoSeasonCandidates:number;priorInjuredVeteransReviewed:number;
        college2026RookiesAlreadyReviewed:number;newlyClassifiedAlternatives:number;unclassified:number};
    };
    const veterans = categories.confirmedNo2025_26NbaSeason.map(x=>x.name);
    const college = categories.rookieCollegeEvidence.map(x=>x.name);
    const other = categories.no2025_26NbaSeasonAlternateEvidence.map(x=>x.name);
    expect(veterans).toHaveLength(4);
    expect(college).toHaveLength(13);
    expect(other).toHaveLength(12);
    const names = [...veterans,...college,...other];
    expect(new Set(names).size).toBe(29);
    expect(new Set(names)).toEqual(new Set(noSeason.noSeasonRowCandidates.map(x=>x.name)));
    expect(categories.noSeasonSourcePartition).toMatchObject({
      nbaApiNoSeasonCandidates:29,
      priorInjuredVeteransReviewed:4,
      college2026RookiesAlreadyReviewed:13,
      newlyClassifiedAlternatives:12,
      unclassified:0
    });
    for(const row of categories.no2025_26NbaSeasonAlternateEvidence) {
      expect(row.season,row.name).toBe("2025-26");
      expect(row.nbaRegularSeasonGames,row.name).toBe(0);
      expect(row.sourceUrl,row.name).toMatch(/^https:\/\//);
      expect(row.category,row.name).not.toBe("");
      expect(row.sixSkillCertification,row.name).toBe("NOT_CERTIFIED");
    }
    expect(draft.certifiedCount).toBe(0);
    expect(draft.published).toBe(false);
  });

  it("keeps October 30 individually verified NBA IDs tied to the right current teams, without implying exact-slot approval", () => {
    const roster = JSON.parse(readFileSync("docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json", "utf8")) as {
      manuallyVerifiedPlayerIdCount:number;
      crosswalk:Array<{name:string;teamCode:string;officialNBAPlayerId:string|null;officialPlayerUrl?:string;positionStatus:string}>;
    };
    expect(roster.manuallyVerifiedPlayerIdCount).toBeGreaterThanOrEqual(87);
    const idRows=roster.crosswalk.filter(x=>x.officialNBAPlayerId);
    expect(new Set(idRows.map(x=>x.officialNBAPlayerId)).size).toBe(idRows.length);
    const byName=new Map(roster.crosswalk.map(x=>[x.name,x]));
    for(const [name,team,id] of ([
      ["Kasparas Jakucionis","MIL","1642857"],
      ["John Collins","DET","1628381"],
      ["Andrew Wiggins","MIA","203952"],
      ["Thomas Sorber","OKC","1642850"],
      ["Labaron Philon Jr.","PHI","1642889"]
    ] as Array<[string,string,string]>)) {
      const row=byName.get(name);
      expect(row?.teamCode,name).toBe(team);
      expect(row?.officialNBAPlayerId,name).toBe(id);
      expect(row?.officialPlayerUrl,name).toContain("/player/"+id);
      expect(row?.positionStatus,name).toContain("not-certified");
    }
  });

  it("separates confirmed 2025-26 injury absence from player ability and verifies 8 more exact NBA IDs", () => {
    const supplemental = JSON.parse(readFileSync("docs/nba-gm-official-identity-and-evidence-review-2026-10-29.json","utf8")) as {
      confirmedNo2025_26NbaSeason:Array<{name:string;season:string;nbaRegularSeasonGames:number;lastNbaSeason:string;lastSeasonGames:number;sourceUrl:string;gradeStatus:string}>;
      positionEvidenceAdjudications:Array<{name:string;reviewedCandidates:string[];certification:string;sourceUrl:string}>;
    };
    const missing = supplemental.confirmedNo2025_26NbaSeason;
    expect(missing.map(x=>x.name).sort()).toEqual(["Damian Lillard","Fred VanVleet","Kyrie Irving","Tyrese Haliburton"]);
    for(const item of missing) {
      expect(item.season).toBe("2025-26");
      expect(item.nbaRegularSeasonGames).toBe(0);
      expect(item.lastNbaSeason).toBe("2024-25");
      expect(item.lastSeasonGames).toBeGreaterThan(40);
      expect(item.gradeStatus).toBe("PROVISIONAL_INJURY_AVAILABILITY_SEPARATE_FROM_ABILITY");
      expect(item.sourceUrl).toMatch(/^https:\/\//);
    }
    const data = JSON.parse(readFileSync("docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json","utf8")) as {
      crosswalk:Array<{name:string;teamCode:string;officialNBAPlayerId:string|null;officialPlayerUrl?:string}>;
      manuallyVerifiedPlayerIdCount:number;
    };
    expect(data.manuallyVerifiedPlayerIdCount).toBeGreaterThanOrEqual(19);
    expect(data.crosswalk.filter(p=>p.officialNBAPlayerId).length).toBe(data.manuallyVerifiedPlayerIdCount);
    const named = new Map(data.crosswalk.map(p=>[p.name,p]));
    for(const [name,id] of [
      ["Luguentz Dort","1629652"],["Aaron Wiggins","1630598"],["Kingston Flemings","1643412"],
      ["Nickeil Alexander-Walker","1629638"],["Dorian Finney-Smith","1627827"],
      ["Asa Newell","1642854"],["Onyeka Okongwu","1630168"],["Corey Kispert","1630557"]
    ]) {
      const row=named.get(name);
      expect(row?.teamCode).toBe("ATL");
      expect(row?.officialNBAPlayerId).toBe(id);
      expect(row?.officialPlayerUrl).toBe("https://www.nba.com/player/"+id);
    }
    const positions = new Map(supplemental.positionEvidenceAdjudications.map(x=>[x.name,x]));
    expect(positions.size).toBeGreaterThanOrEqual(10);
    for(const [name,candidates] of ([
      ["Bennedict Mathurin",["SG","SF"]],["Luguentz Dort",["SG","SF"]],
      ["Jordan Walsh",["SF","PF"]],["Julian Strawther",["SG","SF"]],
      ["Zach LaVine",["SG","SF"]],["Josh Hart",["SG","SF","PF"]],
      ["Obi Toppin",["PF"]],["Christian Braun",["SG","SF"]],
      ["Bilal Coulibaly",["SG","SF"]],["Ty Jerome",["PG","SG"]],
      ["John Collins",["PF"]],["Peyton Watson",["SF","PF"]],
      ["Anthony Black",["PG"]],["Ben Sheppard",["SG"]],
      ["Pelle Larsson",["SG"]],["Javonte Green",["SG"]],
      ["Jalen Suggs",["PG","SG"]],["Gradey Dick",["SG","SF"]]
    ] as Array<[string,string[]]>)) {
      const item=positions.get(name);
      expect(item?.reviewedCandidates).toEqual(candidates);
      // A position adjudication is meaningful only when the unpublished board reflects it.
      const boardPosition = draft.players.find(p=>p.name===name) as {candidatePositions?:string[]} | undefined;
      expect(boardPosition?.candidatePositions,name).toEqual(candidates);
      expect(item?.certification).toBe("PROVISIONAL_POSITION_LEAD_NOT_FULL_GAME_ELIGIBILITY_CERTIFICATION");
      expect(item?.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});