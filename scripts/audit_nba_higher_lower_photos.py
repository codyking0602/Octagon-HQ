#!/usr/bin/env python3
"""Audit every possible NBA Higher or Lower player's actual remote image pixels.

HTTP 200 / valid NBA IDs are not proof of a real portrait: the official
headshot endpoint sometimes serves an identical gray silhouette to multiple
identities. Download and inspect each eligible player's actual bytes instead.
"""
import concurrent.futures
import hashlib
import io
import json
import sys
import time
import urllib.request
from collections import defaultdict
from PIL import Image

MANIFEST = "nba-photo-audit-manifest.json"
REPORT = "nba-photo-audit-report.json"

def fetch_image(entry):
    url = entry["url"]
    if not url:
        return dict(entry, status="no-photo", reason="missing portrait URL")
    error = None
    for retry in range(2):
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; OctagonHQ-photo-integrity-audit/1.0)",
                "Accept": "image/webp,image/png,image/jpeg,image/*",
            })
            with urllib.request.urlopen(request, timeout=18) as response:
                content = response.read(8 * 1024 * 1024)
                status = response.status
            with Image.open(io.BytesIO(content)) as img:
                img.load()
                size = img.size
                thumb = img.convert("RGBA").resize((80, 60))
                px = list(thumb.getdata())
            visible = [p for p in px if p[3] >= 110]
            gray = sum(1 for r,g,b,_ in visible
                if 112 <= r <= 195 and max(r,g,b)-min(r,g,b) <= 12)
            flat_fraction = gray / max(1, len(visible))
            if len(visible) < 40:
                category = "no-photo"
                reason = "image has insufficient visible pixels"
            elif flat_fraction >= .68:
                category = "silhouette"
                reason = f"flat gray body/image ({flat_fraction:.0%} of visible pixels)"
            else:
                category = "image"
                reason = ""
            return dict(entry, status=category, reason=reason,
                http=status, imageSize=list(size), bytes=len(content),
                flatGrayFraction=round(flat_fraction, 4),
                sha256=hashlib.sha256(content).hexdigest())
        except Exception as exc:
            error = str(exc)
            time.sleep(.25 * (retry+1))
    return dict(entry, status="unavailable", reason=error or "unknown retrieval error")

def main():
    with open(MANIFEST, encoding="utf-8") as f:
        entries = json.load(f)
    if len(entries) != len({x["name"] for x in entries}):
        raise SystemExit("Duplicate names in source manifest; identity binding is ambiguous")
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        results = list(executor.map(fetch_image, entries))
    fingerprints = defaultdict(list)
    for item in results:
        if item.get("sha256"):
            fingerprints[item["sha256"]].append(item)
    for duplicates in fingerprints.values():
        if len(duplicates) > 1:
            for item in duplicates:
                item["status"] = "duplicate-image"
                item["reason"] = "identical image served for: " + ", ".join(sorted(x["name"] for x in duplicates))
    bad = [x for x in results if x["status"] != "image"]
    report = dict(total=len(results), verified=len(results)-len(bad),
                  needsAttention=bad, entries=results)
    with open(REPORT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"NBA photo audit: {report['verified']}/{report['total']} eligible players have distinct accessible non-gray images")
    for item in bad:
        print(f"PHOTO ISSUE: {item['name']} NBA_ID={item['nbaId']} [{item['status']}] {item['reason']}")
    if bad:
        print(f"FAIL: {len(bad)} portraits must be remedied or excluded before calling photo coverage verified.")
        sys.exit(1)
    print("PASS: all eligible player photo URLs fetched, decoded and screened for gray placeholders and duplicates")

if __name__ == "__main__":
    main()
