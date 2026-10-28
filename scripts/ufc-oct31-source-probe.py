#!/usr/bin/env python3
"""QA only: download UFC's exact branded event-results *headshot* product."""
import json, os, urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image
sources={
  "cody-durden":"https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-07/DURDEN_CODY_07-11.png?itok=F8sg0X6W",
  "yana-santos":"https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-10/SANTOS_YANA_10-04.png?itok=KtQbaZeq",
  "jean-paul-lebosnoyani":"https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-02/LEBOSNOYANI_JEAN-PAUL_02-21.png?itok=SXcx7GgN",
  "farman-hasanov":"https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-06/HASANOV_FARMAN_06-27.png?itok=QHlSQYHc",
}
root=Path("docs/qa/ufc-oct31-official-thumb-sources")
root.mkdir(parents=True,exist_ok=True)
for slug,url in sources.items():
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=20) as resp:body=resp.read(2000000);content_type=resp.headers.get_content_type()
 im=Image.open(BytesIO(body))
 print("SOURCE",slug,"mimetype",content_type,"format",im.format,"size",im.size,"mode",im.mode,"byte_len",len(body),flush=True)
 assert content_type=="image/png" and im.format=="PNG" and im.size==(256,160)
 (root/(slug+".png")).write_bytes(body)
(root/"sources.json").write_text(json.dumps(sources,indent=2)+"\n")
