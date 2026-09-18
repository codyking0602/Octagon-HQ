import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync("src/app/App.tsx", "utf8");
const notice = readFileSync("src/app/HitTheNumberUpdateNotice.tsx", "utf8");
const styles = readFileSync("src/styles/hit-number-update-notice.css", "utf8");
const migration = readFileSync(
  "supabase/migrations/202612310152_hit_number_one_time_member_notice.sql",
  "utf8",
);

describe("Hit the Number one-time member notice", () => {
  it("mounts globally after identity is ready and uses the approved copy", () => {
    expect(app).toContain("<HitTheNumberUpdateNotice />");
    expect(notice).toContain("Hit the Number Update");
    expect(notice).toContain("We’ve updated how ties are handled in Hit the Number");
    expect(notice).toContain("closest to the target number.");
    expect(notice).toContain(
      "Shane has been awarded the September 17 win, and Lib’s win has been removed.",
    );
    expect(notice).toContain('"GOT IT"');
  });

  it("uses the same durable acknowledgement for both X and Got It", () => {
    expect(notice).toContain('const NOTICE_KEY = "hit-number-tiebreak-2026-09-18"');
    expect(notice).toContain('.rpc("get_my_app_notice_state"');
    expect(notice).toContain('.rpc("acknowledge_my_app_notice"');
    expect(notice.match(/onClick=\{\(\) => void acknowledge\(\)\}/g)).toHaveLength(2);
    expect(notice).not.toContain("localStorage");
  });

  it("snapshots current claimed members and persists acknowledgement by profile", () => {
    expect(migration).toContain("private.member_app_notice_receipts");
    expect(migration).toContain("join private.profile_pin_credentials credential");
    expect(migration).toContain("'hit-number-tiebreak-2026-09-18'");
    expect(migration).toContain("primary key (profile_id, notice_key)");
    expect(migration).toContain("acknowledged_at = coalesce(receipt.acknowledged_at, now())");
    expect(migration).toContain("to authenticated");
  });

  it("drops down above the app with mobile-safe sizing", () => {
    expect(styles).toContain("position: fixed");
    expect(styles).toContain("z-index: 120");
    expect(styles).toContain("@keyframes hit-number-notice-drop");
    expect(styles).toContain("calc(var(--safe-top) + 12px)");
    expect(styles).toContain("@media (max-width: 420px)");
  });
});
