#!/usr/bin/env python3
"""Read public current NBA contracts for NBA GM research, never alter game saves.

Output is a machine-readable external-source snapshot only. Salary values are
not a release certification without a secondary source and identity review.
"""
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

URL = "https://www.basketball-reference.com/contracts/players.html"
SEASONS = ("2026-27", "2027-28", "2028-29")

def dollars(raw):
    raw = (raw or "").replace(",", "").replace("$", "").strip()
    return int(raw) if raw.isdigit() else None

def main():
    req = Request(URL, headers={"User-Agent": "Mozilla/5.0 (compatible; OctagonHQContractAudit/1.0)", "Accept": "text/html"})
    with urlopen(req, timeout=30) as res:
        html = res.read().decode("utf-8", "replace")
    soup = BeautifulSoup(html, "html.parser")
    table = soup.select_one("table#contracts")
    if table is None:
        tables = soup.select("table")
        table = next((t for t in tables if "2028-29" in t.get_text(" ", strip=True) and "2027-28" in t.get_text(" ", strip=True)), None)
    if table is None:
        raise RuntimeError("No three-season NBA contract table in current source HTML")
    records = []
    for tr in table.select("tbody tr"):
        playerCell = tr.select_one('th[data-stat="player"], td[data-stat="player"]')
        if playerCell is None:
            continue
        player = playerCell.get_text(" ", strip=True)
        if not player or player.lower() == "player":
            continue
        salaries = {}
        for season in SEASONS:
            cell = tr.select_one('[data-stat="salary_%s"]' % season.replace("-", "_"))
            if cell is None:
                cell = next((td for td in tr.select("td") if td.get("data-stat", "").endswith(season.replace("-", "_"))), None)
            salaries[season] = dollars(cell.get_text(" ", strip=True) if cell else "")
        # Backup: BRef sometimes labels salary columns with year_1 etc.
        if not any(v is not None for v in salaries.values()):
            cells = tr.select("td")
            numeric = [dollars(td.get_text(" ", strip=True)) for td in cells if re.search(r"salary|2026|2027|2028", td.get("data-stat", ""), re.I)]
            if numeric:
                salaries = dict(zip(SEASONS, numeric[:3]))
        if salaries["2026-27"] is None:
            continue
        records.append({"name": player, "team": (tr.select_one('[data-stat="team_name_abbr"]') or tr.select_one('[data-stat="team"]')).get_text(" ", strip=True) if (tr.select_one('[data-stat="team_name_abbr"]') or tr.select_one('[data-stat="team"]')) else "", "salaries": salaries})
    if len(records) < 300:
        heads = [(t.get("id"), len(t.select("tbody tr")), [c.get("data-stat") for c in t.select("tbody tr:first-child td")[:8]]) for t in soup.select("table")[:12]]
        print(json.dumps({"sourceTables": heads, "htmlLength": len(html), "pageTitle": soup.title.get_text(" ", strip=True) if soup.title else None, "firstContractRow": table.select_one("tbody tr").get_text(" ", strip=True)[:300] if table.select_one("tbody tr") else None}, ensure_ascii=False))
        raise RuntimeError("Incomplete NBA live source response; got %d rows" % len(records))
    output={"source":URL,"source_population":len(records),"seasons":SEASONS,"players":records}
    p=Path("/tmp/nba-gm-live-contract-source.json")
    p.write_text(json.dumps(output, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({"fetched":len(records),"source":URL,"path":str(p),"curry":next((r for r in records if r["name"]=="Stephen Curry"),None)}, ensure_ascii=False))

if __name__=="__main__":
    main()
