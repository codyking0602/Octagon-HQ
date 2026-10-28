#!/usr/bin/env python3
"""Replace current UFC Picks thumbs ONLY with real ESPN square fighter headshots.

One-off event ingestion using ESPN's own athlete search identities.
Never synthesize a face or use profile promos/posters; unavailable headshots
are intentionally removed so the existing UI can show an empty slot.
"""
import io
import json
import re
import hashlib
import unicodedata
import urllib.request
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageStat
from rembg import remove

FIGHTERS = [
    ("renato-moicano", "Renato Moicano"),
    ("tom-nolan", "Tom Nolan"),
    ("randy-brown", "Randy Brown"),
    ("jacobe-smith", "Jacobe Smith"),
    ("ode-osbourne", "Ode' Osbourne"),
    ("cody-durden", "Cody Durden"),
    ("yana-santos", "Yana Santos"),
    ("luana-santos", "Luana Santos"),
    ("jean-paul-lebosnoyani", "Jean-Paul Lebosnoyani"),
    ("farman-hasanov", "Farman Hasanov"),
]
ROOT=Path("public/assets/fighters")
def norm(value):
    return "".join(c for c in unicodedata.normalize("NFD",value.casefold()) if unicodedata.category(c)!="Mn" and c.isalnum())
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 OctagonHQOfficialHeadshots/1.0"})
    with urllib.request.urlopen(req,timeout=20) as resp:
        body=resp.read(8_000_000)
        return body,resp.headers.get_content_type()
def lookup(name):
    body,_=get("https://site.web.api.espn.com/apis/search/v2?query="+quote(name)+"&limit=20")
    root=json.loads(body)
    candidates=[]
    for result in root.get("results",[]):
        if result.get("type")!="player":continue
        for player in result.get("contents",[]):
            uid=str(player.get("uid",""))
            if player.get("description")!="MMA" or norm(str(player.get("displayName","")))!=norm(name):continue
            match=re.fullmatch(r"s:3301~a:(\d+)",uid)
            if match:candidates.append(match.group(1))
    unique=set(candidates)
    # The UFC Luana Santos is ESPN MMA athlete 5110469. Search also returns
    # another exact-name MMA athlete; do not select the other identity.
    if name=="Luana Santos" and "5110469" in unique:
        return "5110469"
    return next(iter(unique)) if len(unique)==1 else None
def ingest():
    outcome=[]
    for slug,name in FIGHTERS:
        path=ROOT/f"{slug}-thumb.webp"
        athlete_id=None
        try:
            athlete_id=lookup(name)
            if not athlete_id:raise ValueError("no unambiguous ESPN MMA athlete identity")
            source=f"https://a.espncdn.com/i/headshots/mma/players/full/{athlete_id}.png"
            content,mimetype=get(source)
            if mimetype!="image/png" or len(content)<4000:raise ValueError(f"missing PNG headshot (mime={mimetype},bytes={len(content)})")
            original=Image.open(io.BytesIO(content))
            if original.format!="PNG" or original.width<180 or original.height<180:raise ValueError(f"invalid headshot source {original.size}")
            im=original.convert("RGBA")
            # Remove publisher color bars without modifying the source fighter.
            # If it cannot be cleaned correctly, leave the thumb pending.
            im=remove(im).convert("RGBA")
            channels=ImageStat.Stat(im.convert("RGB")).stddev
            if max(channels)<18:raise ValueError("flat-color ESPN placeholder (not a fighter photo)")
            # ESPN's /i/headshots/mma/players/full/ is the publisher's genuine
            # headshot product. No crop, Photoshop, background recreation,
            # fighter renders, Spotlight or other editorial photographs.
            im.thumbnail((308,308),Image.Resampling.LANCZOS)
            canvas=Image.new("RGBA",(320,320),(0,0,0,0))
            canvas.alpha_composite(im,((320-im.width)//2,(320-im.height)//2))
            # ESPN can return an opaque white background: don't fake alpha.
            # Reject it and leave blank pending a transparent official headshot.
            if canvas.getchannel("A").getextrema()==(255,255):raise ValueError("opaque image is not approved transparent headshot")
            path.parent.mkdir(parents=True,exist_ok=True)
            canvas.save(path,format="WEBP",lossless=True,method=6)
            report={"fighter":name,"slug":slug,"status":"ready","espn_id":athlete_id,"source":source,"source_sha256":hashlib.sha256(content).hexdigest(),"original_dimensions":[original.width,original.height]}
            print("APPROVED",json.dumps(report),flush=True)
        except Exception as e:
            if path.exists():path.unlink()
            report={"fighter":name,"slug":slug,"status":"pending","reason":str(e)[:200],"espn_id":athlete_id}
            print("PENDING",json.dumps(report),flush=True)
        outcome.append(report)
    Path("data/curated/ufc").mkdir(parents=True,exist_ok=True)
    Path("data/curated/ufc/2026-10-31-official-headshots.json").write_text(json.dumps(outcome,indent=2)+"\n")
    print("TOTAL",sum(x["status"]=="ready" for x in outcome),"OF",len(outcome),flush=True)
if __name__=="__main__":ingest()

# Official headshot replay only; do not use promotional source imagery.
