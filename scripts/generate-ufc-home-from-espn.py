#!/usr/bin/env python3
"""Replace the first three UFC Home proofs from real, independently sourced ESPN portraits.

Unlike the 160px ranking thumbnail super-resolution pass, this acquires the actual
high-resolution source PNGs from ESPN's documented athlete IDs and produces
Home-only square headshot crops. No generated identity or thumbnail edits.
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets" / "fighters"
SOURCE_URLS = {
    "ciryl-gane": "https://a.espncdn.com/i/headshots/mma/players/full/4426000.png",
    "kayla-harrison": "https://a.espncdn.com/i/headshots/mma/players/full/4332765.png",
    "amanda-nunes": "https://a.espncdn.com/i/headshots/mma/players/full/2516131.png",
}
SIZE = 640

def retrieve_png(url: str) -> Image.Image:
    if not url.startswith("https://a.espncdn.com/i/headshots/mma/players/full/"):
        raise ValueError("Unapproved athlete image source")
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; OctagonHQ-verified-portrait/1.0)",
            "Referer": "https://www.espn.com/",
            "Accept": "image/avif,image/webp,image/apng,image/png,image/*;q=0.8",
        },
    )
    with urlopen(request, timeout=45) as response:
        if response.status != 200:
            raise RuntimeError(f"Source image HTTP status {response.status}")
        payload = response.read(3_000_000)
    with Image.open(BytesIO(payload)) as loaded:
        if loaded.format != "PNG":
            raise ValueError(f"ESPN photo was not a PNG: {loaded.format}")
        if loaded.width < 550 or loaded.height < 400:
            raise ValueError(f"Source was a thumbnail, not a genuine source: {loaded.size}")
        return loaded.convert("RGBA")

def create_home(slug: str, source_url: str) -> None:
    source = retrieve_png(source_url)
    source_width, source_height = source.size
    side = min(source_width, source_height)
    # Square crop around the actual fighter's face with natural proportions.
    left = (source_width - side) // 2
    top = 0
    crop = source.crop((left, top, left + side, top + side))
    # Dark tray is the established UFC Home media treatment.
    matte = Image.new("RGBA", crop.size, (17, 24, 32, 255))
    matte.alpha_composite(crop)
    result = matte.convert("RGB").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    result = result.filter(ImageFilter.UnsharpMask(radius=0.65, percent=55, threshold=2))
    destination = ASSETS / f"{slug}.home.webp"
    result.save(destination, format="WEBP", quality=87, method=6)
    with Image.open(destination) as check:
        if check.size != (SIZE, SIZE) or check.format != "WEBP":
            raise ValueError(f"Failed image validation: {slug}")
    bytes_count = destination.stat().st_size
    if not 12_000 < bytes_count < 250_000:
        raise ValueError(f"Home portrait size out of approved range: {slug} {bytes_count}")
    print(f"{slug}: ESPN {source_width}x{source_height} -> real-source Home {SIZE}x{SIZE} ({bytes_count} bytes)")
    print(f"  source: {source_url}")

def main() -> None:
    for slug, url in SOURCE_URLS.items():
        create_home(slug, url)

if __name__ == "__main__":
    main()
