-- Stage 12 admin playtest: grant the existing TEST profile the canonical owner capability.
-- Draft Room intentionally reuses public.is_pick_control_owner/profile canControlPicks as its
-- single preview gate, so this does not add a second access path.

insert into public.pick_control_owners (profile_id)
select profile.id
from public.profiles as profile
where profile.id = 'c8b9d8a2-22a6-44cf-8a5f-3287d151f025'::uuid
  and profile.display_name = 'TEST'
on conflict (profile_id) do nothing;
