-- Hotfix CFB Wheel locked-grade lookup.
-- CFB team codes are canonical lowercase school ids while NFL codes are uppercase.
-- Preserve the exact stored team key instead of forcing all lookups to uppercase.

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

  if not found then
    raise exception
      'Missing locked Wheel grade for team %, group %, player %',
      v_team,
      v_group,
      trim(coalesce(p_display_name, ''));
  end if;
end;
$$;

revoke all on function private.resolve_wheel_football_grade_snapshot(text,text,text,text)
from public, anon, authenticated;

comment on function private.resolve_wheel_football_grade_snapshot(text,text,text,text) is
  'Resolves the private locked Wheel grade snapshot using the canonical stored NFL or CFB team key without changing its case.';
