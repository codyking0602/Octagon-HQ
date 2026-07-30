-- Keep preference evaluation private to the canonical notification publisher.
revoke all on function private.notification_preference_key_for_kind(text)
  from public, anon, authenticated;
revoke all on function private.notification_preference_enabled(uuid, text)
  from public, anon, authenticated;
