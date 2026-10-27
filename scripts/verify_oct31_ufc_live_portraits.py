#!/usr/bin/env python3
"""One-off independent exact-byte proof of Oct 31 UFC photo deployment."""
import hashlib,io,json,urllib.request
from pathlib import Path
from PIL import Image
SHA="0c1e47c24125c723d8f7421adac5e620f9b728c7"
MAIN="https://the.hq-app.workers.dev"
LEGACY="https://octagon.hq-app.workers.dev"
fighter_slugs=[
 "renato-moicano","tom-nolan","randy-brown","jacobe-smith",
 "yana-santos","luana-santos","jean-paul-lebosnoyani",
 "farman-hasanov","ode-osbourne","cody-durden",
 "zachary-reese","mickey-gall"
]
paths=[(f"/assets/fighters/{slug}-thumb.webp",(320,320)) for slug in fighter_slugs]
paths.extend((f"/assets/fighters/{slug}-spotlight.webp",(626,800)) for slug in ("renato-moicano","tom-nolan"))
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"OctagonHQ-UFC-live-verify/1","Accept":"image/webp,application/json"})
    with urllib.request.urlopen(req,timeout=25) as response:
        return response.read(),response.headers.get("Content-Type",""),response.geturl()
payload,_,_=get(MAIN+"/deployment.json")
deployment=json.loads(payload.decode())
if deployment.get("sha")!=SHA:raise RuntimeError(f"Deployed SHA mismatch: {deployment}")
print(f"Deployment marker OK: {SHA}",flush=True)
for path,expected_dim in paths:
    local=Path("public"+path)
    assert local.is_file(),path
    expected=local.read_bytes()
    received,ctype,final_url=get(MAIN+path)
    if hashlib.sha256(received).digest()!=hashlib.sha256(expected).digest():
        raise RuntimeError(f"Live asset not exact source bytes: {path}, {len(received)} received vs {len(expected)} expected")
    im=Image.open(io.BytesIO(received))
    if im.size!=expected_dim or im.format!="WEBP":
        raise RuntimeError(f"Wrong live dimensions/format: {path} {im.size} {im.format}")
    print(f"OK live exact-byte asset: {path} {len(received)} bytes {im.size}",flush=True)
for slug in ("renato-moicano","tom-nolan"):
    path=f"/assets/fighters/{slug}-spotlight.webp"
    received,ctype,actual=get(LEGACY+path)
    expected=Path("public"+path).read_bytes()
    if hashlib.sha256(received).digest()!=hashlib.sha256(expected).digest():
        raise RuntimeError("Legacy redirect lost Spotlight: "+path)
    if not actual.startswith(MAIN):
        raise RuntimeError("Legacy Octagon URL did not redirect to canonical: "+actual)
    print("OK legacy URL redirect with exact image:",slug,flush=True)
print("SUCCESS: 12/12 thumbs + 2/2 Spotlights exact bytes and legacy redirects; live SHA",SHA)
