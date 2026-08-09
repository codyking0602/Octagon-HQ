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
const august8WatchMomentUpdateMigration = readFileSync(
  "supabase/migrations/202612310007_update_august_8_pick_watch_moment.sql",
  "utf8",
);
const gamrotSalkilldWatchMomentRepair = readFileSync(
  "supabase/migrations/202612310008_force_gamrot_salkilld_watch_moment.sql",
  "utf8",
);
const recapSource = readFileSync("src/features/picks/LatestEventRecap.tsx", "utf8");
const recapCss = readFileSync("src/styles/picks-event-recap.css", "utf8");
const controlCss = readFileSync("src/styles/picks-control.css", "utf8");
const eventAssetsSource = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const shareImageSource = readFileSync("src/features/picks/picksRecapShareImage.ts", "utf8");
const controlSource = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const controlRepositorySource = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");

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

  it("keeps the prior August 8 watch-moment migrations auditable", () => {
    expect(august8WatchMomentMigration).toContain(
      "https://youtu.be/vOnbuPMDJUc?is=pYiX3TKQV0-YEY-f",
    );
    expect(august8WatchMomentUpdateMigration).toContain(
      "https://youtu.be/mLamuYVoc2E?is=XQ3Ozk5j-nUNTj0t",
    );
    expect(august8WatchMomentMigration).not.toContain("create trigger");
    expect(august8WatchMomentUpdateMigration).not.toContain("create trigger");
  });

  it("repairs Gamrot Salkilld through the canonical main-event bout and is safe on fresh databases", () => {
    expect(gamrotSalkilldWatchMomentRepair).toContain(
      "https://youtu.be/mLamuYVoc2E?is=XQ3Ozk5j-nUNTj0t",
    );
    expect(gamrotSalkilldWatchMomentRepair).toContain("join public.pick_bouts bout");
    expect(gamrotSalkilldWatchMomentRepair).toContain("bout.position = 1");
    expect(gamrotSalkilldWatchMomentRepair).toContain("bout.red_fighter_slug = 'mateusz-gamrot'");
    expect(gamrotSalkilldWatchMomentRepair).toContain("bout.blue_fighter_slug = 'quillan-salkilld'");
    expect(gamrotSalkilldWatchMomentRepair).toContain("if v_match_count = 0 then");
    expect(gamrotSalkilldWatchMomentRepair).toContain("watch_moments = jsonb_build_array(v_moment)");
    expect(gamrotSalkilldWatchMomentRepair).not.toContain("status = 'completed'");
    expect(gamrotSalkilldWatchMomentRepair).not.toContain("starts_at >=");
    expect(gamrotSalkilldWatchMomentRepair).not.toContain("create function");
    expect(gamrotSalkilldWatchMomentRepair).not.toContain("create trigger");
    expect(gamrotSalkilldWatchMomentRepair).not.toContain("cron.schedule");
  });

  it("publishes recap input through the existing watch-moment and lifecycle owners", () => {
    expect(controlSource).toContain("RECAP URL");
    expect(controlSource).toContain("PUBLISH EVENT RECAP");
    expect(controlSource).toContain("sends the recap notification to members");
    expect(controlSource.indexOf("setWatchMoments!")).toBeLessThan(controlSource.indexOf("completeEvent(event.eventId)"));
    expect(controlRepositorySource).toContain('client.rpc("set_pick_event_watch_moments"');
    expect(controlRepositorySource).toContain('client.rpc("transition_pick_event"');
    expect(controlRepositorySource).not.toContain("from(\"pick_events\")");
    expect(controlCss).toContain(".picks-control-recap-url");
    expect(controlCss).toContain(".picks-control-recap-preview");
    expect(controlCss).toContain("border-left: 3px solid var(--ufc-red)");
  });

  it("uses the recap page as the one iPhone-safe scrolling owner", () => {
    expect(recapCss).toContain("height: 100dvh");
    expect(recapCss).toContain("min-height: 0");
    expect(recapCss).toContain("overflow-y: scroll");
    expect(recapCss).toContain("touch-action: pan-y");
    expect(recapCss).not.toContain("touch-action: none");
    expect(recapCss).toContain("-webkit-overflow-scrolling: touch");
    expect(recapCss).not.toContain("max-height: min(58dvh, 520px)");
    expect(recapCss).not.toContain("overflow-y: auto");
    expect(recapSource).toContain('data-testid="picks-event-recap-scroll"');
  });

  it("keeps the poster visible and makes the matchup the visual hero beneath it", () => {
    expect(recapSource).toContain('import { pickEventPoster } from "./picksEventAssets"');
    expect(recapSource).toContain("const eventPoster = pickEventPoster(event)");
    expect(recapSource).toContain('className="picks-event-recap__poster"');
    expect(recapSource).toContain('<details className="picks-event-recap__fights">');
    expect(recapSource).toContain("VIEW FIGHTS ›");
    expect(recapSource).toContain("FINAL RESULTS");
    expect(recapSource).not.toContain("ARCHIVED EVENT FINAL");
    expect(recapSource).not.toContain("No lock winner");
    expect(recapSource).not.toMatch(/\/events\/ufc-fight-night/);
    expect(eventAssetsSource).toContain("posterByMainEvent");
    expect(recapCss).toContain("--picks-recap-poster");
    expect(recapCss).toContain("background-size: contain");
    expect(recapCss).toContain("font-size: clamp(13px, 3.8vw, 17px)");
    expect(recapCss).toContain("font-size: clamp(20px, 6vw, 27px)");
  });

  it("uses restrained UFC-red hierarchy without replacing champion gold", () => {
    expect(recapCss).toContain("var(--ufc-red-strong)");
    expect(recapCss).toContain("rgba(210, 10, 10, .48)");
    expect(recapCss).toContain("color: #ffd447");
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
