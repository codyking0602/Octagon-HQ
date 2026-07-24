# Profile Loss Context and Prime Window Audit

Generated from the canonical UFC fight ledger and approved era/prime windows. Raw penalty values are audit-only and are not exposed in the public profile.

## Prime-window summary

| Fighter | Prime start | Prime end | Prime UFC record source | Suspicious note |
|---|---|---|---|
| Jon Jones | Ryan Bader 2011-02-05 | Ciryl Gane 2023-03-04 | jon-jones visibleStats primeRecord | No suspicious note from automated checks. |
| Georges St-Pierre | Matt Hughes 2006-11-18 | Michael Bisping 2017-11-04 | georges-st-pierre visibleStats primeRecord | No suspicious note from automated checks. |
| Anderson Silva | Chris Leben 2006-06-28 | Chris Weidman 2013-12-28 | anderson-silva visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Alexander Volkanovski | Jose Aldo 2019-05-11 | Open | alexander-volkanovski visibleStats primeRecord | No suspicious note from automated checks. |
| Matt Hughes | Carlos Newton 2001-11-02 | Georges St-Pierre 2007-12-29 | matt-hughes visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Kamaru Usman | Demian Maia 2018-05-19 | Leon Edwards 2023-03-18 | kamaru-usman visibleStats primeRecord | No suspicious note from automated checks. |
| Max Holloway | Cub Swanson 2015-04-18 | Open | max-holloway visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Israel Adesanya | Yoel Romero 2020-03-07 | Dricus du Plessis 2024-08-18 | israel-adesanya visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Alex Pereira | Sean Strickland 2022-07-02 | Open | alex-pereira visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Merab Dvalishvili | Marlon Moraes 2021-09-25 | Open | merab-dvalishvili visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Ilia Topuria | Bryce Mitchell 2022-12-10 | Open | ilia-topuria visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Conor McGregor | Dustin Poirier 2014-09-27 | Khabib Nurmagomedov 2018-10-06 | conor-mcgregor visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Dricus du Plessis | Derek Brunson 2023-03-04 | Open | dricus-du-plessis visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Khamzat Chimaev | Gilbert Burns 2022-04-09 | Open | khamzat-chimaev visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Anthony Pettis | Joe Lauzon 2012-02-25 | Tony Ferguson 2018-10-06 | anthony-pettis visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Dan Henderson | Michael Bisping 2009-07-11 | Daniel Cormier 2014-05-24 | dan-henderson visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |
| Paddy Pimblett | King Green 2024-07-27 | Open | paddy-pimblett visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Zhang Weili | Jessica Andrade 2019-08-31 | Open | zhang-weili visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Alexa Grasso | Maycee Barber 2021-02-13 | Open | alexa-grasso visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Julianna Peña | Amanda Nunes 2021-12-11 | Open | julianna-pena visibleStats primeRecord | Open prime window includes recent losses; Cody review suggested. |
| Miesha Tate | Ronda Rousey 2013-12-28 | Amanda Nunes 2016-07-09 | miesha-tate visibleStats primeRecord | Presentation mentions later-career context with post-prime losses. |

## Loss event audit

| Fighter | Opponent | Date | Phase | Elite? | Finished? | Upward division? | Competitive? | Raw penalty | Prime Losses tile? | Post-Prime count? |
|---|---|---|---|---|---|---|---|---:|---|---|
| Jon Jones | Matt Hamill | 2009-12-05 | pre-prime | False | False | False | False | 0.00 | False | False |
| Georges St-Pierre | Matt Hughes | 2004-10-22 | pre-prime | True | True | False | True | -1.50 | False | False |
| Georges St-Pierre | Matt Serra | 2007-04-07 | prime | False | True | False | True | -4.75 | True | False |
| Anderson Silva | Chris Weidman | 2013-07-06 | prime | True | True | False | True | -2.25 | True | False |
| Anderson Silva | Chris Weidman | 2013-12-28 | prime | True | True | False | True | -2.25 | True | False |
| Anderson Silva | Michael Bisping | 2016-02-27 | post-prime | True | False | False | True | 0.00 | False | True |
| Anderson Silva | Daniel Cormier | 2016-07-09 | post-prime | True | False | True | True | 0.00 | False | True |
| Anderson Silva | Israel Adesanya | 2019-02-10 | post-prime | True | False | False | True | 0.00 | False | True |
| Anderson Silva | Jared Cannonier | 2019-05-11 | post-prime | True | True | False | True | 0.00 | False | True |
| Anderson Silva | Uriah Hall | 2020-10-31 | post-prime | False | True | False | True | 0.00 | False | True |
| Alexander Volkanovski | Islam Makhachev | 2023-02-11 | prime | True | False | True | True | -0.75 | True | False |
| Alexander Volkanovski | Islam Makhachev | 2023-10-21 | prime | True | True | True | True | -1.25 | True | False |
| Alexander Volkanovski | Ilia Topuria | 2024-02-17 | prime | True | True | False | True | -2.25 | True | False |
| Kamaru Usman | Leon Edwards | 2022-08-20 | prime | True | True | False | True | -2.25 | True | False |
| Kamaru Usman | Leon Edwards | 2023-03-18 | prime | True | False | False | True | -1.50 | True | False |
| Kamaru Usman | Khamzat Chimaev | 2023-10-21 | post-prime | True | False | True | True | 0.00 | False | True |

## Specific audit notes

- Kamaru Usman: approved prime window ends at 2023-03-18, so both Leon Edwards losses are prime; the Khamzat Chimaev loss is post-prime and upward-division under the current canonical window.
- Georges St-Pierre: Matt Hughes 2004 is pre-prime elite finished; Matt Serra 2007 is prime non-elite/solid finished. The severe Serra event explains loss-context drag without double-counting in the public tile.
- Jon Jones: Matt Hamill is a technical exception and excluded from competitive prime-loss public evidence.
- Alexander Volkanovski: both Islam Makhachev losses are upward-division; Topuria remains prime because the approved window is open.
- Anderson Silva: both Weidman losses are prime; Bisping, Cormier, Adesanya, Cannonier, and Hall are post-prime under the locked window.
