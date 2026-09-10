#!/usr/bin/env python3
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("pr7_recovery", Path("scripts/pr7-recover-temp.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

RAW_PAYLOAD_COMMIT = "afb0726c6a863d4cfa604443d81ffb273c16c52c"
parts = [
    module.fetch_github_file(f"scripts/pr7-raw-payload-{index:02d}.txt", RAW_PAYLOAD_COMMIT).strip()
    for index in range(1, 4)
]
payload_b64 = "".join(parts)
print(f"Recovered historic PR7 transport string from staged raw chunks ({len(payload_b64)} base64 characters).")
_, people = module.repair_base64_payload(payload_b64)
module.integrate(people)
