import json
import re
import time
import unicodedata
from pathlib import Path

import mwparserfromhell
import requests

API = "https://en.wikipedia.org/w/api.php"
OUT = Path("public/data/football/cfb/cfb-coach-assignments-2002-2025.source.json")
SESSION = requests.Session()
SESSION.headers["User-Agent"] = "Octagon-HQ/1.0 historical CFB relationship source research contact=bcking06@gmail.com"

with open("data/generated/football/relationships/cfb-team-season-results-2002-2025.json") as handle:
    corpus = json.load(handle)

column_index = {column: index for index, column in enumerate(corpus["columns"])}
targets = {}
for row in corpus["rows"]:
    if str(row[column_index["division"]] or "").lower() != "fbs":
        continue
    season = int(row[column_index["season"]])
    targets.setdefault(season, []).append(
        {
            "season": season,
            "sourceProgramId": str(row[column_index["sourceProgramId"]]),
            "programName": str(row[column_index["programName"]]),
            "conference": str(row[column_index["conference"]] or ""),
        }
    )


def fetch(params):
    for attempt in range(7):
        try:
            response = SESSION.get(
                API,
                params={**params, "format": "json", "formatversion": 2, "maxlag": 5},
                timeout=45,
            )
            if response.status_code == 429 or response.status_code >= 500:
                time.sleep(min(10, 0.5 * (2**attempt)))
                continue
            response.raise_for_status()
            data = response.json()
            if data is None:
                raise RuntimeError("null MediaWiki response")
            return data
        except Exception:
            if attempt == 6:
                raise
            time.sleep(min(10, 0.5 * (2**attempt)))


def normalize(value):
    text = (
        unicodedata.normalize("NFKD", str(value))
        .encode("ascii", "ignore")
        .decode()
        .lower()
        .replace("&", " and ")
    )
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


ALIASES = {
    "app state": ["appalachian state", "app state"],
    "appalachian state": ["appalachian state", "app state"],
    "byu": ["byu", "brigham young"],
    "brigham young": ["byu", "brigham young"],
    "ucf": ["ucf", "central florida"],
    "central florida": ["ucf", "central florida"],
    "uconn": ["uconn", "connecticut"],
    "connecticut": ["uconn", "connecticut"],
    "fiu": ["fiu", "florida international"],
    "florida international": ["fiu", "florida international"],
    "umass": ["umass", "massachusetts"],
    "massachusetts": ["umass", "massachusetts"],
    "utep": ["utep", "texas el paso"],
    "texas el paso": ["utep", "texas el paso"],
    "utsa": ["utsa", "texas san antonio"],
    "texas san antonio": ["utsa", "texas san antonio"],
    "ul monroe": ["louisiana monroe", "ul monroe"],
    "louisiana monroe": ["louisiana monroe", "ul monroe"],
    "louisiana": ["louisiana", "louisiana lafayette"],
    "louisiana lafayette": ["louisiana", "louisiana lafayette"],
    "middle tennessee": ["middle tennessee", "middle tennessee state"],
    "middle tennessee state": ["middle tennessee", "middle tennessee state"],
    "southern miss": ["southern miss", "southern mississippi"],
    "southern mississippi": ["southern miss", "southern mississippi"],
    "nc state": ["nc state", "north carolina state"],
    "north carolina state": ["nc state", "north carolina state"],
    "hawai i": ["hawaii"],
    "hawaii": ["hawaii"],
}


def roots(target):
    name = normalize(target["programName"])
    if name in ("miami oh", "miami ohio"):
        return ["miami redhawks"]
    if name == "miami":
        return ["miami hurricanes"]
    return ALIASES.get(name, [name])


def conference_key(value):
    text = normalize(value).replace(" conference", "").strip()
    mapping = [
        ("southeastern", "sec"),
        ("atlantic coast", "acc"),
        ("big ten", "big ten"),
        ("big 12", "big 12"),
        ("pac 12", "pac 12"),
        ("pac 10", "pac 10"),
        ("pacific 12", "pac 12"),
        ("pacific 10", "pac 10"),
        ("mountain west", "mountain west"),
        ("western athletic", "western athletic"),
        ("mid american", "mid american"),
        ("sun belt", "sun belt"),
        ("conference usa", "conference usa"),
        ("american athletic", "american athletic"),
        ("big east", "big east"),
        ("independent", "independent"),
    ]
    for needle, key in mapping:
        if needle in text:
            return key
    return text


def fetch_pages(titles):
    pages = []
    for index in range(0, len(titles), 40):
        response = fetch(
            {
                "action": "query",
                "titles": "|".join(titles[index : index + 40]),
                "prop": "revisions",
                "rvprop": "ids|content",
                "rvslots": "main",
                "redirects": 1,
            }
        )
        pages.extend(response.get("query", {}).get("pages", []) or [])
    return [page for page in pages if not page.get("missing")]


def parse_page(page):
    revisions = page.get("revisions") or []
    if not revisions:
        return None
    wikitext = (((revisions[0].get("slots") or {}).get("main") or {}).get("content")) or ""
    code = mwparserfromhell.parse(wikitext)
    infobox = None
    for template in code.filter_templates(recursive=False):
        if any(str(param.name).strip().lower() == "head_coach" for param in template.params):
            infobox = template
            break
    if infobox is None:
        return None

    conference = ""
    if infobox.has("conference"):
        conference = re.sub(
            r"\s+",
            " ",
            mwparserfromhell.parse(str(infobox.get("conference").value)).strip_code(
                normalize=True, collapse=True
            ),
        ).strip()

    coaches = []
    for param in infobox.params:
        key = str(param.name).strip().lower()
        match = re.fullmatch(r"head_coach(\d*)", key)
        if not match:
            continue
        raw = mwparserfromhell.parse(str(param.value))
        display_name = re.sub(r"\s+", " ", raw.strip_code(normalize=True, collapse=True)).strip()
        links = [str(link.title).strip() for link in raw.filter_wikilinks(recursive=True)]
        if not display_name:
            continue
        suffix = match.group(1)
        games_note = None
        games_key = "hc_games" + suffix
        if infobox.has(games_key):
            games_note = re.sub(
                r"\s+",
                " ",
                mwparserfromhell.parse(str(infobox.get(games_key).value)).strip_code(
                    normalize=True, collapse=True
                ),
            ).strip() or None
        coaches.append(
            {
                "slot": 1 if suffix == "" else int(suffix),
                "displayName": display_name,
                "coachPageTitle": links[0] if links else None,
                "gamesNote": games_note,
            }
        )

    return {
        "pageId": int(page["pageid"]),
        "revisionId": int(revisions[0]["revid"]),
        "pageTitle": page["title"],
        "conference": conference,
        "coaches": sorted(coaches, key=lambda coach: coach["slot"]),
        "titleNorm": normalize(re.sub(r"^\d{4}\s+", "", page["title"])),
    }


def broad_pages(season):
    search = fetch(
        {
            "action": "query",
            "list": "search",
            "srsearch": f'intitle:"{season}" intitle:"football team"',
            "srnamespace": 0,
            "srlimit": 500,
        }
    )
    titles = [
        hit["title"]
        for hit in search.get("query", {}).get("search", [])
        if str(season) in hit["title"] and hit["title"].lower().endswith("football team")
    ]
    return [parsed for parsed in (parse_page(page) for page in fetch_pages(titles)) if parsed is not None]


def targeted_pages(target):
    seen = {}
    for root in roots(target):
        queries = [
            f'"{target["season"]}" "{root}" "football team"',
            f'intitle:"{target["season"]}" "{root}" football',
        ]
        for query in queries:
            search = fetch(
                {
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "srnamespace": 0,
                    "srlimit": 10,
                }
            )
            titles = [
                hit["title"]
                for hit in search.get("query", {}).get("search", [])
                if str(target["season"]) in hit["title"]
                and hit["title"].lower().endswith("football team")
            ]
            for page in fetch_pages(titles):
                parsed = parse_page(page)
                if parsed is not None:
                    seen[parsed["pageId"]] = parsed
    return list(seen.values())


def choose(target, candidates):
    scored = []
    for page in candidates:
        scores = [len(root) for root in roots(target) if page["titleNorm"].startswith(root + " ")]
        if scores:
            scored.append((max(scores), page))
    if not scored:
        return None
    best_score = max(score for score, _ in scored)
    winners = [page for score, page in scored if score == best_score]
    if len(winners) > 1:
        same_conference = [
            page
            for page in winners
            if conference_key(page["conference"]) == conference_key(target["conference"])
        ]
        if len(same_conference) == 1:
            winners = same_conference
    return winners[0] if len(winners) == 1 else None


assignments = []
unresolved = []
known_no_page = {(2020, "new mexico state"), (2020, "old dominion")}
for season in range(2002, 2026):
    pages = broad_pages(season)
    matched = 0
    for target in targets.get(season, []):
        page = choose(target, pages)
        if page is None:
            page = choose(target, targeted_pages(target))
        if page is None:
            if (season, normalize(target["programName"])) in known_no_page:
                continue
            unresolved.append(target)
            continue
        if not page["coaches"]:
            unresolved.append({**target, "reason": "no-coach", "sourceSeasonPageTitle": page["pageTitle"]})
            continue
        for coach in page["coaches"]:
            if not coach["coachPageTitle"]:
                unresolved.append(
                    {
                        **target,
                        "reason": "unlinked-coach",
                        "sourceSeasonPageTitle": page["pageTitle"],
                        "coachDisplayName": coach["displayName"],
                    }
                )
                continue
            assignments.append(
                {
                    **target,
                    "sourceSeasonPageId": page["pageId"],
                    "sourceSeasonPageRevisionId": page["revisionId"],
                    "sourceSeasonPageTitle": page["pageTitle"],
                    "sourceCoachSlot": coach["slot"],
                    "sourceCoachPageTitle": coach["coachPageTitle"],
                    "gamesNote": coach["gamesNote"],
                }
            )
        matched += 1
    print("YEAR", season, "targets", len(targets.get(season, [])), "matched", matched, flush=True)

if unresolved:
    print("UNRESOLVED", json.dumps(unresolved, ensure_ascii=False), flush=True)
    raise SystemExit(f"{len(unresolved)} unresolved coach source rows")

coach_titles = sorted({assignment["sourceCoachPageTitle"] for assignment in assignments})
coach_pages = {}
for index in range(0, len(coach_titles), 40):
    batch_titles = coach_titles[index : index + 40]
    data = fetch({"action": "query", "titles": "|".join(batch_titles), "redirects": 1})
    pages = data.get("query", {}).get("pages", []) or []
    canonical_by_title = {
        page["title"]: {"pageId": int(page["pageid"]), "title": page["title"]}
        for page in pages
        if not page.get("missing")
    }
    coach_pages.update(canonical_by_title)
    for redirect in data.get("query", {}).get("redirects", []) or []:
        resolved = canonical_by_title.get(redirect.get("to"))
        if resolved:
            coach_pages[redirect["from"]] = resolved

rows = []
unresolved_coaches = []
for assignment in assignments:
    resolved = coach_pages.get(assignment["sourceCoachPageTitle"])
    if not resolved:
        unresolved_coaches.append(assignment)
        continue
    rows.append(
        [
            assignment["season"],
            assignment["sourceProgramId"],
            assignment["programName"],
            assignment["sourceSeasonPageId"],
            assignment["sourceSeasonPageRevisionId"],
            assignment["sourceSeasonPageTitle"],
            str(resolved["pageId"]),
            resolved["title"],
            assignment["sourceCoachSlot"],
            assignment["gamesNote"],
        ]
    )

if unresolved_coaches:
    print("UNRESOLVED_COACHES", json.dumps(unresolved_coaches[:20], ensure_ascii=False), flush=True)
    raise SystemExit(f"{len(unresolved_coaches)} unresolved coach page identities")

rows.sort(key=lambda row: (row[0], row[1], row[8], row[6]))
keys = [(row[0], row[1], row[6]) for row in rows]
if len(keys) != len(set(keys)):
    raise SystemExit("duplicate season/program/coach identity rows")

payload = {
    "schemaVersion": 1,
    "provider": "Wikipedia",
    "generatedAt": "2026-08-26",
    "seasonStart": 2002,
    "seasonEnd": 2025,
    "identityScope": "wikipedia-coach-page-id",
    "sourceMethod": "Head-coach identities are derived from linked coach pages in each canonical FBS team season Wikipedia infobox. Season-page and revision IDs pin the audited source state; no game splits are inferred.",
    "columns": [
        "season",
        "sourceProgramId",
        "programName",
        "sourceSeasonPageId",
        "sourceSeasonPageRevisionId",
        "sourceSeasonPageTitle",
        "sourceCoachPageId",
        "coachName",
        "sourceCoachSlot",
        "gamesNote",
    ],
    "excludedTeamSeasons": [
        {
            "season": 2020,
            "programName": "New Mexico State",
            "reason": "No standard 2020 season article under the audited source title pattern; no coach assignment inferred.",
        },
        {
            "season": 2020,
            "programName": "Old Dominion",
            "reason": "Program canceled the 2020 season; no coach assignment inferred from adjacent seasons.",
        },
    ],
    "rowCount": len(rows),
    "rows": rows,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n")
print("WROTE", OUT, "rows", len(rows), "unique coaches", len({row[6] for row in rows}), flush=True)
