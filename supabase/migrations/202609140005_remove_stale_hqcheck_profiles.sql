-- Remove disposable production WebKit verification identities that survived a
-- failed cleanup. These names are reserved to scripts/verify-pin-auth-live.mjs;
-- deleting the Auth users cascades through public.profiles and PIN credentials.

delete from auth.users user_row
where user_row.id in (
  select profile.id
  from public.profiles profile
  where profile.normalized_name ~ '^HQCHECK[0-9]+$'
)
or lower(user_row.email) ~ '^hqcheck-[0-9]+@login\.octagon-hq\.app$';
