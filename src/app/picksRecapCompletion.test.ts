import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608240002_complete_picks_event_recaps.sql",
  "utf8",
);
const august8WatchMomentMigration = readFileSync(
  "supabase/migrations/202612310006_seed_august_8_pick_watch_moment.sql",
  "utf8",
);
const recapSource = readFileSync("src/features/picks/LatestEventRecap.tsx", "utf8");
const recapCss = readFileSync("src/styles/picks-event-recap.css", "utf8");
const shareImageSource = readFileSync("src/features/picks/picksRecapShareImage.ts", "utf8");

describe("completed Picks event recaps", () => {
  it("keeps watch moments on the canonical event and existing projection owners", () => {
    expect(migration).toContain("add column if not exists watch_moments jsonb");
    expect(migration).toContain("public.set_pick_event_watch_moments");
    expect(migration).toContain("private.get_my_pick_history_core");
    expect(migration).toContain("create function public.get_my_pick_history");
    expect(migration).toContain("private.get_pick_control_event_core");
    expect(migration).toContain("create function public.get_pick_control_event");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("cron.schedule");
  });

  it("seeds the supplied Belgrade moment without hard-coding the event ID", () => {
    expect(migration).toContain("https://youtu.be/9Gm3-DqFwHU?is=qew5ZTS2wIM1ubK-");
    expect(migration).toContain("lower(subtitle) like '%rodriguez%'");
    expect(migration).not.toMatch(/where event_id\s*=\s*'ufc-fight-night-belgrade'/i);
  });

  it("seeds Cody's August 8 Must-Watch Moment onto the existing completed event field only", () => {
    expect(august8WatchMomentMigration).toContain(
      "https://youtu.be/vOnbuPMDJUc?is=pYiX3TKQV0-YEY-f",
    );
    expect(august8WatchMomentMigration).toContain("status = 'completed'");
    expect(august8WatchMomentMigration).toContain("2026-08-08 00:00:00+00");
    expect(august8WatchMomentMigration).toContain("2026-08-10 00:00:00+00");
    expect(august8WatchMomentMigration).toContain("set watch_moments = case");
    expect(august8WatchMomentMigration).toContain("jsonb_array_elements(watch_moments)");
    expect(august8WatchMomentMigration).not.toContain("create function");
    expect(august8WatchMomentMigration).not.toContain("create trigger");
    expect(august8WatchMomentMigration).not.toContain("cron.schedule");
  });

  it("uses one explicit iPhone-safe scrolling owner", () => {
    expect(recapCss).toContain("height: 100dvh");
    expect(recapCss).toContain("min-height: 0");
    expect(recapCss).toContain("overflow-y: scroll");
    expect(recapCss).toContain("touch-action: pan-y");
    expect(recapCss).not.toContain("touch-action: none");
    expect(recapCss).toContain("-webkit-overflow-scrolling: touch");
    expect(recapSource).toContain('data-testid="picks-event-recap-scroll"');
  });

  it("places watch moments before the final table and shares a universal image", () => {
    expect(recapSource.indexOf("picks-event-recap__moments")).toBeGreaterThan(
      recapSource.indexOf("picks-event-recap__stories"),
    );
    expect(recapSource.indexOf("picks-event-recap__moments")).toBeLessThan(
      recapSource.indexOf("picks-event-recap__standings"),
    );
    expect(recapSource).toContain("createPicksRecapShareImage");
    expect(recapSource).not.toContain("event.record.correct}-${event.record.incorrect}");
    expect(shareImageSource).toContain("FINAL STANDINGS");
    expect(shareImageSource).toContain("VIEW YOUR EVENT RECAP");
    expect(shareImageSource).not.toContain("isCurrentUser");
  });
});