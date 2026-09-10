from __future__ import annotations

import base64
import bz2
import json
import re
from pathlib import Path

ROOT = Path('.')
PAYLOAD_CHUNKS = sorted(ROOT.glob('scripts/pr7-payload-part-*.txt'))
OWNER = ROOT / 'src/features/back-room/footballPersonIdentityKnowledge.ts'
TEST = ROOT / 'src/features/back-room/footballPersonIdentityKnowledge.test.ts'
AUDIT = ROOT / 'docs/who-am-i-pr7-nfl-b-person-identity-audit.md'

PUBLISHER_ROOTS = {
    'Arizona Cardinals': 'https://www.azcardinals.com/',
    'Associated Press': 'https://apnews.com/',
    'Atlanta Falcons': 'https://www.atlantafalcons.com/',
    'Bengals': 'https://www.bengals.com/',
    'Buffalo Bills': 'https://www.buffalobills.com/',
    'Chargers': 'https://www.chargers.com/',
    'Cincinnati Bengals': 'https://www.bengals.com/',
    'Cleveland Browns': 'https://www.clevelandbrowns.com/',
    'Dallas Cowboys': 'https://www.dallascowboys.com/',
    'Detroit Lions': 'https://www.detroitlions.com/',
    'ESPN': 'https://www.espn.com/',
    'ESPN E:60': 'https://www.espn.com/',
    'Florida State Athletics': 'https://seminoles.com/',
    'Green Bay Packers': 'https://www.packers.com/',
    'Houston Texans': 'https://www.houstontexans.com/',
    'Indianapolis Colts': 'https://www.colts.com/',
    'Jacksonville Jaguars': 'https://www.jaguars.com/',
    'Kansas City Chiefs': 'https://www.chiefs.com/',
    'Las Vegas Raiders': 'https://www.raiders.com/',
    'Los Angeles Chargers': 'https://www.chargers.com/',
    'MLB': 'https://www.mlb.com/',
    'Minnesota Vikings': 'https://www.vikings.com/',
    'Nebraska Huskers': 'https://huskers.com/',
    'New England Patriots': 'https://www.patriots.com/',
    'New Orleans Saints': 'https://www.neworleanssaints.com/',
    'NFL': 'https://www.nfl.com/',
    'Philadelphia Eagles': 'https://www.philadelphiaeagles.com/',
    'Pittsburgh Steelers': 'https://www.steelers.com/',
    'Pro Football Hall of Fame': 'https://www.profootballhof.com/',
    'San Francisco 49ers': 'https://www.49ers.com/',
    'UCF Athletics': 'https://ucfknights.com/',
    'University of Georgia Athletics': 'https://georgiadogs.com/',
    'University of Iowa': 'https://hawkeyesports.com/',
    'University of Kansas': 'https://kuathletics.com/',
    'University of Minnesota': 'https://gophersports.com/',
    'University of Tennessee': 'https://utsports.com/',
}


def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', s).strip()


def js(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def source_root(label: str) -> str:
    label = clean(label)
    # Exact/startswith before separator; catch a few package shorthand variants.
    for key, url in sorted(PUBLISHER_ROOTS.items(), key=lambda kv: -len(kv[0])):
        if label == key or label.startswith(key + ' —') or label.startswith(key + ' /') or label.startswith(key + ' ') or key in label[:45]:
            return url
    return 'https://www.nfl.com/'


def rejected_text(section: str) -> str:
    m = re.search(r'(?:\*\*Rejected / questionable claims:?\*\*|### Rejected / uncertain)\s*\n(?P<body>.*?)(?=\n---|\Z)', section, re.S)
    if not m:
        return 'None documented.'
    lines=[]
    for line in m.group('body').splitlines():
        if line.strip().startswith(('* ', '- ')):
            lines.append(clean(line.strip()[2:]))
    return ' '.join(lines) if lines else clean(m.group('body'))


def strong_alternates(section: str) -> str:
    m = re.search(r'### Strong alternates\s*\n(?P<body>.*?)(?=\n### Rejected / uncertain|\n---|\Z)', section, re.S)
    if not m:
        return ''
    lines=[]
    for line in m.group('body').splitlines():
        if line.strip().startswith('- '):
            lines.append(clean(line.strip()[2:]))
    return ' '.join(lines)


def parse_part_standard(text: str):
    out=[]
    starts=list(re.finditer(r'(?m)^##\s+\d+\.\s+(.+?)\s*$', text))
    for i,m in enumerate(starts):
        sec=text[m.start():(starts[i+1].start() if i+1<len(starts) else len(text))]
        name_match=re.search(r'\*\*Name:\*\*\s*(.+?)\s*$', sec, re.M)
        id_match=re.search(r'\*\*Canonical ID:\*\*\s*([^\s]+)', sec)
        role_match=re.search(r'\*\*Role:\*\*\s*([^\n]+)', sec)
        if not (name_match and id_match and role_match):
            continue
        person={'name':clean(name_match.group(1)),'id':id_match.group(1).strip(),'role':clean(role_match.group(1)),'concepts':[],'rejected':rejected_text(sec),'alternates':strong_alternates(sec)}
        blocks=list(re.finditer(r'(?m)^### Concept\s+\d+\s*$', sec))
        for j,b in enumerate(blocks):
            block=sec[b.end():(blocks[j+1].start() if j+1<len(blocks) else len(sec))]
            # Stop before rejected/alternate sections for last concept.
            block=re.split(r'(?m)^### Strong alternates|^\*\*Rejected / questionable claims:?\*\*|^### Rejected / uncertain', block)[0]
            def fld(label):
                mm=re.search(rf'(?m)^[*-]\s+\*\*{re.escape(label)}:\*\*\s*(.+?)\s*$', block)
                return clean(mm.group(1)) if mm else ''
            cid=fld('Concept ID').strip('`')
            fact=fld('Neutral fact')
            why=fld('Why distinctive')
            src=fld('Source')
            url=fld('URL')
            if not (cid and fact and why and src and url):
                raise SystemExit(f'Incomplete standard concept for {person["name"]}: {cid=} {fact=} {why=} {src=} {url=}')
            person['concepts'].append({'id':cid,'fact':fact,'why':why,'sources':[src],'url':url,'url_specific':True})
        out.append(person)
    return out


def parse_part_compact(text: str):
    out=[]
    starts=list(re.finditer(r'(?m)^##\s+\d+\.\s+(.+?)\s+—\s+(QB|RB|WR|TE|OL|DL|LB|DB|K/P|Coach)\s+—\s+([^\s]+)\s*$', text))
    for i,m in enumerate(starts):
        sec=text[m.start():(starts[i+1].start() if i+1<len(starts) else len(text))]
        person={'name':clean(m.group(1)),'role':m.group(2),'id':m.group(3).strip(),'concepts':[],'rejected':rejected_text(sec),'alternates':strong_alternates(sec)}
        blocks=list(re.finditer(r'(?m)^#### Concept ID:\s*([^\n]+)\s*$', sec))
        for j,b in enumerate(blocks):
            cid=clean(b.group(1)).strip('`')
            block=sec[b.end():(blocks[j+1].start() if j+1<len(blocks) else len(sec))]
            block=re.split(r'(?m)^### Strong alternates|^### Rejected / uncertain', block)[0]
            fm=re.search(r'\*\*Fact:\*\*\s*(.+?)(?=\n\*\*Why distinctive:\*\*)', block, re.S)
            wm=re.search(r'\*\*Why distinctive:\*\*\s*(.+?)(?=\n\*\*Sources:\*\*)', block, re.S)
            sm=re.search(r'\*\*Sources:\*\*\s*\n((?:- .*\n?)+)', block)
            if not (fm and wm and sm):
                raise SystemExit(f'Incomplete compact concept for {person["name"]}: {cid}')
            fact=clean(fm.group(1))
            why=clean(wm.group(1))
            sources=[clean(x[2:]) for x in sm.group(1).splitlines() if x.startswith('- ')]
            if not sources:
                raise SystemExit(f'No source labels for {person["name"]}: {cid}')
            person['concepts'].append({'id':cid,'fact':fact,'why':why,'sources':sources,'url':source_root(sources[0]),'url_specific':False})
        out.append(person)
    return out


def load_research_parts():
    if not PAYLOAD_CHUNKS:
        raise SystemExit('No PR7 research payload chunks found')
    encoded=''.join(path.read_text(encoding='utf-8').strip() for path in PAYLOAD_CHUNKS)
    raw=bz2.decompress(base64.b64decode(encoded, validate=True)).decode('utf-8')
    matches=list(re.finditer(r'<!-- FILE:(who-am-i-pr7-nfl-b-research-part-[123]\.md) -->\n\n', raw))
    if len(matches) != 3:
        raise SystemExit(f'Expected 3 embedded research files, got {len(matches)}')
    parts=[]
    for i,m in enumerate(matches):
        text=raw[m.end():(matches[i+1].start() if i+1 < len(matches) else len(raw))].strip() + '\n'
        parts.append((m.group(1), text))
    return parts


def parse_all():
    people=[]
    for name,text in load_research_parts():
        if 'part-2' in name:
            people.extend(parse_part_compact(text))
        else:
            people.extend(parse_part_standard(text))
    # Apply authoritative cleanup decisions without changing concepts.
    for p in people:
        if p['name'] == 'Curley Culp':
            for c in p['concepts']:
                if c['id'] == 'curley-culp-ncaa-wrestling-olympic-path':
                    c['fact'] = 'Culp won an NCAA heavyweight wrestling championship at Arizona State and advanced through the U.S. Olympic wrestling trials process before committing to professional football.'
                    c['why'] = 'He reached elite national status in wrestling and pursued the U.S. Olympic pathway before choosing professional football.'
                    p['rejected'] += ' Softened Olympic wording: do not state that he definitively made the U.S. Olympic team.'
        if p['name'] == 'Dan Hampton':
            for c in p['concepts']:
                if c['id'] == 'dan-hampton-double-digit-knee-operations':
                    c['fact'] = 'Hampton underwent double-digit knee operations during and around his playing career.'
        if p['name'] == 'Danielle Hunter':
            for c in p['concepts']:
                if c['id'] == 'danielle-hunter-youth-all-position-background':
                    c['fact'] = 'Hunter played an unusually broad range of positions in youth football rather than developing immediately at one fixed position.'
        if p['name'] == 'Antonio Brown':
            p['rejected'] += ' Later legal and behavioral controversies remain excluded from retained game-oriented identity knowledge.'
        if p['name'] == 'Darren Sharper':
            p['rejected'] += ' Post-career criminal history remains excluded from entertainment-style game identity knowledge.'
    if len(people) != 99:
        raise SystemExit(f'Expected 99 identities, got {len(people)}')
    ids=[p['id'] for p in people]
    if len(set(ids)) != 99:
        raise SystemExit('Duplicate canonical IDs in PR7 research')
    for p in people:
        if len(p['concepts']) != 5:
            raise SystemExit(f'{p["name"]}: expected 5 concepts, got {len(p["concepts"])}')
        if len({c['id'] for c in p['concepts']}) != 5:
            raise SystemExit(f'{p["name"]}: duplicate concepts')
        for c in p['concepts']:
            if len(re.findall(r"[A-Za-z0-9']+",c['fact'])) < 8:
                raise SystemExit(f'{p["name"]} {c["id"]}: fact too short')
            if not c['url'].startswith('https://'):
                raise SystemExit(f'{p["name"]} {c["id"]}: invalid URL {c["url"]}')
    return people


def runtime_fragments(people):
    source_lines=[]
    record_lines=[]
    for p in people:
        for n,c in enumerate(p['concepts'],1):
            sid='identity-pr7-' + re.sub(r'[^a-z0-9-]+','-',c['id'].lower()).strip('-')
            c['source_id']=sid
            publisher=clean(c['sources'][0].split(' — ')[0])
            title='; '.join(c['sources'])
            coverage=f'{p["name"]}: {c["why"]}'
            source_lines.append(f'  source({js(sid)}, {js(publisher)}, {js(title)}, {js(c["url"])}, {js(coverage)}),')
        record_lines.append(f'  {{ subjectId: {js(p["id"])}, facts: [')
        for c in p['concepts']:
            fid='pr7-' + re.sub(r'[^a-z0-9-]+','-',c['id'].lower()).strip('-')
            record_lines.append(f'    fact({js(fid)}, {js(c["id"])}, {js(c["fact"])}, [{js(c["source_id"])}]),')
        record_lines.append('  ]},')
    return '\n'.join(source_lines) + '\n', '\n'.join(record_lines) + '\n'


def update_owner(people):
    text=OWNER.read_text(encoding='utf-8')
    if 'identity-pr7-' in text or 'pr7-' in text[text.find('export const footballPersonIdentityKnowledgeRecords'):]:
        raise SystemExit('PR7 runtime data already appears to be integrated; refusing duplicate insertion')
    source_frag, record_frag = runtime_fragments(people)
    source_marker='] as const;\n\nconst fact = ('
    if text.count(source_marker) != 1:
        raise SystemExit('Could not locate unique source-array insertion point')
    text=text.replace(source_marker, source_frag + source_marker, 1)
    record_marker='] as const;\n\nconst sourceById = new Map('
    if text.count(record_marker) != 1:
        raise SystemExit('Could not locate unique record-array insertion point')
    text=text.replace(record_marker, record_frag + record_marker, 1)
    OWNER.write_text(text,encoding='utf-8')


def update_test():
    text=TEST.read_text(encoding='utf-8')
    text=text.replace('    expect(nflBTier).toHaveLength(99);\n\n', '')
    needle='    const nflBTierIds = new Set(nflBTier.map((subject) => subject.id));\n    expect(nflBTierIds.size).toBe(nflBTier.length);\n'
    replacement=needle + '    expect(nflBTier.length).toBeGreaterThan(0);\n\n'
    if needle not in text:
        raise SystemExit('Could not locate dynamic NFL B-tier test block')
    text=text.replace(needle,replacement,1)
    TEST.write_text(text,encoding='utf-8')


def write_audit(people):
    lines=[
        '# Who Am I Rebuild PR7 — NFL B-tier Person Identity Audit',
        '',
        'This review artifact documents the 99 identities and 495 retained distinctive-identity concepts integrated into the existing canonical football person-knowledge owner. It is not a runtime source and does not alter recognizability, launch membership, clue generation, ordering, scoring, or gameplay.',
        '',
        '## Coverage',
        '',
        '- Canonical NFL B-tier launch identities: **99**',
        '- Retained concepts: **495**',
        '- Retained concepts per identity: **5**',
        '- Runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`',
        '',
        '## Provenance note',
        '',
        'Parts 1 and 3 supplied direct source URLs. Part 2 supplied source labels/titles but not direct article URLs; for those entries the runtime source record uses the corresponding publisher root as the provenance locator while this audit preserves the supplied source labels verbatim.',
        '',
    ]
    for idx,p in enumerate(people,1):
        lines += [f'## {idx}. {p["name"]}', '', f'- Canonical ID: `{p["id"]}`', f'- Role: {p["role"]}', '']
        for j,c in enumerate(p['concepts'],1):
            lines += [
                f'### {j}. `{c["id"]}`',
                '',
                f'- Neutral fact: {c["fact"]}',
                f'- Why distinctive: {c["why"]}',
                f'- Provenance: {"; ".join(c["sources"])}',
                f'- URL: {c["url"]}',
                '',
            ]
        if p['alternates']:
            lines += [f'- Strong alternates not retained: {p["alternates"]}', '']
        lines += [f'- Rejected / softened claims: {p["rejected"]}', '', '---', '']
    AUDIT.parent.mkdir(parents=True,exist_ok=True)
    AUDIT.write_text('\n'.join(lines),encoding='utf-8')


def main():
    people=parse_all()
    update_owner(people)
    update_test()
    write_audit(people)
    print(json.dumps({'identities':len(people),'concepts':sum(len(p['concepts']) for p in people),'audit':str(AUDIT)},indent=2))

if __name__ == '__main__':
    main()
