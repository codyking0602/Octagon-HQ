# Profile Loss Context and Prime Window Audit

Generated for every ranked fighter from the canonical UFC fight ledger and approved prime windows. Public profile loss tiles are tested against `fighter.traces.penalty.events`; raw penalty values below are audit-only and are not exposed in the public profile.

## Prime-window summary

| Fighter | Prime start | Prime end | Prime record | Active elite years | Pre-prime losses | Prime losses | Post-prime losses | Suspicious note |
|---|---|---|---|---:|---:|---:|---:|---|
| Jon Jones | Ryan Bader 2011-02-05 | Ciryl Gane 2023-03-04 | 16-0 | 10.51 | 1 | 0 | 0 | None |
| Georges St-Pierre | Matt Hughes 2006-11-18 | Michael Bisping 2017-11-04 | 14-1 | 8.44 | 1 | 1 | 0 | None |
| Anderson Silva | Chris Leben 2006-06-28 | Chris Weidman 2013-12-28 | 16-2 | 7.5 | 0 | 2 | 5 | Presentation mentions later-career context with post-prime losses. |
| Demetrious Johnson | Ian McCall 2012-06-08 | Henry Cejudo 2018-08-04 | 13-1 | 6.15 | 1 | 1 | 0 | None |
| Islam Makhachev | Drew Dober 2021-03-06 | Open | 10-0 | 5.35 | 1 | 0 | 0 | None |
| Alexander Volkanovski | Jose Aldo 2019-05-11 | Open | 9-3 | 7.17 | 0 | 3 | 0 | None |
| Khabib Nurmagomedov | Rafael dos Anjos 2014-04-19 | Justin Gaethje 2020-10-24 | 8-0 | 6.02 | 0 | 0 | 0 | None |
| Matt Hughes | Carlos Newton 2001-11-02 | Georges St-Pierre 2007-12-29 | 13-3 | 6.15 | 1 | 3 | 3 | Presentation mentions later-career context with post-prime losses. |
| Kamaru Usman | Demian Maia 2018-05-19 | Leon Edwards 2023-03-18 | 8-2 | 6.33 | 0 | 2 | 1 | None |
| Max Holloway | Cub Swanson 2015-04-18 | Open | 16-6 | 11.24 | 3 | 6 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Stipe Miocic | Mark Hunt 2015-05-10 | Francis Ngannou 2021-03-27 | 8-2 | 5.88 | 2 | 2 | 1 | None |
| Jose Aldo | Mark Hominick 2011-04-30 | Merab Dvalishvili 2022-08-20 | 13-7 | 11.31 | 0 | 7 | 2 | None |
| Randy Couture | Tony Halme 1997-05-30 | Brock Lesnar 2008-11-15 | 13-6 | 10.06 | 0 | 6 | 2 | None |
| Israel Adesanya | Yoel Romero 2020-03-07 | Dricus du Plessis 2024-08-18 | 6-4 | 4.45 | 0 | 4 | 2 | Presentation mentions later-career context with post-prime losses. |
| Daniel Cormier | Dan Henderson 2014-05-24 | Stipe Miocic 2020-08-15 | 8-3 | 6.23 | 0 | 3 | 0 | None |
| Alex Pereira | Sean Strickland 2022-07-02 | Open | 8-3 | 4.03 | 0 | 3 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Chuck Liddell | Tito Ortiz 2004-04-02 | Quinton Jackson 2007-05-26 | 7-1 | 3.15 | 2 | 1 | 4 | None |
| Charles Oliveira | Kevin Lee 2020-03-14 | Open | 9-3 | 6.33 | 8 | 3 | 0 | None |
| T.J. Dillashaw | Renan Barao 2014-05-24 | Henry Cejudo 2019-01-19 | 7-2 | 4.66 | 2 | 2 | 1 | None |
| Merab Dvalishvili | Marlon Moraes 2021-09-25 | Open | 8-1 | 4.8 | 2 | 1 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Frankie Edgar | Sean Sherk 2009-05-23 | Max Holloway 2019-07-27 | 13-6-1 | 10.18 | 1 | 6 | 4 | None |
| Francis Ngannou | Curtis Blaydes 2018-11-24 | Ciryl Gane 2022-01-22 | 6-0 | 3.16 | 2 | 0 | 0 | None |
| Cain Velasquez | Brock Lesnar 2010-10-23 | Fabricio Werdum 2015-06-13 | 5-2 | 4.49 | 0 | 2 | 1 | None |
| Benson Henderson | Jim Miller 2011-08-14 | Jorge Masvidal 2015-11-28 | 10-3 | 4.29 | 0 | 3 | 0 | None |
| Aljamain Sterling | Cory Sandhagen 2020-06-06 | Sean O'Malley 2023-08-19 | 5-1 | 4.7 | 3 | 1 | 1 | None |
| Junior dos Santos | Fabricio Werdum 2008-10-25 | Cain Velasquez 2013-10-19 | 10-2 | 4.98 | 0 | 2 | 6 | None |
| B.J. Penn | Matt Hughes 2004-01-31 | Frankie Edgar 2010-08-28 | 6-5 | 5.98 | 1 | 5 | 7 | None |
| Justin Gaethje | Tony Ferguson 2020-05-09 | Open | 7-3 | 6.18 | 2 | 3 | 0 | None |
| Tyron Woodley | Carlos Condit 2014-03-15 | Kamaru Usman 2019-03-02 | 7-2-1 | 4.96 | 1 | 2 | 3 | None |
| Glover Teixeira | Ryan Bader 2013-09-04 | Jiří Procházka 2022-06-11 | 12-6 | 8.77 | 0 | 6 | 1 | None |
| Dustin Poirier | Eddie Alvarez 2018-07-28 | Islam Makhachev 2024-06-01 | 7-4 | 5.85 | 4 | 4 | 1 | None |
| Alexandre Pantoja | Manel Kape 2021-02-06 | Joshua Van 2025-12-06 | 8-1 | 4.83 | 3 | 1 | 0 | None |
| Leon Edwards | Rafael dos Anjos 2019-07-20 | Sean Brady 2025-03-22 | 5-2 | 5.52 | 2 | 2 | 1 | None |
| Tito Ortiz | Wanderlei Silva 2000-04-14 | Lyoto Machida 2008-05-24 | 11-4-1 | 8.11 | 2 | 4 | 5 | None |
| Ilia Topuria | Bryce Mitchell 2022-12-10 | Open | 5-1 | 3.59 | 0 | 1 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Fabricio Werdum | Roy Nelson 2012-02-04 | Alexander Volkov 2018-03-17 | 9-3 | 6.11 | 2 | 3 | 1 | None |
| Robbie Lawler | Josh Koscheck 2013-02-23 | Tyron Woodley 2016-07-30 | 8-2 | 3.43 | 3 | 2 | 6 | None |
| Robert Whittaker | Ronaldo Souza 2017-04-15 | Khamzat Chimaev 2024-10-26 | 9-4 | 7.53 | 2 | 4 | 1 | None |
| Tony Ferguson | Edson Barboza 2015-12-11 | Justin Gaethje 2020-05-09 | 6-1 | 4.41 | 1 | 1 | 7 | None |
| Henry Cejudo | Demetrious Johnson 2018-08-04 | Dominick Cruz 2020-05-09 | 4-0 | 1.76 | 2 | 0 | 4 | None |
| Chris Weidman | Mark Munoz 2012-07-11 | Ronaldo Souza 2018-11-03 | 6-4 | 6.31 | 0 | 4 | 4 | None |
| Frank Shamrock | Kevin Jackson 1997-12-21 | Tito Ortiz 1999-09-24 | 5-0 | 1.76 | 0 | 0 | 0 | None |
| Petr Yan | Urijah Faber 2019-12-14 | Open | 7-4 | 6.58 | 0 | 4 | 0 | None |
| Sean Strickland | Uriah Hall 2021-07-31 | Open | 8-4 | 4.95 | 3 | 4 | 0 | None |
| Deiveson Figueiredo | Joseph Benavidez 2020-02-29 | Petr Yan 2024-11-23 | 7-3-1 | 4.73 | 1 | 3 | 3 | None |
| Conor McGregor | Dustin Poirier 2014-09-27 | Khabib Nurmagomedov 2018-10-06 | 6-2 | 3.63 | 0 | 2 | 3 | Presentation mentions later-career context with post-prime losses. |
| Brandon Moreno | Jussier Formiga 2020-03-14 | Tatsuro Taira 2025-12-06 | 7-4-1 | 5.73 | 2 | 4 | 1 | None |
| Vitor Belfort | Rich Franklin 2009-09-19 | Dan Henderson 2015-11-07 | 7-3 | 6.1 | 4 | 3 | 3 | None |
| Lyoto Machida | Thiago Silva 2009-01-31 | Chris Weidman 2014-07-05 | 8-5 | 5.42 | 0 | 5 | 3 | None |
| Rashad Evans | Michael Bisping 2007-11-17 | Chael Sonnen 2013-11-16 | 9-3 | 6.0 | 0 | 3 | 5 | None |
| Tom Aspinall | Alexander Volkov 2022-03-19 | Open | 4-0 | 4.32 | 0 | 1 | 0 | None |
| Dricus du Plessis | Derek Brunson 2023-03-04 | Open | 5-1 | 2.45 | 0 | 1 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Dominick Cruz | Urijah Faber 2011-07-02 | Henry Cejudo 2020-05-09 | 5-2 | 5.51 | 0 | 2 | 1 | None |
| Royce Gracie | Art Jimmerson 1993-11-12 | Ken Shamrock 1995-04-07 | 11-0-1 | 1.4 | 0 | 0 | 1 | None |
| Khamzat Chimaev | Gilbert Burns 2022-04-09 | Open | 5-1 | 4.08 | 0 | 1 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Michael Bisping | Anderson Silva 2016-02-27 | Georges St-Pierre 2017-11-04 | 3-1 | 1.69 | 7 | 1 | 1 | None |
| Anthony Pettis | Joe Lauzon 2012-02-25 | Tony Ferguson 2018-10-06 | 7-6 | 6.61 | 1 | 6 | 2 | Presentation mentions later-career context with post-prime losses. |
| Sean O'Malley | Petr Yan 2022-10-22 | Open | 5-2 | 3.72 | 1 | 2 | 0 | None |
| Quinton Jackson | Chuck Liddell 2007-05-26 | Jon Jones 2011-09-24 | 6-3 | 4.33 | 0 | 3 | 2 | None |
| Mauricio "Shogun" Rua | Chuck Liddell 2009-04-18 | Dan Henderson 2011-11-19 | 3-3 | 2.59 | 1 | 3 | 8 | None |
| Forrest Griffin | Mauricio Rua 2007-09-22 | Mauricio Rua 2011-08-27 | 4-3 | 3.93 | 2 | 3 | 0 | None |
| Brock Lesnar | Randy Couture 2008-11-15 | Cain Velasquez 2010-10-23 | 3-1 | 1.94 | 1 | 1 | 1 | None |
| Dan Henderson | Michael Bisping 2009-07-11 | Daniel Cormier 2014-05-24 | 3-4 | 4.01 | 2 | 4 | 3 | Presentation mentions later-career context with post-prime losses. |
| Chael Sonnen | Nate Marquardt 2010-02-06 | Jon Jones 2013-04-27 | 3-3 | 3.22 | 3 | 3 | 1 | None |
| Paddy Pimblett | King Green 2024-07-27 | Open | 3-1 | 1.96 | 0 | 1 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Amanda Nunes | Miesha Tate 2016-07-09 | Irene Aldana 2023-06-10 | 11-1 | 6.92 | 1 | 1 | 0 | None |
| Valentina Shevchenko | Holly Holm 2016-07-23 | Open | 14-2-1 | 9.97 | 1 | 2 | 0 | None |
| Zhang Weili | Jessica Andrade 2019-08-31 | Open | 7-3 | 6.87 | 0 | 3 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Joanna Jedrzejczyk | Carla Esparza 2015-03-14 | Zhang Weili 2020-03-07 | 8-4 | 4.98 | 0 | 4 | 1 | None |
| Rose Namajunas | Joanna Jedrzejczyk 2017-11-04 | Carla Esparza 2022-05-07 | 5-2 | 4.5 | 2 | 2 | 3 | None |
| Ronda Rousey | Miesha Tate 2013-12-28 | Amanda Nunes 2016-12-30 | 5-2 | 3.01 | 0 | 2 | 0 | None |
| Jessica Andrade | Claudia Gadelha 2017-09-23 | Erin Blanchfield 2023-02-18 | 8-4 | 5.4 | 4 | 4 | 5 | None |
| Cris Cyborg | Leslie Smith 2016-05-14 | Amanda Nunes 2018-12-29 | 5-1 | 2.63 | 0 | 1 | 0 | None |
| Carla Esparza | Rose Namajunas 2014-12-12 | Zhang Weili 2022-11-12 | 10-5 | 7.92 | 0 | 5 | 1 | None |
| Alexa Grasso | Maycee Barber 2021-02-13 | Open | 5-2-1 | 5.41 | 3 | 2 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Kayla Harrison | Holly Holm 2024-04-13 | Open | 3-0 | 2.25 | 0 | 0 | 0 | None |
| Mackenzie Dern | Nina Nunes 2021-04-10 | Open | 6-4 | 5.26 | 1 | 4 | 0 | None |
| Julianna Peña | Amanda Nunes 2021-12-11 | Open | 2-2 | 3.9 | 2 | 2 | 0 | Open prime window includes recent losses; Cody review suggested. |
| Miesha Tate | Ronda Rousey 2013-12-28 | Amanda Nunes 2016-07-09 | 5-2 | 2.53 | 1 | 2 | 4 | Presentation mentions later-career context with post-prime losses. |
| Holly Holm | Ronda Rousey 2015-11-15 | Amanda Nunes 2019-07-06 | 3-5 | 3.64 | 0 | 5 | 2 | None |

## Loss event audit

| Fighter | Opponent | Date | Phase | Quality tier | Elite? | Finished? | Upward division? | Competitive? | Technical exception? | Penalty eligible? | Raw penalty | Prime Losses tile? | Post-Prime count? |
|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|
| Jon Jones | Matt Hamill | 2009-12-05 | pre-prime | solid | False | False | False | False | True | False | 0.00 | False | False |
| Georges St-Pierre | Matt Hughes | 2004-10-22 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Georges St-Pierre | Matt Serra | 2007-04-07 | prime | solid | False | True | False | True | False | True | -4.75 | True | False |
| Anderson Silva | Chris Weidman | 2013-07-06 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Anderson Silva | Chris Weidman | 2013-12-28 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Anderson Silva | Michael Bisping | 2016-02-27 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Anderson Silva | Daniel Cormier | 2016-07-09 | post-prime | champion-level | True | False | True | True | False | True | 0.00 | False | True |
| Anderson Silva | Israel Adesanya | 2019-02-10 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Anderson Silva | Jared Cannonier | 2019-05-11 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Anderson Silva | Uriah Hall | 2020-10-31 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Demetrious Johnson | Dominick Cruz | 2011-10-01 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Demetrious Johnson | Henry Cejudo | 2018-08-04 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Islam Makhachev | Adriano Martins | 2015-10-03 | pre-prime | solid | False | True | False | True | False | True | -2.00 | False | False |
| Alexander Volkanovski | Islam Makhachev | 2023-02-11 | prime | champion-level | True | False | True | True | False | True | -0.75 | True | False |
| Alexander Volkanovski | Islam Makhachev | 2023-10-21 | prime | champion-level | True | True | True | True | False | True | -1.25 | True | False |
| Alexander Volkanovski | Ilia Topuria | 2024-02-17 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Matt Hughes | Dennis Hallman | 2000-12-16 | pre-prime | solid | False | True | False | True | False | True | -2.00 | False | False |
| Matt Hughes | B.J. Penn | 2004-01-31 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Matt Hughes | Georges St-Pierre | 2006-11-18 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Matt Hughes | Georges St-Pierre | 2007-12-29 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Matt Hughes | Thiago Alves | 2008-06-07 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Matt Hughes | B.J. Penn | 2010-11-20 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Matt Hughes | Josh Koscheck | 2011-09-24 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Kamaru Usman | Leon Edwards | 2022-08-20 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Kamaru Usman | Leon Edwards | 2023-03-18 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Kamaru Usman | Khamzat Chimaev | 2023-10-21 | post-prime | top-five | True | False | True | True | False | True | 0.00 | False | True |
| Max Holloway | Dustin Poirier | 2012-02-04 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Max Holloway | Dennis Bermudez | 2013-05-25 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Max Holloway | Conor McGregor | 2013-08-17 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Max Holloway | Dustin Poirier | 2019-04-13 | prime | top-five | True | False | True | True | False | True | -0.75 | True | False |
| Max Holloway | Alexander Volkanovski | 2019-12-14 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Max Holloway | Alexander Volkanovski | 2020-07-11 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Max Holloway | Alexander Volkanovski | 2022-07-02 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Max Holloway | Ilia Topuria | 2024-10-26 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Max Holloway | Charles Oliveira | 2026-03-07 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Stipe Miocic | Stefan Struve | 2012-09-29 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Stipe Miocic | Junior dos Santos | 2014-12-13 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Stipe Miocic | Daniel Cormier | 2018-07-07 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Stipe Miocic | Francis Ngannou | 2021-03-27 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Stipe Miocic | Jon Jones | 2024-11-16 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |
| Jose Aldo | Conor McGregor | 2015-12-12 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Jose Aldo | Max Holloway | 2017-06-03 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Jose Aldo | Max Holloway | 2017-12-02 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Jose Aldo | Alexander Volkanovski | 2019-05-11 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Jose Aldo | Marlon Moraes | 2019-12-14 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Jose Aldo | Petr Yan | 2020-07-11 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Jose Aldo | Merab Dvalishvili | 2022-08-20 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Jose Aldo | Mario Bautista | 2024-10-05 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Jose Aldo | Aiemann Zahabi | 2025-05-10 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Randy Couture | Josh Barnett | 2002-03-22 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Ricco Rodriguez | 2002-09-27 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Vitor Belfort | 2004-01-31 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Chuck Liddell | 2005-04-16 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Chuck Liddell | 2006-02-04 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Brock Lesnar | 2008-11-15 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Randy Couture | Antonio Rodrigo Nogueira | 2009-08-29 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Randy Couture | Lyoto Machida | 2011-04-30 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Israel Adesanya | Jan Blachowicz | 2021-03-06 | prime | champion-level | True | False | True | True | False | True | -0.75 | True | False |
| Israel Adesanya | Alex Pereira | 2022-11-12 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Israel Adesanya | Sean Strickland | 2023-09-09 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Israel Adesanya | Dricus du Plessis | 2024-08-18 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Israel Adesanya | Nassourdine Imavov | 2025-02-01 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Israel Adesanya | Joe Pyfer | 2026-03-28 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Daniel Cormier | Jon Jones | 2015-01-03 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Daniel Cormier | Stipe Miocic | 2019-08-17 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Daniel Cormier | Stipe Miocic | 2020-08-15 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Alex Pereira | Israel Adesanya | 2023-04-08 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Alex Pereira | Magomed Ankalaev | 2025-03-08 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Alex Pereira | Ciryl Gane | 2026-06-14 | prime | top-five | True | True | True | True | False | True | -1.25 | True | False |
| Chuck Liddell | Jeremy Horn | 1999-03-05 | pre-prime | solid | False | True | False | True | False | True | -2.00 | False | False |
| Chuck Liddell | Randy Couture | 2003-06-06 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Chuck Liddell | Quinton Jackson | 2007-05-26 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Chuck Liddell | Keith Jardine | 2007-09-22 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Chuck Liddell | Rashad Evans | 2008-09-06 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Chuck Liddell | Mauricio Rua | 2009-04-18 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Chuck Liddell | Rich Franklin | 2010-06-12 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Charles Oliveira | Jim Miller | 2010-12-11 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Charles Oliveira | Donald Cerrone | 2011-08-14 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Charles Oliveira | Cub Swanson | 2012-09-22 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Charles Oliveira | Frankie Edgar | 2013-07-06 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Charles Oliveira | Max Holloway | 2015-08-23 | pre-prime | top-five | True | True | False | False | False | False | 0.00 | False | False |
| Charles Oliveira | Anthony Pettis | 2016-08-27 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Charles Oliveira | Ricardo Lamas | 2016-11-05 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Charles Oliveira | Paul Felder | 2017-12-02 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Charles Oliveira | Islam Makhachev | 2022-10-22 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Charles Oliveira | Arman Tsarukyan | 2024-04-13 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Charles Oliveira | Ilia Topuria | 2025-06-28 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| T.J. Dillashaw | John Dodson | 2011-12-03 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| T.J. Dillashaw | Raphael Assuncao | 2013-10-09 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| T.J. Dillashaw | Dominick Cruz | 2016-01-17 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| T.J. Dillashaw | Henry Cejudo | 2019-01-19 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| T.J. Dillashaw | Aljamain Sterling | 2022-10-22 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |
| Merab Dvalishvili | Frankie Saenz | 2017-12-09 | pre-prime | solid | False | False | False | True | False | True | -1.25 | False | False |
| Merab Dvalishvili | Ricky Simon | 2018-04-21 | pre-prime | solid | False | True | False | True | False | True | -2.00 | False | False |
| Merab Dvalishvili | Petr Yan | 2025-12-06 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Gray Maynard | 2008-04-02 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Frankie Edgar | Benson Henderson | 2012-02-26 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Benson Henderson | 2012-08-11 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Jose Aldo | 2013-02-02 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Jose Aldo | 2016-07-09 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Brian Ortega | 2018-03-03 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Frankie Edgar | Max Holloway | 2019-07-27 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Frankie Edgar | Chan Sung Jung | 2019-12-21 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Frankie Edgar | Cory Sandhagen | 2021-02-06 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Frankie Edgar | Marlon Vera | 2021-11-06 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Frankie Edgar | Chris Gutiérrez | 2022-11-12 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Francis Ngannou | Stipe Miocic | 2018-01-20 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Francis Ngannou | Derrick Lewis | 2018-07-07 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Cain Velasquez | Junior dos Santos | 2011-11-12 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Cain Velasquez | Fabricio Werdum | 2015-06-13 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Cain Velasquez | Francis Ngannou | 2019-02-17 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Benson Henderson | Anthony Pettis | 2013-08-31 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Benson Henderson | Rafael dos Anjos | 2014-08-23 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Benson Henderson | Donald Cerrone | 2015-01-18 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Aljamain Sterling | Bryan Caraway | 2016-05-29 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Aljamain Sterling | Raphael Assuncao | 2017-01-28 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Aljamain Sterling | Marlon Moraes | 2017-12-09 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Aljamain Sterling | Sean O'Malley | 2023-08-19 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Aljamain Sterling | Movsar Evloev | 2024-12-07 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Cain Velasquez | 2012-12-29 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Junior dos Santos | Cain Velasquez | 2013-10-19 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Junior dos Santos | Alistair Overeem | 2015-12-19 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Stipe Miocic | 2017-05-13 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Francis Ngannou | 2019-06-29 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Curtis Blaydes | 2020-01-25 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Jairzinho Rozenstruik | 2020-08-15 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Junior dos Santos | Ciryl Gane | 2020-12-12 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Jens Pulver | 2002-01-11 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| B.J. Penn | Georges St-Pierre | 2006-03-04 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| B.J. Penn | Matt Hughes | 2006-09-23 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| B.J. Penn | Georges St-Pierre | 2009-01-31 | prime | champion-level | True | True | True | True | False | True | -1.25 | True | False |
| B.J. Penn | Frankie Edgar | 2010-04-10 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| B.J. Penn | Frankie Edgar | 2010-08-28 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| B.J. Penn | Nick Diaz | 2011-10-29 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Rory MacDonald | 2012-12-08 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Frankie Edgar | 2014-07-06 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Yair Rodriguez | 2017-01-15 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Dennis Siver | 2017-06-25 | post-prime | ranked | False | False | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Ryan Hall | 2018-12-29 | post-prime | solid | False | True | False | True | False | True | 0.00 | False | True |
| B.J. Penn | Clay Guida | 2019-05-11 | post-prime | name-value | False | False | False | True | False | True | 0.00 | False | True |
| Justin Gaethje | Eddie Alvarez | 2017-12-02 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Justin Gaethje | Dustin Poirier | 2018-04-14 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Justin Gaethje | Khabib Nurmagomedov | 2020-10-24 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Justin Gaethje | Charles Oliveira | 2022-05-07 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Justin Gaethje | Max Holloway | 2024-04-13 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Tyron Woodley | Jake Shields | 2013-06-15 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Tyron Woodley | Rory MacDonald | 2014-06-14 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Tyron Woodley | Kamaru Usman | 2019-03-02 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Tyron Woodley | Gilbert Burns | 2020-05-30 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Tyron Woodley | Colby Covington | 2020-09-19 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Tyron Woodley | Vicente Luque | 2021-03-27 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Glover Teixeira | Jon Jones | 2014-04-26 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Glover Teixeira | Phil Davis | 2014-10-25 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Glover Teixeira | Anthony Johnson | 2016-08-20 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Glover Teixeira | Alexander Gustafsson | 2017-05-28 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Glover Teixeira | Corey Anderson | 2018-07-22 | prime | top-ten | False | False | False | True | False | True | -4.00 | True | False |
| Glover Teixeira | Jiří Procházka | 2022-06-11 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Glover Teixeira | Jamahal Hill | 2023-01-21 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Dustin Poirier | Chan Sung Jung | 2012-05-15 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Dustin Poirier | Cub Swanson | 2013-02-16 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Dustin Poirier | Conor McGregor | 2014-09-27 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Dustin Poirier | Michael Johnson | 2016-09-17 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Dustin Poirier | Khabib Nurmagomedov | 2019-09-07 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dustin Poirier | Charles Oliveira | 2021-12-11 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dustin Poirier | Justin Gaethje | 2023-07-29 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Dustin Poirier | Islam Makhachev | 2024-06-01 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dustin Poirier | Max Holloway | 2025-07-19 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Alexandre Pantoja | Dustin Ortiz | 2018-01-20 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Alexandre Pantoja | Deiveson Figueiredo | 2019-07-27 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Alexandre Pantoja | Askar Askarov | 2020-07-19 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Alexandre Pantoja | Joshua Van | 2025-12-06 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Leon Edwards | Claudio Silva | 2014-11-08 | pre-prime | ranked | False | False | False | True | False | True | -1.25 | False | False |
| Leon Edwards | Kamaru Usman | 2015-12-19 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Leon Edwards | Belal Muhammad | 2024-07-27 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Leon Edwards | Sean Brady | 2025-03-22 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Leon Edwards | Carlos Prates | 2025-11-15 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Tito Ortiz | Guy Mezger | 1997-05-30 | pre-prime | solid | False | True | False | True | False | True | -2.00 | False | False |
| Tito Ortiz | Frank Shamrock | 1999-09-24 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Tito Ortiz | Randy Couture | 2003-09-26 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Tito Ortiz | Chuck Liddell | 2004-04-02 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Tito Ortiz | Chuck Liddell | 2006-12-30 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Tito Ortiz | Lyoto Machida | 2008-05-24 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Tito Ortiz | Forrest Griffin | 2009-11-21 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Tito Ortiz | Matt Hamill | 2010-10-23 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Tito Ortiz | Rashad Evans | 2011-08-06 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Tito Ortiz | Antonio Rogerio Nogueira | 2011-12-10 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Tito Ortiz | Forrest Griffin | 2012-07-07 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Ilia Topuria | Justin Gaethje | 2026-06-14 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Fabricio Werdum | Andrei Arlovski | 2007-04-21 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Fabricio Werdum | Junior dos Santos | 2008-10-25 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Fabricio Werdum | Stipe Miocic | 2016-05-14 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Fabricio Werdum | Alistair Overeem | 2017-07-08 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Fabricio Werdum | Alexander Volkov | 2018-03-17 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Fabricio Werdum | Aleksei Oleinik | 2020-05-09 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Pete Spratt | 2003-04-25 | pre-prime | ranked | False | True | False | True | False | True | -2.00 | False | False |
| Robbie Lawler | Nick Diaz | 2004-04-02 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Robbie Lawler | Evan Tanner | 2004-10-22 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Robbie Lawler | Johny Hendricks | 2014-03-15 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Robbie Lawler | Tyron Woodley | 2016-07-30 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Robbie Lawler | Rafael dos Anjos | 2017-12-16 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Ben Askren | 2019-03-02 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Colby Covington | 2019-08-03 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Neil Magny | 2020-08-29 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Bryan Barberena | 2022-07-02 | post-prime | ranked | False | True | False | True | False | True | 0.00 | False | True |
| Robbie Lawler | Santiago Ponzinibbio | 2022-12-10 | post-prime | ranked | False | True | False | True | False | True | 0.00 | False | True |
| Robert Whittaker | Court McGee | 2013-08-28 | pre-prime | solid | False | False | False | True | False | True | -1.25 | False | False |
| Robert Whittaker | Stephen Thompson | 2014-02-22 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Robert Whittaker | Israel Adesanya | 2019-10-06 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Robert Whittaker | Israel Adesanya | 2022-02-12 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Robert Whittaker | Dricus du Plessis | 2023-07-08 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Robert Whittaker | Khamzat Chimaev | 2024-10-26 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Robert Whittaker | Reinier de Ridder | 2025-07-26 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Michael Johnson | 2012-05-05 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Tony Ferguson | Justin Gaethje | 2020-05-09 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Tony Ferguson | Charles Oliveira | 2020-12-12 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Beneil Dariush | 2021-05-15 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Michael Chandler | 2022-05-07 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Nate Diaz | 2022-09-10 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Bobby Green | 2023-07-29 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Paddy Pimblett | 2023-12-16 | post-prime | ranked | False | False | False | True | False | True | 0.00 | False | True |
| Tony Ferguson | Michael Chiesa | 2024-08-03 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Henry Cejudo | Demetrious Johnson | 2016-04-23 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Henry Cejudo | Joseph Benavidez | 2016-12-03 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Henry Cejudo | Aljamain Sterling | 2023-05-06 | post-prime | champion-level | True | False | False | True | False | True | 0.00 | False | True |
| Henry Cejudo | Merab Dvalishvili | 2024-02-17 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Henry Cejudo | Song Yadong | 2025-02-22 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Henry Cejudo | Payton Talbott | 2025-12-06 | post-prime | ranked | False | False | False | True | False | True | 0.00 | False | True |
| Chris Weidman | Luke Rockhold | 2015-12-12 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Chris Weidman | Yoel Romero | 2016-11-12 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Chris Weidman | Gegard Mousasi | 2017-04-08 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Chris Weidman | Ronaldo Souza | 2018-11-03 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Chris Weidman | Dominick Reyes | 2019-10-18 | post-prime | top-five | True | True | True | True | False | True | 0.00 | False | True |
| Chris Weidman | Uriah Hall | 2021-04-24 | post-prime | ranked | False | False | False | False | False | False | 0.00 | False | False |
| Chris Weidman | Brad Tavares | 2023-08-19 | post-prime | solid | False | False | False | True | False | True | 0.00 | False | True |
| Chris Weidman | Eryk Anders | 2024-12-07 | post-prime | solid | False | True | False | True | False | True | 0.00 | False | True |
| Petr Yan | Aljamain Sterling | 2021-03-06 | prime | top-five | True | False | False | True | True | False | 0.00 | False | False |
| Petr Yan | Aljamain Sterling | 2022-04-09 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Petr Yan | Sean O'Malley | 2022-10-22 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Petr Yan | Merab Dvalishvili | 2023-03-11 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Sean Strickland | Santiago Ponzinibbio | 2015-02-22 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Sean Strickland | Kamaru Usman | 2017-04-08 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Sean Strickland | Elizeu Zaleski dos Santos | 2018-05-12 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Sean Strickland | Alex Pereira | 2022-07-02 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Sean Strickland | Jared Cannonier | 2022-12-17 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Sean Strickland | Dricus du Plessis | 2024-01-20 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Sean Strickland | Dricus du Plessis | 2025-02-08 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Deiveson Figueiredo | Jussier Formiga | 2019-03-23 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Deiveson Figueiredo | Brandon Moreno | 2021-06-12 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Deiveson Figueiredo | Brandon Moreno | 2023-01-21 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Deiveson Figueiredo | Petr Yan | 2024-11-23 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Deiveson Figueiredo | Cory Sandhagen | 2025-05-03 | post-prime | top-five | True | True | False | False | False | False | 0.00 | False | False |
| Deiveson Figueiredo | Umar Nurmagomedov | 2026-01-24 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Deiveson Figueiredo | Song Yadong | 2026-05-30 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Conor McGregor | Nate Diaz | 2016-03-05 | prime | top-ten | False | True | False | True | False | True | -4.75 | True | False |
| Conor McGregor | Khabib Nurmagomedov | 2018-10-06 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Conor McGregor | Dustin Poirier | 2021-01-24 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Conor McGregor | Dustin Poirier | 2021-07-10 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Conor McGregor | Max Holloway | 2026-07-11 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Brandon Moreno | Sergio Pettis | 2017-08-05 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Brandon Moreno | Alexandre Pantoja | 2018-05-19 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Brandon Moreno | Deiveson Figueiredo | 2022-01-22 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Brandon Moreno | Alexandre Pantoja | 2023-07-08 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Brandon Moreno | Brandon Royval | 2024-02-24 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Brandon Moreno | Tatsuro Taira | 2025-12-06 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Brandon Moreno | Lone’er Kavanagh | 2026-02-28 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Vitor Belfort | Randy Couture | 1997-10-17 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Vitor Belfort | Chuck Liddell | 2002-06-22 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Vitor Belfort | Randy Couture | 2004-08-21 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Vitor Belfort | Tito Ortiz | 2005-02-05 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Vitor Belfort | Anderson Silva | 2011-02-05 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Vitor Belfort | Jon Jones | 2012-09-22 | prime | champion-level | True | True | True | True | False | True | -1.25 | True | False |
| Vitor Belfort | Chris Weidman | 2015-05-23 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Vitor Belfort | Ronaldo Souza | 2016-05-14 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Vitor Belfort | Gegard Mousasi | 2016-10-08 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Vitor Belfort | Lyoto Machida | 2018-05-12 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Lyoto Machida | Mauricio Rua | 2010-05-08 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Lyoto Machida | Quinton Jackson | 2010-11-20 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Lyoto Machida | Jon Jones | 2011-12-10 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Lyoto Machida | Phil Davis | 2013-08-03 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Lyoto Machida | Chris Weidman | 2014-07-05 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Lyoto Machida | Luke Rockhold | 2015-04-18 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Lyoto Machida | Yoel Romero | 2015-06-27 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Lyoto Machida | Derek Brunson | 2017-10-28 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Rashad Evans | Lyoto Machida | 2009-05-23 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Rashad Evans | Jon Jones | 2012-04-21 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Rashad Evans | Antônio Rogério Nogueira | 2013-02-02 | prime | ranked | False | False | False | True | False | True | -4.00 | True | False |
| Rashad Evans | Ryan Bader | 2015-10-03 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Rashad Evans | Glover Teixeira | 2016-04-16 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Rashad Evans | Daniel Kelly | 2017-03-04 | post-prime | solid | False | False | False | True | False | True | 0.00 | False | True |
| Rashad Evans | Sam Alvey | 2017-08-05 | post-prime | solid | False | False | False | True | False | True | 0.00 | False | True |
| Rashad Evans | Anthony Smith | 2018-06-09 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Tom Aspinall | Curtis Blaydes | 2022-07-23 | prime | top-five | True | False | False | False | True | False | 0.00 | False | False |
| Dricus du Plessis | Khamzat Chimaev | 2025-08-16 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Dominick Cruz | Cody Garbrandt | 2016-12-30 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Dominick Cruz | Henry Cejudo | 2020-05-09 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dominick Cruz | Marlon Vera | 2022-08-13 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Royce Gracie | Matt Hughes | 2006-05-27 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |
| Khamzat Chimaev | Sean Strickland | 2026-05-09 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Michael Bisping | Rashad Evans | 2007-11-17 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Michael Bisping | Dan Henderson | 2009-07-11 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Michael Bisping | Wanderlei Silva | 2010-02-21 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Michael Bisping | Chael Sonnen | 2012-01-28 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Michael Bisping | Vitor Belfort | 2013-01-19 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Michael Bisping | Tim Kennedy | 2014-04-16 | pre-prime | top-five | True | False | False | True | False | True | -0.75 | False | False |
| Michael Bisping | Luke Rockhold | 2014-11-08 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Michael Bisping | Georges St-Pierre | 2017-11-04 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Michael Bisping | Kelvin Gastelum | 2017-11-25 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Anthony Pettis | Clay Guida | 2011-06-04 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Anthony Pettis | Rafael dos Anjos | 2015-03-14 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Anthony Pettis | Eddie Alvarez | 2016-01-17 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Anthony Pettis | Edson Barboza | 2016-04-23 | prime | top-ten | False | False | False | True | False | True | -4.00 | True | False |
| Anthony Pettis | Max Holloway | 2016-12-10 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Anthony Pettis | Dustin Poirier | 2017-11-11 | prime | top-ten | False | True | False | True | False | True | -4.75 | True | False |
| Anthony Pettis | Tony Ferguson | 2018-10-06 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Anthony Pettis | Nate Diaz | 2019-08-17 | post-prime | top-ten | False | False | True | True | False | True | 0.00 | False | True |
| Anthony Pettis | Carlos Diego Ferreira | 2020-01-18 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Sean O'Malley | Marlon Vera | 2020-08-15 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Sean O'Malley | Merab Dvalishvili | 2024-09-14 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Sean O'Malley | Merab Dvalishvili | 2025-06-07 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Quinton Jackson | Forrest Griffin | 2008-07-05 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Quinton Jackson | Rashad Evans | 2010-05-29 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Quinton Jackson | Jon Jones | 2011-09-24 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Quinton Jackson | Ryan Bader | 2012-02-25 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Quinton Jackson | Glover Teixeira | 2013-01-26 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Forrest Griffin | 2007-09-22 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Mauricio "Shogun" Rua | Lyoto Machida | 2009-10-24 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Mauricio "Shogun" Rua | Jon Jones | 2011-03-19 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Mauricio "Shogun" Rua | Dan Henderson | 2011-11-19 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Mauricio "Shogun" Rua | Alexander Gustafsson | 2012-12-08 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Chael Sonnen | 2013-08-17 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Dan Henderson | 2014-03-23 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Ovince Saint Preux | 2014-11-08 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Anthony Smith | 2018-07-22 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Paul Craig | 2020-11-21 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Ovince Saint Preux | 2022-05-07 | post-prime | solid | False | False | False | True | False | True | 0.00 | False | True |
| Mauricio "Shogun" Rua | Ihor Potieria | 2023-01-21 | post-prime | minimal | False | True | False | True | False | True | 0.00 | False | True |
| Forrest Griffin | Tito Ortiz | 2006-04-15 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Forrest Griffin | Keith Jardine | 2006-12-30 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Forrest Griffin | Rashad Evans | 2008-12-27 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Forrest Griffin | Anderson Silva | 2009-08-08 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Forrest Griffin | Mauricio Rua | 2011-08-27 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Brock Lesnar | Frank Mir | 2008-02-02 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Brock Lesnar | Cain Velasquez | 2010-10-23 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Brock Lesnar | Alistair Overeem | 2011-12-30 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Dan Henderson | Quinton Jackson | 2007-09-08 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Dan Henderson | Anderson Silva | 2008-03-01 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Dan Henderson | Lyoto Machida | 2013-02-23 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Dan Henderson | Rashad Evans | 2013-06-15 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Dan Henderson | Vitor Belfort | 2013-11-09 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dan Henderson | Daniel Cormier | 2014-05-24 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Dan Henderson | Gegard Mousasi | 2015-01-24 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Dan Henderson | Vitor Belfort | 2015-11-07 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Dan Henderson | Michael Bisping | 2016-10-08 | post-prime | champion-level | True | False | False | True | False | True | 0.00 | False | True |
| Chael Sonnen | Renato Sobral | 2005-10-07 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Chael Sonnen | Jeremy Horn | 2006-05-27 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Chael Sonnen | Demian Maia | 2009-02-21 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Chael Sonnen | Anderson Silva | 2010-08-07 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Chael Sonnen | Anderson Silva | 2012-07-07 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Chael Sonnen | Jon Jones | 2013-04-27 | prime | champion-level | True | True | True | True | False | True | -1.25 | True | False |
| Chael Sonnen | Rashad Evans | 2013-11-16 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Paddy Pimblett | Justin Gaethje | 2026-01-24 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Amanda Nunes | Cat Zingano | 2014-09-27 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Amanda Nunes | Julianna Peña | 2021-12-11 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Valentina Shevchenko | Amanda Nunes | 2016-03-05 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Valentina Shevchenko | Amanda Nunes | 2017-09-09 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Valentina Shevchenko | Alexa Grasso | 2023-03-04 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Zhang Weili | Rose Namajunas | 2021-04-24 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Zhang Weili | Rose Namajunas | 2021-11-06 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Zhang Weili | Valentina Shevchenko | 2025-11-15 | prime | champion-level | True | False | True | True | False | True | -0.75 | True | False |
| Joanna Jedrzejczyk | Rose Namajunas | 2017-11-04 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Joanna Jedrzejczyk | Rose Namajunas | 2018-04-07 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Joanna Jedrzejczyk | Valentina Shevchenko | 2018-12-08 | prime | champion-level | True | False | True | True | False | True | -0.75 | True | False |
| Joanna Jedrzejczyk | Zhang Weili | 2020-03-07 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Joanna Jedrzejczyk | Zhang Weili | 2022-06-11 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |
| Rose Namajunas | Carla Esparza | 2014-12-12 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Rose Namajunas | Karolina Kowalkiewicz | 2016-07-30 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Rose Namajunas | Jessica Andrade | 2019-05-11 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Rose Namajunas | Carla Esparza | 2022-05-07 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Rose Namajunas | Manon Fiorot | 2023-09-02 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Rose Namajunas | Erin Blanchfield | 2024-11-02 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Rose Namajunas | Natalia Silva | 2026-01-24 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Ronda Rousey | Holly Holm | 2015-11-15 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Ronda Rousey | Amanda Nunes | 2016-12-30 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Jessica Andrade | Liz Carmouche | 2013-07-27 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Jessica Andrade | Marion Reneau | 2015-02-22 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Jessica Andrade | Raquel Pennington | 2015-09-05 | pre-prime | top-ten | False | True | False | True | False | True | -2.00 | False | False |
| Jessica Andrade | Joanna Jedrzejczyk | 2017-05-13 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Jessica Andrade | Zhang Weili | 2019-08-31 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Jessica Andrade | Rose Namajunas | 2020-07-12 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Jessica Andrade | Valentina Shevchenko | 2021-04-24 | prime | champion-level | True | True | True | True | False | True | -1.25 | True | False |
| Jessica Andrade | Erin Blanchfield | 2023-02-18 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Jessica Andrade | Yan Xiaonan | 2023-05-06 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Jessica Andrade | Tatiana Suarez | 2023-08-05 | post-prime | top-five | True | True | False | True | False | True | 0.00 | False | True |
| Jessica Andrade | Natalia Silva | 2024-09-07 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Jessica Andrade | Jasmine Jasudavicius | 2025-05-10 | post-prime | top-ten | False | True | False | True | False | True | 0.00 | False | True |
| Jessica Andrade | Loopy Godinez | 2025-08-16 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Cris Cyborg | Amanda Nunes | 2018-12-29 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Carla Esparza | Joanna Jedrzejczyk | 2015-03-14 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Carla Esparza | Randa Markos | 2017-02-19 | prime | solid | False | False | False | True | False | True | -4.00 | True | False |
| Carla Esparza | Claudia Gadelha | 2018-06-09 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Carla Esparza | Tatiana Suarez | 2018-09-08 | prime | top-five | True | True | False | True | False | True | -2.25 | True | False |
| Carla Esparza | Zhang Weili | 2022-11-12 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Carla Esparza | Tecia Pennington | 2024-10-05 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Alexa Grasso | Felice Herrig | 2017-02-04 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Alexa Grasso | Tatiana Suarez | 2018-05-19 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Alexa Grasso | Carla Esparza | 2019-09-21 | pre-prime | champion-level | True | False | False | True | False | True | -0.75 | False | False |
| Alexa Grasso | Valentina Shevchenko | 2024-09-14 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Alexa Grasso | Natalia Silva | 2025-05-10 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Mackenzie Dern | Amanda Ribas | 2019-10-12 | pre-prime | top-ten | False | False | False | True | False | True | -1.25 | False | False |
| Mackenzie Dern | Marina Rodriguez | 2021-10-09 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Mackenzie Dern | Yan Xiaonan | 2022-10-01 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Mackenzie Dern | Jessica Andrade | 2023-11-11 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Mackenzie Dern | Amanda Lemos | 2024-02-17 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Julianna Peña | Valentina Shevchenko | 2017-01-28 | pre-prime | champion-level | True | True | False | True | False | True | -1.50 | False | False |
| Julianna Peña | Germaine de Randamie | 2020-10-04 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Julianna Peña | Amanda Nunes | 2022-07-30 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Julianna Peña | Kayla Harrison | 2025-06-07 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Miesha Tate | Cat Zingano | 2013-04-13 | pre-prime | top-five | True | True | False | True | False | True | -1.50 | False | False |
| Miesha Tate | Ronda Rousey | 2013-12-28 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Miesha Tate | Amanda Nunes | 2016-07-09 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Miesha Tate | Raquel Pennington | 2016-11-12 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Miesha Tate | Ketlen Vieira | 2021-11-20 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Miesha Tate | Lauren Murphy | 2022-07-16 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Miesha Tate | Yana Santos | 2025-05-03 | post-prime | top-ten | False | False | False | True | False | True | 0.00 | False | True |
| Holly Holm | Miesha Tate | 2016-03-05 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Holly Holm | Valentina Shevchenko | 2016-07-23 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Holly Holm | Germaine de Randamie | 2017-02-11 | prime | top-five | True | False | False | True | False | True | -1.50 | True | False |
| Holly Holm | Cris Cyborg | 2017-12-30 | prime | champion-level | True | False | False | True | False | True | -1.50 | True | False |
| Holly Holm | Amanda Nunes | 2019-07-06 | prime | champion-level | True | True | False | True | False | True | -2.25 | True | False |
| Holly Holm | Ketlen Vieira | 2022-05-21 | post-prime | top-five | True | False | False | True | False | True | 0.00 | False | True |
| Holly Holm | Kayla Harrison | 2024-04-13 | post-prime | champion-level | True | True | False | True | False | True | 0.00 | False | True |

## Specific locked audit notes

- Kamaru Usman: approved prime window ends at 2023-03-18, so both Leon Edwards losses are prime; the Khamzat Chimaev loss is post-prime and upward-division under the current canonical window.
- Georges St-Pierre: Matt Hughes 2004 is pre-prime elite and finished; Matt Serra 2007 is prime, solid/non-elite, and finished. Serra is one event only.
- Jon Jones: Matt Hamill is a technical exception and excluded from competitive prime-loss public evidence.
- Alexander Volkanovski: both Islam Makhachev losses are upward-division prime losses; Topuria follows the approved open prime-window classification.
- Anderson Silva: both Weidman losses are prime; later losses remain post-prime.

## Suspicious windows flagged for Cody

Anderson Silva, Matt Hughes, Max Holloway, Israel Adesanya, Alex Pereira, Merab Dvalishvili, Ilia Topuria, Conor McGregor, Dricus du Plessis, Khamzat Chimaev, Anthony Pettis, Dan Henderson, Paddy Pimblett, Zhang Weili, Alexa Grasso, Julianna Peña, Miesha Tate
