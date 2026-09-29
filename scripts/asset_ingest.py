#!/usr/bin/env python3
import argparse
import json
import os
import sys
from io import BytesIO
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter
from rembg import new_session, remove

ALLOWED_HOSTS = {
    "a.espncdn.com",
    "espncdn.com",
    "www.espn.com",
    "espn.com",
    "ufc.com",
    "www.ufc.com",
}
PREFIX = "public/assets/fighters/"
MAX_BYTES = 20 * 1024 * 1024


def fail(msg):
    print(f"asset-ingest: {msg}", file=sys.stderr)
    raise SystemExit(1)


def download(url):
    host = (urlparse(url).hostname or "").lower()
    if host not in ALLOWED_HOSTS:
        fail(f"source host not allowed: {host}")

    req = Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 OctagonHQAssetIngest/1.0"},
    )
    with urlopen(req, timeout=30) as response:
        data = response.read(MAX_BYTES + 1)

    if len(data) > MAX_BYTES:
        fail("source exceeds 20 MB")
    return data


def clear_corner_background(im, tolerance=48):
    """Remove flat residual background regions connected to image corners."""
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    seen = set()
    seeds = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    limit = tolerance * tolerance

    for seed in seeds:
        if seed in seen:
            continue
        sx, sy = seed
        sr, sg, sb, sa = pixels[sx, sy]
        if sa == 0:
            seen.add(seed)
            continue

        stack = [seed]
        component = []
        while stack:
            x, y = stack.pop()
            if (x, y) in seen:
                continue
            seen.add((x, y))
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            distance = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2
            if distance > limit:
                continue

            component.append((x, y))
            if x > 0:
                stack.append((x - 1, y))
            if x + 1 < width:
                stack.append((x + 1, y))
            if y > 0:
                stack.append((x, y - 1))
            if y + 1 < height:
                stack.append((x, y + 1))

        for x, y in component:
            r, g, b, _ = pixels[x, y]
            pixels[x, y] = (r, g, b, 0)

    return rgba


def crop_box(im, crop):
    if not crop:
        return (0, 0, im.width, im.height)

    if len(crop) != 4 or any(float(v) < 0 or float(v) > 1 for v in crop):
        fail("crop must be four normalized 0..1 values")

    x, y, w, h = map(float, crop)
    if w <= 0 or h <= 0 or x + w > 1.00001 or y + h > 1.00001:
        fail("invalid normalized crop")

    return (
        round(x * im.width),
        round(y * im.height),
        round((x + w) * im.width),
        round((y + h) * im.height),
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    args = parser.parse_args()

    with open(args.manifest, encoding="utf-8") as handle:
        spec = json.load(handle)

    kind = spec.get("kind")
    if kind not in {"thumb", "spotlight"}:
        fail("kind must be thumb or spotlight")

    dest = spec.get("destination", "")
    suffix = f"-{kind}.webp"
    if (
        not dest.startswith(PREFIX)
        or not dest.endswith(suffix)
        or ".." in dest
    ):
        fail("destination is outside approved fighter asset path")

    size = (320, 320) if kind == "thumb" else (626, 800)
    data = download(spec["source_url"])

    try:
        im = Image.open(BytesIO(data)).convert("RGBA")
    except Exception as exc:
        fail(f"cannot decode source image: {exc}")

    if im.getchannel("A").getextrema() == (255, 255):
        try:
            session = new_session("u2net_human_seg")
            im = remove(
                im,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10,
            ).convert("RGBA")
        except Exception as exc:
            fail(f"background removal failed: {exc}")

        if im.getchannel("A").getextrema() == (255, 255):
            fail("background removal produced no visible transparency")

    im = clear_corner_background(im)\n\n    box = crop_box(im, spec.get("crop"))
    im = im.crop(box)

    target_ratio = size[0] / size[1]
    ratio = im.width / im.height
    if ratio > target_ratio:
        new_width = round(im.height * target_ratio)
        left = (im.width - new_width) // 2
        im = im.crop((left, 0, left + new_width, im.height))
    elif ratio < target_ratio:
        new_height = round(im.width / target_ratio)
        top = (im.height - new_height) // 2
        im = im.crop((0, top, im.width, top + new_height))

    im = im.resize(size, Image.Resampling.LANCZOS)
    im = im.filter(
        ImageFilter.UnsharpMask(radius=0.6, percent=110, threshold=2)
    )

    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.save(dest, "WEBP", lossless=True, quality=100, method=6)

    check = Image.open(dest).convert("RGBA")
    if (
        check.size != size
        or check.getchannel("A").getextrema() == (255, 255)
    ):
        fail("finished asset failed dimension/alpha gate")

    print(
        json.dumps(
            {
                "destination": dest,
                "size": list(check.size),
                "alpha_extrema": list(check.getchannel("A").getextrema()),
                "source_host": urlparse(spec["source_url"]).hostname,
            }
        )
    )


if __name__ == "__main__":
    main()
