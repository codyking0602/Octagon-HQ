#!/usr/bin/env python3
"""One-off candidate discovery; NEVER publish image without per-person verification."""
import concurrent.futures
import json
import html
import re
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
    imageurl=t.get("source")
    meta={}
    if imageurl and "wikimedia.org" in imageurl:
        fname=urllib.parse.unquote(urllib.parse.urlsplit(imageurl).path.rsplit("/",1)[-1])
        if "px-" in fname:
            fname=fname.split("px-",1)[-1]
        api="https://commons.wikimedia.org/w/api.php?"
        q=urllib.parse.urlencode({"action":"query","format":"json","titles":"File:"+fname,
              "prop":"imageinfo","iiprop":"extmetadata"})
        info=fetch(api+q)
        pages=(info.get("query") or {}).get("pages") or {}
        for page in pages.values():
            data=page.get("imageinfo") or []
            if data:
                raw=data[0].get("extmetadata",{})
                for key in ["LicenseShortName","LicenseUrl","Artist","Credit","AttributionRequired"]:
                    value=(raw.get(key) or {}).get("value","")
                    meta[key]=re.sub("<[^>]*>", " ",html.unescape(value)).strip()[:250]
    return dict(name=name,title=title,description=j.get("description"),summary=(j.get("extract") or "")[:145],
                thumbnail=imageurl,original=(j.get("originalimage") or {}).get("source"),metadata=meta,
                error=j.get("error") or j.get("title") if not t else None)
with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
    rows=list(pool.map(task,names))
print("WIKIPEDIA_CANDIDATES_BEGIN")
for row in rows: print(json.dumps(row,ensure_ascii=False))
print("WIKIPEDIA_CANDIDATES_END")
print("RESULTS",len(rows),"with thumbs",sum(bool(x["thumbnail"]) for x in rows))
