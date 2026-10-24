# UFC Sports Feud rebuilding — distinct-question authoring batch 2

Review date: October 23, 2026. Source reviewed against current production `main` at the start of work and existing private draft work on this branch. **Branch only: no app publishing, current selector changes, source-bank deletions, historical rewrites, scoring changes, or deployments.**

## Summary

- **17 new authored concepts:** 5 Main and 12 Fast Money, each drafted once rather than five phrasings.
- **11 advancing to independent factual + acceptance validation:** 3 Main + 8 Fast Money.
- **Six on hold:** 2 Main for concept collisions and 4 Fast for historical overlap, subjective grading, or being too specialist for 50 seconds.
- **Across batches 1 and 2:** 43 authored concepts, 33 preliminary advancing, 10 held. Those 33 are **not yet independently verified as final bank questions**.
- **Initial 350 authored prompts remain untouched**. Of their 70 underlying concept families, 20 were keep, 31 rewrite, 19 retire. Even if all eligible concepts survive, filling a robust 70-Main/140-Fast inventory needs additional genuinely different topics, better alias/factual review and future-only no-repeat selection.

## Specific factual repairs made during authoring

1. Removed **Rob McCullough** from the WEC-titleholder-to-UFC list after checking the fight history, because we could not confirm he subsequently fought a UFC event. Replaced with **Steve Cantwell**, whose WEC title and UFC debut are documented on UFC.com. See https://www.ufc.com/news/wec-champ-cantwell-gets-fresh-start-ufc.
2. Expanded early UFC tournament winners to include **Pat Miletich**, **Jerry Bohlander**, and **Guy Mezger** using UFC history references. Early tournaments used multiple weight class / alternate brackets; confirm all valid winners before release, not just the familiar eight.
3. The nickname question has expanded to **50 specifically authored, recognizable answers**, alongside accepted fighter names and common variations. This is a repaired nickname concept; the old `ufc-main-12-5` asked for a nickname with an entirely unrelated gym answer set and remains retired from future use.
4. Removed the **Wales** alias from the UK host-country answer. A UFC event in England or Scotland should not make an unverified event in Wales count as fact. Countries, cities and nations are separate categories; do not silently broaden these labels.
5. Merged synonyms such as **closed guard** into their appropriate original answer rather than letting two scored rows represent one thing. Similarly **combat sambo** and **higher pay** are aliases/duplicates rather than a second scored choice.

## Main Round draft candidates

| Stable draft ID | Original prompt | First review | Extra answers |
|---|---|---|---:|
| `ufc-v2-main2-olympic-athletes` | /N/a/m/e/ /a/ /U/F/C/ /f/i/g/h/t/e/r/ /w/h/o/ /a/l/s/o/ /c/o/m/p/e/t/e/d/ /a/t/ /t/h/e/ /O/l/y/m/p/i/c/ /G/a/m/e/s/./ | **ADVANCE (subject to verification)** | 6 |
| `ufc-v2-main2-early-tournaments` | /N/a/m/e/ /a/ /f/i/g/h/t/e/r/ /w/h/o/ /w/o/n/ /a/ /U/F/C/ /t/o/u/r/n/a/m/e/n/t/ /d/u/r/i/n/g/ /t/h/e/ /p/r/o/m/o/t/i/o/n/'/s/ /e/a/r/l/y/ /t/o/u/r/n/a/m/e/n/t/ /e/r/a/./ | **ADVANCE (subject to verification)** | 7 |
| `ufc-v2-main2-wec-champions` | /N/a/m/e/ /a/ /f/i/g/h/t/e/r/ /w/h/o/ /h/e/l/d/ /a/ /W/E/C/ /c/h/a/m/p/i/o/n/s/h/i/p/ /a/n/d/ /l/a/t/e/r/ /f/o/u/g/h/t/ /i/n/ /t/h/e/ /U/F/C/./ | **ADVANCE (subject to verification)** | 4 |
| `ufc-v2-main2-strikeforce-champions` | /N/a/m/e/ /a/ /f/i/g/h/t/e/r/ /w/h/o/ /w/o/n/ /a/ /S/t/r/i/k/e/f/o/r/c/e/ /c/h/a/m/p/i/o/n/s/h/i/p/ /a/n/d/ /a/l/s/o/ /f/o/u/g/h/t/ /i/n/ /t/h/e/ /U/F/C/./ | **HOLD** | 8 |
| `ufc-v2-main2-hof-fight-wing` | /N/a/m/e/ /a/ /U/F/C/ /f/i/g/h/t/e/r/ /w/h/o/ /a/p/p/e/a/r/e/d/ /i/n/ /a/ /b/o/u/t/ /i/n/d/u/c/t/e/d/ /i/n/t/o/ /t/h/e/ /U/F/C/ /H/a/l/l/ /o/f/ /F/a/m/e/'/s/ /F/i/g/h/t/ /W/i/n/g/./ | **HOLD** | 14 |

## Fast Money draft candidates

| Stable draft ID | Original prompt | First review | Extra answers |
|---|---|---|---:|
| `ufc-v2-fast2-nicknames` | /N/a/m/e/ /a/ /f/a/m/o/u/s/ /U/F/C/ /f/i/g/h/t/e/r/ /n/i/c/k/n/a/m/e/./ | **ADVANCE (subject to verification)** | 42 |
| `ufc-v2-fast2-defensive-moves` | /N/a/m/e/ /a/ /d/e/f/e/n/s/i/v/e/ /m/o/v/e/ /a/ /U/F/C/ /f/i/g/h/t/e/r/ /m/i/g/h/t/ /u/s/e/ /t/o/ /a/v/o/i/d/ /a/ /s/t/r/i/k/e/ /o/r/ /t/a/k/e/d/o/w/n/./ | **ADVANCE (subject to verification)** | 15 |
| `ufc-v2-fast2-injury-body-parts` | /N/a/m/e/ /a/ /p/a/r/t/ /o/f/ /a/ /U/F/C/ /f/i/g/h/t/e/r/'/s/ /b/o/d/y/ /t/h/a/t/ /c/o/u/l/d/ /b/e/ /i/n/j/u/r/e/d/ /i/n/ /a/ /f/i/g/h/t/./ | **ADVANCE (subject to verification)** | 17 |
| `ufc-v2-fast2-combat-disciplines` | /N/a/m/e/ /a/ /m/a/r/t/i/a/l/ /a/r/t/ /o/r/ /c/o/m/b/a/t/ /s/p/o/r/t/ /c/o/m/m/o/n/l/y/ /t/r/a/i/n/e/d/ /b/y/ /U/F/C/ /f/i/g/h/t/e/r/s/./ | **HOLD** | 9 |
| `ufc-v2-fast2-event-countries` | /N/a/m/e/ /a/ /c/o/u/n/t/r/y/ /w/h/e/r/e/ /t/h/e/ /U/F/C/ /h/a/s/ /h/e/l/d/ /a/ /f/i/g/h/t/ /c/a/r/d/./ | **ADVANCE (subject to verification)** | 17 |
| `ufc-v2-fast2-ground-positions` | /N/a/m/e/ /a/ /g/r/a/p/p/l/i/n/g/ /p/o/s/i/t/i/o/n/ /c/o/m/m/e/n/t/a/t/o/r/s/ /m/e/n/t/i/o/n/ /d/u/r/i/n/g/ /U/F/C/ /g/r/o/u/n/d/ /f/i/g/h/t/i/n/g/./ | **HOLD** | 9 |
| `ufc-v2-fast2-corner-shouts` | /N/a/m/e/ /s/o/m/e/t/h/i/n/g/ /a/ /f/i/g/h/t/e/r/'/s/ /c/o/r/n/e/r/ /m/i/g/h/t/ /s/h/o/u/t/ /a/s/ /a/d/v/i/c/e/ /d/u/r/i/n/g/ /a/ /U/F/C/ /f/i/g/h/t/./ | **ADVANCE (subject to verification)** | 16 |
| `ufc-v2-fast2-postfight-requests` | /N/a/m/e/ /s/o/m/e/t/h/i/n/g/ /a/ /U/F/C/ /f/i/g/h/t/e/r/ /m/i/g/h/t/ /a/s/k/ /f/o/r/ /a/f/t/e/r/ /w/i/n/n/i/n/g/ /a/ /b/o/u/t/./ | **HOLD** | 11 |
| `ufc-v2-fast2-opponent-types` | /N/a/m/e/ /a/ /t/y/p/e/ /o/f/ /o/p/p/o/n/e/n/t/ /a/ /U/F/C/ /f/i/g/h/t/e/r/ /m/i/g/h/t/ /p/r/e/p/a/r/e/ /t/o/ /f/a/c/e/./ | **ADVANCE (subject to verification)** | 14 |
| `ufc-v2-fast2-referee-phrases` | /N/a/m/e/ /s/o/m/e/t/h/i/n/g/ /a/ /U/F/C/ /r/e/f/e/r/e/e/ /m/i/g/h/t/ /s/a/y/ /b/e/f/o/r/e/ /o/r/ /d/u/r/i/n/g/ /a/ /f/i/g/h/t/./ | **ADVANCE (subject to verification)** | 14 |
| `ufc-v2-fast2-autograph-items` | /N/a/m/e/ /s/o/m/e/t/h/i/n/g/ /U/F/C/ /f/i/g/h/t/e/r/s/ /m/i/g/h/t/ /a/u/t/o/g/r/a/p/h/ /f/o/r/ /a/ /f/a/n/./ | **HOLD** | 13 |
| `ufc-v2-fast2-career-record` | /N/a/m/e/ /a/ /s/t/a/t/i/s/t/i/c/ /t/h/a/t/ /c/o/u/l/d/ /a/p/p/e/a/r/ /i/n/ /a/ /U/F/C/ /f/i/g/h/t/e/r/'/s/ /c/a/r/e/e/r/ /r/e/c/o/r/d/./ | **ADVANCE (subject to verification)** | 11 |

## Acceptance/testing and delivery gate

- Current test suite file `ufcSportsFeudV2Batch2.test.ts` checks all canonical/extra names plus aliases against the actual `matchFamilyFeudAnswer` implementation on materialized packs. It also asserts distinct IDs/semantic lanes across both new batches and tests common surnames/nicknames/abbreviations.
- Do not assume a passing mechanical test certifies the sport-specific factual truth of the candidate and every off-board answer. Continue manual/official-source checks (including false positives of fuzzy misspellings and rare first-name collisions).
- Main facts must be accurately bounded and interesting. Fast questions must be materially easier and answerable immediately, with reasonable answers accepted fairly.
- A new official future-only versioned Daily selector must protect at least **20 consecutive Feud appearances without question-ID or semantic-topic repeats**, using two Main + five Fast each and keeping all historic snapshots, leaderboard results and accepted answers immutable.
- Exact PR head must be CI green before any merge. Owner has not authorized merge or go-live; keep draft and keep `main` untouched.

## Full source-derived answer review matrix (17 questions)

### ufc-v2-main2-olympic-athletes

**Prompt:** Name a UFC fighter who also competed at the Olympic Games.

**Ranked editorial choices (not actual survey responses):** 1. Henry Cejudo; 2. Ronda Rousey; 3. Daniel Cormier; 4. Yoel Romero; 5. Kayla Harrison; 6. Sara McMann; 7. Ben Askren; 8. Dan Henderson.

**Additional accepted named answers (6):** Mark Madsen; Matt Lindland; Mark Coleman; Kevin Jackson; Mark Schultz; Robelis Despaigne.

**Curated aliases (5):** Daniel Cormier: DC; Henry Cejudo: The Messenger; Ronda Rousey: Rowdy; Yoel Romero: Soldier of God; Ben Askren: Funky.

**Editorial status:** ADVANCE (subject to verification). Verify Olympic team records/years and every accepted Olympian independently; some omitted UFC Olympians may still be defensible..

**Source references:** https://www.ufc.com/news/olympians-who-have-competed-ufc-octagon; https://www.ufc.com/news/ufc-signs-olympic-gold-winner-cejudo.


### ufc-v2-main2-early-tournaments

**Prompt:** Name a fighter who won a UFC tournament during the promotion's early tournament era.

**Ranked editorial choices (not actual survey responses):** 1. Royce Gracie; 2. Dan Severn; 3. Mark Coleman; 4. Don Frye; 5. Mark Kerr; 6. Oleg Taktarov; 7. Marco Ruas; 8. Steve Jennum.

**Additional accepted named answers (7):** Vitor Belfort; Dan Henderson; Randy Couture; Kazushi Sakuraba; Pat Miletich; Jerry Bohlander; Guy Mezger.

**Curated aliases (4):** Mark Kerr: The Smashing Machine; Mark Coleman: The Hammer; Dan Severn: The Beast; Vitor Belfort: The Phenom.

**Editorial status:** ADVANCE (subject to verification). Verify the complete historical tournament-winner universe (including weight-class and Japan tournaments), not merely the eight iconic ranked names..

**Source references:** https://www.ufc.com/news/championship-matters; https://www.ufc.com/hof/mark-kerr-hall-of-fame; https://www.ufc.com/news/numbers-super-streaks; https://www.ufc.com/news/fast-facts-our-20th-anniversary; https://www.ufc.com/news/wanderlei-silva-named-ufc-hall-fame-class-2024.


### ufc-v2-main2-wec-champions

**Prompt:** Name a fighter who held a WEC championship and later fought in the UFC.

**Ranked editorial choices (not actual survey responses):** 1. Jose Aldo; 2. Dominick Cruz; 3. Urijah Faber; 4. Anthony Pettis; 5. Benson Henderson; 6. Carlos Condit; 7. Miguel Torres; 8. Mike Brown.

**Additional accepted named answers (4):** Brian Bowles; Eddie Wineland; Jamie Varner; Steve Cantwell.

**Curated aliases (6):** Jose Aldo: Aldo; Dominick Cruz: The Dominator; Urijah Faber: The California Kid; Anthony Pettis: Showtime; Benson Henderson: Bendo; Carlos Condit: The Natural Born Killer.

**Editorial status:** ADVANCE (subject to verification). Check WEC belt records and actual subsequent UFC fight history. Rob McCullough was removed from the draft because no later UFC fight was confirmed; Steve Cantwell was sourced instead..

**Source references:** https://www.ufc.com/news/wec-forever-legacy-little-blue-cage-ufc; https://www.ufc.com/news/best-2012-so-far; https://www.ufc.com/news/wec-champ-cantwell-gets-fresh-start-ufc; https://www.ufc.com/news/brian-bowles-allow-me-reintroduce-myself; https://www.ufc.com/news/returning-varner-focuses-future.


### ufc-v2-main2-strikeforce-champions

**Prompt:** Name a fighter who won a Strikeforce championship and also fought in the UFC.

**Ranked editorial choices (not actual survey responses):** 1. Ronda Rousey; 2. Luke Rockhold; 3. Nick Diaz; 4. Gilbert Melendez; 5. Alistair Overeem; 6. Miesha Tate; 7. Ronaldo Souza; 8. Gegard Mousasi.

**Additional accepted named answers (8):** Jake Shields; Dan Henderson; Cung Le; Sarah Kaufman; Tarec Saffiedine; Cris Cyborg; Rafael Cavalcante; Nate Marquardt.

**Curated aliases (4):** Ronaldo Souza: Jacare, Jacaré; Alistair Overeem: The Reem; Cris Cyborg: Cyborg.

**Editorial status:** HOLD. Adjacent to the WEC champion/crossover Main concept; do not present both as distinct content without changing the recall task. Some belt-status/era cases still require official source confirmation..

**Source references:** https://www.ufc.com/news/strikeforce-rousey-vs-kaufman-main-card-results.


### ufc-v2-main2-hof-fight-wing

**Prompt:** Name a UFC fighter who appeared in a bout inducted into the UFC Hall of Fame's Fight Wing.

**Ranked editorial choices (not actual survey responses):** 1. Forrest Griffin; 2. Stephan Bonnar; 3. Jon Jones; 4. Alexander Gustafsson; 5. Robbie Lawler; 6. Rory MacDonald; 7. Anderson Silva; 8. Chael Sonnen.

**Additional accepted named answers (14):** Dan Henderson; Mauricio Rua; Zhang Weili; Joanna Jedrzejczyk; Israel Adesanya; Kelvin Gastelum; Cub Swanson; Doo Ho Choi; Diego Sanchez; Clay Guida; Mark Coleman; Pete Williams; Matt Hughes; Frank Trigg.

**Curated aliases (4):** Mauricio Rua: Shogun, Shogun Rua; Joanna Jedrzejczyk: Joanna Champion; Anderson Silva: The Spider.

**Editorial status:** HOLD. Repackages existing iconic-fight prompt as a Hall of Fame filter; valuable factual material, but too close to the existing rivalry/fight family to count as a distinct round..

**Source references:** https://www.ufc.com/ufc-hall-of-fame.


### ufc-v2-fast2-nicknames

**Prompt:** Name a famous UFC fighter nickname.

**Ranked editorial choices (not actual survey responses):** 1. The Notorious; 2. Bones; 3. The Eagle; 4. Blessed; 5. Poatan; 6. The Diamond; 7. The Last Stylebender; 8. Thug Rose.

**Additional accepted named answers (42):** Mighty Mouse; The Spider; The Predator; The Iceman; The Korean Zombie; The Lioness; El Cucuy; The Great; Gamebred; The Natural; The Count; Suga; Borz; Do Bronx; The Machine; The Highlight; El Matador; Bullet; The Reaper; Rampage; DC; The Nigerian Nightmare; No Love; The American Gangster; Rocky; Chaos; The Black Beast; The Mauler; Wonderboy; The Hangman; The Eraser; The Axe Murderer; The Nightmare; Ruthless; Cowboy; The Korean Superboy; The Assassin Baby; The Dominator; The Answer; The California Kid; The Gorilla; Big Nog.

**Curated aliases (54):** The Notorious: Conor McGregor; Bones: Jon Jones; The Eagle: Khabib Nurmagomedov; Blessed: Max Holloway; Poatan: Alex Pereira; The Diamond: Dustin Poirier; The Last Stylebender: Israel Adesanya; Thug Rose: Rose Namajunas; Mighty Mouse: Demetrious Johnson; The Spider: Anderson Silva; The Predator: Francis Ngannou; The Iceman: Chuck Liddell; The Korean Zombie: Chan Sung Jung, Korean Zombie; The Lioness: Amanda Nunes; El Cucuy: Tony Ferguson; The Great: Alexander Volkanovski; Gamebred: Jorge Masvidal; The Natural: Randy Couture; The Count: Michael Bisping; Suga: Sean O'Malley, Sugar Sean; Borz: Khamzat Chimaev; Do Bronx: Charles Oliveira; The Machine: Merab Dvalishvili; The Highlight: Justin Gaethje; El Matador: Ilia Topuria, Topuria; Bullet: Valentina Shevchenko; The Reaper: Robert Whittaker, Bobby Knuckles; Rampage: Quinton Jackson; DC: Daniel Cormier; The Nigerian Nightmare: Kamaru Usman; No Love: Cody Garbrandt; The American Gangster: Chael Sonnen; Rocky: Leon Edwards; Chaos: Colby Covington; The Black Beast: Derrick Lewis; The Mauler: Alexander Gustafsson; Wonderboy: Stephen Thompson; The Hangman: Dan Hooker; The Eraser: Paulo Costa; The Axe Murderer: Wanderlei Silva; The Nightmare: Diego Sanchez; Ruthless: Robbie Lawler; Cowboy: Donald Cerrone; The Korean Superboy: Doo Ho Choi; The Assassin Baby: Brandon Moreno; The Dominator: Dominick Cruz; The Answer: Frankie Edgar; The California Kid: Urijah Faber; The Gorilla: Darren Till; Big Nog: Antonio Rodrigo Nogueira.

**Editorial status:** ADVANCE (subject to verification). Strong casual recall; 50 recognizable canonical nicknames plus fighter-name aliases now authored, but more legitimate nicknames may need acceptance..


### ufc-v2-fast2-defensive-moves

**Prompt:** Name a defensive move a UFC fighter might use to avoid a strike or takedown.

**Ranked editorial choices (not actual survey responses):** 1. Block a punch; 2. Slip a punch; 3. Check a kick; 4. Sprawl; 5. Parry; 6. Duck; 7. Step backward; 8. Clinch up.

**Additional accepted named answers (15):** Circle away; Catch a kick; Pivot away; Bob and weave; Roll with a punch; Cover up; Frame; Fight for underhooks; Move out of range; Lean backward; Shell up; Use head movement; Backpedal; Keep distance; Defend the takedown.

**Curated aliases (5):** Block a punch: Block; Slip a punch: Slip; Step backward: Back up, Step back; Clinch up: Clinch.

**Editorial status:** ADVANCE (subject to verification). Distinct from fighter-name styles; confirm broad defensible defensive moves and collapse true synonyms without double awards..


### ufc-v2-fast2-injury-body-parts

**Prompt:** Name a part of a UFC fighter's body that could be injured in a fight.

**Ranked editorial choices (not actual survey responses):** 1. Nose; 2. Knee; 3. Hand; 4. Eye; 5. Ribs; 6. Shoulder; 7. Ankle; 8. Elbow.

**Additional accepted named answers (17):** Foot; Head; Wrist; Jaw; Ear; Shin; Calf; Back; Finger; Toe; Neck; Hip; Arm; Leg; Groin; Mouth; Eyebrow.

**Curated aliases (3):** Ribs: Rib; Eye: Eyes; Knee: Knees.

**Editorial status:** ADVANCE (subject to verification). Easy and bounded; accept everyday anatomy synonyms without arbitrarily rejecting a body part..


### ufc-v2-fast2-combat-disciplines

**Prompt:** Name a martial art or combat sport commonly trained by UFC fighters.

**Ranked editorial choices (not actual survey responses):** 1. Boxing; 2. Wrestling; 3. Brazilian jiu-jitsu; 4. Muay Thai; 5. Kickboxing; 6. Judo; 7. Karate; 8. Taekwondo.

**Additional accepted named answers (9):** Sambo; Sanda; Catch wrestling; Capoeira; Freestyle wrestling; Greco-Roman wrestling; Submission grappling; Dutch kickboxing; Jiu-jitsu.

**Curated aliases (5):** Brazilian jiu-jitsu: BJJ, Brazilian jujitsu; Muay Thai: Thai boxing; Taekwondo: TKD; Sambo: Combat sambo.

**Editorial status:** HOLD. Combat-style names recur in batch-one training-activity answers; distinctness isn't strong enough yet..


### ufc-v2-fast2-event-countries

**Prompt:** Name a country where the UFC has held a fight card.

**Ranked editorial choices (not actual survey responses):** 1. United States; 2. Brazil; 3. United Kingdom; 4. Canada; 5. Australia; 6. United Arab Emirates; 7. Japan; 8. Mexico.

**Additional accepted named answers (17):** Ireland; France; Germany; China; New Zealand; Singapore; Sweden; South Korea; Russia; Poland; Czech Republic; Chile; Argentina; Denmark; Netherlands; Croatia; Philippines.

**Curated aliases (10):** United States: US, USA, America; United Kingdom: UK, Britain, England, Scotland; United Arab Emirates: UAE; South Korea: Korea; Czech Republic: Czechia.

**Editorial status:** ADVANCE (subject to verification). Confirm event history before releasing; map UAE/USA/UK shorthand, and do not incorrectly accept Wales as a country hosting a prior UFC event..


### ufc-v2-fast2-ground-positions

**Prompt:** Name a grappling position commentators mention during UFC ground fighting.

**Ranked editorial choices (not actual survey responses):** 1. Full guard; 2. Half guard; 3. Side control; 4. Full mount; 5. Back mount; 6. Turtle; 7. North-south; 8. Crucifix.

**Additional accepted named answers (9):** Knee on belly; Butterfly guard; Rubber guard; Fifty-fifty; Deep half guard; Front headlock; Ashi garami; Reverse De La Riva; Open guard.

**Curated aliases (6):** Full guard: Guard, Closed guard; Full mount: Mount; Back mount: Back control; North-south: North south position; Fifty-fifty: 50/50.

**Editorial status:** HOLD. Many answers (crucifix, north-south, rubber guard) demand specialist grappling recall, not easy 50-second Fast Money..


### ufc-v2-fast2-corner-shouts

**Prompt:** Name something a fighter's corner might shout as advice during a UFC fight.

**Ranked editorial choices (not actual survey responses):** 1. Keep your hands up; 2. Move your head; 3. Use your jab; 4. Breathe; 5. Circle away; 6. Protect your chin; 7. Shoot a takedown; 8. Get off the fence.

**Additional accepted named answers (16):** Keep moving; Don't rush; Work the body; Kick the legs; Defend the takedown; Stay calm; Use your footwork; Pressure forward; Keep your distance; Stand up; Keep working; Stay busy; Find your range; Watch the right hand; Cover up; Use your kicks.

**Curated aliases (5):** Keep your hands up: Hands up; Move your head: Head movement; Use your jab: Jab; Breathe: Keep breathing; Get off the fence: Move off the cage.

**Editorial status:** ADVANCE (subject to verification). Fast, familiar phrases; review all reasonable fan phrasing and duplicate instructions across ranked/off-board answers..


### ufc-v2-fast2-postfight-requests

**Prompt:** Name something a UFC fighter might ask for after winning a bout.

**Ranked editorial choices (not actual survey responses):** 1. Title shot; 2. Rematch; 3. Next opponent; 4. Performance bonus; 5. Better contract; 6. Time off; 7. Fight in hometown; 8. Main event spot.

**Additional accepted named answers (11):** Another ranked opponent; Next PPV; Fight overseas; Short-notice fight; Different weight class; Specific fight date; Fight soon; Big-name opponent; BMF title shot; Fight of the Night bonus; More opportunities.

**Curated aliases (8):** Title shot: Fight for the belt, Championship fight; Performance bonus: Bonus, 50k; Better contract: Higher pay, More money; Main event spot: Headliner; Time off: Vacation.

**Editorial status:** HOLD. Unbounded predictions of what fighters might ask for; valid natural answers could be unfairly rejected. Also overlaps batch-one celebration actions..


### ufc-v2-fast2-opponent-types

**Prompt:** Name a type of opponent a UFC fighter might prepare to face.

**Ranked editorial choices (not actual survey responses):** 1. Wrestler; 2. Boxer; 3. Submission grappler; 4. Kickboxer; 5. Counterstriker; 6. Pressure fighter; 7. Southpaw; 8. Heavy puncher.

**Additional accepted named answers (14):** Tall fighter; Short fighter; Judo specialist; Karate specialist; Muay Thai fighter; Volume striker; Switch-stance fighter; Range fighter; Clinch fighter; Ground-and-pound fighter; Takedown specialist; BJJ specialist; Fast fighter; Defensive fighter.

**Curated aliases (6):** Submission grappler: Grappler, BJJ fighter; Heavy puncher: Knockout artist, Power puncher; Pressure fighter: Aggressive fighter; Southpaw: Left-handed fighter.

**Editorial status:** ADVANCE (subject to verification). Fast recognition of match-up styles rather than named fighter identities; allow plausible style categories and common synonyms..


### ufc-v2-fast2-referee-phrases

**Prompt:** Name something a UFC referee might say before or during a fight.

**Ranked editorial choices (not actual survey responses):** 1. Fight; 2. Stop; 3. Break; 4. Work; 5. Protect yourself; 6. Touch gloves; 7. Watch your fingers; 8. Don't grab the fence.

**Additional accepted named answers (14):** Hands up; Let go; Keep it clean; Time; Back up; Defend yourself; Stop holding; Release; Stay active; Continue fighting; No grabbing; Resume; Watch the back of the head; Show me something.

**Curated aliases (7):** Fight: Let's fight; Stop: Stop fighting; Break: Separate; Work: Keep working; Protect yourself: Protect yourselves; Don't grab the fence: No fence grabbing; Touch gloves: Glove touch.

**Editorial status:** ADVANCE (subject to verification). Instant familiar instructions but requires verb-variation aliases and avoiding false-positive approximate matches..


### ufc-v2-fast2-autograph-items

**Prompt:** Name something UFC fighters might autograph for a fan.

**Ranked editorial choices (not actual survey responses):** 1. Fight glove; 2. Poster; 3. T-shirt; 4. Replica belt; 5. Photograph; 6. Hat; 7. Event ticket; 8. Trading card.

**Additional accepted named answers (13):** Program; Flag; Fight shorts; Jersey; Book; Canvas art; Phone case; Shoes; Jacket; Wristband; Bag; Magazine; Action figure.

**Curated aliases (7):** Fight glove: Glove, MMA glove; T-shirt: Shirt; Photograph: Photo, Picture; Fight shorts: Shorts; Replica belt: Belt.

**Editorial status:** HOLD. Mostly the same glove/poster/shirt/hat answers as the earlier UFC merchandise concept; likely replace rather than add..


### ufc-v2-fast2-career-record

**Prompt:** Name a statistic that could appear in a UFC fighter's career record.

**Ranked editorial choices (not actual survey responses):** 1. Total wins; 2. Total losses; 3. Draws; 4. Knockout wins; 5. Submission wins; 6. Decision wins; 7. No contests; 8. Win streak.

**Additional accepted named answers (11):** Overall record; UFC fight count; Finish percentage; Win percentage; Total fights; KO percentage; Decision losses; Submission losses; Title defenses; Career finishes; Losses by knockout.

**Curated aliases (9):** Total wins: Wins, W; Total losses: Losses, L; Draws: Draw; Knockout wins: KO wins, TKO wins; No contests: NC; Win streak: Winning streak.

**Editorial status:** ADVANCE (subject to verification). Career record summary is different from per-fight stat categories, but verify natural percentages/numbers count correctly and avoid category overlap..
