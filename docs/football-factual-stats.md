# Football Factual Stats

Last reviewed: 2026-08-22

`src/features/back-room/footballFactualStats.ts` is the canonical owner for objective Football facts used by Back Room games.

It complements, and must not replace or duplicate, the comparison-rating owner in `footballRankFiveModel.ts`.

## Ownership boundary

The factual owner answers **what happened**:

- career and season counting stats
- wins/losses and championships
- team scoring records
- official awards
- other objective or explicitly derived metrics

The comparison owner answers **how great was it** under a documented rating contract.

Subjective calibration such as aura, uniform quality, chaos, or rivalry hatred belongs in Wavelength-style opinion content, not here.

## Consumer rule

Hit the Number, Find the Leader, factual Blind Resume rows, and future objective Football games should query this owner instead of authoring their own copy of the same fact.

A game may format or select a fact, but it should not become a second source of truth for that value.

## Evidence rules

Every stored fact must have:

1. one canonical Football `subjectId`
2. one typed metric definition
3. a numeric canonical value
4. at least one evidence source ID
5. a source with an HTTPS URL, review date, and explicit coverage window

Source preference:

1. official league, conference, school, team, award, or record-book source when practical
2. established statistical references such as Pro Football Reference or College Football at Sports-Reference
3. a second reputable source when the primary record is ambiguous or a definition differs across providers

Do not use a search-result snippet, social post, fan database, or unsourced summary as the sole evidence for a canonical fact.

## Current-season rule

Do not silently present a partial active season or active career as final.

For active subjects, the source coverage must say exactly through which completed season or date the value is verified. A future refresh changes the canonical factual record in this owner rather than adding a game-specific override.

## Derived metrics

Derived facts are allowed only when the inputs are objective and the formula is explicit.

A derived fact must:

- use `kind: "derived"`
- cite the source records for its underlying inputs
- store a human-readable `formula`
- remain reproducible from those inputs

Do not disguise a judgment, era adjustment, or comparison rating as a derived fact.

## Seed coverage in PR5

PR5 establishes the owner with stable reviewed examples across two scopes:

- completed NFL player careers
- completed college team seasons

The seed records are intentionally a foundation, not the final Football stat universe. Later game/content PRs should expand this same owner as their objective categories require.

Reviewed evidence used for the seed includes:

- Pro Football Reference completed-career records for Peyton Manning, Dan Marino, John Elway, Emmitt Smith, and Barry Sanders
- College Football at Sports-Reference completed-season records for 2005 Texas and 2013 Florida State

No runtime API, alternate provider, game-specific fact catalog, route, or initialization path is added by this foundation.
