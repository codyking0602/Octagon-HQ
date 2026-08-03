-- Auction PR 5: establish one append-only UFC catalog version and its private fields.

alter table private.auction_catalog
  add column if not exists display_description text not null default '',
  add column if not exists generation_weight numeric(8,4) not null default 1 check (generation_weight > 0),
  add column if not exists private_generation_class text not null default 'core',
  add column if not exists grading_inputs jsonb not null default '{}'::jsonb;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version
) values (
  'ufc-auction-2026-08-v1',
  'balanced-rarity-2026-08-v1',
  'ufc-private-grader-2026-08-v1',
  false
);

create or replace function private.seed_auction_catalog_rows(p_rows text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  with raw as (
    select btrim(row_text) as row_text, ordinal
    from regexp_split_to_table(p_rows, E'\r?\n') with ordinality as rows(row_text, ordinal)
    where btrim(row_text) <> ''
  ), parsed as (
    select
      split_part(row_text, '|', 1) as mode_id,
      split_part(row_text, '|', 2) as display_label,
      split_part(row_text, '|', 3)::integer as rarity_band,
      split_part(row_text, '|', 4)::numeric as generation_weight,
      split_part(row_text, '|', 5) as private_generation_class,
      string_to_array(split_part(row_text, '|', 6), ':')::integer[] as scores,
      ordinal
    from raw
  ), offsets as (
    select mode_id, count(*) as prior_count
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
    group by mode_id
  ), numbered as (
    select parsed.*, coalesce(offsets.prior_count, 0)
      + row_number() over (partition by parsed.mode_id order by parsed.ordinal) as item_number
    from parsed
    left join offsets using (mode_id)
  )
  insert into private.auction_catalog (
    content_version, mode_id, item_reference, display_label, display_description,
    rarity_band, generation_weight, private_generation_class, grading_inputs
  )
  select
    'ufc-auction-2026-08-v1', mode_id, mode_id || '-' || item_number,
    display_label, display_label, rarity_band, generation_weight, private_generation_class,
    case when mode_id = 'ultimate-fighter' then jsonb_build_object(
      'overall', scores[1], 'Striking', scores[2], 'Grappling', scores[3],
      'Frame', scores[4], 'Power', scores[5], 'Heart', scores[6]
    ) else jsonb_build_object('overall', scores[1]) end
  from numbered;
end;
$$;

revoke all on function private.seed_auction_catalog_rows(text) from public, anon, authenticated;
