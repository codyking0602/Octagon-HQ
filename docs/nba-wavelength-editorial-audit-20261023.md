# NBA Wavelength — initial editorial and game-quality audit (2026-10-23)

## Scope / release contract

Owner-only review. **No official NBA Daily publication, attempts, streaks, leaderboards or championship points.** Both Casual and deterministic Chicago-date Daily sandbox use the approved Football/UFC slider, four adaptive clues, exact 1–100 hidden target, fourth-guess-only scoring (100 minus twice the absolute miss, floored at zero), and the existing result/reveal treatment. Two games comprise each NBA preview and are averaged.

The NBA catalog and its calibration version are independently frozen as `nba-wavelength-catalog-v1` and `nba-wavelength-calibration-v1`. There is no reliance on projected 2026–27 outcomes.

## Content inventory

- **9 categories; 136 editorial clue references; 77 distinct subjects; four represented eras.**
- **147,185,664 structurally legal ordered four-clue combinations** when prohibiting repeated categories and repeated subjects inside one game. This is a mathematical possibility count, **not** the number of curated/guaranteed generator outcomes: target fit, direction, previous guesses, seeded ordering, and replay filtering narrow choices considerably.
- Distribution: Career Legacy 16; Peak Dominance, Scoring Threat, Outside Shooting, Playmaking, Defensive Impact, Explosive Athleticism, Clutch Shotmaking, Playoff Résumé 15 each.
- Eras: modern 77 entries, 2000s 39, 1980s/90s 15, classic 5. Era is a deliberately soft diversity preference rather than an unearned historical comparison adjustment.

## Why these nine categories

Each category poses **one specific basketball question** with separate weak/ordinary/iconic anchors. We excluded generic “best player,” fanbase popularity, jersey style, temporary reputation drama, “choke” labels, and speculative 2026 predictions. These categories have widely recognizable basketball evidence—specific awards, playoff moments, role limitations, skills, and accomplishments—with a usable full 1–100 range.

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
| Playoff Résumé | Anthony Bennett (3) | Trae Young (53) | Stephen Curry (96), Bill Russell (100) |

## Generator / replay quality contract

The 100 possible target numbers are seeded without category-specific target distortion. The first clue is selected near the target, then the next three clues **adapt to the last submitted guess**, using the existing shared correction function and NBA's rated bank; the hidden target never moves. Each game uses four unique categories and four unique subjects. The second game begins with a different category, subject and a target at least 12 points apart. During Game 1, its generator reserves Game 2's opening subject; Game 2 avoids every completed Game 1 subject. Recent Casual completions supply a browser-local clue/subject/target exclusion preference; exhaustion relaxes recent history, never in-game identity uniqueness. Casual lineups are recorded **locally**, not as NBA Daily results. Daily previews have fixed local-date seeds and no persistence.

The generator chooses from a high-quality fixed bank rather than fabricating variations of the same question. The resulting adjective/trait descriptor is visibly specific, and the NBA-only CSS scales down the longer prompt at phone widths without changing the existing game layout.

## Remaining editorial cautions

- **Fine-grained disagreement:** a 79 versus 82 editorial rating is not provable to the point; the visible interpretation emphasizes bands and category meaning. Owner review should flag any specific suspect comparison before final sign-off.
- **Era weighting:** classic-era references are fewer than modern references. This is intentional for recognizability but worth monitoring during Daily sampling.
- **Repeat horizon:** 136 rated references do not mean 136 unique NBA questions per day. At two games of four clues, repeated names/traits eventually occur, and 147 million theoretical paths should not be sold as 147 million distinct authored games.
- **Daily publication:** deterministic owner preview is ready to review, **but no actual official NBA Daily publication/server-owned grading** is activated in this PR. Production integration requires a separate later release and backend/reveal verification.
