-- Guarded owner-approved UFC October 31 editorial, no change to matches, odds, locks or Tale of the Tape.
do $ufc_oct31_editorial$
declare
  v_live_id constant text := 'ufc-fight-night-renato-moicano-vs-tom-nolan-2026-10-31';
  v_prep_id constant text := 'ufc-fight-night-moicano-vs-nolan-2026-10-31';
  v_edits jsonb := '[{"bout_id":"main-event-renato-moicano-tom-nolan","preview":"Moicano''s submission game and chain wrestling meet Nolan''s southpaw striking, longer frame, and heavier output. The veteran needs clinches and sustained top control to attack Nolan''s 58% takedown defense, while Nolan needs to punish entries and keep exchanges at range. Over five rounds, the question is whether Moicano can repeatedly close distance without taking damaging counters.","red":["Back-taking and submissions","Chain wrestling against 58% takedown defense","Five-round main-event experience"],"blue":["Four-inch height advantage","Southpaw striking (4.84 significant strikes/min)","Five-fight winning streak"]},{"bout_id":"main-randy-brown-jacobe-smith","preview":"Brown brings a long jab, a 78-inch reach, and years of UFC experience against Smith''s undefeated finishing threat. Smith can shift the matchup with power, southpaw entries, and wrestling, but he must first work inside Brown''s six-inch reach advantage. The key is whether Brown maintains distance or Smith turns entries into clinch work and takedowns.","red":["Six-inch reach advantage","Long jab and distance control","Veteran UFC experience"],"blue":["Four UFC finishes in four bouts","Junior-college wrestling champion","Knockout power at close range"]},{"bout_id":"main-yana-santos-luana-santos","preview":"Yana enters with three straight decision wins and the higher striking output, while Luana threatens with judo trips and submissions. Yana needs to stay upright and control exchanges along the fence; Luana will look to turn clinches into takedowns and top control. The swing factor is whether Luana can consistently reach grappling positions before Yana''s volume wins rounds.","red":["Higher UFC striking volume","Three consecutive decision wins","Veteran clinch striking"],"blue":["Judo trips and top control","Submission chains","2.14 takedowns per 15 minutes"]},{"bout_id":"main-ode-osbourne-cody-durden","preview":"Two southpaws with finishing ability bring opposite routes to victory: Osbourne wants space and Durden wants takedowns. Osbourne''s six-inch reach advantage could punish Durden''s entries, but Durden''s wrestling volume makes the fence a dangerous place to linger. The first sustained clinch may decide whether the pace becomes a grappling grind or a long-range striking battle.","red":["Six-inch reach advantage","Explosive southpaw offense","Knockout and submission finishing threat"],"blue":["High-volume UFC takedowns","Fence wrestling","First-round finishing threat"]},{"bout_id":"main-zachary-reese-mickey-gall","preview":"Reese brings a size advantage, early finishing threat, and the longer reach into a matchup with Gall''s back-taking and submissions. Gall will need clean grappling entries to threaten rear-naked chokes, while Reese can win exchanges at range if he avoids giving up position. The question is whether Gall can extend the fight into sustained grappling before Reese''s fast start takes over.","red":["Three-inch reach advantage","Seven first-round finishes","High-output striking"],"blue":["Rear-naked choke specialist","Back-taking in scrambles","Veteran UFC grappling experience"]},{"bout_id":"main-jean-paul-lebosnoyani-farman-hasanov","preview":"Lebosnoyani''s black-belt jiu-jitsu meets Hasanov''s unbeaten freestyle-wrestling base in a fight likely to hinge on top position. Hasanov needs controlled takedowns that limit submission openings, while Lebosnoyani can turn scrambles into attacking chances rather than accept bottom position. With Hasanov''s UFC sample still limited, the question is whether he can safely control a proven submission threat.","red":["Black-belt jiu-jitsu","Five career submission wins","Six straight welterweight wins"],"blue":["Freestyle wrestling control","Unbeaten professional record","Powerful takedowns (limited UFC sample)"]}]'::jsonb;
  v_saved jsonb;
begin
  if jsonb_array_length(v_edits) <> 6 then raise exception 'Expected six verified UFC fight edits'; end if;

  select payload->'spotlights' into v_saved from public.ufc_pick_prep_packages
  where event_id=v_prep_id for update;
  if found then
    if jsonb_typeof(v_saved) is distinct from 'array' or jsonb_array_length(v_saved)<>6
      or (select count(*) from jsonb_array_elements(v_saved) s
           join jsonb_array_elements(v_edits) e on e->>'bout_id'=s->>'bout_id')<>6 then
      raise exception 'October 31 UFC prep identities drifted; refusing overwrite';
    end if;
    update public.ufc_pick_prep_packages p set payload=jsonb_set(p.payload,'{spotlights}',(
      select jsonb_agg(case when e.v is null then s.v else
        jsonb_set(jsonb_set(jsonb_set(s.v,'{preview}',to_jsonb(e.v->>'preview'),false),
         '{red,edges}',e.v->'red',false),'{blue,edges}',e.v->'blue',false)
        end order by s.ord)
      from jsonb_array_elements(p.payload->'spotlights') with ordinality as s(v,ord)
      left join lateral jsonb_array_elements(v_edits) as e(v) on e.v->>'bout_id'=s.v->>'bout_id'
    ),false) where p.event_id=v_prep_id;
  end if;

  select spotlights into v_saved from public.pick_events where event_id=v_live_id for update;
  if found then
    if jsonb_typeof(v_saved) is distinct from 'array' or jsonb_array_length(v_saved)<>1
      or v_saved #>> '{0,bout_id}' <> 'main-event-renato-moicano-tom-nolan'
      or v_saved #>> '{0,red,fighter_slug}' <> 'renato-moicano'
      or v_saved #>> '{0,blue,fighter_slug}' <> 'tom-nolan' then
      raise exception 'Published October 31 main-event identity drifted; refusing overwrite';
    end if;
    update public.pick_events p set spotlights=(
      select jsonb_agg(case when e.v is null then s.v else
        jsonb_set(jsonb_set(jsonb_set(s.v,'{preview}',to_jsonb(e.v->>'preview'),false),
         '{red,edges}',e.v->'red',false),'{blue,edges}',e.v->'blue',false)
        end order by s.ord)
      from jsonb_array_elements(p.spotlights) with ordinality as s(v,ord)
      left join lateral jsonb_array_elements(v_edits) as e(v) on e.v->>'bout_id'=s.v->>'bout_id'
    ) where p.event_id=v_live_id;
  end if;
end
$ufc_oct31_editorial$;
