#!/usr/bin/env python3
"""Single-run October 31 UFC main-event Spotlight rebuild from real MMA portraits.

Only the exact real named fighter profiles Renato Moicano and Tom Nolan.
No synthesis, fabricated identity, recoloring, portrait generation, or masks
derived from other people. Results require human visual check before approval.
"""
from collections import deque
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageFilter
from rembg import remove, new_session

SOURCES={"renato-moicano":("Renato Moicano","renato_moicano"),
         "tom-nolan":("Tom Nolan","tom_nolan")}
HEADERS={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"}
TARGET=Path("public/assets/fighters")
SIZE=(626,800)

def original_photo(name,slug):
    page="https://gidstats.com/fighters/"+slug+".html"
    response=requests.get(page,headers=HEADERS,timeout=24)
    response.raise_for_status()
    soup=BeautifulSoup(response.text,"html.parser")
    options=[]
    for tag in soup.find_all("img"):
        url=tag.get("src") or tag.get("data-src") or ""
        if "/img/fighters/" not in url:continue
        src=urljoin(page,url)
        if urlparse(src).hostname not in ("gidstats.com","www.gidstats.com"):continue
        rank=10 if "/img/fighters/0/" in src else 1
        options.append((rank,src))
    if not options:raise RuntimeError("No real athlete portrait on: "+page)
    for _,src in sorted(set(options),reverse=True):
        r=requests.get(src,headers=HEADERS,timeout=24)
        if not r.ok or len(r.content)<10000:continue
        try: im=Image.open(BytesIO(r.content)).convert("RGBA")
        except Exception: continue
        if im.width<400 or im.height<470:continue
        print(f"REAL ATHLETE SOURCE {name}: {src} pixels={im.size} bytes={len(r.content)}",flush=True)
        return im
    raise RuntimeError("Missing quality portrait: "+name)

def foreground_photo(im, session):
    # The white backdrop is from the real photo, not a solid-color UFC ad panel.
    rgb=Image.new("RGB",im.size,(255,255,255))
    rgb.paste(im,mask=im.getchannel("A"))
    cut=remove(rgb,session=session,alpha_matting=True,
       alpha_matting_foreground_threshold=225,
       alpha_matting_background_threshold=20,
       alpha_matting_erode_size=4).convert("RGBA")
    alpha=cut.getchannel("A")
    if alpha.getextrema()[0]>0:raise RuntimeError("No real transparency in new cutout")
    box=alpha.point(lambda v:255 if v>70 else 0).getbbox()
    if not box or box[2]-box[0]<im.width*.40 or box[3]-box[1]<im.height*.55:
        raise RuntimeError("Missing fighter after transparent cutout")
    # Subtle fringe control only, never altering RGB pixels of the fighter.
    return cut

def placement(cut):
    box=cut.getchannel("A").point(lambda v:255 if v>48 else 0).getbbox()
    if not box:raise RuntimeError("Empty cutout")
    sub=cut.crop(box)
    leftpad=22
    topmargin=30
    scale=min((SIZE[0]-leftpad*2)/sub.width,(SIZE[1]-topmargin)/sub.height)
    scaled=sub.resize((round(sub.width*scale),round(sub.height*scale)),Image.Resampling.LANCZOS)
    out=Image.new("RGBA",SIZE,(0,0,0,0))
    out.alpha_composite(scaled,((SIZE[0]-scaled.width)//2,max(topmargin,SIZE[1]-scaled.height)))
    corners=[out.getpixel((x,y))[3] for x,y in ((0,0),(625,0),(0,799),(625,799))]
    if max(corners)>10:raise RuntimeError("Spotlight retains opaque corner")
    if out.getchannel("A").getextrema()[0]>0:raise RuntimeError("Canvas alpha invalid")
    if scaled.height<520 or scaled.width<300:raise RuntimeError("Fighter not large enough")
    return out

def main():
    TARGET.mkdir(parents=True,exist_ok=True)
    session=new_session("isnet-general-use")
    for slug,(name,source) in SOURCES.items():
        original=original_photo(name,source)
        result=placement(foreground_photo(original,session))
        out=TARGET/(slug+"-spotlight.webp")
        result.save(out,"WEBP",lossless=True,method=6)
        if Image.open(out).size!=SIZE or out.stat().st_size<25000:
            raise RuntimeError("Final dimensions/quality gate invalid: "+slug)
        print(f"REBUILT {slug} -> {out}: {out.stat().st_size} bytes, VISUAL APPROVAL STILL REQUIRED",flush=True)

if __name__=="__main__":main()
