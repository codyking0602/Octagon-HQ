import type { SportsFeudAuthoredAnswer, SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

/**
 * FUTURE-ONLY Football Sports Feud editorial rebuild.
 * These are independently authored concepts, NOT five wordings per topic.
 * Historical IDs and the live v1 publisher are intentionally untouched.
 *
 * Format: id|entityKind|semanticLane|prompt|eight ranked examples|additional valid examples
 * A ~ joins a canonical name and recognized aliases; commas separate answer entities.
 * The ranked ladder reflects editorial recognizability, never actual survey results.
 */

/**
 * Fan-language shorthand for fully identified people/schools in the staged bank.
 * Do not use ambiguous global nicknames such as "Tigers" or "Bulldogs".
 * Question-level identity collisions are still handled by the scorer.
 */
const COMMON_REBUILD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "Robert Griffin III": ["RG3", "RGIII"],
  "Jaxon Smith-Njigba": ["JSN"],
  "J.J. Watt": ["JJ Watt"],
  "Ja'Marr Chase": ["Jamar Chase"],
  "JJ McCarthy": ["J.J. McCarthy"],
  "Patrick Surtain II": ["Pat Surtain", "Patrick Surtain 2"],
  "Ohio State": ["Buckeyes", "Ohio St", "OSU"],
  "Indiana": ["Hoosiers"],
  "Georgia": ["UGA", "Georgia Bulldogs"],
  "Texas Tech": ["Red Raiders"],
  "Oregon": ["Ducks"],
  "Ole Miss": ["Rebels"],
  "Alabama": ["Bama", "Crimson Tide"],
  "Miami": ["The U", "Miami Hurricanes"],
  "Oklahoma": ["OU", "Sooners"],
  "Tulane": ["Green Wave"],
  "James Madison": ["JMU", "James Madison Dukes"],
  "Texas A&M": ["TAMU", "Aggies"],
  "USC": ["Southern Cal", "USC Trojans"],
  "UCLA": ["Bruins"],
  "Penn State": ["PSU", "Nittany Lions"],
  "Notre Dame": ["Fighting Irish"],
  "LSU": ["Louisiana State"],
  "Clemson": ["Clemson Tigers"],
  "Washington": ["Washington Huskies"],
  "Florida State": ["FSU", "Seminoles"],
  "Florida": ["Gators"],
  "Michigan": ["Wolverines"],
  "Texas": ["Longhorns"],
  "Arizona State": ["Sun Devils"],
  "California": ["Cal"],
  "Stanford": ["Stanford Cardinal"],
  "Boise State": ["Boise Broncos"],
  "SMU": ["Southern Methodist"],
  "BYU": ["Brigham Young"],
  "Wisconsin": ["Badgers"],
};

export function parseFootballRebuildRows(
  domain: "nfl" | "cfb",
  round: "main" | "fast",
  lines: readonly string[],
): SportsFeudAuthoredQuestion[] {
  return lines.map((line) => {
    const pieces = line.split("|");
    if (pieces.length !== 6) throw new Error("Malformed rebuild row: " + line.slice(0, 80));
    const [stem, kind, lane, prompt, eight, additional] = pieces;
    if (!stem || !kind || !lane || !prompt || !eight || !additional) {
      throw new Error("Incomplete rebuild question: " + stem);
    }
    if (!["person", "team", "school", "other"].includes(kind)) {
      throw new Error("Invalid rebuild answer type: " + stem);
    }
    const parseAnswers = (value: string): SportsFeudAuthoredAnswer[] =>
      value.split(",").map((raw) => {
        const [name, ...aliases] = raw.split("~").map((item) => item.trim());
        if (!name) throw new Error("Empty answer on " + stem);
        const common = COMMON_REBUILD_ALIASES[name] ?? [];
        const merged = [...new Set([...aliases, ...common])].filter((alias) => alias !== name);
        return merged.length ? { name, aliases: merged } : { name };
      });
    const ranked = parseAnswers(eight);
    const accepted = parseAnswers(additional);
    if (ranked.length !== 8 || accepted.length < 3) {
      throw new Error("Rebuild board must have eight ranked and three-plus off-board answers: " + stem);
    }
    const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const uniqueNames = [...ranked, ...accepted].map((row) => normalized(row.name));
    if (new Set(uniqueNames).size !== uniqueNames.length) {
      throw new Error("Duplicate answer identity in rebuild: " + stem);
    }
    return {
      id: `${domain}-feud-r2-${round}-${stem}`,
      category: lane,
      collisionGroup: lane,
      entityKind: kind as SportsFeudAuthoredQuestion["entityKind"],
      prompt,
      answers: ranked,
      alsoAcceptedAnswers: accepted,
    };
  });
}
