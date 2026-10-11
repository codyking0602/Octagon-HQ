#!/usr/bin/env python3
"""Deterministic Football weekly photo/art processor used by the canonical Asset Ingest job.

Inputs are verified ESPN-origin photo candidates, never synthetic people. This script
makes media assets only; it does not activate Home or mutate live Picks.
"""
import argparse
import ipaddress
import json
import re
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler

from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = Path("public/assets/football/weekly")
ALLOWED_HOSTS = {"a.espncdn.com", "espncdn.com", "cdn.espn.com", "www.espn.com"}
SPOTLIGHT_SIZE = (720, 900)
HEADER_SIZE = (1600, 900)
MAX_BYTES = 20 * 1024 * 1024
MIN_SIDE = 240
ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,79}$")
WEEK = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
PLACEHOLDERS = ("placeholder", "silhouette", "no-image", "default-avatar", "no-photo")


class AssetError(ValueError):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise AssetError("Image source redirect rejected; supply its final verified ESPN URL")


def checked_source(url):
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or host not in ALLOWED_HOSTS or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise AssetError("Football photo must be direct HTTPS on an approved ESPN image host")
    if any(marker in url.lower() for marker in PLACEHOLDERS):
        raise AssetError("Placeholder/silhouette image not allowed")
    return url


def download_photo(url):
    checked_source(url)
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 OctagonHQEditorial/1.0", "Accept": "image/*"})
    try:
        with build_opener(NoRedirect).open(req, timeout=22) as response:
            content_type = response.headers.get("Content-Type", "").lower()
            if not content_type.startswith("image/"):
                raise AssetError("Source is not an image")
            data = response.read(MAX_BYTES + 1)
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise AssetError(f"Source unavailable: {exc}") from exc
    if len(data) > MAX_BYTES:
        raise AssetError("Photo exceeds 20 MB")
    try:
        source = Image.open(BytesIO(data))
        source.verify()
        source = Image.open(BytesIO(data))
        source = ImageOps.exif_transpose(source).convert("RGBA")
    except Exception as exc:
        raise AssetError("Photo could not be decoded") from exc
    if min(source.size) < MIN_SIDE:
        raise AssetError("Photo too small to use safely")
    colors = source.resize((48, 48)).getcolors(48 * 48)
    if colors is not None and len(colors) < 12:
        raise AssetError("Photo looks like a blank placeholder")
    return source


def choose_photo(candidates, loader=download_photo):
    """Action → portrait → approved manual; try all available verified sources."""
    if not isinstance(candidates, list) or not candidates or len(candidates) > 12:
        raise AssetError("Supply one to twelve verified photo sources")
    seen = set()
    allowed_kinds = {"action": 0, "portrait": 1, "manual": 2}
    for item in candidates:
        if not isinstance(item, dict) or set(item) != {"url", "kind", "identity_reference_url"}:
            raise AssetError("Every photo requires url, kind and identity_reference_url")
        if item["kind"] not in allowed_kinds:
            raise AssetError("Unsupported photo fallback")
        checked_source(item["url"])
        ref = urlparse(item["identity_reference_url"])
        if ref.scheme != "https" or ref.hostname not in {"www.espn.com", "espn.com"}:
            raise AssetError("Photo identity reference must be an ESPN player profile")
        if item["url"] in seen:
            raise AssetError("Duplicate photo source")
        seen.add(item["url"])
    attempts = []
    for item in sorted(candidates, key=lambda x: allowed_kinds[x["kind"]]):
        try:
            return loader(item["url"]), item
        except AssetError as exc:
            attempts.append(item["kind"] + ": " + str(exc))
    raise AssetError("No valid real player photo: " + "; ".join(attempts))


def checked_destination(spec):
    week = spec.get("week_of")
    sport = spec.get("sport")
    kind = spec.get("kind")
    if not isinstance(week, str) or not WEEK.fullmatch(week):
        raise AssetError("week_of must be a Tuesday date")
    from datetime import date
    try:
        if date.fromisoformat(week).weekday() != 1:
            raise AssetError("Football week must start Tuesday")
    except ValueError as exc:
        raise AssetError("Invalid week_of date") from exc
    if sport not in ("cfb", "nfl"):
        raise AssetError("Unknown Football sport")
    if kind not in ("football-spotlight", "football-game-header"):
        raise AssetError("Unsupported Football art kind")
    suffix = "spotlight.webp" if kind == "football-spotlight" else "game-header.webp"
    dest = ROOT / week / sport / suffix
    if spec.get("destination") != str(dest):
        raise AssetError("Destination must equal the canonical weekly Football asset path")
    return dest


def safe_color(raw):
    if not isinstance(raw, str) or not HEX.fullmatch(raw):
        raise AssetError("Team color must be six-digit hex")
    return tuple(int(raw[i:i + 2], 16) for i in (1, 3, 5))


def font(size):
    for candidate in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                      "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def spotlight(source):
    """The existing Home Spotlight owns text, colors and layout; this produces the portrait only."""
    face = ImageOps.fit(source, SPOTLIGHT_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.25))
    return face.filter(ImageFilter.UnsharpMask(radius=1, percent=115, threshold=3))


def cover_photo(photo, bounds, portrait=False):
    w, h = bounds
    return ImageOps.fit(photo, (w, h), method=Image.Resampling.LANCZOS,
                        centering=(0.5, 0.28 if portrait else 0.5))


def draw_label(draw, bounds, text, size, fill):
    x, y, max_width = bounds
    text = " ".join(text.split())
    while size > 19 and draw.textbbox((0, 0), text, font=font(size))[2] > max_width:
        size -= 2
    if draw.textbbox((0, 0), text, font=font(size))[2] > max_width:
        raise AssetError("Team display name too long for safe branded header")
    draw.text((x, y), text, font=font(size), fill=fill, stroke_width=2, stroke_fill=(7, 12, 20))


def game_header(spec, away_photo, home_photo, away_logo=None, home_logo=None):
    """16:9 team-identified visual using real photos; no AI redrawing or fake athlete faces."""
    w, h = HEADER_SIZE
    away_color = safe_color(spec.get("away_color"))
    home_color = safe_color(spec.get("home_color"))
    for name in ("away_team", "home_team"):
        if not isinstance(spec.get(name), str) or not (1 <= len(spec[name].strip()) <= 45):
            raise AssetError("Missing verified featured team name")
    img = Image.new("RGB", HEADER_SIZE, (12, 17, 27))
    left = cover_photo(away_photo, (w // 2, h), spec.get("away_photo_kind") != "action")
    right = cover_photo(home_photo, (w // 2, h), spec.get("home_photo_kind") != "action")
    img.paste(left, (0, 0)); img.paste(right, (w // 2, 0))
    shade = Image.new("RGBA", HEADER_SIZE, (0, 0, 0, 0))
    overlay = ImageDraw.Draw(shade)
    # Reuse HQ dark/sport-color visual hierarchy; source photos remain recognizable.
    for y in range(h):
        alpha = 14 + round(208 * (y / h) ** 1.75)
        overlay.line([(0, y), (w, y)], fill=(6, 10, 20, min(230, alpha)), width=1)
    overlay.rectangle((0, 0, w // 2, 28), fill=(*away_color, 235))
    overlay.rectangle((w // 2, 0, w, 28), fill=(*home_color, 235))
    overlay.rectangle((0, h - 10, w // 2, h), fill=(*away_color, 255))
    overlay.rectangle((w // 2, h - 10, w, h), fill=(*home_color, 255))
    overlay.rectangle((w // 2 - 56, 0, w // 2 + 56, h), fill=(7, 12, 22, 183))
    image = Image.alpha_composite(img.convert("RGBA"), shade)
    # Official ESPN team marks are an optional explicit source in the verified manifest.
    for logo, x in ((away_logo, 58), (home_logo, w - 182)):
        if logo is not None:
            mark = ImageOps.contain(logo.convert("RGBA"), (120, 120), Image.Resampling.LANCZOS)
            badge = Image.new("RGBA", (136, 136), (0, 0, 0, 0))
            ImageDraw.Draw(badge).rounded_rectangle((0, 0, 135, 135), radius=28,
                                                      fill=(255, 255, 255, 227))
            badge.alpha_composite(mark, ((136 - mark.width) // 2, (136 - mark.height) // 2))
            image.alpha_composite(badge, (x, h - 355))
    draw = ImageDraw.Draw(image)
    draw_label(draw, (48, h - 192, 690), spec["away_team"].upper(), 61, "white")
    draw_label(draw, (w // 2 + 65, h - 192, 660), spec["home_team"].upper(), 61, "white")
    draw.text((w // 2 - 35, h // 2 - 56), "VS", font=font(48), fill="white",
              stroke_width=3, stroke_fill=(7, 12, 22))
    draw.text((48, 50), "OCTAGON HQ  /  " + spec["sport"].upper() + " GAME OF THE WEEK",
              font=font(29), fill="white", stroke_width=2, stroke_fill=(7, 12, 22))
    return image.convert("RGB")


def render_manifest(spec, loader=download_photo, write=True):
    dest = checked_destination(spec)
    kind = spec["kind"]
    if kind == "football-spotlight":
        if not isinstance(spec.get("player_name"), str) or len(spec["player_name"].strip()) < 3:
            raise AssetError("Verified player name required")
        photo, chosen = choose_photo(spec.get("photos"), loader)
        rendered = spotlight(photo)
        sources = [{"kind": chosen["kind"], "source": chosen["url"]}]
    else:
        away_photo, a = choose_photo(spec.get("away_photos"), loader)
        home_photo, b = choose_photo(spec.get("home_photos"), loader)
        spec = dict(spec, away_photo_kind=a["kind"], home_photo_kind=b["kind"])
        if not spec.get("away_logo_url") or not spec.get("home_logo_url"):
            raise AssetError("Both team logos are required for the approved GOTW treatment")
        away_logo = loader(checked_source(spec["away_logo_url"]))
        home_logo = loader(checked_source(spec["home_logo_url"]))
        rendered = game_header(spec, away_photo, home_photo, away_logo, home_logo)
        sources = [{"team": "away", "kind": a["kind"], "source": a["url"]},
                   {"team": "home", "kind": b["kind"], "source": b["url"]},
                   {"team": "away", "kind": "team-logo", "source": spec["away_logo_url"]},
                   {"team": "home", "kind": "team-logo", "source": spec["home_logo_url"]}]
    if write:
        dest.parent.mkdir(parents=True, exist_ok=True)
        rendered.save(dest, "WEBP", quality=85, method=6)
        check = Image.open(dest)
        required = SPOTLIGHT_SIZE if kind == "football-spotlight" else HEADER_SIZE
        if check.size != required or check.format != "WEBP":
            dest.unlink(missing_ok=True)
            raise AssetError("Output failed Football media size or encoding gate")
    return {"destination": str(dest), "kind": kind, "dimensions": list(rendered.size), "sources": sources}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    args = parser.parse_args()
    with open(args.manifest, encoding="utf-8") as handle:
        spec = json.load(handle)
    print(json.dumps(render_manifest(spec)))


if __name__ == "__main__":
    main()
