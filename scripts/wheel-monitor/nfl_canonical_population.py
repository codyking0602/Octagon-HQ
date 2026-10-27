"""Canonical NFL-only 594 GM player slots shared by production and snap monitors.

Position is part of identity (e.g., Travis Hunter). Team releases are review
exceptions, never a reason to silently shrink the pool or auto-rewrite grades.
"""
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

FAMILIES=("QB","RB","WR","TE","Front Seven","Secondary")

def name_key(name):
    s=unicodedata.normalize("NFKD",str(name or ""))
    s="".join(c for c in s if not unicodedata.combining(c))
    s=re.sub(r"[^a-z0-9]","",s.lower())
    return re.sub(r"(?:iii|ii|iv|jr|sr|v)$","",s)

def canonical_priorities_from_contracts(path):
    players=json.loads(Path(path).read_text()).get("players",[])
    if len(players)!=594:
        raise ValueError("NFL GM contract authority is not 594 players")
    teams=defaultdict(lambda:defaultdict(list))
    identities=set()
    for row in players:
        team,family,name=row.get("team"),row.get("family"),row.get("player")
        if not team or family not in FAMILIES or not name:
            raise ValueError("Invalid NFL GM contract player identity")
        identity=(team,family,name_key(name))
        if identity in identities:
            raise ValueError("Duplicate canonical NFL GM contract player identity")
        identities.add(identity)
        teams[team][family].append(name)
    if len(identities)!=594 or len(teams)!=32:
        raise ValueError("NFL GM contract population is not 594 across 32 teams")
    return {"teams":{team:dict(families) for team,families in teams.items()}}
