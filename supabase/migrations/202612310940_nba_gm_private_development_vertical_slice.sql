-- Internal owner-only NBA GM Phase 2 development. UNAPPROVED FICTIONAL CAP AND SALARY FIXTURES.
-- Shares Football GM's existing private persisted runs / revision snapshots; no new public GM backend.
-- Source: frozen 330-player Oct 30 editorial board; no ratings changed.
create table if not exists private.nba_gm_dev_catalog (
  id text primary key, name text not null, team_code text not null,
  positions text[] not null, overall integer not null,
  skills jsonb not null, salaries bigint[] not null,
  position_review text not null,
  constraint nba_gm_dev_skill_keys check (jsonb_typeof(skills) = 'object'),
  constraint nba_gm_dev_three_salaries check (array_length(salaries,1)=3)
);
revoke all on private.nba_gm_dev_catalog from public, anon, authenticated;
insert into private.nba_gm_dev_catalog (id,name,team_code,positions,overall,skills,salaries,position_review)
values
('nba-gm-draft-victorwembanyama','Victor Wembanyama','SAS',ARRAY['C']::text[],99,'{"scoring":94,"shooting":79,"playmaking":78,"perimeterDefense":85,"interiorDefense":99,"rebounding":94}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-nikolajokic','Nikola Jokić','DEN',ARRAY['C']::text[],98,'{"scoring":95,"shooting":82,"playmaking":99,"perimeterDefense":68,"interiorDefense":78,"rebounding":99}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-shaigilgeousalexander','Shai Gilgeous-Alexander','OKC',ARRAY['PG','SG']::text[],98,'{"scoring":99,"shooting":87,"playmaking":90,"perimeterDefense":87,"interiorDefense":54,"rebounding":60}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-lukadoncic','Luka Dončić','LAL',ARRAY['PG']::text[],97,'{"scoring":95,"shooting":89,"playmaking":95,"perimeterDefense":70,"interiorDefense":51,"rebounding":83}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-giannisantetokounmpo','Giannis Antetokounmpo','MIA',ARRAY['PF']::text[],97,'{"scoring":95,"shooting":52,"playmaking":84,"perimeterDefense":86,"interiorDefense":93,"rebounding":91}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-jalenbrunson','Jalen Brunson','NYK',ARRAY['PG']::text[],96,'{"scoring":95,"shooting":88,"playmaking":88,"perimeterDefense":67,"interiorDefense":40,"rebounding":61}'::jsonb,ARRAY[55000000,56900000,58900000]::bigint[],'unverified'),
('nba-gm-draft-anthonyedwards','Anthony Edwards','MIN',ARRAY['SG']::text[],95,'{"scoring":92,"shooting":91,"playmaking":79,"perimeterDefense":82,"interiorDefense":62,"rebounding":72}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-kawhileonard','Kawhi Leonard','TOR',ARRAY['SF','PF']::text[],94,'{"scoring":89,"shooting":90,"playmaking":78,"perimeterDefense":91,"interiorDefense":78,"rebounding":77}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-cadecunningham','Cade Cunningham','DET',ARRAY['PG']::text[],94,'{"scoring":90,"shooting":83,"playmaking":90,"perimeterDefense":79,"interiorDefense":56,"rebounding":72}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-jaysontatum','Jayson Tatum','BOS',ARRAY['SF','PF']::text[],94,'{"scoring":90,"shooting":89,"playmaking":85,"perimeterDefense":86,"interiorDefense":81,"rebounding":82}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-stephencurry','Stephen Curry','GSW',ARRAY['PG']::text[],93,'{"scoring":93,"shooting":99,"playmaking":88,"perimeterDefense":65,"interiorDefense":43,"rebounding":56}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-donovanmitchell','Donovan Mitchell','CLE',ARRAY['SG','PG']::text[],93,'{"scoring":91,"shooting":90,"playmaking":81,"perimeterDefense":78,"interiorDefense":47,"rebounding":62}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-karlanthonytowns','Karl-Anthony Towns','NYK',ARRAY['C']::text[],92,'{"scoring":90,"shooting":95,"playmaking":75,"perimeterDefense":60,"interiorDefense":66,"rebounding":95}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-tyresemaxey','Tyrese Maxey','PHI',ARRAY['PG','SG']::text[],92,'{"scoring":92,"shooting":89,"playmaking":84,"perimeterDefense":74,"interiorDefense":39,"rebounding":52}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-kevindurant','Kevin Durant','HOU',ARRAY['SF','PF']::text[],92,'{"scoring":93,"shooting":95,"playmaking":76,"perimeterDefense":74,"interiorDefense":78,"rebounding":72}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-jaylenbrown','Jaylen Brown','PHI',ARRAY['SG','SF']::text[],92,'{"scoring":90,"shooting":80,"playmaking":77,"perimeterDefense":82,"interiorDefense":72,"rebounding":73}'::jsonb,ARRAY[44000000,45500000,47100000]::bigint[],'unverified'),
('nba-gm-draft-tyresehaliburton','Tyrese Haliburton','IND',ARRAY['PG']::text[],90,'{"scoring":84,"shooting":88,"playmaking":96,"perimeterDefense":67,"interiorDefense":44,"rebounding":52}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-scottiebarnes','Scottie Barnes','TOR',ARRAY['SF','PF']::text[],90,'{"scoring":85,"shooting":70,"playmaking":85,"perimeterDefense":91,"interiorDefense":75,"rebounding":79}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-devinbooker','Devin Booker','PHX',ARRAY['SG','PG']::text[],91,'{"scoring":93,"shooting":91,"playmaking":82,"perimeterDefense":73,"interiorDefense":50,"rebounding":65}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-oganunoby','OG Anunoby','NYK',ARRAY['SF','PF']::text[],87,'{"scoring":74,"shooting":84,"playmaking":70,"perimeterDefense":95,"interiorDefense":74,"rebounding":72}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-lebronjames','LeBron James','PHI',ARRAY['SF','PF']::text[],90,'{"scoring":88,"shooting":80,"playmaking":94,"perimeterDefense":70,"interiorDefense":75,"rebounding":78}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-jalenjohnson','Jalen Johnson','ATL',ARRAY['PF']::text[],90,'{"scoring":87,"shooting":75,"playmaking":85,"perimeterDefense":77,"interiorDefense":78,"rebounding":80}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-jamalmurray','Jamal Murray','DEN',ARRAY['PG']::text[],90,'{"scoring":87,"shooting":88,"playmaking":82,"perimeterDefense":68,"interiorDefense":42,"rebounding":55}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-evanmobley','Evan Mobley','CLE',ARRAY['PF','C']::text[],89,'{"scoring":78,"shooting":67,"playmaking":74,"perimeterDefense":87,"interiorDefense":94,"rebounding":85}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-jalenwilliams','Jalen Williams','OKC',ARRAY['SF','PF']::text[],89,'{"scoring":85,"shooting":79,"playmaking":77,"perimeterDefense":86,"interiorDefense":75,"rebounding":74}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-bamadebayo','Bam Adebayo','MIA',ARRAY['C']::text[],89,'{"scoring":81,"shooting":67,"playmaking":79,"perimeterDefense":88,"interiorDefense":91,"rebounding":85}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-deniavdija','Deni Avdija','POR',ARRAY['SF','PF']::text[],88,'{"scoring":85,"shooting":73,"playmaking":83,"perimeterDefense":79,"interiorDefense":73,"rebounding":80}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-chetholmgren','Chet Holmgren','OKC',ARRAY['C']::text[],89,'{"scoring":78,"shooting":84,"playmaking":68,"perimeterDefense":78,"interiorDefense":95,"rebounding":85}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-stephoncastle','Stephon Castle','SAS',ARRAY['PG','SG']::text[],88,'{"scoring":82,"shooting":69,"playmaking":85,"perimeterDefense":88,"interiorDefense":58,"rebounding":71}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-pascalsiakam','Pascal Siakam','IND',ARRAY['PF']::text[],88,'{"scoring":84,"shooting":76,"playmaking":72,"perimeterDefense":76,"interiorDefense":78,"rebounding":70}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-cooperflagg','Cooper Flagg','DAL',ARRAY['SF','PF']::text[],87,'{"scoring":85,"shooting":79,"playmaking":78,"perimeterDefense":87,"interiorDefense":87,"rebounding":81}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-paolobanchero','Paolo Banchero','ORL',ARRAY['PF']::text[],88,'{"scoring":89,"shooting":73,"playmaking":78,"perimeterDefense":69,"interiorDefense":71,"rebounding":80}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-lameloball','LaMelo Ball','MIN',ARRAY['PG']::text[],87,'{"scoring":83,"shooting":87,"playmaking":92,"perimeterDefense":55,"interiorDefense":30,"rebounding":67}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-laurimarkkanen','Lauri Markkanen','UTA',ARRAY['PF','SF']::text[],86,'{"scoring":85,"shooting":91,"playmaking":66,"perimeterDefense":64,"interiorDefense":69,"rebounding":82}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-alperensengun','Alperen Şengün','HOU',ARRAY['C']::text[],88,'{"scoring":86,"shooting":64,"playmaking":90,"perimeterDefense":60,"interiorDefense":70,"rebounding":89}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-austinreaves','Austin Reaves','LAL',ARRAY['SG','PG']::text[],87,'{"scoring":88,"shooting":84,"playmaking":83,"perimeterDefense":65,"interiorDefense":44,"rebounding":57}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-jamesharden','James Harden','CLE',ARRAY['PG','SG']::text[],87,'{"scoring":85,"shooting":85,"playmaking":92,"perimeterDefense":57,"interiorDefense":47,"rebounding":70}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-anthonydavis','Anthony Davis','WAS',ARRAY['C']::text[],89,'{"scoring":85,"shooting":65,"playmaking":66,"perimeterDefense":82,"interiorDefense":95,"rebounding":88}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-joelembiid','Joel Embiid','PHI',ARRAY['C']::text[],88,'{"scoring":95,"shooting":83,"playmaking":72,"perimeterDefense":62,"interiorDefense":91,"rebounding":91}'::jsonb,ARRAY[33000000,34200000,35300000]::bigint[],'unverified'),
('nba-gm-draft-amenthompson','Amen Thompson','HOU',ARRAY['SG','SF']::text[],86,'{"scoring":80,"shooting":53,"playmaking":75,"perimeterDefense":95,"interiorDefense":74,"rebounding":81}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-kyrieirving','Kyrie Irving','DAL',ARRAY['PG','SG']::text[],87,'{"scoring":92,"shooting":94,"playmaking":80,"perimeterDefense":61,"interiorDefense":38,"rebounding":53}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-franzwagner','Franz Wagner','ORL',ARRAY['SF']::text[],86,'{"scoring":87,"shooting":71,"playmaking":82,"perimeterDefense":80,"interiorDefense":65,"rebounding":72}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-derrickwhite','Derrick White','BOS',ARRAY['SG','PG']::text[],85,'{"scoring":74,"shooting":82,"playmaking":80,"perimeterDefense":85,"interiorDefense":68,"rebounding":55}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-jarenjackson','Jaren Jackson Jr.','UTA',ARRAY['PF','C']::text[],86,'{"scoring":81,"shooting":78,"playmaking":65,"perimeterDefense":81,"interiorDefense":91,"rebounding":67}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-rudygobert','Rudy Gobert','MIN',ARRAY['C']::text[],85,'{"scoring":65,"shooting":31,"playmaking":49,"perimeterDefense":58,"interiorDefense":90,"rebounding":94}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-jalenduren','Jalen Duren','DET',ARRAY['C']::text[],85,'{"scoring":80,"shooting":45,"playmaking":71,"perimeterDefense":63,"interiorDefense":85,"rebounding":85}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-dylanharper','Dylan Harper','SAS',ARRAY['PG','SG']::text[],82,'{"scoring":78,"shooting":73,"playmaking":78,"perimeterDefense":68,"interiorDefense":43,"rebounding":63}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-konknueppel','Kon Knueppel','CHA',ARRAY['SG','SF']::text[],84,'{"scoring":80,"shooting":90,"playmaking":75,"perimeterDefense":72,"interiorDefense":55,"rebounding":61}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-desmondbane','Desmond Bane','ORL',ARRAY['SG']::text[],85,'{"scoring":85,"shooting":90,"playmaking":76,"perimeterDefense":72,"interiorDefense":47,"rebounding":58}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-jadenmcdaniels','Jaden McDaniels','MIN',ARRAY['SF']::text[],83,'{"scoring":72,"shooting":81,"playmaking":63,"perimeterDefense":91,"interiorDefense":75,"rebounding":68}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-brandonmiller','Brandon Miller','CHA',ARRAY['SF','SG']::text[],84,'{"scoring":84,"shooting":85,"playmaking":67,"perimeterDefense":72,"interiorDefense":54,"rebounding":66}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-aarongordon','Aaron Gordon','DEN',ARRAY['PF']::text[],83,'{"scoring":82,"shooting":64,"playmaking":70,"perimeterDefense":84,"interiorDefense":86,"rebounding":77}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-treymurphy','Trey Murphy III','NOP',ARRAY['SF']::text[],85,'{"scoring":82,"shooting":85,"playmaking":70,"perimeterDefense":78,"interiorDefense":57,"rebounding":66}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-zionwilliamson','Zion Williamson','NOP',ARRAY['PF']::text[],85,'{"scoring":91,"shooting":26,"playmaking":73,"perimeterDefense":65,"interiorDefense":65,"rebounding":82}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-ivicazubac','Ivica Zubac','IND',ARRAY['C']::text[],84,'{"scoring":76,"shooting":30,"playmaking":63,"perimeterDefense":53,"interiorDefense":86,"rebounding":86}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-deaaronfox','De''Aaron Fox','SAS',ARRAY['PG']::text[],85,'{"scoring":88,"shooting":73,"playmaking":82,"perimeterDefense":73,"interiorDefense":44,"rebounding":59}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-keyontegeorge','Keyonte George','UTA',ARRAY['SG','SF']::text[],82,'{"scoring":84,"shooting":82,"playmaking":83,"perimeterDefense":64,"interiorDefense":35,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-nickeilalexanderwalker','Nickeil Alexander-Walker','ATL',ARRAY['SG']::text[],83,'{"scoring":78,"shooting":86,"playmaking":73,"perimeterDefense":85,"interiorDefense":46,"rebounding":59}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-dariusgarland','Darius Garland','LAC',ARRAY['PG']::text[],83,'{"scoring":83,"shooting":80,"playmaking":88,"perimeterDefense":61,"interiorDefense":34,"rebounding":46}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-domantassabonis','Domantas Sabonis','SAC',ARRAY['C']::text[],84,'{"scoring":80,"shooting":45,"playmaking":87,"perimeterDefense":56,"interiorDefense":71,"rebounding":93}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-ausarthompson','Ausar Thompson','DET',ARRAY['SF','SG']::text[],83,'{"scoring":72,"shooting":60,"playmaking":69,"perimeterDefense":99,"interiorDefense":82,"rebounding":84}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-michaelporter','Michael Porter Jr.','BKN',ARRAY['SF','PF']::text[],83,'{"scoring":86,"shooting":92,"playmaking":61,"perimeterDefense":60,"interiorDefense":64,"rebounding":73}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-juliusrandle','Julius Randle','BKN',ARRAY['PF']::text[],82,'{"scoring":84,"shooting":70,"playmaking":74,"perimeterDefense":62,"interiorDefense":72,"rebounding":86}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-traeyoung','Trae Young','WAS',ARRAY['PG']::text[],84,'{"scoring":85,"shooting":87,"playmaking":93,"perimeterDefense":43,"interiorDefense":23,"rebounding":45}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-paulgeorge','Paul George','BOS',ARRAY['SF','SG']::text[],82,'{"scoring":80,"shooting":83,"playmaking":79,"perimeterDefense":80,"interiorDefense":64,"rebounding":70}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-damianlillard','Damian Lillard','POR',ARRAY['PG']::text[],82,'{"scoring":82,"shooting":91,"playmaking":86,"perimeterDefense":57,"interiorDefense":34,"rebounding":48}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-mikalbridges','Mikal Bridges','NYK',ARRAY['SF']::text[],83,'{"scoring":79,"shooting":84,"playmaking":75,"perimeterDefense":80,"interiorDefense":55,"rebounding":63}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-alexcaruso','Alex Caruso','OKC',ARRAY['SG']::text[],81,'{"scoring":75,"shooting":75,"playmaking":76,"perimeterDefense":91,"interiorDefense":60,"rebounding":55}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-dillonbrooks','Dillon Brooks','PHX',ARRAY['SF']::text[],82,'{"scoring":72,"shooting":77,"playmaking":60,"perimeterDefense":89,"interiorDefense":69,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jarrettallen','Jarrett Allen','CLE',ARRAY['C']::text[],83,'{"scoring":70,"shooting":30,"playmaking":64,"perimeterDefense":52,"interiorDefense":85,"rebounding":85}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-paytonpritchard','Payton Pritchard','BOS',ARRAY['PG']::text[],82,'{"scoring":84,"shooting":89,"playmaking":82,"perimeterDefense":66,"interiorDefense":36,"rebounding":52}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-tylerherro','Tyler Herro','MIL',ARRAY['SG']::text[],82,'{"scoring":85,"shooting":88,"playmaking":78,"perimeterDefense":60,"interiorDefense":33,"rebounding":51}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-casonwallace','Cason Wallace','OKC',ARRAY['SG']::text[],81,'{"scoring":67,"shooting":79,"playmaking":74,"perimeterDefense":90,"interiorDefense":40,"rebounding":49}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-ajaymitchell','Ajay Mitchell','OKC',ARRAY['SG']::text[],80,'{"scoring":83,"shooting":76,"playmaking":75,"perimeterDefense":76,"interiorDefense":40,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-isaiahhartenstein','Isaiah Hartenstein','OKC',ARRAY['C']::text[],82,'{"scoring":68,"shooting":25,"playmaking":80,"perimeterDefense":57,"interiorDefense":80,"rebounding":84}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-joshhart','Josh Hart','NYK',ARRAY['SG','SF','PF']::text[],82,'{"scoring":73,"shooting":77,"playmaking":75,"perimeterDefense":78,"interiorDefense":58,"rebounding":75}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-normanpowell','Norman Powell','CHI',ARRAY['SG']::text[],82,'{"scoring":85,"shooting":89,"playmaking":67,"perimeterDefense":66,"interiorDefense":39,"rebounding":55}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-fredvanvleet','Fred VanVleet','HOU',ARRAY['PG']::text[],81,'{"scoring":72,"shooting":79,"playmaking":83,"perimeterDefense":79,"interiorDefense":32,"rebounding":56}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jrueholiday','Jrue Holiday','POR',ARRAY['PG','SG']::text[],80,'{"scoring":71,"shooting":80,"playmaking":81,"perimeterDefense":87,"interiorDefense":56,"rebounding":66}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-vjedgecombe','VJ Edgecombe','PHI',ARRAY['SG']::text[],81,'{"scoring":77,"shooting":72,"playmaking":69,"perimeterDefense":85,"interiorDefense":57,"rebounding":67}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-andrewnembhard','Andrew Nembhard','IND',ARRAY['PG','SG']::text[],81,'{"scoring":77,"shooting":78,"playmaking":84,"perimeterDefense":79,"interiorDefense":40,"rebounding":53}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-nazreid','Naz Reid','CHA',ARRAY['SF']::text[],82,'{"scoring":84,"shooting":85,"playmaking":65,"perimeterDefense":64,"interiorDefense":66,"rebounding":74}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-joshgiddey','Josh Giddey','CHI',ARRAY['PG','SG']::text[],82,'{"scoring":79,"shooting":73,"playmaking":89,"perimeterDefense":58,"interiorDefense":44,"rebounding":87}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-devinvassell','Devin Vassell','SAS',ARRAY['SG','SF']::text[],80,'{"scoring":79,"shooting":84,"playmaking":66,"perimeterDefense":75,"interiorDefense":52,"rebounding":57}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-donovanclingan','Donovan Clingan','POR',ARRAY['C']::text[],80,'{"scoring":64,"shooting":25,"playmaking":59,"perimeterDefense":51,"interiorDefense":90,"rebounding":90}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-ayodosunmu','Ayo Dosunmu','MIN',ARRAY['SG','PG']::text[],81,'{"scoring":78,"shooting":84,"playmaking":72,"perimeterDefense":78,"interiorDefense":44,"rebounding":60}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jalensuggs','Jalen Suggs','ORL',ARRAY['PG','SG']::text[],80,'{"scoring":77,"shooting":70,"playmaking":76,"perimeterDefense":91,"interiorDefense":48,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-peytonwatson','Peyton Watson','CLE',ARRAY['SF','PF']::text[],80,'{"scoring":74,"shooting":77,"playmaking":61,"perimeterDefense":88,"interiorDefense":81,"rebounding":67}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-dysondaniels','Dyson Daniels','ATL',ARRAY['SG']::text[],81,'{"scoring":71,"shooting":62,"playmaking":81,"perimeterDefense":96,"interiorDefense":54,"rebounding":76}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-walkerkessler','Walker Kessler','LAL',ARRAY['C']::text[],80,'{"scoring":64,"shooting":25,"playmaking":53,"perimeterDefense":54,"interiorDefense":89,"rebounding":87}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-cameronboozer','Cameron Boozer','MEM',ARRAY['SF']::text[],77,'{"scoring":74,"shooting":70,"playmaking":70,"perimeterDefense":63,"interiorDefense":68,"rebounding":80}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-collinmurrayboyles','Collin Murray-Boyles','TOR',ARRAY['SF']::text[],79,'{"scoring":71,"shooting":55,"playmaking":69,"perimeterDefense":85,"interiorDefense":85,"rebounding":79}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-toumanicamara','Toumani Camara','POR',ARRAY['SF']::text[],80,'{"scoring":72,"shooting":79,"playmaking":61,"perimeterDefense":90,"interiorDefense":68,"rebounding":69}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-tobiasharris','Tobias Harris','SAS',ARRAY['PF','SF']::text[],79,'{"scoring":78,"shooting":77,"playmaking":68,"perimeterDefense":67,"interiorDefense":66,"rebounding":67}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-rjbarrett','RJ Barrett','TOR',ARRAY['SF']::text[],80,'{"scoring":84,"shooting":70,"playmaking":72,"perimeterDefense":64,"interiorDefense":53,"rebounding":70}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-onyekaokongwu','Onyeka Okongwu','ATL',ARRAY['PF','C']::text[],81,'{"scoring":72,"shooting":65,"playmaking":72,"perimeterDefense":73,"interiorDefense":84,"rebounding":83}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jamorant','Ja Morant','POR',ARRAY['PG']::text[],81,'{"scoring":84,"shooting":64,"playmaking":84,"perimeterDefense":58,"interiorDefense":30,"rebounding":56}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-dejountemurray','Dejounte Murray','NOP',ARRAY['PG','SG']::text[],80,'{"scoring":78,"shooting":70,"playmaking":84,"perimeterDefense":76,"interiorDefense":42,"rebounding":65}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-matasbuzelis','Matas Buzelis','CHI',ARRAY['PF','SF']::text[],79,'{"scoring":76,"shooting":73,"playmaking":67,"perimeterDefense":78,"interiorDefense":77,"rebounding":69}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-ajdybantsa','AJ Dybantsa','WAS',ARRAY['SF']::text[],77,'{"scoring":76,"shooting":66,"playmaking":61,"perimeterDefense":67,"interiorDefense":58,"rebounding":68}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-brandoningram','Brandon Ingram','LAC',ARRAY['SF']::text[],83,'{"scoring":88,"shooting":81,"playmaking":80,"perimeterDefense":62,"interiorDefense":52,"rebounding":65}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-demarderozan','DeMar DeRozan','DEN',ARRAY['SF']::text[],80,'{"scoring":80,"shooting":80,"playmaking":72,"perimeterDefense":63,"interiorDefense":50,"rebounding":62}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-zachlavine','Zach LaVine','SAC',ARRAY['SG','SF']::text[],80,'{"scoring":84,"shooting":88,"playmaking":70,"perimeterDefense":61,"interiorDefense":38,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-cjmccollum','C.J. McCollum','ATL',ARRAY['PG','SG']::text[],80,'{"scoring":82,"shooting":89,"playmaking":77,"perimeterDefense":56,"interiorDefense":28,"rebounding":44}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-alexandresarr','Alexandre Sarr','WAS',ARRAY['PF','C']::text[],82,'{"scoring":77,"shooting":70,"playmaking":63,"perimeterDefense":76,"interiorDefense":88,"rebounding":81}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-immanuelquickley','Immanuel Quickley','TOR',ARRAY['PG']::text[],81,'{"scoring":78,"shooting":85,"playmaking":82,"perimeterDefense":68,"interiorDefense":37,"rebounding":51}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-shaedonsharpe','Shaedon Sharpe','POR',ARRAY['SG']::text[],80,'{"scoring":83,"shooting":75,"playmaking":68,"perimeterDefense":67,"interiorDefense":48,"rebounding":66}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-mylesturner','Myles Turner','MIL',ARRAY['PF','C']::text[],80,'{"scoring":74,"shooting":85,"playmaking":56,"perimeterDefense":62,"interiorDefense":89,"rebounding":67}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-draymondgreen','Draymond Green','GSW',ARRAY['PF','C']::text[],81,'{"scoring":57,"shooting":54,"playmaking":85,"perimeterDefense":81,"interiorDefense":86,"rebounding":78}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jimmybutler','Jimmy Butler','GSW',ARRAY['SF']::text[],83,'{"scoring":84,"shooting":64,"playmaking":84,"perimeterDefense":82,"interiorDefense":71,"rebounding":69}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-herbjones','Herb Jones','NOP',ARRAY['SF']::text[],81,'{"scoring":65,"shooting":72,"playmaking":64,"perimeterDefense":95,"interiorDefense":70,"rebounding":61}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-duncanrobinson','Duncan Robinson','DET',ARRAY['SF']::text[],79,'{"scoring":67,"shooting":94,"playmaking":62,"perimeterDefense":56,"interiorDefense":34,"rebounding":46}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-julianchampagnie','Julian Champagnie','SAS',ARRAY['SF']::text[],79,'{"scoring":75,"shooting":85,"playmaking":63,"perimeterDefense":79,"interiorDefense":59,"rebounding":67}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-isaiahjoe','Isaiah Joe','DET',ARRAY['SG']::text[],78,'{"scoring":68,"shooting":93,"playmaking":55,"perimeterDefense":65,"interiorDefense":31,"rebounding":45}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-camspencer','Cam Spencer','MEM',ARRAY['PG']::text[],79,'{"scoring":73,"shooting":90,"playmaking":80,"perimeterDefense":70,"interiorDefense":36,"rebounding":52}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-osoighodaro','Oso Ighodaro','PHX',ARRAY['PF','C']::text[],78,'{"scoring":69,"shooting":33,"playmaking":82,"perimeterDefense":74,"interiorDefense":79,"rebounding":78}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-sandromamukelashvili','Sandro Mamukelashvili','LAL',ARRAY['C']::text[],77,'{"scoring":77,"shooting":83,"playmaking":73,"perimeterDefense":60,"interiorDefense":61,"rebounding":71}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-samhauser','Sam Hauser','BOS',ARRAY['SF']::text[],78,'{"scoring":65,"shooting":87,"playmaking":56,"perimeterDefense":67,"interiorDefense":49,"rebounding":54}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-neemiasqueta','Neemias Queta','BOS',ARRAY['C']::text[],79,'{"scoring":68,"shooting":20,"playmaking":53,"perimeterDefense":60,"interiorDefense":80,"rebounding":83}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-lukekennard','Luke Kennard','PHX',ARRAY['SG']::text[],78,'{"scoring":69,"shooting":95,"playmaking":70,"perimeterDefense":54,"interiorDefense":29,"rebounding":45}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-mosesmoody','Moses Moody','GSW',ARRAY['SF']::text[],80,'{"scoring":76,"shooting":82,"playmaking":67,"perimeterDefense":82,"interiorDefense":53,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-trejohnson','Tre Johnson','WAS',ARRAY['SG']::text[],79,'{"scoring":77,"shooting":82,"playmaking":65,"perimeterDefense":58,"interiorDefense":37,"rebounding":51}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kellyoubre','Kelly Oubre Jr.','IND',ARRAY['SF']::text[],78,'{"scoring":78,"shooting":69,"playmaking":59,"perimeterDefense":79,"interiorDefense":57,"rebounding":65}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-dontedivincenzo','Donte DiVincenzo','MIN',ARRAY['SG']::text[],80,'{"scoring":77,"shooting":87,"playmaking":69,"perimeterDefense":80,"interiorDefense":40,"rebounding":62}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-cameronjohnson','Cameron Johnson','DEN',ARRAY['SF']::text[],81,'{"scoring":78,"shooting":90,"playmaking":65,"perimeterDefense":67,"interiorDefense":47,"rebounding":64}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-kelelware','Kel''el Ware','MIL',ARRAY['PF','C']::text[],80,'{"scoring":72,"shooting":77,"playmaking":54,"perimeterDefense":65,"interiorDefense":83,"rebounding":84}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-reedsheppard','Reed Sheppard','HOU',ARRAY['SG']::text[],80,'{"scoring":77,"shooting":86,"playmaking":73,"perimeterDefense":78,"interiorDefense":37,"rebounding":52}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jabarismith','Jabari Smith Jr.','HOU',ARRAY['PF','C']::text[],81,'{"scoring":76,"shooting":82,"playmaking":61,"perimeterDefense":82,"interiorDefense":82,"rebounding":80}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-tarieason','Tari Eason','HOU',ARRAY['SF','PF']::text[],79,'{"scoring":74,"shooting":68,"playmaking":59,"perimeterDefense":86,"interiorDefense":76,"rebounding":80}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-pjwashington','P.J. Washington','DAL',ARRAY['SF']::text[],79,'{"scoring":75,"shooting":79,"playmaking":63,"perimeterDefense":82,"interiorDefense":77,"rebounding":71}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-najimarshall','Naji Marshall','DAL',ARRAY['SF']::text[],78,'{"scoring":78,"shooting":69,"playmaking":73,"perimeterDefense":81,"interiorDefense":60,"rebounding":74}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-graysonallen','Grayson Allen','CHA',ARRAY['SG']::text[],80,'{"scoring":76,"shooting":89,"playmaking":65,"perimeterDefense":65,"interiorDefense":40,"rebounding":49}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-tyjerome','Ty Jerome','MEM',ARRAY['PG','SG']::text[],80,'{"scoring":80,"shooting":83,"playmaking":81,"perimeterDefense":62,"interiorDefense":32,"rebounding":47}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-santialdama','Santi Aldama','DAL',ARRAY['SF']::text[],79,'{"scoring":76,"shooting":81,"playmaking":67,"perimeterDefense":66,"interiorDefense":67,"rebounding":79}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-klaythompson','Klay Thompson','MIA',ARRAY['SF']::text[],77,'{"scoring":67,"shooting":87,"playmaking":54,"perimeterDefense":61,"interiorDefense":30,"rebounding":46}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-brandinpodziemski','Brandin Podziemski','GSW',ARRAY['PG']::text[],79,'{"scoring":76,"shooting":80,"playmaking":82,"perimeterDefense":76,"interiorDefense":41,"rebounding":78}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-keeganmurray','Keegan Murray','SAC',ARRAY['SF','PF']::text[],81,'{"scoring":76,"shooting":81,"playmaking":60,"perimeterDefense":83,"interiorDefense":73,"rebounding":73}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jonathankuminga','Jonathan Kuminga','MIN',ARRAY['SF']::text[],79,'{"scoring":83,"shooting":56,"playmaking":59,"perimeterDefense":69,"interiorDefense":65,"rebounding":72}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-brucethornton','Bruce Thornton','HOU',ARRAY['SG']::text[],71,'{"scoring":69,"shooting":71,"playmaking":72,"perimeterDefense":66,"interiorDefense":34,"rebounding":46}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-bradensmith','Braden Smith','IND',ARRAY['PG']::text[],72,'{"scoring":62,"shooting":66,"playmaking":76,"perimeterDefense":58,"interiorDefense":31,"rebounding":45}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-babamiller','Baba Miller','LAC',ARRAY['C']::text[],73,'{"scoring":68,"shooting":65,"playmaking":65,"perimeterDefense":72,"interiorDefense":71,"rebounding":73}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-meleekthomas','Meleek Thomas','CLE',ARRAY['SG']::text[],74,'{"scoring":75,"shooting":72,"playmaking":66,"perimeterDefense":61,"interiorDefense":36,"rebounding":51}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-adaymara','Aday Mara','OKC',ARRAY['C']::text[],76,'{"scoring":72,"shooting":30,"playmaking":61,"perimeterDefense":55,"interiorDefense":80,"rebounding":79}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-trevonbrazile','Trevon Brazile','DEN',ARRAY['C']::text[],77,'{"scoring":72,"shooting":42,"playmaking":59,"perimeterDefense":68,"interiorDefense":77,"rebounding":79}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-aaronwiggins','Aaron Wiggins','ATL',ARRAY['SG','SF']::text[],79,'{"scoring":78,"shooting":81,"playmaking":67,"perimeterDefense":76,"interiorDefense":46,"rebounding":57}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-luguentzdort','Luguentz Dort','ATL',ARRAY['SG','SF']::text[],80,'{"scoring":70,"shooting":74,"playmaking":61,"perimeterDefense":90,"interiorDefense":61,"rebounding":58}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jocklandale','Jock Landale','ATL',ARRAY['C']::text[],77,'{"scoring":68,"shooting":60,"playmaking":62,"perimeterDefense":61,"interiorDefense":76,"rebounding":80}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-coreykispert','Corey Kispert','ATL',ARRAY['SF']::text[],77,'{"scoring":69,"shooting":87,"playmaking":62,"perimeterDefense":60,"interiorDefense":38,"rebounding":51}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kingstonflemings','Kingston Flemings','ATL',ARRAY['SG']::text[],75,'{"scoring":72,"shooting":70,"playmaking":74,"perimeterDefense":69,"interiorDefense":30,"rebounding":52}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-asanewell','Asa Newell','ATL',ARRAY['SF']::text[],74,'{"scoring":72,"shooting":68,"playmaking":60,"perimeterDefense":74,"interiorDefense":74,"rebounding":70}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-dorianfinneysmith','Dorian Finney-Smith','ATL',ARRAY['SF','PF']::text[],76,'{"scoring":65,"shooting":80,"playmaking":55,"perimeterDefense":81,"interiorDefense":65,"rebounding":57}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jordanwalsh','Jordan Walsh','BOS',ARRAY['SF','PF']::text[],75,'{"scoring":62,"shooting":67,"playmaking":56,"perimeterDefense":84,"interiorDefense":67,"rebounding":65}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-baylorscheierman','Baylor Scheierman','BOS',ARRAY['SF','PF']::text[],76,'{"scoring":67,"shooting":80,"playmaking":64,"perimeterDefense":71,"interiorDefense":52,"rebounding":72}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-hugogonzalez','Hugo Gonzalez','BOS',ARRAY['SF']::text[],75,'{"scoring":66,"shooting":69,"playmaking":60,"perimeterDefense":82,"interiorDefense":55,"rebounding":62}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-mikeconley','Mike Conley','BOS',ARRAY['PG']::text[],74,'{"scoring":68,"shooting":76,"playmaking":82,"perimeterDefense":69,"interiorDefense":35,"rebounding":48}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-mitchellrobinson','Mitchell Robinson','BOS',ARRAY['C']::text[],79,'{"scoring":63,"shooting":10,"playmaking":46,"perimeterDefense":54,"interiorDefense":90,"rebounding":93}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-lukagarza','Luka Garza','BOS',ARRAY['C']::text[],73,'{"scoring":76,"shooting":70,"playmaking":50,"perimeterDefense":48,"interiorDefense":56,"rebounding":76}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-keonellis','Keon Ellis','BKN',ARRAY['SG']::text[],78,'{"scoring":65,"shooting":82,"playmaking":66,"perimeterDefense":88,"interiorDefense":41,"rebounding":53}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-mikelbrown','Mikel Brown Jr.','BKN',ARRAY['SG']::text[],76,'{"scoring":75,"shooting":76,"playmaking":78,"perimeterDefense":56,"interiorDefense":32,"rebounding":52}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-egordemin','Egor Demin','BKN',ARRAY['PG']::text[],75,'{"scoring":63,"shooting":72,"playmaking":80,"perimeterDefense":67,"interiorDefense":45,"rebounding":62}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-dayronsharpe','Day''Ron Sharpe','BKN',ARRAY['C']::text[],78,'{"scoring":68,"shooting":24,"playmaking":51,"perimeterDefense":51,"interiorDefense":78,"rebounding":88}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-noahclowney','Noah Clowney','BKN',ARRAY['SF']::text[],76,'{"scoring":66,"shooting":76,"playmaking":50,"perimeterDefense":71,"interiorDefense":82,"rebounding":78}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-nolantraore','Nolan Traore','BKN',ARRAY['PG']::text[],74,'{"scoring":70,"shooting":70,"playmaking":76,"perimeterDefense":68,"interiorDefense":33,"rebounding":50}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-moritzwagner','Moritz Wagner','BKN',ARRAY['C']::text[],77,'{"scoring":77,"shooting":77,"playmaking":62,"perimeterDefense":54,"interiorDefense":56,"rebounding":74}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-calebwilson','Caleb Wilson','CHI',ARRAY['SF','PF']::text[],77,'{"scoring":71,"shooting":60,"playmaking":63,"perimeterDefense":75,"interiorDefense":76,"rebounding":82}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jalensmith','Jalen Smith','CHI',ARRAY['PF','C']::text[],79,'{"scoring":72,"shooting":83,"playmaking":56,"perimeterDefense":58,"interiorDefense":71,"rebounding":83}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-trejones','Tre Jones','CHI',ARRAY['PG']::text[],78,'{"scoring":70,"shooting":69,"playmaking":78,"perimeterDefense":74,"interiorDefense":37,"rebounding":52}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-isaacokoro','Isaac Okoro','CHI',ARRAY['SF']::text[],75,'{"scoring":68,"shooting":66,"playmaking":53,"perimeterDefense":85,"interiorDefense":49,"rebounding":59}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-noaessengue','Noa Essengue','CHI',ARRAY['SF']::text[],72,'{"scoring":63,"shooting":60,"playmaking":58,"perimeterDefense":70,"interiorDefense":69,"rebounding":67}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-leonardmiller','Leonard Miller','CHI',ARRAY['SF','PF']::text[],73,'{"scoring":66,"shooting":59,"playmaking":54,"perimeterDefense":69,"interiorDefense":71,"rebounding":78}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-buddyhield','Buddy Hield','CHI',ARRAY['SG']::text[],76,'{"scoring":65,"shooting":89,"playmaking":56,"perimeterDefense":55,"interiorDefense":25,"rebounding":40}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-dennisschroder','Dennis Schröder','CHA',ARRAY['PG']::text[],78,'{"scoring":76,"shooting":71,"playmaking":79,"perimeterDefense":71,"interiorDefense":34,"rebounding":50}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-sionjames','Sion James','CHA',ARRAY['SF']::text[],75,'{"scoring":63,"shooting":66,"playmaking":62,"perimeterDefense":79,"interiorDefense":47,"rebounding":59}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-moussadiabate','Moussa Diabaté','CHA',ARRAY['C']::text[],79,'{"scoring":67,"shooting":27,"playmaking":61,"perimeterDefense":73,"interiorDefense":84,"rebounding":90}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-royceoneale','Royce O''Neale','CHA',ARRAY['SF']::text[],76,'{"scoring":68,"shooting":82,"playmaking":70,"perimeterDefense":77,"interiorDefense":60,"rebounding":66}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tidjanesalaun','Tidjane Salaün','CHA',ARRAY['SF']::text[],73,'{"scoring":66,"shooting":68,"playmaking":51,"perimeterDefense":68,"interiorDefense":63,"rebounding":71}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-hannessteinbach','Hannes Steinbach','CHA',ARRAY['C']::text[],73,'{"scoring":66,"shooting":50,"playmaking":60,"perimeterDefense":65,"interiorDefense":72,"rebounding":76}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-ryankalkbrenner','Ryan Kalkbrenner','CHA',ARRAY['C']::text[],75,'{"scoring":65,"shooting":16,"playmaking":46,"perimeterDefense":55,"interiorDefense":86,"rebounding":74}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-sammerrill','Sam Merrill','CLE',ARRAY['SG']::text[],79,'{"scoring":68,"shooting":90,"playmaking":59,"perimeterDefense":58,"interiorDefense":32,"rebounding":45}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jaylontyson','Jaylon Tyson','CLE',ARRAY['SF']::text[],80,'{"scoring":78,"shooting":87,"playmaking":67,"perimeterDefense":75,"interiorDefense":54,"rebounding":62}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-mariohezonja','Mario Hezonja','CLE',ARRAY['SF']::text[],75,'{"scoring":77,"shooting":77,"playmaking":63,"perimeterDefense":66,"interiorDefense":58,"rebounding":65}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tyreseproctor','Tyrese Proctor','CLE',ARRAY['SG']::text[],73,'{"scoring":73,"shooting":77,"playmaking":73,"perimeterDefense":72,"interiorDefense":33,"rebounding":49}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-craigporter','Craig Porter Jr.','CLE',ARRAY['SG']::text[],74,'{"scoring":68,"shooting":54,"playmaking":70,"perimeterDefense":76,"interiorDefense":37,"rebounding":52}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-danissjenkins','Daniss Jenkins','DET',ARRAY['SG']::text[],79,'{"scoring":77,"shooting":75,"playmaking":75,"perimeterDefense":73,"interiorDefense":33,"rebounding":53}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kevinhuerter','Kevin Huerter','DET',ARRAY['SG','SF']::text[],76,'{"scoring":71,"shooting":79,"playmaking":74,"perimeterDefense":59,"interiorDefense":35,"rebounding":51}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-javontegreen','Javonte Green','DET',ARRAY['SG']::text[],76,'{"scoring":70,"shooting":64,"playmaking":61,"perimeterDefense":81,"interiorDefense":58,"rebounding":66}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-johncollins','John Collins','DET',ARRAY['PF']::text[],80,'{"scoring":78,"shooting":81,"playmaking":57,"perimeterDefense":63,"interiorDefense":74,"rebounding":82}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-paulreed','Paul Reed','DET',ARRAY['PF','C']::text[],79,'{"scoring":65,"shooting":40,"playmaking":58,"perimeterDefense":76,"interiorDefense":83,"rebounding":84}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-ronaldholland','Ronald Holland II','DET',ARRAY['SF']::text[],75,'{"scoring":72,"shooting":52,"playmaking":57,"perimeterDefense":84,"interiorDefense":58,"rebounding":66}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-aaronnesmith','Aaron Nesmith','IND',ARRAY['SF']::text[],81,'{"scoring":76,"shooting":85,"playmaking":64,"perimeterDefense":86,"interiorDefense":57,"rebounding":61}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-quentonjackson','Quenton Jackson','IND',ARRAY['PG']::text[],76,'{"scoring":68,"shooting":53,"playmaking":58,"perimeterDefense":79,"interiorDefense":35,"rebounding":47}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-bensheppard','Ben Sheppard','IND',ARRAY['SG']::text[],74,'{"scoring":67,"shooting":81,"playmaking":55,"perimeterDefense":71,"interiorDefense":38,"rebounding":48}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tjmcconnell','T.J. McConnell','IND',ARRAY['PG']::text[],79,'{"scoring":76,"shooting":28,"playmaking":91,"perimeterDefense":72,"interiorDefense":24,"rebounding":51}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-obitoppin','Obi Toppin','IND',ARRAY['PF']::text[],80,'{"scoring":78,"shooting":66,"playmaking":60,"perimeterDefense":65,"interiorDefense":64,"rebounding":69}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jaracewalker','Jarace Walker','IND',ARRAY['SF']::text[],77,'{"scoring":74,"shooting":74,"playmaking":68,"perimeterDefense":78,"interiorDefense":77,"rebounding":76}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-davionmitchell','Davion Mitchell','MIA',ARRAY['PG']::text[],79,'{"scoring":68,"shooting":78,"playmaking":83,"perimeterDefense":89,"interiorDefense":25,"rebounding":44}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-pellelarsson','Pelle Larsson','MIA',ARRAY['SG']::text[],78,'{"scoring":71,"shooting":80,"playmaking":67,"perimeterDefense":79,"interiorDefense":50,"rebounding":55}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-timhardaway','Tim Hardaway Jr.','MIA',ARRAY['SF']::text[],76,'{"scoring":75,"shooting":88,"playmaking":52,"perimeterDefense":54,"interiorDefense":24,"rebounding":43}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-drusmith','Dru Smith','MIA',ARRAY['SG']::text[],73,'{"scoring":67,"shooting":67,"playmaking":69,"perimeterDefense":75,"interiorDefense":28,"rebounding":45}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-andrewwiggins','Andrew Wiggins','MIA',ARRAY['SF']::text[],82,'{"scoring":79,"shooting":81,"playmaking":67,"perimeterDefense":80,"interiorDefense":69,"rebounding":63}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-bobbyportis','Bobby Portis Jr.','MIA',ARRAY['PF','C']::text[],80,'{"scoring":77,"shooting":89,"playmaking":56,"perimeterDefense":63,"interiorDefense":59,"rebounding":82}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jaimejaquez','Jaime Jaquez Jr.','MIL',ARRAY['SF']::text[],80,'{"scoring":79,"shooting":66,"playmaking":79,"perimeterDefense":69,"interiorDefense":54,"rebounding":71}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-ryanrollins','Ryan Rollins','MIL',ARRAY['SG']::text[],78,'{"scoring":75,"shooting":81,"playmaking":79,"perimeterDefense":80,"interiorDefense":32,"rebounding":51}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kasparasjakucionis','Kasparas Jakucionis','MIL',ARRAY['PG']::text[],76,'{"scoring":67,"shooting":78,"playmaking":78,"perimeterDefense":56,"interiorDefense":29,"rebounding":51}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-ajgreen','AJ Green','MIL',ARRAY['SF']::text[],77,'{"scoring":66,"shooting":91,"playmaking":59,"perimeterDefense":69,"interiorDefense":35,"rebounding":46}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-braydenburries','Brayden Burries','MIL',ARRAY['SF']::text[],74,'{"scoring":71,"shooting":73,"playmaking":63,"perimeterDefense":57,"interiorDefense":28,"rebounding":46}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-kylekuzma','Kyle Kuzma','MIL',ARRAY['SF','PF']::text[],79,'{"scoring":79,"shooting":71,"playmaking":68,"perimeterDefense":68,"interiorDefense":68,"rebounding":72}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-nateament','Nate Ament','MIL',ARRAY['SF']::text[],73,'{"scoring":67,"shooting":75,"playmaking":58,"perimeterDefense":64,"interiorDefense":65,"rebounding":73}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-landryshamet','Landry Shamet','NYK',ARRAY['SG','SF']::text[],77,'{"scoring":68,"shooting":87,"playmaking":53,"perimeterDefense":64,"interiorDefense":28,"rebounding":43}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-milesmcbride','Miles McBride','NYK',ARRAY['SG']::text[],78,'{"scoring":71,"shooting":85,"playmaking":71,"perimeterDefense":87,"interiorDefense":33,"rebounding":46}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-tylerkolek','Tyler Kolek','NYK',ARRAY['PG']::text[],74,'{"scoring":65,"shooting":68,"playmaking":82,"perimeterDefense":52,"interiorDefense":25,"rebounding":45}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-josealvarado','Jose Alvarado','NYK',ARRAY['SG']::text[],76,'{"scoring":67,"shooting":75,"playmaking":79,"perimeterDefense":81,"interiorDefense":28,"rebounding":42}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-andredrummond','Andre Drummond','NYK',ARRAY['C']::text[],76,'{"scoring":66,"shooting":10,"playmaking":53,"perimeterDefense":43,"interiorDefense":68,"rebounding":90}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-anthonyblack','Anthony Black','ORL',ARRAY['PG']::text[],79,'{"scoring":73,"shooting":68,"playmaking":79,"perimeterDefense":84,"interiorDefense":55,"rebounding":69}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jevoncarter','Jevon Carter','ORL',ARRAY['SG']::text[],73,'{"scoring":62,"shooting":73,"playmaking":58,"perimeterDefense":79,"interiorDefense":23,"rebounding":42}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-jaserichardson','Jase Richardson','ORL',ARRAY['SG']::text[],74,'{"scoring":73,"shooting":76,"playmaking":69,"perimeterDefense":71,"interiorDefense":36,"rebounding":48}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tristandasilva','Tristan da Silva','ORL',ARRAY['SF']::text[],78,'{"scoring":73,"shooting":84,"playmaking":69,"perimeterDefense":75,"interiorDefense":61,"rebounding":65}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-wendellcarter','Wendell Carter Jr.','ORL',ARRAY['C']::text[],80,'{"scoring":73,"shooting":62,"playmaking":63,"perimeterDefense":67,"interiorDefense":80,"rebounding":81}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-gogabitadze','Goga Bitadze','ORL',ARRAY['C']::text[],77,'{"scoring":69,"shooting":29,"playmaking":59,"perimeterDefense":52,"interiorDefense":81,"rebounding":82}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kentaviouscaldwellpope','Kentavious Caldwell-Pope','PHI',ARRAY['SF']::text[],77,'{"scoring":63,"shooting":80,"playmaking":51,"perimeterDefense":83,"interiorDefense":30,"rebounding":49}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-anferneesimons','Anfernee Simons','PHI',ARRAY['SG']::text[],79,'{"scoring":82,"shooting":84,"playmaking":75,"perimeterDefense":55,"interiorDefense":32,"rebounding":47}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-labaronphilon','Labaron Philon Jr.','PHI',ARRAY['PG']::text[],73,'{"scoring":67,"shooting":66,"playmaking":67,"perimeterDefense":58,"interiorDefense":27,"rebounding":40}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-deanwade','Dean Wade','PHI',ARRAY['SF']::text[],76,'{"scoring":65,"shooting":83,"playmaking":51,"perimeterDefense":78,"interiorDefense":64,"rebounding":72}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-adembona','Adem Bona','PHI',ARRAY['C']::text[],74,'{"scoring":65,"shooting":11,"playmaking":43,"perimeterDefense":49,"interiorDefense":84,"rebounding":71}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jabariwalker','Jabari Walker','PHI',ARRAY['SF','PF']::text[],73,'{"scoring":65,"shooting":54,"playmaking":53,"perimeterDefense":64,"interiorDefense":62,"rebounding":81}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-jakobewalter','Ja''Kobe Walter','TOR',ARRAY['SG','SF']::text[],78,'{"scoring":77,"shooting":84,"playmaking":58,"perimeterDefense":65,"interiorDefense":36,"rebounding":48}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jamalshead','Jamal Shead','TOR',ARRAY['PG']::text[],76,'{"scoring":63,"shooting":50,"playmaking":80,"perimeterDefense":86,"interiorDefense":23,"rebounding":42}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-allengraves','Allen Graves','TOR',ARRAY['SF']::text[],72,'{"scoring":70,"shooting":67,"playmaking":60,"perimeterDefense":66,"interiorDefense":59,"rebounding":70}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-jamisonbattle','Jamison Battle','TOR',ARRAY['SF']::text[],75,'{"scoring":68,"shooting":85,"playmaking":48,"perimeterDefense":57,"interiorDefense":35,"rebounding":58}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-traycejacksondavis','Trayce Jackson-Davis','TOR',ARRAY['C']::text[],74,'{"scoring":69,"shooting":18,"playmaking":76,"perimeterDefense":61,"interiorDefense":75,"rebounding":74}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jakobpoeltl','Jakob Poeltl','TOR',ARRAY['C']::text[],78,'{"scoring":74,"shooting":10,"playmaking":79,"perimeterDefense":48,"interiorDefense":85,"rebounding":84}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-bilalcoulibaly','Bilal Coulibaly','WAS',ARRAY['SG','SF']::text[],80,'{"scoring":68,"shooting":69,"playmaking":56,"perimeterDefense":90,"interiorDefense":63,"rebounding":65}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-kyshawngeorge','Kyshawn George','WAS',ARRAY['SF']::text[],79,'{"scoring":75,"shooting":79,"playmaking":71,"perimeterDefense":75,"interiorDefense":61,"rebounding":66}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-bubcarrington','Bub Carrington','WAS',ARRAY['PG']::text[],75,'{"scoring":69,"shooting":82,"playmaking":75,"perimeterDefense":60,"interiorDefense":35,"rebounding":53}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-justinchampagnie','Justin Champagnie','WAS',ARRAY['SF','PF']::text[],76,'{"scoring":69,"shooting":72,"playmaking":53,"perimeterDefense":72,"interiorDefense":55,"rebounding":79}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-khrismiddleton','Khris Middleton','WAS',ARRAY['SF']::text[],75,'{"scoring":75,"shooting":79,"playmaking":79,"perimeterDefense":61,"interiorDefense":50,"rebounding":58}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tremann','Tre Mann','WAS',ARRAY['SG']::text[],73,'{"scoring":75,"shooting":77,"playmaking":64,"perimeterDefense":53,"interiorDefense":27,"rebounding":45}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-deandreayton','Deandre Ayton','WAS',ARRAY['C']::text[],78,'{"scoring":75,"shooting":38,"playmaking":56,"perimeterDefense":54,"interiorDefense":70,"rebounding":86}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-maxchristie','Max Christie','DAL',ARRAY['SF']::text[],78,'{"scoring":73,"shooting":84,"playmaking":59,"perimeterDefense":80,"interiorDefense":49,"rebounding":53}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-marcussasser','Marcus Sasser','DAL',ARRAY['SG']::text[],75,'{"scoring":72,"shooting":83,"playmaking":66,"perimeterDefense":73,"interiorDefense":21,"rebounding":40}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-zaccharierisacher','Zaccharie Risacher','DAL',ARRAY['SF']::text[],77,'{"scoring":74,"shooting":79,"playmaking":57,"perimeterDefense":76,"interiorDefense":54,"rebounding":60}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-danielgafford','Daniel Gafford','DAL',ARRAY['C']::text[],80,'{"scoring":74,"shooting":20,"playmaking":51,"perimeterDefense":56,"interiorDefense":84,"rebounding":84}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-morezjohnson','Morez Johnson Jr.','DAL',ARRAY['C']::text[],74,'{"scoring":68,"shooting":32,"playmaking":53,"perimeterDefense":67,"interiorDefense":77,"rebounding":79}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-derecklively','Dereck Lively II','DAL',ARRAY['C']::text[],80,'{"scoring":72,"shooting":28,"playmaking":74,"perimeterDefense":63,"interiorDefense":87,"rebounding":86}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-christianbraun','Christian Braun','DEN',ARRAY['SG','SF']::text[],81,'{"scoring":76,"shooting":70,"playmaking":68,"perimeterDefense":75,"interiorDefense":65,"rebounding":65}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-tyusjones','Tyus Jones','DEN',ARRAY['PG']::text[],75,'{"scoring":66,"shooting":78,"playmaking":83,"perimeterDefense":63,"interiorDefense":33,"rebounding":47}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-julianstrawther','Julian Strawther','DEN',ARRAY['SG','SF']::text[],76,'{"scoring":73,"shooting":82,"playmaking":56,"perimeterDefense":59,"interiorDefense":32,"rebounding":49}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-marvinbagley','Marvin Bagley III','DEN',ARRAY['C']::text[],74,'{"scoring":73,"shooting":36,"playmaking":52,"perimeterDefense":46,"interiorDefense":58,"rebounding":79}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-camwhitmore','Cam Whitmore','DEN',ARRAY['SF']::text[],74,'{"scoring":80,"shooting":63,"playmaking":51,"perimeterDefense":57,"interiorDefense":54,"rebounding":64}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-zekennaji','Zeke Nnaji','DEN',ARRAY['C']::text[],72,'{"scoring":62,"shooting":65,"playmaking":53,"perimeterDefense":66,"interiorDefense":73,"rebounding":72}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-deanthonymelton','De''Anthony Melton','GSW',ARRAY['SG']::text[],79,'{"scoring":73,"shooting":76,"playmaking":70,"perimeterDefense":87,"interiorDefense":33,"rebounding":54}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-willrichard','Will Richard','GSW',ARRAY['SF']::text[],74,'{"scoring":67,"shooting":81,"playmaking":53,"perimeterDefense":77,"interiorDefense":27,"rebounding":44}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-brandonwilliams','Brandon Williams','GSW',ARRAY['SG']::text[],76,'{"scoring":75,"shooting":69,"playmaking":77,"perimeterDefense":65,"interiorDefense":36,"rebounding":48}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-garypayton','Gary Payton II','GSW',ARRAY['SG']::text[],77,'{"scoring":67,"shooting":54,"playmaking":50,"perimeterDefense":94,"interiorDefense":55,"rebounding":60}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-guisantos','Gui Santos','GSW',ARRAY['SF']::text[],78,'{"scoring":73,"shooting":70,"playmaking":72,"perimeterDefense":72,"interiorDefense":57,"rebounding":68}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-kristapsporzingis','Kristaps Porzingis','GSW',ARRAY['C']::text[],84,'{"scoring":85,"shooting":89,"playmaking":60,"perimeterDefense":64,"interiorDefense":92,"rebounding":79}'::jsonb,ARRAY[25000000,25900000,26800000]::bigint[],'unverified'),
('nba-gm-draft-alhorford','Al Horford','GSW',ARRAY['C']::text[],77,'{"scoring":67,"shooting":82,"playmaking":70,"perimeterDefense":65,"interiorDefense":77,"rebounding":72}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-marcussmart','Marcus Smart','HOU',ARRAY['PG']::text[],77,'{"scoring":67,"shooting":67,"playmaking":73,"perimeterDefense":81,"interiorDefense":56,"rebounding":55}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-bogdanbogdanovic','Bogdan Bogdanovic','HOU',ARRAY['PG']::text[],75,'{"scoring":73,"shooting":85,"playmaking":74,"perimeterDefense":57,"interiorDefense":28,"rebounding":45}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-clintcapela','Clint Capela','HOU',ARRAY['C']::text[],77,'{"scoring":66,"shooting":14,"playmaking":49,"perimeterDefense":48,"interiorDefense":83,"rebounding":87}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-stevenadams','Steven Adams','HOU',ARRAY['C']::text[],76,'{"scoring":62,"shooting":10,"playmaking":64,"perimeterDefense":48,"interiorDefense":78,"rebounding":94}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-oscartshiebwe','Oscar Tshiebwe','HOU',ARRAY['C']::text[],73,'{"scoring":64,"shooting":14,"playmaking":40,"perimeterDefense":50,"interiorDefense":63,"rebounding":96}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-krisdunn','Kris Dunn','LAC',ARRAY['SG']::text[],79,'{"scoring":64,"shooting":60,"playmaking":78,"perimeterDefense":91,"interiorDefense":44,"rebounding":57}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-keatonwagler','Keaton Wagler','LAC',ARRAY['SG']::text[],76,'{"scoring":73,"shooting":75,"playmaking":71,"perimeterDefense":58,"interiorDefense":27,"rebounding":42}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-gradeydick','Gradey Dick','LAC',ARRAY['SG','SF']::text[],75,'{"scoring":74,"shooting":77,"playmaking":63,"perimeterDefense":58,"interiorDefense":36,"rebounding":48}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-ruihachimura','Rui Hachimura','LAC',ARRAY['PF','SF']::text[],78,'{"scoring":77,"shooting":87,"playmaking":62,"perimeterDefense":69,"interiorDefense":66,"rebounding":63}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-derrickjones','Derrick Jones Jr.','LAC',ARRAY['SF','PF']::text[],79,'{"scoring":71,"shooting":56,"playmaking":47,"perimeterDefense":89,"interiorDefense":69,"rebounding":67}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-isaiahjackson','Isaiah Jackson','LAC',ARRAY['C']::text[],76,'{"scoring":66,"shooting":12,"playmaking":51,"perimeterDefense":48,"interiorDefense":87,"rebounding":79}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-brooklopez','Brook Lopez','LAC',ARRAY['C']::text[],77,'{"scoring":65,"shooting":84,"playmaking":51,"perimeterDefense":37,"interiorDefense":84,"rebounding":68}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-quentingrimes','Quentin Grimes','LAL',ARRAY['SG','SF']::text[],79,'{"scoring":76,"shooting":84,"playmaking":63,"perimeterDefense":83,"interiorDefense":40,"rebounding":55}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-matissethybulle','Matisse Thybulle','LAL',ARRAY['SF']::text[],78,'{"scoring":60,"shooting":65,"playmaking":49,"perimeterDefense":92,"interiorDefense":39,"rebounding":53}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-collinsexton','Collin Sexton','LAL',ARRAY['SG']::text[],77,'{"scoring":84,"shooting":82,"playmaking":70,"perimeterDefense":59,"interiorDefense":25,"rebounding":43}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-ziairewilliams','Ziaire Williams','LAL',ARRAY['SF']::text[],76,'{"scoring":72,"shooting":65,"playmaking":53,"perimeterDefense":82,"interiorDefense":60,"rebounding":67}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jakelaravia','Jake LaRavia','LAL',ARRAY['SF']::text[],76,'{"scoring":72,"shooting":75,"playmaking":67,"perimeterDefense":74,"interiorDefense":57,"rebounding":69}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jarredvanderbilt','Jarred Vanderbilt','LAL',ARRAY['SF','PF']::text[],76,'{"scoring":61,"shooting":35,"playmaking":51,"perimeterDefense":86,"interiorDefense":74,"rebounding":91}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-cedriccoward','Cedric Coward','MEM',ARRAY['SF','PF']::text[],79,'{"scoring":76,"shooting":75,"playmaking":65,"perimeterDefense":81,"interiorDefense":63,"rebounding":67}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jaylenwells','Jaylen Wells','MEM',ARRAY['SF']::text[],78,'{"scoring":72,"shooting":82,"playmaking":57,"perimeterDefense":83,"interiorDefense":59,"rebounding":65}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jeramigrant','Jerami Grant','MEM',ARRAY['PF']::text[],79,'{"scoring":78,"shooting":83,"playmaking":60,"perimeterDefense":73,"interiorDefense":57,"rebounding":62}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-isaiahstewart','Isaiah Stewart','MEM',ARRAY['PF','C']::text[],79,'{"scoring":70,"shooting":76,"playmaking":57,"perimeterDefense":74,"interiorDefense":89,"rebounding":79}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-zachedey','Zach Edey','MEM',ARRAY['C']::text[],78,'{"scoring":73,"shooting":30,"playmaking":56,"perimeterDefense":50,"interiorDefense":82,"rebounding":87}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-scottypippen','Scotty Pippen Jr.','MEM',ARRAY['PG']::text[],75,'{"scoring":73,"shooting":59,"playmaking":77,"perimeterDefense":68,"interiorDefense":22,"rebounding":46}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-ggjackson','GG Jackson','MEM',ARRAY['SF']::text[],74,'{"scoring":73,"shooting":67,"playmaking":58,"perimeterDefense":64,"interiorDefense":56,"rebounding":68}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-terrenceshannon','Terrence Shannon Jr.','MIN',ARRAY['SF']::text[],76,'{"scoring":76,"shooting":66,"playmaking":60,"perimeterDefense":72,"interiorDefense":51,"rebounding":56}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-treylyles','Trey Lyles','MIN',ARRAY['SF','PF']::text[],75,'{"scoring":72,"shooting":81,"playmaking":57,"perimeterDefense":53,"interiorDefense":58,"rebounding":78}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-joanberinger','Joan Beringer','MIN',ARRAY['C']::text[],74,'{"scoring":62,"shooting":28,"playmaking":49,"perimeterDefense":66,"interiorDefense":79,"rebounding":78}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-boneshyland','Bones Hyland','MIN',ARRAY['SG']::text[],72,'{"scoring":78,"shooting":80,"playmaking":65,"perimeterDefense":47,"interiorDefense":20,"rebounding":39}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-jaylenclark','Jaylen Clark','MIN',ARRAY['SG']::text[],71,'{"scoring":60,"shooting":55,"playmaking":44,"perimeterDefense":82,"interiorDefense":38,"rebounding":47}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-jeremiahfears','Jeremiah Fears','NOP',ARRAY['SG']::text[],76,'{"scoring":77,"shooting":67,"playmaking":72,"perimeterDefense":64,"interiorDefense":25,"rebounding":44}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-bennedictmathurin','Bennedict Mathurin','NOP',ARRAY['SG','SF']::text[],79,'{"scoring":84,"shooting":73,"playmaking":55,"perimeterDefense":58,"interiorDefense":38,"rebounding":59}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jordanpoole','Jordan Poole','NOP',ARRAY['SG','PG']::text[],76,'{"scoring":80,"shooting":79,"playmaking":75,"perimeterDefense":50,"interiorDefense":29,"rebounding":49}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-saddiqbey','Saddiq Bey','NOP',ARRAY['SF','PF']::text[],77,'{"scoring":75,"shooting":80,"playmaking":59,"perimeterDefense":64,"interiorDefense":57,"rebounding":70}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-derikqueen','Derik Queen','NOP',ARRAY['C']::text[],78,'{"scoring":78,"shooting":34,"playmaking":85,"perimeterDefense":46,"interiorDefense":52,"rebounding":82}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-yvesmissi','Yves Missi','NOP',ARRAY['C']::text[],76,'{"scoring":69,"shooting":15,"playmaking":43,"perimeterDefense":55,"interiorDefense":84,"rebounding":78}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jaredmccain','Jared McCain','OKC',ARRAY['SG','SF']::text[],78,'{"scoring":79,"shooting":83,"playmaking":63,"perimeterDefense":69,"interiorDefense":36,"rebounding":49}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-joshdix','Josh Dix','OKC',ARRAY['SG']::text[],73,'{"scoring":64,"shooting":73,"playmaking":52,"perimeterDefense":77,"interiorDefense":34,"rebounding":44}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-kenrichwilliams','Kenrich Williams','OKC',ARRAY['SF','PF']::text[],75,'{"scoring":64,"shooting":70,"playmaking":62,"perimeterDefense":79,"interiorDefense":67,"rebounding":75}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jaylinwilliams','Jaylin Williams','OKC',ARRAY['SF']::text[],77,'{"scoring":68,"shooting":80,"playmaking":82,"perimeterDefense":55,"interiorDefense":64,"rebounding":77}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-thomassorber','Thomas Sorber','OKC',ARRAY['C']::text[],72,'{"scoring":65,"shooting":40,"playmaking":60,"perimeterDefense":61,"interiorDefense":77,"rebounding":74}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-milesbridges','Miles Bridges','PHX',ARRAY['SF','PF']::text[],81,'{"scoring":83,"shooting":79,"playmaking":69,"perimeterDefense":65,"interiorDefense":63,"rebounding":83}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-jalengreen','Jalen Green','PHX',ARRAY['SG']::text[],81,'{"scoring":85,"shooting":80,"playmaking":73,"perimeterDefense":65,"interiorDefense":44,"rebounding":56}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-collingillespie','Collin Gillespie','PHX',ARRAY['PG']::text[],78,'{"scoring":75,"shooting":83,"playmaking":83,"perimeterDefense":70,"interiorDefense":30,"rebounding":47}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jordangoodwin','Jordan Goodwin','PHX',ARRAY['SG']::text[],76,'{"scoring":64,"shooting":63,"playmaking":57,"perimeterDefense":87,"interiorDefense":38,"rebounding":86}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-khamanmaluach','Khaman Maluach','PHX',ARRAY['C']::text[],76,'{"scoring":61,"shooting":30,"playmaking":48,"perimeterDefense":48,"interiorDefense":84,"rebounding":78}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-markwilliams','Mark Williams','PHX',ARRAY['C']::text[],79,'{"scoring":73,"shooting":25,"playmaking":56,"perimeterDefense":54,"interiorDefense":81,"rebounding":87}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-sidycissoko','Sidy Cissoko','POR',ARRAY['SF']::text[],76,'{"scoring":67,"shooting":60,"playmaking":59,"perimeterDefense":85,"interiorDefense":55,"rebounding":67}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-scoothenderson','Scoot Henderson','POR',ARRAY['SG']::text[],75,'{"scoring":75,"shooting":63,"playmaking":80,"perimeterDefense":65,"interiorDefense":35,"rebounding":55}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-robertwilliams','Robert Williams III','POR',ARRAY['C']::text[],78,'{"scoring":67,"shooting":30,"playmaking":61,"perimeterDefense":68,"interiorDefense":91,"rebounding":80}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-micahpotter','Micah Potter','POR',ARRAY['PF','C']::text[],73,'{"scoring":66,"shooting":80,"playmaking":53,"perimeterDefense":44,"interiorDefense":62,"rebounding":68}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-yanghansen','Yang Hansen','POR',ARRAY['C']::text[],73,'{"scoring":63,"shooting":62,"playmaking":80,"perimeterDefense":36,"interiorDefense":61,"rebounding":73}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-vitkrejci','Vit Krejci','POR',ARRAY['SF']::text[],74,'{"scoring":69,"shooting":79,"playmaking":78,"perimeterDefense":62,"interiorDefense":35,"rebounding":53}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-dariusacuff','Darius Acuff Jr.','SAC',ARRAY['SG']::text[],78,'{"scoring":75,"shooting":75,"playmaking":79,"perimeterDefense":64,"interiorDefense":35,"rebounding":53}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-preciousachiuwa','Precious Achiuwa','SAC',ARRAY['SF','PF']::text[],76,'{"scoring":66,"shooting":42,"playmaking":53,"perimeterDefense":78,"interiorDefense":75,"rebounding":82}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-deandrehunter','De''Andre Hunter','SAC',ARRAY['SF']::text[],79,'{"scoring":79,"shooting":78,"playmaking":61,"perimeterDefense":70,"interiorDefense":63,"rebounding":64}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-malikmonk','Malik Monk','SAC',ARRAY['SG']::text[],80,'{"scoring":81,"shooting":83,"playmaking":72,"perimeterDefense":61,"interiorDefense":37,"rebounding":51}'::jsonb,ARRAY[19000000,19700000,20300000]::bigint[],'unverified'),
('nba-gm-draft-niqueclifford','Nique Clifford','SAC',ARRAY['SF']::text[],73,'{"scoring":70,"shooting":68,"playmaking":64,"perimeterDefense":71,"interiorDefense":52,"rebounding":60}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-maximeraynaud','Maxime Raynaud','SAC',ARRAY['C']::text[],75,'{"scoring":70,"shooting":60,"playmaking":52,"perimeterDefense":55,"interiorDefense":75,"rebounding":81}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-keldonjohnson','Keldon Johnson','SAS',ARRAY['SF','PF']::text[],78,'{"scoring":83,"shooting":67,"playmaking":61,"perimeterDefense":68,"interiorDefense":64,"rebounding":78}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-lukekornet','Luke Kornet','SAS',ARRAY['C']::text[],78,'{"scoring":65,"shooting":16,"playmaking":70,"perimeterDefense":58,"interiorDefense":84,"rebounding":80}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-carterbryant','Carter Bryant','SAS',ARRAY['SF']::text[],74,'{"scoring":62,"shooting":71,"playmaking":48,"perimeterDefense":80,"interiorDefense":58,"rebounding":65}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-harrisonbarnes','Harrison Barnes','SAS',ARRAY['SF']::text[],74,'{"scoring":70,"shooting":83,"playmaking":55,"perimeterDefense":64,"interiorDefense":54,"rebounding":62}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-tarrisreed','Tarris Reed Jr.','SAS',ARRAY['C']::text[],72,'{"scoring":68,"shooting":24,"playmaking":54,"perimeterDefense":53,"interiorDefense":74,"rebounding":76}'::jsonb,ARRAY[5000000,5200000,5400000]::bigint[],'unverified'),
('nba-gm-draft-darrynpeterson','Darryn Peterson','UTA',ARRAY['SG']::text[],77,'{"scoring":75,"shooting":76,"playmaking":65,"perimeterDefense":63,"interiorDefense":37,"rebounding":50}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-acebailey','Ace Bailey','UTA',ARRAY['SF']::text[],76,'{"scoring":73,"shooting":71,"playmaking":56,"perimeterDefense":74,"interiorDefense":54,"rebounding":62}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-isaiahcollier','Isaiah Collier','UTA',ARRAY['PG']::text[],76,'{"scoring":68,"shooting":53,"playmaking":81,"perimeterDefense":67,"interiorDefense":37,"rebounding":59}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-joshgreen','Josh Green','UTA',ARRAY['SF']::text[],74,'{"scoring":67,"shooting":71,"playmaking":60,"perimeterDefense":80,"interiorDefense":51,"rebounding":57}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-joshokogie','Josh Okogie','UTA',ARRAY['SF']::text[],74,'{"scoring":64,"shooting":56,"playmaking":47,"perimeterDefense":84,"interiorDefense":51,"rebounding":60}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-bricesensabaugh','Brice Sensabaugh','UTA',ARRAY['SF']::text[],75,'{"scoring":80,"shooting":85,"playmaking":54,"perimeterDefense":50,"interiorDefense":32,"rebounding":56}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-jaxsonhayes','Jaxson Hayes','UTA',ARRAY['SF','PF']::text[],77,'{"scoring":67,"shooting":13,"playmaking":42,"perimeterDefense":51,"interiorDefense":72,"rebounding":76}'::jsonb,ARRAY[14000000,14500000,15000000]::bigint[],'unverified'),
('nba-gm-draft-jusufnurkic','Jusuf Nurkic','UTA',ARRAY['C']::text[],76,'{"scoring":67,"shooting":45,"playmaking":75,"perimeterDefense":49,"interiorDefense":64,"rebounding":85}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified'),
('nba-gm-draft-mobamba','Mo Bamba','UTA',ARRAY['PF','C']::text[],74,'{"scoring":65,"shooting":73,"playmaking":45,"perimeterDefense":51,"interiorDefense":77,"rebounding":73}'::jsonb,ARRAY[9000000,9300000,9600000]::bigint[],'unverified')
on conflict (id) do update set
 name=excluded.name,team_code=excluded.team_code,positions=excluded.positions,
 overall=excluded.overall,skills=excluded.skills,salaries=excluded.salaries,position_review=excluded.position_review;

-- Football GM must never resume an NBA GM playtest from their shared private persistence.
create or replace function public.load_my_latest_football_gm_run()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select run.state from private.football_gm_runs run
  where run.profile_id = (select auth.uid()) and run.completed_at is null
    and run.game_version like 'football-gm-%'
    and coalesce(run.state ->> 'phase', '') <> 'final'
  order by run.updated_at desc limit 1;
$$;
revoke all on function public.load_my_latest_football_gm_run() from public, anon;
grant execute on function public.load_my_latest_football_gm_run() to authenticated;

create or replace function public.nba_gm_dev_action(
 p_action text, p_expected_revision integer default null,
 p_slot text default null, p_player_id text default null
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
 v_uid uuid := auth.uid();
 v_id uuid; v_state jsonb; v_version constant text := 'nba-gm-dev-v1';
 v_picks jsonb; v_pending text; v_previous text; v_spin integer; v_rev integer;
 v_slot text; v_player private.nba_gm_dev_catalog%rowtype;
 v_candidate_count integer; v_chosen_team text; v_cap constant bigint := 185000000;
 v_spend bigint[] := array[0::bigint,0::bigint,0::bigint];
 v_reserved bigint; v_total bigint; v_year integer; v_open text[];
 v_eligible text[]; v_team text; v_possible boolean; v_used_ids text[];
 v_off numeric; v_def numeric; v_power numeric; v_balance numeric; v_season integer;
 v_wins integer; v_shift integer; v_finish text; v_results jsonb := '[]'::jsonb;
 v_seed text; v_result jsonb; v_catalog jsonb;
begin
 if v_uid is null or not exists (
   select 1 from public.profiles p
   join public.pick_control_owners o on o.profile_id=p.id
   where p.id=v_uid and upper(trim(p.display_name))='CODY'
 ) then raise exception 'NBA GM private development access required'; end if;
 if p_action not in ('load','new','spin','pick','finish') then raise exception 'unsupported NBA GM action'; end if;

 if p_action <> 'new' then
   select r.id,r.state into v_id,v_state
   from private.football_gm_runs r
   where r.profile_id=v_uid and r.game_version=v_version
   order by r.updated_at desc limit 1 for update;
 end if;
 if p_action='new' then
   v_seed := extensions.gen_random_uuid()::text;
   v_state := jsonb_build_object('version',v_version,'seed',v_seed,'phase','draft',
      'revision',0,'picks','[]'::jsonb,'spinIndex',0,'pendingTeam',null,
      'previousTeam',null,'devSalaryCap',v_cap,'salaryType','FICTIONAL DEVELOPMENT FIXTURE',
      'positionType','PROVISIONAL, NOT CERTIFIED','results',null);
   insert into private.football_gm_runs (profile_id,seed,game_version,state)
   values (v_uid,v_seed,v_version,v_state) returning id into v_id;
   insert into private.football_gm_run_snapshots(run_id,revision,state) values (v_id,1,v_state);
 elsif p_action <> 'load' then
   if v_state is null then raise exception 'Start a new NBA GM development run.'; end if;
   v_rev := (v_state->>'revision')::integer;
   if p_expected_revision is null or p_expected_revision <> v_rev then
     raise exception 'Game changed on another device. Reload before continuing.';
   end if;
   if v_state->>'phase' <> 'draft' then raise exception 'This NBA GM draft is already finished.'; end if;
   v_picks := v_state->'picks';
   select coalesce(array_agg(pick->>'playerId'),array[]::text[]) into v_used_ids
   from jsonb_array_elements(v_picks) pick;
   select coalesce(array_agg(slot),array[]::text[]) into v_open
   from unnest(array['PG','SG','SF','PF','C','SIXTH','FLEX']) slot
   where not exists(select 1 from jsonb_array_elements(v_picks) pick where pick->>'slot'=slot);
   for v_year in 1..3 loop
     select coalesce(sum(c.salaries[v_year]),0) into v_spend[v_year]
     from jsonb_array_elements(v_picks) pick
     join private.nba_gm_dev_catalog c on c.id=pick->>'playerId';
   end loop;

   if p_action='spin' then
     if v_state->>'pendingTeam' is not null then raise exception 'Select a player from your current wheel team first.'; end if;
     if array_length(v_open,1) is null then raise exception 'Roster already complete.'; end if;
     -- Find real affordable choices for the remaining slot(s), never spin an empty team.
     select array_agg(team order by team) into v_eligible from (
       select distinct c.team_code as team from private.nba_gm_dev_catalog c
       where not(c.id=any(v_used_ids))
         and exists(select 1 from unnest(v_open) s where s in ('SIXTH','FLEX') or s=any(c.positions))
         and not exists (
           select 1 from generate_series(1,3) y
           where v_spend[y]+c.salaries[y]>v_cap
         )
     ) teams;
     if array_length(v_eligible,1) is null then raise exception 'No affordable teams remain; start another development run.'; end if;
     v_previous := v_state->>'previousTeam'; v_spin := (v_state->>'spinIndex')::integer;
     select team into v_chosen_team
     from unnest(v_eligible) team
     order by case when array_length(v_eligible,1)>1 and team=v_previous then 1 else 0 end,
              md5((v_state->>'seed')||':'||v_spin||':'||team)
     limit 1;
     v_state := jsonb_set(v_state,'{pendingTeam}',to_jsonb(v_chosen_team));
     v_state := jsonb_set(v_state,'{previousTeam}',to_jsonb(v_chosen_team));
     v_state := jsonb_set(v_state,'{spinIndex}',to_jsonb(v_spin+1));
   elsif p_action='pick' then
     v_pending:=v_state->>'pendingTeam'; v_slot:=upper(coalesce(p_slot,''));
     if v_pending is null then raise exception 'Spin for a team before selecting.'; end if;
     if not(v_slot=any(v_open)) then raise exception 'This roster slot is filled or invalid.'; end if;
     select * into v_player from private.nba_gm_dev_catalog where id=p_player_id and team_code=v_pending;
     if not found or v_player.id=any(v_used_ids) then raise exception 'Invalid, duplicate, or wrong-team player.'; end if;
     if v_slot not in ('SIXTH','FLEX') and not(v_slot=any(v_player.positions)) then
       raise exception 'Player is ineligible for this roster position.';
     end if;
     for v_year in 1..3 loop
       if v_spend[v_year]+v_player.salaries[v_year]>v_cap then
         raise exception 'Development salary cap exceeded in season %.',v_year;
       end if;
       -- Football GM-style affordable slot reserve; never consume the last dollar
       -- needed for at least one remaining candidate per unfilled slot.
       select coalesce(sum(min_salary),0) into v_reserved from (
         select min(c.salaries[v_year]) as min_salary from unnest(v_open) s
         join private.nba_gm_dev_catalog c
           on (s in ('SIXTH','FLEX') or s=any(c.positions))
           and c.id<>v_player.id and not(c.id=any(v_used_ids))
         where s<>v_slot group by s
       ) reserves;
       if v_spend[v_year]+v_player.salaries[v_year]+v_reserved>v_cap then
         raise exception 'Pick would leave insufficient cap room for the other slots in season %.',v_year;
       end if;
     end loop;
     v_picks := v_picks || jsonb_build_array(jsonb_build_object('slot',v_slot,'playerId',v_player.id));
     v_state := jsonb_set(v_state,'{picks}',v_picks);
     v_state := jsonb_set(v_state,'{pendingTeam}','null'::jsonb);
   elsif p_action='finish' then
     if jsonb_array_length(v_picks)<>7 or array_length(v_open,1) is not null then
       raise exception 'Complete all seven NBA GM roster slots first.';
     end if;
     -- Composite on-court strength, not a mean of overall ratings or 6 skills:
     -- role-weighted creation/spacing + guard/paint defense, rebound control,
     -- weak-link penalties, and distinct starter/bench contribution.
     select
       (sum((case when p->>'slot' in ('PG','SG') then 1.15 when p->>'slot' in ('SIXTH','FLEX') then 0.50 else 1 end)
          *(0.41*(c.skills->>'scoring')::numeric+0.34*(c.skills->>'shooting')::numeric
            +0.25*(c.skills->>'playmaking')::numeric))/5.0),
       (sum((case when p->>'slot' in ('C','PF') then 1.20 when p->>'slot' in ('SIXTH','FLEX') then 0.48 else 1 end)
          *(0.35*(c.skills->>'perimeterDefense')::numeric
            +0.39*(c.skills->>'interiorDefense')::numeric
            +0.26*(c.skills->>'rebounding')::numeric))/5.0)
     into v_off,v_def
     from jsonb_array_elements(v_picks) p join private.nba_gm_dev_catalog c on c.id=p->>'playerId';
     select least(
       coalesce(min((c.skills->>'playmaking')::numeric) filter (where p->>'slot'='PG'),0),
       coalesce(min((c.skills->>'interiorDefense')::numeric) filter (where p->>'slot'='C'),0),
       coalesce(min((c.skills->>'rebounding')::numeric) filter (where p->>'slot' in ('C','PF')),0)
     ) into v_balance
     from jsonb_array_elements(v_picks) p join private.nba_gm_dev_catalog c on c.id=p->>'playerId';
     v_power := 0.53*v_off+0.47*v_def - greatest(0,72-v_balance)*0.16;
     for v_season in 1..3 loop
       v_shift := (('x'||substr(md5((v_state->>'seed')||':nba-season:'||v_season),1,7))::bit(28)::integer % 11)-5;
       v_wins := greatest(10,least(70,round(41+(v_power-77)*1.7+v_shift)::integer));
       v_finish := case when v_wins<37 then 'Lottery'
                        when v_wins<42 then 'Play-In'
                        when v_wins<47 then 'First Round'
                        when v_wins<53 then 'Conference Semifinals'
                        when v_wins<59 then 'Conference Finals'
                        when v_wins<65 then 'NBA Finals' else 'Champion' end;
       v_results := v_results || jsonb_build_array(jsonb_build_object('season',v_season,
         'wins',v_wins,'losses',82-v_wins,'finish',v_finish,'offense',round(v_off,1),
         'defense',round(v_def,1),'rosterBalance',round(v_balance,1),'teamStrength',round(v_power,1)));
     end loop;
     v_state := jsonb_set(v_state,'{results}',v_results);
     v_state := jsonb_set(v_state,'{phase}',to_jsonb('final'::text));
   end if;
   v_state := jsonb_set(v_state,'{revision}',to_jsonb(v_rev+1));
   update private.football_gm_runs set state=v_state,updated_at=now(),
     completed_at=case when p_action='finish' then now() else null end where id=v_id;
   insert into private.football_gm_run_snapshots(run_id,revision,state)
     select v_id,coalesce(max(revision),0)+1,v_state
     from private.football_gm_run_snapshots where run_id=v_id;
 end if;
 -- Only an owner may access this fixture catalog; not part of public NBA gameplay.
 select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'teamCode',c.team_code,
   'positions',c.positions,'overall',c.overall,'skills',c.skills,'salaries',c.salaries,
   'positionReview',c.position_review) order by c.overall desc,c.name) into v_catalog
 from private.nba_gm_dev_catalog c;
 return jsonb_build_object('run',v_state,'catalog',coalesce(v_catalog,'[]'::jsonb));
end;
$$;
revoke all on function public.nba_gm_dev_action(text,integer,text,text) from public,anon;
grant execute on function public.nba_gm_dev_action(text,integer,text,text) to authenticated;
