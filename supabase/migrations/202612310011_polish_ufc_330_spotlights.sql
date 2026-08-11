-- Replace the two already-reviewed UFC 330 title-fight Spotlight summaries with
-- matchup-specific editorial copy while preserving the existing Spotlight owner,
-- Tale of the Tape values, Watch URLs, and publication path.

update public.pick_event_drafts draft
set spotlights = (
  select jsonb_agg(
    case
      when item #>> '{red,fighter_slug}' = 'islam-makhachev'
        and item #>> '{blue,fighter_slug}' = 'ian-machado-garry'
      then jsonb_set(
        jsonb_set(
          jsonb_set(
            item,
            '{preview}',
            to_jsonb('Islam Makhachev''s pressure and chain wrestling meet Ian Machado Garry''s length, movement, and long-range striking. Makhachev wants to close space, force clinch and mat exchanges, and make Garry carry his weight; Garry''s path is keeping the champion at range and making him chase.'::text),
            false
          ),
          '{red,edges}',
          '["Championship chain wrestling and control","Elite clinch-to-mat pressure","Proven five-round title experience"]'::jsonb,
          false
        ),
        '{blue,edges}',
        '["Four-inch reach and natural size","Mobile long-range striking","Strong anti-wrestling at welterweight"]'::jsonb,
        false
      )
      when item #>> '{red,fighter_slug}' = 'mackenzie-dern'
        and item #>> '{blue,fighter_slug}' = 'gillian-robertson'
      then jsonb_set(
        jsonb_set(
          jsonb_set(
            item,
            '{preview}',
            to_jsonb('Two of the division''s best submission grapplers meet in a title fight where the route to the mat matters as much as the work once it gets there. Mackenzie Dern owns elite pure jiu-jitsu and dangerous transitions; Gillian Robertson brings a more wrestling-driven top game, relentless control, and a historic UFC submission record.'::text),
            false
          ),
          '{red,edges}',
          '["World-class submission grappling","Dangerous sweeps and scramble attacks","Championship five-round experience"]'::jsonb,
          false
        ),
        '{blue,edges}',
        '["Wrestling-led top control","UFC women''s submission record","Relentless pressure from top position"]'::jsonb,
        false
      )
      else item
    end
    order by ordinal
  )
  from jsonb_array_elements(draft.spotlights) with ordinality as spotlight(item, ordinal)
)
where draft.spotlights is not null
  and exists (
    select 1
    from jsonb_array_elements(draft.spotlights) item
    where (item #>> '{red,fighter_slug}', item #>> '{blue,fighter_slug}') in (
      ('islam-makhachev', 'ian-machado-garry'),
      ('mackenzie-dern', 'gillian-robertson')
    )
  );

update public.pick_events event
set spotlights = (
  select jsonb_agg(
    case
      when item #>> '{red,fighter_slug}' = 'islam-makhachev'
        and item #>> '{blue,fighter_slug}' = 'ian-machado-garry'
      then jsonb_set(
        jsonb_set(
          jsonb_set(
            item,
            '{preview}',
            to_jsonb('Islam Makhachev''s pressure and chain wrestling meet Ian Machado Garry''s length, movement, and long-range striking. Makhachev wants to close space, force clinch and mat exchanges, and make Garry carry his weight; Garry''s path is keeping the champion at range and making him chase.'::text),
            false
          ),
          '{red,edges}',
          '["Championship chain wrestling and control","Elite clinch-to-mat pressure","Proven five-round title experience"]'::jsonb,
          false
        ),
        '{blue,edges}',
        '["Four-inch reach and natural size","Mobile long-range striking","Strong anti-wrestling at welterweight"]'::jsonb,
        false
      )
      when item #>> '{red,fighter_slug}' = 'mackenzie-dern'
        and item #>> '{blue,fighter_slug}' = 'gillian-robertson'
      then jsonb_set(
        jsonb_set(
          jsonb_set(
            item,
            '{preview}',
            to_jsonb('Two of the division''s best submission grapplers meet in a title fight where the route to the mat matters as much as the work once it gets there. Mackenzie Dern owns elite pure jiu-jitsu and dangerous transitions; Gillian Robertson brings a more wrestling-driven top game, relentless control, and a historic UFC submission record.'::text),
            false
          ),
          '{red,edges}',
          '["World-class submission grappling","Dangerous sweeps and scramble attacks","Championship five-round experience"]'::jsonb,
          false
        ),
        '{blue,edges}',
        '["Wrestling-led top control","UFC women''s submission record","Relentless pressure from top position"]'::jsonb,
        false
      )
      else item
    end
    order by ordinal
  )
  from jsonb_array_elements(event.spotlights) with ordinality as spotlight(item, ordinal)
)
where event.spotlights is not null
  and exists (
    select 1
    from jsonb_array_elements(event.spotlights) item
    where (item #>> '{red,fighter_slug}', item #>> '{blue,fighter_slug}') in (
      ('islam-makhachev', 'ian-machado-garry'),
      ('mackenzie-dern', 'gillian-robertson')
    )
  );
