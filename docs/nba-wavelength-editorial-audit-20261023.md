# NBA Wavelength — initial editorial and game-quality audit (2026-10-23)

## Scope / release contract

Owner-only review. **No official NBA Daily publication, attempts, streaks, leaderboards or championship points.** Both Casual and deterministic Chicago-date Daily sandbox use the approved Football/UFC slider, four adaptive clues, exact 1–100 hidden target, fourth-guess-only scoring (100 minus twice the absolute miss, floored at zero), and the existing result/reveal treatment. Two games comprise each NBA preview and are averaged.

The NBA catalog and its calibration version are independently frozen as `nba-wavelength-catalog-v2` and `nba-wavelength-calibration-v2`. There is no reliance on projected 2026–27 outcomes.

## Content inventory

- **25 distinct categories; 386 individually curated editorial references** (the original 192 are retained without deletion; 194 are added).
- Core basketball skills: ball handling, rebounding, rim protection, midrange jump shooting, finishing at the rim, IQ, outside shooting, scoring, playmaking, athleticism, defense, clutch shots, peak control.
- Broader NBA life: showmanship, trash talk, villain reputation, global cultural influence, defined specific NBA moments, franchise tradition, historical rivalries, home-court atmosphere, draft hype, and famous NBA duos.
- Categories intentionally ask different questions. Midrange means **inside-the-arc jump shots**; outside shooting includes the perimeter; finishing rates touch/power near the hoop and **not** max vertical leap. Rim protection is a basket-specific defensive skill, not an automatic copy of overall defense. Trash talk means **verbal taunts**, villain reputation means the antagonist perception.
- NBA history ranges from Russell/Bird/Magic to active modern players, with recognizable references as the default and some deeper basketball history. No forced 70/30 round slots, no category or subject repeats within a four-clue round.
- Some categories have no truly defensible 1–10 real-world example. A modern partnership's floor does not need to be artificially rated 1 to satisfy a target distribution.

## Why 25 categories

The previous 14-category bank was too narrow for NBA Wavelength. Rather than renaming duplicates or deleting approved clues, eleven **meaningfully different** categories were added. The existing five personality/culture categories remain and gain company from distinct on-court and storytelling categories. Ratings are calibrated to the named dimension only; popular players cannot receive artificially strong handles, rebounding, rim protection, or IQ values simply because they are famous. Draft hype refers to **expectations before debut**, not how the prospect's NBA career eventually turned out. Duo impact refers to the partnership's actual on-court results and fit in its specified years rather than the fame of the names.

## Calibration rules

The ratings are **HQ editorial judgments for an expressly named trait**, not objective stats or all-time player ranks. Every catalog row has a named subject, an NBA-specific contextual phrase, one category, one stable 1–100 rating, and one historical era. The scale bands run low (1–19), developing (20–39), middle (40–59), strong (60–79), elite (80–91) and iconic (92–100). Rating differences of one or two points inside the same band should not be implied to be statistically meaningful.

Audit compares the descriptive evidence against category anchors, checks category collisions, scores at both extremes, rejects identity-ambiguous / context-free copy, and uses fixed historical markers. Each in-game final reveal includes the full scale of shown clues and a clear editorial-opinion disclosure. Changes to a calibrated judgment must increment catalog/calibration versions instead of silently changing old results.

## Representative fairness spot checks

| Category | Weak end | Middle / bridge | High end |
|---|---|---|---|
| Career Legacy | Anthony Bennett (6) | Jeremy Lin (44), Shane Battier (61) | Tim Duncan (98), Michael Jordan (100) |
| Peak Dominance | Anthony Bennett (7) | Tyson Chandler (64) | Shaquille O'Neal (100), Wilt Chamberlain (100) |
| Scoring Threat | Ben Wallace (7) | Jrue Holiday (55) | Kevin Durant (98), Michael Jordan (100) |
| Outside Shooting | Shaquille O'Neal (3) | DeMar DeRozan (59) | Ray Allen (96), Stephen Curry (100) |
| Playmaking | Hassan Whiteside (8) | Bradley Beal (62) | Steve Nash (97), Nikola Jokić (100) |
| Defensive Impact | Trae Young (8) | Andrew Wiggins (72) | Ben Wallace (97), Bill Russell (100) |
| Explosive Athleticism | Zach Randolph (10) | Jimmy Butler (61) | Vince Carter (99), Michael Jordan (99) |
| Clutch Shotmaking | Ben Wallace (5) | Tyrese Maxey (63) | Robert Horry (98), Michael Jordan (100) |
| Playoff Résumé | Anthony Bennett (3) | Trae Young (53) | Stephen Curry (96), Bill Russell (100) |
| Showmanship | Kawhi Leonard (9) | Jimmy Butler (59) | Magic Johnson (98), Shaquille O’Neal (99) |
| Villain Reputation | Boban Marjanović (6) | Kobe Bryant (57) | Draymond Green (97), Bill Laimbeer (100) |
| Cultural Influence | Rudy Gay (9) | Jason Williams (63) | Allen Iverson (99), Michael Jordan (100) |
| Home-Court Heat | 1990s Clippers at Sports Arena (22) | 2011 Dallas title run (76) | 2002 Sacramento ARCO Arena (100) |
| Rivalry Heat | Hornets–Pistons in late 2010s (3) | 2009–10 Magic–Celtics (48) | historic Celtics–Lakers (100) |

## Generator / replay quality contract

The 100 possible target numbers are seeded without category-specific target distortion. The first clue is selected near the target, then the next three clues **adapt to the last submitted guess**, using the existing shared correction function and NBA's rated bank; the hidden target never moves. Each game uses four unique categories and four unique subjects. The second game begins with a different category, subject and a target at least 12 points apart. During Game 1, its generator reserves Game 2's opening subject; Game 2 avoids every completed Game 1 subject. Recent Casual completions supply a browser-local clue/subject/target exclusion preference; exhaustion relaxes recent history, never in-game identity uniqueness. Casual lineups are recorded **locally**, not as NBA Daily results. Daily previews have fixed local-date seeds and no persistence.

The generator chooses from a high-quality fixed bank rather than fabricating variations of the same question. The resulting attribute descriptor is visibly specific, and the NBA-only CSS scales down the longer prompt at phone widths without changing the existing game layout.

## Remaining editorial cautions

- **Fine-grained disagreement:** a 79 versus 82 editorial rating is not provable to the point; the visible interpretation emphasizes bands and category meaning. Owner review should flag any specific suspect comparison before final sign-off.
- **Era weighting:** classic-era references are fewer than modern references. This is intentional for recognizability but worth monitoring during Daily sampling.
- **Repeat horizon:** 386 rated references do not mean 386 unique NBA questions per day. At two games of four clues, repeated references eventually occur; theoretical combination counts are not a substitute for authored inventory.
- **Daily publication:** deterministic owner preview is ready to review, **but no actual official NBA Daily publication/server-owned grading** is activated in this PR. Production integration requires a separate later release and backend/reveal verification.

## Owner review focus added 2026-10-23

- **Expanded owner-test bank:** 386 references across 25 categories. The earlier 200 cap was lifted by the owner; original entries were preserved.
- **Recognizability:** target roughly 70% recognizable-to-engaged-fans and 30% deeper basketball history across the experience, not one forced historical slot per round. Do not equate historical era with obscurity; Magic Johnson and Michael Jordan are mainstream anchors.
- **Subjectivity:** rating controversy is welcome when the dimension is plain; basketball popularity never changes shooting, defense or playmaking ratings. Rivalries and atmosphere rate the stated *period*, not today’s standings or general market size.
- **Distribution:** each new culture category includes low, middle and high references where defensible. Home-court intensity naturally begins at 22, not a fake 1; the other categories collectively cover the rest of the 1–100 target scale. All rounds retain four distinct categories and distinct identities.
- **Clarity examples:** “Kawhi Leonard — reserved on-court celebrations” describes showmanship. “Sacramento Kings (2002 ARCO Arena) — legendary cowbell-fueled playoff noise” rates a defined crowd and season. “Bulls vs Pistons (late 1980s) — Jordan Rules” is an identifiable rivalry anchor. No abstract “offensive chaos” or context-free culture jargon.
- **Owner playtest:** the 56 new editorial judgments have not received owner sign-off; there is no claim that a numerical opinion is an objective fact. No public rollout or merge is authorized.

## Additional 194 references, 11 categories (owner-approved expansion)

| Category | Count | Low anchor | Strong anchor |
|---|---:|---|---|
| BALL HANDLING | 16 | Rudy Gobert (6) | Kyrie Irving (100) |
| REBOUNDING | 16 | Trae Young (9) | Dennis Rodman (100) |
| RIM PROTECTION | 16 | Trae Young (2) | Dikembe Mutombo (100) |
| MIDRANGE TOUCH | 16 | Rudy Gobert (3) | Michael Jordan (100) |
| AT-THE-RIM FINISHING | 16 | Seth Curry (18) | Shaquille O'Neal (100) |
| BASKETBALL IQ | 16 | Nick Young (24) | Chris Paul (100) |
| TRASH TALK | 16 | Kawhi Leonard (4) | Kevin Garnett (100) |
| NBA MOMENT IMPACT | 17 | Derrick Rose's 50-point game (2018) (65) | Kawhi Leonard's four-bounce winner (2019) (100) |
| FRANCHISE TRADITION | 23 | New Orleans Pelicans (9) | Los Angeles Lakers (100) |
| DRAFT HYPE | 17 | Ben Wallace (3) | LeBron James (100) |
| DUO IMPACT | 19 | LeBron James and Russell Westbrook (2021–23 Lakers) (21) | Michael Jordan and Scottie Pippen (1990s Bulls) (100) |

Owner has authorized production publication strictly to **test behind the existing NBA owner gate**. This is still an unranked NBA Daily sandbox with no official NBA leaderboard/streak/attempt backend writes; the public game remains gated.

### Calibration follow-up: NBA moments

The moment category is called **NBA Moment Impact**, not “Iconic Moments”: a reference being mentioned must not automatically imply a rating above 65. Six recognizably framed but less league-defining events anchor the 28–61 range. The remaining landmark Finals shots and historical performances properly remain high. We did not fabricate 1–10 moments merely to complete a numerical grid.

## Clue clarity revision (2026-10-23, v3)

The owner's test exposed misleading polarity in the original editorial descriptions: e.g. “Ben Simmons — unwilling to take regular midrange jumpers” intuitively sounds *very* high on unwillingness, though the rating is low for shooting. Likewise “Joe Johnson — respected isolation scorer” encourages rating scoring rather than his cultural impact. The remedy is a full-catalog **single-focus playable prompt** for **all 386 existing references**, with original `editorialNote` preserved for internal calibration only.

- Joe Johnson → “Joe Johnson's influence on basketball culture”
- Ben Simmons → “Ben Simmons' midrange shooting ability”
- Dennis Rodman → “Dennis Rodman's outside shooting ability”
- J.R. Smith → “J.R. Smith's basketball decision-making”
- Rivalries, teams, moments and duos keep their exact identities/eras but end with one plainly named attribute.
- **Only one question or dimension is displayed on the playing card**; the second category question is suppressed *only for NBA*. UFC and Football retain their existing treatment.
- Low and high always describe **strength on the named positive attribute**, not the intensity of being bad, unwilling, or unreliable. No implied number is included in the text.
- All 25 categories, 386 canonical IDs, 386 editorial rationales, ratings, two-game format and score formula are retained. The catalog/calibration versions increment to v3 to invalidate old seeded preview boards. Cosmetic changes keep NBA-gold reveal headers, subtler borders and more compact cards without touching shared UFC/Football styling.
