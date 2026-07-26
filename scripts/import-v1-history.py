#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

EXPECTED_CUTOFF = "2026-07-25T00:00:00.000Z"
EXPECTED_MEMBERS = {"CODY", "BROCK", "RHONDA", "SHANE", "TONY", "TYLER"}


def iso_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def digest_json(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def in_filter(values: list[str]) -> str:
    return f"in.({','.join(values)})"


def load_payload(path: Path, private_key_b64: str) -> tuple[dict[str, Any], str]:
    envelope = json.loads(path.read_text(encoding="utf-8"))
    if envelope.get("version") != 1:
        raise RuntimeError("Unsupported encrypted import envelope version.")
    private_key = x25519.X25519PrivateKey.from_private_bytes(base64.b64decode(private_key_b64))
    public_key = x25519.X25519PublicKey.from_public_bytes(base64.b64decode(envelope["ephemeralPublicKey"]))
    shared = private_key.exchange(public_key)
    key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"octagon-v1-v2-import",
    ).derive(shared)
    plaintext = AESGCM(key).decrypt(
        base64.b64decode(envelope["nonce"]),
        base64.b64decode(envelope["ciphertext"]),
        base64.b64decode(envelope["aad"]),
    )
    payload = json.loads(plaintext)
    return payload, hashlib.sha256(plaintext).hexdigest()


class SupabaseRest:
    def __init__(self, url: str, service_key: str) -> None:
        self.base = f"{url.rstrip('/')}/rest/v1"
        self.headers = {
            "apikey": service_key,
            "authorization": f"Bearer {service_key}",
            "content-type": "application/json",
        }

    def request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        body: Any = None,
        prefer: str | None = None,
    ) -> Any:
        headers = dict(self.headers)
        if prefer:
            headers["prefer"] = prefer
        response = requests.request(
            method,
            f"{self.base}/{table}",
            params=params,
            json=body,
            headers=headers,
            timeout=60,
        )
        if not response.ok:
            detail = response.text.replace("\n", " ")[:400]
            raise RuntimeError(f"V2 {table} request failed ({response.status_code}): {detail}")
        if not response.content:
            return []
        return response.json()

    def select(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        return self.request("GET", table, params=params)

    def insert(self, table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not rows:
            return []
        return self.request("POST", table, body=rows, prefer="return=representation")

    def patch(self, table: str, params: dict[str, str], row: dict[str, Any]) -> list[dict[str, Any]]:
        return self.request("PATCH", table, params=params, body=row, prefer="return=representation")


def validate_payload(payload: dict[str, Any]) -> None:
    if payload.get("schemaVersion") != 1:
        raise RuntimeError("Unsupported V1 payload schema.")
    if payload.get("cutoff") != EXPECTED_CUTOFF:
        raise RuntimeError("V1 payload cutoff does not match the protected V2 boundary.")
    profile_names = {str(profile.get("normalizedName", "")) for profile in payload.get("profiles", [])}
    if profile_names != EXPECTED_MEMBERS:
        raise RuntimeError(f"V1 profile set mismatch: {sorted(profile_names)}")

    cutoff = iso_datetime(EXPECTED_CUTOFF)
    events = {event["eventId"]: event for event in payload.get("pickEvents", [])}
    fights = {(fight["eventId"], fight["boutId"]): fight for fight in payload.get("pickFights", [])}

    for event in events.values():
        if event.get("status") != "complete" or iso_datetime(event["startsAt"]) >= cutoff:
            raise RuntimeError(f"Protected or incomplete event entered V1 payload: {event.get('eventId')}")
    for fight in fights.values():
        if fight["eventId"] not in events:
            raise RuntimeError(f"Fight references an unapproved event: {fight.get('boutId')}")
        if fight["winnerFighterSlug"] not in {fight["redFighterSlug"], fight["blueFighterSlug"]}:
            raise RuntimeError(f"Fight does not contain a resolved winner: {fight.get('boutId')}")
    for profile in payload.get("profiles", []):
        avatar = profile.get("avatarPhotoData")
        if avatar and (len(avatar) > 240000 or not avatar.startswith(("data:image/webp;base64,", "data:image/jpeg;base64,", "data:image/png;base64,"))):
            raise RuntimeError(f"Invalid avatar payload for {profile.get('normalizedName')}")
        for result in profile.get("findLeader", []):
            if not 0 <= int(result["officialScore"]) <= 10 or not 0 <= int(result["bestScore"]) <= 10:
                raise RuntimeError(f"Invalid Find the Leader score for {profile.get('normalizedName')}")
        for pick in profile.get("picks", []):
            fight = fights.get((pick["eventId"], pick["fightId"]))
            if not fight or pick["fighterSlug"] not in {fight["redFighterSlug"], fight["blueFighterSlug"]}:
                raise RuntimeError(f"Invalid historical pick for {profile.get('normalizedName')}")


def snapshot_protected(rest: SupabaseRest) -> dict[str, Any]:
    events = rest.select(
        "pick_events",
        {"select": "*", "starts_at": f"gte.{EXPECTED_CUTOFF}", "order": "event_id.asc"},
    )
    event_ids = [row["event_id"] for row in events]
    bouts = rest.select(
        "pick_bouts",
        {"select": "*", "event_id": in_filter(event_ids), "order": "event_id.asc,position.asc"},
    ) if event_ids else []
    picks = rest.select(
        "profile_event_picks",
        {"select": "*", "event_id": in_filter(event_ids), "order": "profile_id.asc,event_id.asc,bout_id.asc"},
    ) if event_ids else []
    return {"events": events, "bouts": bouts, "picks": picks}


def longest_streak(days: list[str]) -> int:
    parsed = sorted({datetime.fromisoformat(day).date() for day in days})
    best = current = 0
    previous = None
    for day in parsed:
        current = current + 1 if previous and (day - previous).days == 1 else 1
        best = max(best, current)
        previous = day
    return best


def main() -> None:
    payload_path = Path(os.environ["V1_IMPORT_ENVELOPE"])
    report_path = Path(os.environ.get("V1_IMPORT_REPORT", "/tmp/v1-import-report.json"))
    private_key = os.environ["V2_IMPORT_PRIVATE_KEY"]
    rest = SupabaseRest(os.environ["V2_SUPABASE_URL"], os.environ["V2_SERVICE_ROLE_KEY"])

    payload, payload_checksum = load_payload(payload_path, private_key)
    validate_payload(payload)
    protected_before = snapshot_protected(rest)
    protected_before_hash = digest_json(protected_before)

    all_profiles = rest.select("profiles", {"select": "id,display_name,normalized_name", "order": "normalized_name.asc"})
    profile_by_name = {row["normalized_name"]: row for row in all_profiles}
    missing_profiles = sorted(EXPECTED_MEMBERS - set(profile_by_name))
    if missing_profiles:
        raise RuntimeError(f"V2 profiles are missing: {missing_profiles}")

    profile_ids = [profile_by_name[name]["id"] for name in sorted(EXPECTED_MEMBERS)]
    existing_preferences = rest.select(
        "profile_preferences",
        {"select": "profile_id,avatar_photo_data", "profile_id": in_filter(profile_ids)},
    )
    preference_by_id = {row["profile_id"]: row for row in existing_preferences}

    counts = {
        "avatarsInserted": 0,
        "avatarsPreserved": 0,
        "findLeaderInserted": 0,
        "findLeaderMerged": 0,
        "eventsInserted": 0,
        "eventsPreserved": 0,
        "boutsInserted": 0,
        "boutsPreserved": 0,
        "picksInserted": 0,
        "picksPreserved": 0,
    }

    for profile in payload["profiles"]:
        profile_id = profile_by_name[profile["normalizedName"]]["id"]
        avatar = profile.get("avatarPhotoData")
        if not avatar:
            continue
        existing = preference_by_id.get(profile_id)
        if existing and existing.get("avatar_photo_data"):
            counts["avatarsPreserved"] += 1
            continue
        if existing:
            rest.patch(
                "profile_preferences",
                {"profile_id": f"eq.{profile_id}", "avatar_photo_data": "is.null"},
                {"avatar_photo_data": avatar, "updated_at": datetime.now(timezone.utc).isoformat()},
            )
        else:
            rest.insert("profile_preferences", [{
                "profile_id": profile_id,
                "avatar_photo_data": avatar,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }])
        counts["avatarsInserted"] += 1

    existing_history = rest.select(
        "find_leader_history",
        {"select": "*", "profile_id": in_filter(profile_ids), "order": "profile_id.asc,day.asc"},
    )
    history_by_key = {(row["profile_id"], row["day"]): row for row in existing_history}
    for profile in payload["profiles"]:
        profile_id = profile_by_name[profile["normalizedName"]]["id"]
        for imported in profile.get("findLeader", []):
            key = (profile_id, imported["day"])
            existing = history_by_key.get(key)
            imported_completed = iso_datetime(imported["completedAt"])
            if not existing:
                row = {
                    "profile_id": profile_id,
                    "day": imported["day"],
                    "official_score": int(imported["officialScore"]),
                    "best_score": int(imported["bestScore"]),
                    "attempts": max(1, int(imported["attempts"])),
                    "completed_at": imported_completed.isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
                rest.insert("find_leader_history", [row])
                history_by_key[key] = row
                counts["findLeaderInserted"] += 1
                continue

            existing_completed = iso_datetime(existing["completed_at"])
            merged = {
                "official_score": int(imported["officialScore"]) if imported_completed < existing_completed else int(existing["official_score"]),
                "best_score": max(int(existing["best_score"]), int(imported["bestScore"])),
                "attempts": max(int(existing["attempts"]), int(imported["attempts"])),
                "completed_at": min(existing_completed, imported_completed).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            if any(str(existing.get(field)) != str(merged[field]) for field in ("official_score", "best_score", "attempts", "completed_at")):
                rest.patch(
                    "find_leader_history",
                    {"profile_id": f"eq.{profile_id}", "day": f"eq.{imported['day']}"},
                    merged,
                )
                history_by_key[key] = {**existing, **merged}
                counts["findLeaderMerged"] += 1

    imported_event_ids = [event["eventId"] for event in payload["pickEvents"]]
    existing_events = rest.select(
        "pick_events",
        {"select": "*", "event_id": in_filter(imported_event_ids)},
    ) if imported_event_ids else []
    event_by_id = {row["event_id"]: row for row in existing_events}
    for event in payload["pickEvents"]:
        existing = event_by_id.get(event["eventId"])
        if existing:
            if iso_datetime(existing["starts_at"]) >= iso_datetime(EXPECTED_CUTOFF):
                raise RuntimeError(f"Historical import collided with protected event {event['eventId']}")
            counts["eventsPreserved"] += 1
            continue
        row = {
            "event_id": event["eventId"],
            "name": event["name"],
            "subtitle": event["subtitle"],
            "venue": event["venue"],
            "location": event["location"],
            "starts_at": event["startsAt"],
            "locks_at": event["locksAt"],
            "season": int(event["season"]),
            "status": "complete",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        rest.insert("pick_events", [row])
        event_by_id[event["eventId"]] = row
        counts["eventsInserted"] += 1

    existing_bouts = rest.select(
        "pick_bouts",
        {"select": "*", "event_id": in_filter(imported_event_ids), "order": "event_id.asc,position.asc"},
    ) if imported_event_ids else []
    bout_by_key = {(row["event_id"], row["bout_id"]): row for row in existing_bouts}
    for fight in payload["pickFights"]:
        key = (fight["eventId"], fight["boutId"])
        existing = bout_by_key.get(key)
        expected = {
            "red_fighter_slug": fight["redFighterSlug"],
            "blue_fighter_slug": fight["blueFighterSlug"],
            "winner_fighter_slug": fight["winnerFighterSlug"],
        }
        if existing:
            if any(existing.get(field) != value for field, value in expected.items()):
                raise RuntimeError(f"Historical bout conflict: {fight['eventId']} / {fight['boutId']}")
            counts["boutsPreserved"] += 1
            continue
        row = {
            "event_id": fight["eventId"],
            "bout_id": fight["boutId"],
            "position": int(fight["position"]),
            "weight_class": fight["weightClass"],
            "red_fighter_slug": fight["redFighterSlug"],
            "red_fighter_name": fight["redFighterName"],
            "blue_fighter_slug": fight["blueFighterSlug"],
            "blue_fighter_name": fight["blueFighterName"],
            "winner_fighter_slug": fight["winnerFighterSlug"],
        }
        rest.insert("pick_bouts", [row])
        bout_by_key[key] = row
        counts["boutsInserted"] += 1

    existing_picks = rest.select(
        "profile_event_picks",
        {"select": "*", "profile_id": in_filter(profile_ids), "event_id": in_filter(imported_event_ids)},
    ) if imported_event_ids else []
    pick_by_key = {(row["profile_id"], row["event_id"], row["bout_id"]): row for row in existing_picks}
    event_start_by_id = {event["eventId"]: event["startsAt"] for event in payload["pickEvents"]}
    for profile in payload["profiles"]:
        profile_id = profile_by_name[profile["normalizedName"]]["id"]
        for pick in profile.get("picks", []):
            key = (profile_id, pick["eventId"], pick["fightId"])
            existing = pick_by_key.get(key)
            if existing:
                if existing["fighter_slug"] != pick["fighterSlug"]:
                    raise RuntimeError(f"V2 pick conflict for {profile['normalizedName']} / {pick['fightId']}")
                counts["picksPreserved"] += 1
                continue
            picked_at = pick.get("pickedAt") or event_start_by_id[pick["eventId"]]
            row = {
                "profile_id": profile_id,
                "event_id": pick["eventId"],
                "bout_id": pick["fightId"],
                "fighter_slug": pick["fighterSlug"],
                "picked_at": picked_at,
                "updated_at": picked_at,
            }
            rest.insert("profile_event_picks", [row])
            pick_by_key[key] = row
            counts["picksInserted"] += 1

    protected_after = snapshot_protected(rest)
    protected_after_hash = digest_json(protected_after)
    if protected_before_hash != protected_after_hash:
        raise RuntimeError("Protected July 25-or-later V2 Picks data changed during import.")

    final_history = rest.select(
        "find_leader_history",
        {"select": "profile_id,day,official_score,best_score", "profile_id": in_filter(profile_ids), "order": "profile_id.asc,day.asc"},
    )
    final_bouts = rest.select(
        "pick_bouts",
        {"select": "event_id,bout_id,winner_fighter_slug", "event_id": in_filter(imported_event_ids)},
    ) if imported_event_ids else []
    winner_by_fight = {(row["event_id"], row["bout_id"]): row["winner_fighter_slug"] for row in final_bouts}
    final_picks = rest.select(
        "profile_event_picks",
        {"select": "profile_id,event_id,bout_id,fighter_slug", "profile_id": in_filter(profile_ids), "event_id": in_filter(imported_event_ids)},
    ) if imported_event_ids else []

    profile_report: dict[str, Any] = {}
    for name in sorted(EXPECTED_MEMBERS):
        profile_id = profile_by_name[name]["id"]
        history_rows = [row for row in final_history if row["profile_id"] == profile_id]
        pick_rows = [row for row in final_picks if row["profile_id"] == profile_id]
        correct = sum(1 for row in pick_rows if winner_by_fight.get((row["event_id"], row["bout_id"])) == row["fighter_slug"])
        profile_report[name] = {
            "recordedDays": len(history_rows),
            "bestStreak": longest_streak([row["day"] for row in history_rows]),
            "perfect10s": sum(1 for row in history_rows if int(row["official_score"]) == 10),
            "bestScore": max((int(row["best_score"]) for row in history_rows), default=0),
            "historicalPicksCorrect": correct,
            "historicalPicksIncorrect": len(pick_rows) - correct,
            "historicalPickEvents": len({row["event_id"] for row in pick_rows}),
        }

    report = {
        "payloadChecksum": payload_checksum,
        "sourceGroupFingerprint": payload.get("sourceGroupFingerprint"),
        "cutoff": payload["cutoff"],
        "payloadSummary": payload["summary"],
        "changes": counts,
        "protectedSnapshotHash": protected_after_hash,
        "protectedEventCount": len(protected_after["events"]),
        "protectedBoutCount": len(protected_after["bouts"]),
        "protectedPickCount": len(protected_after["picks"]),
        "profiles": profile_report,
    }
    report_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"status": "success", "payloadChecksum": payload_checksum, "changes": counts}))


if __name__ == "__main__":
    main()
