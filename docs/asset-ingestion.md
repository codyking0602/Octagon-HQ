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
