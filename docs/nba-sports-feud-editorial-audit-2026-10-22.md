# NBA Sports Feud — editorial bank expansion audit

**Status:** PR review only. Production and other games unchanged. Rankings are editorial recognition estimates, **not** collected survey results.

| Measure | Baseline | Proposed |
| --- | ---: | ---: |
| Main Round boards | 16 | 43 |
| Fast Money prompts | 32 | 61 |
| **Total** | **48** | **104** |
| Net increase | — | +56 |

**Candidate disposition:** 78 new candidate prompts were authored across editorial passes. **56 retained, 22 rejected** after removing excessively similar prompts, season/award-style specialist questions better handled in Main, or Fast Money categories not instantly answerable. The final bank also retains the original 48 test questions, with off-board lists and aliases corrected. One rejected example was the proposed Fast Money handedness question; one rejected Main example was a second rebound/shot-blocking question duplicating a Fast Money category. The 100/250 prior aspirational targets were explicitly not treated as quotas.

**Editorial priorities:** Eight defensible ranked examples per question, then additional accepted names (off-board scoring). Ranked names are ordered for likely general-fan recognition; there are no fabricated percentage or survey claims. The same seven-question run cannot reuse a category or semantic lane for franchise-alumni, team facts, awards, position, shooting/scoring style, passing, defense, eras, Olympic rosters, or school ties. Fast Money avoids specific Finals rosters, one-season cutoffs, and impossible date recall. The question selector stays deterministic for seeded Daily previews while varying Casual seeds.

**Auditing:** Corrected the 2026 Finals champion (New York Knicks) and Finals MVP (Jalen Brunson), added Brooklyn Nets as a post-2000 finalist franchise, accounted for the 2026 awards (including 6MOY Keldon Johnson and COY Joe Mazzulla), rejected uncertain award names and non-playing franchise associations, and broadened fan nicknames/abbreviations. Ambiguous shared surnames are not conflated. The repo test suite includes a multi-thousand-seed playthrough check with answer-alias collision testing, plus hand-selected fan-answer sentinels.

**Fact sources used for objective boards:**
- https://www.nba.com/awards/2026
- https://www.nba.com/news/history-nba-champions
- https://www.nba.com/news/history-sixth-man-of-the-year-winners
- https://www.nba.com/news/history-coach-of-the-year-winners
- https://www.nba.com/news/history-3-point-contest
- https://www.nba.com/news/history-slam-dunk-contest
- https://www.nba.com/news/jalen-brunson-wins-bill-russell-trophy-as-2026-nba-finals-mvp
- https://pr.nba.com/nba-2012-olympics/
- https://www.usab.com/history/national-team-mens/games-of-the-xxixth-olympiad-2008

The 25 boards below are a review sample only. For each board, the eight ranked names are shown in editorial order; all named extra accepted answers are in source.

## Main Round — 10 review boards

1. **Name an NBA player who has won Finals MVP.**  
   Ranked: 1. Michael Jordan · 2. LeBron James · 3. Kobe Bryant · 4. Stephen Curry · 5. Shaquille O'Neal · 6. Kevin Durant · 7. Tim Duncan · 8. Nikola Jokic  
   Other accepted: 28 additional identities; see bank for all aliases and off-board acceptance.

2. **Name an NBA team that has won an NBA championship.**  
   Ranked: 1. Los Angeles Lakers · 2. Golden State Warriors · 3. Boston Celtics · 4. Chicago Bulls · 5. San Antonio Spurs · 6. Miami Heat · 7. Cleveland Cavaliers · 8. Dallas Mavericks  
   Other accepted: 12 additional identities; see bank for all aliases and off-board acceptance.

3. **Name a team that won an NBA championship between 2010 and 2026.**  
   Ranked: 1. Los Angeles Lakers · 2. Golden State Warriors · 3. Miami Heat · 4. Boston Celtics · 5. Cleveland Cavaliers · 6. Dallas Mavericks · 7. San Antonio Spurs · 8. Milwaukee Bucks  
   Other accepted: 4 additional identities; see bank for all aliases and off-board acceptance.

4. **Name a player on the USA men's 2008 Olympic basketball team.**  
   Ranked: 1. Kobe Bryant · 2. LeBron James · 3. Dwyane Wade · 4. Carmelo Anthony · 5. Chris Paul · 6. Dwight Howard · 7. Chris Bosh · 8. Jason Kidd  
   Other accepted: 4 additional identities; see bank for all aliases and off-board acceptance.

5. **Name a player on the USA men's 2012 Olympic basketball team.**  
   Ranked: 1. LeBron James · 2. Kobe Bryant · 3. Kevin Durant · 4. Carmelo Anthony · 5. Chris Paul · 6. Russell Westbrook · 7. James Harden · 8. Anthony Davis  
   Other accepted: 4 additional identities; see bank for all aliases and off-board acceptance.

6. **Name a famous NBA player who played at Duke.**  
   Ranked: 1. Kyrie Irving · 2. Jayson Tatum · 3. Zion Williamson · 4. Paolo Banchero · 5. Brandon Ingram · 6. Grant Hill · 7. JJ Redick · 8. RJ Barrett  
   Other accepted: 14 additional identities; see bank for all aliases and off-board acceptance.

7. **Name a famous NBA player who played at Kentucky.**  
   Ranked: 1. Anthony Davis · 2. Devin Booker · 3. Shai Gilgeous-Alexander · 4. Karl-Anthony Towns · 5. De'Aaron Fox · 6. John Wall · 7. Bam Adebayo · 8. Jamal Murray  
   Other accepted: 14 additional identities; see bank for all aliases and off-board acceptance.

8. **Name an NBA player who won Sixth Man of the Year.**  
   Ranked: 1. Jamal Crawford · 2. Lou Williams · 3. James Harden · 4. Manu Ginobili · 5. Jason Terry · 6. Tyler Herro · 7. Naz Reid · 8. J.R. Smith  
   Other accepted: 29 additional identities; see bank for all aliases and off-board acceptance.

9. **Name an NBA player whose father also played in the NBA.**  
   Ranked: 1. Stephen Curry · 2. Kobe Bryant · 3. Klay Thompson · 4. Jalen Brunson · 5. Bronny James · 6. Domantas Sabonis · 7. Gary Payton II · 8. Austin Rivers  
   Other accepted: 14 additional identities; see bank for all aliases and off-board acceptance.

10. **Name a famous NBA player who went undrafted.**  
   Ranked: 1. Fred VanVleet · 2. Ben Wallace · 3. Austin Reaves · 4. Alex Caruso · 5. Udonis Haslem · 6. Jeremy Lin · 7. Duncan Robinson · 8. John Starks  
   Other accepted: 12 additional identities; see bank for all aliases and off-board acceptance.

## Fast Money — 15 review boards

1. **Name a famous NBA point guard.**  
   Ranked: 1. Stephen Curry · 2. Magic Johnson · 3. Chris Paul · 4. Kyrie Irving · 5. Russell Westbrook · 6. Ja Morant · 7. Steve Nash · 8. John Stockton  
   Other accepted: 14 additional identities; see bank for all aliases and off-board acceptance.

2. **Name an NBA franchise with an animal in its team name.**  
   Ranked: 1. Chicago Bulls · 2. Milwaukee Bucks · 3. Atlanta Hawks · 4. Minnesota Timberwolves · 5. Memphis Grizzlies · 6. Toronto Raptors · 7. New Orleans Pelicans · 8. Charlotte Hornets  
   Other accepted: 0 additional identities; see bank for all aliases and off-board acceptance.

3. **Name an NBA player famous for shooting threes.**  
   Ranked: 1. Stephen Curry · 2. Klay Thompson · 3. Damian Lillard · 4. Ray Allen · 5. Reggie Miller · 6. James Harden · 7. Kyle Korver · 8. JJ Redick  
   Other accepted: 11 additional identities; see bank for all aliases and off-board acceptance.

4. **Name an NBA player known for spectacular dunks.**  
   Ranked: 1. Vince Carter · 2. Michael Jordan · 3. LeBron James · 4. Blake Griffin · 5. Ja Morant · 6. Zion Williamson · 7. Dominique Wilkins · 8. Aaron Gordon  
   Other accepted: 12 additional identities; see bank for all aliases and off-board acceptance.

5. **Name a famous NBA head coach.**  
   Ranked: 1. Phil Jackson · 2. Steve Kerr · 3. Gregg Popovich · 4. Erik Spoelstra · 5. Doc Rivers · 6. Tyronn Lue · 7. Rick Carlisle · 8. Pat Riley  
   Other accepted: 14 additional identities; see bank for all aliases and off-board acceptance.

6. **Name a famous NBA star born outside the United States.**  
   Ranked: 1. Giannis Antetokounmpo · 2. Nikola Jokic · 3. Luka Doncic · 4. Dirk Nowitzki · 5. Victor Wembanyama · 6. Joel Embiid · 7. Yao Ming · 8. Steve Nash  
   Other accepted: 26 additional identities; see bank for all aliases and off-board acceptance.

7. **Name a famous former NBA player who became a basketball TV analyst.**  
   Ranked: 1. Charles Barkley · 2. Shaquille O'Neal · 3. Kenny Smith · 4. Reggie Miller · 5. Richard Jefferson · 6. Kendrick Perkins · 7. Grant Hill · 8. Vince Carter  
   Other accepted: 11 additional identities; see bank for all aliases and off-board acceptance.

8. **Name an NBA player famous for making free throws.**  
   Ranked: 1. Stephen Curry · 2. Kevin Durant · 3. Dirk Nowitzki · 4. Steve Nash · 5. Damian Lillard · 6. Ray Allen · 7. Reggie Miller · 8. Chris Paul  
   Other accepted: 10 additional identities; see bank for all aliases and off-board acceptance.

9. **Name an NBA player famous for a step-back jump shot.**  
   Ranked: 1. James Harden · 2. Luka Doncic · 3. Stephen Curry · 4. Kyrie Irving · 5. Damian Lillard · 6. Jayson Tatum · 7. Trae Young · 8. Shai Gilgeous-Alexander  
   Other accepted: 7 additional identities; see bank for all aliases and off-board acceptance.

10. **Name an NBA player known for wearing a headband.**  
   Ranked: 1. LeBron James · 2. Carmelo Anthony · 3. Allen Iverson · 4. Ben Wallace · 5. Rasheed Wallace · 6. Rajon Rondo · 7. DeMarcus Cousins · 8. Jimmy Butler  
   Other accepted: 8 additional identities; see bank for all aliases and off-board acceptance.

11. **Name an NBA player known for arguing with referees or getting technical fouls.**  
   Ranked: 1. Draymond Green · 2. Rasheed Wallace · 3. DeMarcus Cousins · 4. Luka Doncic · 5. Russell Westbrook · 6. Kevin Garnett · 7. Charles Barkley · 8. Dennis Rodman  
   Other accepted: 9 additional identities; see bank for all aliases and off-board acceptance.

12. **Name an NBA player known for a signature fadeaway jumper.**  
   Ranked: 1. Michael Jordan · 2. Kobe Bryant · 3. Dirk Nowitzki · 4. Kevin Durant · 5. Carmelo Anthony · 6. DeMar DeRozan · 7. Kawhi Leonard · 8. Hakeem Olajuwon  
   Other accepted: 7 additional identities; see bank for all aliases and off-board acceptance.

13. **Name an NBA player famous for being exceptionally tall.**  
   Ranked: 1. Victor Wembanyama · 2. Yao Ming · 3. Shaquille O'Neal · 4. Manute Bol · 5. Boban Marjanovic · 6. Tacko Fall · 7. Shawn Bradley · 8. Gheorghe Muresan  
   Other accepted: 8 additional identities; see bank for all aliases and off-board acceptance.

14. **Name an NBA player known for hustle and effort.**  
   Ranked: 1. Dennis Rodman · 2. Draymond Green · 3. Josh Hart · 4. Marcus Smart · 5. Alex Caruso · 6. Jimmy Butler · 7. Jrue Holiday · 8. Patrick Beverley  
   Other accepted: 8 additional identities; see bank for all aliases and off-board acceptance.

15. **Name an NBA player famous for making tough layups.**  
   Ranked: 1. Kyrie Irving · 2. LeBron James · 3. Stephen Curry · 4. Derrick Rose · 5. Ja Morant · 6. Dwyane Wade · 7. Michael Jordan · 8. Tony Parker  
   Other accepted: 9 additional identities; see bank for all aliases and off-board acceptance.
