#!/usr/bin/env python3
"""Read-only inventory of fighter assets already available in Octagon HQ.

Derive availability from CURRENT source files, not a second maintained ledger.
Existing HQ local and app-managed remote photos are accepted by default for new UFC prep events.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALID_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PAIRS = re.compile(r'\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]')


def mappings(root=ROOT):
    source = (root / "src/features/picks/FighterThumbnail.tsx").read_text(encoding="utf-8")

    def section(name):
        match = re.search(r"const " + re.escape(name) + r"\s*=\s*new Map\(\[", source)
        if not match:
            raise ValueError(f"Cannot find canonical {name} in FighterThumbnail.tsx")
        end = source.find("]);", match.end())
        if end < 0:
            raise ValueError(f"Unclosed map: {name}")
        return dict(PAIRS.findall(source[match.end():end]))

    return section("thumbnailSlugAliases"), section("remotePhotoBySlug")


def inventory(slugs, root=ROOT, runtime=None):
    aliases, remotes = mappings(root)
    runtime = runtime or {}
    records = []
    for requested in slugs:
        slug = str(requested).strip().lower()
        if not VALID_SLUG.fullmatch(slug):
            raise ValueError(f"Invalid fighter slug: {requested!r}")
        canonical = aliases.get(slug, slug)
        # Resolve the alias from the same frontend resolver; no copied roster.
        if not VALID_SLUG.fullmatch(canonical):
            raise ValueError(f"Invalid canonical fighter slug: {canonical!r}")
        # The frontend glob supports webp, png, jpg and jpeg; match all four.
        thumb_name = next((
            f"{canonical}-thumb.{ext}"
            for ext in ("webp", "png", "jpg", "jpeg")
            if (root / "public/assets/fighters" / f"{canonical}-thumb.{ext}").is_file()
        ), None)
        spotlight = root / "public/assets/fighters" / f"{canonical}-spotlight.webp"
        # Runtime photo URLs are the same already-used HQ assets returned by
        # get_ufc_fighter_media_map; never require another provenance audit.
        runtime_photo = runtime.get(canonical)
        if runtime_photo and not re.fullmatch(r"https://a\.espncdn\.com/i/headshots/mma/players/full/[0-9]+\.png", str(runtime_photo)):
            raise ValueError(f"Invalid HQ runtime photo URL for {canonical}")
        photo = remotes.get(canonical) or runtime_photo
        if thumb_name:
            status = "existing_local"
        elif photo:
            status = "existing_remote"
        else:
            status = "missing"
        records.append({
            "fighter_slug": slug,
            "canonical_slug": canonical,
            "thumbnail_status": status,
            "thumb_path": f"/assets/fighters/{thumb_name}" if thumb_name else None,
            "remote_headshot_url": photo,
            "spotlight_path": f"/assets/fighters/{canonical}-spotlight.webp" if spotlight.is_file() else None,
            "needs_new_thumb": status == "missing",
            "accepted_existing_hq_photo": status != "missing",
        })
    return records


def preflight_manifest(spec, root=ROOT):
    """A present HQ photo is reused by default, before any network fetch."""
    if spec.get("kind") not in ("thumb", "spotlight"):
        return "process"
    destination = str(spec.get("destination") or "")
    kind = spec["kind"]
    match = re.fullmatch(r"public/assets/fighters/([a-z0-9]+(?:-[a-z0-9]+)*)-" + kind + r"\.webp", destination)
    if not match:
        raise ValueError(f"Invalid {kind} destination: {destination}")
    present = inventory([match.group(1)], root)[0]
    existing = (
        present["thumbnail_status"] != "missing" if kind == "thumb"
        else present["spotlight_path"] is not None
    )
    replace = spec.get("replace_existing") is True
    if replace and not str(spec.get("replacement_reason") or "").strip():
        raise ValueError("replace_existing requires a documented replacement_reason")
    if existing and not replace:
        return "reuse"
    return "process"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slugs", help="Comma-separated UFC fighter slugs")
    parser.add_argument("--prep-json", type=Path, help="Exported UFC prep package JSON")
    parser.add_argument("--manifest", type=Path, help="Asset Ingest manifest preflight")
    parser.add_argument("--runtime-map-json", type=Path, help="Current get_ufc_fighter_media_map JSON, optional")
    parser.add_argument("--preflight", action="store_true", help="Print reuse/process for the manifest")
    args = parser.parse_args()
    if args.manifest:
        spec = json.loads(args.manifest.read_text(encoding="utf-8"))
        decision = preflight_manifest(spec)
        if args.preflight:
            print(decision)
        else:
            print(json.dumps({"decision": decision, "destination": spec.get("destination")}))
        return
    if args.prep_json:
        value = json.loads(args.prep_json.read_text(encoding="utf-8"))
        package = value.get("payload", value)
        fighters = [asset["fighter_slug"] for asset in package["assets"]]
    elif args.slugs:
        fighters = [slug.strip() for slug in args.slugs.split(",") if slug.strip()]
    else:
        parser.error("Provide --slugs, --prep-json or --manifest")
    runtime = json.loads(args.runtime_map_json.read_text(encoding="utf-8")) if args.runtime_map_json else {}
    if not isinstance(runtime, dict):
        parser.error("--runtime-map-json must contain a fighter_slug: URL map")
    records = inventory(fighters, runtime=runtime)
    print(json.dumps({
        "fighters": len(records),
        "existing_local": sum(v["thumbnail_status"] == "existing_local" for v in records),
        "existing_remote": sum(v["thumbnail_status"] == "existing_remote" for v in records),
        "missing": sum(v["thumbnail_status"] == "missing" for v in records),
        "records": records,
        "note": "Owner-locked: existing HQ local or app-managed remote photos are accepted; set thumb_ready true with their current app path/URL. Only missing photos need acquisition.",
    }, indent=2))


if __name__ == "__main__":
    main()
