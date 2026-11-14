#!/usr/bin/env python3
"""Non-generative enlargement preview of the approved 160px UFC HQ thumbnails.

Only the three event-day fighters are generated for visual review. Existing
-thumb.webp and -spotlight.webp assets remain unchanged.
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

FIGHTERS = ("ciryl-gane", "kayla-harrison", "amanda-nunes")
ASSET_DIR = Path("public/assets/fighters")
OUTPUT_SIZE = (640, 640)

def create_home_portrait(slug: str) -> Path:
    original = ASSET_DIR / f"{slug}-thumb.webp"
    destination = ASSET_DIR / f"{slug}-home.webp"
    if not original.is_file():
        raise FileNotFoundError(original)
    with Image.open(original) as source:
        if source.size != (160, 160):
            raise ValueError(f"{slug} source unexpectedly changed: {source.size}")
        rgba = source.convert("RGBA")
        # Preserve exact identity, outfit, pose, cutout, and framing.
        enlarged = rgba.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)
        red, green, blue, alpha = enlarged.split()
        color = Image.merge("RGB", (red, green, blue))
        color = ImageEnhance.Contrast(color).enhance(1.035)
        color = color.filter(ImageFilter.UnsharpMask(radius=1.1, percent=105, threshold=3))
        color.putalpha(alpha)
        color.save(destination, "WEBP", lossless=True, method=6)
        print(f"{destination} — {OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]} ({destination.stat().st_size:,} bytes)")
    return destination

def main() -> None:
    for slug in FIGHTERS:
        create_home_portrait(slug)

if __name__ == "__main__":
    main()
