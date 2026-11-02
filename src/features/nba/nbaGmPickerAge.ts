/**
 * Verified birthdates for the 29 NBA GM catalog members whose server ageAtStart
 * is currently null. These are display-only fallbacks, NEVER a gameplay input.
 * Each entry is sourced to an official NBA player/draft profile unless noted.
 * Match server's launch-date age convention: October 30, 2026.
 *
 * Do not replace the backend age when it is present. Remove an entry only after
 * verifying that the authoritative catalog now supplies that player's age.
 */
export const NBA_GM_PICKER_VERIFIED_BIRTHDATES: Readonly<Record<string, string>> = {
  "nba-gm-draft-kingstonflemings": "2007-01-03", // nba.com/player/1643412
  "nba-gm-draft-mikelbrown": "2006-04-03", // nba.com/player/1643414
  "nba-gm-draft-hannessteinbach": "2006-05-01", // nba.com/player/1643419
  "nba-gm-draft-calebwilson": "2006-07-18", // nba.com/player/1643410
  "nba-gm-draft-mariohezonja": "1995-02-25", // nba.com/player/1626209
  "nba-gm-draft-meleekthomas": "2006-08-06", // basketball-reference.com/players/t/thomame01.html
  "nba-gm-draft-kyrieirving": "1992-03-23", // nba.com/player/202681
  "nba-gm-draft-morezjohnson": "2006-01-25", // nba.com/player/1643516
  "nba-gm-draft-trevonbrazile": "2003-01-07", // nba.com/player/1642350
  "nba-gm-draft-brucethornton": "2003-09-14", // nba.com/player/1643570
  "nba-gm-draft-fredvanvleet": "1994-02-25", // nba.com/player/1627832
  "nba-gm-draft-bradensmith": "2003-07-25", // basketball-reference.com/players/s/smithbr01.html
  "nba-gm-draft-tyresehaliburton": "2000-02-29", // nba.com/player/1630169
  "nba-gm-draft-babamiller": "2004-02-07", // nba.com/draft/2026/prospects/baba-miller
  "nba-gm-draft-keatonwagler": "2007-02-03", // nba.com/player/1643413
  "nba-gm-draft-cameronboozer": "2007-07-18", // nba.com/player/1643409
  "nba-gm-draft-braydenburries": "2005-09-18", // nba.com/draft/2026/prospects/brayden-burries
  "nba-gm-draft-nateament": "2006-12-10", // nba.com/player/1643417
  "nba-gm-draft-treylyles": "1995-11-05", // nba.com/player/1626168
  "nba-gm-draft-adaymara": "2005-04-07", // nba.com/player/1643530
  "nba-gm-draft-joshdix": "2004-06-29", // nba.com/player/1643717
  "nba-gm-draft-thomassorber": "2005-12-25", // nba.com/player/1642850
  "nba-gm-draft-labaronphilon": "2005-11-24", // nba.com/player/1642889
  "nba-gm-draft-damianlillard": "1990-07-15", // nba.com/player/203081
  "nba-gm-draft-dariusacuff": "2006-11-16", // nba.com/player/1643411
  "nba-gm-draft-tarrisreed": "2003-08-05", // nba.com/player/1643542
  "nba-gm-draft-allengraves": "2006-07-28", // nba.com/player/1643512
  "nba-gm-draft-darrynpeterson": "2007-01-17", // nba.com/player/1643408
  "nba-gm-draft-ajdybantsa": "2007-01-29", // nba.com/player/1643407
};

export function nbaGmPickerAge(player: { id: string; ageAtStart?: number | null }): number | null {
  // The server's verified birthdate is always authoritative.
  if (Number.isInteger(player.ageAtStart) && player.ageAtStart! >= 18 && player.ageAtStart! <= 50) {
    return player.ageAtStart!;
  }
  const birthdate = NBA_GM_PICKER_VERIFIED_BIRTHDATES[player.id];
  if (!birthdate) return null; // Never guess an unverified age.
  const [year, month, day] = birthdate.split("-").map(Number);
  const age = 2026 - year - (month > 10 || (month === 10 && day > 30) ? 1 : 0);
  return age >= 18 && age <= 50 ? age : null;
}
