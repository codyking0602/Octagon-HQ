# UFC Sports Feud — new question authoring batch 4

October 23, 2026. Draft PR #2062; source main re-resolved on entry. **This is isolated editorial content. No Daily selector, scoring, historical pack, production or publication changes.**

## Results and why this build is different

A further **16 genuinely distinct authored prompts** (four Main, 12 Fast) using the NBA-style one-concept-per-question approach. **Eleven advance to full factual/matcher review** (two Main, nine Fast); five remain held because of subject repetition or excessive valid-answer ambiguity. Questions have eight editorially ranked examples, extra accepted valid responses, and aliases. Ranked examples are not based on real polling and must not be presented as measured popularity.

**Current authored counts:** 84 new question drafts across four batches (**19 Main, 65 Fast**). The original 350 UFC source rows are unmodified. Also retained as draft-only material: 20 distinct legacy KEEP concepts and 15 legacy rewrite candidates that still need verified acceptance work. Total staged candidate rows = 119 (42 Main / 77 Fast), **not** 119 approved independently fresh game boards. Existing target is ~70 Main / 140 Fast; 20-appearance minimum is 40 Main / 100 Fast before accounting for editorial holds, similar semantic prompts and game-level collisions.

### Specifically corrected before staging

- Confirmed that Nunes' fights against Julia Budd and Alexis Davis took place in **Strikeforce**, not UFC, and removed them; also removed other unverified names from the UFC-only opponent board. Official history: https://us.ufcespanol.com/athlete/amanda-nunes
- Did not invent a UFC bout for Douglas Lima when listing former Bellator competitors who entered the UFC; removed from the accepted list.
- Merged synonymous extras into the **same** ranked answer via aliases rather than awarding separate slots for "boring fight / slow fight", "parents / family", "section / seat location". This follows the no-conflicting-grading approach from NBA.
- All one-question-per-topic Fast boards prioritize intuitive fan actions, event attendance, media and referee responses, not specialist record-year recall.

## Main boards

| Draft ID | Prompt | Status | Extra accepted names |
|---|---|---|---:|
| `ufc-v2-main4-mcgregor-opponents` | Name a fighter who has faced Conor McGregor in an official UFC bout. | ADVANCE — fact/acceptance pending | 3 |
| `ufc-v2-main4-anderson-silva-opponents` | Name a fighter who faced Anderson Silva in a UFC bout. | HOLD | 14 |
| `ufc-v2-main4-amanda-nunes-opponents` | Name a fighter who faced Amanda Nunes in a UFC bout. | ADVANCE — fact/acceptance pending | 8 |
| `ufc-v2-main4-bellator-ufc-veterans` | Name a fighter who competed in both Bellator MMA and the UFC. | HOLD | 8 |

## Fast boards

| Draft ID | Prompt | Status | Extra accepted names |
|---|---|---|---:|
| `ufc-v2-fast4-arena-snacks` | Name a food you might buy at a UFC arena concession stand. | ADVANCE — fact/acceptance pending | 14 |
| `ufc-v2-fast4-arena-entry` | Name something a fan might do when entering the arena for a UFC event. | ADVANCE — fact/acceptance pending | 12 |
| `ufc-v2-fast4-fan-carry` | Name an item a fan might bring to watch a UFC event in person. | ADVANCE — fact/acceptance pending | 15 |
| `ufc-v2-fast4-crowd-boos` | Name something that might make UFC fans boo during an event. | HOLD | 9 |
| `ufc-v2-fast4-referee-foul` | Name something a UFC referee might do after a fighter commits a foul. | ADVANCE — fact/acceptance pending | 11 |
| `ufc-v2-fast4-mma-news` | Name a media outlet where a UFC fan might read or hear MMA news. | ADVANCE — fact/acceptance pending | 13 |
| `ufc-v2-fast4-fighter-posts` | Name a type of content UFC fighters commonly share on social media. | ADVANCE — fact/acceptance pending | 15 |
| `ufc-v2-fast4-delay-causes` | Name something that could delay a live UFC event. | HOLD | 13 |
| `ufc-v2-fast4-ticket-shopping` | Name something a UFC fan might check before buying tickets. | ADVANCE — fact/acceptance pending | 14 |
| `ufc-v2-fast4-camera-shots` | Name a type of camera shot fans often see during a televised UFC fight. | ADVANCE — fact/acceptance pending | 12 |
| `ufc-v2-fast4-fighter-thanks` | Name someone a UFC fighter might thank during a post-fight interview. | ADVANCE — fact/acceptance pending | 11 |
| `ufc-v2-fast4-weight-class-switch` | Name a reason a UFC fighter might move to another weight class. | HOLD | 13 |

## Remaining controls

1. Run the exact head's Vitest test file `ufcSportsFeudV2Batch4.test.ts`, regression pack tests and CI. All accepted names/aliases are tested against the actual matcher, but editorial truth/fairness is a separate approval gate.
2. Name-specific opponent lists such as Conor/Nunes/Anderson/GSP share a broader semantic **named-fighter-opponents** task. Event roster lists and promotion crossover lists have similar inter-question cooldown needs. Eight different fighter names or event numbers do NOT make eight fully different question types.
3. A future-only published selector must guarantee 20 UFC Feud appearances, 2 Main +5 Fast per appearance with semantic nonrepeat and stable results, while legacy Daily cards and leaderboards remain immutable.
4. The draft PR requires all exact-head checks green and up-to-date with current main before merging. **Merging draft-only files would NOT activate a revised question bank in production.**

## Full ranked / off-board / nickname matrix

### ufc-v2-main4-mcgregor-opponents

**Prompt:** Name a fighter who has faced Conor McGregor in an official UFC bout.

**Eight ranked examples, not survey results:** 1. Khabib Nurmagomedov; 2. Nate Diaz; 3. Dustin Poirier; 4. Max Holloway; 5. Jose Aldo; 6. Eddie Alvarez; 7. Chad Mendes; 8. Donald Cerrone.

**Other named accepted answers (3):** Marcus Brimage; Diego Brandao; Dennis Siver.

**Alias mappings:** Jose Aldo → Aldo; Donald Cerrone → Cowboy; Khabib Nurmagomedov → Khabib; Eddie Alvarez → The Underground King; Nate Diaz → Nate.

**Editorial disposition:** Advance to full verification. UFC official career record verifies UFC opponents (not hypothetical scheduled bouts). This prompt is a finite fighter-name identity task.

**Sources:** https://www.ufc.com/athlete/conor-mcgregor; https://www.ufc.com/news/all-conor-mcgregors-ufc-wins-fight-pass


### ufc-v2-main4-anderson-silva-opponents

**Prompt:** Name a fighter who faced Anderson Silva in a UFC bout.

**Eight ranked examples, not survey results:** 1. Chris Weidman; 2. Chael Sonnen; 3. Vitor Belfort; 4. Rich Franklin; 5. Dan Henderson; 6. Israel Adesanya; 7. Nick Diaz; 8. Michael Bisping.

**Other named accepted answers (14):** Chris Leben; Nate Marquardt; Patrick Cote; Thales Leites; Forrest Griffin; Demian Maia; Yushin Okami; Stephan Bonnar; Daniel Cormier; Derek Brunson; Jared Cannonier; Uriah Hall; James Irvin; Travis Lutter.

**Alias mappings:** Chris Weidman → Weidman; Chael Sonnen → Chael; Vitor Belfort → The Phenom; Rich Franklin → Ace; Michael Bisping → The Count; Israel Adesanya → Izzy.

**Editorial disposition:** Hold. This is a second near-identical named-fighter opponent-list prompt. Factual roster useful, but do not count it as another independent semantic category in a 20-appearance cycle.

**Sources:** https://www.ufc.com.br/athlete/anderson-silva; https://www.ufc.com/athlete/anderson-silva


### ufc-v2-main4-amanda-nunes-opponents

**Prompt:** Name a fighter who faced Amanda Nunes in a UFC bout.

**Eight ranked examples, not survey results:** 1. Ronda Rousey; 2. Miesha Tate; 3. Valentina Shevchenko; 4. Cris Cyborg; 5. Holly Holm; 6. Julianna Pena; 7. Irene Aldana; 8. Raquel Pennington.

**Other named accepted answers (8):** Germaine de Randamie; Felicia Spencer; Megan Anderson; Sara McMann; Cat Zingano; Sheila Gaff; Liz Carmouche; Shayna Baszler.

**Alias mappings:** Cris Cyborg → Cyborg; Julianna Pena → Julianna Peña; Miesha Tate → Cupcake; Valentina Shevchenko → Bullet.

**Editorial disposition:** Advance to full verification. Corrected to remove Sarah Kaufman, Alexis Davis and Julia Budd, who faced Nunes outside the UFC, along with a previously unsupported opponent.

**Sources:** https://www.ufc.com/news/ufc-womens-bantamweight-title-lineage-Rousey-Holm-Tate-Nunes-Pena; https://www.ufc.com/news/ufc-womens-featherweight-title-lineage-De-Randamie-Cyborg-Nunes; https://us.ufcespanol.com/athlete/amanda-nunes


### ufc-v2-main4-bellator-ufc-veterans

**Prompt:** Name a fighter who competed in both Bellator MMA and the UFC.

**Eight ranked examples, not survey results:** 1. Michael Chandler; 2. Eddie Alvarez; 3. Ben Askren; 4. Gegard Mousasi; 5. Ryan Bader; 6. Benson Henderson; 7. Rory MacDonald; 8. Cris Cyborg.

**Other named accepted answers (8):** Quinton Jackson; Tito Ortiz; Frank Mir; Lyoto Machida; Corey Anderson; Phil Davis; Aaron Pico; Yoel Romero.

**Alias mappings:** Quinton Jackson → Rampage Jackson; Cris Cyborg → Cyborg; Michael Chandler → Chandler; Ben Askren → Funky.

**Editorial disposition:** Hold. Cross-promotion roster duplicates WEC, Strikeforce and PRIDE-to-UFC concepts; preserve verified data but limit to one promotion-crossover topic per cooldown.

**Sources:** https://www.ufc.com/news/dana-white-announces-michael-chandler-signing-ufc-254-backup; https://www.ufc.com/news/third-title-ben-in-askrens-sights-ufc-239


### ufc-v2-fast4-arena-snacks

**Prompt:** Name a food you might buy at a UFC arena concession stand.

**Eight ranked examples, not survey results:** 1. Hot dog; 2. Pizza; 3. Nachos; 4. Popcorn; 5. Chicken tenders; 6. Pretzel; 7. Hamburger; 8. French fries.

**Other named accepted answers (14):** Wings; Candy; Chips; Tacos; Sandwich; Nuts; Peanuts; Ice cream; Cookie; Sausage; Salad; Chicken sandwich; Sushi; Wrap.

**Alias mappings:** Hot dog → Hotdog; Hamburger → Burger; French fries → Fries; Chicken tenders → Chicken strips; Pretzel → Soft pretzel.

**Editorial disposition:** Advance to full verification. Easy fight-night concession foods, deliberately unrelated to MMA specialist trivia; venue menus vary so permit appropriate off-board foods.


### ufc-v2-fast4-arena-entry

**Prompt:** Name something a fan might do when entering the arena for a UFC event.

**Eight ranked examples, not survey results:** 1. Scan ticket; 2. Wait in line; 3. Pass security; 4. Show ID; 5. Check bag; 6. Find entrance gate; 7. Go through metal detector; 8. Find seat.

**Other named accepted answers (12):** Use mobile ticket; Have ticket checked; Empty pockets; Get wristband; Ask usher; Enter through turnstile; Follow signs; Show QR code; Visit ticket desk; Check arena rules; Take off jacket; Show pass.

**Alias mappings:** Scan ticket → Scan QR code, Scan mobile ticket, Have ticket scanned, Show ticket; Pass security → Security screening, Security check; Check bag → Bag search, Bag inspection; Find entrance gate → Find gate; Find seat → Go to seat.

**Editorial disposition:** Advance to full verification. Concrete ticket, security and seating experiences; be generous with natural variants.


### ufc-v2-fast4-fan-carry

**Prompt:** Name an item a fan might bring to watch a UFC event in person.

**Eight ranked examples, not survey results:** 1. Phone; 2. Ticket; 3. Wallet; 4. ID; 5. Jacket; 6. Hat; 7. Country flag; 8. Handmade sign.

**Other named accepted answers (15):** Camera; Backpack; Purse; Keys; Sunglasses; Portable charger; Cash; Credit card; Fighter poster; Water bottle; Earplugs; Merchandise; Replica belt; Binoculars; Team shirt.

**Alias mappings:** Phone → Cell phone; Ticket → Entry ticket, Mobile ticket; ID → Identification; Handmade sign → Poster, Sign; Country flag → Flag; Portable charger → Power bank.

**Editorial disposition:** Advance to full verification. Real-world fan items; refine any arena-specific prohibited items before release.


### ufc-v2-fast4-crowd-boos

**Prompt:** Name something that might make UFC fans boo during an event.

**Eight ranked examples, not survey results:** 1. Slow fight; 2. Controversial decision; 3. Unpopular fighter; 4. Bad referee stoppage; 5. Too much clinching; 6. Eye poke; 7. Trash talk; 8. Long delay.

**Other named accepted answers (9):** Fence grab; Foul; Running away; No action; Bad call; No contest; Opponent disrespect; Interrupted fight; Canceled bout.

**Alias mappings:** Slow fight → Boring fight, Stalling; Controversial decision → Bad judging; Bad referee stoppage → Unfair stoppage; Trash talk → Disrespect.

**Editorial disposition:** Hold. Emotionally understandable but no defensible finite boundary for what can make a fan boo; too high an unfair-strike risk.


### ufc-v2-fast4-referee-foul

**Prompt:** Name something a UFC referee might do after a fighter commits a foul.

**Eight ranked examples, not survey results:** 1. Stop the action; 2. Issue warning; 3. Deduct a point; 4. Give recovery time; 5. Call a doctor; 6. Separate fighters; 7. Restart the fight; 8. Disqualify fighter.

**Other named accepted answers (11):** Wave fight off; Send opponent to neutral corner; Speak to judges; Consult official; Check injured fighter; Announce point deduction; Pause the clock; Review the foul; Reset the position; Ask fighter if able to continue; Disqualification.

**Alias mappings:** Stop the action → Stop fight, Pause fight; Issue warning → Warn fighter, Warning; Deduct a point → Point deduction, Take a point; Call a doctor → Doctor check, Medical evaluation; Give recovery time → Recovery time; Disqualify fighter → DQ.

**Editorial disposition:** Advance to full verification. Concrete responses to fouls; review any jurisdiction-specific variation and warn vs deduct distinctions.


### ufc-v2-fast4-mma-news

**Prompt:** Name a media outlet where a UFC fan might read or hear MMA news.

**Eight ranked examples, not survey results:** 1. ESPN; 2. UFC.com; 3. MMA Fighting; 4. MMA Junkie; 5. Sherdog; 6. CBS Sports; 7. Bleacher Report; 8. Sports Illustrated.

**Other named accepted answers (13):** Yahoo Sports; The Athletic; Bloody Elbow; MMAMania; Fightful; BBC Sport; TSN; Fox Sports; USA Today; YouTube news channel; Local news; Sports radio; MMA podcast.

**Alias mappings:** UFC.com → UFC website; ESPN → ESPN MMA; MMA Junkie → MMAJunkie; CBS Sports → CBS.

**Editorial disposition:** Advance to full verification. Real named MMA coverage outlets, verify contemporary operating status but accept historical-known outlets where appropriate.


### ufc-v2-fast4-fighter-posts

**Prompt:** Name a type of content UFC fighters commonly share on social media.

**Eight ranked examples, not survey results:** 1. Training video; 2. Fight announcement; 3. Highlight clip; 4. Family photo; 5. Sponsor ad; 6. Selfie; 7. Weigh-in photo; 8. Behind-the-scenes video.

**Other named accepted answers (15):** Workout photos; Interview; Fan thank-you; Gym footage; Travel photos; Callout; Fight poster; Recovery update; Podcast clip; Meal photo; Victory celebration; Coach appreciation; Charity work; Injury update; Live stream.

**Alias mappings:** Training video → Training footage; Fight announcement → Fight news; Sponsor ad → Advertisement; Behind-the-scenes video → Backstage footage; Highlight clip → Highlights.

**Editorial disposition:** Advance to full verification. Familiar social-media content, no single celebrity identity required. Broad acceptance for reasonable post types.


### ufc-v2-fast4-delay-causes

**Prompt:** Name something that could delay a live UFC event.

**Eight ranked examples, not survey results:** 1. Injury check; 2. Long fight; 3. Medical timeout; 4. Equipment problem; 5. Broadcast issue; 6. Late walkout; 7. Replay review; 8. Arena technical issue.

**Other named accepted answers (13):** Doctor stoppage; Extra time between fights; Fighter unavailable; Power failure; Microphone issue; Audio problem; Camera issue; Security issue; Unscheduled interruption; Fight card change; Transportation delay; Cage problem; Lighting malfunction.

**Alias mappings:** Injury check → Doctor check; Broadcast issue → TV issue; Arena technical issue → Technical difficulty; Medical timeout → Medical delay; Equipment problem → Equipment malfunction.

**Editorial disposition:** Hold. Overlaps reasons fights get canceled and pre-event technical details; may need a tighter delay-only scope.


### ufc-v2-fast4-ticket-shopping

**Prompt:** Name something a UFC fan might check before buying tickets.

**Eight ranked examples, not survey results:** 1. Ticket price; 2. Seat location; 3. Main event; 4. Date; 5. Venue; 6. Fight card; 7. Parking; 8. Start time.

**Other named accepted answers (14):** Resale price; Travel costs; Row; Who is fighting; Ticket fees; View from seat; Ticket availability; Ticket seller; Refund policy; Hotels; Distance from home; Accessibility; Age restrictions; Door time.

**Alias mappings:** Ticket price → Cost, Price; Seat location → Seat, Section; Main event → Headliner; Date → Event date; Venue → Arena, Location.

**Editorial disposition:** Advance to full verification. Fans can immediately think of price, opponent, location or seat; widen accepted considerations.


### ufc-v2-fast4-camera-shots

**Prompt:** Name a type of camera shot fans often see during a televised UFC fight.

**Eight ranked examples, not survey results:** 1. Close-up; 2. Wide shot; 3. Overhead shot; 4. Slow-motion replay; 5. Corner shot; 6. Crowd shot; 7. Walkout camera; 8. Cage-side angle.

**Other named accepted answers (12):** Ground-level angle; Handheld shot; Follow camera; Fighter face close-up; Replay angle; Camera zoom; Audience reaction; Referee shot; Ring announcer shot; Cage-door shot; Low angle; Broadcast cutaway.

**Alias mappings:** Close-up → Close up; Wide shot → Wide angle; Overhead shot → Aerial view, Overhead camera; Slow-motion replay → Slow motion, Slo-mo; Crowd shot → Audience shot.

**Editorial disposition:** Advance to full verification. A distinct UFC production/visual topic, unlike commentary identities or fighter statistics.


### ufc-v2-fast4-fighter-thanks

**Prompt:** Name someone a UFC fighter might thank during a post-fight interview.

**Eight ranked examples, not survey results:** 1. Coaches; 2. Family; 3. Fans; 4. Training partners; 5. God; 6. Teammates; 7. Sponsors; 8. Opponent.

**Other named accepted answers (11):** UFC staff; Gym; Cornermen; Spouse; Children; Country; Manager; Promoter; Medical staff; Training camp; Friends.

**Alias mappings:** Coaches → Coach; Training partners → Sparring partners; Teammates → Team; Fans → Supporters; Family → Mom, Dad, Parents.

**Editorial disposition:** Advance to full verification. Post-fight family, coaches, teammates and fans are intuitive; avoid false split between "family" and "parents".


### ufc-v2-fast4-weight-class-switch

**Prompt:** Name a reason a UFC fighter might move to another weight class.

**Eight ranked examples, not survey results:** 1. Difficult weight cut; 2. Title opportunity; 3. Size advantage; 4. New challenge; 5. Health concerns; 6. Performance problems; 7. Age; 8. Advice from coaches.

**Other named accepted answers (13):** Missed weight; Better matchups; More energy; New opponent; Weight gain; Weight loss; Wants second belt; Fight availability; Injury recovery; Training change; Long-term safety; Too small for division; Too big for division.

**Alias mappings:** Difficult weight cut → Hard cut, Weight cut; Title opportunity → Second belt; Health concerns → Health; Advice from coaches → Coach recommendation.

**Editorial disposition:** Hold. Weight-change motivations are highly subjective and open-ended; would need more permissive off-board acceptance before playing.
