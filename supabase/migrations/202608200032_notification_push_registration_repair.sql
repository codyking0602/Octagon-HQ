-- Repair the existing per-device push registration boundary without introducing a second owner.
-- The original notification push migration still owns storage, RPC behavior, and delivery.

-- Fail deployment clearly if the canonical registration functions are not present.
do $$
begin
  if to_regprocedure('public.get_my_notification_push_status(text)') is null then
    raise exception 'get_my_notification_push_status(text) is missing';
  end if;
  if to_regprocedure('public.register_my_notification_push_subscription(text,text,text,text)') is null then
    raise exception 'register_my_notification_push_subscription(text,text,text,text) is missing';
  end if;
  if to_regprocedure('public.remove_my_notification_push_subscription(text)') is null then
    raise exception 'remove_my_notification_push_subscription(text) is missing';
  end if;
end;
$$;

-- Reassert browser privileges in case the first deployment reached the database before
-- PostgREST refreshed its function cache.
revoke all on function public.get_my_notification_push_status(text) from public, anon;
revoke all on function public.register_my_notification_push_subscription(text, text, text, text) from public, anon;
revoke all on function public.remove_my_notification_push_subscription(text) from public, anon;

grant execute on function public.get_my_notification_push_status(text) to authenticated;
grant execute on function public.register_my_notification_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.remove_my_notification_push_subscription(text) to authenticated;

comment on function public.register_my_notification_push_subscription(text, text, text, text)
  is 'Canonical signed-in device registration owner for Octagon HQ Web Push subscriptions.';

notify pgrst, 'reload schema';
