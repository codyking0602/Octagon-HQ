#!/usr/bin/env python3
"""One-time UFC Oct 31 real fighter portrait thumbnail replacement.

No image synthesis. Source is the real fighter-specific portrait on a verified
named MMA athlete page. Remove only connected plain-white/transparent backdrop
from the original photograph and reframe to 320x320. DO NOT autoapprove.
"""
from __future__ import annotations
from collections import deque
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageFilter

NAMES = {
    "cody-durden": ("Cody Durden", "cody_durden"),
    "farman-hasanov": ("Farman Hasanov", "farman_hasanov"),
    "jacobe-smith": ("Jacobe Smith", "jacobe_smith"),
    "luana-santos": ("Luana Santos", "luana_santos"),
    "mickey-gall": ("Mickey Gall", "mickey_gall"),
    "ode-osbourne": ("Ode Osbourne", "ode_osbourne"),
    "tom-nolan": ("Tom Nolan", "tom_nolan"),
    "yana-santos": ("Yana Santos", "yana_kunitskaya"),
    "zachary-reese": ("Zachary Reese", "zachary_reese"),
}
DEST = Path("public/assets/fighters")
HEADERS = {"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36","Accept":"text/html,image/avif,image/webp,image/*,*/*"}


def real_source(name, profile_slug):
    page_url = "https://gidstats.com/fighters/" + profile_slug + ".html"
    response = requests.get(page_url, headers=HEADERS, timeout=25)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    matches = []
    for img in soup.find_all("img"):
        for attr in ("src","data-src","data-original","data-lazy-src"):
            src = img.get(attr, "")
            if "/img/fighters/" not in src:
                continue
            url = urljoin(page_url, src)
            if urlparse(url).hostname not in ("gidstats.com","www.gidstats.com"):
                continue
            label = " ".join(str(img.get(x,"")) for x in ("alt","title")).lower()
            score = 5 + (20 if name.lower() in label else 0) + (6 if "/img/fighters/0/" in url else 0)
            matches.append((score,url))
    if not matches:
        # Only portrait CDN files on the named real-fighter page are eligible.
        for url in re.findall(r'["\']([^"\']*/img/fighters/[^"\']+?\.(?:png|webp|jpg))',response.text,re.I):
            matches.append((1,urljoin(page_url,url)))
    if not matches:
        raise ValueError(f"No athlete-specific original portrait found: {page_url}")
    for _,url in sorted(set(matches),reverse=True):
        r=requests.get(url,headers=HEADERS,timeout=25)
        if r.status_code!=200 or len(r.content)<4500 or len(r.content)>10_000_000:
            continue
        try: im=Image.open(BytesIO(r.content)).convert("RGBA")
        except Exception: continue
        if im.width<300 or im.height<300 or max(im.width,im.height)/min(im.width,im.height)>2.4:
            continue
        print(f"SOURCE {name}: {url} {im.size} ({len(r.content)} bytes)",flush=True)
        return im,url
    raise ValueError(f"No usable real-person athlete photo at {page_url}")


def remove_connected_white(im):
    im = im.copy()
    w,h=im.size
    if im.getchannel("A").getextrema()[0] < 190:
        return im # the original photograph already has transparent edges
    px=im.load()
    # Plain background on these specific portraits is white, not a UFC
    # graphic plate. Only erase whites connected to the outer photo border.
    def white(x,y):
        r,g,b,a=px[x,y]
        return min(r,g,b)>=223 and max(r,g,b)-min(r,g,b)<=21
    visited=bytearray(w*h)
    q=deque()
    for x in range(w):
        for y in (0,h-1):
            if white(x,y):q.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            if white(x,y):q.append((x,y))
    found=0
    while q:
        x,y=q.popleft()
        if x<0 or x>=w or y<0 or y>=h: continue
        p=y*w+x
        if visited[p] or not white(x,y):continue
        visited[p]=1
        found+=1
        q.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
    if found<w*h*0.06:
        raise ValueError(f"Source has no safely removable plain white backdrop ({found/(w*h):.1%})")
    alpha=Image.new("L",(w,h),255)
    a=alpha.load()
    for y in range(h):
        for x in range(w):
            if visited[y*w+x]:a[x,y]=0
    # Soft edge removes hard white halos; never recolors or paints real skin.
    alpha=alpha.filter(ImageFilter.GaussianBlur(0.45))
    im.putalpha(alpha)
    return im


def render(im):
    alpha=im.getchannel("A")
    box=alpha.point(lambda p:255 if p>=50 else 0).getbbox()
    if not box: raise ValueError("No visible real fighter after mask")
    subject=im.crop(box)
    # Bust composition: keep complete hair, shoulders and upper torso.
    if subject.height > subject.width*1.30:
        subject=subject.crop((0,0,subject.width,round(subject.width*1.30)))
    top_pad=12
    side_pad=11
    scale=min((320-2*side_pad)/subject.width,(320-top_pad-6)/subject.height)
    sz=(max(1,round(subject.width*scale)),max(1,round(subject.height*scale)))
    cropped=subject.resize(sz,Image.Resampling.LANCZOS)
    canvas=Image.new("RGBA",(320,320),(0,0,0,0))
    canvas.alpha_composite(cropped,((320-sz[0])//2,top_pad))
    pix=canvas.load()
    for pos in ((0,0),(319,0),(0,319),(319,319),(6,6)):
        if pix[pos][3]>=80:raise ValueError(f"Opaque corner/background at {pos}")
    if sz[0]<125 or sz[1]<175:raise ValueError("Subject too small")
    return canvas


def main():
    DEST.mkdir(exist_ok=True,parents=True)
    saved=[]
    for slug,(name,page) in NAMES.items():
        src,_=real_source(name,page)
        im=render(remove_connected_white(src))
        path=DEST/(slug+"-thumb.webp")
        im.save(path,"WEBP",quality=94,method=6)
        chk=Image.open(path).convert("RGBA")
        if chk.size!=(320,320) or len(path.read_bytes())<7000:
            raise ValueError(f"Output failed quality gate: {slug}")
        print(f"SAVED {slug} {path.stat().st_size} bytes",flush=True)
        saved.append(slug)
    if len(saved)!=9:raise ValueError("All nine must be rebuilt")

if __name__=="__main__":
    main()
