-- An add_bout proposal carries the UFC source segment sequence as evidence, but
-- the product contract adds membership first and appends the new fight without
-- moving any existing fight. A source sequence can therefore already be occupied
-- on the published card. Patch only the canonical fight-change owner so it keeps
-- validating the source sequence, then assigns the next unused sequence in that
-- segment when the addition is applied.

do $repair$
declare
  v_definition text;
  v_old constant text := $old$
    if v_segment not in ('prelim', 'main')
      or v_segment_sequence is null
      or v_segment_sequence < 1
      or exists (
        select 1
        from public.pick_bouts sequenced
        where sequenced.event_id = v_event_id
          and sequenced.card_segment = v_segment
          and sequenced.segment_sequence = v_segment_sequence
      ) then
      raise exception 'STALE_STATE: valid unused card segment sequence required';
    end if;
$old$;
  v_new constant text := $new$
    if v_segment not in ('prelim', 'main')
      or v_segment_sequence is null
      or v_segment_sequence < 1 then
      raise exception 'STALE_STATE: valid card segment sequence required';
    end if;

    -- Adding a fight is intentionally append-only. Source order remains durable
    -- in the monitoring proposal and can be approved separately by reorder_card.
    select coalesce(max(sequenced.segment_sequence), 0) + 1
      into v_segment_sequence
    from public.pick_bouts sequenced
    where sequenced.event_id = v_event_id
      and sequenced.card_segment = v_segment;
$new$;
begin
  select pg_catalog.pg_get_functiondef(
    'private.apply_pick_fight_change(text,text,jsonb,text)'::pg_catalog.regprocedure
  ) into v_definition;

  if pg_catalog.strpos(v_definition, v_old) = 0 then
    raise exception 'canonical add_bout segment-sequence guard not found';
  end if;

  v_definition := pg_catalog.replace(v_definition, v_old, v_new);

  if pg_catalog.strpos(v_definition, v_old) <> 0
    or pg_catalog.strpos(v_definition, v_new) = 0 then
    raise exception 'canonical add_bout append repair was incomplete';
  end if;

  execute v_definition;
end;
$repair$;

-- CREATE OR REPLACE preserves ownership and ACLs; reassert the existing private
-- execution boundary explicitly.
revoke all on function private.apply_pick_fight_change(text, text, jsonb, text)
  from public, anon, authenticated, service_role;
