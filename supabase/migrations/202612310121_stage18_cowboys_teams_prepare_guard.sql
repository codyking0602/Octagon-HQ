-- Stage 18 follow-up: preserve the existing prepare_auction multiline Draft Room whitelist.
do $$
declare
  v_definition text;
  v_next text;
begin
  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'    ''longhorns-2005'',\n    ''longhorns-teams-2005'',\n    ''cowboys-2007''',
    E'    ''longhorns-2005'',\n    ''longhorns-teams-2005'',\n    ''cowboys-2007'',\n    ''cowboys-teams-2007'''
  );

  if v_next <> v_definition then
    execute v_next;
  end if;
end;
$$;
