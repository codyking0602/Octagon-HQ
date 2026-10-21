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

## Football weekly asset support (Phase 3)

The SAME Asset Ingest workflow also routes Football weekly manifest kinds football-spotlight and football-game-header to scripts/football_editorial_assets.py. UFC thumb/spotlight processing remains unchanged. Football **player Spotlight** photos use verified real ESPN/CDN imagery and the player's ESPN profile reference, with action → portrait → approved manual fallback. No synthetic likenesses. Canonical paths: `public/assets/football/weekly/<Tuesday YYYY-MM-DD>/<cfb|nfl>/{spotlight.webp,game-header.webp}`. Spotlights are 720×900 WebP.

Football **Game of the Week headers** now use only original owner-approved SeatGeek matchup art (no ESPN two-player montages). Example manifest after verifying the real selected game and the publisher-hosted image:

```json
{
  "kind": "football-game-header",
  "sport": "cfb",
  "week_of": "2026-10-20",
  "destination": "public/assets/football/weekly/2026-10-20/cfb/game-header.webp",
  "away_team": "Verified Away Team",
  "home_team": "Verified Home Team",
  "source_publisher": "SeatGeek",
  "header_source_url": "https://seatgeekimages.com/matchup/verified/600x450.jpg"
}
```

The source must be a real publicly served `https://seatgeekimages.com/matchup/...` image representing those two teams. The processor preserves the full artwork and adds only neutral side padding as necessary for a 1600×900 WebP; it never crops team logos, invents player images, or composites unrelated ESPN portraits. The manifest's publisher source URL must be stored as the **single** `header_photo_sources` entry in the canonical prepared GOTW package. The generated WebP must be reviewed, pass exact-head green, be deployed and verified on production **before** the owner-selected editorial can be armed. If artwork is unavailable or cannot be used, fail closed and retain the previous approved material.

Production art is shown only in Football Picks' roughly eight-second carousel. The Tuesday midnight Central release remains a database time gate, independent for NFL and CFB. Image-asset deployment alone never publishes the weekly package.

## Owner-provided weekly matchup art (preferred over SeatGeek)

For an explicitly owner-approved **NFL or CFB Game of the Week**, keep the existing
SeatGeek `game-header.webp` as a verified fallback; owner artwork is an optional
independent enhancement, never a precondition for Tuesday 8 AM Central publication.

When Cody supplies an image in chat, verify it belongs to the actual selected
matchup. Convert the supplied bytes to a reviewed, non-stretched 16:9 WebP with
the owner's preferred crop/padding. Commit it through a focused green PR to
`public/assets/football/weekly/YYYY-MM-DD/<sport>/owner-header-<revision>.webp`.
Use a new revisioned filename for each replacement so browsers never cache the
previous graphic. Binary user-supplied photos are committed via GitHub's binary
blob/tree API, **not** through the text-file API and not as a fake publisher URL.

Add just one exact `week_of` / `sport` / `away_team` / `home_team` record to
`src/features/home/footballWeeklyHeaderOverrides.json` with `asset_path`
pointing to that checked-in immutable WebP. No record means the existing verified
SeatGeek `header_asset_path` displays automatically; a browser failure to load
the owner file also falls back to SeatGeek, then the established CSS identity
header. The override never changes published database rows, owner selection,
Spotlight media or videos, full analysis, rankings, Picks, or the Tuesday schedule.
It can be deployed **after** the package publishes via the normal green-head
GitHub PR and Cloudflare release; no backend republish or new cron is needed.

The resolver refuses mismatched game/week/sport or paths outside that exact
weekly public assets folder. The 16:9 eight-second hero keeps accessible team
links and rank/record pills. Football HQ's compact featured-game layout remains
untouched. When an owner image has not been provided, do not delay publication
or generate fake athlete imagery; keep SeatGeek.

## Football Picks owner-uploaded gallery priority (October 20 fix)

The owner control center can already upload 1–4 images to the public
`pick-event-headers` Supabase Storage bucket, recorded on the existing PickEvent
as `header_storage_path` and natural dimensions. **These uploaded Picks images
always win** over the weekly publisher's SeatGeek art, and appear as image-only
slides in their stored gallery order. This path works after publication without
new asset PRs or owner-header JSON changes: it is the canonical existing owner
upload UI. Never suppress `pickEventPosters(event)` because matching weekly
breakdowns exist. Do not display extra overlay pills, names, marks, ranks,
records, time, or duplicate `THE HQ` lettering on the Picks image; Cody's
finished artwork already contains all of it. Keep the existing 16:9, eight-second
carousel. If a gallery image fails, skip it; if none loads, render the verified
weekly SeatGeek images without any text overlays, retaining a CSS-only empty
background as last resort. This affects Picks' image header only—rank/record,
Sports Reference team links and editorial data remain in Football HQ and the
Game Breakdown, not superimposed on custom Picks artwork.
