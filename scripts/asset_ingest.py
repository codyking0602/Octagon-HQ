#!/usr/bin/env python3
import argparse
import hashlib
import ipaddress
import json
import os
import re
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


def official_ufc_event_headshot_url(url):
    """UFC event-results headshots, never the athlete promotional body art."""
    parsed = urlparse(url)
    return (
        parsed.scheme == "https"
        and (parsed.hostname or "").lower() in {"ufc.com", "www.ufc.com"}
        and bool(re.fullmatch(
            r"/images/styles/event_results_athlete_headshot/s3/20[0-9]{2}-[0-9]{2}/[A-Za-z0-9_.-]+[.]png",
            parsed.path,
        ))
    )


def resolve_ufc_profile_source(page_url, fighter_name, kind="spotlight"):
    parsed_page = urlparse(page_url)
    host = (parsed_page.hostname or "").lower()
    if host not in UFC_PROFILE_HOSTS or parsed_page.scheme != "https":
        fail(f"UFC profile host not allowed: {host}")
    if not re.fullmatch(r"/athlete/[A-Za-z0-9-]+/?", parsed_page.path):
        fail("source_page_url must be an official UFC athlete profile")

    page = request_bytes(page_url, MAX_PAGE_BYTES)
    parser = UfcProfileImageParser(fighter_name)
    parser.feed(page.decode("utf-8", errors="replace"))

    for candidate in parser.candidates:
        image_url = urljoin(page_url, candidate)
        if not is_public_https(image_url) or source_url_looks_like_placeholder(image_url):
            continue
        if kind == "thumb" and not official_ufc_event_headshot_url(image_url):
            continue
        return image_url

    if kind == "thumb":
        fail(f"official UFC profile has no real event-results headshot for {fighter_name}")
    fail(f"official UFC profile has no safe fighter photo matching {fighter_name}")


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

    image_url = resolve_ufc_profile_source(source_page_url, fighter_name, spec.get("kind"))
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


def approved_square_thumb_source(spec, source_url, size):
    """Only a verified official UFC/ESPN *headshot product*, never body renders."""
    if spec.get("crop"):
        return False
    if spec.get("source_page_url") and not official_ufc_event_headshot_url(source_url):
        return False
    host = (urlparse(source_url).hostname or "").lower()
    width, height = size
    if not width or not height:
        return False
    if host in {"ufc.com", "www.ufc.com"} and re.fullmatch(
        r"/images/styles/event_results_athlete_headshot/s3/20[0-9]{2}-[0-9]{2}/[A-Za-z0-9_.-]+[.]png",
        urlparse(source_url).path,
    ):
        # UFC's own 256x160 transparent event-results headshot is approved.
        # It is a real headshot product, not its athlete_bio_full_body pose.
        return (width, height) == (256, 160)
    if host == "a.espncdn.com":
        match = re.fullmatch(
            r"/i/headshots/mma/players/full/([0-9]+)[.]png",
            urlparse(source_url).path,
        )
        if not match:
            return False
        if (width, height) == (600, 436):
            return (
                spec.get("official_headshot_reviewed") is True
                and bool(str(spec.get("fighter_name") or "").strip())
                and str(spec.get("verified_espn_athlete_id") or "") == match.group(1)
            )
        return abs(width - height) <= max(width, height) * 0.06
    if abs(width - height) > max(width, height) * 0.06:
        return False
    if host in {"www.ufc.com", "ufc.com"}:
        # UFC may serve promotional body images from athlete pages. Requiring
        # individual editorial verification avoids accepting them as thumbs.
        return spec.get("official_square_headshot_reviewed") is True
    return False


def trim_thumb_publisher_edge_halos(im):
    """Clear narrow publisher strokes outside the headshot crown and edge halos."""
    result = im.copy()
    alpha = result.getchannel("A").filter(ImageFilter.MinFilter(3))
    width, height = result.size
    left_cutoff = round(width * 0.29)
    right_cutoff = round(width * 0.70)
    for y in range(round(height * 0.12)):
        for x in range(left_cutoff):
            alpha.putpixel((x, y), 0)
        for x in range(right_cutoff, width):
            alpha.putpixel((x, y), 0)
    result.putalpha(alpha)
    return result


def render_thumb(im, size):
    """Render a face-dominant head-and-shoulders portrait, not a mini Spotlight."""
    box = visible_subject_box(im)
    if not box:
        fail("thumbnail has no visible fighter pixels")
    subject = im.crop(box)
    # Sources must already be official square headshots. Only fit/resize them,
    # never manufacture a headshot by cutting a promotional fighter body render.
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
    if upper_side_background_band(im) or inset_side_background_panels(im) or horizontal_publisher_strips(im):
        fail("fighter asset retains a rectangular publisher background artifact")
    if kind == "thumb":
        # RemBG may leave a translucent colored publisher panel: normal
        # >=128 alpha testing misses it even though it is plainly visible.
        for x in (round(width * 0.87), round(width * 0.95)):
            sample = range(round(height * 0.04), round(height * 0.53))
            occupied = sum(alpha.getpixel((x, y)) >= 8 for y in sample)
            if occupied > len(sample) * 0.10:
                fail("fighter thumbnail retains a translucent side background panel")
    if box[1] < max(2, round(height * 0.015)):
        fail("fighter head has no top safety margin")
    if (box[2] - box[0]) < width * 0.28 or (box[3] - box[1]) < height * 0.42:
        fail("fighter portrait is too small or narrow for this tile")
    return {
        "alpha_coverage": round(coverage, 3),
        "visible_bbox": list(box),
    }



def upper_side_background_band(im):
    """Detect hard, broad upper-corner background strips common in UFC CDN art."""
    alpha = im.getchannel("A")
    width, height = im.size
    sample_height = max(1, round(height * 0.60))
    # Sample inside output padding as well as at the actual source side.
    for x in (round(width * 0.045), round(width * 0.955)):
        filled = sum(alpha.getpixel((x, y)) >= 8 for y in range(sample_height))
        if filled / sample_height > 0.24:
            return True
    return False




def horizontal_publisher_strips(im):
    """Find thin uniform bars from source art around the top of a portrait."""
    px = im.load()
    w, h = im.size
    strips = []
    for y in range(round(h * 0.30)):
        for side in ("left", "right"):
            for margin in range(max(1, round(w * 0.14))):
                x = margin if side == "left" else w - 1 - margin
                r, g, b, a = px[x, y]
                if a < 8:
                    continue
                direction = 1 if side == "left" else -1
                n = 0
                while 0 <= x + direction * n < w:
                    cr, cg, cb, ca = px[x + direction * n, y]
                    if ca < 8 or max(abs(cr-r), abs(cg-g), abs(cb-b)) > 28:
                        break
                    n += 1
                if n >= max(34, round(w * 0.18)):
                    inner = x + direction * (n - 1)
                    if (side == "left" and inner < w * 0.49) or (
                        side == "right" and inner > w * 0.51
                    ):
                        strips.append((y, side, inner))
                break
    return strips


def source_needs_background_removal(im):
    """Preserve clean official transparent headshots; do not re-segment them.

    ESPN MMA publishes legitimate 600x436 transparent cutouts. Size and the
    editorial-review flag prove source eligibility, not a need to run rembg.
    Only opaque photos or visibly contaminated transparent cutouts need it.
    All resulting assets still pass the same strict output quality gates.
    """
    if im.getchannel("A").getextrema() == (255, 255):
        return True
    return bool(
        upper_side_background_band(im)
        or inset_side_background_panels(im)
        or horizontal_publisher_strips(im)
    )


def remove_horizontal_publisher_strips(im):
    result = im.copy()
    px = result.load()
    for y, side, inner in horizontal_publisher_strips(result):
        positions = range(0, inner + 2) if side == "left" else range(max(0, inner - 1), result.width)
        for x in positions:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
    return result


def inset_side_background_panels(im):
    """Find long flat-color publisher rectangles inset from transparent edges."""
    px = im.load()
    width, height = im.size
    min_run = max(24, round(width * 0.105))
    min_height = max(14, round(height * 0.07))
    panels = []
    for side in ("left", "right"):
        group = []
        previous = None
        for y in range(height + 1):
            candidate = None
            if y < height:
                for offset in range(round(width * 0.27)):
                    x = offset if side == "left" else width - 1 - offset
                    r, g, b, a = px[x, y]
                    if a < 8:
                        continue
                    direction = 1 if side == "left" else -1
                    length = 0
                    while 0 <= x + direction * length < width:
                        cr, cg, cb, ca = px[x + direction * length, y]
                        if ca < 8 or max(abs(cr-r), abs(cg-g), abs(cb-b)) > 28:
                            break
                        length += 1
                    inner = x + direction * (length - 1)
                    if length >= min_run and (
                        (side == "left" and inner <= width * 0.43) or
                        (side == "right" and inner >= width * 0.57)
                    ):
                        candidate = (x, inner, (r, g, b))
                    break
            if group and (
                candidate is None
                or abs(candidate[0] - previous[0]) > 5
                or abs(candidate[1] - previous[1]) > 9
                or max(abs(candidate[2][i] - previous[2][i]) for i in range(3)) > 36
            ):
                if len(group) >= min_height:
                    panels.append((side, group))
                group = []
            if candidate is not None:
                group.append((y, candidate))
            previous = candidate
    return panels


def remove_flat_side_backgrounds(im):
    """Clear broad, nearly flat publisher rectangles without erasing photo detail.

    These UFC/ESPN overlays survive ordinary ML cutout removal as solid gray/red
    blocks adjoining a fighter's right or left silhouette. Only straight color
    runs near an outer side are eligible; textured real-person pixels remain.
    """
    result = im.copy()
    px = result.load()
    width, height = result.size
    min_run = max(24, round(width * 0.095))
    search_depth = max(18, round(width * 0.05))
    for y in range(height):
        for side in ("left", "right"):
            # Publisher blocks may be framed by a few antialiased fringe pixels.
            for outer in range(search_depth):
                x = outer if side == "left" else width - 1 - outer
                r, g, b, a = px[x, y]
                if a < 8:
                    continue
                direction = 1 if side == "left" else -1
                run = []
                pos = x
                while 0 <= pos < width:
                    cr, cg, cb, ca = px[pos, y]
                    if ca < 8 or max(abs(cr-r), abs(cg-g), abs(cb-b)) > 28:
                        break
                    run.append(pos)
                    pos += direction
                if len(run) < min_run:
                    continue
                # Include narrow fringe between the block and transparent border.
                end = max(run) if side == "left" else min(run)
                positions = range(0, end + 2) if side == "left" else range(max(0, end - 1), width)
                for ix in positions:
                    rr, gg, bb, _ = px[ix, y]
                    px[ix, y] = (rr, gg, bb, 0)
                break
    # Remove consistent inset publisher panels, preserving the central athlete.
    for side, rows in inset_side_background_panels(result):
        for y, (_, inner, _) in rows:
            positions = range(0, min(width, inner + 2)) if side == "left" else range(max(0, inner - 1), width)
            for x in positions:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
    return result



# Exact owner-approved Ciryl Gane profile photo (the same CBS frame supplied by
# the owner). This single-source exception does NOT expand the general ESPN/UFC
# source-host allowlist or affect transparent fighter thumbs/Spotlights.
OWNER_GANE_PROFILE_SOURCE = (
    "https://sportshub.cbsistatic.com/i/2026/06/15/"
    "2b1cb9a4-9aa1-47e5-8afa-d75bea65dbc3/gane.jpg"
)
OWNER_GANE_PROFILE_DEST = "public/assets/fighters/ciryl-gane.webp"


def ingest_owner_gane_profile(spec):
    if (
        spec.get("destination") != OWNER_GANE_PROFILE_DEST
        or spec.get("source_url") != OWNER_GANE_PROFILE_SOURCE
        or spec.get("source_page_url")
        or spec.get("fighter_name") != "Ciryl Gane"
        or spec.get("crop") != [0.25, 0.0, 0.50, 1.0]
    ):
        fail("profile ingest is restricted to the approved Ciryl Gane frame and crop")

    data = request_bytes(OWNER_GANE_PROFILE_SOURCE, MAX_BYTES)
    try:
        source = Image.open(BytesIO(data)).convert("RGB")
    except Exception as exc:
        fail(f"cannot decode approved profile photo: {exc}")

    if source.width < 700 or source.height < 480 or source.width / source.height < 1.4:
        fail(f"unexpected Gane photo dimensions: {source.size}")

    # Keep both UFC belts, the head, and blue gloves visible on portrait cards.
    subject = source.crop(crop_box(source, spec["crop"]))
    size = (720, 800)
    target_ratio = size[0] / size[1]
    ratio = subject.width / subject.height
    if ratio > target_ratio:
        new_width = round(subject.height * target_ratio)
        left = (subject.width - new_width) // 2
        subject = subject.crop((left, 0, left + new_width, subject.height))
    elif ratio < target_ratio:
        new_height = round(subject.width / target_ratio)
        top = (subject.height - new_height) // 2
        subject = subject.crop((0, top, subject.width, top + new_height))

    result = subject.resize(size, Image.Resampling.LANCZOS)
    result = result.filter(ImageFilter.UnsharpMask(radius=0.6, percent=90, threshold=2))
    os.makedirs(os.path.dirname(OWNER_GANE_PROFILE_DEST), exist_ok=True)
    result.save(OWNER_GANE_PROFILE_DEST, "WEBP", quality=88, method=6)
    verified = Image.open(OWNER_GANE_PROFILE_DEST)
    if verified.size != size or verified.format != "WEBP":
        fail("Gane profile image failed WebP or dimension verification")
    print(json.dumps({
        "destination": OWNER_GANE_PROFILE_DEST,
        "size": list(verified.size),
        "source_dimensions": list(source.size),
        "source_host": urlparse(OWNER_GANE_PROFILE_SOURCE).hostname,
        "source": "owner-approved Gane champion photograph",
    }))



def source_publisher_band(im):
    """Catch large, nearly solid upper side rectangles missed by edge-only checks.

    Real hair and shoulders vary in texture; publisher strips occupy many
    neighboring rows with a long, nearly uniform RGB run near an outer side.
    """
    px = im.load()
    w, h = im.size
    if w < 50 or h < 50:
        return False
    y0, y1 = round(h * 0.09), round(h * 0.62)
    min_rows = max(8, round(h * 0.055))
    for side in ("left", "right"):
        rows = 0
        for y in range(y0, y1):
            if side == "right":
                xs = range(round(w * 0.72), round(w * 0.97))
            else:
                xs = range(round(w * 0.03), round(w * 0.28))
            colors = [px[x, y] for x in xs if px[x, y][3] >= 8]
            total = max(1, len(xs))
            if len(colors) < total * 0.80:
                rows = 0
                continue
            # Strong, flat horizontal blocks in otherwise transparent corners.
            if all(max(color[channel] for color in colors) -
                   min(color[channel] for color in colors) <= 20
                   for channel in range(3)):
                rows += 1
                if rows >= min_rows:
                    return True
            else:
                rows = 0
    return False


# A manual inspection rejected this exact original-only WebP twice (#2352,
# #2354). Keep it out of all generated-asset PRs even if an alpha heuristic
# misses a subtle publisher panel. Different verified clean photos remain eligible.
VISUALLY_REJECTED_THUMB_BLOBS = {
    "64f29f5a3427f390edc15bc07e68b5064768ac36",
}


def source_thumb_blob_is_rejected(payload):
    blob_hash = hashlib.sha1(
        b"blob " + str(len(payload)).encode("ascii") + b"\x00" + payload
    ).hexdigest()
    return blob_hash in VISUALLY_REJECTED_THUMB_BLOBS


def broad_upper_side_alpha_panel(im):
    """Reject colored/gradient publisher panels even without flat RGB strips.

    An official face-dominant headshot should have transparent upper sides.
    A contiguous upper-side block with alpha across several x positions
    indicates an existing publisher background, not a clean fighter cutout.
    """
    alpha = im.getchannel("A")
    width, height = im.size
    if width < 40 or height < 40:
        return True
    begin, end = round(height * 0.07), round(height * 0.46)
    for side in ("left", "right"):
        xs = (
            (round(width * 0.08), round(width * 0.17), round(width * 0.27))
            if side == "left"
            else (round(width * 0.73), round(width * 0.83), round(width * 0.92))
        )
        filled_rows = 0
        for y in range(begin, end):
            if sum(alpha.getpixel((x, y)) >= 8 for x in xs) >= 2:
                filled_rows += 1
        if filled_rows > (end - begin) * 0.34:
            return True
    return False


def require_clean_original_thumb(im):
    """Only use an already-transparent, genuine official headshot.

    No rembg, alpha matting, color painting, side trimming, or replacement
    backgrounds are allowed for thumbs. A rejected original must be replaced
    by a *different verified official source*, never 'repaired' in place.
    """
    alpha = im.getchannel("A")
    if alpha.getextrema()[0] != 0:
        fail("thumbnail original has no fully transparent background; select another official source")
    corners = [
        alpha.getpixel((0, 0)), alpha.getpixel((im.width - 1, 0)),
        alpha.getpixel((0, im.height - 1)),
        alpha.getpixel((im.width - 1, im.height - 1)),
    ]
    if sum(value < 8 for value in corners) < 3:
        fail("thumbnail original retains an opaque corner/background")
    if (upper_side_background_band(im)
            or inset_side_background_panels(im)
            or horizontal_publisher_strips(im)
            or source_publisher_band(im)
            or broad_upper_side_alpha_panel(im)):
        fail("thumbnail original retains a publisher background panel; try another official source")
    if image_looks_like_silhouette(im):
        fail("thumbnail original is a placeholder/silhouette")


def verified_thumb_candidates(spec):
    """Explicit ESPN/UFC alternate headshots, each separately provenance-checked."""
    alternates = spec.get("fallback_sources", [])
    if not isinstance(alternates, list) or len(alternates) > 3:
        fail("fallback_sources must be a list of at most three verified official sources")
    original = dict(spec)
    original.pop("fallback_sources", None)
    candidates = [original]
    for candidate in alternates:
        if not isinstance(candidate, dict):
            fail("each fallback source must be a source specification")
        if candidate.get("fighter_name") not in (None, spec.get("fighter_name")):
            fail("fallback source cannot change the fighter identity")
        if set(candidate) - {
            "source_url", "source_page_url", "fighter_name",
            "official_headshot_reviewed", "official_square_headshot_reviewed",
            "verified_espn_athlete_id",
        }:
            fail("unsupported fallback source field")
        next_spec = {
            "kind": "thumb",
            "destination": spec["destination"],
            "fighter_name": spec.get("fighter_name"),
            **candidate,
        }
        if bool(next_spec.get("source_url")) == bool(next_spec.get("source_page_url")):
            fail("each fallback must provide exactly one official source")
        candidates.append(next_spec)
    return candidates


def ingest_fighter_candidate(spec, kind, dest, size):
    source_url, data = resolve_source(spec)
    if source_url_looks_like_placeholder(source_url):
        fail("source URL is a known placeholder or silhouette asset")
    try:
        im = Image.open(BytesIO(data)).convert("RGBA")
    except Exception as exc:
        fail(f"cannot decode source image: {exc}")

    if kind == "thumb":
        if not approved_square_thumb_source(spec, source_url, im.size):
            fail("thumbnail requires a verified UFC/ESPN headshot product")
        if spec.get("force_background_removal") or spec.get("crop"):
            fail("thumbnail source cannot be cropped or background-removed")
        require_clean_original_thumb(im)
    else:
        if source_needs_background_removal(im):
            try:
                im = remove(im).convert("RGBA")
            except Exception as exc:
                fail(f"spotlight background removal failed: {exc}")
            if im.getchannel("A").getextrema() == (255, 255):
                fail("spotlight background removal produced no transparency")
        if spec.get("force_background_removal"):
            try:
                im = remove(im).convert("RGBA")
            except Exception as exc:
                fail(f"spotlight second background removal failed: {exc}")
        im = remove_horizontal_publisher_strips(remove_flat_side_backgrounds(im))
        if inset_side_background_panels(im) or upper_side_background_band(im):
            fail("spotlight cutout retains publisher panels")
        if image_looks_like_silhouette(im):
            fail("spotlight is a placeholder/silhouette")

    im = im.crop(crop_box(im, spec.get("crop")))
    clipping = source_looks_clipped(im, kind)
    if clipping:
        fail(clipping)

    if kind == "spotlight":
        visible_box = im.getchannel("A").getbbox()
        if not visible_box:
            fail("spotlight source has no visible pixels")
        subject = im.crop(visible_box)
        side_pad = round(size[0] * 0.025)
        top_pad = round(size[1] * 0.035)
        scale = min(
            (size[0] - side_pad * 2) / subject.width,
            (size[1] - top_pad) / subject.height,
        )
        fitted = subject.resize(
            (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        canvas.alpha_composite(fitted, ((size[0] - fitted.width) // 2,
                                         max(top_pad, size[1] - fitted.height)))
        im = remove_horizontal_publisher_strips(remove_flat_side_backgrounds(canvas))
        im = im.filter(ImageFilter.UnsharpMask(radius=0.6, percent=110, threshold=2))
    else:
        # Pure fit onto a transparent tile: preserve original fighter pixels.
        im = render_thumb(im, size)

    # Validate *before* writing. A failed candidate must never leave an
    # unreviewed WebP in the working tree (which a later successful batchmate
    # could accidentally cause to be committed).
    encoded = BytesIO()
    im.save(encoded, "WEBP", lossless=True, quality=100, method=6)
    encoded.seek(0)
    check = Image.open(encoded).convert("RGBA")
    if check.size != size or check.getchannel("A").getextrema() == (255, 255):
        fail("finished asset failed dimension/alpha gate")
    quality = validate_asset_quality(check, kind)
    if kind == "thumb" and (source_publisher_band(check) or broad_upper_side_alpha_panel(check)):
        fail("finished thumbnail retains a publisher band")
    if kind == "thumb" and source_thumb_blob_is_rejected(encoded.getvalue()):
        fail("finished thumbnail matches a previously visually rejected publisher-panel photo")

    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as handle:
        handle.write(encoded.getvalue())

    return {
        "destination": dest,
        "size": list(check.size),
        "alpha_extrema": list(check.getchannel("A").getextrema()),
        "source_host": urlparse(source_url).hostname,
        "source_url": source_url,
        "quality": quality,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    args = parser.parse_args()

    with open(args.manifest, encoding="utf-8") as handle:
        spec = json.load(handle)

    kind = spec.get("kind")
    if kind == "profile":
        return ingest_owner_gane_profile(spec)
    if kind not in {"thumb", "spotlight"}:
        fail("kind must be thumb or spotlight")

    dest = spec.get("destination", "")
    if (
        not dest.startswith(PREFIX)
        or not dest.endswith(f"-{kind}.webp")
        or ".." in dest
    ):
        fail("destination is outside approved fighter asset path")

    size = (320, 320) if kind == "thumb" else (626, 800)
    candidates = verified_thumb_candidates(spec) if kind == "thumb" else [spec]
    failures = []
    for index, candidate in enumerate(candidates, start=1):
        try:
            result = ingest_fighter_candidate(candidate, kind, dest, size)
            result["candidate_index"] = index
            print(json.dumps(result))
            return
        except (SystemExit, OSError, ValueError) as exc:
            if kind != "thumb":
                raise
            failures.append(f"candidate {index}: {str(exc) or type(exc).__name__}")
            print(
                f"asset-ingest: rejected thumbnail candidate {index}; trying verified alternate",
                file=sys.stderr,
            )
    fail("no clean verified UFC/ESPN thumbnail source; " + "; ".join(failures))


if __name__ == "__main__":
    main()
