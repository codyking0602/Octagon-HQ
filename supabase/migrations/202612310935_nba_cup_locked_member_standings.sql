-- NBA Cup group picks become comparable only once the 2026 owner lock is active.
-- The table remains RLS-protected and inaccessible directly to members.
create or replace function public.get_nba_cup_group_standings_2026()
returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare
  v_profile uuid := auth.uid();
  v_locked boolean;
begin
  if v_profile is null or not exists (
    select 1 from public.profiles where id = v_profile
  ) then raise exception 'sign_in_required'; end if;

  select manually_locked into v_locked
    from public.nba_cup_group_preview_lock_2026 where season = 2026;
  if not coalesce(v_locked, false) then
    return jsonb_build_object('locked', false, 'entries', '[]'::jsonb);
  end if;

  return jsonb_build_object(
    'locked', true,
    'entries', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'profile_id', entry.profile_id,
          'display_name', member.display_name,
          'picks', entry.picks
        ) order by member.display_name
      )
      from public.nba_cup_group_preview_2026 entry
      join public.profiles member on member.id = entry.profile_id
      where entry.picks <> '{}'::jsonb
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_nba_cup_group_standings_2026()
  from public, anon, authenticated;
grant execute on function public.get_nba_cup_group_standings_2026()
  to authenticated;
notify pgrst, 'reload schema';
