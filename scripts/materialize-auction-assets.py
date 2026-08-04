from __future__ import annotations

import base64
import re
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageFilter

MODES = [
    "ultimate-fighter",
    "jon-jones-performances",
    "conor-mcgregor-performances",
    "charles-oliveira-performances",
    "fighter-performances",
    "strikers",
    "grapplers",
    "knockout-artists",
    "greatest-ufc-card",
    "championship-performances",
    "finishes",
    "dominant-performances",
    "wars",
    "rivalries",
    "iconic-moments",
    "nicknames",
]

sprite_path = Path("public/auction/auction-format-sprite.svg")
source = sprite_path.read_text(encoding="utf-8")
match = re.search(r'href="data:image/webp;base64,([^"]+)"', source)
if not match:
    raise SystemExit("Auction sprite does not contain an embedded WebP.")

sprite = Image.open(BytesIO(base64.b64decode(match.group(1)))).convert("RGB")
if sprite.size != (720, 404):
    raise SystemExit(f"Unexpected Auction sprite size: {sprite.size}")

output = Path("public/auction")
for index, mode in enumerate(MODES):
    column = index % 4
    row = index // 4
    tile = sprite.crop((column * 180, row * 101, (column + 1) * 180, (row + 1) * 101))
    tile = tile.resize((720, 404), Image.Resampling.LANCZOS)
    tile = tile.filter(ImageFilter.UnsharpMask(radius=1.2, percent=65, threshold=3))
    tile.save(output / f"{mode}.webp", "WEBP", quality=82, method=6)

for mode in MODES:
    path = output / f"{mode}.webp"
    with Image.open(path) as image:
        if image.size != (720, 404) or image.format != "WEBP":
            raise SystemExit(f"Invalid generated Auction asset: {path}")
    if path.stat().st_size < 5_000:
        raise SystemExit(f"Auction asset is unexpectedly small: {path}")

print("Materialized 16 local Auction WebP assets.")
