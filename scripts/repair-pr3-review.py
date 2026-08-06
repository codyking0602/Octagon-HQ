from pathlib import Path

MIGRATION = Path("supabase/migrations/202609140001_canonical_pick_fight_change_semantics.sql")
TEST = Path("supabase/tests/pick_monitoring_canonical_fight_changes.sql")
WORKFLOW = Path(".github/workflows/repair-pr3-review.yml")
SELF = Path("scripts/repair-pr3-review.py")


def replace_exact(text: str, old: str, new: str, *, count: int = 1) -> str:
    actual = text.count(old)
    if actual != count:
        raise RuntimeError(f"Expected {count} occurrence(s), found {actual}: {old[:120]!r}")
    return text.replace(old, new, count)


migration = MIGRATION.read_text()

migration = replace_exact(
    migration,
    "  v_profile_ids jsonb := '[]'::jsonb;\n  v_profile_id uuid;",
    "  v_profile_ids jsonb := '[]'::jsonb;\n  v_invalidated_picks jsonb := '[]'::jsonb;\n  v_profile_id uuid;",
)

migration = replace_exact(
    migration,
    """    select count(*)::integer,
      coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
    into v_invalidated, v_profile_ids
    from (
      select pick.profile_id
      from public.profile_event_picks pick
      where pick.event_id = v_event_id
        and pick.bout_id = v_bout_id
      order by pick.profile_id
    ) affected;
""",
    """    select count(*)::integer,
      coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb),
      coalesce(jsonb_agg(to_jsonb(pick.profile_id) order by pick.profile_id), '[]'::jsonb)
    into v_invalidated, v_invalidated_picks, v_profile_ids
    from public.profile_event_picks pick
    where pick.event_id = v_event_id
      and pick.bout_id = v_bout_id;
""",
)

migration = replace_exact(
    migration,
    """      'invalidated_pick_count', v_invalidated,
      'invalidated_profile_ids', v_profile_ids
""",
    """      'invalidated_pick_count', v_invalidated,
      'invalidated_picks', v_invalidated_picks,
      'invalidated_profile_ids', v_profile_ids
""",
    count=2,
)

migration = replace_exact(
    migration,
    """  if v_audit_id is not null then
    update public.pick_card_change_actions
    set receipt = v_receipt
    where action_id = v_audit_id;
  end if;

  v_receipt := v_receipt || jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'finding_resolved', true
  );

  update public.pick_monitoring_findings
""",
    """  v_audit_id := coalesce(
    v_audit_id,
    nullif(v_receipt->>'audit_id', '')::bigint
  );
  v_receipt := v_receipt || jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'finding_resolved', true
  );

  if v_audit_id is not null then
    update public.pick_card_change_actions
    set receipt = v_receipt
    where action_id = v_audit_id;
  end if;

  update public.pick_monitoring_findings
""",
)

MIGRATION.write_text(migration)

test = TEST.read_text()

test = replace_exact(
    test,
    """    or v_receipt->>'notification_count' <> '2' then
    raise exception 'replacement repick contract is not deterministic: %',
      v_receipt;
  end if;

  begin
""",
    """    or v_receipt->>'notification_count' <> '2'
    or not exists (
      select 1
      from public.pick_card_change_actions
      where action_id = v_action
        and jsonb_array_length(before_state->'invalidated_picks') = 2
        and before_state->'invalidated_picks' @> jsonb_build_array(
          jsonb_build_object(
            'profile_id', v_member,
            'fighter_slug', 'replace-picked-red'
          )
        )
        and before_state->'invalidated_picks' @> jsonb_build_array(
          jsonb_build_object(
            'profile_id', v_other,
            'fighter_slug', 'replace-picked-blue'
          )
        )
    ) then
    raise exception 'replacement repick contract is not deterministic: %',
      v_receipt;
  end if;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_repeat := public.get_current_pick_event();
  if not exists (
    select 1
    from jsonb_array_elements(v_repeat->'bouts') item
    where item->>'bout_id' = 'replace-picked'
      and coalesce((item->>'repick_required')::boolean, false)
  ) then
    raise exception 'replacement no longer projects REPICK REQUIRED to the affected player';
  end if;
  perform set_config('request.jwt.claim.sub', v_owner::text, true);

  begin
""",
)

test = replace_exact(
    test,
    """    or not exists (
      select 1 from public.pick_monitoring_findings
      where finding_id = v_finding
        and review_status = 'reviewed'
        and approval_receipt = v_receipt
    )
    or (
""",
    """    or not exists (
      select 1 from public.pick_monitoring_findings
      where finding_id = v_finding
        and review_status = 'reviewed'
        and approval_receipt = v_receipt
    )
    or not exists (
      select 1 from public.pick_card_change_actions
      where action_id = (v_receipt->>'audit_id')::bigint
        and receipt = v_receipt
    )
    or (
""",
)

TEST.write_text(test)

# Remove the temporary repair mechanism from the branch in the same commit that
# applies the reviewed source/test repair.
WORKFLOW.unlink(missing_ok=True)
SELF.unlink(missing_ok=True)
