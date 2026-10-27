#!/usr/bin/env python3
import argparse
import ipaddress
import json
import os
import sys
from html.parser import HTMLParser
from io import BytesIO
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter
from rembg import remove

ALLOWED_HOSTS = {
    "a.espncdn.com",
    "espncdn.com",
    "www.espn.com",
    "espn.com",
    "ufc.com",
    "www.ufc.com",
}
UFC_PROFILE_HOSTS = {
    "ufc.com",
    "www.ufc.com",
    "ufc.com.br",
    "www.ufc.com.br",
    "jp.ufc.com",
}
PREFIX = "public/assets/fighters/"
MAX_BYTES = 20 * 1024 * 1024
MAX_PAGE_BYTES = 5 * 1024 * 1024
PLACEHOLDER_URL_MARKERS = (
    "silhouette",
    "placeholder",
    "default-avatar",
    "default_avatar",
    "no-image",
    "no_image",
    "no-photo",
    "no_photo",
)


def fail(msg):
    print(f"asset-ingest: {msg}", file=sys.stderr)
    raise SystemExit(1)


def request_bytes(url, max_bytes):
    req = Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 OctagonHQAssetIngest/1.0"},
    )
    with urlopen(req, timeout=30) as response:
        data = response.read(max_bytes + 1)

    if len(data) > max_bytes:
        fail(f"source exceeds {max_bytes // (1024 * 1024)} MB")
    return data


def download(url):
    host = (urlparse(url).hostname or "").lower()
    if host not in ALLOWED_HOSTS:
        fail(f"source host not allowed: {host}")
    return request_bytes(url, MAX_BYTES)


def is_public_https(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        return False
    host = parsed.hostname.lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        return False
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return True
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
    )


class UfcProfileImageParser(HTMLParser):
    def __init__(self, fighter_name):
        super().__init__()
        self.fighter_name = " ".join(fighter_name.lower().split())
        self.candidates = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "img":
            return

        values = {key.lower(): value for key, value in attrs if key and value}
        alt = " ".join(values.get("alt", "").lower().split())
        if not alt or self.fighter_name not in alt:
            return

        for key in ("src", "data-src", "data-original"):
            value = values.get(key)
            if value:
                self.candidates.append(value)
                return

        for key in ("srcset", "data-srcset"):
            value = values.get(key)
            if not value:
                continue
            first = value.split(",", 1)[0].strip().split(" ", 1)[0]
            if first:
                self.candidates.append(first)
                return


def source_url_looks_like_placeholder(url):
    value = url.lower()
    return any(marker in value for marker in PLACEHOLDER_URL_MARKERS)


def image_looks_like_silhouette(im):
    sample = im.copy()
    sample.thumbnail((128, 128), Image.Resampling.LANCZOS)
    pixels = [
        (r, g, b)
        for r, g, b, a in sample.convert("RGBA").getdata()
        if a >= 32
    ]
    if not pixels:
        return True

    colorful = sum(
        1
        for r, g, b in pixels
        if max(r, g, b) - min(r, g, b) >= 12 and max(r, g, b) >= 35
    )
    return colorful / len(pixels) < 0.01


def resolve_ufc_profile_source(page_url, fighter_name):
    host = (urlparse(page_url).hostname or "").lower()
    if host not in UFC_PROFILE_HOSTS:
        fail(f"UFC profile host not allowed: {host}")

    page = request_bytes(page_url, MAX_PAGE_BYTES)
    html = page.decode("utf-8", errors="replace")

    parser = UfcProfileImageParser(fighter_name)
    parser.feed(html)
    if not parser.candidates:
        fail(f"official UFC profile has no fighter image matching {fighter_name}")

    for candidate in parser.candidates:
        image_url = urljoin(page_url, candidate)
        if not is_public_https(image_url):
            continue
        if source_url_looks_like_placeholder(image_url):
            continue
        return image_url

    fail("official UFC profile image URL is not a safe public HTTPS URL")


def resolve_source(spec):
    source_url = spec.get("source_url")
    source_page_url = spec.get("source_page_url")

    if bool(source_url) == bool(source_page_url):
        fail("manifest must provide exactly one of source_url or source_page_url")

    if source_url:
        return source_url, download(source_url)

    fighter_name = str(spec.get("fighter_name") or "").strip()
    if not fighter_name:
        fail("fighter_name is required with source_page_url")

    image_url = resolve_ufc_profile_source(source_page_url, fighter_name)
    return image_url, request_bytes(image_url, MAX_BYTES)


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



def visible_subject_box(im):
    """Ignore faint cutout haze when locating the actual fighter."""
    alpha = im.getchannel("A")
    solid = alpha.point(lambda value: 255 if value >= 48 else 0)
    return solid.getbbox()


def source_looks_clipped(im, kind):
    """A subject touching the source boundary cannot be restored by padding it."""
    alpha = im.getchannel("A")
    width, height = im.size
    top = alpha.crop((0, 0, width, 1))
    if sum(value >= 48 for value in top.getdata()) > max(3, width * 0.08):
        return "top of fighter is clipped by the source photo"
    if kind == "spotlight":
        bottom = alpha.crop((0, height - 1, width, height))
        if sum(value >= 48 for value in bottom.getdata()) > max(3, width * 0.32):
            return "bottom of fighter is clipped by the source photo"
    return ""


def render_thumb(im, size):
    """Fit the upper body into a transparent bust tile; never square-crop away the head."""
    box = visible_subject_box(im)
    if not box:
        fail("thumbnail has no visible fighter pixels")
    subject = im.crop(box)
    # Tall UFC fighter renders must not shrink the entire body into a tiny head.
    # The human image review still owns final face framing and identity.
    if subject.height > subject.width * 1.45:
        subject = subject.crop((0, 0, subject.width, min(subject.height, round(subject.width * 1.45))))
    horizontal_pad = round(size[0] * 0.025)
    top_pad = round(size[1] * 0.035)
    bottom_pad = round(size[1] * 0.025)
    scale = min(
        (size[0] - 2 * horizontal_pad) / subject.width,
        (size[1] - top_pad - bottom_pad) / subject.height,
    )
    fitted = subject.resize(
        (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(fitted, ((size[0] - fitted.width) // 2, top_pad))
    return canvas


def validate_asset_quality(im, kind):
    """Fail obvious background/framing defects, not merely absent alpha metadata."""
    width, height = im.size
    box = visible_subject_box(im)
    if not box:
        fail("finished image has no visible fighter")
    alpha = im.getchannel("A")
    pixels = list(alpha.getdata())
    coverage = sum(value >= 48 for value in pixels) / len(pixels)
    corners = [alpha.getpixel(pos) for pos in (
        (0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)
    )]
    if sum(value < 48 for value in corners) < 3:
        fail("fighter asset retains an opaque rectangular background")
    if coverage > 0.82:
        fail("fighter asset covers too much of the frame; likely background artifact")
    if box[1] < max(2, round(height * 0.015)):
        fail("fighter head has no top safety margin")
    if (box[2] - box[0]) < width * 0.28 or (box[3] - box[1]) < height * 0.42:
        fail("fighter portrait is too small or narrow for this tile")
    return {
        "alpha_coverage": round(coverage, 3),
        "visible_bbox": list(box),
    }


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
    source_url, data = resolve_source(spec)
    if source_url_looks_like_placeholder(source_url):
        fail("source URL is a known placeholder or silhouette asset")

    try:
        im = Image.open(BytesIO(data)).convert("RGBA")
    except Exception as exc:
        fail(f"cannot decode source image: {exc}")

    if im.getchannel("A").getextrema() == (255, 255):
        try:
            im = remove(im).convert("RGBA")
        except Exception as exc:
            fail(f"background removal failed: {exc}")

        if im.getchannel("A").getextrema() == (255, 255):
            fail("background removal produced no visible transparency")

    if spec.get("force_background_removal"):
        try:
            im = remove(im).convert("RGBA")
        except Exception as exc:
            fail(f"second background removal failed: {exc}")

    if image_looks_like_silhouette(im):
        fail("source image looks like a placeholder/silhouette rather than a fighter photo")

    box = crop_box(im, spec.get("crop"))
    im = im.crop(box)
    clipping = source_looks_clipped(im, kind)
    if clipping:
        fail(clipping)

    if kind == "spotlight":
        alpha = im.getchannel("A")
        visible_box = alpha.getbbox()
        if not visible_box:
            fail("spotlight source has no visible pixels")
        subject = im.crop(visible_box)
        side_pad = round(size[0] * 0.025)
        top_pad = round(size[1] * 0.035)
        available_width = size[0] - (side_pad * 2)
        available_height = size[1] - top_pad
        scale = min(available_width / subject.width, available_height / subject.height)
        fitted = subject.resize(
            (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        left = (size[0] - fitted.width) // 2
        top = max(top_pad, size[1] - fitted.height)
        canvas.alpha_composite(fitted, (left, top))
        im = canvas
    else:
        im = render_thumb(im, size)

    im = im.filter(
        ImageFilter.UnsharpMask(radius=0.6, percent=110, threshold=2)
    )

    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.save(dest, "WEBP", lossless=True, quality=100, method=6)

    check = Image.open(dest).convert("RGBA")
    if check.size != size or check.getchannel("A").getextrema() == (255, 255):
        fail("finished asset failed dimension/alpha gate")
    quality = validate_asset_quality(check, kind)

    print(
        json.dumps(
            {
                "destination": dest,
                "size": list(check.size),
                "alpha_extrema": list(check.getchannel("A").getextrema()),
                "source_host": urlparse(source_url).hostname,
                "quality": quality,
            }
        )
    )


if __name__ == "__main__":
    main()
