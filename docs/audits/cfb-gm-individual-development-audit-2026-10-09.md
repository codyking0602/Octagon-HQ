# CFB GM — individual player development-stage audit (October 9, 2026)

> **SUPERSEDED SCOUTING-LABEL PROPOSAL.** Owner has locked the **same five NFL labels** for CFB GM: HIGH UPSIDE, RISING, STEADY, BOOM/BUST and DECLINE RISK. The individual stage labels proposed in this historical research audit are **not approved UI terminology**. Refer to the [approved 468-player label decision](cfb-gm-development-labels-approved-2026-10-09.md) and [full approved mapping](cfb-gm-468-development-labels-approved-2026-10-09.csv) instead. Existing research and probability data remain intact.


**Audit scope: 468 of 468 players, 25 schools. This is a REVIEW ARTIFACT ONLY. No live GM rules, NFL code, NIL prices, NCAA eligibility assumptions, or Wheel/HQ grades have been changed.**

[Full 468-player source-linked audit table](cfb-gm-468-player-development-audit-2026-10-09.csv)

## Decision

**The existing 468 individual player studies are real and are already wired into the engine. The NFL-derived presentation systematically misclassifies those college-specific studies.** The issue is not that all players actually get better. It is the conflation of (a) football's *developmental stage*, (b) probability of a *one-year numerical improvement*, and (c) current *talent level*.

All 468 research profiles contain a player-specific developmental probability vector, a narrative about current/previous college performance, and one or more source URLs. All 468 vectors sum to 100; all 468 player identities matched a current, immutable Wheel grade. This audit **does not independently corroborate every claim across 468 outside webpages**. It reviews the existing sourced player evidence, probabilities, cap dynamics and proposed label interpretations, and assigns follow-up confidence/flags.

### Existing engine versus actual modeled outcomes

| Measure | Result |
|---|---:|
| Individual research records with sources | 468 / 468 |
| Grade matches to current Wheel HQ authority | 468 / 468 |
| Invalid development probability vectors | 0 |
| Players currently labeled **RISING** | **355 / 468 (75.9%)** |
| **RISING** players whose *steady* category is at least as likely as *breakout + improve* | **187** |
| Player-average research probabilities: breakout / improve / steady / decline | **10.3% / 30.6% / 44.1% / 15.0%** |
| Actual numeric movement in 128 deterministic runs per player: improve / unchanged / decline | **40.8% / 44.3% / 14.9%** |
| 99-rated players who cannot gain further HQ-grade points | **3** |
| Current-eligibility records with unconfirmed exact 2027 remaining eligibility | **376** |

Therefore: **college players are not always improving.** But the `footballGmOutlookFromOdds` threshold calls a player RISING whenever positive combined odds exceed decline odds by twelve points, even if holding steady is the *single most likely* outcome. This is the main source of redundant "RISING" pills.

## Proposed player-specific college development stages

These labels describe the current **developmental trajectory** and are **not predicted specific results, personality judgments, or new player grades**. The CSV has one proposed stage and its research basis for all 468.

| Proposed label | Audited count | Intended scouting read |
| --- | ---: | --- |
| **ESTABLISHED** | **256** | Proven or relatively stable current ability; can still get better, but growth is not promised. |
| **ASCENDING** | **90** | Meaningful evidence-backed opportunity for another step; remaining runway is credible, not automatic. |
| **EMERGING** | **40** | Early collegiate track record or unusually limited proven opportunity; uncertainty is part of the upside. |
| **VOLATILE** | **57** | Injury, changing role/competition level, thin sample or inconsistent output warrants wider outcomes. |
| **PLATEAUING** | **25** | Evidence or HQ ceiling suggests an already-established high level with limited *additional grade gains*; still an excellent player, not a declining one. |
| **TOTAL** | **468** | No player is labeled solely based on age/class. |

This is a first-pass, explainable classification of the **individual evidence narrative + probabilities + current HQ grade**, not a scientifically estimated prevalence target. The labels are **proposed** and must be manually spot-reviewed before any runtime use. **PLATEAUING is not the same as declining:** a 98 or 99 can maintain elite form.

### What is driving each proposed label

- **PLATEAUING:** strong steady probability, proven top-grade current performance, small remaining numeric headroom and/or explicit near-ceiling narrative. A 99 can have 0 points of upside but still be an excellent player.
- **VOLATILE:** player-specific documented role/competition transition, injury/recovery or sample-size caveat **plus** a high-variance developmental profile. The label is not based on generic transfer status.
- **EMERGING:** freshmen and select sophomores with individually supported developmental runway; class alone is insufficient. Confidence is limited if college production remains sparse.
- **ASCENDING:** sourced individual breakout/playing-time increase combined with meaningfully positive improvement odds.
- **ESTABLISHED:** does not meet the above thresholds, reflects known ability or a mature steady profile; stage does not imply senior age.

## Evidence confidence and targeted research queue

Evidence confidence is a **conservative automatic triage of the written research summaries**, not an independently verified citation or statistical confidence interval:

| Priority / label | Athletes | Treatment |
| --- | ---: | --- |
| **SUPPORTED** research narrative | **249** | Source-linked note covers both 2025/2026 or established production without obvious sample caveat. Keep stage as proposal. |
| **MODERATE** | **154** | One-off 2026/current role or injury/transfer context warrants targeted verification. |
| **LIMITED** | **65** | Thin college production, short sample, high-school-only context, or similar uncertainty. **Prioritize individual re-research.** |

The CSV includes the **actual source URL(s)** and the existing individual research narrative, not only assigned categories. All stages have traceable source notes.

Specific review-flag counts (flags overlap, so totals do not sum to 468):

| Flag | Rows | Why it matters |
| --- | ---: | --- |
| **RISING_LABEL_OBSCURES_STEADY_MODE** | **187** | Current UI suggests development when steady has greater or equal likelihood. |
| **INJURY_CONTEXT** | **99** | Availability and recovery are not interchangeable with talent decline. |
| **UNCERTAIN_ROLE_OR_COMPETITION** | **66** | FCS/JUCO/limited starts/role change; uncertainty should affect confidence. |
| **THIN_SAMPLE** | **65** | Don't turn recruiting reputation into demonstrated college progress. |
| **YOUNG_ALREADY_HIGH_GRADE** | **11** | Younger does not automatically imply large growth; analyze headroom individually. |
| **CHECK_HIGH_GRADE_UPSIDE** | **5** | Model has substantial positive probabilities even with modest grade room. |
| **NUMERIC_GRADE_CEILING** | **3** | 99/99 players' intended positive roll becomes no numerical improvement. |
| **SEPARATE_HQ_GRADE_REVIEW_FLAG** | **2** | Mark Bowman, Elijah Griffin; **do not alter authority grade without separate approval**. |
| **UNCERTAIN_2027_ELIGIBILITY for older classes** | **144** | Keep NCAA eligibility confidence separate from player development. |

### Player-specific examples from the ledger

| Player | Current HQ | Current NFL-style label | Suggested college stage | Research interpretation |
| --- | ---: | --- | --- | --- |
| **Jeremiah Smith, Ohio State** | 99 | STEADY | **PLATEAUING** | Already proven dominant; little additional numerical headroom. Not a negative assessment. |
| **Malachi Toney, Miami** | 98 | STEADY | **PLATEAUING** | Elite 2025 and early 2026 production; more likely to sustain than jump again. |
| **Colin Simmons, Texas** | 99 | STEADY | **PLATEAUING** | Proven established disruptive ability; virtually no in-game upside at 99. |
| **Jadan Baugh, Florida** | 98 | STEADY | **PLATEAUING** | Strong 2025–26 production and minimal space to improve beyond 98. |
| **Julian Sayin, Ohio State** | 93 | STEADY | **PLATEAUING** | High established accuracy/production, small modeled further breakout. |
| **Dylan Riley, Boise State** | 95 | STEADY | **PLATEAUING** | Proven feature RB; maintaining a high level is a success. |
| **Braeden Jackson, Iowa** | 83 | HIGH UPSIDE | **EMERGING** | Actual 2026 sparks but limited previous workload. |
| **Damon Ferguson Jr., Pittsburgh** | 83 | HIGH UPSIDE | **EMERGING** | True freshman with limited university sample, meaningful opportunity. |
| **Elijah Griffin, Georgia** | 88 | RISING | **VOLATILE** | Athletic upside and some starting responsibility, but thin demonstrated disruption; separately flagged HQ review. |
| **Mark Bowman, USC** | 87 | HIGH UPSIDE | **EMERGING** | Freshman college body of work too small to certify performance; separate grade review. |
| **Keelon Russell, Alabama** | 93 | RISING | **ESTABLISHED** | Current HQ already high; further improvement is possible, not guaranteed. |

These are **audit interpretations**, not newly verified 2026 season statistics. See individual source biographies in the 468-row CSV.

### Research-led exception: class is not the label

**Jay Timmons (Ohio State)** is a true freshman, but his official 2026 research documents actual college-level coverage responsibility and game production. He is proposed **ASCENDING**, not automatically EMERGING based on his freshman designation. More generally, freshman status alone should not decide the label.

### Data-provenance housekeeping identified in the research ledger

The source ledger has **468 complete player rows** and individual evidence URLs, but its aggregate metadata is inconsistent:

- Top-level `exactMatches: 358` contrasts with **320** current rows tagged `matchStatus: "exact"` and **148** tagged `"official-school-roster"`. Treat the aggregate count as stale until reconciled; do not use it as a quality claim.
- The top-level `failures` collection still includes a Boise State roster-parse error even though Boise State has completed, sourced player profiles. Preserve the warning until the original import/retry is investigated; it does not mean the player research is missing.
- A directly checked official Georgia biography supports Elijah Griffin's sophomore class, 2025 participation and early 2026 role. **Sample corroboration is not independent verification of all 468 biographies.** Source: https://georgiadogs.com/sports/football/roster/elijah-griffin/10560.

## Development mechanics changes recommended AFTER research approval

1. **Replace the shared NFL `footballGmOutlookFromOdds` on college cards** with a dedicated five-stage college presentation that describes evidence and current trajectory—not broad positive-versus-negative roll buckets.
2. **Keep talent tier, development stage, and college eligibility/exit risk separate.** Do not present the player's stage as an actual NCAA eligibility certification.
3. **Respect age without handcuffing it.** Freshmen generally have larger upside distributions, but established sophomores may plateau and seniors can legitimately break out.
4. **Retain meaningful 0-movement / regression probabilities.** The existing research population is **44.1% steady** and **15% decline** on average; don't engineer an artificial equal five-label quota or inflate breakouts.
5. **Fix positive-result grade caps and progress-label consistency.** At HQ 99, nominal breakout/improvement rolls cannot create growth. Also `cfbGmDevelop` calls its own +1/+2 outcomes BREAKOUT when its clipped max gain is under 3, but the NFL-derived final recap labels them IMPROVED. Choose one shared movement convention, based on effective grade change, without altering Wheel ratings.
6. **Evidence-based re-research first:** the 65 LIMITED and 154 MODERATE cases, plus five high-grade/upside mismatches and two existing HQ review flags. Never quietly alter player-grade authority.
7. **Independently research actual college year-one-to-year-two observed performance before recalibrating exact breakout/improve/steady/decline percentages.** Individualized odds in the ledger are *research-informed editorial estimates*, not empirically back-tested probabilities. A label audit alone does not justify manufacturing new odds.

## NCAA eligibility boundary (separate from this development audit)

The NCAA's 2026 age-based transition lets eligible continuing athletes be considered under the earlier or new rules when beneficial, subject to the individual's history and certification. A verified school class or draft year is not a precise statement of remaining 2027 eligibility. The current ledger has **376 unknown** remaining-eligibility counts. Official NCAA context: https://www.ncaa.org/eligibility-center/division-i-and-division-ii-age-based-eligibility-rules/

**Release gate:** audit only. No production merges, game-economy changes, developer tweaks, NIL changes, or player-grade edits have been made. A separate implementation PR should adopt **reviewed** stages and calibrated, independently validated probabilities only after owner approval.
