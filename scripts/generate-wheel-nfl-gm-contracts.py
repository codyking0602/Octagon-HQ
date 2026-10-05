#!/usr/bin/env python3
import argparse
import json
import math
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path

from nflreadpy import load_contracts

FAMILIES = ("QB", "RB", "WR", "TE", "Front Seven", "Secondary")
POSITION_FAMILY = {
    "QB": "QB",
    "RB": "RB", "FB": "RB",
    "WR": "WR",
    "TE": "TE",
    "DE": "Front Seven", "DT": "Front Seven", "NT": "Front Seven",
    "EDGE": "Front Seven", "ED": "Front Seven", "IDL": "Front Seven", "LB": "Front Seven",
    "OLB": "Front Seven", "ILB": "Front Seven",
    "CB": "Secondary", "S": "Secondary", "FS": "Secondary", "SS": "Secondary", "DB": "Secondary",
}
TEAM_ALIASES = {
    "ARI": {"Cardinals", "ARI"}, "ATL": {"Falcons", "ATL"}, "BAL": {"Ravens", "BAL"},
    "BUF": {"Bills", "BUF"}, "CAR": {"Panthers", "CAR"}, "CHI": {"Bears", "CHI"},
    "CIN": {"Bengals", "CIN"}, "CLE": {"Browns", "CLE"}, "DAL": {"Cowboys", "DAL"},
    "DEN": {"Broncos", "DEN"}, "DET": {"Lions", "DET"}, "GB": {"Packers", "GB"},
    "HOU": {"Texans", "HOU"}, "IND": {"Colts", "IND"}, "JAX": {"Jaguars", "JAX"},
    "KC": {"Chiefs", "KC"}, "LV": {"Raiders", "LV"}, "LAC": {"Chargers", "LAC"},
    "LAR": {"Rams", "LAR"}, "MIA": {"Dolphins", "MIA"}, "MIN": {"Vikings", "MIN"},
    "NE": {"Patriots", "NE"}, "NO": {"Saints", "NO"}, "NYG": {"Giants", "NYG"},
    "NYJ": {"Jets", "NYJ"}, "PHI": {"Eagles", "PHI"}, "PIT": {"Steelers", "PIT"},
    "SF": {"49ers", "SF"}, "SEA": {"Seahawks", "SEA"}, "TB": {"Buccaneers", "TB"},
    "TEN": {"Titans", "TEN"}, "WSH": {"Commanders", "Washington", "WSH"},
}
SNAPSHOT_DATE = date(2026, 10, 5)
WINDOW_END_SEASON = 2028

NAME_ALIASES = {
    "gregrousseau": "gregoryrousseau",
    "cjgardnerjohnson": "chaunceygardnerjohnson",
    "daxhill": "daxtonhill",
    "patsurtain": "patricksurtain",
    "saucegardner": "ahmadgardner",
    "matthewstafford": "mattstafford",
    "kamcurl": "kamrencurl",
    "joshuche": "joshuauche",
    "jujubrents": "juliusbrents",
    "joshuametellus": "joshmetellus",
    "druphillips": "andru phillips".replace(" ", ""),
    "riqwoolen": "tariqwoolen",
    "kennygainwell": "kennethgainwell",
    "chigokonkwo": "chigoziemokonkwo",
}
SOURCE_FAMILY_OVERRIDES = {
    ("jayloncarlies", "Front Seven"): "Secondary",
    ("travishunter", "Secondary"): "WR",
}


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch)).lower()
    value = re.sub(r"[^a-z0-9]", "", value)
    return re.sub(r"(?:iii|ii|iv|jr|sr|v)$", "", value)


def age_on(value):
    if not value:
        return None
    parsed = None
    for fmt in ("%B %d, %Y", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(str(value), fmt).date()
            break
        except ValueError:
            pass
    if parsed is None:
        return None
    return SNAPSHOT_DATE.year - parsed.year - ((SNAPSHOT_DATE.month, SNAPSHOT_DATE.day) < (parsed.month, parsed.day))


def season_end(row):
    history = row.get("season_history")
    years = []
    if isinstance(history, list):
        for item in history:
            if not isinstance(item, dict):
                continue
            for key in ("year", "season", "league_year"):
                raw = item.get(key)
                if raw is not None:
                    try:
                        years.append(int(raw))
                    except (TypeError, ValueError):
                        pass
                    break
    if years:
        return max(years)
    signed = row.get("year_signed")
    term = row.get("years")
    if signed is None or term is None:
        return None
    return int(signed) + int(term) - 1


def team_matches(team_code, contract_team):
    values = TEAM_ALIASES.get(team_code, {team_code})
    chunks = {part.strip() for part in re.split(r"[/,]", str(contract_team or "")) if part.strip()}
    return bool(values & chunks)


def to_money(value):
    if value is None:
        return None
    number = float(value)
    # nflreadpy contract values are expressed in millions.
    return int(round(number * 1_000_000))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority", default="data/generated/football/wheel-football-priorities.json")
    parser.add_argument("--output", default="/tmp/gm-contracts.json")
    parser.add_argument("--report", default="/tmp/gm-contract-report.json")
    args = parser.parse_args()

    priority = json.loads(Path(args.priority).read_text())
    population = []
    seen = set()
    for team, team_data in priority["teams"].items():
        for family in FAMILIES:
            for player in team_data.get(family, []):
                key = (team, family, normalize_name(player))
                if key in seen:
                    continue
                seen.add(key)
                population.append({"team": team, "family": family, "player": player, "key": key[2]})

    frame = load_contracts()
    rows = frame.to_dicts()
    active = []
    for row in rows:
        if row.get("is_active") is not True:
            continue
        family = POSITION_FAMILY.get(str(row.get("position") or "").upper())
        if family is None:
            continue
        active.append({
            **row,
            "_key": normalize_name(str(row.get("player") or "")),
            "_family": family,
            "_end": season_end(row),
        })

    by_name = {}
    for row in active:
        by_name.setdefault(row["_key"], []).append(row)

    output = []
    unmatched = []
    ambiguous = []
    for item in population:
        source_key = NAME_ALIASES.get(item["key"], item["key"])
        expected_source_family = SOURCE_FAMILY_OVERRIDES.get((item["key"], item["family"]), item["family"])
        candidates = [
            row for row in by_name.get(source_key, [])
            if row["_family"] == expected_source_family
        ]
        if len(candidates) > 1:
            team_candidates = [row for row in candidates if team_matches(item["team"], row.get("team"))]
            if len(team_candidates) == 1:
                candidates = team_candidates
            else:
                newest = max(int(row.get("year_signed") or 0) for row in candidates)
                newest_candidates = [row for row in candidates if int(row.get("year_signed") or 0) == newest]
                if len(newest_candidates) == 1:
                    candidates = newest_candidates
        if len(candidates) != 1:
            payload = {
                "team": item["team"], "family": item["family"], "player": item["player"],
                "candidateCount": len(candidates),
                "candidates": [
                    {
                        "player": row.get("player"), "position": row.get("position"), "team": row.get("team"),
                        "yearSigned": row.get("year_signed"), "years": row.get("years"), "apy": row.get("apy"),
                        "endSeason": row.get("_end"), "otcId": row.get("otc_id"),
                    }
                    for row in candidates
                ],
            }
            (unmatched if not candidates else ambiguous).append(payload)
            continue

        row = candidates[0]
        end = row["_end"]
        apy = to_money(row.get("apy"))
        age = age_on(row.get("date_of_birth"))
        if end is None or apy is None or apy <= 0:
            unmatched.append({
                "team": item["team"], "family": item["family"], "player": item["player"],
                "reason": "active contract is missing APY or end season",
            })
            continue
        output.append({
            "team": item["team"],
            "family": item["family"],
            "player": item["player"],
            "normalizedName": item["key"],
            "position": row.get("position"),
            "age": age,
            "dateOfBirth": row.get("date_of_birth"),
            "draftYear": row.get("draft_year"),
            "draftRound": row.get("draft_round"),
            "draftOverall": row.get("draft_overall"),
            "salaryApy": apy,
            "realContractEndSeason": int(end),
            "gameContract": "3YR" if int(end) >= WINDOW_END_SEASON else "1YR",
            "source": {
                "provider": "OverTheCap via nflverse",
                "playerPage": row.get("player_page"),
                "otcId": row.get("otc_id"),
                "yearSigned": row.get("year_signed"),
                "years": row.get("years"),
            },
        })

    output.sort(key=lambda row: (row["team"], row["family"], row["player"]))
    report = {
        "snapshotDate": SNAPSHOT_DATE.isoformat(),
        "populationCount": len(population),
        "matchedCount": len(output),
        "unmatchedCount": len(unmatched),
        "ambiguousCount": len(ambiguous),
        "unmatched": unmatched,
        "ambiguous": ambiguous,
    }
    artifact = {
        "schemaVersion": 1,
        "version": "nfl-gm-contracts-2026-10-05-v1",
        "snapshotDate": SNAPSHOT_DATE.isoformat(),
        "salaryBasis": "Current active contract APY from OverTheCap via nflverse",
        "gameContractRule": "Real contract ending in 2026, 2027, or 2028 => 1YR; real contract controlled beyond 2028 => 3YR.",
        "threeYearWindow": [2026, 2027, 2028],
        "populationSource": args.priority,
        "source": "https://nflreadr.nflverse.com/reference/load_contracts.html",
        "players": output,
    }
    Path(args.output).write_text(json.dumps(artifact, indent=2) + "\n")
    Path(args.report).write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    if unmatched or ambiguous or len(output) != len(population):
        raise SystemExit(2)


if __name__ == "__main__":
    main()
