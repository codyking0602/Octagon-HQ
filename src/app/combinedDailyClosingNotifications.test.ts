import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202612310291_combine_cross_sport_closing_notifications.sql",
  "utf8",
);
const ufcProducer = readFileSync(
  "supabase/migrations/202609070001_generalize_daily_challenge_reminders.sql",
  "utf8",
);
const mlbProducer = readFileSync(
  "supabase/migrations/202612310192_mlb_notifications.sql",
  "utf8",
);

describe("one closing-soon alert across UFC, Football and MLB", () => {
  it("leaves the established independent reminder producers intact", () => {
    expect(ufcProducer).toContain("daily_challenge_four_hours");
    expect(mlbProducer).toContain("mlb_challenge_four_hours");
    expect(sql).not.toContain("create or replace function public.dispatch_due");
    expect(sql).not.toContain("cron.schedule");
    expect(sql).not.toContain("net.http_post");
  });

  it("routes only the two closing-reminder kinds through shared publishing", () => {
    expect(sql).toContain("'daily_challenge_four_hours', 'mlb_challenge_four_hours'");
    expect(sql).toContain("private.publish_combined_daily_closing_reminder(");
    expect(sql).toContain("private.publish_notification_to_profile_ufc_recap_core(");
    expect(sql).toContain("'event_ready_to_complete'");
  });

  it("produces one idempotent push candidate and bell row per member/day", () => {
    expect(sql).toContain("'daily-closing-combined:' || v_day::text || ':' || p_recipient_profile_id::text");
    expect(sql).toContain("'daily-closing-combined',");
    expect(sql).toContain("'daily_challenge_four_hours',");
    expect(sql).toContain("Daily challenges close soon");
    expect(sql).toContain("v_route := '/'");
    expect(sql).toContain("event.source_key like 'daily-challenge-four-hours:%'");
    expect(sql).toContain("event.source_key like 'mlb-challenge-four-hours:%'");
  });

  it("only lists the unfinished games actually closing tonight", () => {
    expect(sql).toContain("v_time >= time '20:00' and v_time < time '21:00'");
    expect(sql).toContain("attempt.attempt_kind = 'official_first'");
    expect(sql).toContain("season.public_enabled");
    expect(sql).toContain("v_next_mlb_day = v_day + 1");
    expect(sql).toContain("public.mlb_postseason_challenge_results");
    expect(sql).toContain("v_total = 1");
    expect(sql).toContain("v_title := p_title");
    expect(sql).toContain("return jsonb_build_object('id', null, 'aggregate_count', 0, 'created', false, 'suppressed', true)");
  });
});
