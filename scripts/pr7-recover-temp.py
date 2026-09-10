#!/usr/bin/env python3
import base64
import gzip
import json
import os
import re
import struct
import urllib.parse
import urllib.request
import zlib
from pathlib import Path

REPO = "codyking0602/Octagon-HQ"
HISTORIC_PAYLOAD_COMMIT = "70760d031867f2c431fbe169ea8efe564108545a"
CLEAN_PART1_COMMIT = "08d946ef8f14724fb97e3eae6170149e6f0ceea3"
BRANCH = "feat/who-am-i-nfl-b-person-identity-research"
B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def fetch_github_file(path: str, ref: str) -> str:
    token = os.environ["GH_TOKEN"]
    encoded_path = urllib.parse.quote(path, safe="/")
    encoded_ref = urllib.parse.quote(ref, safe="")
    url = f"https://api.github.com/repos/{REPO}/contents/{encoded_path}?ref={encoded_ref}"
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "octagon-hq-pr7-recovery",
        },
    )
    with urllib.request.urlopen(request) as response:
        payload = json.load(response)
    return base64.b64decode(payload["content"]).decode("utf-8")


def validate_people(people):
    if not isinstance(people, list) or len(people) != 99:
        raise ValueError(f"Expected 99 PR7 identities, got {len(people) if isinstance(people, list) else type(people).__name__}.")
    if len({person.get("id") for person in people}) != 99:
        raise ValueError("Duplicate or missing PR7 canonical subject id.")
    if any(not isinstance(person.get("facts"), list) or len(person["facts"]) != 5 for person in people):
        raise ValueError("Every PR7 identity must have exactly five retained concepts.")
    fact_count = sum(len(person["facts"]) for person in people)
    if fact_count != 495:
        raise ValueError(f"Expected 495 PR7 concepts, got {fact_count}.")
    concepts = [fact.get("concept") for person in people for fact in person["facts"]]
    if len(set(concepts)) != 495 or any(not isinstance(value, str) or not value.strip() for value in concepts):
        raise ValueError("PR7 concept ids must be globally unique and non-empty.")
    for person in people:
        for fact in person["facts"]:
            for key in ("concept", "fact", "why", "source", "url"):
                if not isinstance(fact.get(key), str) or not fact[key].strip():
                    raise ValueError(f"Missing PR7 {key} for {person.get('id')}.")
            if not fact["url"].startswith("https://"):
                raise ValueError(f"Invalid PR7 source URL for {fact['concept']}.")
            if len(fact["fact"].strip().split()) < 8:
                raise ValueError(f"PR7 fact is too shallow: {fact['concept']}.")
    return fact_count


def inflate_progress(compressed: bytes) -> int:
    if len(compressed) < 18:
        return -1
    raw = compressed[10:-8]
    inflater = zlib.decompressobj(-15)
    position = 0
    chunk_size = 256
    while position < len(raw):
        chunk = raw[position:position + chunk_size]
        before = inflater.copy()
        try:
            inflater.decompress(chunk)
            position += len(chunk)
            continue
        except zlib.error:
            pass
        low, high = 1, len(chunk)
        while low < high:
            middle = (low + high) // 2
            probe = before.copy()
            try:
                probe.decompress(chunk[:middle])
                low = middle + 1
            except zlib.error:
                high = middle
        return position + low - 1
    return len(raw)


def exact_decode_base64_gzip(payload_b64: str):
    try:
        compressed = base64.b64decode(payload_b64, validate=True)
    except Exception:
        return None
    if len(compressed) < 18 or compressed[:2] != b"\x1f\x8b":
        return None
    try:
        raw = zlib.decompress(compressed[10:-8], -15)
    except zlib.error:
        return None
    expected_crc, expected_size = struct.unpack("<II", compressed[-8:])
    if (zlib.crc32(raw) & 0xFFFFFFFF) != expected_crc:
        return None
    if (len(raw) & 0xFFFFFFFF) != expected_size:
        return None
    try:
        people = json.loads(raw.decode("utf-8"))
        validate_people(people)
        return people
    except Exception:
        return None


def repair_base64_payload(payload_b64: str):
    direct = exact_decode_base64_gzip(payload_b64)
    if direct is not None:
        print("Historic payload gzip is already exact.")
        return payload_b64, direct

    def state_progress(text: str):
        try:
            compressed = base64.b64decode(text, validate=True)
        except Exception:
            return -1, 0
        return inflate_progress(compressed), max(0, len(compressed) - 18)

    initial_progress, raw_len = state_progress(payload_b64)
    print(f"Historic payload first deflate failure near raw compressed byte {initial_progress} of {raw_len}.")

    # The payload was transported as base64 text. Search first for a small number of
    # character substitutions around each actual deflate failure. CRC + ISIZE + JSON
    # shape make an accepted recovery exact rather than heuristic.
    beam = [(payload_b64, initial_progress)]
    seen = {payload_b64}
    for depth in range(1, 7):
        candidates = []
        for text, current_progress in beam:
            try:
                compressed = base64.b64decode(text, validate=True)
            except Exception:
                continue
            raw_count = max(0, len(compressed) - 18)
            if current_progress >= raw_count:
                continue
            full_byte_index = 10 + current_progress
            center = (full_byte_index * 4) // 3
            start = max(0, center - 10)
            stop = min(len(text), center + 11)
            for index in range(start, stop):
                original = text[index]
                if original == "=":
                    continue
                for replacement in B64_ALPHABET:
                    if replacement == original:
                        continue
                    candidate = text[:index] + replacement + text[index + 1:]
                    if candidate in seen:
                        continue
                    seen.add(candidate)
                    recovered = exact_decode_base64_gzip(candidate)
                    if recovered is not None:
                        print(f"Recovered exact PR7 payload with {depth} base64 substitution(s).")
                        return candidate, recovered
                    progress, candidate_raw_len = state_progress(candidate)
                    if progress > current_progress:
                        candidates.append((candidate, progress, candidate_raw_len))
        if not candidates:
            break
        candidates.sort(key=lambda item: item[1], reverse=True)
        best_progress = candidates[0][1]
        # Prefer mutations that clearly advance the inflater; retain a small beam for
        # ambiguous bit-level boundaries.
        beam = [(text, progress) for text, progress, _ in candidates[:8]]
        print(f"Base64 repair depth {depth}: best deflate progress {best_progress} of {raw_len}.")

    # Fallback: byte mutations can repair a corruption that did not correspond to a
    # single base64-character substitution. Keep the same exact CRC/JSON acceptance.
    original_bytes = bytearray(base64.b64decode(payload_b64))
    raw_len = len(original_bytes) - 18
    byte_beam = [(bytes(original_bytes), inflate_progress(bytes(original_bytes)))]
    seen_bytes = {bytes(original_bytes)}
    for depth in range(1, 5):
        candidates = []
        for data, current_progress in byte_beam:
            if current_progress >= raw_len:
                continue
            center = 10 + current_progress
            start = max(10, center - 10)
            stop = min(len(data) - 8, center + 5)
            mutable = bytearray(data)
            for index in range(start, stop):
                original = mutable[index]
                for replacement in range(256):
                    if replacement == original:
                        continue
                    candidate_bytes = bytearray(mutable)
                    candidate_bytes[index] = replacement
                    candidate = bytes(candidate_bytes)
                    if candidate in seen_bytes:
                        continue
                    seen_bytes.add(candidate)
                    candidate_b64 = base64.b64encode(candidate).decode("ascii")
                    recovered = exact_decode_base64_gzip(candidate_b64)
                    if recovered is not None:
                        print(f"Recovered exact PR7 payload with {depth} compressed-byte mutation(s).")
                        return candidate_b64, recovered
                    progress = inflate_progress(candidate)
                    if progress > current_progress:
                        candidates.append((candidate, progress))
        if not candidates:
            break
        candidates.sort(key=lambda item: item[1], reverse=True)
        byte_beam = candidates[:6]
        print(f"Byte repair depth {depth}: best deflate progress {byte_beam[0][1]} of {raw_len}.")

    raise RuntimeError("Could not exactly repair the historic all-99 PR7 gzip payload from repository history.")


def js(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def assert_cleaned_research_decisions(people):
    by_name = {person["name"]: person for person in people}
    if "Dan Hampton" in by_name:
        joined = " ".join(f["fact"] for f in by_name["Dan Hampton"]["facts"]).lower()
        if "double-digit" not in joined or "knee" not in joined:
            raise ValueError("Dan Hampton cleaned knee-operation wording is missing.")
    if "Curley Culp" in by_name:
        joined = " ".join(f["fact"] for f in by_name["Curley Culp"]["facts"]).lower()
        if "made the olympic team" in joined:
            raise ValueError("Curley Culp Olympic wording overstates the supplied research decision.")
    if "Darren Sharper" in by_name:
        joined = " ".join(f["fact"] for f in by_name["Darren Sharper"]["facts"]).lower()
        if any(term in joined for term in ("rape", "prison", "conviction", "pleaded guilty")):
            raise ValueError("Darren Sharper criminal-history material appeared in retained game knowledge.")
    if "Antonio Brown" in by_name:
        joined = " ".join(f["fact"] for f in by_name["Antonio Brown"]["facts"]).lower()
        if any(term in joined for term in ("lawsuit", "arrest", "criminal", "legal controversy")):
            raise ValueError("Antonio Brown excluded controversy material appeared in retained knowledge.")
    if "Bob Lilly" in by_name:
        facts = by_name["Bob Lilly"]["facts"]
        if not any("super bowl v" in f["fact"].lower() for f in facts):
            raise ValueError("Bob Lilly Super Bowl V concept is missing.")
        if not any("super bowl vi" in f["fact"].lower() for f in facts):
            raise ValueError("Bob Lilly Super Bowl VI concept is missing.")


def integrate(people):
    fact_count = validate_people(people)
    assert_cleaned_research_decisions(people)

    # Cross-check the independently staged clean first research chunk from the prior
    # integration attempt. This proves the repaired all-person payload agrees with the
    # already verified research transport rather than merely satisfying counts/CRC.
    clean_part1_b64 = fetch_github_file("scripts/pr7-data-part1.b64", CLEAN_PART1_COMMIT).strip()
    clean_part1 = json.loads(gzip.decompress(base64.b64decode(clean_part1_b64)).decode("utf-8"))
    if not isinstance(clean_part1, list) or not clean_part1:
        raise ValueError("Historic clean PR7 part 1 is not a non-empty identity array.")
    if people[:len(clean_part1)] != clean_part1:
        raise ValueError("Recovered all-99 payload does not match the independently staged clean PR7 part 1.")
    print(f"Recovered payload matches clean staged part 1 ({len(clean_part1)} identities).")

    owner_path = Path("src/features/back-room/footballPersonIdentityKnowledge.ts")
    owner = owner_path.read_text(encoding="utf-8")
    if "identity-pr7-" in owner:
        raise ValueError("PR7 knowledge appears to already be integrated in the canonical owner.")

    helper_marker = "export const footballPersonIdentityKnowledgeSources: readonly FootballFactSource[] = ["
    if helper_marker not in owner:
        raise ValueError("Canonical person-identity source owner marker not found.")
    helper_block = "const PR7_REVIEWED_ON = \"2026-09-10\";\n\nconst pr7Source = (\n  id: string,\n  publisher: string,\n  title: string,\n  url: string,\n  coverage: string,\n): FootballFactSource => ({ ...source(id, publisher, title, url, coverage), reviewedOn: PR7_REVIEWED_ON });\n\n"
    owner = owner.replace(helper_marker, helper_block + helper_marker, 1)

    source_close_marker = "\n];\n\nconst fact = ("
    if source_close_marker not in owner:
        raise ValueError("Canonical person-identity source array closing marker not found.")
    source_lines = []
    for person in people:
        for item in person["facts"]:
            source_id = f"identity-pr7-{item['concept']}"
            source_lines.append(
                "  pr7Source("
                + ", ".join([
                    js(source_id),
                    js(item["source"]),
                    js(f"PR7 verified research: {item['concept']}"),
                    js(item["url"]),
                    js(f"Verified NFL B-tier person-identity concept {item['concept']} for {person['name']}."),
                ])
                + "),"
            )
    owner = owner.replace(source_close_marker, "\n" + "\n".join(source_lines) + source_close_marker, 1)

    record_close_marker = "\n];\n\nconst sourceById = new Map(footballPersonIdentityKnowledgeSources.map((item) => [item.id, item]));"
    if record_close_marker not in owner:
        raise ValueError("Canonical person-identity record array closing marker not found.")
    record_lines = []
    for person in people:
        record_lines.append(f"  {{ subjectId: {js(person['id'])}, facts: [")
        for item in person["facts"]:
            source_id = f"identity-pr7-{item['concept']}"
            record_lines.append(
                "    fact("
                + ", ".join([
                    js(item["concept"]),
                    js(item["concept"]),
                    js(item["fact"]),
                    f"[{js(source_id)}]",
                    '["pr7", "nfl-b"]',
                ])
                + "),"
            )
        record_lines.append("  ]},")
    owner = owner.replace(record_close_marker, "\n" + "\n".join(record_lines) + record_close_marker, 1)
    owner_path.write_text(owner, encoding="utf-8")

    caution_overrides = {
        "Dan Hampton": "Use only ‘double-digit knee operations’; credible sources conflict on the exact number.",
        "Danielle Hunter": "Do not claim one exact first youth-football position; retain only the broader many-position youth background.",
        "Curley Culp": "Use conservative wording around the U.S. Olympic wrestling trials/path; do not overstate that he definitively made the Olympic team.",
        "Darren Sharper": "Post-career criminal history is intentionally excluded from entertainment-style game knowledge.",
        "Antonio Brown": "Later legal and behavioral controversies are intentionally excluded from retained knowledge.",
        "Cameron Jordan": "The supplied assignment role was LB; this audit uses the canonical repository role DL without changing recognizability or launch membership.",
        "Bob Lilly": "Super Bowl V helmet remorse and the Super Bowl VI Bob Griese sack/cigar redemption remain separate retained concepts.",
    }

    audit = [
        "# Who Am I Rebuild PR7 — NFL B-tier person identity audit",
        "",
        "Review-only audit for the canonical NFL B-tier person-identity knowledge added in PR7.",
        "",
        "- Canonical runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`",
        "- Population source: `getFootballWhoAmILaunchPool(\"NFL\").subjects` filtered to `recognizabilityTier === \"B\"`",
        "- Audited identities: 99",
        "- Retained concepts: 495",
        "- Required class: `distinctive-identity`",
        "- Required verification: `verified`",
        "- Reviewed: 2026-09-10",
        "",
        "## Boundary review",
        "",
        "PR7 adds person-level NFL B-tier knowledge only. It does not change recognizability, launch membership, clue generation, clue wording, clue ordering, clue bands, scoring, replay/recovery/endgame behavior, UI, CFB knowledge, UFC behavior, Daily, 20 Questions, or rankings.",
        "",
    ]
    for index, person in enumerate(people, 1):
        role = "DL" if person["name"] == "Cameron Jordan" else person["role"]
        audit.extend([
            f"## {index}. {person['name']} — {role}",
            "",
            f"- Canonical ID: `{person['id']}`",
            "- Retained concepts: 5",
            "",
        ])
        for item in person["facts"]:
            audit.extend([
                f"### `{item['concept']}`",
                "",
                f"- Neutral fact: {item['fact']}",
                f"- Why distinctive: {item['why']}",
                f"- Provenance: {item['source']} — {item['url']}",
                "",
            ])
        caution = person.get("rejects") or caution_overrides.get(person["name"])
        if caution:
            audit.extend([f"- Rejected / softened claim: {caution}", ""])
    Path("docs/who-am-i-pr7-nfl-b-person-identity-audit.md").write_text("\n".join(audit).rstrip() + "\n", encoding="utf-8")
    print(f"Integrated {len(people)} identities and {fact_count} concepts into the canonical owner and generated the audit.")


def main():
    historic_script = fetch_github_file("scripts/pr7-integrate-temp.mjs", HISTORIC_PAYLOAD_COMMIT)
    match = re.search(r'const payload = "([A-Za-z0-9+/=]+)";', historic_script)
    if not match:
        raise RuntimeError("Could not locate historic PR7 payload in repository history.")
    payload_b64 = match.group(1)
    print(f"Recovered historic PR7 transport string ({len(payload_b64)} base64 characters).")
    _, people = repair_base64_payload(payload_b64)
    integrate(people)


if __name__ == "__main__":
    main()
