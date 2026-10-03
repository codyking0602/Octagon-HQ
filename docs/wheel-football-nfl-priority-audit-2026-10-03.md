# Wheel of Football — NFL candidate-order audit

**Audit date:** 2026-10-03  
**Teams reviewed:** 32 / 32  
**Primary depth/order reference:** Ourlads 2026 NFL all-team depth charts (current pages updated October 1–2, 2026)  
**Runtime membership/headshot authority:** ESPN current NFL roster endpoint  
**Head-coach cross-check:** NFL.com 2026 coaching tracker and team announcements

The checked-in priority JSON is the product-owned Wheel ordering. Gameplay does **not** call Ourlads. ESPN raw roster order is never treated as depth/importance order. Curated names are matched against the current ESPN team roster; a missing/departed player is omitted rather than replaced with a random backup. Injury, IR, and PUP status do not remove a player when ESPN still lists him on that team's roster.

Locked ceilings are QB 2, RB 3, WR 4, Flex 4, Front Seven 6, Secondary 6, Head Coach 1. Flex is explicitly mixed across RB/WR/TE. Front Seven and Secondary were reviewed as football groups, not provider-row truncations.

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
| DEN | Bo Nix | 2 | 3 | 4 | 6 | 5 | Sean Payton |
| DET | Jared Goff | 2 | 3 | 4 | 6 | 6 | Dan Campbell |
| GB | Jordan Love | 2 | 4 | 4 | 6 | 5 | Matt LaFleur |
| HOU | C.J. Stroud | 2 | 4 | 4 | 6 | 5 | DeMeco Ryans |
| IND | Daniel Jones | 2 | 4 | 4 | 6 | 5 | Shane Steichen |
| JAX | Trevor Lawrence | 2 | 3 | 4 | 6 | 5 | Liam Coen |
| KC | Patrick Mahomes | 2 | 3 | 4 | 6 | 5 | Andy Reid |
| LAC | Justin Herbert | 2 | 3 | 4 | 6 | 5 | Jim Harbaugh |
| LAR | Matthew Stafford | 2 | 3 | 4 | 6 | 5 | Sean McVay |
| LV | Kirk Cousins | 2 | 3 | 4 | 6 | 5 | Klint Kubiak |
| MIA | Malik Willis | 2 | 3 | 4 | 6 | 5 | Jeff Hafley |
| MIN | Kyler Murray | 2 | 3 | 4 | 6 | 5 | Kevin O'Connell |
| NE | Drake Maye | 2 | 4 | 4 | 6 | 5 | Mike Vrabel |
| NO | Tyler Shough | 2 | 3 | 4 | 6 | 5 | Kellen Moore |
| NYG | Jaxson Dart / Jameis Winston | 2 | 3 | 4 | 6 | 6 | John Harbaugh |
| NYJ | Geno Smith | 2 | 3 | 4 | 6 | 5 | Aaron Glenn |
| PHI | Jalen Hurts | 2 | 3 | 4 | 6 | 5 | Nick Sirianni |
| PIT | Aaron Rodgers | 2 | 3 | 4 | 6 | 6 | Mike McCarthy |
| SEA | Sam Darnold | 2 | 3 | 4 | 6 | 6 | Mike Macdonald |
| SF | Brock Purdy | 2 | 4 | 4 | 6 | 5 | Kyle Shanahan |
| TB | Baker Mayfield | 2 | 4 | 4 | 6 | 5 | Todd Bowles |
| TEN | Cam Ward | 2 | 3 | 4 | 6 | 5 | Robert Saleh |
| WSH | Jayden Daniels | 2 | 3 | 4 | 6 | 6 | Dan Quinn |

## Required regression anchors

- Dallas QB: **Dak Prescott**.
- Dallas WR: **George Pickens**, **CeeDee Lamb**, **Ryan Flournoy**.
- Dallas raw ESPN ordering cannot move Sam Howell/Joe Milton or an uncurated depth receiver ahead of those names.
- Arizona intentionally keeps meaningful injured/reserve talent in the owned pool when still team property; the front-seven pool was manually balanced to include DL/EDGE/LB representation rather than blindly taking the first six source rows.

## References

- https://www.ourlads.com/nfldepthcharts/depthcharts.aspx
- https://www.ourlads.com/nfldepthcharts/
- https://www.nfl.com/news/nfl-coaching-gm-tracker-latest-news-interviews-developments-2026-hiring-cycle
