-- Preserve PR #205's private fixture insert contract while keeping playable decks safe.
alter table private.auction_deck_entries
  alter column public_item set default '{"id":"legacy-private-item","label":"Legacy private item"}'::jsonb,
  alter column rarity_key set default 'legacy-private-fixture',
  alter column grading_inputs set default '{"legacy":true}'::jsonb;

-- Completed fixtures created by trusted database tests predate the explicit grading status.
-- Gameplay completion still writes the isolated pending 0-0 boundary explicitly.
create or replace function private.normalize_auction_grading_status_on_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.lifecycle_state = 'completed'
    and new.grading_status = 'pending'
    and new.challenger_final_score is not null
    and new.recipient_final_score is not null
    and not (
      new.challenger_final_score = 0
      and new.recipient_final_score = 0
      and new.winner_profile_id is null
    )
  then
    new.grading_status := 'graded';
  end if;

  return new;
end;
$$;

create trigger auction_games_normalize_grading_status_on_insert
before insert on private.auction_games
for each row execute function private.normalize_auction_grading_status_on_insert();

revoke all on function private.normalize_auction_grading_status_on_insert()
from public, anon, authenticated;

revoke all on function public.get_auction_participant_state(uuid)
from public, anon;
grant execute on function public.get_auction_participant_state(uuid)
to authenticated;
