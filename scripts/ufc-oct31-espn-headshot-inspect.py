#!/usr/bin/env python3
"""One-off source discovery: only ESPN's own fightcenter athlete identities/headshots."""
import json, urllib.request
from urllib.parse import quote

NAMES = ["Renato Moicano", "Tom Nolan", "Randy Brown", "Jacobe Smith", "Ode' Osbourne", "Cody Durden", "Yana Santos", "Luana Santos", "Jean-Paul Lebosnoyani", "Farman Hasanov"]
def normalized(x):
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", x.lower()) if unicodedata.category(c) != "Mn" and c.isalnum())
def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=25) as r:
        return json.load(r)
url="https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=20261031"
try:
    data=fetch(url)
    print("ESPN SCOREBOARD EVENTS",len(data.get("events", [])),flush=True)
    for event in data.get("events",[]):
        print("EVENT",event.get("id"),event.get("name"),flush=True)
        for comp in event.get("competitions",[]):
            for competitor in comp.get("competitors",[]):
                a=competitor.get("athlete") or {}
                n=a.get("fullName") or a.get("displayName") or ""
                matches=[target for target in NAMES if normalized(target)==normalized(n)]
                if not matches: continue
                print("MATCH",repr(matches[0]),"ESPN_ID",a.get("id"),"EMBEDDED_HEADSHOT",(a.get("headshot") or {}).get("href"),flush=True)
except Exception as exc:
    print("ESPN scoreboard unavailable:",repr(exc),flush=True)
for name in NAMES:
    try:
        q="https://site.web.api.espn.com/apis/search/v2?query="+quote(name)+"&limit=20"
        d=fetch(q)
        print("SEARCH",repr(name),"top-level",list(d)[:8],"matches",json.dumps(d,ensure_ascii=False)[:600],flush=True)
    except Exception as exc: print("SEARCH ERROR",repr(name),str(exc)[:120],flush=True)
