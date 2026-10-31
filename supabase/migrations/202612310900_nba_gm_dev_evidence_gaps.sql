-- Verified no-2025-26 NBA-season contexts are separate from skill baselines.
update private.nba_gm_dev_players set development_profile=development_profile||
jsonb_build_object('breakoutPct',5,'improvePct',17,'declinePct',43,
'maxAnnualGain',least(99-overall,2.1),'careerHeadroom',least(99-overall,2.5),
'maxAnnualLoss',5,'marketVariancePct',10,'sourceKind','prior-nba-season')
where name in ('Tyrese Haliburton','Kyrie Irving','Damian Lillard','Fred VanVleet');
update private.nba_gm_dev_players set development_profile=development_profile||
jsonb_build_object('breakoutPct',4,'improvePct',22,'declinePct',31,
'maxAnnualGain',least(99-overall,2.6),'careerHeadroom',least(99-overall,3),
'maxAnnualLoss',4.3,'marketVariancePct',9,'sourceKind','overseas-2025-26')
where name in ('Mario Hezonja','Trey Lyles');