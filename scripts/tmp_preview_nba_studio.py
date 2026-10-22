"""Temporary visual proof for NBA Millionaire's host-free photographic studio."""
from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
import base64
import io
root = Path("public/assets/millionaire")
raw = Image.open(root / "Nfl1.png").convert("RGB")
w,h = raw.size
print(f"NBA_STUDIO_SOURCE_SIZE={w}x{h}", flush=True)
right = raw.crop((w // 2, 0, w, h))
empty = Image.new("RGB", (w,h))
empty.paste(ImageOps.mirror(right), (0,0))
empty.paste(right, (w//2,0))
studio_bytes = io.BytesIO()
empty.save(studio_bytes,format="WEBP",quality=85,method=5)
studio_b64=base64.b64encode(studio_bytes.getvalue()).decode()
print(f"NBA_CLEAN_STUDIO_BYTES={len(studio_bytes.getvalue())}",flush=True)
for start in range(0,len(studio_b64),40000):
    print(f"NBA_CLEAN_STUDIO_CHUNK={start//40000}:{studio_b64[start:start+40000]}",flush=True)
cards=[empty]
for i in range(1,4):
    host=Image.open(root / f"NBA {i}.webp").convert("RGBA")
    print(f"NBA_HOST_ALPHA_{i}={host.getchannel('A').getextrema()} corners={[host.getpixel(c)[3] for c in [(0,0),(host.width-1,0),(0,host.height-1),(host.width-1,host.height-1)]]}",flush=True)
    max_width=680
    host=host.resize((max_width,round(host.height*max_width/host.width)),Image.Resampling.LANCZOS)
    composed=empty.convert("RGBA")
    composed.alpha_composite(host,(175,610-host.height))
    cards.append(composed.convert("RGB"))
out=Image.new("RGB",(960*2,540*2),"#070d18")
pen=ImageDraw.Draw(out)
for i,c in enumerate(cards):
    sized=c.resize((960,540),Image.Resampling.LANCZOS)
    pos=(i%2*960,i//2*540)
    out.paste(sized,pos)
    pen.rectangle((pos[0]+8,pos[1]+8,pos[0]+275,pos[1]+34),fill=(4,10,23))
    pen.text((pos[0]+16,pos[1]+14),["CLEAN STUDIO","NBA HOST 1","NBA HOST 2","NBA HOST 3"][i],fill="#ffffff")
b=io.BytesIO()
out.save(b,format="WEBP",quality=67,method=4)
data=base64.b64encode(b.getvalue()).decode()
print(f"NBA_STUDIO_PREVIEW_BYTES={len(b.getvalue())}",flush=True)
for start in range(0,len(data),40000):
    print(f"NBA_STUDIO_PREVIEW_CHUNK={start//40000}:{data[start:start+40000]}",flush=True)
