# UFC Sports Feud editorial rebuilding — Batch 3 distinct content review

**Date:** October 23, 2026. **Source:** production `main` resolved at `24325c8939b866e7d6e5f203bcc1eec71b5044b8`; branch `audit/ufc-sports-feud-quality-review-20261023`. **Not live**. No selectors, scoring, publishing, existing questions or historical records were changed.

## NBA lessons applied

NBA Sports Feud has 71 Main / 130 Fast distinct authored questions with a 20-appearance exact-question nonrepeat selector. UFC initially had 350 *authored variants* of only 70 families. This batch uses **one authored prompt per new concept**, larger question families with all eight ranked candidates and true additional acceptable answers, curated aliases, and up-front collision tests. There are no five-way prompt rephrasings. The eventual selector must protect semantic topic reuse, not just IDs.

## Batch 3 editorial summary

- **25 authored prompts: 4 Main + 21 Fast**. Primary historical sources verified for the completed UFC 100 / UFC 200 / UFC 300 cards. Full accepted answer universe is checked to those specific fight cards, including preliminaries, not announced-but-cancelled bouts.
- **14 advancing** to independent fact/answer/matcher review: **2 Main + 12 Fast**; **11 held** (2 Main + 9 Fast) due to substantial overlap with other concepts or unfair grading difficulty.
- The extra-answer and alias structure statically checked: **514** distinct authored canonical/extra names, **156** aliases, zero normalized name conflicts within those boards. Tests in `ufcSportsFeudV2Batch3.test.ts` check the actual matcher. Do not call draft CI green or certification until the exact-head pipeline is green.
- UFC 100/300 are interesting historic event-specific boards; they share a broader **numbered-event-participants** *semantic lane*. A selector cannot serve multiple near-identical "who competed on UFC N" prompts within the same 20-appearance repeat-free window merely because their numbered event differs. UFC 200 is held for this reason.

## Batch 3 — Main

| Stable ID | Question | Verdict | Off-board responses |
|---|---|---|---:|
| `ufc-v2-main3-ufc100-card` | Name a fighter who competed on the UFC 100 card in 2009. | **ADVANCE** | 14 |
| `ufc-v2-main3-ufc300-card` | Name a fighter who competed on the UFC 300 card in 2024. | **ADVANCE** | 18 |
| `ufc-v2-main3-ufc200-card` | Name a fighter who competed on the UFC 200 card in 2016. | **HOLD** | 16 |
| `ufc-v2-main3-tuf1-contestants` | Name a fighter who appeared as a contestant on Season 1 of The Ultimate Fighter. | **HOLD** | 8 |

## Batch 3 — Fast

| Stable ID | Question | Verdict | Off-board responses |
|---|---|---|---:|
| `ufc-v2-fast3-fan-acronyms` | Name an abbreviation UFC fans use when talking about fights. | **ADVANCE** | 20 |
| `ufc-v2-fast3-cage-parts` | Name a physical part of the UFC Octagon. | **ADVANCE** | 10 |
| `ufc-v2-fast3-announcer-intro` | Name something the UFC ring announcer might say when introducing a fighter. | **HOLD** | 12 |
| `ufc-v2-fast3-fight-cancel` | Name a reason a scheduled UFC fight might be canceled or need a replacement. | **ADVANCE** | 11 |
| `ufc-v2-fast3-fight-injury-types` | Name an injury a fighter might suffer during a UFC bout. | **ADVANCE** | 13 |
| `ufc-v2-fast3-fight-week-events` | Name a public event a UFC fan might attend during fight week. | **HOLD** | 9 |
| `ufc-v2-fast3-watch-devices` | Name a device someone might use to watch a UFC fight. | **HOLD** | 8 |
| `ufc-v2-fast3-watch-places` | Name a place fans might watch a UFC fight with other people. | **HOLD** | 12 |
| `ufc-v2-fast3-fighter-travel` | Name something a fighter might pack when traveling to a UFC event. | **HOLD** | 15 |
| `ufc-v2-fast3-fight-camp-people` | Name someone who might help a UFC fighter during training camp. | **ADVANCE** | 13 |
| `ufc-v2-fast3-after-loss` | Name something a fighter might do right after losing a UFC bout. | **ADVANCE** | 12 |
| `ufc-v2-fast3-walkout-music` | Name a style of music a UFC fighter might use for a walkout. | **ADVANCE** | 13 |
| `ufc-v2-fast3-post-weighin-meals` | Name a food a UFC fighter might eat after making weight. | **HOLD** | 13 |
| `ufc-v2-fast3-inspection` | Name something officials might check on a UFC fighter before the bout begins. | **ADVANCE** | 12 |
| `ufc-v2-fast3-fan-predictions` | Name something UFC fans might predict before a fight starts. | **ADVANCE** | 12 |
| `ufc-v2-fast3-crowd-cheers` | Name something in a UFC fight that might make the crowd cheer. | **HOLD** | 13 |
| `ufc-v2-fast3-between-fights-tv` | Name something a UFC broadcast might show between fights. | **HOLD** | 13 |
| `ufc-v2-fast3-ticket-details` | Name something displayed on a ticket to a UFC event. | **ADVANCE** | 13 |
| `ufc-v2-fast3-first-minute` | Name something fighters might do during the first minute of a UFC bout. | **HOLD** | 13 |
| `ufc-v2-fast3-canadian-fighters` | Name a well-known Canadian UFC fighter. | **ADVANCE** | 11 |
| `ufc-v2-fast3-australia-nz-fighters` | Name a well-known UFC fighter from Australia or New Zealand. | **ADVANCE** | 10 |

## Canonical existing concepts salvaged

This phase also introduced `ufcSportsFeudV2RetainedDraft.ts`, which **copies one canonical `-1` prompt from each of 20 'KEEP' legacy families** (8 Main / 12 Fast) into future-only candidate IDs, leaving all 350 historical rows untouched. Those old answer universes still need complete off-board/alias work and are **not independently certified as a final 20 approved questions**. No rewritten legacy concepts are prematurely counted as repaired.

## Cumulative honest accounting

| Source | Main authored | Fast authored | Main prelim. advancing | Fast prelim. advancing |
|---|---:|---:|---:|---:|
| New batch 1 | 6 | 20 | 6 | 16 |
| New batch 2 | 5 | 12 | 3 | 8 |
| New batch 3 | 4 | 21 | 2 | 12 |
| **New authored total** | **15** | **53** | **11** | **36** |
| Legacy keep concepts (conditional) | 8 | 12 | 8 pending fact/aliases | 12 pending fact/aliases |

**68 new concepts drafted**: **47 advance** at the first editorial gate; 21 held. If all 20 kept legacy concepts pass and all 47 new advancing concepts pass, the ceiling is **67 distinct viable concepts**. That is not a finished bank and not an official 70-Main / 140-Fast score. The new Main category especially needs expansion, and the final 210 goal is quality-sensitive.

## Still needed

- Complete factual checks for every accepted extra/alias and broader defensible candidates. Any subjective correct answer should not become an unfair strike. Run matcher against both exact canonical names and natural fan shorthand; ambiguous short names cannot earn credit.
- Create more genuinely different Main topics. The UFC pool is narrower than the NBA pool, so do not use third/fourth paraphrases or marginal 'famous person' questions to inflate numbers.
- Implement versioned, future-only Daily selector with two Main and five easy Fast each, 20 appearance no-repeat semantic cooldown, identical game for all users on a date, old published packs/results preserved. This cannot happen by simply slicing 350 to 210 because existing daily-bank checks require 100 Main + 250 Fast.
- Exact PR head CI green before any merge; no owner authorization to go live.

## Individual draft answer review matrix

### `ufc-v2-main3-ufc100-card`

**Question:** Name a fighter who competed on the UFC 100 card in 2009.

**Eight ranked editorial answers (not survey measurements):** 1. Brock Lesnar; 2. Frank Mir; 3. Georges St-Pierre; 4. Dan Henderson; 5. Michael Bisping; 6. Jon Jones; 7. Thiago Alves; 8. Jon Fitch.

**Additional accepted responses (14):** Paulo Thiago; Yoshihiro Akiyama; Alan Belcher; Mark Coleman; Stephan Bonnar; Jim Miller; Mac Danzig; Jake O'Brien; TJ Grant; Dong Hyun Kim; CB Dollaway; Tom Lawlor; Matt Grice; Shannon Gugerty.

**Alias bindings (4):** Georges St-Pierre = GSP; Yoshihiro Akiyama = Sexyama; Dan Henderson = Hendo; Dong Hyun Kim = Stun Gun.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Official UFC 100 July 11, 2009 result card; 8 ranked and 14 extra names cover the 11 completed bouts, not preliminary scheduled cancellations.

**Source references:** https://www.ufc.com/event/ufc-100; https://us.ufcespanol.com/news/ufc-confirms-remaining-fights-ufc-100.


### `ufc-v2-main3-ufc300-card`

**Question:** Name a fighter who competed on the UFC 300 card in 2024.

**Eight ranked editorial answers (not survey measurements):** 1. Alex Pereira; 2. Max Holloway; 3. Justin Gaethje; 4. Charles Oliveira; 5. Zhang Weili; 6. Jamahal Hill; 7. Kayla Harrison; 8. Holly Holm.

**Additional accepted responses (18):** Yan Xiaonan; Arman Tsarukyan; Jiri Prochazka; Aleksandar Rakic; Bo Nickal; Cody Brundage; Aljamain Sterling; Calvin Kattar; Sodiq Yusuff; Diego Lopes; Jalin Turner; Renato Moicano; Jessica Andrade; Marina Rodriguez; Bobby Green; Jim Miller; Deiveson Figueiredo; Cody Garbrandt.

**Alias bindings (5):** Alex Pereira = Poatan; Zhang Weili = Weili Zhang; Jiri Prochazka = Jiří Procházka; Bobby Green = King Green; Jessica Andrade = Jéssica Andrade.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Official UFC 300 April 13, 2024 result card; 8 ranked and 18 extra names cover 13 completed fights.

**Source references:** https://www.ufc.com/event/ufc-300; https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill.


### `ufc-v2-main3-ufc200-card`

**Question:** Name a fighter who competed on the UFC 200 card in 2016.

**Eight ranked editorial answers (not survey measurements):** 1. Amanda Nunes; 2. Miesha Tate; 3. Brock Lesnar; 4. Mark Hunt; 5. Daniel Cormier; 6. Anderson Silva; 7. Jose Aldo; 8. Frankie Edgar.

**Additional accepted responses (16):** Cain Velasquez; Travis Browne; Julianna Pena; Cat Zingano; TJ Dillashaw; Raphael Assuncao; Sage Northcutt; Enrique Marin; Johny Hendricks; Kelvin Gastelum; Gegard Mousasi; Thiago Santos; Joe Lauzon; Diego Sanchez; Jim Miller; Takanori Gomi.

**Alias bindings (5):** Daniel Cormier = DC; Jose Aldo = Aldo; Raphael Assuncao = Raphael Assunção; Julianna Pena = Julianna Peña; Anderson Silva = The Spider.

**Verdict:** HOLD. Third question in the same numbered-event roster format, after UFC 100 and UFC 300. Historically defensible but too similar to count as an independent topic; reserve for a later cycle.

**Source references:** https://www.ufc.com/news/ufc-200-results-and-news-vegas; https://www.ufc.com/event/ufc-200.


### `ufc-v2-main3-tuf1-contestants`

**Question:** Name a fighter who appeared as a contestant on Season 1 of The Ultimate Fighter.

**Eight ranked editorial answers (not survey measurements):** 1. Forrest Griffin; 2. Stephan Bonnar; 3. Diego Sanchez; 4. Kenny Florian; 5. Josh Koscheck; 6. Chris Leben; 7. Mike Swick; 8. Nate Quarry.

**Additional accepted responses (8):** Bobby Southworth; Alex Schoenauer; Sam Hoger; Lodune Sincaid; Jason Thacker; Chris Sanford; Josh Rafferty; Alex Karalexis.

**Alias bindings (4):** Kenny Florian = KenFlo; Forrest Griffin = Forrest; Stephan Bonnar = Bonnar; Nate Quarry = Nathan Quarry.

**Verdict:** HOLD. Meaningfully historical, but the existing batch contains TUF coaches and TUF winners. Hold until TUF material is spread out and all 16 cast identities are source-checked.

**Source references:** https://www.ufc.com/news/crippler-calls-it-day; https://en.wikipedia.org/wiki/The_Ultimate_Fighter_1.


### `ufc-v2-fast3-fan-acronyms`

**Question:** Name an abbreviation UFC fans use when talking about fights.

**Eight ranked editorial answers (not survey measurements):** 1. KO; 2. TKO; 3. MMA; 4. BJJ; 5. PPV; 6. GOAT; 7. P4P; 8. RNC.

**Additional accepted responses (20):** UFC; TUF; DQ; NC; UD; SD; MD; SUB; DWCS; GNP; BMF; FOTN; POTN; LHW; HW; WW; MW; FW; BW; FLW.

**Alias bindings (8):** KO = Knockout; TKO = Technical knockout; MMA = Mixed martial arts; BJJ = Brazilian jiu-jitsu; PPV = Pay per view; GOAT = Greatest of all time; P4P = Pound for pound; RNC = Rear naked choke.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Fan language, quick and varied; abbreviations score correctly with full-phrase aliases.


### `ufc-v2-fast3-cage-parts`

**Question:** Name a physical part of the UFC Octagon.

**Eight ranked editorial answers (not survey measurements):** 1. Fence; 2. Canvas; 3. Cage door; 4. Corner post; 5. Padding; 6. Floor mat; 7. Fence panel; 8. Center logo.

**Additional accepted responses (10):** Cage wall; Corner padding; Chain link fence; Mat edge; Cage frame; Fence post; Cage flooring; Fighting surface; Side panel; Cage supports.

**Alias bindings (10):** Fence = Cage fence; Canvas = Canvas mat; Cage door = Door, Gate; Corner post = Cage post; Padding = Cage padding; Floor mat = Mat, Octagon floor; Fence panel = Panel; Center logo = UFC logo.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Physical Octagon construction is concrete, clear and UFC-branded; synonyms for door/gate are collapsed.


### `ufc-v2-fast3-announcer-intro`

**Question:** Name something the UFC ring announcer might say when introducing a fighter.

**Eight ranked editorial answers (not survey measurements):** 1. Fighter name; 2. Nickname; 3. Hometown; 4. Height; 5. Weight; 6. Professional record; 7. Fighting out of; 8. Champion status.

**Additional accepted responses (12):** Former champion; Country of origin; Win count; Loss count; Weight division; Reach; City; Gym; Blue corner; Red corner; Fight credentials; Main event.

**Alias bindings (6):** Fighter name = Name; Professional record = Record, Wins and losses; Hometown = From; Champion status = Champion; Fighting out of = Fighting from.

**Verdict:** HOLD. Who is being introduced, hometown, record and belt are nearly the same recall task as the existing pre-fight commentary/broadcast graphics concepts.


### `ufc-v2-fast3-fight-cancel`

**Question:** Name a reason a scheduled UFC fight might be canceled or need a replacement.

**Eight ranked editorial answers (not survey measurements):** 1. Injury; 2. Illness; 3. Missed weight; 4. Failed medical exam; 5. Visa issue; 6. Personal emergency; 7. Travel problem; 8. Positive drug test.

**Additional accepted responses (11):** Suspension; Contract dispute; Bad weight cut; Surgery; COVID infection; Infection; Athletic commission denial; Opponent withdrew; Passport problem; Legal trouble; Health issue.

**Alias bindings (7):** Injury = Fighter injured; Illness = Sick; Missed weight = Weight issue; Positive drug test = Drug testing issue, Doping; Visa issue = Visa denied; Personal emergency = Family emergency.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Recognizable, concrete reasons a scheduled bout falls apart; honor broad accurate substitutes without creating arbitrary strikes.


### `ufc-v2-fast3-fight-injury-types`

**Question:** Name an injury a fighter might suffer during a UFC bout.

**Eight ranked editorial answers (not survey measurements):** 1. Cut; 2. Broken nose; 3. Concussion; 4. Swollen eye; 5. Broken hand; 6. Dislocated shoulder; 7. Leg injury; 8. Bruised ribs.

**Additional accepted responses (13):** Fracture; Facial swelling; Black eye; Bloody nose; Torn ligament; Jaw injury; Eye injury; Sprained ankle; Shoulder injury; Dehydration; Nosebleed; Finger injury; Contusion.

**Alias bindings (6):** Cut = Laceration; Broken nose = Fractured nose; Concussion = Head injury; Swollen eye = Eye swelling; Broken hand = Hand fracture; Bruised ribs = Rib bruise.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Distinct from body-part identification; familiar conditions (cut, concussion, broken nose) are directly answerable.


### `ufc-v2-fast3-fight-week-events`

**Question:** Name a public event a UFC fan might attend during fight week.

**Eight ranked editorial answers (not survey measurements):** 1. Ceremonial weigh-ins; 2. Press conference; 3. Open workouts; 4. Fan meet-and-greet; 5. Autograph signing; 6. UFC fight card; 7. Fan expo; 8. Hall of Fame event.

**Additional accepted responses (9):** Fan Q&A; Media day appearance; Fan festival; Community event; Watch party; Fighter appearance; Public workout; Fan experience; Promotional event.

**Alias bindings (6):** Ceremonial weigh-ins = Weigh-in, Weigh ins; Press conference = Pressers; Open workouts = Open workout; Fan meet-and-greet = Meet and greet; Autograph signing = Autographs.

**Verdict:** HOLD. Ceremonial weigh-in, press conference and open workout overlap multiple batch-one live-event topics; editorially useful but not new.


### `ufc-v2-fast3-watch-devices`

**Question:** Name a device someone might use to watch a UFC fight.

**Eight ranked editorial answers (not survey measurements):** 1. Television; 2. Smartphone; 3. Laptop; 4. Tablet; 5. Desktop computer; 6. Projector; 7. Game console; 8. Streaming stick.

**Additional accepted responses (8):** Apple TV; Amazon Fire TV; Chromecast; Xbox; PlayStation; Home theater projector; Streaming box; Monitor.

**Alias bindings (11):** Television = TV, Smart TV; Smartphone = Phone, Cell phone; Laptop = Laptop computer; Tablet = iPad; Desktop computer = Desktop PC, Computer; Streaming stick = Roku, Fire stick, Fire TV stick.

**Verdict:** HOLD. Very easy, but TV/phone/tablet and Roku-style media answers are generic; adjacent to first-batch UFC watch-party/results categories.


### `ufc-v2-fast3-watch-places`

**Question:** Name a place fans might watch a UFC fight with other people.

**Eight ranked editorial answers (not survey measurements):** 1. Sports bar; 2. Friend's house; 3. Living room; 4. UFC arena; 5. Restaurant; 6. Casino; 7. Backyard; 8. Hotel room.

**Additional accepted responses (12):** Pub; Watch party; Movie theater; Family home; Apartment; MMA gym; Sports lounge; Patio; Man cave; Outdoor screen; Community center; Party room.

**Alias bindings (6):** Sports bar = Bar; Friend's house = Friends house; Living room = Home, House; UFC arena = Arena, Live UFC event.

**Verdict:** HOLD. Sports bar, home, restaurant, hotel and arena largely recast the earlier UFC watch-party question.


### `ufc-v2-fast3-fighter-travel`

**Question:** Name something a fighter might pack when traveling to a UFC event.

**Eight ranked editorial answers (not survey measurements):** 1. Passport; 2. MMA gloves; 3. Mouthguard; 4. Training clothes; 5. Phone charger; 6. Gym shoes; 7. Hand wraps; 8. Toiletries.

**Additional accepted responses (15):** Travel documents; Headphones; Extra shorts; Laptop; Water bottle; Sneakers; Fight gear; Medicine; ID; Clothes; Shampoo; Snacks; Sports tape; Workout gear; Phone.

**Alias bindings (7):** Passport = Travel passport; MMA gloves = Gloves; Training clothes = Workout clothes; Phone charger = Charger; Gym shoes = Training shoes; Toiletries = Toothbrush, Deodorant.

**Verdict:** HOLD. Flight packing list is overlapping with existing UFC fighter gym bags and equipment/locker-room preparations.


### `ufc-v2-fast3-fight-camp-people`

**Question:** Name someone who might help a UFC fighter during training camp.

**Eight ranked editorial answers (not survey measurements):** 1. Head coach; 2. Striking coach; 3. Wrestling coach; 4. Jiu-jitsu coach; 5. Sparring partner; 6. Strength coach; 7. Nutritionist; 8. Physical therapist.

**Additional accepted responses (13):** Manager; Sports psychologist; Boxing coach; Muay Thai coach; Training partner; Conditioning coach; Cutman; Doctor; Massage therapist; Athletic trainer; Personal trainer; Dietitian; Rehab therapist.

**Alias bindings (6):** Head coach = Coach; Striking coach = Kickboxing coach; Jiu-jitsu coach = BJJ coach; Sparring partner = Sparring teammate; Strength coach = Strength and conditioning coach; Physical therapist = Physio.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Team support jobs are natural but not the same as event-production roles; requires keeping trainer vs coach synonyms coherent.


### `ufc-v2-fast3-after-loss`

**Question:** Name something a fighter might do right after losing a UFC bout.

**Eight ranked editorial answers (not survey measurements):** 1. Shake hands; 2. Hug opponent; 3. Talk to their corner; 4. Leave the cage; 5. Cry; 6. Receive medical attention; 7. Applaud the winner; 8. Speak to the interviewer.

**Additional accepted responses (12):** Thank fans; Sit on stool; Congratulate opponent; Ask for a rematch; Walk away; Look disappointed; Raise winner's hand; Check an injury; Take a deep breath; Listen to coach; Remove gloves; Get checked by doctor.

**Alias bindings (7):** Shake hands = Handshake, Shake opponent's hand; Hug opponent = Hug winner; Cry = Tear up; Receive medical attention = See doctor, Medical check; Applaud the winner = Clap for winner.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Loss reactions are meaningfully different from celebration after a victory; watch for broad subjective behavior.


### `ufc-v2-fast3-walkout-music`

**Question:** Name a style of music a UFC fighter might use for a walkout.

**Eight ranked editorial answers (not survey measurements):** 1. Hip-hop; 2. Rock; 3. Heavy metal; 4. Country; 5. Pop; 6. Reggae; 7. Electronic dance music; 8. Latin music.

**Additional accepted responses (13):** Trap; Punk rock; Classical; Instrumental; Techno; House; Folk; Traditional national music; Gospel; Dancehall; Afrobeats; R&B; Alternative rock.

**Alias bindings (5):** Hip-hop = Rap, Hip hop; Heavy metal = Metal; Electronic dance music = EDM; Latin music = Reggaeton.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Fun, accessible UFC ritual anchored by music genres; collapse hip-hop vs rap rather than awarding both.


### `ufc-v2-fast3-post-weighin-meals`

**Question:** Name a food a UFC fighter might eat after making weight.

**Eight ranked editorial answers (not survey measurements):** 1. Rice; 2. Chicken; 3. Pasta; 4. Potatoes; 5. Fruit; 6. Salmon; 7. Eggs; 8. Oatmeal.

**Additional accepted responses (13):** Steak; Bread; Sandwich; Turkey; Vegetables; Soup; Yogurt; Pancakes; Sweet potatoes; Bagel; Cereal; Peanut butter; Toast.

**Alias bindings (5):** Potatoes = Potato; Fruit = Banana, Berries; Salmon = Fish; Oatmeal = Oats.

**Verdict:** HOLD. Too many everyday foods could reasonably count; the finite authored answer set is likely unfair, and 'fruit' versus 'banana' would overlap scored answers.


### `ufc-v2-fast3-inspection`

**Question:** Name something officials might check on a UFC fighter before the bout begins.

**Eight ranked editorial answers (not survey measurements):** 1. Gloves; 2. Hand wraps; 3. Mouthguard; 4. Fingernails; 5. Shorts; 6. Body grease; 7. Jewelry; 8. Groin protector.

**Additional accepted responses (12):** Hair; Hair ties; Tape; Shoes; Uniform; Skin; Bandages; Ankle tape; Foreign substances; Glove padding; Wrap tape; Fight kit.

**Alias bindings (8):** Gloves = Fight gloves, MMA gloves; Hand wraps = Hand wrapping, Handwraps; Fingernails = Nails; Body grease = Vaseline, Grease; Groin protector = Cup.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Concrete pre-bout commission/referee safety checks; validate actual event procedures and retain acceptable athlete equipment checks.


### `ufc-v2-fast3-fan-predictions`

**Question:** Name something UFC fans might predict before a fight starts.

**Eight ranked editorial answers (not survey measurements):** 1. Winner; 2. Knockout; 3. Submission; 4. Decision; 5. Winning round; 6. Fight duration; 7. Underdog upset; 8. Performance bonus.

**Additional accepted responses (12):** Who gets finished; How many rounds; KO in first round; Fight of the Night; Points decision; Betting odds; Champion retains belt; New champion; Fight goes distance; Early finish; Winner by TKO; Finish time.

**Alias bindings (5):** Winner = Who wins; Winning round = Round; Fight duration = How long; Underdog upset = Upset; Decision = Goes to decision.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Accessible fan activity centered on picking an outcome, method and timing; ensure accepted off-board outcomes are generous.


### `ufc-v2-fast3-crowd-cheers`

**Question:** Name something in a UFC fight that might make the crowd cheer.

**Eight ranked editorial answers (not survey measurements):** 1. Knockout; 2. Big punch; 3. Submission attempt; 4. Takedown; 5. Close finish; 6. Fighter comeback; 7. Exciting exchange; 8. Title victory.

**Additional accepted responses (13):** Head kick; Slam; Ground-and-pound; Big round; Referee stoppage; Entrance; Fight announcement; Last-second finish; Comeback win; Great escape; Walkout; Winner announced; Reversal.

**Alias bindings (5):** Knockout = KO; Big punch = Power punch; Takedown = Wrestling takedown; Fighter comeback = Comeback; Title victory = New champion.

**Verdict:** HOLD. Knockouts, big strikes and cheers echo existing fight sounds and iconic fight moments, little unique recall.


### `ufc-v2-fast3-between-fights-tv`

**Question:** Name something a UFC broadcast might show between fights.

**Eight ranked editorial answers (not survey measurements):** 1. Fight highlights; 2. Fighter interview; 3. Commentator analysis; 4. Commercial break; 5. Upcoming fight preview; 6. Replay; 7. Fight statistics; 8. Walkout coverage.

**Additional accepted responses (13):** Results graphic; Tale of the tape; Judges' scorecards; Sponsors; Promo video; Event trailer; Bonus highlights; Upcoming card; Rankings; Video package; Press conference clip; Behind-the-scenes video; Recap.

**Alias bindings (7):** Fight highlights = Highlights; Fighter interview = Interview; Commentator analysis = Analysis; Commercial break = Ads, Commercial; Upcoming fight preview = Preview; Replay = Replays.

**Verdict:** HOLD. Mostly repeats broadcast graphics, commentator analysis and highlight/replay ideas already in the first batch.


### `ufc-v2-fast3-ticket-details`

**Question:** Name something displayed on a ticket to a UFC event.

**Eight ranked editorial answers (not survey measurements):** 1. Event date; 2. Seat number; 3. Arena name; 4. Section; 5. Row; 6. Ticket barcode; 7. Event name; 8. Start time.

**Additional accepted responses (13):** Ticket price; Entry gate; Order number; Venue address; City; Ticket holder name; Ticket type; Seat location; Admit one; Venue logo; Event number; Mobile ticket; Doors open time.

**Alias bindings (7):** Event date = Date; Seat number = Seat; Arena name = Venue; Ticket barcode = Barcode, QR code; Start time = Time; Section = Sec.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Concrete event attendance objects and printed fields, distinctly different from fighters/stats.


### `ufc-v2-fast3-first-minute`

**Question:** Name something fighters might do during the first minute of a UFC bout.

**Eight ranked editorial answers (not survey measurements):** 1. Touch gloves; 2. Circle each other; 3. Throw a jab; 4. Leg kick; 5. Shoot a takedown; 6. Feint; 7. Clinch; 8. Move forward.

**Additional accepted responses (13):** Keep guard up; Find range; Step backward; Throw a combination; Block; Check a kick; Change stance; Throw a right hand; Throw a hook; Back away; Test distance; Pressure opponent; Sprawl.

**Alias bindings (5):** Touch gloves = Glove touch; Circle each other = Circle; Throw a jab = Jab; Shoot a takedown = Takedown attempt; Feint = Fake a punch.

**Verdict:** HOLD. Reuses the existing strikes, kicks, takedowns and fight style list with a time qualifier; no new recall task.


### `ufc-v2-fast3-canadian-fighters`

**Question:** Name a well-known Canadian UFC fighter.

**Eight ranked editorial answers (not survey measurements):** 1. Georges St-Pierre; 2. Rory MacDonald; 3. Patrick Cote; 4. Carlos Newton; 5. Mark Hominick; 6. Sam Stout; 7. TJ Grant; 8. Mike Malott.

**Additional accepted responses (11):** Sarah Kaufman; Olivier Aubin-Mercier; Charles Jourdain; Gillian Robertson; Jasmine Jasudavicius; David Loiseau; Elias Theodorou; Randa Markos; Valerie Letourneau; Alexis Davis; Hakeem Dawodu.

**Alias bindings (5):** Georges St-Pierre = GSP; Rory MacDonald = The Red King; Patrick Cote = Patrick Côté; Valerie Letourneau = Valérie Létourneau; Olivier Aubin-Mercier = OAM.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Nationality is a specific fighter-recognition category, not an arbitrary style/GOAT opinion; check eligibility and name spellings.


### `ufc-v2-fast3-australia-nz-fighters`

**Question:** Name a well-known UFC fighter from Australia or New Zealand.

**Eight ranked editorial answers (not survey measurements):** 1. Alexander Volkanovski; 2. Robert Whittaker; 3. Israel Adesanya; 4. Tai Tuivasa; 5. Dan Hooker; 6. Mark Hunt; 7. Kai Kara-France; 8. Jack Della Maddalena.

**Additional accepted responses (10):** Jake Matthews; Jimmy Crute; Brad Riddell; Tyson Pedro; Jamie Mullarkey; Shane Young; Jessica-Rose Clark; Megan Anderson; Alex Chambers; Ben Nguyen.

**Alias bindings (6):** Alexander Volkanovski = Volk; Robert Whittaker = Bobby Knuckles; Israel Adesanya = Izzy; Tai Tuivasa = Bam Bam; Jack Della Maddalena = JDM; Kai Kara-France = KKF.

**Verdict:** ADVANCE TO FULL FACT AND GRADING VERIFICATION. Recognizable MMA region and fighters, broad accepted roster and national representation verification.
