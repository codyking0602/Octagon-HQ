#!/usr/bin/env python3
"""Read-only, source-scoped NFL snap participation monitor. Never updates grades.

Snapshots from nflverse/PFR are evidence, not automatically ability ratings.
Low player coverage, source staleness and identity uncertainty are explicit;
nonobserved players are NOT counted as safely skipped detailed evaluations.
"""
import argparse
import json
import re
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

TEAM_ALIAS = {"LA": "LAR", "WAS": "WSH", "JAC": "JAX", "OAK": "LV"}
FAMILIES = ("QB", "RB", "WR", "TE", "Front Seven", "Secondary")


def name_key(name):
    normalized = unicodedata.normalize("NFKD", str(name or ""))
    normalized = "".join(c for c in normalized if not unicodedata.combining(c))
    normalized = re.sub(r"[^a-z0-9]", "", normalized.lower())
    return re.sub(r"(?:iii|ii|iv|jr|sr|v)$", "", normalized)


def percent(value):
    try:
        if value is None:
            return 0.0
        number = float(value)
        if not 0 <= number <= 100:
            raise ValueError()
        return round(number * 100 if 0 < number <= 1 else number, 2)
    except (ValueError, TypeError):
        raise ValueError("Invalid snap percentage in source data")


def source_index(rows, season):
    output = defaultdict(list)
    for row in rows:
        if not isinstance(row, dict) or int(row.get("season") or -1) != season:
            continue
        if str(row.get("game_type") or "").upper() not in ("REG", "POST"):
            continue
        week = row.get("week")
        try:
            week = int(week)
        except (ValueError, TypeError):
            continue
        if not 1 <= week <= 25:
            continue
        team = TEAM_ALIAS.get(str(row.get("team") or "").upper(), str(row.get("team") or "").upper())
        player = str(row.get("player") or "")
        player_id = str(row.get("pfr_player_id") or "")
        if not player_id or not team or not player:
            continue
        offense = percent(row.get("offense_pct"))
        defense = percent(row.get("defense_pct"))
        output[(team, name_key(player))].append({
            "week": week, "pfrId": player_id,
            "usagePct": max(offense, defense),
            "offensePct": offense, "defensePct": defense,
        })
    return output


def review_snap_evidence(rows, season, priorities, observed_at):
    indexed = source_index(rows, season)
    all_weeks = sorted({row["week"] for items in indexed.values() for row in items})
    if len(all_weeks) < 2:
        raise ValueError("Source dataset too short to provide useful weekly evidence")
    last_week = max(all_weeks)
    expected = []
    for team, buckets in priorities["teams"].items():
        for family in FAMILIES:
            for name in buckets.get(family, []):
                expected.append((team, family, name, name_key(name)))
    if len(expected) != len(set((team, family, key) for team, family, name, key in expected)):
        raise ValueError("Canonical NFL priority list has duplicate family identities")
    if len(expected) != 594:
        raise ValueError(f"Unexpected NFL GM-eligible player census: {len(expected)}")
    decisions = []
    for team, family, name, key in expected:
        games = indexed.get((team, key), [])
        ids = {g["pfrId"] for g in games}
        base = {"team":team,"family":family,"name":name}
        if len(ids) > 1:
            decisions.append({**base,"classification":"identity-review",
                              "reason":"multiple-pfr-identities-on-same-team",
                              "observedGames":len(games)})
            continue
        if not games:
            decisions.append({**base,"classification":"unobserved",
                              "reason":"no-strict-team-name-snap-source-match",
                              "observedGames":0})
            continue
        by_week = defaultdict(list)
        for game in games:
            by_week[game["week"]].append(game["usagePct"])
        # Multiple game rows in a week can indicate duplication or reschedule;
        # do not assume a unique reliable per-game participation observation.
        if any(len(values) != 1 for values in by_week.values()):
            decisions.append({**base,"classification":"identity-review",
                              "reason":"duplicate-week-snap-observations",
                              "observedGames":len(games)})
            continue
        recent = [by_week[week][0] for week in range(max(1,last_week-2),last_week+1)
                  if week in by_week]
        prior = [by_week[week][0] for week in range(max(1,last_week-5),max(1,last_week-2))
                 if week in by_week]
        descriptor = {**base,"observedGames":len(games),
                      "sourcePfrId":next(iter(ids)),"recentWeeks":len(recent),
                      "priorWeeks":len(prior),"sourceLastWeek":max(by_week)}
        if len(recent)<2 or len(prior)<2:
            decisions.append({**descriptor,"classification":"insufficient-window",
                              "reason":"requires-two-games-in-each-of-two-three-week-windows"})
            continue
        current = sum(recent)/len(recent)
        old = sum(prior)/len(prior)
        delta = current-old
        if abs(delta)>=25:
            decisions.append({**descriptor,"classification":"priority-factual-review",
                              "reason":"sustained-three-week-snap-share-shift",
                              "priorSnapPct":round(old,1),"recentSnapPct":round(current,1),
                              "changePercentagePoints":round(delta,1)})
        else:
            decisions.append({**descriptor,"classification":"no-usage-shift-detected",
                              "priorSnapPct":round(old,1),"recentSnapPct":round(current,1)})
    counts={kind:sum(r["classification"]==kind for r in decisions)
            for kind in ("no-usage-shift-detected","priority-factual-review",
                         "insufficient-window","unobserved","identity-review")}
    reliable=counts["no-usage-shift-detected"]+counts["priority-factual-review"]
    return {
        "schema":1,"status":"read-only-nfl-snap-evidence",
        "observedAt":observed_at,"season":season,"datasetLastObservedWeek":last_week,
        "source":"nflreadpy 0.1.5 / nflverse PFR snap_counts",
        "sourceDatasetFreshness":"not-certified-by-source-publish-timestamp",
        "playerPopulation":len(expected),"strictWindowCoverage":reliable,
        "unobservedOrInsufficient":len(expected)-reliable,
        "summary":counts,"abilityRegradesApplied":0,"abilityEvaluationsPerformed":0,
        "detailedReviewAvoidanceCertified":False,
        "method":"Two separate 3-week windows; >=2 games each and >=25pp sustained change only queues cheap factual review; never an automatic regrade",
        "priorityReviews":[r for r in decisions if r["classification"]=="priority-factual-review"],
        "unresolved":[r for r in decisions if r["classification"] in
                      ("unobserved","identity-review","insufficient-window")],
    }


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--season",type=int,required=True)
    ap.add_argument("--priority",default="data/generated/football/wheel-football-priorities.json")
    ap.add_argument("--fixture-snap-json",default=None)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    if args.fixture_snap_json:
        rows=json.loads(Path(args.fixture_snap_json).read_text())
    else:
        from nflreadpy import load_snap_counts
        rows=load_snap_counts(seasons=args.season).to_dicts()
    priorities=json.loads(Path(args.priority).read_text())
    report=review_snap_evidence(rows,args.season,priorities,
                                datetime.now(timezone.utc).isoformat())
    Path(args.out).parent.mkdir(parents=True,exist_ok=True)
    Path(args.out).write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps({k:report[k] for k in ("status","playerPopulation",
        "datasetLastObservedWeek","strictWindowCoverage",
        "unobservedOrInsufficient","summary","detailedReviewAvoidanceCertified")}))
    # Missing profiles remain honest source holds; live source can still report.
    if report["unobservedOrInsufficient"] > 0:
        print("::notice::Coverage unresolved: never treat missing snaps as unchanged ability.")


if __name__=="__main__":
    main()
