-- Project the signed-in profile and existing private Picks-owner decision in one canonical identity read.

create or replace function public.get_my_identity_profile()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then null
    else (
      select jsonb_build_object(
        'id', profile.id,
        'display_name', profile.display_name,
        'initials', profile.initials,
        'can_control_picks', public.is_pick_control_owner(profile.id)
      )
      from public.profiles as profile
      where profile.id = auth.uid()
    )
  end
$$;

revoke all on function public.get_my_identity_profile() from public, anon, authenticated;
grant execute on function public.get_my_identity_profile() to authenticated;

comment on function public.get_my_identity_profile() is
  'Returns the authenticated Octagon HQ profile with the canonical private Picks control capability.';

notify pgrst, 'reload schema';
