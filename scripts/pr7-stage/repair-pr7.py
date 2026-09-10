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


def raw_inflate(compressed: bytes):
    try:
        return zlib.decompress(compressed[10:-8], -15)
    except zlib.error:
        return None


def exact_candidate(payload: str):
    try:
        compressed = base64.b64decode(payload, validate=True)
    except Exception:
        return None
    raw = raw_inflate(compressed)
    if raw is None or len(raw) != EXPECTED_SIZE or (zlib.crc32(raw) & 0xFFFFFFFF) != EXPECTED_CRC:
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
    last = []
    for i, byte in enumerate(raw_deflate):
        try:
            out = inflater.decompress(bytes([byte]))
        except zlib.error:
            break
        out_len += len(out)
        if len(last) >= 12:
            last.pop(0)
        last.append((i, out_len))
        if out_len >= TARGET_RAW_POS:
            print(f"Mapped raw position {TARGET_RAW_POS} to deflate byte about {i}, full gzip byte {i + 10}, output_len={out_len}")
            print(f"Mapping tail: {last}")
            return i + 10
    raise RuntimeError(f"Could not map raw position; inflater reached output length {out_len}")


def save_payload(payload: str):
    _, old_payload = read_payload()
    lengths = [len(Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").read_text().strip()) for i in range(1, PARTS + 1)]
    if sum(lengths) != len(old_payload):
        raise RuntimeError("Unexpected staged chunk lengths")
    offset = 0
    for i, length in enumerate(lengths, 1):
        Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").write_text(payload[offset:offset+length] + "\n")
        offset += length
    print("Rewrote staged chunks with exact repaired payload")


def try_base64_mutations(payload: str, center_byte: int, radius_chars: int):
    center_char = (center_byte * 4) // 3
    lo = max(0, center_char - radius_chars)
    hi = min(len(payload), center_char + radius_chars + 1)
    print(f"Searching single base64 substitutions chars {lo}:{hi} around center {center_char}")
    checked = 0
    for index in range(lo, hi):
        original = payload[index]
        if original == "=":
            continue
        for replacement in ALPHABET:
            if replacement == original:
                continue
            candidate = payload[:index] + replacement + payload[index+1:]
            checked += 1
            people = exact_candidate(candidate)
            if people is not None:
                print(f"EXACT REPAIR: base64 char {index}: {original} -> {replacement}; checked={checked}")
                return candidate, people
    print(f"No exact single base64 substitution in radius {radius_chars}; checked={checked}")
    return None, None


def try_byte_mutations(payload: str, center_byte: int, radius_bytes: int):
    compressed = bytearray(base64.b64decode(payload, validate=True))
    lo = max(10, center_byte - radius_bytes)
    hi = min(len(compressed) - 8, center_byte + radius_bytes + 1)
    print(f"Searching single compressed-byte mutations bytes {lo}:{hi} around center {center_byte}")
    checked = 0
    for index in range(lo, hi):
        original = compressed[index]
        for replacement in range(256):
            if replacement == original:
                continue
            candidate_bytes = bytearray(compressed)
            candidate_bytes[index] = replacement
            checked += 1
            raw = raw_inflate(bytes(candidate_bytes))
            if raw is None or len(raw) != EXPECTED_SIZE:
                continue
            if (zlib.crc32(raw) & 0xFFFFFFFF) != EXPECTED_CRC:
                continue
            candidate = base64.b64encode(candidate_bytes).decode("ascii")
            people = exact_candidate(candidate)
            if people is not None:
                print(f"EXACT REPAIR: compressed byte {index}: {original:#04x} -> {replacement:#04x}; checked={checked}")
                return candidate, people
    print(f"No exact single byte mutation in radius {radius_bytes}; checked={checked}")
    return None, None


def main():
    _, payload = read_payload()
    compressed = base64.b64decode(payload, validate=True)
    expected_crc, expected_size = struct.unpack("<II", compressed[-8:])
    print(f"Payload chars={len(payload)}, gzip bytes={len(compressed)}, trailer_crc={expected_crc:08x}, trailer_size={expected_size}")
    center = locate_compressed_index(compressed)

    for radius in (128, 512, 2048):
        repaired, people = try_base64_mutations(payload, center, radius)
        if repaired:
            save_payload(repaired)
            print(f"Exact repaired dataset validates as {len(people)} identities / {sum(len(p['facts']) for p in people)} concepts")
            return

    for radius in (64, 256):
        repaired, people = try_byte_mutations(payload, center, radius)
        if repaired:
            save_payload(repaired)
            print(f"Exact repaired dataset validates as {len(people)} identities / {sum(len(p['facts']) for p in people)} concepts")
            return

    raise RuntimeError("No exact single-mutation repair found in searched region")


if __name__ == "__main__":
    main()
