-- Auction PR 5: one real UFC-only catalog and fixed private grader.

alter table private.auction_catalog
  add column display_description text,
  add column generation_weight numeric(8,4) not null default 1 check (generation_weight > 0),
  add column private_generation_class text not null default 'core',
  add column grading_inputs jsonb not null default '{}'::jsonb;

insert into private.auction_catalog_versions(content_version, rarity_version, grading_version, is_preparation_version)
values ('ufc-auction-2026-08-v1','balanced-rarity-2026-08-v1','ufc-private-grader-2026-08-v1',false);

insert into private.auction_catalog(content_version,mode_id,item_reference,display_label,display_description,rarity_band,generation_weight,grading_inputs)
select 'ufc-auction-2026-08-v1', v.* from (values
  ('ultimate-fighter','ultimate-fighter-1','Jon Jones','Jon Jones',5,0.05,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-2','Anderson Silva','Anderson Silva',4,0.35,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-3','Khabib Nurmagomedov','Khabib Nurmagomedov',4,0.35,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-4','Francis Ngannou','Francis Ngannou',3,0.35,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-5','Max Holloway','Max Holloway',3,0.35,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-6','Georges St-Pierre','Georges St-Pierre',3,0.35,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-7','Demetrious Johnson','Demetrious Johnson',3,0.35,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-8','José Aldo','José Aldo',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-9','Israel Adesanya','Israel Adesanya',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-10','Alex Pereira','Alex Pereira',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-11','Islam Makhachev','Islam Makhachev',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-12','Charles Oliveira','Charles Oliveira',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-13','Alexander Volkanovski','Alexander Volkanovski',2,1.00,'{"overall": 60, "Striking": 60, "Grappling": 56, "Frame": 52, "Power": 48, "Heart": 60}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-14','Daniel Cormier','Daniel Cormier',2,1.00,'{"overall": 57, "Striking": 53, "Grappling": 49, "Frame": 45, "Power": 57, "Heart": 54}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-15','Stipe Miocic','Stipe Miocic',2,1.00,'{"overall": 55, "Striking": 47, "Grappling": 45, "Frame": 55, "Power": 51, "Heart": 49}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-16','Amanda Nunes','Amanda Nunes',2,1.00,'{"overall": 55, "Striking": 45, "Grappling": 55, "Frame": 51, "Power": 47, "Heart": 55}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-17','Valentina Shevchenko','Valentina Shevchenko',2,1.00,'{"overall": 55, "Striking": 55, "Grappling": 51, "Frame": 47, "Power": 45, "Heart": 52}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-18','Joanna Jędrzejczyk','Joanna Jędrzejczyk',2,1.00,'{"overall": 55, "Striking": 51, "Grappling": 47, "Frame": 45, "Power": 55, "Heart": 49}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-19','Dustin Poirier','Dustin Poirier',2,1.00,'{"overall": 55, "Striking": 47, "Grappling": 45, "Frame": 55, "Power": 51, "Heart": 55}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-20','Justin Gaethje','Justin Gaethje',2,1.00,'{"overall": 55, "Striking": 45, "Grappling": 55, "Frame": 51, "Power": 47, "Heart": 52}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-21','Robert Whittaker','Robert Whittaker',2,1.00,'{"overall": 55, "Striking": 55, "Grappling": 51, "Frame": 47, "Power": 45, "Heart": 49}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-22','Leon Edwards','Leon Edwards',2,1.00,'{"overall": 55, "Striking": 51, "Grappling": 47, "Frame": 45, "Power": 55, "Heart": 55}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-23','Tom Aspinall','Tom Aspinall',2,1.00,'{"overall": 55, "Striking": 47, "Grappling": 45, "Frame": 55, "Power": 51, "Heart": 52}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-24','Merab Dvalishvili','Merab Dvalishvili',2,1.00,'{"overall": 55, "Striking": 45, "Grappling": 55, "Frame": 51, "Power": 47, "Heart": 49}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-25','Stephen Thompson','Stephen Thompson',2,1.00,'{"overall": 55, "Striking": 55, "Grappling": 51, "Frame": 47, "Power": 45, "Heart": 55}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-26','Demian Maia','Demian Maia',2,1.00,'{"overall": 55, "Striking": 51, "Grappling": 47, "Frame": 45, "Power": 55, "Heart": 52}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-27','Anthony Johnson','Anthony Johnson',2,1.00,'{"overall": 55, "Striking": 47, "Grappling": 45, "Frame": 55, "Power": 51, "Heart": 49}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-28','Chuck Liddell','Chuck Liddell',2,1.00,'{"overall": 55, "Striking": 45, "Grappling": 55, "Frame": 51, "Power": 47, "Heart": 55}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-29','Tony Ferguson','Tony Ferguson',2,1.00,'{"overall": 55, "Striking": 55, "Grappling": 51, "Frame": 47, "Power": 45, "Heart": 52}'::jsonb),
  ('ultimate-fighter','ultimate-fighter-30','Brock Lesnar','Brock Lesnar',2,1.00,'{"overall": 55, "Striking": 51, "Grappling": 47, "Frame": 45, "Power": 55, "Heart": 49}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-1','vs Maurício Rua — UFC 128 title win','vs Maurício Rua — UFC 128 title win',5,0.45,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-2','vs Lyoto Machida — UFC 140 submission','vs Lyoto Machida — UFC 140 submission',4,0.45,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-3','vs Alexander Gustafsson — UFC 165','vs Alexander Gustafsson — UFC 165',4,0.45,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-4','vs Daniel Cormier — UFC 182','vs Daniel Cormier — UFC 182',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-5','vs Glover Teixeira — UFC 172','vs Glover Teixeira — UFC 172',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-6','vs Quinton Jackson — UFC 135','vs Quinton Jackson — UFC 135',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-7','vs Chael Sonnen — UFC 159','vs Chael Sonnen — UFC 159',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-8','vs Vitor Belfort — UFC 152','vs Vitor Belfort — UFC 152',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-9','vs Rashad Evans — UFC 145','vs Rashad Evans — UFC 145',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-10','vs Ciryl Gane — UFC 285','vs Ciryl Gane — UFC 285',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-11','vs Stipe Miocic — UFC 309','vs Stipe Miocic — UFC 309',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('jon-jones-performances','jon-jones-performances-12','vs Dominick Reyes — UFC 247','vs Dominick Reyes — UFC 247',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-1','vs José Aldo — UFC 194','vs José Aldo — UFC 194',5,0.45,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-2','vs Eddie Alvarez — UFC 205','vs Eddie Alvarez — UFC 205',4,0.45,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-3','vs Nate Diaz — UFC 202','vs Nate Diaz — UFC 202',4,0.45,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-4','vs Chad Mendes — UFC 189','vs Chad Mendes — UFC 189',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-5','vs Donald Cerrone — UFC 246','vs Donald Cerrone — UFC 246',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-6','vs Dustin Poirier — UFC 178','vs Dustin Poirier — UFC 178',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-7','vs Max Holloway — UFC Fight Night 26','vs Max Holloway — UFC Fight Night 26',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-8','vs Diego Brandão — UFC Fight Night 46','vs Diego Brandão — UFC Fight Night 46',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-9','vs Marcus Brimage — UFC on Fuel TV 9','vs Marcus Brimage — UFC on Fuel TV 9',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-10','vs Dennis Siver — UFC Fight Night 59','vs Dennis Siver — UFC Fight Night 59',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-11','vs Nate Diaz — UFC 196','vs Nate Diaz — UFC 196',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('conor-mcgregor-performances','conor-mcgregor-performances-12','vs Khabib Nurmagomedov — UFC 229','vs Khabib Nurmagomedov — UFC 229',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-1','vs Michael Chandler — UFC 262','vs Michael Chandler — UFC 262',5,0.45,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-2','vs Dustin Poirier — UFC 269','vs Dustin Poirier — UFC 269',4,0.45,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-3','vs Justin Gaethje — UFC 274','vs Justin Gaethje — UFC 274',4,0.45,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-4','vs Beneil Dariush — UFC 289','vs Beneil Dariush — UFC 289',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-5','vs Kevin Lee — UFC Fight Night 170','vs Kevin Lee — UFC Fight Night 170',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-6','vs Tony Ferguson — UFC 256','vs Tony Ferguson — UFC 256',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-7','vs Jared Gordon — UFC Fight Night 164','vs Jared Gordon — UFC Fight Night 164',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-8','vs Jim Miller — UFC on Fox 31','vs Jim Miller — UFC on Fox 31',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-9','vs Clay Guida — UFC 225','vs Clay Guida — UFC 225',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-10','vs Nik Lentz — UFC Fight Night 152','vs Nik Lentz — UFC Fight Night 152',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-11','vs Myles Jury — UFC on Fox 17','vs Myles Jury — UFC on Fox 17',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('charles-oliveira-performances','charles-oliveira-performances-12','vs Will Brooks — UFC 210','vs Will Brooks — UFC 210',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('strikers','strikers-1','Anderson Silva','Anderson Silva',5,0.38,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('strikers','strikers-2','Israel Adesanya','Israel Adesanya',4,0.38,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('strikers','strikers-3','José Aldo','José Aldo',4,0.38,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('strikers','strikers-4','Alex Pereira','Alex Pereira',3,0.38,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('strikers','strikers-5','Stephen Thompson','Stephen Thompson',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('strikers','strikers-6','Max Holloway','Max Holloway',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('strikers','strikers-7','Conor McGregor','Conor McGregor',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('strikers','strikers-8','Joanna Jędrzejczyk','Joanna Jędrzejczyk',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('strikers','strikers-9','Valentina Shevchenko','Valentina Shevchenko',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('strikers','strikers-10','Edson Barboza','Edson Barboza',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('strikers','strikers-11','Dustin Poirier','Dustin Poirier',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('strikers','strikers-12','Cory Sandhagen','Cory Sandhagen',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('grapplers','grapplers-1','Khabib Nurmagomedov','Khabib Nurmagomedov',5,0.38,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('grapplers','grapplers-2','Demian Maia','Demian Maia',4,0.38,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('grapplers','grapplers-3','Charles Oliveira','Charles Oliveira',4,0.38,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('grapplers','grapplers-4','Islam Makhachev','Islam Makhachev',3,0.38,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('grapplers','grapplers-5','Georges St-Pierre','Georges St-Pierre',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('grapplers','grapplers-6','Fabricio Werdum','Fabricio Werdum',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('grapplers','grapplers-7','Ronda Rousey','Ronda Rousey',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('grapplers','grapplers-8','BJ Penn','BJ Penn',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('grapplers','grapplers-9','Frank Mir','Frank Mir',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('grapplers','grapplers-10','Jacaré Souza','Jacaré Souza',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('grapplers','grapplers-11','Aljamain Sterling','Aljamain Sterling',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('grapplers','grapplers-12','Mackenzie Dern','Mackenzie Dern',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('knockout-artists','knockout-artists-1','Francis Ngannou','Francis Ngannou',5,0.38,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('knockout-artists','knockout-artists-2','Anderson Silva','Anderson Silva',4,0.38,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('knockout-artists','knockout-artists-3','Chuck Liddell','Chuck Liddell',4,0.38,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('knockout-artists','knockout-artists-4','Anthony Johnson','Anthony Johnson',3,0.38,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('knockout-artists','knockout-artists-5','Alex Pereira','Alex Pereira',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('knockout-artists','knockout-artists-6','Derrick Lewis','Derrick Lewis',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('knockout-artists','knockout-artists-7','Wanderlei Silva','Wanderlei Silva',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('knockout-artists','knockout-artists-8','Vitor Belfort','Vitor Belfort',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('knockout-artists','knockout-artists-9','Junior dos Santos','Junior dos Santos',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('knockout-artists','knockout-artists-10','Conor McGregor','Conor McGregor',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('knockout-artists','knockout-artists-11','Amanda Nunes','Amanda Nunes',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('knockout-artists','knockout-artists-12','Dan Henderson','Dan Henderson',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('fighter-performances','fighter-performances-1','Anderson Silva vs Forrest Griffin — UFC 101','Anderson Silva vs Forrest Griffin — UFC 101',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('fighter-performances','fighter-performances-2','Conor McGregor vs Eddie Alvarez — UFC 205','Conor McGregor vs Eddie Alvarez — UFC 205',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('fighter-performances','fighter-performances-3','Jon Jones vs Maurício Rua — UFC 128','Jon Jones vs Maurício Rua — UFC 128',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('fighter-performances','fighter-performances-4','Khabib Nurmagomedov vs Edson Barboza — UFC 219','Khabib Nurmagomedov vs Edson Barboza — UFC 219',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('fighter-performances','fighter-performances-5','Max Holloway vs Calvin Kattar — UFC Fight Island 7','Max Holloway vs Calvin Kattar — UFC Fight Island 7',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('fighter-performances','fighter-performances-6','Amanda Nunes vs Cris Cyborg — UFC 232','Amanda Nunes vs Cris Cyborg — UFC 232',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('fighter-performances','fighter-performances-7','Georges St-Pierre vs Josh Koscheck — UFC 124','Georges St-Pierre vs Josh Koscheck — UFC 124',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('fighter-performances','fighter-performances-8','José Aldo vs Chad Mendes — UFC 179','José Aldo vs Chad Mendes — UFC 179',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('fighter-performances','fighter-performances-9','Demetrious Johnson vs Ray Borg — UFC 216','Demetrious Johnson vs Ray Borg — UFC 216',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('fighter-performances','fighter-performances-10','Israel Adesanya vs Paulo Costa — UFC 253','Israel Adesanya vs Paulo Costa — UFC 253',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('fighter-performances','fighter-performances-11','Cody Garbrandt vs Dominick Cruz — UFC 207','Cody Garbrandt vs Dominick Cruz — UFC 207',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('fighter-performances','fighter-performances-12','TJ Dillashaw vs Renan Barão — UFC 173','TJ Dillashaw vs Renan Barão — UFC 173',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-1','Jones vs Gustafsson — UFC 165 main event','Jones vs Gustafsson — UFC 165 main event',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-2','Lawler vs MacDonald — UFC 189 co-main event','Lawler vs MacDonald — UFC 189 co-main event',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-3','McGregor vs Aldo — UFC 194 main event','McGregor vs Aldo — UFC 194 main event',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-4','Nunes vs Cyborg — UFC 232 co-main event','Nunes vs Cyborg — UFC 232 co-main event',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-5','Silva vs Sonnen — UFC 117 main event','Silva vs Sonnen — UFC 117 main event',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-6','Holloway vs Kattar — Fight Island headliner','Holloway vs Kattar — Fight Island headliner',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-7','Gaethje vs Chandler — UFC 268 opener','Gaethje vs Chandler — UFC 268 opener',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-8','Zhang vs Jędrzejczyk — UFC 248 co-main event','Zhang vs Jędrzejczyk — UFC 248 co-main event',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-9','Griffin vs Bonnar — TUF 1 Finale','Griffin vs Bonnar — TUF 1 Finale',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-10','Edgar vs Maynard — UFC 125 main event','Edgar vs Maynard — UFC 125 main event',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-11','Poirier vs Hooker — UFC Vegas 4 headliner','Poirier vs Hooker — UFC Vegas 4 headliner',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('greatest-ufc-card','greatest-ufc-card-12','Adesanya vs Gastelum — UFC 236 co-main event','Adesanya vs Gastelum — UFC 236 co-main event',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('championship-performances','championship-performances-1','Anderson Silva vs Rich Franklin — UFC 64','Anderson Silva vs Rich Franklin — UFC 64',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('championship-performances','championship-performances-2','Jon Jones vs Maurício Rua — UFC 128','Jon Jones vs Maurício Rua — UFC 128',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('championship-performances','championship-performances-3','Conor McGregor vs Eddie Alvarez — UFC 205','Conor McGregor vs Eddie Alvarez — UFC 205',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('championship-performances','championship-performances-4','Amanda Nunes vs Cris Cyborg — UFC 232','Amanda Nunes vs Cris Cyborg — UFC 232',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('championship-performances','championship-performances-5','Khabib Nurmagomedov vs Justin Gaethje — UFC 254','Khabib Nurmagomedov vs Justin Gaethje — UFC 254',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('championship-performances','championship-performances-6','Georges St-Pierre vs Matt Hughes — UFC 65','Georges St-Pierre vs Matt Hughes — UFC 65',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('championship-performances','championship-performances-7','Demetrious Johnson vs Ray Borg — UFC 216','Demetrious Johnson vs Ray Borg — UFC 216',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('championship-performances','championship-performances-8','José Aldo vs Chad Mendes — UFC 179','José Aldo vs Chad Mendes — UFC 179',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('championship-performances','championship-performances-9','Max Holloway vs Brian Ortega — UFC 231','Max Holloway vs Brian Ortega — UFC 231',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('championship-performances','championship-performances-10','Valentina Shevchenko vs Jessica Eye — UFC 238','Valentina Shevchenko vs Jessica Eye — UFC 238',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('championship-performances','championship-performances-11','Israel Adesanya vs Paulo Costa — UFC 253','Israel Adesanya vs Paulo Costa — UFC 253',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('championship-performances','championship-performances-12','BJ Penn vs Diego Sanchez — UFC 107','BJ Penn vs Diego Sanchez — UFC 107',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('finishes','finishes-1','Anderson Silva front-kicks Vitor Belfort — UFC 126','Anderson Silva front-kicks Vitor Belfort — UFC 126',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('finishes','finishes-2','Demetrious Johnson armbar on Ray Borg — UFC 216','Demetrious Johnson armbar on Ray Borg — UFC 216',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('finishes','finishes-3','Conor McGregor stops José Aldo — UFC 194','Conor McGregor stops José Aldo — UFC 194',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('finishes','finishes-4','Jorge Masvidal flying knee on Ben Askren — UFC 239','Jorge Masvidal flying knee on Ben Askren — UFC 239',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('finishes','finishes-5','Jon Jones submits Lyoto Machida — UFC 140','Jon Jones submits Lyoto Machida — UFC 140',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('finishes','finishes-6','Francis Ngannou knocks out Alistair Overeem — UFC 218','Francis Ngannou knocks out Alistair Overeem — UFC 218',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('finishes','finishes-7','Edson Barboza wheel-kicks Terry Etim — UFC 142','Edson Barboza wheel-kicks Terry Etim — UFC 142',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('finishes','finishes-8','Yair Rodríguez elbow on Korean Zombie — UFC Denver','Yair Rodríguez elbow on Korean Zombie — UFC Denver',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('finishes','finishes-9','Leon Edwards head-kicks Kamaru Usman — UFC 278','Leon Edwards head-kicks Kamaru Usman — UFC 278',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('finishes','finishes-10','Ronda Rousey armbars Cat Zingano — UFC 184','Ronda Rousey armbars Cat Zingano — UFC 184',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('finishes','finishes-11','Max Holloway stops José Aldo — UFC 212','Max Holloway stops José Aldo — UFC 212',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('finishes','finishes-12','Charles Oliveira submits Justin Gaethje — UFC 274','Charles Oliveira submits Justin Gaethje — UFC 274',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('dominant-performances','dominant-performances-1','Khabib Nurmagomedov vs Edson Barboza — UFC 219','Khabib Nurmagomedov vs Edson Barboza — UFC 219',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('dominant-performances','dominant-performances-2','Max Holloway vs Calvin Kattar — UFC Fight Island 7','Max Holloway vs Calvin Kattar — UFC Fight Island 7',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('dominant-performances','dominant-performances-3','Anderson Silva vs Forrest Griffin — UFC 101','Anderson Silva vs Forrest Griffin — UFC 101',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('dominant-performances','dominant-performances-4','Georges St-Pierre vs Josh Koscheck — UFC 124','Georges St-Pierre vs Josh Koscheck — UFC 124',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('dominant-performances','dominant-performances-5','Cody Garbrandt vs Dominick Cruz — UFC 207','Cody Garbrandt vs Dominick Cruz — UFC 207',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('dominant-performances','dominant-performances-6','Amanda Nunes vs Raquel Pennington — UFC 224','Amanda Nunes vs Raquel Pennington — UFC 224',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('dominant-performances','dominant-performances-7','Jon Jones vs Glover Teixeira — UFC 172','Jon Jones vs Glover Teixeira — UFC 172',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('dominant-performances','dominant-performances-8','TJ Dillashaw vs Renan Barão — UFC 173','TJ Dillashaw vs Renan Barão — UFC 173',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('dominant-performances','dominant-performances-9','Valentina Shevchenko vs Lauren Murphy — UFC 266','Valentina Shevchenko vs Lauren Murphy — UFC 266',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('dominant-performances','dominant-performances-10','Islam Makhachev vs Charles Oliveira — UFC 280','Islam Makhachev vs Charles Oliveira — UFC 280',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('dominant-performances','dominant-performances-11','José Aldo vs Urijah Faber — UFC 112','José Aldo vs Urijah Faber — UFC 112',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('dominant-performances','dominant-performances-12','Demetrious Johnson vs Kyoji Horiguchi — UFC 186','Demetrious Johnson vs Kyoji Horiguchi — UFC 186',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('wars','wars-1','Robbie Lawler vs Rory MacDonald 2 — UFC 189','Robbie Lawler vs Rory MacDonald 2 — UFC 189',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('wars','wars-2','Zhang Weili vs Joanna Jędrzejczyk — UFC 248','Zhang Weili vs Joanna Jędrzejczyk — UFC 248',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('wars','wars-3','Jon Jones vs Alexander Gustafsson — UFC 165','Jon Jones vs Alexander Gustafsson — UFC 165',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('wars','wars-4','Dan Henderson vs Maurício Rua — UFC 139','Dan Henderson vs Maurício Rua — UFC 139',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('wars','wars-5','José Aldo vs Chad Mendes 2 — UFC 179','José Aldo vs Chad Mendes 2 — UFC 179',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('wars','wars-6','Justin Gaethje vs Michael Chandler — UFC 268','Justin Gaethje vs Michael Chandler — UFC 268',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('wars','wars-7','Dustin Poirier vs Dan Hooker — UFC Vegas 4','Dustin Poirier vs Dan Hooker — UFC Vegas 4',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('wars','wars-8','Israel Adesanya vs Kelvin Gastelum — UFC 236','Israel Adesanya vs Kelvin Gastelum — UFC 236',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('wars','wars-9','Frankie Edgar vs Gray Maynard 2 — UFC 125','Frankie Edgar vs Gray Maynard 2 — UFC 125',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('wars','wars-10','Forrest Griffin vs Stephan Bonnar — TUF 1 Finale','Forrest Griffin vs Stephan Bonnar — TUF 1 Finale',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('wars','wars-11','Max Holloway vs Ricardo Lamas — UFC 199','Max Holloway vs Ricardo Lamas — UFC 199',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('wars','wars-12','Cub Swanson vs Doo Ho Choi — UFC 206','Cub Swanson vs Doo Ho Choi — UFC 206',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('rivalries','rivalries-1','Chuck Liddell vs Tito Ortiz','Chuck Liddell vs Tito Ortiz',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('rivalries','rivalries-2','Jon Jones vs Daniel Cormier','Jon Jones vs Daniel Cormier',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('rivalries','rivalries-3','Conor McGregor vs Nate Diaz','Conor McGregor vs Nate Diaz',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('rivalries','rivalries-4','Anderson Silva vs Chael Sonnen','Anderson Silva vs Chael Sonnen',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('rivalries','rivalries-5','Georges St-Pierre vs Matt Hughes','Georges St-Pierre vs Matt Hughes',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('rivalries','rivalries-6','BJ Penn vs Matt Hughes','BJ Penn vs Matt Hughes',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('rivalries','rivalries-7','Frankie Edgar vs Gray Maynard','Frankie Edgar vs Gray Maynard',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('rivalries','rivalries-8','José Aldo vs Chad Mendes','José Aldo vs Chad Mendes',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('rivalries','rivalries-9','Dustin Poirier vs Conor McGregor','Dustin Poirier vs Conor McGregor',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('rivalries','rivalries-10','Alex Pereira vs Israel Adesanya','Alex Pereira vs Israel Adesanya',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('rivalries','rivalries-11','Ronda Rousey vs Miesha Tate','Ronda Rousey vs Miesha Tate',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('rivalries','rivalries-12','Kamaru Usman vs Colby Covington','Kamaru Usman vs Colby Covington',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('iconic-moments','iconic-moments-1','Griffin and Bonnar save the show — TUF 1 Finale','Griffin and Bonnar save the show — TUF 1 Finale',5,0.25,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('iconic-moments','iconic-moments-2','McGregor’s 13-second title win — UFC 194','McGregor’s 13-second title win — UFC 194',4,0.25,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('iconic-moments','iconic-moments-3','Silva’s front kick — UFC 126','Silva’s front kick — UFC 126',4,0.25,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('iconic-moments','iconic-moments-4','Masvidal’s flying knee — UFC 239','Masvidal’s flying knee — UFC 239',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('iconic-moments','iconic-moments-5','Johnson’s airborne armbar — UFC 216','Johnson’s airborne armbar — UFC 216',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('iconic-moments','iconic-moments-6','Edwards’ head-kick comeback — UFC 278','Edwards’ head-kick comeback — UFC 278',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('iconic-moments','iconic-moments-7','Jones becomes youngest champion — UFC 128','Jones becomes youngest champion — UFC 128',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('iconic-moments','iconic-moments-8','Nunes shocks Rousey — UFC 207','Nunes shocks Rousey — UFC 207',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('iconic-moments','iconic-moments-9','Holly Holm stops Ronda Rousey — UFC 193','Holly Holm stops Ronda Rousey — UFC 193',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('iconic-moments','iconic-moments-10','Khabib retires unbeaten in UFC title bout — UFC 254','Khabib retires unbeaten in UFC title bout — UFC 254',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('iconic-moments','iconic-moments-11','Lawler and MacDonald stare down — UFC 189','Lawler and MacDonald stare down — UFC 189',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('iconic-moments','iconic-moments-12','Diaz submits McGregor — UFC 196','Diaz submits McGregor — UFC 196',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb),
  ('nicknames','nicknames-1','The Korean Zombie — Chan Sung Jung','The Korean Zombie — Chan Sung Jung',5,1.00,'{"overall": 96, "Striking": 96, "Grappling": 92, "Frame": 88, "Power": 84, "Heart": 96}'::jsonb),
  ('nicknames','nicknames-2','The Axe Murderer — Wanderlei Silva','The Axe Murderer — Wanderlei Silva',4,1.00,'{"overall": 93, "Striking": 89, "Grappling": 85, "Frame": 81, "Power": 93, "Heart": 90}'::jsonb),
  ('nicknames','nicknames-3','The Last Stylebender — Israel Adesanya','The Last Stylebender — Israel Adesanya',4,1.00,'{"overall": 90, "Striking": 82, "Grappling": 78, "Frame": 90, "Power": 86, "Heart": 84}'::jsonb),
  ('nicknames','nicknames-4','Thug Rose — Rose Namajunas','Thug Rose — Rose Namajunas',3,1.00,'{"overall": 87, "Striking": 75, "Grappling": 87, "Frame": 83, "Power": 79, "Heart": 87}'::jsonb),
  ('nicknames','nicknames-5','The Notorious — Conor McGregor','The Notorious — Conor McGregor',3,1.00,'{"overall": 84, "Striking": 84, "Grappling": 80, "Frame": 76, "Power": 72, "Heart": 81}'::jsonb),
  ('nicknames','nicknames-6','Bones — Jon Jones','Bones — Jon Jones',3,1.00,'{"overall": 81, "Striking": 77, "Grappling": 73, "Frame": 69, "Power": 81, "Heart": 75}'::jsonb),
  ('nicknames','nicknames-7','Rush — Georges St-Pierre','Rush — Georges St-Pierre',3,1.00,'{"overall": 78, "Striking": 70, "Grappling": 66, "Frame": 78, "Power": 74, "Heart": 78}'::jsonb),
  ('nicknames','nicknames-8','Mighty Mouse — Demetrious Johnson','Mighty Mouse — Demetrious Johnson',2,1.00,'{"overall": 75, "Striking": 63, "Grappling": 75, "Frame": 71, "Power": 67, "Heart": 72}'::jsonb),
  ('nicknames','nicknames-9','The Spider — Anderson Silva','The Spider — Anderson Silva',2,1.00,'{"overall": 72, "Striking": 72, "Grappling": 68, "Frame": 64, "Power": 60, "Heart": 66}'::jsonb),
  ('nicknames','nicknames-10','El Cucuy — Tony Ferguson','El Cucuy — Tony Ferguson',2,1.00,'{"overall": 69, "Striking": 65, "Grappling": 61, "Frame": 57, "Power": 69, "Heart": 69}'::jsonb),
  ('nicknames','nicknames-11','The Natural Born Killer — Carlos Condit','The Natural Born Killer — Carlos Condit',2,1.00,'{"overall": 66, "Striking": 58, "Grappling": 54, "Frame": 66, "Power": 62, "Heart": 63}'::jsonb),
  ('nicknames','nicknames-12','Shogun — Maurício Rua','Shogun — Maurício Rua',2,1.00,'{"overall": 63, "Striking": 51, "Grappling": 63, "Frame": 59, "Power": 55, "Heart": 57}'::jsonb)
) v(mode_id,item_reference,display_label,display_description,rarity_band,generation_weight,grading_inputs);

update private.auction_catalog set private_generation_class = case
 when mode_id='ultimate-fighter' and item_reference='ultimate-fighter-1' then 'mythic'
 when mode_id='ultimate-fighter' and split_part(item_reference,'-',-1)::integer between 2 and 7 then 'crown'
 when mode_id in ('strikers','grapplers','knockout-artists') and split_part(item_reference,'-',-1)::integer <= 4 then 'ace'
 when mode_id in ('fighter-performances','greatest-ufc-card','championship-performances','finishes','dominant-performances','wars','rivalries','iconic-moments') and split_part(item_reference,'-',-1)::integer <= 3 then 'headliner'
 when mode_id in ('jon-jones-performances','conor-mcgregor-performances','charles-oliveira-performances') and split_part(item_reference,'-',-1)::integer <= 3 then 'signature'
 else 'core' end where content_version='ufc-auction-2026-08-v1';

update private.auction_catalog_versions set is_preparation_version=false where content_version='fixture-2026-08-22-v1';
update private.auction_catalog_versions set is_preparation_version=true where content_version='ufc-auction-2026-08-v1';

create or replace function private.generate_auction_deck(p_auction_id uuid,p_content_version text,p_mode_id text,p_count integer,p_random_order double precision[] default null) returns void language plpgsql security definer set search_path='' as $$
declare v_available integer;
begin
 if p_count < 1 or exists(select 1 from private.auction_deck_entries where auction_id=p_auction_id) then raise exception 'invalid or already fixed Auction deck'; end if;
 select count(*) into v_available from private.auction_catalog where content_version=p_content_version and mode_id=p_mode_id;
 if v_available<p_count then raise exception 'catalog does not contain enough unique items'; end if;
 if p_random_order is not null and cardinality(p_random_order)<v_available then raise exception 'test randomness does not cover the catalog'; end if;
 insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
 select p_auction_id,row_number() over(order by weighted_key,item_reference),item_reference from (
  select ranked.* from (
   select weighted.*,
    row_number() over(partition by (private_generation_class in ('mythic','crown')) order by weighted_key,item_reference) as crown_rank,
    row_number() over(partition by (rarity_band >= 4) order by weighted_key,item_reference) as high_rank,
    row_number() over(partition by private_generation_class order by weighted_key,item_reference) as class_rank
   from (
    select item_reference,private_generation_class,rarity_band,
     -ln(greatest(0.0000001,case when p_random_order is null then random() else p_random_order[(row_number() over(order by item_reference))::integer] end))/generation_weight as weighted_key
    from private.auction_catalog where content_version=p_content_version and mode_id=p_mode_id
   ) weighted
  ) ranked where (p_mode_id<>'ultimate-fighter' or ((private_generation_class not in ('mythic','crown') or crown_rank<=2) and (rarity_band<4 or high_rank<=4)))
   and (p_mode_id not in ('strikers','grapplers','knockout-artists') or private_generation_class<>'ace' or class_rank<=2)
   and (p_mode_id not in ('fighter-performances','greatest-ufc-card','championship-performances','finishes','dominant-performances','wars','rivalries','iconic-moments') or private_generation_class<>'headliner' or class_rank<=2)
 ) candidates order by weighted_key,item_reference limit p_count;
end $$;

create or replace function private.grade_auction(p_auction_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare g private.auction_games; cs integer; rs integer; win uuid; required_count integer;
begin
 select * into g from private.auction_games where id=p_auction_id for update;
 if g.lifecycle_state='completed' then return; end if;
 if g.lifecycle_state<>'active' then raise exception 'Auction is not gradeable'; end if;
 required_count:=case when g.mode_id='ultimate-fighter' then 5 else 4 end;
 if g.challenger_selection_count<>required_count or g.recipient_selection_count<>required_count then raise exception 'both collections must be complete'; end if;
 select round(avg(case when g.mode_id='ultimate-fighter' then (c.grading_inputs->>a.visible_category)::numeric else (c.grading_inputs->>'overall')::numeric end))::integer into cs from private.auction_awards a join private.auction_deck_entries d on d.id=a.deck_entry_id join private.auction_catalog c on c.content_version=g.content_version and c.mode_id=g.mode_id and c.item_reference=d.private_item_reference where a.auction_id=g.id and a.awarded_to=g.challenger_id;
 select round(avg(case when g.mode_id='ultimate-fighter' then (c.grading_inputs->>a.visible_category)::numeric else (c.grading_inputs->>'overall')::numeric end))::integer into rs from private.auction_awards a join private.auction_deck_entries d on d.id=a.deck_entry_id join private.auction_catalog c on c.content_version=g.content_version and c.mode_id=g.mode_id and c.item_reference=d.private_item_reference where a.auction_id=g.id and a.awarded_to=g.recipient_id;
 cs:=greatest(0,least(100,cs)); rs:=greatest(0,least(100,rs)); win:=case when cs>rs then g.challenger_id when rs>cs then g.recipient_id else null end;
 update private.auction_games set lifecycle_state='completed',challenger_final_score=cs,recipient_final_score=rs,winner_profile_id=win,revision=revision+1,updated_at=now() where id=g.id;
 update public.play_challenges set completed_at=coalesce(completed_at,now()),responder_result=coalesce(responder_result,'{}'::jsonb) where id=g.challenge_id;
end $$;

create or replace function private.complete_auction_placeholder(p_auction_id uuid) returns void language plpgsql set search_path='' as $$ begin perform private.grade_auction(p_auction_id); end $$;
revoke all on function private.grade_auction(uuid) from public,anon,authenticated;
comment on function private.grade_auction(uuid) is 'The single fixed-version server-private Auction grader; emits only overall integer scores and numeric winner/tie.';
