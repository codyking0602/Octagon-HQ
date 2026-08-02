create or replace function public.get_my_identity_profile()
returns table (
  id uuid,
  display_name text,
  initials text,
  can_control_picks boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id,
         profile.display_name,
         profile.initials,
         public.is_pick_control_owner(profile.id)
    from public.profiles as profile
   where auth.uid() is not null
     and profile.id = auth.uid();
$$;

revoke all on function public.get_my_identity_profile() from public, anon;
grant execute on function public.get_my_identity_profile() to authenticated;
