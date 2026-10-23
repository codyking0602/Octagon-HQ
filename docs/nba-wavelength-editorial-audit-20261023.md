# NBA Wavelength — initial editorial and game-quality audit (2026-10-23)

## Scope / release contract

Owner-only review. **No official NBA Daily publication, attempts, streaks, leaderboards or championship points.** Both Casual and deterministic Chicago-date Daily sandbox use the approved Football/UFC slider, four adaptive clues, exact 1–100 hidden target, fourth-guess-only scoring (100 minus twice the absolute miss, floored at zero), and the existing result/reveal treatment. Two games comprise each NBA preview and are averaged.

The NBA catalog and its calibration version are independently frozen as `nba-wavelength-catalog-v1` and `nba-wavelength-calibration-v1`. There is no reliance on projected 2026–27 outcomes.

## Content inventory

- **14 categories; 192 editorial clue references; basketball skills, legacy, personality, NBA culture, home-court atmosphere and rivalry history across four eras.**
- **147,185,664 structurally legal ordered four-clue combinations** when prohibiting repeated categories and repeated subjects inside one game. This is a mathematical possibility count, **not** the number of curated/guaranteed generator outcomes: target fit, direction, previous guesses, seeded ordering, and replay filtering narrow choices considerably.
- Distribution: Career Legacy 16; the other eight basketball categories 15 each; Showmanship 11; Villain Reputation 11; Cultural Influence 12; Home-Court Heat 11; Rivalry Heat 11. The 56 culture/personality/rivalry references account for 29.2% of the 192-clue pilot.
- The bank spans modern, 2000s, 1980s/90s and classic eras. Recognizability is the default; deeper historical references are deliberately sprinkled in, with no forced “historian clue” position in a round.

## Why these fourteen categories

Each category poses **one specific, plain-language NBA question** with separate weak/ordinary/iconic anchors. The original nine basketball-ability and résumé categories remain intact. Five additional categories cover deliberate showmanship, actual on-court antagonist reputation, cultural influence, specific home-crowd eras and defined rivalries. We excluded generic “best player,” popularity-based *skill* inflation, vague “chaos/energy” language without an attributable behavior, speculative 2026 predictions, and fabricated low scores solely to fill an empty number band.

The distinction is deliberate: Shaquille O'Neal is a 100 Peak Dominance reference but a 3 Outside Shooting reference; Ben Wallace is 97 Defensive Impact and 7 Scoring Threat; Nikola Jokić is 100 Playmaking but 22 Explosive Athleticism. Overall fame cannot inflate a different trait. A career résumé should not be confused with a short peak or with shooting range.

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
| Playoff Résumé | Anthony Bennett (3) | Trae Young (53) | Stephen Curry (96), Bill Russell (100) |\n| Showmanship | Kawhi Leonard (9) | Jimmy Butler (59) | Magic Johnson (98), Shaquille O’Neal (99) |\n| Villain Reputation | Boban Marjanović (6) | Kobe Bryant (57) | Draymond Green (97), Bill Laimbeer (100) |\n| Cultural Influence | Rudy Gay (9) | Jason Williams (63) | Allen Iverson (99), Michael Jordan (100) |\n| Home-Court Heat | 1990s Clippers at Sports Arena (22) | 2011 Dallas title run (76) | 2002 Sacramento ARCO Arena (100) |\n| Rivalry Heat | Hornets–Pistons in late 2010s (3) | 2009–10 Magic–Celtics (48) | historic Celtics–Lakers (100) |

## Generator / replay quality contract

The 100 possible target numbers are seeded without category-specific target distortion. The first clue is selected near the target, then the next three clues **adapt to the last submitted guess**, using the existing shared correction function and NBA's rated bank; the hidden target never moves. Each game uses four unique categories and four unique subjects. The second game begins with a different category, subject and a target at least 12 points apart. During Game 1, its generator reserves Game 2's opening subject; Game 2 avoids every completed Game 1 subject. Recent Casual completions supply a browser-local clue/subject/target exclusion preference; exhaustion relaxes recent history, never in-game identity uniqueness. Casual lineups are recorded **locally**, not as NBA Daily results. Daily previews have fixed local-date seeds and no persistence.

The generator chooses from a high-quality fixed bank rather than fabricating variations of the same question. The resulting attribute descriptor is visibly specific, and the NBA-only CSS scales down the longer prompt at phone widths without changing the existing game layout.

## Remaining editorial cautions

- **Fine-grained disagreement:** a 79 versus 82 editorial rating is not provable to the point; the visible interpretation emphasizes bands and category meaning. Owner review should flag any specific suspect comparison before final sign-off.
- **Era weighting:** classic-era references are fewer than modern references. This is intentional for recognizability but worth monitoring during Daily sampling.
- **Repeat horizon:** 192 rated references do not mean 192 unique NBA questions per day. At two games of four clues, repeated references eventually occur; theoretical combination counts are not a substitute for authored inventory.
- **Daily publication:** deterministic owner preview is ready to review, **but no actual official NBA Daily publication/server-owned grading** is activated in this PR. Production integration requires a separate later release and backend/reveal verification.

## Owner review focus added 2026-10-23

- **Pilot cap:** 192 total, under the requested 200-clue ceiling. This is intentionally held for editorial review, not treated as a final content bank.
- **Recognizability:** target roughly 70% recognizable-to-engaged-fans and 30% deeper basketball history across the experience, not one forced historical slot per round. Do not equate historical era with obscurity; Magic Johnson and Michael Jordan are mainstream anchors.
- **Subjectivity:** rating controversy is welcome when the dimension is plain; basketball popularity never changes shooting, defense or playmaking ratings. Rivalries and atmosphere rate the stated *period*, not today’s standings or general market size.
- **Distribution:** each new culture category includes low, middle and high references where defensible. Home-court intensity naturally begins at 22, not a fake 1; the other categories collectively cover the rest of the 1–100 target scale. All rounds retain four distinct categories and distinct identities.
- **Clarity examples:** “Kawhi Leonard — reserved on-court celebrations” describes showmanship. “Sacramento Kings (2002 ARCO Arena) — legendary cowbell-fueled playoff noise” rates a defined crowd and season. “Bulls vs Pistons (late 1980s) — Jordan Rules” is an identifiable rivalry anchor. No abstract “offensive chaos” or context-free culture jargon.
- **Pending human review:** the 56 new editorial judgments have not received owner sign-off; there is no claim that a numerical opinion is an objective fact. No public rollout or merge is authorized.
