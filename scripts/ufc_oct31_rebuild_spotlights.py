#!/usr/bin/env python3
"""Explicit, one-off publisher panel cleanup on two real UFC portrait WebPs.
Do not touch fighter color or skin; only empty background-side coordinates
and unmistakable saturated plate red. Visual validation still mandatory.
"""
from pathlib import Path
from PIL import Image

root=Path("public/assets/fighters")
for slug in ("renato-moicano","tom-nolan"):
    path=root/(slug+"-spotlight.webp")
    im=Image.open(path).convert("RGBA")
    if im.size!=(626,800):raise RuntimeError("Unexpected Spotlight dimensions")
    px=im.load()
    cleared=0
    for y in range(800):
        for x in range(626):
            r,g,b,a=px[x,y]
            if a<5:continue
            plate_red=(r>=150 and g<=73 and b<=90 and r>=g+95 and r>=b+85)
            if slug=="renato-moicano":
                # Area to right of head until shoulder/gloves begin.
                right_head_plate=(390<=x<545 and 45<=y<=246)
                # Only vivid publisher colors beside the left arm; preserve skin.
                edge_strip=(x<87 and 495<=y<=615 and plate_red)
                must_clear=right_head_plate or plate_red or edge_strip
            else:
                # Thin red plate behind head, above fighter's right glove.
                right_head_plate=(398<=x<=453 and 54<=y<=228)
                # Gray right-side rectangular publisher banner lies beyond arm.
                right_side_plate=(x>=550 and 440<=y<=578)
                must_clear=right_head_plate or right_side_plate or plate_red
            if must_clear:
                px[x,y]=(r,g,b,0)
                cleared+=1
    im.save(path,"WEBP",lossless=True,method=6)
    after=Image.open(path).convert("RGBA")
    if after.size!=(626,800):raise RuntimeError("Resized photo accidentally")
    if max(after.getpixel(p)[3] for p in [(0,0),(625,0),(0,799),(625,799)])!=0:raise RuntimeError("Opaque background corner")
    if cleared<100:raise RuntimeError("No publisher artifacts removed")
    print(f"Edited only external panel pixels: {slug}, {cleared} pixels; visual review mandatory",flush=True)
