-- Auction PR 5 reviewed UFC-only catalog rows.
select private.seed_auction_catalog_rows(
$auction_catalog_rows$
finishes|Conor McGregor knocks out Jose Aldo — UFC 194|5|0.35|headliner|100
finishes|Anderson Silva front-kicks Vitor Belfort — UFC 126|5|0.35|headliner|99
finishes|Demetrious Johnson suplexes into an armbar against Ray Borg — UFC 216|4|0.35|headliner|99
finishes|Yair Rodriguez elbows Chan Sung Jung at the horn — UFC Denver|4|0.35|headliner|98
finishes|Joaquin Buckley lands a spinning knockout on Impa Kasanganay — UFC Fight Island 5|4|0.35|headliner|98
finishes|Edson Barboza wheel-kicks Terry Etim — UFC 142|4|0.35|headliner|98
finishes|Francis Ngannou knocks out Alistair Overeem — UFC 218|3|1.0|core|97
finishes|Amanda Nunes stops Cris Cyborg — UFC 232|3|1.0|core|97
finishes|Jon Jones submits Lyoto Machida — UFC 140|3|1.0|core|97
finishes|Charles Oliveira submits Dustin Poirier — UFC 269|3|1.0|core|96
finishes|Alex Pereira stops Jiri Prochazka — UFC 303|3|1.0|core|96
finishes|Leon Edwards head-kicks Kamaru Usman — UFC 278|3|1.0|core|96
finishes|Jorge Masvidal lands a flying knee on Ben Askren — UFC 239|3|1.0|core|95
finishes|Ronda Rousey armbars Cat Zingano — UFC 184|3|1.0|core|95
finishes|Holly Holm head-kicks Ronda Rousey — UFC 193|3|1.0|core|95
finishes|Justin Gaethje head-kicks Dustin Poirier — UFC 291|3|1.0|core|94
finishes|Ilia Topuria knocks out Alexander Volkanovski — UFC 298|3|1.0|core|94
finishes|Jiri Prochazka lands a spinning back elbow on Dominick Reyes — UFC Vegas 25|3|1.0|core|94
finishes|Anthony Pettis submits Benson Henderson — UFC 164|3|1.0|core|93
finishes|Anderson Silva submits Chael Sonnen — UFC 117|3|1.0|core|93
finishes|Khabib Nurmagomedov submits Justin Gaethje — UFC 254|3|1.0|core|93
finishes|Dustin Poirier stops Conor McGregor — UFC 257|3|1.0|core|92
finishes|Michael Chandler lands a front kick on Tony Ferguson — UFC 274|3|1.0|core|92
finishes|Tom Aspinall stops Sergei Pavlovich — UFC 295|3|1.0|core|91
dominant-performances|Khabib Nurmagomedov vs Edson Barboza — UFC 219|5|0.35|headliner|100
dominant-performances|Max Holloway vs Calvin Kattar — UFC Fight Island 7|5|0.35|headliner|100
dominant-performances|Georges St-Pierre vs Josh Koscheck — UFC 124|4|0.35|headliner|99
dominant-performances|Jon Jones vs Mauricio Rua — UFC 128|4|0.35|headliner|99
dominant-performances|Anderson Silva vs Forrest Griffin — UFC 101|4|0.35|headliner|99
dominant-performances|Amanda Nunes vs Cris Cyborg — UFC 232|4|0.35|headliner|98
dominant-performances|Kamaru Usman vs Tyron Woodley — UFC 235|3|1.0|core|98
dominant-performances|Israel Adesanya vs Paulo Costa — UFC 253|3|1.0|core|98
dominant-performances|Alexander Volkanovski vs Max Holloway — UFC 276|3|1.0|core|97
dominant-performances|T.J. Dillashaw vs Renan Barao — UFC 173|3|1.0|core|97
dominant-performances|Demetrious Johnson vs Ray Borg — UFC 216|3|1.0|core|97
dominant-performances|Jose Aldo vs Urijah Faber — UFC 112|3|1.0|core|96
dominant-performances|Cain Velasquez vs Junior dos Santos — UFC 155|3|1.0|core|96
dominant-performances|Ronda Rousey vs Alexis Davis — UFC 175|3|1.0|core|96
dominant-performances|Valentina Shevchenko vs Jessica Eye — UFC 238|3|1.0|core|95
dominant-performances|Merab Dvalishvili vs Sean O'Malley — UFC 306|3|1.0|core|95
dominant-performances|Islam Makhachev vs Charles Oliveira — UFC 280|3|1.0|core|95
dominant-performances|Charles Oliveira vs Tony Ferguson — UFC 256|3|1.0|core|94
dominant-performances|Alex Pereira vs Jiri Prochazka — UFC 303|3|1.0|core|94
dominant-performances|Tom Aspinall vs Sergei Pavlovich — UFC 295|3|1.0|core|93
dominant-performances|Georges St-Pierre vs Jon Fitch — UFC 87|3|1.0|core|92
dominant-performances|Lyoto Machida vs Rashad Evans — UFC 98|3|1.0|core|92
dominant-performances|Joanna Jedrzejczyk vs Carla Esparza — UFC 185|3|1.0|core|92
dominant-performances|Ilia Topuria vs Max Holloway — UFC 308|3|1.0|core|91
wars|Robbie Lawler vs Rory MacDonald — UFC 189|5|0.35|headliner|100
wars|Jon Jones vs Alexander Gustafsson — UFC 165|5|0.35|headliner|100
wars|Zhang Weili vs Joanna Jedrzejczyk — UFC 248|4|0.35|headliner|99
wars|Dan Henderson vs Mauricio Rua — UFC 139|4|0.35|headliner|99
wars|Forrest Griffin vs Stephan Bonnar — TUF 1 Finale|4|0.35|headliner|99
wars|Frankie Edgar vs Gray Maynard — UFC 125|4|0.35|headliner|98
wars|Israel Adesanya vs Kelvin Gastelum — UFC 236|3|1.0|core|98
wars|Jiri Prochazka vs Glover Teixeira — UFC 275|3|1.0|core|98
wars|Nate Diaz vs Conor McGregor — UFC 202|3|1.0|core|97
wars|Charles Oliveira vs Michael Chandler — UFC 262|3|1.0|core|97
wars|Dustin Poirier vs Dan Hooker — UFC Vegas 4|3|1.0|core|97
wars|Alexander Volkanovski vs Brian Ortega — UFC 266|3|1.0|core|96
wars|Justin Gaethje vs Michael Chandler — UFC 268|3|1.0|core|96
wars|Jose Aldo vs Chad Mendes — UFC 179|3|1.0|core|96
wars|Brandon Moreno vs Deiveson Figueiredo — UFC 256|3|1.0|core|95
wars|Mark Hunt vs Antonio Silva — UFC Brisbane|3|1.0|core|95
wars|Michael Bisping vs Dan Henderson — UFC 204|3|1.0|core|94
wars|Robert Whittaker vs Yoel Romero — UFC 225|3|1.0|core|94
wars|Cub Swanson vs Doo Ho Choi — UFC 206|3|1.0|core|94
wars|Diego Sanchez vs Clay Guida — TUF 9 Finale|3|1.0|core|93
wars|Chuck Liddell vs Wanderlei Silva — UFC 79|3|1.0|core|93
wars|Tony Ferguson vs Anthony Pettis — UFC 229|3|1.0|core|92
wars|Khamzat Chimaev vs Gilbert Burns — UFC 273|3|1.0|core|92
wars|Dustin Poirier vs Justin Gaethje — UFC on Fox 29|3|1.0|core|91
$auction_catalog_rows$
);
