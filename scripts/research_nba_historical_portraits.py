#!/usr/bin/env python3
"""One-off candidate discovery; NEVER publish image without per-person verification."""
import concurrent.futures
import json
import urllib.parse
import urllib.request
from urllib.error import HTTPError

names=[
"Alex English","Alvin Robertson","Andrei Kirilenko","Andrew Bynum","Carlos Boozer",
"Dan Issel","David Thompson","Dennis Johnson","Glen Rice","Jack Sikma","Jason Kidd",
"Jermaine O'Neal","Jerry Stackhouse","Larry Johnson","Mark Aguirre","Maurice Cheeks",
"Michael Finley","Michael Redd","Patrick Ewing","Ralph Sampson","Richard Hamilton",
"Shawn Marion","Sidney Moncrief","Terry Cummings"
]
aliases={
"David Thompson":"David Thompson (basketball)",
"Larry Johnson":"Larry Johnson (basketball, born 1969)",
"Richard Hamilton":"Richard Hamilton (basketball)",
}
def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"OctagonHQPhotoVerification/1.0 (https://github.com/codyking0602/Octagon-HQ)","Accept":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=12) as r:
            return json.load(r)
    except Exception as e:
        return {"error":str(e)}
def task(name):
    title=aliases.get(name,name).replace(" ","_")
    base="https://en.wikipedia.org/api/rest_v1/page/summary/"+urllib.parse.quote(title)
    j=fetch(base)
    t=j.get("thumbnail",{})
    return dict(name=name,title=title,description=j.get("description"),summary=(j.get("extract") or "")[:145],
                thumbnail=t.get("source"),original=(j.get("originalimage") or {}).get("source"),error=j.get("error") or j.get("title") if not t else None)
with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
    rows=list(pool.map(task,names))
print("WIKIPEDIA_CANDIDATES_BEGIN")
for row in rows: print(json.dumps(row,ensure_ascii=False))
print("WIKIPEDIA_CANDIDATES_END")
print("RESULTS",len(rows),"with thumbs",sum(bool(x["thumbnail"]) for x in rows))
