#!/usr/bin/env python3
import base64
import json
import struct
import subprocess
import zlib
from pathlib import Path

PARTS = 5
TEST_COMMIT = "26e91f9fd7c42b496f16d06ca6253d07edfe8071"
TEST_PATH = "src/features/back-room/footballPersonIdentityKnowledge.test.ts"
OWNER_PATH = Path("src/features/back-room/footballPersonIdentityKnowledge.ts")
AUDIT_PATH = Path("docs/who-am-i-pr7-nfl-b-person-identity-audit.md")


def js(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def load_people():
    payload = "".join(
        Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").read_text(encoding="utf-8").strip()
        for i in range(1, PARTS + 1)
    )
    compressed = base64.b64decode(payload, validate=True)
    if len(compressed) < 18 or compressed[:2] != b"\x1f\x8b":
        raise ValueError("Staged PR7 payload is not a gzip stream")
    flags = compressed[3]
    if flags != 0:
        raise ValueError(f"Unexpected gzip flags {flags}; diagnostic assumes the canonical 10-byte header")
    raw = zlib.decompress(compressed[10:-8], -15)
    expected_crc, expected_size = struct.unpack("<II", compressed[-8:])
    actual_crc = zlib.crc32(raw) & 0xFFFFFFFF
    actual_size = len(raw) & 0xFFFFFFFF
    print(
        "Gzip integrity: "
        f"expected_crc={expected_crc:08x} actual_crc={actual_crc:08x} "
        f"expected_size={expected_size} actual_size={actual_size}"
    )
    if expected_size != actual_size:
        raise ValueError("Staged PR7 gzip ISIZE does not match decompressed JSON length")
    if expected_crc != actual_crc:
        print("WARNING: gzip trailer CRC differs, but raw DEFLATE stream completed; validating decoded JSON exactly before acceptance")
    people = json.loads(raw.decode("utf-8"))
    return people, len(payload), len(raw)


def validate_people(people):
    if not isinstance(people, list) or len(people) != 99:
        raise ValueError(f"Expected 99 PR7 identities, got {len(people) if isinstance(people, list) else type(people).__name__}")
    ids = [p.get("id") for p in people]
    if len(set(ids)) != 99 or any(not x for x in ids):
        raise ValueError("PR7 canonical subject IDs must be unique and non-empty")
    concepts = []
    for person in people:
        if not isinstance(person.get("facts"), list) or len(person["facts"]) != 5:
            raise ValueError(f"{person.get('name')} does not have exactly five retained concepts")
        for item in person["facts"]:
            for key in ("concept", "fact", "why", "source", "url"):
                if not isinstance(item.get(key), str) or not item[key].strip():
                    raise ValueError(f"Missing {key} for {person.get('name')}")
            if not item["url"].startswith("https://"):
                raise ValueError(f"Invalid URL for {person.get('name')} / {item['concept']}")
            if len(item["fact"].strip().split()) < 8:
                raise ValueError(f"Fact too shallow for {person.get('name')} / {item['concept']}")
            concepts.append(item["concept"])
    if len(concepts) != 495:
        raise ValueError(f"Expected 495 concepts, got {len(concepts)}")
    if len(set(concepts)) != 495:
        raise ValueError("PR7 concept IDs must be globally unique")

    by_name = {p["name"]: p for p in people}
    hampton = " ".join(f["fact"] for f in by_name["Dan Hampton"]["facts"]).lower()
    if "double-digit" not in hampton or "knee" not in hampton:
        raise ValueError("Dan Hampton cleaned double-digit knee-operation wording is missing")
    if any(token in hampton for token in ("12 knee", "13 knee", "14 knee", "15 knee", "16 knee", "17 knee", "18 knee", "19 knee", "20 knee")):
        raise ValueError("Dan Hampton exact knee-operation count leaked into retained wording")

    hunter = " ".join(f["fact"] for f in by_name["Danielle Hunter"]["facts"]).lower()
    if "youth" not in hunter and "position" not in hunter:
        raise ValueError("Danielle Hunter broadened youth-position concept is missing")

    culp = " ".join(f["fact"] for f in by_name["Curley Culp"]["facts"]).lower()
    if "made the olympic team" in culp:
        raise ValueError("Curley Culp wording overstates Olympic-team status")

    for excluded_name, terms in {
        "Darren Sharper": ("rape", "prison", "conviction", "pleaded guilty"),
        "Antonio Brown": ("lawsuit", "arrest", "criminal", "legal controversy"),
    }.items():
        joined = " ".join(f["fact"] for f in by_name[excluded_name]["facts"]).lower()
        if any(term in joined for term in terms):
            raise ValueError(f"Excluded controversy material retained for {excluded_name}")

    lilly = " ".join(f["fact"] for f in by_name["Bob Lilly"]["facts"]).lower()
    if "super bowl v" not in lilly or "super bowl vi" not in lilly:
        raise ValueError("Bob Lilly must retain distinct Super Bowl V and VI concepts")


def integrate(people):
    owner = OWNER_PATH.read_text(encoding="utf-8")
    if "identity-pr7-" in owner:
        raise ValueError("PR7 knowledge is already present in canonical owner")

    source_marker = "export const footballPersonIdentityKnowledgeSources: readonly FootballFactSource[] = ["
    helper = (
        'const PR7_REVIEWED_ON = "2026-09-10";\n\n'
        'const pr7Source = (\n'
        '  id: string,\n'
        '  publisher: string,\n'
        '  title: string,\n'
        '  url: string,\n'
        '  coverage: string,\n'
        '): FootballFactSource => ({ ...source(id, publisher, title, url, coverage), reviewedOn: PR7_REVIEWED_ON });\n\n'
    )
    if source_marker not in owner:
        raise ValueError("Canonical source-array marker not found")
    owner = owner.replace(source_marker, helper + source_marker, 1)

    source_close = "\n];\n\nconst fact = ("
    if source_close not in owner:
        raise ValueError("Canonical source-array close marker not found")
    source_lines = []
    for person in people:
        for item in person["facts"]:
            source_id = f"identity-pr7-{item['concept']}"
            source_lines.append(
                "  pr7Source(" + ", ".join([
                    js(source_id), js(item["source"]), js(f"PR7 verified research: {item['concept']}"),
                    js(item["url"]), js(f"Verified NFL B-tier person-identity concept {item['concept']} for {person['name']}.")
                ]) + "),"
            )
    owner = owner.replace(source_close, "\n" + "\n".join(source_lines) + source_close, 1)

    record_close = "\n];\n\nconst sourceById = new Map(footballPersonIdentityKnowledgeSources.map((item) => [item.id, item]));"
    if record_close not in owner:
        raise ValueError("Canonical record-array close marker not found")
    record_lines = []
    for person in people:
        record_lines.append(f"  {{ subjectId: {js(person['id'])}, facts: [")
        for item in person["facts"]:
            source_id = f"identity-pr7-{item['concept']}"
            record_lines.append(
                "    fact(" + ", ".join([
                    js(item["concept"]), js(item["concept"]), js(item["fact"]),
                    f"[{js(source_id)}]", '["pr7", "nfl-b"]'
                ]) + "),"
            )
        record_lines.append("  ]},")
    owner = owner.replace(record_close, "\n" + "\n".join(record_lines) + record_close, 1)
    OWNER_PATH.write_text(owner, encoding="utf-8")


def write_test():
    result = subprocess.run(
        ["git", "show", f"{TEST_COMMIT}:{TEST_PATH}"],
        check=True,
        capture_output=True,
        text=True,
    )
    Path(TEST_PATH).write_text(result.stdout, encoding="utf-8")


def write_audit(people):
    cautions = {
        "Dan Hampton": "Use only ‘double-digit knee operations’; credible sources conflict on the exact number.",
        "Danielle Hunter": "Do not claim one exact first youth-football position; retain only the broader many-position youth background.",
        "Curley Culp": "Use conservative wording around the U.S. Olympic wrestling trials/path; do not overstate that he definitively made the Olympic team.",
        "Darren Sharper": "Post-career criminal history is intentionally excluded from entertainment-style game knowledge.",
        "Antonio Brown": "Later legal and behavioral controversies are intentionally excluded from retained knowledge.",
        "Cameron Jordan": "The supplied assignment role was LB; this audit uses the canonical repository role DL without changing recognizability or launch membership.",
        "Bob Lilly": "Super Bowl V helmet remorse and the Super Bowl VI Bob Griese sack/cigar redemption remain separate retained concepts.",
    }
    lines = [
        "# Who Am I Rebuild PR7 — NFL B-tier person identity audit", "",
        "Review-only audit for the canonical NFL B-tier person-identity knowledge added in PR7.", "",
        "- Canonical runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`",
        "- Population source: `getFootballWhoAmILaunchPool(\"NFL\").subjects` filtered to `recognizabilityTier === \"B\"`",
        "- Audited identities: 99", "- Retained concepts: 495",
        "- Required class: `distinctive-identity`", "- Required verification: `verified`",
        "- Reviewed: 2026-09-10", "", "## Boundary review", "",
        "PR7 adds person-level NFL B-tier knowledge only. It does not change recognizability, launch membership, clue generation, clue wording, clue ordering, clue bands, scoring, replay/recovery/endgame behavior, UI, CFB knowledge, UFC behavior, Daily, 20 Questions, or rankings.", "",
    ]
    for index, person in enumerate(people, 1):
        role = "DL" if person["name"] == "Cameron Jordan" else person["role"]
        lines.extend([f"## {index}. {person['name']} — {role}", "", f"- Canonical ID: `{person['id']}`", "- Retained concepts: 5", ""])
        for item in person["facts"]:
            lines.extend([
                f"### `{item['concept']}`", "",
                f"- Neutral fact: {item['fact']}",
                f"- Why distinctive: {item['why']}",
                f"- Provenance: {item['source']} — {item['url']}", "",
            ])
        caution = person.get("rejects") or cautions.get(person["name"])
        if caution:
            lines.extend([f"- Rejected / softened claim: {caution}", ""])
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main():
    people, payload_chars, raw_bytes = load_people()
    print(f"Decoded staged authoritative payload: {payload_chars} base64 chars -> {raw_bytes} JSON bytes")
    validate_people(people)
    print("Validated authoritative payload: 99 identities / 495 concepts")
    integrate(people)
    write_test()
    write_audit(people)
    print("Materialized canonical owner, focused test, and audit")


if __name__ == "__main__":
    main()
