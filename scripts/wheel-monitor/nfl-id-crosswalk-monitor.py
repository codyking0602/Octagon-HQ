#!/usr/bin/env python3
"""Read-only GSIS↔PFR player ID map from nflverse load_players.

This source is a cross-platform identifier aid, NOT a roster, contract,
eligibility, provider publication date, or evidence of current ability.
The collector never guesses matches using player names or team affiliations.
"""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def identifier(value):
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in ("none", "nan", "null"):
        return None
    if text.endswith(".0") and text[:-2].isdigit():
        text = text[:-2]
    return text


def compile_crosswalk(players, production, snaps, observed_at):
    if production.get("decisionLedgerComplete") is not True or snaps.get("decisionLedgerComplete") is not True:
        raise ValueError("Incomplete original NFL source decisions")
    prod = production.get("decisions")
    snap = snaps.get("decisions")
    if not isinstance(prod, list) or not isinstance(snap, list) or len(prod) != 594 or len(snap) != 594:
        raise ValueError("Expected complete 594-person input source ledgers")
    gsis_ids = {identifier(row.get("sourcePlayerId")) for row in prod}
    pfr_ids = {identifier(row.get("sourcePfrId")) for row in snap}
    gsis_ids.discard(None)
    pfr_ids.discard(None)
    if not isinstance(players, list) or len(players) < 1000:
        raise ValueError("Truncated nflverse players cross-platform ID master")
    # Explicitly mark any one-to-many ID mapping as ambiguous. Never select
    # the first row or trust a same-name match for collisions.
    by_gsis, by_pfr = {}, {}
    candidate_count = 0
    for row in players:
        gsis = identifier(row.get("gsis_id"))
        pfr = identifier(row.get("pfr_id"))
        if not gsis or not pfr or (gsis not in gsis_ids and pfr not in pfr_ids):
            continue
        candidate_count += 1
        record = {
            "gsisId": gsis, "pfrId": pfr,
            "espnId": identifier(row.get("espn_id")),
        }
        by_gsis.setdefault(gsis, []).append(record)
        by_pfr.setdefault(pfr, []).append(record)
    unambiguous = []
    conflicts = []
    for gsis in sorted(by_gsis):
        records = by_gsis[gsis]
        if len(records) != 1 or len(by_pfr[records[0]["pfrId"]]) != 1:
            conflicts.append(gsis)
            continue
        unambiguous.append(records[0])
    return {
        "schema": 1,
        "status": "read-only-nflverse-player-id-master",
        "observedAt": observed_at,
        "sourceUrl": "https://github.com/nflverse/nflverse-data/releases/tag/players",
        "sourcePublicationAt": None,
        "sourcePublicationFreshnessCertified": False,
        "inputMasterCount": len(players),
        "requestedGsisIds": len(gsis_ids),
        "requestedPfrIds": len(pfr_ids),
        "consideredMasterRows": candidate_count,
        "ambiguousGsisIds": conflicts,
        "mappings": unambiguous,
        "abilityGradesOrContractsChanged": 0,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--production", required=True)
    ap.add_argument("--snap", required=True)
    ap.add_argument("--fixture-players", default=None)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    production = json.loads(Path(args.production).read_text())
    snaps = json.loads(Path(args.snap).read_text())
    if args.fixture_players:
        players = json.loads(Path(args.fixture_players).read_text())
    else:
        from nflreadpy import load_players
        players = load_players().to_dicts()
    result = compile_crosswalk(
        players, production, snaps, datetime.now(timezone.utc).isoformat())
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({
        "status": result["status"],
        "requestedGsisIds": result["requestedGsisIds"],
        "requestedPfrIds": result["requestedPfrIds"],
        "unambiguousMappings": len(result["mappings"]),
        "ambiguousGsisIds": len(result["ambiguousGsisIds"]),
        "sourcePublicationFreshnessCertified": False,
    }))


if __name__ == "__main__":
    main()
