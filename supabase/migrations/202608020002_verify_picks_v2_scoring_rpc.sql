-- Fail the deployment if the scoring migration did not create the browser RPCs.
do $$
begin
  if to_regprocedure('public.get_my_event_underdog_lock(text)') is null then
    raise exception 'missing get_my_event_underdog_lock(text)';
  end if;
  if to_regprocedure('public.set_my_event_underdog_lock(text,text,text)') is null then
    raise exception 'missing set_my_event_underdog_lock(text,text,text)';
  end if;
  if to_regprocedure('public.clear_my_event_underdog_lock(text)') is null then
    raise exception 'missing clear_my_event_underdog_lock(text)';
  end if;
  if to_regprocedure('public.get_my_pick_summary(integer)') is null then
    raise exception 'missing get_my_pick_summary(integer)';
  end if;
end $$;

-- Publish the new function signatures to PostgREST immediately after commit.
notify pgrst, 'reload schema';
