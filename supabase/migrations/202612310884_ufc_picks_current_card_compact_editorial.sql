-- Owner-approved Oct 27 UFC editorial refresh, not a card/odds/picks mutation.
-- Published main-event spotlight and six retained main-card prep spotlights only.
do $ufc_editorial$
declare
  v_edits jsonb := '{"main-event-renato-moicano-tom-nolan":{"preview":"Moicano’s chain wrestling and submission game collide with Nolan’s long-range southpaw striking. Moicano needs to close distance, chain takedowns and attack the back; Nolan must punish entries and keep the fight in open space, especially against the fence. Over five rounds, the key is whether Nolan can maintain that separation as Moicano’s pressure accumulates.","red":["Submission threat and back takes","Chain wrestling and takedown entries","Five-round UFC experience"],"blue":["Four-inch height advantage","Southpaw range striking","Higher significant-strike volume"]},"main-randy-brown-jacobe-smith":{"preview":"Brown’s long jab and six-inch reach advantage test Smith’s unbeaten finishing momentum. Brown needs to keep the fight at long range and make Smith pay for aggressive entries; Smith can change the matchup with southpaw power, clinch work and wrestling. The key is whether Brown can prevent Smith from turning brief exchanges into sustained pressure.","red":["Six-inch reach advantage","Experienced distance management","Takedown defense"],"blue":["Powerful southpaw entries","Junior-college wrestling pedigree","Early UFC finishing streak"]},"main-yana-santos-luana-santos":{"preview":"Yana Santos brings higher striking volume and veteran clinch experience, while Luana Santos threatens with judo trips and submissions. Yana needs to maintain her striking rhythm without giving up the fence; Luana wants close contact and top control rather than extended exchanges at range. This fight hinges on who chooses where the first sustained exchange happens.","red":["Higher significant-strike volume","Clinch striking and pressure","Three straight decision victories"],"blue":["Judo trips and takedowns","Submission threat","Strong takedown defense"]},"main-ode-osbourne-cody-durden":{"preview":"Osbourne has the reach to keep fellow southpaw Durden at long striking range, but Durden’s wrestling can collapse that space. Osbourne needs to catch entries and exit cleanly; Durden wants clinches, takedowns and prolonged top control. The decisive question is whether Osbourne can defend repeated shots without surrendering the initiative.","red":["Six-inch reach advantage","Explosive southpaw striking","Finishing versatility"],"blue":["Wrestling pace and takedowns","Clinch and cage control","Early-round finishing threat"]},"main-zachary-reese-mickey-gall":{"preview":"Reese brings the bigger frame and fast finishing pace, while Gall’s most dangerous path runs through back control and submissions. Reese needs to maintain range and avoid scrambling into bad positions; Gall must turn striking exchanges into clinches or takedowns. The central battle is whether Gall can slow Reese before early damage builds.","red":["Size and reach advantage","Fast-starting finishing threat","High significant-strike volume"],"blue":["Rear-naked choke submissions","Scramble and back-taking game","Veteran grappling experience"]},"main-jean-paul-lebosnoyani-farman-hasanov":{"preview":"Lebosnoyani’s submission-focused jiu-jitsu meets Hasanov’s undefeated freestyle-wrestling base. Lebosnoyani needs to create movement and attack transitions rather than accept pinned bottom position; Hasanov wants clean takedowns and safe top control. With limited UFC evidence for Hasanov, the key is whether his wrestling control holds when Lebosnoyani starts forcing grappling exchanges.","red":["BJJ black belt","Submission attack in scrambles","Six-fight welterweight win streak"],"blue":["Unbeaten freestyle wrestler","Powerful takedown entries","Three-inch reach advantage"]}}'::jsonb;
  v_live jsonb;
  v_prep jsonb;
  v_live_updated jsonb;
  v_prep_updated jsonb;
  v_count integer;
begin
  select spotlights into v_live from public.pick_events
    where event_id='ufc-fight-night-renato-moicano-vs-tom-nolan-2026-10-31'
    and status='upcoming' for update;
  select payload->'spotlights' into v_prep from public.ufc_pick_prep_packages
    where event_id='ufc-fight-night-moicano-vs-nolan-2026-10-31'
    and status='review-needed' for update;
  if jsonb_typeof(v_live) is distinct from 'array'
    or jsonb_array_length(v_live) <> 1
    or v_live->0->>'bout_id' <> 'main-event-renato-moicano-tom-nolan'
    or jsonb_typeof(v_prep) is distinct from 'array'
    or jsonb_array_length(v_prep) <> 6
  then raise exception 'Oct 31 UFC live/prep editorial count or identity changed'; end if;

  select count(*) into v_count from jsonb_array_elements(v_prep) s
    where v_edits ? (s->>'bout_id');
  if v_count <> 6 or
     (select count(distinct s->>'bout_id') from jsonb_array_elements(v_prep) s) <> 6
  then raise exception 'Oct 31 UFC prep main-card identity set changed'; end if;
  if v_live->0->>'preview' not like 'Moicano%veteran Brazilian jiu-jitsu%'
    and v_live->0->>'preview' <> v_edits->'main-event-renato-moicano-tom-nolan'->>'preview'
  then raise exception 'Oct 31 published main-event preview was independently edited'; end if;

  select jsonb_agg(
    jsonb_set(jsonb_set(jsonb_set(s,'{preview}',v_edits->(s->>'bout_id')->'preview',false),
      '{red,edges}',v_edits->(s->>'bout_id')->'red',false),
      '{blue,edges}',v_edits->(s->>'bout_id')->'blue',false) order by ord)
    into v_prep_updated
    from jsonb_array_elements(v_prep) with ordinality as parts(s,ord);
  select jsonb_agg(
    jsonb_set(jsonb_set(jsonb_set(s,'{preview}',v_edits->(s->>'bout_id')->'preview',false),
      '{red,edges}',v_edits->(s->>'bout_id')->'red',false),
      '{blue,edges}',v_edits->(s->>'bout_id')->'blue',false) order by ord)
    into v_live_updated
    from jsonb_array_elements(v_live) with ordinality as parts(s,ord);

  update public.ufc_pick_prep_packages
    set payload=jsonb_set(payload,'{spotlights}',v_prep_updated,false)
    where event_id='ufc-fight-night-moicano-vs-nolan-2026-10-31'
      and status='review-needed';
  update public.pick_events set spotlights=v_live_updated
    where event_id='ufc-fight-night-renato-moicano-vs-tom-nolan-2026-10-31'
      and status='upcoming';
end;
$ufc_editorial$;
