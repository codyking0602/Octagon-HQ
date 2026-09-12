import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import {
  assembleWhoAmIClues,
  whoAmIClueFacet,
  whoAmIClueSelectionClass,
  whoAmIIdentityKnowledgeClue,
} from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues, type WhoAmIClue } from "./whoAmIEngine";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Who Am I clue-quality intelligence", () => {
  it("removes family surname answer leaks while preserving a useful clue", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-bryce-young",
      subjectName: "Bryce Young",
      subjectKind: "player",
      league: "CFB",
      factId: "father",
      conceptId: "father-craig-quarterback-tutor",
      value: "His father, Craig Young, closely tutored and trained him as a quarterback during his youth.",
      tags: ["family"],
    });

    expect(clue.text).toMatch(/^My father/i);
    expect(clue.text).not.toMatch(/\bBryce\b/i);
    expect(clue.text).not.toMatch(/\bYoung\b/i);
    expect(clue.text.split(/\s+/).length).toBeLessThanOrEqual(14);
  });

  it("prefers concise playable identity clues over research-note prose", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-style", text: "I was known for extending plays outside the pocket.", band: "helpful", facet: "style" },
      { id: "h-career", text: "I transferred before my final college season.", band: "helpful", facet: "career-path" },
      { id: "h-background", text: "I was a major high-school recruit.", band: "helpful", facet: "background" },
      {
        id: "h-research-note",
        text: "This player has described a complicated developmental journey that included several formative experiences and relationships, reflecting a competitive environment that continued to influence his approach long after he reached college football.",
        band: "helpful",
        facet: "off-field",
        identityKnowledge: true,
      },
      { id: "s-award", text: "I won a major national award.", band: "strong", facet: "accomplishments" },
      { id: "s-team", text: "I starred for a national-title contender.", band: "strong", facet: "career-path" },
      { id: "s-identity", text: "I became one of the faces of my program.", band: "strong", facet: "identity" },
      { id: "g-draft", text: "I was a first-round NFL draft pick.", band: "giveaway", facet: "career-path" },
      { id: "g-award", text: "I won the Heisman Trophy.", band: "giveaway", facet: "accomplishments" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.some((clue) => clue.id === "h-research-note")).toBe(false);
  });

  it("does not spend multiple clue slots on the same family-story facet", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played defensive back.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-school", text: "I played in the Big Ten.", band: "helpful", facet: "background" },
      { id: "h-span", text: "My pro career lasted more than a decade.", band: "helpful", facet: "era" },
      { id: "h-production", text: "I started more than 100 NFL games.", band: "helpful", facet: "production" },
      { id: "s-family-1", conceptId: "twin-brother-critic", text: "My twin brother was also an NFL player.", band: "strong", facet: "relationships" },
      { id: "s-family-2", conceptId: "twin-brother-charity", text: "My twin brother and I founded a charity.", band: "strong", facet: "relationships" },
      { id: "s-award", text: "I earned multiple championship rings.", band: "strong", facet: "accomplishments" },
      { id: "s-path", text: "I changed positions during my NFL career.", band: "strong", facet: "career-path" },
      { id: "g-team", text: "I spent most of my career with New England.", band: "giveaway", facet: "career-path" },
      { id: "g-title", text: "I was a captain on multiple Super Bowl champions.", band: "giveaway", facet: "accomplishments" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships")).toHaveLength(1);
  });

  it("puts the most recognizable giveaway at clue ten instead of a raw stat", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I was a fighter.", band: "broad", facet: "role" },
      { id: "b-era", text: "I fought in the 2010s.", band: "broad", facet: "era" },
      { id: "h-style", text: "I was primarily a striker.", band: "helpful", facet: "style" },
      { id: "h-span", text: "My UFC run lasted several years.", band: "helpful", facet: "era" },
      { id: "h-background", text: "I entered MMA from another combat sport.", band: "helpful", facet: "background" },
      { id: "s-title", text: "I fought for a UFC title.", band: "strong", facet: "accomplishments" },
      { id: "s-opponent", text: "I shared the Octagon with a former champion.", band: "strong", facet: "relationships" },
      { id: "s-style", text: "I became known for knockout power.", band: "strong", facet: "style" },
      { id: "g-stat", text: "I recorded 11 career knockdowns.", band: "giveaway", facet: "production" },
      { id: "g-name", text: "I was known by the nickname Rampage.", band: "giveaway", facet: "nickname" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.at(-1)?.id).toBe("g-name");
  });

  it("prioritizes sports identity over low-value biography while preserving progression", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2020s.", band: "broad", facet: "era" },
      { id: "h-transfer", text: "I transferred from one Power Four program to another.", band: "helpful", facet: "career-path" },
      { id: "h-school", text: "I played college football in the Big Ten.", band: "helpful", facet: "background" },
      { id: "h-production", text: "I threw for more than 3,000 yards in a season.", band: "helpful", facet: "production" },
      { id: "s-title", text: "I won a national championship.", band: "strong", facet: "accomplishments" },
      { id: "s-opponent", text: "I beat another nationally ranked quarterback in a major game.", band: "strong", facet: "relationships" },
      { id: "s-style", text: "I was known for accurate downfield passing.", band: "strong", facet: "style" },
      { id: "g-heisman", text: "I won the Heisman Trophy.", band: "giveaway", facet: "accomplishments" },
      { id: "g-jersey", text: "I wore jersey number 15.", band: "giveaway", facet: "identity" },
      {
        id: "bio-childhood",
        conceptId: "childhood-park-football",
        text: "I first played organized football in fourth grade at a neighborhood park.",
        band: "helpful",
        facet: "background",
        identityKnowledge: true,
      },
      {
        id: "bio-foster",
        conceptId: "childhood-foster-homes",
        text: "I spent part of my childhood moving through foster homes.",
        band: "strong",
        facet: "background",
        identityKnowledge: true,
      },
      {
        id: "bio-grandparents",
        conceptId: "grandparents-immigration",
        text: "My grandparents immigrated to the United States before I was born.",
        band: "strong",
        facet: "off-field",
        identityKnowledge: true,
      },
      {
        id: "bio-classes",
        conceptId: "college-classes-paid-personally",
        text: "I personally paid for my final college classes.",
        band: "helpful",
        facet: "off-field",
        identityKnowledge: true,
      },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length).toBeGreaterThanOrEqual(7);
    expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length).toBeLessThanOrEqual(1);
    expect(sequence.map((clue) => clue.id)).toEqual(expect.arrayContaining(["h-transfer", "s-title", "g-heisman", "g-jersey"]));
  });

  it("uses eight sports-facing clues when a healthy ten-clue pool can support them", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-transfer", text: "I transferred before my final college season.", band: "helpful", facet: "career-path" },
      { id: "h-school", text: "I played college football in the SEC.", band: "helpful", facet: "background" },
      { id: "h-production", text: "I threw for more than 3,000 yards in a season.", band: "helpful", facet: "production" },
      { id: "s-title", text: "I won a national championship.", band: "strong", facet: "accomplishments" },
      { id: "s-style", text: "I was known for accurate downfield passing.", band: "strong", facet: "style" },
      { id: "g-heisman", text: "I won the Heisman Trophy.", band: "giveaway", facet: "accomplishments" },
      { id: "h-color", text: "I collected vintage records off the field.", band: "helpful", facet: "off-field", identityKnowledge: true, revealPriority: 1 },
      { id: "s-color", text: "A childhood hobby became part of my public story.", band: "strong", facet: "identity", identityKnowledge: true, revealPriority: 1 },
      { id: "s-family", text: "My family moved several times while I was young.", band: "strong", facet: "relationships", identityKnowledge: true, revealPriority: 1 },
      { id: "g-color", text: "A personal ritual became well known away from football.", band: "giveaway", facet: "off-field", identityKnowledge: true, revealPriority: 1 },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length).toBeGreaterThanOrEqual(8);
  });

  it("does not let sports vocabulary disguise deep personal biography as sports identity", () => {
    const familyCoach = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-example-quarterback",
      subjectName: "Example Quarterback",
      subjectKind: "player",
      league: "CFB",
      factId: "father-youth-coach",
      conceptId: "father-youth-quarterback-coach",
      value: "His father coached him at quarterback throughout his youth and childhood.",
      tags: ["family", "childhood"],
    });
    const siblingTeammate = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-example-player",
      subjectName: "Example Player",
      subjectKind: "player",
      league: "NFL",
      factId: "brother-teammate",
      conceptId: "brother-nfl-teammate",
      value: "His brother was also his NFL teammate for multiple seasons.",
      tags: ["family", "teammate"],
    });

    expect(whoAmIClueSelectionClass(familyCoach)).toBe("deep-biography");
    expect(whoAmIClueSelectionClass(siblingTeammate)).toBe("sports-identity");
  });

  it("deduplicates major accolade families before they consume multiple valuable slots", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-school", text: "I played college football in the SEC.", band: "helpful", facet: "background" },
      { id: "h-style", text: "I was known for extending plays outside the pocket.", band: "helpful", facet: "style" },
      { id: "h-path", text: "I became a first-round NFL draft pick.", band: "helpful", facet: "career-path" },
      { id: "s-heisman-one", text: "I won the Heisman Trophy.", band: "strong", facet: "accomplishments" },
      { id: "s-heisman-two", text: "My college résumé includes a Heisman award.", band: "strong", facet: "accomplishments", identityKnowledge: true },
      { id: "s-title", text: "I won a national championship.", band: "strong", facet: "accomplishments" },
      { id: "s-rival", text: "I beat a major rival in a championship season.", band: "strong", facet: "relationships" },
      { id: "g-draft", text: "I was selected No. 1 overall in the NFL Draft.", band: "giveaway", facet: "career-path" },
      { id: "g-jersey", text: "I wore jersey number 1.", band: "giveaway", facet: "identity" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.filter((clue) => /heisman/i.test(clue.text))).toHaveLength(1);
  });

  it("keeps strongly identifying color such as a signature celebration eligible", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I was a fighter.", band: "broad", facet: "role" },
      { id: "b-era", text: "I fought in the 2020s.", band: "broad", facet: "era" },
      { id: "h-division", text: "I competed at middleweight.", band: "helpful", facet: "role" },
      { id: "h-style", text: "I preferred striking exchanges.", band: "helpful", facet: "style" },
      { id: "h-span", text: "My UFC run lasted several years.", band: "helpful", facet: "era" },
      { id: "s-title", text: "I fought in a UFC title eliminator.", band: "strong", facet: "accomplishments" },
      { id: "s-opponent", text: "I defeated a former UFC champion.", band: "strong", facet: "relationships" },
      {
        id: "s-signature",
        conceptId: "signature-x-celebration",
        text: "I'm known for my signature X celebration.",
        band: "strong",
        facet: "identity",
        identityKnowledge: true,
      },
      { id: "s-generic-style", text: "I was known for solid kickboxing.", band: "strong", facet: "style" },
      { id: "g-record", text: "I set a UFC divisional record.", band: "giveaway", facet: "accomplishments" },
      { id: "g-nickname", text: "I was known by a distinctive nickname.", band: "giveaway", facet: "nickname" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.some((clue) => clue.id === "s-signature")).toBe(true);
    expect(whoAmIClueSelectionClass(clues.find((clue) => clue.id === "s-signature")!)).toBe("sports-identity");
  });

  it("suppresses closely related title-fight count facets", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I was a fighter.", band: "broad", facet: "role" },
      { id: "b-era", text: "I fought in the 2000s.", band: "broad", facet: "era" },
      { id: "h-division", text: "I competed at light heavyweight.", band: "helpful", facet: "role" },
      { id: "h-style", text: "I mixed striking and submissions.", band: "helpful", facet: "style" },
      { id: "h-background", text: "I trained at a well-known MMA camp.", band: "helpful", facet: "background" },
      { id: "h-career", text: "My UFC career lasted several years.", band: "helpful", facet: "era" },
      { id: "title-fights", text: "I competed in 5 UFC title fights.", band: "strong", facet: "accomplishments" },
      { id: "title-wins", text: "I won 5 UFC title fights.", band: "strong", facet: "accomplishments" },
      { id: "s-opponent", text: "I defeated another UFC champion.", band: "strong", facet: "relationships" },
      { id: "s-style", text: "I became known for submissions.", band: "strong", facet: "style" },
      { id: "g-hof", text: "I entered the UFC Hall of Fame.", band: "giveaway", facet: "accomplishments" },
      { id: "g-nickname", text: "I had a famous fight nickname.", band: "giveaway", facet: "nickname" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence.filter((clue) => clue.id === "title-fights" || clue.id === "title-wins")).toHaveLength(1);
  });

  it("sanitizes shared surnames and repeated hidden-subject substitutions generically", () => {
    const clue = whoAmIIdentityKnowledgeClue({
      subjectId: "ufc-alex-smith",
      subjectName: "Alex Smith",
      subjectKind: "fighter",
      league: "UFC",
      factId: "origin-story",
      conceptId: "childhood-foster-ranch",
      value: "Born Alex Jones, Alex Smith left home young before Bob Smith took Alex Smith in at his ranch.",
    });

    expect(clue.text).toMatch(/^I was born under a different surname/i);
    expect(clue.text).toMatch(/Bob took me in/i);
    expect(clue.text).not.toMatch(/this fighter/i);
    expect(clue.text).not.toMatch(/\bAlex\b|\bSmith\b/i);
  });

  it("normalizes residual third-person research prose into first-person game copy", () => {
    const nickname = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-pat-example",
      subjectName: "Pat Example",
      subjectKind: "player",
      league: "NFL",
      factId: "nickname",
      conceptId: "nickname-anytime",
      value: "Pat Example's Miami nickname \"Anytime\" was an homage to his childhood idol Deion Sanders; he later developed a mentor relationship with Sanders.",
    });
    const style = whoAmIIdentityKnowledgeClue({
      subjectId: "ufc-pat-example",
      subjectName: "Pat Example",
      subjectKind: "fighter",
      league: "UFC",
      factId: "style",
      conceptId: "training-style",
      value: "Working with Javier Mendez, Pat Example deliberately diversified his striking, wrestling and submission skills.",
    });
    const coach = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-pat-example-coach",
      subjectName: "Pat Example",
      subjectKind: "coach",
      league: "NFL",
      factId: "first-college-job",
      conceptId: "coaching-path",
      value: "Marv Levy hired Pat Example from the high-school ranks into his first college coaching job.",
    });
    const began = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-pat-example-began",
      subjectName: "Pat Example",
      subjectKind: "player",
      league: "NFL",
      factId: "coaching-start",
      conceptId: "career-coaching-start",
      value: "Despite spending his playing career at cornerback, Pat Example began his NFL coaching career on offense.",
    });
    const credited = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-pat-example-credited",
      subjectName: "Pat Example",
      subjectKind: "player",
      league: "NFL",
      factId: "signature-term",
      conceptId: "signature-term",
      value: "Pat Example is credited with popularizing a football term.",
    });

    expect(nickname.text).toMatch(/^My Miami nickname/);
    expect(nickname.text).toContain("my childhood idol Deion Sanders");
    expect(nickname.text).toContain("I later developed");
    expect(style.text).toContain("I deliberately diversified my striking");
    expect(coach.text).toContain("Marv Levy hired me");
    expect(coach.text).toContain("my first college coaching job");
    expect(began.text).toContain("I began my NFL coaching career");
    expect(credited.text).toContain("I am credited");
    for (const clue of [nickname, style, coach, began, credited]) {
      expect(clue.text).not.toMatch(/\b(?:he|him|his|she)\b/i);
      expect(clue.text).not.toMatch(/\b(?:me began|I is|I has)\b/i);
    }
  });

  it("cleans first-person nickname and action grammar after answer anonymization", () => {
    const nickname = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-deacon-jones",
      subjectName: "Deacon Jones",
      subjectKind: "player",
      league: "NFL",
      factId: "deacon",
      conceptId: "david-to-deacon-self-nickname",
      value: "Born David Jones, he adopted 'Deacon' himself because he wanted a distinctive name.",
    });
    const action = whoAmIIdentityKnowledgeClue({
      subjectId: "nfl-bob-lilly",
      subjectName: "Bob Lilly",
      subjectKind: "player",
      league: "NFL",
      factId: "helmet",
      conceptId: "super-bowl-five-helmet-remorse",
      value: "After losing Super Bowl V, Lilly hurled his helmet in frustration, and Lilly later spoke with embarrassment about the display.",
    });
    const mentor = whoAmIIdentityKnowledgeClue({
      subjectId: "cfb-vince-young",
      subjectName: "Vince Young",
      subjectKind: "player",
      league: "CFB",
      factId: "mentor",
      conceptId: "steve-mcnair-mentor",
      value: "Vince Young connected with Steve McNair while still young through football-camp and family connections, and McNair became a mentor whom Young affectionately called \"Pops.\"",
    });
    const approach = whoAmIIdentityKnowledgeClue({
      subjectId: "ufc:tom-aspinall",
      subjectName: "Tom Aspinall",
      subjectKind: "fighter",
      league: "UFC",
      factId: "influence",
      conceptId: "training-influence",
      value: "Aspinall has named his father as an important influence on how he approaches fighting.",
    });

    expect(nickname.text).not.toMatch(/\b(?:me|my) myself\b/i);
    expect(nickname.text).not.toMatch(/\bI (?:is|has)\b/);
    expect(action.text).toContain("I hurled my helmet");
    expect(action.text).toContain("I later spoke");
    expect(action.text).not.toMatch(/\bme (?:hurled|spoke)\b/i);
    expect(mentor.text.toLowerCase().split(/\W+/)).not.toContain("young");
    expect(mentor.text).toContain("I affectionately called");
    expect(approach.text).toContain("I approach fighting");
  });

  it("varies the single chronology slot across replays instead of stacking chronology", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played defensive back.", band: "broad", facet: "role" },
      { id: "b-era", text: "I was active in the 1980s and 1990s.", band: "broad", facet: "era" },
      { id: "h-span", text: "My NFL career lasted 14 seasons.", band: "helpful", facet: "era" },
      { id: "h-start", text: "My NFL career began in 1985.", band: "helpful", facet: "era" },
      { id: "h-style", text: "I was known for elite closing speed.", band: "helpful", facet: "style" },
      { id: "h-path", text: "I became a long-term franchise starter.", band: "helpful", facet: "career-path" },
      { id: "s-picks", text: "I recorded more than 50 career interceptions.", band: "strong", facet: "production" },
      { id: "s-pro-bowl", text: "I made multiple Pro Bowls.", band: "strong", facet: "accomplishments" },
      { id: "s-team", text: "I became a franchise icon.", band: "strong", facet: "identity" },
      { id: "g-ring", text: "I won a Super Bowl.", band: "giveaway", facet: "accomplishments" },
      { id: "g-hof", text: "I entered the Pro Football Hall of Fame.", band: "giveaway", facet: "identity" },
      { id: "s-draft", text: "I was a first-round NFL draft pick.", band: "strong", facet: "career-path" },
      { id: "h-college", text: "I played college football in Texas.", band: "helpful", facet: "background" },
    ];

    const sequences = Array.from({ length: 16 }, (_value, index) => (
      assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, seededRandom(index + 1))
    ));
    expect(new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|"))).size).toBeGreaterThan(1);
    for (const sequence of sequences) {
      expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "era")).toHaveLength(1);
    }
  });

  it("never selects generic career games or targets when real identity clues are available", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played wide receiver.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2000s.", band: "broad", facet: "era" },
      { id: "h-school", text: "I played college football in the ACC.", band: "helpful", facet: "background" },
      { id: "h-style", text: "I was known for explosive returns.", band: "helpful", facet: "style" },
      { id: "h-path", text: "I became a major special-teams weapon.", band: "helpful", facet: "career-path" },
      { id: "s-all-pro", text: "I was a first-team All-Pro.", band: "strong", facet: "accomplishments" },
      { id: "s-team", text: "I became a franchise icon in Chicago.", band: "strong", facet: "career-path" },
      { id: "s-record", text: "I set a major NFL return record.", band: "strong", facet: "accomplishments" },
      { id: "g-hof", text: "I entered the Pro Football Hall of Fame.", band: "giveaway", facet: "accomplishments" },
      { id: "g-returner", text: "I am remembered as one of football's defining return specialists.", band: "giveaway", facet: "identity" },
      { id: "fact:nfl-career-games", text: "I recorded 156 career games.", band: "helpful", facet: "production" },
      { id: "fact:nfl-career-targets", text: "I recorded 319 career targets.", band: "helpful", facet: "production" },
      { id: "identity:resume-games", text: "I played 295 regular-season NFL games.", band: "helpful", facet: "production", identityKnowledge: true },
      { id: "identity:resume-targets", text: "I had 319 career targets.", band: "helpful", facet: "production", identityKnowledge: true },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.some((clue) => /career-(?:games|targets)$/.test(clue.id))).toBe(false);
    expect(sequence.some((clue) => /regular-season NFL games|career targets/i.test(clue.text))).toBe(false);
  });

  it("can promote a different facet to preserve three strong late anchors", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played defensive back.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 1980s.", band: "broad", facet: "era" },
      { id: "h-style", text: "I was known for elite speed.", band: "helpful", facet: "style" },
      { id: "h-path", text: "I spent my career with one franchise.", band: "helpful", facet: "career-path" },
      { id: "h-background", text: "I also competed in track.", band: "helpful", facet: "background" },
      { id: "h-off-field", text: "I founded a youth charity.", band: "helpful", facet: "off-field" },
      { id: "h-production", text: "I recorded many interceptions.", band: "helpful", facet: "production" },
      { id: "s-pro-bowls", text: "I was selected to seven Pro Bowls.", band: "strong", facet: "accomplishments" },
      { id: "s-franchise", text: "I became a franchise icon in Washington.", band: "strong", facet: "identity" },
      { id: "g-rings", text: "I won two Super Bowl championships.", band: "giveaway", facet: "accomplishments" },
      { id: "g-hof", text: "I entered the Pro Football Hall of Fame.", band: "giveaway", facet: "identity" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length).toBeGreaterThanOrEqual(3);
  });

  it("uses only one chronology slot when the clue pool has enough sports identity depth", () => {
    const clues: WhoAmIClue[] = [
      { id: "b-role", text: "I played quarterback.", band: "broad", facet: "role" },
      { id: "b-era", text: "I played in the 2010s.", band: "broad", facet: "era" },
      { id: "h-start", text: "My NFL career began in 2012.", band: "helpful", facet: "era" },
      { id: "h-school", text: "I played college football in the Big Ten.", band: "helpful", facet: "background" },
      { id: "h-style", text: "I was known for extending plays outside the pocket.", band: "helpful", facet: "style" },
      { id: "h-path", text: "I became a long-term franchise starter.", band: "helpful", facet: "career-path" },
      { id: "s-award", text: "I earned multiple Pro Bowl selections.", band: "strong", facet: "accomplishments" },
      { id: "s-team", text: "I led my team to repeated playoff appearances.", band: "strong", facet: "career-path" },
      { id: "s-production", text: "I threw for more than 30,000 NFL yards.", band: "strong", facet: "production" },
      { id: "g-team", text: "I spent most of my career with one NFC franchise.", band: "giveaway", facet: "career-path" },
      { id: "g-identity", text: "I became one of the defining quarterbacks of my franchise era.", band: "giveaway", facet: "identity" },
    ];

    const sequence = assembleWhoAmIClues(clues, WHO_AM_I_CLUE_LIMIT, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "era")).toHaveLength(1);
  });

  it("keeps shallow CFB stars playable with a late role-and-school identity anchor instead of junk volume", () => {
    const candidate = getFootballWhoAmIUniverse("CFB").candidates.find((entry) => entry.id === "cfb-derrick-johnson");
    expect(candidate).toBeTruthy();
    expect(candidate!.clues.some((clue) => clue.id === "role-school")).toBe(true);

    const sequence = whoAmIProgressiveClues(candidate!.clues, () => 0.5);
    expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
    expect(sequence.some((clue) => /fact:(?:nfl|cfb)-career-(?:games|targets)$/.test(clue.id))).toBe(false);
  });

  it("keeps sports injury and comeback clues in the sports-identity bucket", () => {
    const candidate = getFootballWhoAmIUniverse("NFL").candidates.find((entry) => entry.id === "jason-witten");
    expect(candidate).toBeTruthy();
    const spleenReturn = candidate!.clues.find((clue) => clue.sourceFactId?.includes("lacerated-spleen-return"));
    expect(spleenReturn).toBeTruthy();
    expect(whoAmIClueSelectionClass(spleenReturn!)).toBe("sports-identity");

    for (const seed of [1, 7, 19]) {
      const sequence = whoAmIProgressiveClues(candidate!.clues, seededRandom(seed));
      expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
      expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length).toBeGreaterThanOrEqual(7);
    }
  });

  it("treats defensive-back interceptions as role-relevant sports identity production", () => {
    const candidate = getFootballWhoAmIUniverse("NFL").candidates.find((entry) => entry.id === "nfl-darrell-green");
    expect(candidate).toBeTruthy();
    const interceptions = candidate!.clues.find((clue) => clue.id === "fact:nfl-career-interceptions");
    expect(interceptions).toBeTruthy();
    expect(interceptions!.band).toBe("strong");

    for (const seed of [1, 7, 19]) {
      const sequence = whoAmIProgressiveClues(candidate!.clues, seededRandom(seed));
      expect(sequence.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("repairs the live C.J. Stroud CFB identity and removes the implausible one-game clue", () => {
    const candidate = getFootballWhoAmIUniverse("CFB").candidates.find((entry) => entry.name === "C.J. Stroud");
    expect(candidate).toBeTruthy();
    expect(candidate!.clues.some((clue) => /Ohio State/i.test(clue.text))).toBe(true);
    expect(candidate!.clues.some((clue) => /played college football at Michigan/i.test(clue.text))).toBe(false);
    expect(candidate!.clues.some((clue) => /played in 1 college games/i.test(clue.text))).toBe(false);

    for (const seed of [1, 7, 19]) {
      const sequence = whoAmIProgressiveClues(candidate!.clues, seededRandom(seed));
      expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
      expect(whoAmIClueFacet(sequence.at(-1)!)).not.toBe("production");
    }
  });

  it("keeps Bryce Young family research playable without leaking Young through his father", () => {
    const candidate = getFootballWhoAmIUniverse("CFB").candidates.find((entry) => entry.name === "Bryce Young");
    expect(candidate).toBeTruthy();
    const father = candidate!.clues.find((clue) => clue.sourceFactId?.includes("father-craig-quarterback-tutor"));
    expect(father).toBeTruthy();
    expect(father!.text).not.toMatch(/Craig Young|Bryce Young/i);
    expect(father!.text).not.toMatch(/\bYoung\b/i);
  });
});
