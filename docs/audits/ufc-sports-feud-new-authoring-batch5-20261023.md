# UFC Sports Feud — batch 5 authored and reviewed (October 23, 2026)

**Branch:** `content/ufc-feud-v2-batch5-20261023`, based on production `main` SHA `ec0944bb62ece69f70cc3c86b2611bfbde589ce7`. This entire addition is **EDITORIAL ONLY**. All question sets in batch five are kept out of every live import path; publishing, gameplay, grading production, user scores, and result snapshots remain untouched.

## Fifth batch output

- **22 question drafts:** seven Main Round and fifteen Fast Money; each one authored only once.
- **14 advance to independent fact and answer review**, **eight HELD** for overlap, excessive ambiguity, generic content or dynamic sponsor trivia. Advance is **not** final production approval.
- Of those fourteen advancing boards, only **ten genuinely different semantic families** are present. Five nationality-based fighter questions all share one "fighter from [country]" recall format, and must count as **one** family for the future cooldown rather than five.
- All 22 have eight distinct ranked editorial answers, additional accepted/off-board responses, and 89 explicitly authored aliases. Source-level alias review found no canonical collisions across 348 accepted names. Matcher tests still must run.
- All five nationality-based Fast Money boards now use `entityKind: person`, allowing the actual matcher to recognize unique surnames such as Horiguchi, Fiorot and Tybura, and to refuse ambiguous ones such as Nakamura, Kim, or Zhang rather than wrongly picking a fighter. Added explicit positive/negative regression tests.
- Major factual catch: **Kevin Jackson** was a Division I wrestling **runner-up** (1987), not an NCAA Division I champion. His answer was removed. UFC records also confirm **Doo Ho Choi is South Korean**, not Japanese, and **Gregory Rodrigues lost on Contender Series** rather than signing directly through a DWCS win. Regression negative-answer checks were added. These corrections prevent incorrect player credit, not just spelling issues.

## Combined editorial inventory (not approved live content)

| Source | Main rows | Fast rows | Total rows |
|---|---:|---:|---:|
| New, batches 1–4 | 19 | 65 | 84 |
| New, batch 5 | 7 | 15 | 22 |
| **All newly authored** | **26** | **80** | **106** |
| Existing KEEP family copies | 8 | 12 | 20 |
| Existing rewrite candidates (still not rewritten / approved) | 15 | 0 | 15 |
| **All staged candidate rows** | **49** | **92** | **141** |

The aspirational fully independent pool remains **70 Main / 140 Fast**. A 20-appearance rotation with two Main and five Fast per appearance requires at least **40 actual nonrepeating Main and 100 actual nonrepeating Fast** semantic slots before considering opponent, geography, tournament, or title-winning overlaps. Even though staged Main rows exceed 40, multiple candidates share a semantic task and/or remain held. The Fast side is still below the 100-row minimum *before* holds. Do not activate these incomplete rows or claim the 210 target was achieved.

## Main Round concepts

| Draft ID | Question | First-pass verdict | Semantic family |
|---|---|---|---|
| `ufc-v2-main5-dwcs-graduates` | Name a UFC fighter who earned a UFC opportunity through Dana White's Contender Series. | ADVANCE | `contender-series-alumni` |
| `ufc-v2-main5-ncaa-champs` | Name a UFC fighter who won an NCAA Division I national wrestling championship. | ADVANCE | `ncaa-division1-wrestling-champions` |
| `ufc-v2-main5-military-vets` | Name a UFC fighter who served in the United States military. | ADVANCE | `military-veteran-fighters` |
| `ufc-v2-main5-professional-boxers` | Name a fighter who competed in the UFC and also had a professional boxing bout. | ADVANCE | `ufc-fighter-boxing-crossovers` |
| `ufc-v2-main5-bareknuckle-alumni` | Name a former UFC fighter who has also competed in bare-knuckle boxing. | HOLD | `ufc-fighter-boxing-crossovers` |
| `ufc-v2-main5-title-by-strikes` | Name a fighter who first won an undisputed UFC championship with a KO or TKO in the title-winning bout. | HOLD | `undisputed-title-winning-finish-methods` |
| `ufc-v2-main5-ufc-siblings` | Name a fighter whose brother or sister has also fought in the UFC. | ADVANCE | `ufc-family-siblings` |

## Fast Money concepts

| Draft ID | Question | First-pass verdict | Semantic family |
|---|---|---|---|
| `ufc-v2-fast5-japanese-fighters` | Name a Japanese fighter who has competed in the UFC. | ADVANCE | `nationality-fighter-recognition` |
| `ufc-v2-fast5-korean-fighters` | Name a fighter from South Korea who has competed in the UFC. | ADVANCE | `nationality-fighter-recognition` |
| `ufc-v2-fast5-polish-fighters` | Name a Polish fighter who has competed in the UFC. | ADVANCE | `nationality-fighter-recognition` |
| `ufc-v2-fast5-chinese-fighters` | Name a fighter from China who has competed in the UFC. | ADVANCE | `nationality-fighter-recognition` |
| `ufc-v2-fast5-french-fighters` | Name a French UFC fighter. | ADVANCE | `nationality-fighter-recognition` |
| `ufc-v2-fast5-us-host-states` | Name a U.S. state that has hosted a UFC event. | HOLD | `ufc-event-host-geography` |
| `ufc-v2-fast5-historic-tv` | Name a channel or streaming service that has carried UFC fights. | ADVANCE | `ufc-broadcast-distribution` |
| `ufc-v2-fast5-scorecards` | Name something a UFC judge's official scorecard might contain. | ADVANCE | `ufc-judge-scorecard-details` |
| `ufc-v2-fast5-film-study` | Name something a UFC coach might study while reviewing an opponent's old fights. | HOLD | `mma-scouting-criteria` |
| `ufc-v2-fast5-prior-sports` | Name a sport a UFC fighter might have played before starting MMA. | HOLD | `mma-fighter-athletic-backgrounds` |
| `ufc-v2-fast5-fight-card-parts` | Name a part of a UFC event's fight-card running order. | HOLD | `ufc-card-running-order` |
| `ufc-v2-fast5-fighter-gear-care` | Name something an MMA fighter might do to keep training equipment clean or usable. | HOLD | `mma-training-gear` |
| `ufc-v2-fast5-other-promotions` | Name another MMA promotion where fighters who later joined the UFC have competed. | ADVANCE | `mma-promotion-names` |
| `ufc-v2-fast5-ufc-sponsors` | Name a brand that has sponsored or officially partnered with the UFC. | HOLD | `ufc-historical-commercial-partners` |
| `ufc-v2-fast5-ufc-programming` | Name a UFC-produced video series or show that fans might watch outside a live event. | ADVANCE | `ufc-original-fan-media-shows` |

## Editorial principles and needed next work

1. **Specific UFC identity first.** UFC siblings, DWCS alumni, actual NCAA Division I winners, military veterans and sanctioned professional-boxing crossovers are stronger Main recall tasks than unbounded "legendary" or "elite" questions. Any answer involving changing statuses must have supporting dated records.
2. **Fast Money remains quick.** Scorecard basics, historical platforms, major original UFC shows and other MMA promotions are approachable. Country fighter names can rotate occasionally but one country label cannot multiply the bank indefinitely.
3. **No ad trivia padding.** The UFC sponsorship board is held while we determine whether it is genuinely fun and fair. UFC partner names change. Official deal references include https://www.ufc.com/news/ufc-signs-energy-drink-partnership-monster-energy, https://www.ufc.com/news/ufc-and-toyo-tires-renew-long-standing-partnership and https://www.ufc.com/news/ufc-and-venum-announce-long-term-extension-exclusive-global-outfitting-and-apparel-partnership.
4. **Alias grades must be unambiguous.** A spelling variant or nickname must refer to one accepted fighter on that board, not a second scored answer. Grade each correct off-board answer as accepted but do not pretend editorial ranks came from an actual survey.
5. **Respect true semantic grouping.** Separate IDs are insufficient; keep all country-specific fighter answers in one `nationality-fighter-recognition` family. Likewise bare-knuckle and pro boxing are closely related MMA-to-boxing crossovers, while title-winning KO and title-winning submission are one title-winning-finish-method family. Maintain 20 appearances of topic cooldown across both rounds.
6. **No deletion of history.** Preserve original 350 source rows and published results; when a future versioned selector is created, use only final verified banks, no modifications to historical packets or prior leaderboard grades.

**Next verification:** `ufcSportsFeudV2Batch5.test.ts` and `ufcSportsFeudV2InventoryGate.test.ts`, then exact-branch CI. Stay on review branch; **do not merge** without fresh approval.

## Complete batch-five answer matrices

### `ufc-v2-main5-dwcs-graduates`

**Prompt:** Name a UFC fighter who earned a UFC opportunity through Dana White's Contender Series.

**Eight ranked editorial answers (not surveyed popularity):** 1. Sean O'Malley; 2. Jamahal Hill; 3. Bo Nickal; 4. Johnny Walker; 5. Maycee Barber; 6. Jack Della Maddalena; 7. Carlos Ulberg; 8. Geoff Neal.

**Additional accepted answers (10):** Joe Pyfer; Michael Morales; Anthony Hernandez; Jailton Almeida; Sean Woodson; Punahele Soriano; Sodiq Yusuff; Gregory Rodrigues; Carlos Prates; Quillan Salkilld.

**Aliases (4):** Sean O'Malley = Suga Sean; Jamahal Hill = Sweet Dreams; Jack Della Maddalena = JDM; Carlos Ulberg = Black Jag.

**Decision:** ADVANCE — Recognizable DWCS graduates; recheck every signed contract and aliases

**Research references:** https://www.ufc.com/dwcs; https://www.ufc.com/news/champions-dana-whites-contender-series.


### `ufc-v2-main5-ncaa-champs`

**Prompt:** Name a UFC fighter who won an NCAA Division I national wrestling championship.

**Eight ranked editorial answers (not surveyed popularity):** 1. Brock Lesnar; 2. Bo Nickal; 3. Ben Askren; 4. Mark Coleman; 5. Johny Hendricks; 6. Phil Davis; 7. Gregor Gillespie; 8. Kevin Randleman.

**Additional accepted answers (2):** Josh Koscheck; Mark Schultz.

**Aliases (3):** Ben Askren = Funky; Johny Hendricks = Bigg Rigg; Mark Coleman = The Hammer.

**Decision:** ADVANCE — Concrete NCAA championship result; corrected Kevin Jackson 1987 runner-up

**Research references:** https://www.ufc.com/athlete/bo-nickal; https://www.ufc.com/news/wrestling-greats-made-transition-mma; https://en.wikipedia.org/wiki/1987_NCAA_Division_I_Wrestling_Championships.


### `ufc-v2-main5-military-vets`

**Prompt:** Name a UFC fighter who served in the United States military.

**Eight ranked editorial answers (not surveyed popularity):** 1. Brian Stann; 2. Tim Kennedy; 3. Liz Carmouche; 4. Neil Magny; 5. Colton Smith; 6. Randy Couture; 7. Brandon Vera; 8. Rich Clementi.

**Additional accepted answers (1):** Jorge Rivera.

**Aliases (3):** Brian Stann = All American; Liz Carmouche = Girlrilla; Randy Couture = The Natural.

**Decision:** ADVANCE — Official UFC coverage plus individual service histories

**Research references:** https://www.ufc.com/news/military-vets-fight-troops-card; https://www.ufc.com/news/brian-stann-retires-32; https://www.ufc.com/news/colton-smith-living-proof-experience-comes-many-forms.


### `ufc-v2-main5-professional-boxers`

**Prompt:** Name a fighter who competed in the UFC and also had a professional boxing bout.

**Eight ranked editorial answers (not surveyed popularity):** 1. Conor McGregor; 2. Francis Ngannou; 3. Anderson Silva; 4. Holly Holm; 5. Nate Diaz; 6. Tyron Woodley; 7. Jorge Masvidal; 8. Ben Askren.

**Additional accepted answers (1):** Chris Avila.

**Aliases (4):** Conor McGregor = Conor; Francis Ngannou = The Predator; Jorge Masvidal = Gamebred; Ben Askren = Funky.

**Decision:** ADVANCE — Verify sanctioned professional boxing bouts, not exhibitions

**Research references:** https://www.ufc.com/athlete/conor-mcgregor; https://www.ufc.com/athlete/holly-holm; https://www.ufc.com/athlete/nate-diaz.


### `ufc-v2-main5-bareknuckle-alumni`

**Prompt:** Name a former UFC fighter who has also competed in bare-knuckle boxing.

**Eight ranked editorial answers (not surveyed popularity):** 1. Mike Perry; 2. Paige VanZant; 3. Chad Mendes; 4. Artem Lobov; 5. Chris Leben; 6. Bec Rawlings; 7. Eddie Alvarez; 8. Ben Rothwell.

**Additional accepted answers (8):** John Dodson; Jeremy Stephens; Alan Belcher; Hector Lombard; Thiago Alves; Rachael Ostovich; Melvin Guillard; Jimmie Rivera.

**Aliases (3):** Mike Perry = Platinum; Paige VanZant = 12 Gauge; Artem Lobov = Russian Hammer.

**Decision:** HOLD — Shares the crossover recall task with conventional boxing; can be a later alternative

**Research references:** https://www.ufc.com/athlete/mike-perry; https://www.ufc.com/athlete/paige-vanzant.


### `ufc-v2-main5-title-by-strikes`

**Prompt:** Name a fighter who first won an undisputed UFC championship with a KO or TKO in the title-winning bout.

**Eight ranked editorial answers (not surveyed popularity):** 1. Conor McGregor; 2. Holly Holm; 3. Chris Weidman; 4. Francis Ngannou; 5. Charles Oliveira; 6. Anderson Silva; 7. Israel Adesanya; 8. Sean O'Malley.

**Additional accepted answers (5):** Jon Jones; Stipe Miocic; Alex Pereira; Georges St-Pierre; Rashad Evans.

**Aliases (3):** Conor McGregor = The Notorious; Jon Jones = Bones; Georges St-Pierre = GSP.

**Decision:** HOLD — Too close to existing Main title-winning submission board

**Research references:** https://www.ufc.com/event/ufc-194; https://www.ufc.com/event/ufc-260; https://www.ufc.com/event/ufc-292.


### `ufc-v2-main5-ufc-siblings`

**Prompt:** Name a fighter whose brother or sister has also fought in the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. Nick Diaz; 2. Nate Diaz; 3. Anthony Pettis; 4. Sergio Pettis; 5. Valentina Shevchenko; 6. Antonina Shevchenko; 7. Antonio Rodrigo Nogueira; 8. Antonio Rogerio Nogueira.

**Additional accepted answers (10):** Ken Shamrock; Frank Shamrock; Kamaru Usman; Mohammed Usman; Dan Miller; Jim Miller; Matt Hughes; Mark Hughes; Joe Lauzon; Dan Lauzon.

**Aliases (10):** Nick Diaz = Nick; Nate Diaz = Nate; Anthony Pettis = Showtime; Valentina Shevchenko = Bullet; Antonio Rodrigo Nogueira = Big Nog, Minotauro; Antonio Rogerio Nogueira = Lil Nog, Minotouro; Frank Shamrock = Frank; Ken Shamrock = Ken.

**Decision:** ADVANCE — Official UFC sibling profiles; adopted siblings included

**Research references:** https://www.ufc.com/news/national-sibling-day-diaz-brothers-shevchenko-sisters; https://www.ufc.com/news/fighting-brothers-ufc-128; https://www.ufc.com/news/brothers-armbars-raw-story.


### `ufc-v2-fast5-japanese-fighters`

**Prompt:** Name a Japanese fighter who has competed in the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. Yushin Okami; 2. Kyoji Horiguchi; 3. Takanori Gomi; 4. Tatsuro Taira; 5. Takeya Mizugaki; 6. Caol Uno; 7. Kazushi Sakuraba; 8. Rinya Nakamura.

**Additional accepted answers (8):** Hatsu Hioki; Yuki Kondo; Norifumi Yamamoto; Keita Nakamura; Takanori Kikuno; Shinsho Anzai; Teruto Ishihara; Yuta Sasaki.

**Aliases (2):** Norifumi Yamamoto = Kid Yamamoto; Takanori Gomi = Fireball Kid.

**Decision:** ADVANCE — Same recall task as four other new nationality boards


### `ufc-v2-fast5-korean-fighters`

**Prompt:** Name a fighter from South Korea who has competed in the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. The Korean Zombie; 2. Dong Hyun Kim; 3. Doo Ho Choi; 4. Kyung Ho Kang; 5. Jun Yong Park; 6. Da Un Jung; 7. Seung Woo Choi; 8. Ji Yeon Kim.

**Additional accepted answers (6):** Hyun Sung Park; Chan Mi Jeon; Tae Hyun Bang; Yui Chul Nam; Sung Bin Jo; Seokhyeon Ko.

**Aliases (4):** The Korean Zombie = Chan Sung Jung; Doo Ho Choi = Korean Superboy; Dong Hyun Kim = Stun Gun; Jun Yong Park = Iron Turtle.

**Decision:** ADVANCE — Same nationality recall family; never a different 20-appearance topic


### `ufc-v2-fast5-polish-fighters`

**Prompt:** Name a Polish fighter who has competed in the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. Joanna Jedrzejczyk; 2. Jan Blachowicz; 3. Mateusz Gamrot; 4. Marcin Tybura; 5. Karolina Kowalkiewicz; 6. Krzysztof Jotko; 7. Michal Oleksiejczuk; 8. Marcin Held.

**Additional accepted answers (6):** Damian Stasiak; Daniel Omielanczuk; Piotr Hallmann; Lukasz Brzeski; Tomasz Drwal; Bartosz Fabinski.

**Aliases (3):** Joanna Jedrzejczyk = Joanna Champion; Jan Blachowicz = Jan Błachowicz; Michal Oleksiejczuk = Michał Oleksiejczuk.

**Decision:** ADVANCE — Same nationality recall family; never a different 20-appearance topic


### `ufc-v2-fast5-chinese-fighters`

**Prompt:** Name a fighter from China who has competed in the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. Zhang Weili; 2. Yan Xiaonan; 3. Song Yadong; 4. Li Jingliang; 5. Su Mudaerji; 6. Zhang Mingyang; 7. Wang Cong; 8. Aoriqileng.

**Additional accepted answers (7):** Wu Yanan; Zhang Lipeng; Ma Yaozong; Heili Alateng; Zhu Rong; Zhang Tiequan; Liu Pingyuan.

**Aliases (3):** Zhang Weili = Weili Zhang; Li Jingliang = The Leech; Song Yadong = Yadong Song.

**Decision:** ADVANCE — Same nationality recall family; never a different 20-appearance topic


### `ufc-v2-fast5-french-fighters`

**Prompt:** Name a French UFC fighter.

**Eight ranked editorial answers (not surveyed popularity):** 1. Ciryl Gane; 2. Benoit Saint Denis; 3. Manon Fiorot; 4. Cheick Kongo; 5. Morgan Charriere; 6. William Gomis; 7. Fares Ziam; 8. Taylor Lapilus.

**Additional accepted answers (4):** Nassourdine Imavov; Oumar Sy; Cyrille Diabate; Mickael Lebout.

**Aliases (4):** Ciryl Gane = Bon Gamin; Benoit Saint Denis = Benoît Saint-Denis, God of War; Morgan Charriere = The Last Pirate.

**Decision:** ADVANCE — Same nationality recall family; verify citizenship or representation


### `ufc-v2-fast5-us-host-states`

**Prompt:** Name a U.S. state that has hosted a UFC event.

**Eight ranked editorial answers (not surveyed popularity):** 1. Nevada; 2. New York; 3. California; 4. Texas; 5. Florida; 6. New Jersey; 7. Massachusetts; 8. Colorado.

**Additional accepted answers (16):** Arizona; Georgia; Illinois; Louisiana; Utah; Tennessee; Pennsylvania; Washington; Ohio; Michigan; Missouri; North Carolina; Connecticut; Wisconsin; Oklahoma; Virginia.

**Aliases (3):** Nevada = NV; Texas = TX; New York = NY.

**Decision:** HOLD — Overlaps existing event host country and venue question families


### `ufc-v2-fast5-historic-tv`

**Prompt:** Name a channel or streaming service that has carried UFC fights.

**Eight ranked editorial answers (not surveyed popularity):** 1. ESPN; 2. FOX; 3. Spike TV; 4. ABC; 5. UFC Fight Pass; 6. Paramount+; 7. CBS; 8. FX.

**Additional accepted answers (8):** FS1; Fuel TV; Fox Sports 2; Versus; ESPN2; Fox Deportes; ESPN Deportes; PPV provider.

**Aliases (6):** ESPN = ESPN+; FOX = Fox; Spike TV = Spike; UFC Fight Pass = Fight Pass; Paramount+ = Paramount Plus; FS1 = Fox Sports 1.

**Decision:** ADVANCE — Historical carriers including 2026 Paramount+ and CBS


### `ufc-v2-fast5-scorecards`

**Prompt:** Name something a UFC judge's official scorecard might contain.

**Eight ranked editorial answers (not surveyed popularity):** 1. Fighter names; 2. Round numbers; 3. 10-9 score; 4. Judge name; 5. Total scores; 6. Point deductions; 7. Event name; 8. 10-8 score.

**Additional accepted answers (10):** Judge signature; Red corner; Blue corner; Date; Weight class; 10-10 round; Fight number; Commission; Winner; Final tally.

**Aliases (4):** Fighter names = Names; Round numbers = Round; Point deductions = Deductions; Total scores = Totals.

**Decision:** ADVANCE — Concrete official judging record fields, not opinions


### `ufc-v2-fast5-film-study`

**Prompt:** Name something a UFC coach might study while reviewing an opponent's old fights.

**Eight ranked editorial answers (not surveyed popularity):** 1. Striking; 2. Takedown defense; 3. Footwork; 4. Submission attempts; 5. Fighting stance; 6. Cardio; 7. Counterpunching; 8. Clinch work.

**Additional accepted answers (13):** Hand speed; Jab; Kicks; Guard; Movement; Range; Ground control; Fight pace; Tendencies; Weaknesses; Knockout power; Combinations; Defensive habits.

**Aliases (3):** Fighting stance = Stance; Clinch work = Clinch; Takedown defense = Wrestling defense.

**Decision:** HOLD — Unbounded qualitative things coaches might notice


### `ufc-v2-fast5-prior-sports`

**Prompt:** Name a sport a UFC fighter might have played before starting MMA.

**Eight ranked editorial answers (not surveyed popularity):** 1. Wrestling; 2. Boxing; 3. Football; 4. Soccer; 5. Basketball; 6. Judo; 7. Karate; 8. Rugby.

**Additional accepted answers (13):** Kickboxing; Taekwondo; Track; Baseball; Gymnastics; Swimming; Hockey; Tennis; Weightlifting; Jiu-jitsu; Sambo; Cycling; Volleyball.

**Aliases (2):** Football = American football; Wrestling = Amateur wrestling.

**Decision:** HOLD — Largely reuses existing combat discipline and training concepts


### `ufc-v2-fast5-fight-card-parts`

**Prompt:** Name a part of a UFC event's fight-card running order.

**Eight ranked editorial answers (not surveyed popularity):** 1. Main event; 2. Co-main event; 3. Main card; 4. Preliminary card; 5. Early preliminaries; 6. Opening bout; 7. Featured prelim; 8. Title fight.

**Additional accepted answers (6):** Undercard; Headline fight; Final fight; Main-card opener; Early prelim bout; Main-card bout.

**Aliases (4):** Main event = Headliner; Co-main event = Co-main; Preliminary card = Prelims; Early preliminaries = Early prelims.

**Decision:** HOLD — Title fight is not a definite running-order slot; needs rewrite


### `ufc-v2-fast5-fighter-gear-care`

**Prompt:** Name something an MMA fighter might do to keep training equipment clean or usable.

**Eight ranked editorial answers (not surveyed popularity):** 1. Wash clothes; 2. Air out gloves; 3. Clean mouthguard; 4. Disinfect pads; 5. Dry gear; 6. Replace worn wraps; 7. Wipe down headgear; 8. Wash shin guards.

**Additional accepted answers (10):** Wash shorts; Clean bag; Wipe gloves; Hang up gear; Dry shoes; Clean protective equipment; Sanitize gear; Repair equipment; Inspect gloves; Keep gear dry.

**Aliases (4):** Wash clothes = Laundry; Air out gloves = Dry gloves; Disinfect pads = Sanitize pads; Dry gear = Hang gear.

**Decision:** HOLD — Too generic and near-duplicates training equipment topic


### `ufc-v2-fast5-other-promotions`

**Prompt:** Name another MMA promotion where fighters who later joined the UFC have competed.

**Eight ranked editorial answers (not surveyed popularity):** 1. PRIDE FC; 2. WEC; 3. Strikeforce; 4. Bellator MMA; 5. PFL; 6. ONE Championship; 7. Cage Warriors; 8. Invicta FC.

**Additional accepted answers (12):** RIZIN; KSW; LFA; Pancrase; Shooto; Titan FC; M-1 Global; EliteXC; King of the Cage; World Series of Fighting; BRAVE CF; BAMMA.

**Aliases (6):** PRIDE FC = Pride; Bellator MMA = Bellator; PFL = Professional Fighters League; ONE Championship = One FC; LFA = Legacy Fighting Alliance; WEC = World Extreme Cagefighting.

**Decision:** ADVANCE — Concrete MMA league names; not fighter names or crossover lists


### `ufc-v2-fast5-ufc-sponsors`

**Prompt:** Name a brand that has sponsored or officially partnered with the UFC.

**Eight ranked editorial answers (not surveyed popularity):** 1. Monster Energy; 2. Venum; 3. Reebok; 4. Modelo; 5. Toyo Tires; 6. Crypto.com; 7. DraftKings; 8. Bud Light.

**Additional accepted answers (8):** Harley-Davidson; BodyArmor; Prime Hydration; MetroPCS; Manscaped; EA Sports; Timex; Jose Cuervo.

**Aliases (5):** Monster Energy = Monster; Toyo Tires = Toyo; Crypto.com = Crypto dot com; DraftKings = Draft Kings; EA Sports = Electronic Arts.

**Decision:** HOLD — Brand recognition feels promotional and partnership dates change


### `ufc-v2-fast5-ufc-programming`

**Prompt:** Name a UFC-produced video series or show that fans might watch outside a live event.

**Eight ranked editorial answers (not surveyed popularity):** 1. The Ultimate Fighter; 2. Dana White's Contender Series; 3. UFC Embedded; 4. UFC Countdown; 5. UFC Unfiltered; 6. UFC Connected; 7. UFC Fight Motion; 8. Dana White: Lookin' for a Fight.

**Additional accepted answers (8):** UFC Primetime; UFC Now; Road to UFC; UFC Free Fight; UFC 25 Years in Short; UFC Fight Pass Originals; UFC Fight Night Preview; UFC Best Of.

**Aliases (6):** The Ultimate Fighter = TUF; Dana White's Contender Series = DWCS; UFC Embedded = Embedded; UFC Countdown = Countdown; Dana White: Lookin' for a Fight = Looking for a Fight; UFC Fight Motion = Fight Motion.

**Decision:** ADVANCE — UFC-specific shows; distinct from event-brand broadcast types
