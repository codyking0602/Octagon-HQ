from PIL import Image,ImageDraw
from pathlib import Path
p=Path("public/assets/fighters")
for n in ("renato-moicano","tom-nolan"):
    im=Image.open(p/(n+"-spotlight.webp")).convert("RGBA")
    w,h=im.size
    b=Image.new("RGBA", (w,h),(249,249,249,255))
    draw=ImageDraw.Draw(b)
    for y in range(0,h,40):
        for x in range(0,w,40):
            if ((x//40)+(y//40))%2:
                draw.rectangle((x,y,x+39,y+39),fill=(226,229,233,255))
    out=Image.alpha_composite(b,im).convert("RGB")
    file=p/("_visual-proof-"+n+".png")
    out.save(file,"PNG",optimize=True)
    print(n,"alpha coverage",sum(a>20 for a in im.getchannel("A").getdata())/(w*h),"written",file)
