#!/usr/bin/env python3
"""Read-only NFL weekly production evidence; never adjusts grades or GM contracts.

Uses the current nflverse per-week player-stat release through pinned nflreadpy.
Missing games or statistical metrics are uncertainty, not an ability decline.
This is complementary to, not a replacement for, PFR snap participation.
"""
import argparse
import json
import re
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

TEAM_ALIAS = {"LA":"LAR","WAS":"WSH","JAC":"JAX","OAK":"LV"}
FAMILIES = ("QB","RB","WR","TE","Front Seven","Secondary")
METRICS = {
    "QB": (("passing_yards",), ("attempts",), 35, 2.0),
    "RB": (("rushing_yards",), ("carries",), 20, 1.4),
    "WR": (("receiving_yards",), ("targets",), 8, 2.0),
    "TE": (("receiving_yards",), ("targets",), 8, 2.0),
    "Front Seven": (("def_qb_hits","def_sacks","def_tackles_for_loss"), None, 0, 1.5),
    "Secondary": (("def_pass_defended","def_interceptions"), None, 0, 0.8),
}

def name_key(name):
    normalized=unicodedata.normalize("NFKD",str(name or ""))
    normalized="".join(c for c in normalized if not unicodedata.combining(c))
    normalized=re.sub(r"[^a-z0-9]","",normalized.lower())
    return re.sub(r"(?:iii|ii|iv|jr|sr|v)$","",normalized)

def source_index(rows, season):
    source=defaultdict(list)
    observed_weeks=set()
    for row in rows:
        if not isinstance(row,dict) or row.get("season")!=season or row.get("season_type")!="REG":
            continue
        week=row.get("week")
        if not isinstance(week,int) or not 1<=week<=18:
            continue
        team=TEAM_ALIAS.get(str(row.get("team") or row.get("recent_team") or "").upper(),
                            str(row.get("team") or row.get("recent_team") or "").upper())
        name=row.get("player_display_name")
        source_id=row.get("player_id")
        if not team or not name or not source_id:
            continue
        observed_weeks.add(week)
        source[(team,name_key(name))].append(row)
    if len(observed_weeks)<2:
        raise ValueError("Weekly player production dataset lacks minimum coverage")
    return source,max(observed_weeks)

def metric_for_window(games, family, enforce_floor=True):
    numerator_fields,denominator_fields,min_attempts,_=METRICS[family]
    fields=(*numerator_fields,*(denominator_fields or ()))
    if any(any(game.get(k) is None for k in fields) for game in games):
        return None,"missing-position-specific-metric"
    try:
        numerator=sum(float(game[k]) for game in games for k in numerator_fields)
        denominator=(sum(float(game[k]) for game in games for k in denominator_fields)
                     if denominator_fields else len(games))
    except (TypeError,ValueError,OverflowError):
        return None,"non-numeric-source-metric"
    if (enforce_floor and denominator<min_attempts) or denominator<=0:
        return None,"insufficient-position-specific-opportunities"
    if denominator_fields and numerator<0:
        return None,"negative-production-source-metric"
    return round(numerator/denominator,3),None

def review_production_evidence(rows,season,priorities,at):
    source,last_week=source_index(rows,season)
    approved=[]
    for team,buckets in priorities["teams"].items():
        for family in FAMILIES:
            for name in buckets.get(family,[]):
                approved.append((team,family,name,name_key(name)))
    if len(approved)!=594 or len(set((team,family,key) for team,family,_,key in approved))!=594:
        raise ValueError("NFL GM-eligible canonical population is not exactly 594 unique identities")
    decisions=[]
    for team,family,name,key in approved:
        baseline={"team":team,"family":family,"name":name}
        games=source.get((team,key),[])
        ids={str(row["player_id"]) for row in games}
        if len(ids)>1:
            decisions.append({**baseline,"classification":"identity-review","reason":"multiple-source-player-ids"})
            continue
        if not games:
            decisions.append({**baseline,"classification":"unobserved","reason":"no-reliable-source-player-match"})
            continue
        by_week=defaultdict(list)
        for row in games:
            by_week[int(row["week"])].append(row)
        if any(len(bucket)!=1 for bucket in by_week.values()):
            decisions.append({**baseline,"classification":"identity-review","reason":"duplicate-player-week"})
            continue
        recent=[by_week[w][0] for w in range(max(1,last_week-2),last_week+1) if w in by_week]
        prior=[by_week[w][0] for w in range(max(1,last_week-5),max(1,last_week-2)) if w in by_week]
        descriptor={**baseline,"sourcePlayerId":next(iter(ids)),
                    "priorWeeks":len(prior),"recentWeeks":len(recent)}
        if len(prior)<2 or len(recent)<2:
            decisions.append({**descriptor,"classification":"insufficient-window",
                              "reason":"requires-two-played-games-in-each-three-week-window"})
            continue
        previous,pwhy=metric_for_window(prior,family)
        current,cwhy=metric_for_window(recent,family)
        if pwhy or cwhy:
            decisions.append({**descriptor,"classification":"insufficient-metric",
                              "reason":pwhy or cwhy})
            continue
        threshold=METRICS[family][3]
        # Two independent windows, minimum opportunity volume, and BOTH a
        # material absolute and relative movement. This is only a review signal.
        delta=current-previous
        concordant=0
        for game in recent:
            single,reason=metric_for_window([game],family,enforce_floor=False)
            if not reason and single is not None and (single-previous)*delta>0 \
               and abs(single-previous)>=threshold*0.6:
                concordant+=1
        # Prevent a lone spectacular/awful game from driving a multiweek flag.
        moved=(abs(delta)>=threshold and abs(delta)>=max(abs(previous),1)*0.35
               and concordant>=2)
        decisions.append({**descriptor,
           "classification":"priority-performance-review" if moved else "no-sustained-metric-shift",
           "reason":"multiweek-position-metric-shift" if moved else "no-material-multiweek-metric-shift",
           "metric":"production-per-opportunity" if family in ("QB","RB","WR","TE")
               else "impact-events-per-played-game",
           "priorMetric":previous,"recentMetric":current,"change":round(delta,3)})
    names=("no-sustained-metric-shift","priority-performance-review",
           "insufficient-window","insufficient-metric","unobserved","identity-review")
    counts={kind:sum(row["classification"]==kind for row in decisions) for kind in names}
    covered=counts["no-sustained-metric-shift"]+counts["priority-performance-review"]
    return {
        "schema":1,"status":"read-only-nfl-weekly-production",
        "observedAt":at,"season":season,"datasetLastObservedWeek":last_week,
        "source":"nflreadpy==0.1.5 load_player_stats(weekly) / nflverse stats_player",
        "sourceUrl":"https://github.com/nflverse/nflverse-data/releases/tag/stats_player",
        "sourcePublishFreshness":"not-yet-independently-certified",
        "approvedPlayerIdentities":len(approved),"approvedCoachesExcluded":32,
        "fullApprovedNflDenominator":626,
        "multiweekMetricCoverage":covered,"sourceUnmatchedOrInsufficient":len(approved)-covered,
        "counts":counts,"abilityGradesChanged":0,"gmContractsChanged":0,
        "detailedReviewAvoidanceCertified":False,
        "classificationIsAbilityAssessment":False,
        "priorityPerformanceReview":[x for x in decisions if x["classification"]=="priority-performance-review"],
        "unresolved":[x for x in decisions if x["classification"] not in
              ("priority-performance-review","no-sustained-metric-shift")],
        "method":"Two 3-week windows, 2 observed games per window, position volume floors and absolute+relative metric movement; factual review only"
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--season",type=int,required=True)
    parser.add_argument("--priority",default="data/generated/football/wheel-football-priorities.json")
    parser.add_argument("--fixture",default=None)
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    if args.fixture:
        rows=json.loads(Path(args.fixture).read_text())
    else:
        from nflreadpy import load_player_stats
        rows=load_player_stats(seasons=args.season,summary_level="week").to_dicts()
    priorities=json.loads(Path(args.priority).read_text())
    report=review_production_evidence(rows,args.season,priorities,datetime.now(timezone.utc).isoformat())
    Path(args.out).parent.mkdir(parents=True,exist_ok=True)
    Path(args.out).write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps({k:report[k] for k in ("status","approvedPlayerIdentities",
      "approvedCoachesExcluded","multiweekMetricCoverage","sourceUnmatchedOrInsufficient",
      "counts","detailedReviewAvoidanceCertified")}))
    if report["sourceUnmatchedOrInsufficient"]:
        print("::notice::Unresolved production source coverage cannot count as unchanged ability.")

if __name__=="__main__":
    main()
