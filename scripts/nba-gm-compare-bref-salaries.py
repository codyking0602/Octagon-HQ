#!/usr/bin/env python3
"""Compare every Octagon NBA GM candidate against live Basketball-Reference annual salary rows.

This is an audit, not a certifier. Duplicate names and partial/missing provider
records require manual resolution; never pretend blank source years are $0.
"""
import csv
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

SOURCE = Path("/tmp/nba-gm-live-contract-source.json")
CANDIDATE = Path("docs/nba-gm-330-reconciled-salary-averages-2026-11-01.csv")
SEASONS = ("2026-27", "2027-28", "2028-29")
CANDIDATE_COLS = ("real_salary_2026_27_usd", "real_salary_2027_28_usd", "real_salary_2028_29_usd")

def normalize(name):
    raw = unicodedata.normalize("NFKD", name or "")
    return re.sub(r"[^a-z0-9]", "", "".join(x for x in raw if not unicodedata.combining(x)).lower())

def main():
    payload = json.loads(SOURCE.read_text())
    with CANDIDATE.open(newline="", encoding="utf-8") as f:
        candidates = list(csv.DictReader(f))
    if len(candidates) != 330:
        raise ValueError("Expected 330 candidates")
    by_name = defaultdict(list)
    for record in payload["players"]:
        by_name[normalize(record["name"])].append(record)
    result = {"sourceCount": len(payload["players"]), "candidateCount": len(candidates), "matched": 0, "missingSource": [], "mismatch": [], "multipleSourceMatches": [], "matchedExact": 0}
    alias = {"Alexandre Sarr": "Alex Sarr", "Herb Jones": "Herbert Jones",
             "Ronald Holland II": "Ron Holland", "Bobby Portis Jr.": "Bobby Portis",
             "GG Jackson": "GG Jackson II", "Robert Williams III": "Robert Williams"}
    result["potentialTermChanges"] = []
    for person in candidates:
        choices = by_name[normalize(alias.get(person["player_name"], person["player_name"]))]
        if not choices:
            result["missingSource"].append({"name": person["player_name"], "id": person["stable_game_id"]})
            continue
        if len(choices) > 1:
            # One player may be repeated for waived/old-team cap bookkeeping.
            # Identical schedule rows can be coalesced, but different money
            # must be inspected instead of guessed.
            unique = list({tuple(p["salaries"].get(y) for y in SEASONS): p for p in choices}.values())
            choices = unique
        if len(choices) > 1:
            # Exact contract-price match narrows duplicate team/waiver obligations;
            # if still ambiguous, all source records must be reviewed manually.
            first_year = int(person["real_salary_2026_27_usd"])
            preferred = [p for p in choices if p["salaries"]["2026-27"] == first_year]
            if len(preferred) == 1:
                choices = preferred
            else:
                result["multipleSourceMatches"].append({"name": person["player_name"], "sourceRows": choices})
                continue
        source = choices[0]
        # A real 2028-29 playing salary is evidence that a previously
        # classified 1YR game contract may now be a 3YR after an extension.
        if source["salaries"].get("2028-29") is not None and person["game_contract"] == "1YR":
            result["potentialTermChanges"].append({"name":person["player_name"],"id":person["stable_game_id"],"gameTerm":person["game_contract"],"source":source})
        result["matched"] += 1
        conflicts = []
        for i, season in enumerate(SEASONS):
            if i >= int(person["game_window_seasons"]):
                continue
            proposed = int(person[CANDIDATE_COLS[i]])
            actual = source["salaries"].get(season)
            if proposed != actual:
                conflicts.append({"season": season, "candidate": proposed, "current": actual})
        if conflicts:
            result["mismatch"].append({"name": person["player_name"], "id": person["stable_game_id"], "conflicts": conflicts, "source": source})
        else:
            result["matchedExact"] += 1
    print("NBA_GM_BREF_AUDIT_START")
    print(json.dumps(result, ensure_ascii=False))
    print("NBA_GM_BREF_AUDIT_END")
    Path("/tmp/nba-gm-bref-comparison.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    if result["sourceCount"] < 300 or result["missingSource"] or result["multipleSourceMatches"] or result["mismatch"]:
        raise SystemExit(2)

if __name__ == "__main__":
    main()
