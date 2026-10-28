-- Guard NFL/CFB Wheel grade identity against harmless generational-suffix drift.
-- Exact team + position + full-name identity still wins. A suffix-tolerant lookup is
-- allowed only when it maps to exactly one locked identity for that team/position.

create or replace function private.wheel_football_grade_base_name_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    private.wheel_football_grade_name_key(p_name),
    '(iii|ii|iv|jr|sr|v)$',
    '',
    'g'
  );
$$;

revoke all on function private.wheel_football_grade_base_name_key(text)
from public, anon, authenticated;

create or replace function private.resolve_wheel_football_grade_snapshot(
  p_team_code text,
  p_display_name text,
  p_roster_slot text,
  p_position_abbreviation text
)
returns table(
  hidden_grade numeric,
  grade_version text,
  effective_date date
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_team text := trim(coalesce(p_team_code, ''));
  v_group text := private.wheel_football_position_group(p_roster_slot, p_position_abbreviation);
  v_key text := private.wheel_football_grade_name_key(p_display_name);
  v_base_key text := private.wheel_football_grade_base_name_key(p_display_name);
  v_alias_count integer := 0;
begin
  return query
  select authority.hidden_grade, authority.grade_version, authority.effective_date
  from private.wheel_football_grade_authority authority
  where authority.team_code = v_team
    and authority.position_group = v_group
    and authority.name_key = v_key
    and authority.effective_date <= current_date
  order by authority.effective_date desc
  limit 1;

  if found then
    return;
  end if;

  select count(distinct authority.name_key)
    into v_alias_count
  from private.wheel_football_grade_authority authority
  where authority.team_code = v_team
    and authority.position_group = v_group
    and authority.effective_date <= current_date
    and private.wheel_football_grade_base_name_key(authority.display_name) = v_base_key;

  if v_alias_count = 1 then
    return query
    select authority.hidden_grade, authority.grade_version, authority.effective_date
    from private.wheel_football_grade_authority authority
    where authority.team_code = v_team
      and authority.position_group = v_group
      and authority.effective_date <= current_date
      and private.wheel_football_grade_base_name_key(authority.display_name) = v_base_key
    order by authority.effective_date desc
    limit 1;

    if found then
      return;
    end if;
  end if;

  raise exception
    'Missing locked Wheel grade for team %, group %, player %',
    v_team,
    v_group,
    trim(coalesce(p_display_name, ''));
end;
$$;

revoke all on function private.resolve_wheel_football_grade_snapshot(text,text,text,text)
from public, anon, authenticated;

comment on function private.resolve_wheel_football_grade_snapshot(text,text,text,text) is
  'Resolves exact locked Wheel identity first, then permits an unambiguous generational-suffix variant within the same canonical team and position family.';
