#!/usr/bin/env python3
import base64
import re
import zlib
from pathlib import Path

payload = "".join(Path(f"scripts/pr7-stage/pr7-data-part{i}.b64").read_text().strip() for i in range(1, 6))
compressed = base64.b64decode(payload, validate=True)
raw = zlib.decompress(compressed[10:-8], -15)
print(f"raw_len={len(raw)} crc={zlib.crc32(raw)&0xffffffff:08x}")

# Show every plausible complete identity start near and after the first corruption.
pattern = re.compile(rb'\{"id":"([^"\\]{1,120})","name":"([^"\\]{1,120})","role":"([^"\\]{1,40})","facts":\[')
print("IDENTITY MARKERS 55k..130k")
for m in pattern.finditer(raw, 55000, 130000):
    print(m.start(), m.group(1).decode('utf-8','replace'), '|', m.group(2).decode('utf-8','replace'), '|', m.group(3).decode('utf-8','replace'))

# Show plausible concept boundaries around the corruption, with enough text to identify the last clean and first recovered facts.
concept = re.compile(rb'\{"concept":"([^"\\]{1,120})","fact":"')
print("CONCEPT MARKERS 70k..100k")
for m in concept.finditer(raw, 70000, 100000):
    print(m.start(), m.group(1).decode('utf-8','replace'))

# Search farther forward for likely resynchronization markers.
print("IDENTITY MARKERS 130k..end")
count = 0
for m in pattern.finditer(raw, 130000):
    if count < 12:
        print(m.start(), m.group(1).decode('utf-8','replace'), '|', m.group(2).decode('utf-8','replace'), '|', m.group(3).decode('utf-8','replace'))
    count += 1
print("remaining_identity_markers", count)
raise SystemExit(1)
