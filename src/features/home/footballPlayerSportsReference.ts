import type { FootballSpotlightKind } from "./footballPlayerSpotlightSchedule";

/** Verified 2026 player identities; never guess a same-name slug. */
const CFB: Record<string,string> = {
 "Drew Mestemaker":"drew-mestemaker-1",
 "Trinidad Chambliss":"trinidad-chambliss-1",
 "Jeremiah Smith":"jeremiah-smith-2",
 "Jamal Roberts":"jamal-roberts-2",
 "LaNorris Sellers":"lanorris-sellers-1",
};
const NFL: Record<string,string> = {
 "Josh Allen":"A/AlleJo02", "Dak Prescott":"P/PresDa01",
 "Bijan Robinson":"R/RobiBi01", "Tetairoa McMillan":"M/McMiTe00",
 "Drake Maye":"M/MayeDr00",
};
export function footballPlayerSportsReferenceUrl(name:string,kind:FootballSpotlightKind) {
 const clean=name.trim();
 return kind==="cfb" ? CFB[clean]
   ? `https://www.sports-reference.com/cfb/players/${CFB[clean]}.html`
   : `https://www.sports-reference.com/cfb/search/search.fcgi?search=${encodeURIComponent(clean)}`
   : NFL[clean]
   ? `https://www.pro-football-reference.com/players/${NFL[clean]}.htm`
   : `https://www.pro-football-reference.com/search/search.fcgi?search=${encodeURIComponent(clean)}`;
}
