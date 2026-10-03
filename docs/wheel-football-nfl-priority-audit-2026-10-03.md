# Wheel of Football — NFL candidate-order audit

**Audit date:** 2026-10-03  
**Teams manually reviewed:** 32 / 32  
**Final reconciliation:** 31 teams changed from the pre-split PR state; 108 roster-slot groups changed; Dallas remained unchanged after independent re-audit.  
**Primary human depth/structure reference:** Ourlads 2026 NFL depth charts  
**Runtime membership / ID / headshot authority:** ESPN current NFL roster endpoint  
**Ambiguity cross-checks:** official team and NFL roster/transaction/coaching sources

## Locked source philosophy

The checked-in JSON is Octagon-owned Wheel priority. Gameplay does **not** call Ourlads. Ourlads is used only as a human audit/reference source. ESPN remains the runtime authority for whether a player is currently on the team and for player IDs/headshots, but ESPN raw roster order is **not** treated as football importance.

At runtime, curated names are matched against the current ESPN team roster. A curated player who has departed is omitted. The shortlist is **not** padded with a random raw-ESPN backup just to hit a quota. Injury, IR, PUP, NFI, or short-term suspension status does not remove an established player while he remains current team property.

Locked ceilings: **QB 2, RB 3, WR 4, Flex 4, Front Seven 6, Secondary 6, Head Coach 1**. Normal targets remain QB 1, RB 2, WR 3, Front Seven 5, Secondary 5, with expansion only when football context warrants it. Flex is intentionally mixed across meaningful RB/WR/TE options. Front Seven and Secondary are football-sensible DL/EDGE/LB and CB/S mixes rather than source-row truncations.

## Final 32-team coverage

| Team | QB priority | RB | WR | Flex | Front Seven | Secondary | Head Coach |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| ARI | Jacoby Brissett | 3 | 3 | 4 | 6 | 6 | Mike LaFleur |
| ATL | Michael Penix Jr. | 2 | 3 | 4 | 6 | 6 | Kevin Stefanski |
| BAL | Lamar Jackson | 2 | 3 | 4 | 6 | 5 | Jesse Minter |
| BUF | Josh Allen | 2 | 3 | 4 | 6 | 5 | Joe Brady |
| CAR | Bryce Young | 2 | 3 | 4 | 6 | 6 | Dave Canales |
| CHI | Caleb Williams | 2 | 3 | 4 | 6 | 6 | Ben Johnson |
| CIN | Joe Burrow | 2 | 3 | 4 | 6 | 5 | Zac Taylor |
| CLE | Deshaun Watson | 2 | 3 | 4 | 6 | 5 | Todd Monken |
| DAL | Dak Prescott | 2 | 3 | 4 | 6 | 5 | Brian Schottenheimer |
| DEN | Bo Nix | 2 | 4 | 4 | 6 | 5 | Sean Payton |
| DET | Jared Goff | 2 | 3 | 4 | 6 | 5 | Dan Campbell |
| GB | Jordan Love | 2 | 3 | 4 | 6 | 5 | Matt LaFleur |
| HOU | C.J. Stroud | 2 | 4 | 4 | 6 | 5 | DeMeco Ryans |
| IND | Daniel Jones | 2 | 4 | 4 | 6 | 5 | Shane Steichen |
| JAX | Trevor Lawrence | 2 | 4 | 4 | 6 | 5 | Liam Coen |
| KC | Patrick Mahomes | 2 | 3 | 4 | 6 | 5 | Andy Reid |
| LAC | Justin Herbert | 2 | 3 | 4 | 6 | 5 | Jim Harbaugh |
| LAR | Matthew Stafford | 2 | 3 | 4 | 6 | 5 | Sean McVay |
| LV | Kirk Cousins / Fernando Mendoza | 2 | 3 | 4 | 6 | 5 | Klint Kubiak |
| MIA | Malik Willis | 2 | 3 | 4 | 6 | 5 | Jeff Hafley |
| MIN | Kyler Murray | 2 | 3 | 4 | 6 | 5 | Kevin O'Connell |
| NE | Drake Maye | 2 | 4 | 4 | 6 | 5 | Mike Vrabel |
| NO | Tyler Shough | 2 | 3 | 4 | 6 | 5 | Kellen Moore |
| NYG | Jaxson Dart / Jameis Winston | 2 | 3 | 4 | 6 | 6 | John Harbaugh |
| NYJ | Geno Smith | 2 | 3 | 4 | 6 | 5 | Aaron Glenn |
| PHI | Jalen Hurts | 2 | 3 | 4 | 6 | 5 | Nick Sirianni |
| PIT | Aaron Rodgers | 2 | 3 | 4 | 6 | 5 | Mike McCarthy |
| SEA | Sam Darnold | 2 | 3 | 4 | 6 | 6 | Mike Macdonald |
| SF | Brock Purdy | 2 | 4 | 4 | 6 | 6 | Kyle Shanahan |
| TB | Baker Mayfield | 2 | 4 | 4 | 6 | 5 | Todd Bowles |
| TEN | Cam Ward | 2 | 3 | 4 | 6 | 5 | Robert Saleh |
| WSH | Jayden Daniels | 2 | 3 | 4 | 6 | 6 | Dan Quinn |

## Four-chat manual audit reconciliation

All four 8-team manual audits were recovered and reconciled:

- AFC East + AFC North: BUF, MIA, NE, NYJ, BAL, CIN, CLE, PIT.
- AFC South + AFC West: HOU, IND, JAX, TEN, DEN, KC, LV, LAC.
- NFC East + NFC North: DAL, NYG, PHI, WSH, CHI, DET, GB, MIN.
- NFC South + NFC West: ATL, CAR, NO, TB, ARI, LAR, SF, SEA.

Every team was reviewed for QB, RB, WR, Flex, Front Seven, Secondary, and Head Coach. The split audits used current depth/structure and roster/transaction evidence instead of rubber-stamping generated Ourlads row order.

## Important manual corrections

- **Dallas:** independent split-audit agreed with the earlier spot-audit. Dak Prescott remains the sole QB priority; CeeDee Lamb precedes George Pickens; the curated defensive groups remain unchanged.
- **Rams:** independent split-audit agreed with the earlier spot-audit except the secondary. **Kam Curl replaces Josh Wallace**; the rest of the Rams list remains unchanged.
- **AFC East/North:** Bradley Chubb added for Buffalo; Zach Sieler/Jordan Phillips for Miami; Christian Elliss for New England; Will McDonald IV and Kenyon Sadiq for the Jets; Mason Graham/Maliek Collins for Cleveland; Alex Highsmith for Pittsburgh. Baltimore and Cincinnati primarily needed priority/Flex corrections.
- **AFC South/West:** Houston's front seven was rebuilt around established contributors; Indianapolis removes Laquon Treadwell and adds Darius Slayton; Jacksonville adds Travis Hunter to WR/Flex; Tennessee restores Jeffery Simmons/John Franklin-Myers/Keldric Faulk; Denver adds Marvin Mims Jr. and Nik Bonitto; Kansas City elevates Rashee Rice/Chris Jones/L'Jarius Sneed and adds Peter Woods; Las Vegas adds Fernando Mendoza/Jack Bech/Adam Butler; the Chargers restore Khalil Mack/Daiyan Henley and put Ladd McConkey/Derwin James Jr. at the front of their groups.
- **NFC East/North:** New York restores Kayvon Thibodeaux/Tremaine Edmunds; Philadelphia adds Jalyx Hunt; Washington adds Odafe Oweh/Sonny Styles/Mike Sainristil; Chicago adds Grady Jarrett/Austin Booker/Tyrique Stevenson Sr.; Detroit adds Alim McNeill/Tyleik Williams/Kerby Joseph; Green Bay adds Zaire Franklin and trims the WR pool; Minnesota adds Andrew Van Ginkel.
- **NFC South/West:** Atlanta elevates James Pearce Jr./Za'Darius Smith and keeps second-year playmaker Billy Bowman Jr. in the secondary priority; Carolina promotes Jalen Coker and uses Darren Waller/Princely Umanmielen; New Orleans restores Alvin Kamara plus Chase Young/Cameron Jordan/Pete Werner; Tampa Bay restores Yaya Diaby and leads the secondary with Antoine Winfield Jr.; Arizona adds Tyler Allgeier/Zaven Collins and leads with Budda Baker; San Francisco replaces Matthew Judon with Osa Odighizuwa and adds Malik Mustapha; Seattle elevates Jadarian Price and Derick Hall.

## Final integration cross-check

The recovered split-audit outputs were compared against the then-current PR integration. That last reconciliation corrected **3 teams / 5 groups**: Cincinnati Secondary ordering, Pittsburgh Secondary ordering, and Atlanta Flex / Front Seven / Secondary. Pittsburgh's final manual set is the five-player group Jalen Ramsey / Jamel Dean / Asante Samuel Jr. / DeShon Elliott / Jaquan Brisker. Dallas matched both audits. The Rams independent audit overruled the earlier spot-audit only by replacing Josh Wallace with Kam Curl.

## Required regression anchors

- Dallas QB shortlist is **Dak Prescott**, even if raw ESPN order presents another quarterback first.
- Dallas WR order is **CeeDee Lamb → George Pickens → Ryan Flournoy**.
- Rams secondary is **Trent McDuffie → Quentin Lake → Kam Curl → Jaylen Watson → Kamren Kinchens**.
- An injured/current-team curated star remains eligible because temporary depth/injury metadata is ignored for priority.
- A departed/missing curated player is omitted rather than backfilled from raw ESPN roster order.
- All 32 teams contain every required Wheel group and obey the locked caps.

## References

- https://www.ourlads.com/nfldepthcharts/depthcharts.aspx
- https://www.ourlads.com/nfldepthcharts/
- https://www.nfl.com/news/nfl-coaching-gm-tracker-latest-news-interviews-developments-2026-hiring-cycle
