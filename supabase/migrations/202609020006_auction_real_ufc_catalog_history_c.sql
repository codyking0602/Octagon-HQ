-- Auction PR 5 reviewed UFC-only catalog rows.
select private.seed_auction_catalog_rows(
$auction_catalog_rows$
rivalries|Jon Jones vs Daniel Cormier|5|0.35|headliner|100
rivalries|Anderson Silva vs Chael Sonnen|5|0.35|headliner|99
rivalries|Conor McGregor vs Nate Diaz|4|0.35|headliner|99
rivalries|Chuck Liddell vs Randy Couture|4|0.35|headliner|98
rivalries|Georges St-Pierre vs Matt Hughes|4|0.35|headliner|98
rivalries|Frankie Edgar vs Gray Maynard|4|0.35|headliner|97
rivalries|Amanda Nunes vs Valentina Shevchenko|3|1.0|core|97
rivalries|Alexander Volkanovski vs Max Holloway|3|1.0|core|97
rivalries|Brandon Moreno vs Deiveson Figueiredo|3|1.0|core|96
rivalries|Israel Adesanya vs Alex Pereira|3|1.0|core|96
rivalries|Brock Lesnar vs Frank Mir|3|1.0|core|95
rivalries|Tito Ortiz vs Ken Shamrock|3|1.0|core|95
rivalries|Jose Aldo vs Chad Mendes|3|1.0|core|94
rivalries|Dominick Cruz vs Urijah Faber|3|1.0|core|94
rivalries|B.J. Penn vs Frankie Edgar|3|1.0|core|93
rivalries|Chuck Liddell vs Tito Ortiz|3|1.0|core|93
rivalries|Stipe Miocic vs Daniel Cormier|3|1.0|core|93
rivalries|Cain Velasquez vs Junior dos Santos|3|1.0|core|92
rivalries|Joanna Jedrzejczyk vs Rose Namajunas|3|1.0|core|92
rivalries|Ronda Rousey vs Miesha Tate|3|1.0|core|91
rivalries|Kamaru Usman vs Leon Edwards|3|1.0|core|91
rivalries|Max Holloway vs Jose Aldo|3|1.0|core|90
rivalries|Khabib Nurmagomedov vs Conor McGregor|3|1.0|core|90
rivalries|Islam Makhachev vs Alexander Volkanovski|3|1.0|core|89
iconic-moments|Forrest Griffin and Stephan Bonnar reach the final horn — TUF 1 Finale|5|0.35|headliner|100
iconic-moments|Conor McGregor stops Jose Aldo in 13 seconds — UFC 194|5|0.35|headliner|100
iconic-moments|Anderson Silva front-kicks Vitor Belfort — UFC 126|4|0.35|headliner|99
iconic-moments|Jorge Masvidal lands the flying knee on Ben Askren — UFC 239|4|0.35|headliner|99
iconic-moments|Demetrious Johnson completes the suplex-to-armbar — UFC 216|4|0.35|headliner|99
iconic-moments|Leon Edwards head-kicks Kamaru Usman — UFC 278|4|0.35|headliner|98
iconic-moments|Holly Holm head-kicks Ronda Rousey — UFC 193|3|1.0|core|98
iconic-moments|Anthony Pettis wins the title by armbar — UFC 164|3|1.0|core|98
iconic-moments|Yair Rodriguez lands the last-second elbow — UFC Denver|3|1.0|core|97
iconic-moments|Joaquin Buckley lands the spinning knockout — UFC Fight Island 5|3|1.0|core|97
iconic-moments|Amanda Nunes stops Cris Cyborg — UFC 232|3|1.0|core|97
iconic-moments|Jon Jones becomes the youngest UFC champion — UFC 128|3|1.0|core|96
iconic-moments|Georges St-Pierre regains the belt from Matt Serra — UFC 83|3|1.0|core|96
iconic-moments|Ronda Rousey wins the first UFC women's title fight — UFC 157|3|1.0|core|96
iconic-moments|Khabib Nurmagomedov submits Conor McGregor — UFC 229|3|1.0|core|95
iconic-moments|Charles Oliveira completes the comeback against Michael Chandler — UFC 262|3|1.0|core|95
iconic-moments|Alex Pereira becomes a two-division UFC champion — UFC 295|3|1.0|core|95
iconic-moments|Ilia Topuria knocks out Alexander Volkanovski — UFC 298|3|1.0|core|94
iconic-moments|Anderson Silva submits Chael Sonnen late — UFC 117|3|1.0|core|94
iconic-moments|Brock Lesnar avenges Frank Mir — UFC 100|3|1.0|core|93
iconic-moments|Robbie Lawler and Rory MacDonald stare down between rounds — UFC 189|3|1.0|core|93
iconic-moments|Conor McGregor becomes a simultaneous two-division champion — UFC 205|3|1.0|core|93
iconic-moments|Max Holloway points to the center against Justin Gaethje — UFC 300|3|1.0|core|92
iconic-moments|Michael Bisping wins the title on short notice — UFC 199|3|1.0|core|92
nicknames|The Spider — Anderson Silva|3|1.0|core|100
nicknames|Bones — Jon Jones|3|1.0|core|98
nicknames|Rush — Georges St-Pierre|3|1.0|core|96
nicknames|Mighty Mouse — Demetrious Johnson|3|1.0|core|96
nicknames|The Notorious — Conor McGregor|3|1.0|core|95
nicknames|The Korean Zombie — Chan Sung Jung|3|1.0|core|95
nicknames|Shogun — Mauricio Rua|3|1.0|core|94
nicknames|Rampage — Quinton Jackson|3|1.0|core|94
nicknames|The Axe Murderer — Wanderlei Silva|3|1.0|core|93
nicknames|The Iceman — Chuck Liddell|3|1.0|core|93
nicknames|The Natural — Randy Couture|3|1.0|core|92
nicknames|The Huntington Beach Bad Boy — Tito Ortiz|3|1.0|core|91
nicknames|The Prodigy — B.J. Penn|3|1.0|core|91
nicknames|The Highlight — Justin Gaethje|3|1.0|core|90
nicknames|Do Bronx — Charles Oliveira|3|1.0|core|90
nicknames|Blessed — Max Holloway|3|1.0|core|90
nicknames|The Last Stylebender — Israel Adesanya|3|1.0|core|89
nicknames|Thug Rose — Rose Namajunas|3|1.0|core|89
nicknames|The Reaper — Robert Whittaker|3|1.0|core|88
nicknames|The Diamond — Dustin Poirier|3|1.0|core|88
nicknames|The Count — Michael Bisping|3|1.0|core|87
nicknames|The Predator — Francis Ngannou|3|1.0|core|87
nicknames|The California Kid — Urijah Faber|3|1.0|core|86
nicknames|The Karate Hottie — Michelle Waterson|3|1.0|core|85
$auction_catalog_rows$
);
