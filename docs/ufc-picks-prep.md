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

Every prep/refresh run must resolve thumb readiness in this order:

1. Search **only** official ESPN MMA square headshots and official UFC square headshots for the correct athlete. A UFC athlete *page* with a full-body photo does **not** count.
2. For existing repo thumbs, verify the exact underlying official **square headshot URL and face-focused image**, not just dimensions, transparency, or a clean cutout. Without proven square-headshot provenance, that file is **not approved**.
3. Ingest only individually verified official square headshot URLs. Do **not** try to fix full-body promotional images by trimming, zooming, clipping, or background removal.
4. When no qualifying UFC/ESPN square portrait is available, display the existing missing-image placeholder and mark `thumb_pending`. Recheck during fight week; never substitute a third-party or Spotlight image.
5. The October 31, 2026 Picks card is explicitly fail-closed in `officialUfcPicksHeadshots.ts`: only documented official ESPN headshot URLs render. Any missing or unverified fighter stays blank even when an old local image exists.

When an acceptable UFC/ESPN thumbnail is available:

- `public/assets/fighters/<fighter-slug>-thumb.webp`

The original source must already be a **square official fighter headshot**, not a torso shot artificially made square. The source may have an opaque background; background removal is allowed only *after* the actual headshot has passed provenance, identity and framing review. The finished WebP must pass 320×320 alpha checks.

For every fighter on the main card:

- `public/assets/fighters/<fighter-slug>-spotlight.webp`

Any checked-in thumb and every checked-in Spotlight asset must be a true transparent WebP cutout with an alpha channel. **Thumbs are tight, face-dominant head-and-shoulders/bust portraits in the established ESPN-style treatment; never shrink a full-body fighter render into the thumb tile.** Spotlights may use the larger three-quarter/full fighter presentation. Spotlight imagery remains real fighter photography only; do not synthesize, redraw, restyle, or alter the fighter. If a Spotlight source has a background, background removal is allowed. After background removal, only crop/resize/center and lightly sharpen. Never bake a white, arena, cage, or other source background into the canonical asset. Existing matching transparent assets should be reused.

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
