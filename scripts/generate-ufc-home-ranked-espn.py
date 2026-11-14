#!/usr/bin/env python3
"""Source HQ-ranked UFC Home-only portraits from ESPN athlete headshots.

Never reads, upscales, replaces, or edits the existing 160px ranking thumbnails.
Run from repository root; produces only *.home.webp and the Home portrait
source/coverage registry. Exact ESPN MMA athlete-name matching is mandatory.
"""
from __future__ import annotations

import json
import re
import time
import unicodedata
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/fighters"
BASELINE = ROOT / "src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json"
MANIFEST = ROOT / "src/features/home/ufcHomeEspnSources.json"
SLUGS_TS = ROOT / "src/features/home/ufcHomePortraitSlugs.ts"
HEADSHOT = "https://a.espncdn.com/i/headshots/mma/players/full/{id}.png"
SEARCH = "https://site.web.api.espn.com/apis/search/v2"
SIZE = 640
ORIGINALS = {"ciryl-gane": "4426000", "kayla-harrison": "4332765", "amanda-nunes": "2516131"}
ADDITIONS = (
    ("Rafael dos Anjos", "rafael-dos-anjos"),
    ("Joshua Van", "joshua-van"),
    ("Ciryl Gane", "ciryl-gane"),
    ("Natalia Silva", "natalia-silva"),
)
# An alternate ESPN professional name may be used only with an explicitly
# audited alias; do not use approximate/fuzzy matching or surname-only hits.
ALIASES = {
    "alex-pantoja": ("Alexandre Pantoja",),
    "shogun-rua": ("Mauricio Rua", "Mauricio 'Shogun' Rua"),
    "chan-sung-jung": ("Chan Sung Jung", "The Korean Zombie"),
    "georges-st-pierre": ("Georges St-Pierre", "Georges St. Pierre"),
    "julianna-pena": ("Julianna Pena",),
    "zhang-weili": ("Weili Zhang",),
    "quinton-jackson": ("Quinton Jackson", "Rampage Jackson"),
    "antonio-rodrigo-nogueira": ("Antonio Rodrigo Nogueira", "Minotauro Nogueira"),
    "cris-cyborg": ("Cris Cyborg", "Cristiane Justino"),
    "rose-namajunas": ("Rose Namajunas",),
    "andrei-arlovski": ("Andrei Arlovski",),
    "bj-penn": ("B.J. Penn", "BJ Penn"),
    "tj-dillashaw": ("T.J. Dillashaw", "TJ Dillashaw"),
    "sean-omalley": ("Sean O'Malley",),
    "dricus-du-plessis": ("Dricus du Plessis",),
    "stipe-miocic": ("Stipe Miocic",),
}
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; OctagonHQ-verified-portrait/1.0)",
    "Referer": "https://www.espn.com/",
    "Accept": "application/json,image/png,image/*;q=0.8",
}


def normalized(name: str) -> str:
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").casefold()
    return re.sub(r"[^a-z0-9]+", " ", name).strip()


def fetch(url: str, max_bytes: int = 3_000_000) -> bytes:
    for retry in range(3):
        try:
            with urlopen(Request(url, headers=HEADERS), timeout=25) as response:
                if response.status != 200:
                    raise ValueError(f"HTTP {response.status}")
                return response.read(max_bytes + 1)
        except (HTTPError, URLError, TimeoutError) as error:
            if retry == 2:
                raise RuntimeError(f"ESPN request failed: {error}") from error
            time.sleep(0.6 * (retry + 1))
    raise RuntimeError("Unreachable")


def roster() -> dict[str, str]:
    with BASELINE.open(encoding="utf-8") as handle:
        data = json.load(handle)
    result = {fighter["presentation"]["slug"]: fighter["fighter"] for fighter in data["fighters"]}
    for name, slug in ADDITIONS:
        if slug in result and result[slug] != name:
            raise ValueError(f"Roster identity collision: {slug}")
        result[slug] = name
    if not 80 <= len(result) <= 100:
        raise ValueError(f"Unexpected canonical HQ ranking roster size: {len(result)}")
    return dict(sorted(result.items()))


def espn_id(slug: str, name: str) -> tuple[str, str]:
    accepted = {normalized(name), *(normalized(alias) for alias in ALIASES.get(slug, ()))}
    terms = [name, *ALIASES.get(slug, ())]
    matches: dict[str, str] = {}
    for term in terms:
        url = SEARCH + "?" + urlencode({"query": term, "limit": 20})
        payload = json.loads(fetch(url, 1_000_000))
        for group in payload.get("results", []):
            if group.get("type") != "player":
                continue
            for athlete in group.get("contents", []):
                if athlete.get("sport") != "mma" or normalized(athlete.get("displayName", "")) not in accepted:
                    continue
                link = (athlete.get("link") or {}).get("web", "")
                photo = (athlete.get("image") or {}).get("default", "")
                id_match = re.search(r"/mma/fighter/_/id/(\d+)(?:/|$)", link)
                if not id_match:
                    continue
                athlete_id = id_match.group(1)
                if photo != HEADSHOT.format(id=athlete_id):
                    continue
                matches[athlete_id] = athlete["displayName"]
        if matches:
            break
    if len(matches) != 1:
        raise ValueError(
            f"{'ambiguous' if matches else 'no exact verified'} ESPN MMA athlete search match"
            f" for {name}: {matches}"
        )
    return next(iter(matches.items()))


def create_home(slug: str, athlete_id: str) -> list[int]:
    url = HEADSHOT.format(id=athlete_id)
    raw = fetch(url)
    if len(raw) > 3_000_000:
        raise ValueError("Official image exceeded safe download size")
    with Image.open(BytesIO(raw)) as loaded:
        if loaded.format != "PNG" or loaded.width < 550 or loaded.height < 400:
            raise ValueError(f"Official photo is not a genuine 600x436-class PNG: {loaded.format} {loaded.size}")
        width, height = loaded.size
        rgba = loaded.convert("RGBA")
    side = min(width, height)
    crop = rgba.crop(((width - side) // 2, 0, (width + side) // 2, side))
    matte = Image.new("RGBA", crop.size, (17, 24, 32, 255))
    matte.alpha_composite(crop)
    result = matte.convert("RGB").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    result = result.filter(ImageFilter.UnsharpMask(radius=0.65, percent=55, threshold=2))
    target = ASSETS / f"{slug}.home.webp"
    result.save(target, "WEBP", quality=87, method=6)
    with Image.open(target) as validated:
        if validated.format != "WEBP" or validated.size != (SIZE, SIZE):
            raise ValueError("Invalid output WebP")
    if not 12_000 < target.stat().st_size < 250_000:
        target.unlink()
        raise ValueError("Official photo is blank, unusually small, or implausibly large")
    return [width, height]


def main() -> None:
    fighters = roster()
    sources: dict[str, dict] = {}
    previous = json.loads(MANIFEST.read_text(encoding="utf-8"))["sources"] if MANIFEST.exists() else {}
    blockers = []
    for slug, name in fighters.items():
        print(f"Checking {slug} ({name})", flush=True)
        if slug in ORIGINALS:
            if not (ASSETS / f"{slug}.home.webp").is_file():
                raise RuntimeError(f"Missing original owner-approved Home portrait: {slug}")
            athlete_id = ORIGINALS[slug]
            dimensions = [600, 436]
            source_name = name
        elif slug in previous and previous[slug].get("name") == name and (ASSETS / f"{slug}.home.webp").is_file():
            sources[slug] = previous[slug]
            print(f"  REUSE previously verified official ESPN source {previous[slug]['espnId']}", flush=True)
            continue
        else:
            try:
                athlete_id, source_name = espn_id(slug, name)
                dimensions = create_home(slug, athlete_id)
            except Exception as error:
                (ASSETS / f"{slug}.home.webp").unlink(missing_ok=True)
                reason = str(error)
                blockers.append({"name": name, "slug": slug, "reason": reason})
                print(f"  BLOCKED: {reason}", flush=True)
                continue
        sources[slug] = {
            "name": name,
            "espnName": source_name,
            "espnId": athlete_id,
            "url": HEADSHOT.format(id=athlete_id),
            "sourceDimensions": dimensions,
        }
        print(f"  OK ESPN {athlete_id} {dimensions}", flush=True)

    if len(sources) < 35:
        raise RuntimeError(f"Only {len(sources)} verified Home portraits; refusing to publish a broken acquisition")

    MANIFEST.write_text(
        json.dumps({"rankedTotal": len(fighters), "sources": dict(sorted(sources.items())), "blocked": blockers},
                   indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    names = sorted(sources)
    SLUGS_TS.write_text(
        "/** Exact HQ-ranked UFC Home portraits backed by independent ESPN source images. */\n"
        "export const UFC_HOME_PORTRAIT_SLUGS = [\n"
        + "".join(f'  "{slug}",\n' for slug in names)
        + "] as const;\n",
        encoding="utf-8",
    )
    print(f"FINAL {len(sources)} of {len(fighters)} ranked Home portraits; blocked={len(blockers)}", flush=True)
    for issue in blockers:
        print(f"BLOCKER {issue['name']} ({issue['slug']}): {issue['reason']}", flush=True)


if __name__ == "__main__":
    main()
