#!/usr/bin/env python3
import html, json, re, urllib.request, urllib.parse
from html.parser import HTMLParser
from collections import Counter
pages = {
"cody-durden": "https://www.ufc.com/athlete/cody-durden",
"yana-santos": "https://www.ufc.com/athlete/yana-santos",
"jean-paul-lebosnoyani": "https://www.ufc.com/athlete/jean-paul-lebosnoyani",
"farman-hasanov": "https://www.ufc.com/athlete/farman-hasanov",
}
class Images(HTMLParser):
  def __init__(self): super().__init__(); self.tags=[]; self.pic=[]
  def handle_starttag(self,tag,attrs):
    if tag.lower() in ("img","source","meta","div"):
      a=dict(attrs)
      if tag=="div" and not any(w in str(a).lower() for w in ("fighter","athlete","thumb","portrait","headshot")):return
      if tag=="meta" and (a.get("property") not in ("og:image","twitter:image")):return
      self.tags.append((tag,a))
def url_from(attr):
  out=[]
  for key in ("src","data-src","srcset","data-srcset","data-original","content","data-src-large","data-lazy-src"):
    if attr.get(key):
      for val in attr[key].split(","):
        u=val.strip().split(" ")[0]
        if (u.startswith("http") or u.startswith("/")) and u not in out:out.append(u)
  return out
for slug,page in pages.items():
  print("\n==========",slug,"==========",flush=True)
  req=urllib.request.Request(page,headers={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36","Accept-Language":"en-US,en;q=0.9"})
  try:
    with urllib.request.urlopen(req,timeout=20) as r: raw=r.read(6500000)
    print("HTML bytes",len(raw),flush=True)
  except Exception as e: print("ERROR HTML",repr(e),flush=True); continue
  h=raw.decode("utf-8","replace")
  parser=Images();parser.feed(h)
  selected=[]
  for tag,a in parser.tags:
    alt=a.get("alt","");cls=a.get("class","")
    urls=url_from(a)
    if not urls:continue
    if (slug.split("-")[-1].lower() in (alt+" "+" ".join(urls)).lower() or
        any(w in (cls+" "+str(a)).lower() for w in ("headshot","thumbnail","fighter__","athlete__","athlete-card","fight-card","athlete_bio"))):
      selected.append({"tag":tag,"alt":alt[:105],"class":cls[:120],"width":a.get("width"),"height":a.get("height"),"urls":urls[:3]})
  print("total tags",len(parser.tags),"selected",len(selected),flush=True)
  for tag in selected[:80]:print(json.dumps(tag),flush=True)
  print("HTML URL references for slug",flush=True)
  regex = re.compile(r'https?:[^"\\\s<>]{0,240}(?:'+re.escape(slug.split("-")[-1])+r'|(?:athlete_thumb|headshot|athlete_bio|fighter_thumb))[^"\\\s<>]{0,150}',re.I)
  matches=list(dict.fromkeys(html.unescape(s.replace(r"\/","/")) for s in regex.findall(h)))
  for match in matches[:55]:print("REF",match[:420],flush=True)
  print("STYLE TOKENS",Counter(re.findall(r'styles/([a-z0-9_-]+)/',h.lower())).most_common(35),flush=True)
