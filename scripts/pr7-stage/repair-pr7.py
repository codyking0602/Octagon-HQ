#!/usr/bin/env python3
import base64
import json
import struct
import zlib
from pathlib import Path

PARTS = 5
EXPECTED_CRC = 0xBEF5C406
EXPECTED_SIZE = 230949
TARGET_RAW_POS = 75347
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def read_payload():
    texts = [Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").read_text().strip() for i in range(1, PARTS + 1)]
    return texts, "".join(texts)


def full_raw(compressed: bytes):
    try:
        return zlib.decompress(compressed[10:-8], -15)
    except zlib.error:
        return None


def validate_exact_raw(raw: bytes):
    if len(raw) != EXPECTED_SIZE or (zlib.crc32(raw) & 0xFFFFFFFF) != EXPECTED_CRC:
        return None
    try:
        people = json.loads(raw.decode("utf-8"))
    except Exception:
        return None
    if not isinstance(people, list) or len(people) != 99:
        return None
    if sum(len(p.get("facts", [])) for p in people) != 495:
        return None
    return people


def locate_compressed_index(compressed: bytes):
    raw_deflate = compressed[10:-8]
    inflater = zlib.decompressobj(-15)
    out_len = 0
    for i, byte in enumerate(raw_deflate):
        out_len += len(inflater.decompress(bytes([byte])))
        if out_len >= TARGET_RAW_POS:
            print(f"Mapped raw position {TARGET_RAW_POS} to deflate byte {i}, full gzip byte {i + 10}, output_len={out_len}", flush=True)
            return i + 10
    raise RuntimeError(f"Could not map target raw position; reached {out_len}")


def print_corrupt_context(compressed: bytes):
    raw = full_raw(compressed)
    if raw is None:
        return
    start = max(0, TARGET_RAW_POS - 900)
    stop = min(len(raw), TARGET_RAW_POS + 900)
    print("CORRUPT RAW CONTEXT START", flush=True)
    print(raw[start:stop].decode("utf-8", errors="replace"), flush=True)
    print("CORRUPT RAW CONTEXT END", flush=True)


def save_payload(payload: str):
    texts, old_payload = read_payload()
    lengths = [len(x) for x in texts]
    if sum(lengths) != len(old_payload) or len(payload) != len(old_payload):
        raise RuntimeError("Unexpected payload/chunk length")
    offset = 0
    for i, length in enumerate(lengths, 1):
        Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").write_text(payload[offset:offset+length] + "\n")
        offset += length
    print("Rewrote staged chunks with exact repaired payload", flush=True)


def build_prefix_states(raw_deflate: bytes, min_raw_idx: int, max_raw_idx: int):
    inflater = zlib.decompressobj(-15)
    prefix_len = 0
    prefix_crc = 0
    for i in range(min_raw_idx):
        out = inflater.decompress(raw_deflate[i:i+1])
        prefix_len += len(out)
        prefix_crc = zlib.crc32(out, prefix_crc)
    states = {}
    for i in range(min_raw_idx, max_raw_idx + 1):
        states[i] = (inflater.copy(), prefix_len, prefix_crc)
        if i < len(raw_deflate):
            out = inflater.decompress(raw_deflate[i:i+1])
            prefix_len += len(out)
            prefix_crc = zlib.crc32(out, prefix_crc)
    return states


def exact_from_mutation(raw_deflate: bytes, states, first_raw_idx: int, changed_segment: bytes, end_raw_idx: int):
    inflater, prefix_len, prefix_crc = states[first_raw_idx]
    probe = inflater.copy()
    try:
        out = probe.decompress(changed_segment)
        out += probe.decompress(raw_deflate[end_raw_idx:])
        out += probe.flush()
    except zlib.error:
        return None
    if prefix_len + len(out) != EXPECTED_SIZE:
        return None
    if (zlib.crc32(out, prefix_crc) & 0xFFFFFFFF) != EXPECTED_CRC:
        return None
    rebuilt = zlib.decompress(raw_deflate[:first_raw_idx] + changed_segment + raw_deflate[end_raw_idx:], -15)
    return validate_exact_raw(rebuilt)


def try_fast_base64(payload: str, compressed: bytes, center_byte: int, radius_chars: int):
    center_char = (center_byte * 4) // 3
    lo = max(16, center_char - radius_chars)
    hi = min(len(payload) - 16, center_char + radius_chars + 1)
    min_full = (lo // 4) * 3
    max_full = ((hi + 3) // 4) * 3 + 3
    min_raw = max(0, min_full - 10)
    max_raw = min(len(compressed) - 18, max_full - 10)
    raw_deflate = compressed[10:-8]
    states = build_prefix_states(raw_deflate, min_raw, max_raw)
    print(f"Fast base64 search chars {lo}:{hi} around center {center_char}; compressed bytes about {min_full}:{max_full}", flush=True)

    checked = 0
    for idx in range(lo, hi):
        original_char = payload[idx]
        if original_char == "=":
            continue
        qstart = idx - (idx % 4)
        quartet = payload[qstart:qstart+4]
        original_bytes = base64.b64decode(quartet)
        full_start = (qstart // 4) * 3
        for repl in ALPHABET:
            if repl == original_char:
                continue
            candidate_quartet = quartet[:idx-qstart] + repl + quartet[idx-qstart+1:]
            candidate_bytes = base64.b64decode(candidate_quartet)
            diff_positions = [i for i, (a, b) in enumerate(zip(original_bytes, candidate_bytes)) if a != b]
            if not diff_positions:
                continue
            first_full = full_start + min(diff_positions)
            last_full_exclusive = full_start + max(diff_positions) + 1
            first_raw = first_full - 10
            end_raw = last_full_exclusive - 10
            if first_raw < 0 or end_raw > len(raw_deflate) or first_raw not in states:
                continue
            changed = bytearray(raw_deflate[first_raw:end_raw])
            for pos in diff_positions:
                full_pos = full_start + pos
                if 10 <= full_pos < len(compressed) - 8:
                    changed[full_pos - 10 - first_raw] = candidate_bytes[pos]
            checked += 1
            people = exact_from_mutation(raw_deflate, states, first_raw, bytes(changed), end_raw)
            if people is not None:
                fixed = payload[:idx] + repl + payload[idx+1:]
                print(f"EXACT REPAIR: base64 char {idx}: {original_char} -> {repl}; checked={checked}", flush=True)
                return fixed, people
    print(f"No exact single base64 substitution in radius {radius_chars}; checked={checked}", flush=True)
    return None, None


def main():
    _, payload = read_payload()
    compressed = base64.b64decode(payload, validate=True)
    expected_crc, expected_size = struct.unpack("<II", compressed[-8:])
    raw = full_raw(compressed)
    print(
        f"Payload chars={len(payload)}, gzip bytes={len(compressed)}, trailer_crc={expected_crc:08x}, trailer_size={expected_size}, "
        f"actual_crc={(zlib.crc32(raw)&0xffffffff):08x}, actual_size={len(raw)}",
        flush=True,
    )
    print_corrupt_context(compressed)
    center = locate_compressed_index(compressed)

    repaired, people = try_fast_base64(payload, compressed, center, 16)
    if repaired:
        save_payload(repaired)
        print(f"Exact repaired dataset validates as {len(people)} identities / {sum(len(p['facts']) for p in people)} concepts", flush=True)
        return
    raise RuntimeError("No exact single-base64-character repair within ±16 localized chars")


if __name__ == "__main__":
    main()
