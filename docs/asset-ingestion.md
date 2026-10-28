# Automated asset ingestion

Octagon HQ automation can ingest approved binary fighter assets without passing binary bytes through a text-file API.

## Contract

1. The automation verifies identity and approved provenance before queueing anything.
2. It creates a focused branch from fresh `main`.
3. It writes one JSON manifest under `.asset-ingest/`.
4. The `Asset Ingest` GitHub Action downloads the official source inside GitHub Actions, validates the source provenance, processes the asset, validates dimensions/transparency, deletes the manifest, and commits the generated WebP back to that branch.
5. The automation waits for that generated commit, opens/updates the focused PR, explicitly validates the exact generated head, and follows the normal exact-head green/deploy/verify/merge rules.

Direct-image manifest:

```json
{
  "source_url": "https://a.espncdn.com/...",
  "destination": "public/assets/fighters/example-thumb.webp",
  "kind": "thumb",
  "crop": [0.1, 0.0, 0.8, 0.8]
}
```

Official-UFC-profile manifest:

```json
{
  "source_page_url": "https://www.ufc.com/athlete/example-fighter",
  "fighter_name": "Example Fighter",
  "destination": "public/assets/fighters/example-fighter-thumb.webp",
  "kind": "thumb"
}
```

Provide exactly one of `source_url` or `source_page_url`. `crop` is optional and uses normalized `[x,y,width,height]` coordinates.

Direct source hosts remain restricted to ESPN/ESPN CDN and UFC. For `source_page_url`, the page itself must be an approved official UFC athlete page (including supported official localized UFC domains), and the processor accepts only the image element whose alt text identifies the requested fighter. The resolved image must be a safe public HTTPS URL. This lets UFC-owned athlete imagery remain usable even when the page serves the binary from an internal CDN URL that is not exposed to the prep monitor.

Destinations are restricted to `public/assets/fighters/` and must end in `-thumb.webp` or `-spotlight.webp`. Thumbs are exactly 320×320; Spotlights are exactly 626×800. Approved ESPN/UFC source imagery may be opaque. When needed, the ingest processor removes the source background and must still produce real visible transparency in the finished WebP. If background removal cannot produce valid transparency, the job fails closed rather than inventing or substituting imagery.

This is a transport/processing primitive, not a provenance bypass. Sport-specific source rules still apply.

## Football weekly asset support — player Spotlight only (October 27 onward)

Use the existing Asset Ingest workflow and `scripts/football_editorial_assets.py` for player Spotlight photographs, with genuine verified ESPN/CDN imagery and athlete profile identity, action photo preferred over portrait, then approved manual photo. Each player Spotlight output is a reviewed **720×900 WebP** at `public/assets/football/weekly/YYYY-MM-DD/<cfb|nfl>/spotlight.webp`. Run the existing generated-asset PR, exact-head CI, merge, production deployment and verified live-photo readback before arming. Do not fabricate athlete likenesses.

**Never automatically create Game of the Week headers.** The historical `football-game-header` SeatGeek processor and `game-header.webp` assets only explain previously published content. For October 27 and later, do not queue header manifests, search SeatGeek, generate a synthetic image, or substitute any publisher graphic. Cody alone supplies the 16:9 GOTW headers. Their absence must **never hold** owner-approved content, player-photo publication, a factual three-section breakdown, Tuesday 8 AM release, or verified same-week catch-up.

## Owner-provided weekly matchup art (only source for new weeks)

When the owner provides a finished 16:9 header, confirm correct selected teams and week. The approved owner-uploaded Picks gallery (`pick-event-headers` Supabase Storage, via current owner control UI) is the primary existing upload workflow. Alternatively, preserve an approved owner graphic as a non-stretched reviewed WebP at `public/assets/football/weekly/YYYY-MM-DD/<sport>/owner-header-<revision>.webp`, and register the exact week, sport, away/home identities, and path in `src/features/home/footballWeeklyHeaderOverrides.json`. A replacement receives a new revisioned filename. Use the normal exact-head-green PR and deployment safeguards; the image can arrive after its editorial content is live without changing the published package.

For new weeks, when owner art is absent or its URL fails, use the existing neutral CSS treatment: **no generated game image, no SeatGeek fallback, no empty image causing delayed publication**. Legacy weeks keep their previously verified original SeatGeek graphic unchanged. These user-owned headers do not alter the locked compact GOTW analysis, Player Spotlight, stats, schedule, or selections.

## Football Picks owner-uploaded gallery priority (October 20 fix)

The owner control center can already upload 1–4 images to the public
`pick-event-headers` Supabase Storage bucket, recorded on the existing PickEvent
as `header_storage_path` and natural dimensions. **These uploaded Picks images always win**, and appear as image-only
slides in their stored gallery order. This path works after publication without
new asset PRs or owner-header JSON changes: it is the canonical existing owner
upload UI. Never suppress `pickEventPosters(event)` because matching weekly
breakdowns exist. Do not display extra overlay pills, names, marks, ranks,
records, time, or duplicate `THE HQ` lettering on the Picks image; Cody's
finished artwork already contains all of it. Keep the existing 16:9, eight-second
carousel. If a gallery image fails, skip it; if none loads, render the verified
historical verified images on historical weeks and the neutral CSS background for future weeks, without overlays. This affects Picks' image header only—rank/record,
Sports Reference team links and editorial data remain in Football HQ and the
Game Breakdown, not superimposed on custom Picks artwork.
