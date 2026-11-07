# UFC Picks Prep

UFC Prep is a pre-staging package for the next UFC Picks event. It does **not** stage or publish Picks.

## Locked card scope

- Fight Night: main card only.
- Numbered UFC event: main card + prelims.
- Early prelims are never included.
- UFC.com is the canonical staging importer, but Monday prep must cross-check the card against at least one independent current card source and betting-odds availability.
- Missing/disappearing odds are a warning signal, not proof that a fight changed.

## Fighter asset contract

Real fighter photography only. Do not generate UFC fighter images.

Canonical fighter thumbnails may come **only from UFC or ESPN imagery**. If neither UFC nor ESPN has an acceptable thumbnail yet, do not create or substitute a thumb asset; let the existing missing-thumbnail presentation render instead. Never derive a thumbnail from a Spotlight image, third-party photo, random cutout, poster, social image, Getty-style image, or generated/recreated fighter art. A blank/missing thumb is preferable to questionable provenance.

## Inventory-first reuse (November 4, 2026)

Do **not** re-download a fighter because a newly created event prep package shows `thumb_ready=false`. That flag tracks **event-specific approval**, not whether Octagon HQ already has the photo. Before official-source research or asset manifests, resolve the entire selected card against **fresh main** using `python scripts/ufc_prep_asset_inventory.py --slugs ciryl-gane,amanda-nunes,drew-dober` or `--prep-json /path/to/current-prep.json`. The tool reads the existing `public/assets/fighters` photo library and the actual frontend `FighterThumbnail.tsx` slug aliases/static remote sources: no new roster, duplicate database, or manually maintained inventory.

**Owner-locked: a fighter's existing photo in HQ is accepted.** Classify each fighter as existing local (reuse), existing frontend/runtime remote (reuse), or genuinely missing (acquire). Include the live `get_ufc_fighter_media_map` runtime photo records and established owner-provided event photo exceptions. For an existing HQ photo, **automatically set the current event's `thumb_ready=true` and `thumb_path` to the actual existing app URL/path** without historical provenance audits, reprocessing, manual review, or asking the owner. Do not let a new event's initial `thumb_ready=false` or previously rejected *different source URL* disqualify an image HQ already uses. For missing photos only, obtain a verified clean official original through the normal image review/merge/deploy process. Track reused and genuinely missing counts separately, and never infer Spotlight readiness from a thumbnail. Do not clear earlier accepted assets.

The existing Asset Ingest workflow also has an automatic **inventory preflight** and skips fetching any existing UFC thumbnail or Spotlight, including frontend remote mappings. To replace a demonstrably bad/stale photo, the manifest must explicitly include both `"replace_existing": true` and a meaningful `"replacement_reason"`. A deliberate reviewed replacement still goes through all normal source/visual/CI/deployment gates. This does not alter football ingestion or Picks staging.

**Only for fighters with no photo already in HQ**, new thumb acquisition follows these rules:

1. For missing fighters, search **only** ESPN's MMA headshot product and UFC's actual event-results headshot product for the correct athlete. ESPN MMA face-dominant headshots can legitimately be 600×436; require `official_headshot_reviewed=true`, exact athlete name, and `verified_espn_athlete_id` matching the official CDN URL. Square source pixels are not required for this verified ESPN product. UFC's `event_results_athlete_headshot` transparent original is 256×160, even though the app displays it inside a square thumb tile. Its format is valid; UFC's `athlete_bio_full_body` promotional photo is not. A UFC athlete *page* with a full-body photo does **not** count.
2. Previously accepted/used HQ images are exempt from new-source review and stay accepted. For **new** image files, verify the actual athlete, official source, transparent crop and visually clean output. Owner-supplied new original photography can be an explicit per-fighter exception once the correct fighter is established.
ESPN's alternate official MMA headshot delivery URL (`https://a.espncdn.com/combiner/i?img=%2Fi%2Fheadshots%2Fmma%2Fplayers%2Ffull%2F<athlete-id>.png`) is eligible only if it wraps the exact single MMA athlete-ID headshot, the ESPN athlete ID and reviewed fighter identity match, the original is 600×436 with real transparency, and the generated thumbnail passes visual review. No arbitrary combiner URL, additional transformations, body photos, or image cleanup. Drew Dober (ESPN athlete 2951202) was source-reviewed November 4, 2026.

3. Use an **already-transparent, artifact-free original** for thumbs. Never run rembg, segmentation, alpha matting, publisher-panel cleanup, forced background removal, or destructive cropping on thumbnails. Preserve the real fighter photography and fit the unmodified transparent portrait on the 320×320 tile. Detect and reject opaque or visibly contaminated originals, even if technically valid PNGs.
4. If an ESPN original fails, try the separately verified UFC event-results original (or vice versa). The existing Asset Ingest manifest accepts up to three individually verified `fallback_sources`, each with its own source URL or official UFC athlete-profile URL and ESPN athlete-ID verification where applicable. Never substitute a full-body UFC athlete promotional photo, another fighter, or an unproven local file. All attempted sources must be reviewed before any media is marked ready.
5. When no qualifying UFC/ESPN square portrait is available, display the existing missing-image placeholder and mark `thumb_pending`. Recheck during fight week; never substitute a third-party or Spotlight image.
6. The October 31, 2026 Picks card is explicitly fail-closed in `officialUfcPicksHeadshots.ts`: only documented official UFC/ESPN headshot URLs render. Any missing or unverified fighter stays blank even when an old local image exists.

When an acceptable UFC/ESPN thumbnail is available:

- `public/assets/fighters/<fighter-slug>-thumb.webp`

The original source must already be an **official fighter headshot**, not a promotional torso shot artificially made square. UFC's own transparent 256×160 event-results headshots are approved and displayed in the square tile without distortion. The thumbnail source must have genuine transparency already; opaque or publisher-contaminated originals are rejected, not repaired. Spotlight artwork follows its separate approved processing rule. The finished WebP must pass 320×320 alpha checks.

For every fighter on the main card:

- `public/assets/fighters/<fighter-slug>-spotlight.webp`

Any checked-in thumb and every checked-in Spotlight asset must be a true transparent WebP cutout with an alpha channel. **Thumbs are tight, face-dominant head-and-shoulders/bust portraits in the established ESPN-style treatment; never shrink a full-body fighter render into the thumb tile.** Spotlights may use the larger three-quarter/full fighter presentation. Spotlight imagery remains real fighter photography only; do not synthesize, redraw, restyle, or alter the fighter. If a Spotlight source has a background, background removal is allowed. After background removal, only crop/resize/center and lightly sharpen. Never bake a white, arena, cage, or other source background into the canonical asset. Existing matching transparent assets should be reused.

### November 7, 2026: owner-supplied Johnny Walker source

- The owner provided a clean transparent 600×436 portrait of Johnny Walker in this project; it visually matches the official ESPN MMA portrait for athlete 3146944 without the colored publisher panels visible on ESPN's live CDN URL.
- The manually approved original is only fitted to 320×320 without background cleanup, segmentation, or substitution. The canonical file is `public/assets/fighters/johnny-walker-nov07-thumb.webp`, explicitly allowlisted for the November 7 Picks card. All 11 other main-card thumbs remain pending until separately verified.
- This manually supplied media asset is **not** evidence that the original ESPN CDN file is fixed. If the actual live image fails, revert to missing instead of an old or unreviewed image. Confirm production file delivery before counting Johnny as ready.

## Editorial contract

Prepare a full Fight Spotlight editorial package for **every main-card fight**, even when only the main event is attached automatically:

- concise researched Fight Preview
- Tale of the Tape: record, age, height, reach, stance
- up to three meaningful matchup edges for each fighter
- optional Watch Spotlight URLs

All selected main-card bouts must have their own researched preview/tale-of-the-tape/edges in the prep record; an accurate main-event-only preview is **1 of 6**, not a complete six-fight editorial package. Only the main-event **pair of 626×800 fighter images** is required by default. All other main-card fighter Spotlight photos are optional unless a second title bout or explicitly approved featured fight requires them. Never report all 12 Spotlight photos as mandatory for an ordinary Fight Night.

The main-event package is automatically attached when the verified card is staged. Other prepared main-card packages remain one-tap choices inside Event Setup.

The stored Spotlight `source` **must always equal `"UFCStats"`**, a reserved machine-readable field (not free-text research attribution). Write official UFC.com, ESPN and other supporting editorial citations to `verification_notes`, labeled by bout. After every automated upsert, read the saved payload back and assert that **every** `spotlights[*].source` is `"UFCStats"`, that expected bouts and previews remain intact, and that validation succeeds; do not report prep success when verification fails. Preview and edge copy must still be researched and editorially reviewed, never invented from bare statistic differences.

## Prep package storage

While the event remains unstaged, the recurring prep task keeps one living row current in `public.ufc_pick_prep_packages`, keyed by `source_event_key`.

The JSON payload must contain:

- `verification_notes: string[]`
- `bouts[]`
  - `bout_id`
  - `position`
  - `section`: `main-event | main | prelim`
  - `weight_class`
  - red/blue fighter slugs and names
- `spotlights[]`: canonical staged Spotlight objects for main-card fights
- `assets[]`
  - fighter slug/name
  - `thumb_ready`
  - `spotlight_ready`
  - final repo asset paths

Top-level row fields own event identity, scope, start time, status, and timestamps.

Status meanings:

- `ready`: card sources agree enough to prepare safely, every selected main-card fight has a verified researched preview, and all required main-event photos and assets are visually approved and deployed.
- `review-needed`: prep is usable but at least one card/odds/asset signal deserves owner review or required media/editorial remains pending.
- `blocked`: event identity or card scope cannot be established safely.

## Staging behavior

When a prep package exists, Event Setup does not stage on the first click.

1. Fetch a fresh UFC.com preview through the existing `sync-next-ufc-event` owner.
2. Compare the fresh selected card against the prepared card.
3. Show added/removed/order/source drift before staging.
4. Owner stages the freshly verified card.
5. If the prepared main event still matches exactly, attach its prepared Spotlight automatically.
6. Never auto-publish.

After staging, the existing Picks monitoring system remains the live change owner.

## Asset batch recovery and visual review

- A daily prep refresh must distinguish **existing production-ready media**, **newly generated but unmerged media**, **visually rejected media**, and **no approved official source found**. A generated GitHub file, a passing technical test, or an open PR does not make production `thumb_ready` or `spotlight_ready` true.
- Use the existing official UFC/ESPN asset-ingest pipeline; never reuse an obsolete image from a rejected PR without confirming the fighter, cutout, crop, and source. Reprocess a bad fighter independently, not the entire batch. Failed source/processing manifests must produce a per-fighter error while valid batchmates continue to the review PR.
- For each generated PR, inspect **every** actual WebP in addition to dimensions, alpha, silhouette, upper-body framing, and absence of leftover rectangular backgrounds. The automated gate catches obvious defects but cannot certify identity or visually perfect cutouts. Do **not** waive the human/photo visual gate solely to raise the prep count.
- After review, verify exact PR head green; merge/deploy only on explicit authorization, then verify actual public media URLs and update the living preproduction package. When told not to touch main, **leave the PR and the prep database unchanged** unless separately authorized.
- The setup display shows **thumbs ready**, **required main-event photos out of 2**, and **editorial previews out of main-card bouts**, with optional main-card Spotlight photos shown separately. Missing bookmaker-attributed odds and poster availability remain separate warning signals.

## Locked concise editorial automation standard (October 27, 2026)

The existing preparation/publication flow must not publish verbose previews. Each researched fight Spotlight retains the approved sections:
- Fight preview: 2–3 complete sentences, 45–65 words. Explain styles, one decisive tactical conflict and a realistic key to victory. Avoid reciting both biographies.
- Tale of the Tape: preserve five sourced rows (record, age, height, reach, stance), without filler prose.
- Matchup Edges: exactly three per fighter, each at most nine words and 65 characters. Think "Pressure wrestling", "Southpaw striking angles", "Five-round experience", not full sentences.
- Avoid generic filler or fabricated stats. Every numerical edge must be source-verified. SKCS/HQ rankings fighter profiles do not require a fight breakdown.
- The ufcEditorialIssues/effectiveUfcPrepStatus guard blocks verbose future prepared packages from ready status. The October 31 published main-event Spotlight and all six retained prep Spotlights are explicitly rewritten in the owner-approved editorial migration. Other older published rich breakdowns are compacted at display time.
- Temporary QA fighters/bouts are not automatically published or retained after owner removal.


## November 7: official three-quarter championship photo review

The 460×700 transparent UFC athlete-profile `athlete_bio_full_body` product is
a real three-quarter fighter photograph, intentionally ending below the waist
or at the thighs. For these source-reviewed portraits, the lower frame boundary
is not a failed/accidental crop. A new Spotlight manifest must explicitly
include `official_ufc_three_quarter_reviewed: true`, the exact
`verified_source_url`, fighter identity, and the matching official UFC
`source_page_url`. The processor permits this particular *already transparent*
portrait product's natural lower boundary, while still rejecting clipped
editorial photos, top-of-head cuts, publisher rectangles, silhouettes,
unreviewed URLs, and every nonmatching image. UFC 334 Gane, Hokit, Harrison and
Nunes originals were individually inspected from UFC athlete pages on
November 7. No synthesized body, limb or face reconstruction is allowed.
