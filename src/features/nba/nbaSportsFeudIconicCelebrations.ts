/** Canonical signature-celebration board. Editorial recognition rankings, not survey data.
 * Use the same small constants in authoring and the lean published-pack grader. */
export const NBA_FEUD_CELEBRATION_QUESTION_ID = "nba-feud-famous-celebrations";

export const NBA_FEUD_CELEBRATION_RANKED = [
  "Dikembe Mutombo",     // finger wag
  "Stephen Curry",       // Night Night / shimmy
  "Damian Lillard",      // Dame Time wrist tap
  "Carmelo Anthony",     // three to the dome
  "Michael Jordan",      // The Shrug
  "LeBron James",        // The Silencer
  "Russell Westbrook",   // Rock the Baby
  "D'Angelo Russell",    // Ice in My Veins
] as const;

export const NBA_FEUD_CELEBRATION_UNRANKED = [
  "James Harden",        // stirring the pot
  "Reggie Miller",       // choke sign
  "Trae Young",          // bow / shushing
  "Jamal Murray",        // Blue Arrow
  "Jalen Brunson",       // three-finger mask
  "Klay Thompson",       // three goggles
  "Joel Embiid",         // airplane
  "Dwyane Wade",         // This Is My House
  "Kobe Bryant",
  "Shaquille O'Neal",
  "Anthony Edwards",
  "Giannis Antetokounmpo",
  "Draymond Green",
  "Kyrie Irving",
] as const;

/** Signature terms are valid only on this celebration board, not every player board. */
export const NBA_FEUD_CELEBRATION_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "Dikembe Mutombo": ["Deke", "Mutumbo", "Dikembe Mutumbo", "Finger wag", "Finger wagging"],
  "Stephen Curry": ["Steph Curry", "Steph", "Chef Curry", "Night Night", "Night-night", "Shimmy", "Curry Shimmy"],
  "Damian Lillard": ["Dame", "Dame Time", "Wrist tap", "Pointing to wrist"],
  "Carmelo Anthony": ["Melo", "Three to the dome", "3 to the dome"],
  "Michael Jordan": ["MJ", "Air Jordan", "The Shrug", "Shrug"],
  "LeBron James": ["LeBron", "King James", "The Silencer", "Silencer"],
  "Russell Westbrook": ["Russ", "Brodie", "Rock the baby", "Rocking the baby"],
  "D'Angelo Russell": ["D-Lo", "D Lo", "Ice in My Veins", "Ice in veins"],
  "James Harden": ["The Beard", "Stirring the pot", "Cooking"],
  "Reggie Miller": ["Choke sign", "Choke gesture"],
  "Trae Young": ["Ice Trae", "Shushing", "The Bow"],
  "Jamal Murray": ["Blue Arrow"],
  "Jalen Brunson": ["Three-finger mask", "3 finger mask"],
  "Klay Thompson": ["Klay", "Three goggles", "3 goggles"],
  "Joel Embiid": ["The Process", "Airplane celebration", "Airplane"],
  "Dwyane Wade": ["D Wade", "D-Wade", "This Is My House"],
};
