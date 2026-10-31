-- Evidence-classified 2026 prospects: 23 no NBA 2025-26 season, no guessed ages.
update private.nba_gm_dev_players set development_profile=development_profile||
jsonb_build_object('breakoutPct',21,'improvePct',33,'declinePct',19,
'maxAnnualGain',least(99-overall,5.2),'careerHeadroom',least(99-overall,8),
'maxAnnualLoss',3.9,'marketVariancePct',9,'sourceKind','2026-prospect')
where verified_birth_date is null and name not in
('Tyrese Haliburton','Kyrie Irving','Damian Lillard','Fred VanVleet',
'Mario Hezonja','Trey Lyles');