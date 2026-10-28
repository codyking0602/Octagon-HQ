-- Draft-only NBA launch and closing reminders. Called by the existing scheduler,
-- never through a separate cron. The release gate defaults to FALSE.
create or replace function public.dispatch_due_nba_notifications(p_now timestamptz default now())
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_day date := (p_now at time zone 'America/Chicago')::date;
  v_clock time := (p_now at time zone 'America/Chicago')::time;
  v_start date;
  v_game private.daily_challenges;
  v_recipient record;
  v_launch integer := 0;
  v_closing integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'NBA notification dispatcher requires service role';
  end if;
  if not exists (select 1 from private.notification_nba_release_gate
                 where singleton and public_enabled) then
    return jsonb_build_object('status','release_not_ready','launch',0,'closing',0);
  end if;
  if v_day < date '2026-11-01' or v_day > date '2027-04-12' then
    return jsonb_build_object('status','outside_season','launch',0,'closing',0);
  end if;

  -- One Nov 1 announcement, not earlier than 8 AM Central. Never preview-only.
  if v_day = date '2026-11-01' and v_clock >= time '08:00'
     and exists (
       select 1 from private.daily_challenges daily
       join private.daily_challenge_schedule_versions schedule
         on schedule.version = daily.schedule_version
       where daily.central_day = date '2026-11-01'
         and schedule.sport = 'nba' and schedule.version = 'nba-daily-regular-v1'
     )
  then
    for v_recipient in
      select profile.id from public.profiles profile
      join private.profile_pin_credentials credential on credential.profile_id = profile.id
    loop
      perform private.publish_notification_to_profile(
        v_recipient.id,'nba-launch:2026-11-01','nba-launch:2026',
        'nba_launch_available','NBA is live in The HQ',
        'Basketball has arrived. Explore NBA HQ and play your first official Daily challenge.',
        '/nba','EXPLORE NBA',p_now);
      v_launch := v_launch + 1;
    end loop;
  end if;

  -- Nov 2, 4, 6 ... at 8 PM Central; never send on the opening day.
  if v_day >= date '2026-11-02'
     and (v_day - date '2026-11-01') % 2 = 1
     and v_clock >= time '20:00' and v_clock < time '21:00'
  then
    v_start := v_day - 1;
    select daily.* into v_game
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day = v_start
      and schedule.sport = 'nba' and schedule.version = 'nba-daily-regular-v1'
    order by daily.published_at desc,daily.id desc limit 1;

    if v_game.id is not null then
      for v_recipient in
        select profile.id from public.profiles profile
        join private.profile_pin_credentials credential on credential.profile_id = profile.id
        where not exists (
          select 1 from private.daily_challenge_attempts attempt
          where attempt.daily_challenge_id = v_game.id
            and attempt.profile_id = profile.id and attempt.attempt_kind = 'official_first'
        )
      loop
        perform private.publish_notification_to_profile(
          v_recipient.id,'nba-daily-close:' || v_start::text,
          'nba-daily-close:' || v_start::text,
          'nba_daily_four_hours','NBA Daily closes soon',
          'Your NBA Daily challenge closes at midnight Central. Play before the next challenge goes live.',
          '/nba','PLAY NBA DAILY',p_now);
        v_closing := v_closing + 1;
      end loop;
    end if;
  end if;
  return jsonb_build_object('status','checked','launch',v_launch,'closing',v_closing);
end;
$fn$;

revoke all on function public.dispatch_due_nba_notifications(timestamptz)
  from public,anon,authenticated;
grant execute on function public.dispatch_due_nba_notifications(timestamptz)
  to service_role;
comment on function public.dispatch_due_nba_notifications(timestamptz) is
  'NBA launch Nov 1, and one opt-in push-eligible Daily closing reminder per 48-hour board; never preview.';
