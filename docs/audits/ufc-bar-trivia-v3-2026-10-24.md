# UFC Bar Trivia — question-by-question editorial ledger (draft)

**Base inspected:** main `70a33643c2063902722356a478d21b60326f8b48` · 2026-10-24. **Branch:** `content/ufc-bar-trivia-editorial-v3-20261024`. **PR:** #2083. This is draft-only; nothing is merged or published.

## Locked play rules

Ten multiple-choice questions: R1 has 3 easy, R2 begins with **one more easy** and then has 2 medium, R3 has 3 hard, Last Call has 1 wager question. Scoring, visuals, server-owned results and completed Daily snapshots are unchanged. Round 2's accessible opening is intentional, not a bug.

## Editorial disposition

| Original source rows | Already retired | New retirements | Rework | Keep | Newly authored | Future playable |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 382 | 63 | 98 | 96 | 125 | 110 | 331 |

The semantic-review disposition is recorded explicitly for every source ID. A **rework flag does not itself certify that an existing question's premise has been fixed**; the code also includes a targeted prompt-override map, round-level recalibration, and a source URL fill pass. Source URLs are pointers, not proof that every single fact has passed independent verification. Any fact dispute should block readiness rather than be rubber-stamped.

## Source-backed replacement and rotation policy

- New questions are authored in `ufcBarTriviaV3EasyMedium.ts` and `ufcBarTriviaV3HardFinal.ts`. Do not bring old low-value subjects back just to reach a count.
- Source authority is the UFC rulebook, UFC historical moments, event pages and UFC athlete articles. Some older seeds lack individual citations and currently use a general official UFC archive fallback; they still need direct reference-by-reference adjudication before merge.
- Exact IDs must not recur within 20 consecutive UFC appearances. Existing semantic-family collisions are blocked within the cycle; the prior 3 appearances are additionally protected when one cycle turns over.
- The canonical score normalization and the first easy question in Round 2 are preserved. NFL, CFB and NBA content versions remain unchanged.

## Full legacy source ledger

| ID | Authored round | Disposition | Question | Correct answer | Original source pointer |
| --- | --- | --- | --- | --- | --- |
| ufc-r1-ufc1-winner | round1 | Keep | Who won the UFC 1 tournament? | Royce Gracie | Legacy missing URL; authority fallback |
| ufc-r1-eight-sides | round1 | Keep | How many sides does the UFC Octagon have? | 8 | Legacy missing URL; authority fallback |
| ufc-r1-its-time | round1 | Keep | Who is famous for the UFC introduction “It's time!”? | Bruce Buffer | Legacy missing URL; authority fallback |
| ufc-r1-tuf1-lhw | round1 | Keep | Who won the light heavyweight final on the first season of The Ultimate Fighter? | Forrest Griffin | Legacy missing URL; authority fallback |
| ufc-r1-first-women | round1 | Prior retirement | Who faced Ronda Rousey in the first women's fight in UFC history? | Liz Carmouche | Legacy missing URL; authority fallback |
| ufc-r2-double-champ | round2 | Prior retirement | Who became the first UFC fighter to hold titles in two divisions at the same time? | Conor McGregor | Legacy missing URL; authority fallback |
| ufc-r2-first-bmf | round2 | Rework | Who won the first BMF title in 2019? | Jorge Masvidal | Legacy missing URL; authority fallback |
| ufc-r2-korean-zombie | round2 | Rework | Which fighter was known as “The Korean Zombie”? | Chan Sung Jung | Legacy missing URL; authority fallback |
| ufc-r2-first-city | round2 | Prior retirement | UFC 1 was held in which U.S. city? | Denver | Legacy missing URL; authority fallback |
| ufc-r2-ufc100 | round2 | Keep | Which heavyweight title fight headlined UFC 100? | Brock Lesnar vs. Frank Mir | Legacy missing URL; authority fallback |
| ufc-r3-first-flyweight | round3 | Rework | Who became the UFC's first flyweight champion? | Demetrious Johnson | Legacy missing URL; authority fallback |
| ufc-r3-msg | round2 | Retire | At UFC 205, who won the lightweight title in the main event to become the UFC's first simultaneous two-division champion? | Conor McGregor | Legacy missing URL; authority fallback |
| ufc-r3-tuf-finale | round3 | Rework | The famous 2005 fight credited with helping launch the UFC into a new era featured Forrest Griffin against... | Stephan Bonnar | Legacy missing URL; authority fallback |
| ufc-r3-ronda-awarded | round3 | Prior retirement | Who was named the UFC's first women's bantamweight champion before the division's first UFC title fight? | Ronda Rousey | Legacy missing URL; authority fallback |
| ufc-r3-ufc1-format | round3 | Rework | Which modern feature was missing from UFC 1? | Weight classes | Legacy missing URL; authority fallback |
| ufc-final-ufc1-final | last-call | Keep | Royce Gracie defeated whom in the UFC 1 tournament final? | Gerard Gordeau | Legacy missing URL; authority fallback |
| ufc-final-bmf-ending | last-call | Rework | How did the inaugural Masvidal–Diaz BMF fight officially end? | Doctor stoppage | Legacy missing URL; authority fallback |
| ufc-final-first-event-year | last-call | Prior retirement | In what year did UFC 1 take place? | 1993 | Legacy missing URL; authority fallback |
| ufc-r1-notorious | round1 | Keep | Which UFC star is known as 'The Notorious'? | Conor McGregor | Direct source in seed |
| ufc-r1-bones | round1 | Prior retirement | Which former light heavyweight champion is known as 'Bones'? | Jon Jones | Direct source in seed |
| ufc-r1-rush | round1 | Keep | Which UFC legend fought under the nickname 'Rush'? | Georges St-Pierre | Direct source in seed |
| ufc-r1-spider | round1 | Keep | Which longtime middleweight champion is famously known as 'The Spider'? | Anderson Silva | Direct source in seed |
| ufc-r1-blessed | round1 | Prior retirement | Which Hawaiian UFC star is known as 'Blessed'? | Max Holloway | Direct source in seed |
| ufc-r1-el-cucuy | round1 | Keep | Which former interim lightweight champion is known as 'El Cucuy'? | Tony Ferguson | Direct source in seed |
| ufc-r1-cowboy | round1 | Keep | Which fan favorite is best known simply as 'Cowboy'? | Donald Cerrone | Direct source in seed |
| ufc-r1-thug-rose | round1 | Prior retirement | Which former UFC champion is known as 'Thug Rose'? | Rose Namajunas | Direct source in seed |
| ufc-r1-fight-island-location | round1 | Rework | UFC's famous 'Fight Island' events were staged on which island? | Yas Island | Direct source in seed |
| ufc-r1-first-strawweight-champ | round1 | Prior retirement | Who became the UFC's first women's strawweight champion? | Carla Esparza | Direct source in seed |
| ufc-r1-first-womens-featherweight-champ | round1 | Prior retirement | Who became the UFC's first women's featherweight champion? | Germaine de Randamie | Direct source in seed |
| ufc-r1-first-hof-pair | round1 | Rework | Which two fighters were the first inductees into the UFC Hall of Fame? | Royce Gracie and Ken Shamrock | Direct source in seed |
| ufc-r2-el-cucuy-meaning | round2 | Retire | Tony Ferguson's nickname 'El Cucuy' roughly translates to what in English? | The Boogeyman | Direct source in seed |
| ufc-r2-hof-first-event | round2 | Prior retirement | At UFC 45, which two fighters became the UFC Hall of Fame's first inductees? | Royce Gracie and Ken Shamrock | Direct source in seed |
| ufc-r2-modern-era-event | round2 | Rework | What major rules milestone makes UFC 28 the start of the UFC's modern era? | First event under the Unified Rules of MMA | Direct source in seed |
| ufc-r2-first-outdoor-event | round2 | Retire | What venue milestone did UFC 112 set in Abu Dhabi? | First UFC event held outdoors | Direct source in seed |
| ufc-r2-first-fight-island-ppv | round2 | Prior retirement | UFC 251 launched the first Fight Island run on which Abu Dhabi island? | Yas Island | Direct source in seed |
| ufc-r2-first-abc-main-event | round2 | Keep | Which matchup headlined the first UFC main card broadcast on ABC? | Max Holloway vs. Calvin Kattar | Direct source in seed |
| ufc-r2-esparza-title-opponent | round2 | Keep | Carla Esparza defeated whom to become the UFC's first women's strawweight champion? | Rose Namajunas | Direct source in seed |
| ufc-r2-derandamie-title-opponent | round2 | Keep | Germaine de Randamie beat which former champion to win the inaugural UFC women's featherweight belt? | Holly Holm | Direct source in seed |
| ufc-r2-ufc1-arena | round2 | Retire | UFC 1 took place at which Denver arena? | McNichols Sports Arena | Direct source in seed |
| ufc-r2-first-fight-wing | round2 | Retire | Which famous bout became the first fight inducted into the UFC Hall of Fame's Fight Wing? | Forrest Griffin vs. Stephan Bonnar I | Direct source in seed |
| ufc-r2-hof-jones-gustafsson | round2 | Keep | Jon Jones' classic 2013 title fight against which opponent is in the UFC Hall of Fame Fight Wing? | Alexander Gustafsson | Direct source in seed |
| ufc-r2-hof-hendo-shogun | round2 | Keep | Dan Henderson's legendary five-round 2011 fight against which opponent is in the UFC Hall of Fame? | Mauricio 'Shogun' Rua | Direct source in seed |
| ufc-r3-fastest-ko | round3 | Retire | Who owns the UFC record for the fastest knockout, a five-second finish of Ben Askren? | Jorge Masvidal | Direct source in seed |
| ufc-r3-first-ufc1-fight | round3 | Retire | Which matchup opened the very first UFC event? | Gerard Gordeau vs. Teila Tuli | Direct source in seed |
| ufc-r3-ufc1-first-fight-winner | round3 | Retire | Who won the first fight in UFC history? | Gerard Gordeau | Direct source in seed |
| ufc-r3-hof-hughes-trigg | round3 | Keep | Matt Hughes' famous 2005 comeback fight in the UFC Hall of Fame came against whom? | Frank Trigg | Direct source in seed |
| ufc-r3-hof-sanchez-guida | round3 | Rework | Which 2009 war featuring Diego Sanchez is in the UFC Hall of Fame Fight Wing? | Diego Sanchez vs. Clay Guida | Direct source in seed |
| ufc-r3-hof-swanson-choi | round3 | Rework | Cub Swanson's 2016 Fight Wing classic came against which opponent? | Doo Ho Choi | Direct source in seed |
| ufc-r3-first-hof-contributor | round3 | Retire | Which TapouT co-founder became the first person inducted into the UFC Hall of Fame Contributors Wing? | Charles 'Mask' Lewis | Direct source in seed |
| ufc-r3-fight-island-year | round3 | Rework | The original UFC Fight Island series debuted in which year? | 2020 | Direct source in seed |
| ufc-r3-first-abu-dhabi-event | round3 | Keep | At UFC 112, which middleweight title fight headlined the UFC's first event in Abu Dhabi? | Anderson Silva vs. Demian Maia | Direct source in seed |
| ufc-r3-ufc251-headliner | round3 | Rework | Who challenged Kamaru Usman in the main event of UFC 251, the first Fight Island pay-per-view? | Jorge Masvidal | Direct source in seed |
| ufc-r3-hof-gracie-year | round3 | Retire | Royce Gracie and Ken Shamrock became the UFC Hall of Fame's first inductees in which year? | 2003 | Direct source in seed |
| ufc-r3-esparza-tuf-season | round3 | Retire | Carla Esparza won which season of The Ultimate Fighter before becoming the inaugural UFC strawweight champion? | TUF 20 | Direct source in seed |
| ufc-final-ufc1-name-mistake | last-call | Retire | During the UFC 1 television intro, commentator Bill Wallace accidentally called the promotion the Ultimate Fighting what? | Challenge | Direct source in seed |
| ufc-final-unified-rules-date | last-call | Retire | UFC 28, the promotion's first event under the Unified Rules of MMA, took place in which year? | 2000 | Direct source in seed |
| ufc-final-first-outdoor-city | last-call | Retire | The UFC's first outdoor event was staged in which city? | Abu Dhabi | Direct source in seed |
| ufc-final-first-abc-year | last-call | Retire | The UFC's first main card broadcast on ABC took place in which year? | 2021 | Direct source in seed |
| ufc-r1-founders-pair | round1 | Rework | Which pair is credited by UFC with launching the first Ultimate Fighting Championship in 1993? | Art Davie and Rorion Gracie | Direct source in seed |
| ufc-r1-zuffa-first-event | round1 | Rework | UFC 30 was the first UFC show under which new ownership company? | Zuffa | Direct source in seed |
| ufc-r1-zuffa-first-city | round1 | Retire | Zuffa's first UFC event took place in which city? | Atlantic City | Direct source in seed |
| ufc-r1-brazil-first-champion | round1 | Rework | Who became the first Brazilian fighter to win a UFC championship? | Murilo Bustamante | Direct source in seed |
| ufc-r1-mexico-first-champion | round1 | Keep | Who became the first Mexico-born fighter to win a UFC championship? | Brandon Moreno | Direct source in seed |
| ufc-r1-uk-first-champion | round1 | Keep | Who became the first fighter from the United Kingdom to win a UFC championship? | Michael Bisping | Direct source in seed |
| ufc-r1-canada-first-champion | round1 | Rework | Who became Canada's first UFC champion? | Carlos Newton | Direct source in seed |
| ufc-r1-australia-first-champion | round1 | Keep | Who became Australia's first UFC champion? | Robert Whittaker | Direct source in seed |
| ufc-r1-prodigy | round1 | Keep | Which two-division UFC champion is famously known as \"The Prodigy\"? | BJ Penn | Direct source in seed |
| ufc-r1-women-debut-event | round1 | Keep | UFC 157's Ronda Rousey vs. Liz Carmouche main event introduced which UFC women's division? | Women's bantamweight | Direct source in seed |
| ufc-r1-first-china-champion | round1 | Prior retirement | Who became the UFC's first champion from China? | Zhang Weili | Direct source in seed |
| ufc-r1-bisping-title-opponent | round1 | Prior retirement | Michael Bisping won the UFC middleweight title by knocking out which champion? | Luke Rockhold | Direct source in seed |
| ufc-r1-tuf-year | round1 | Keep | The first season of The Ultimate Fighter aired in which year? | 2005 | Direct source in seed |
| ufc-r2-zuffa-purchase-year | round2 | Rework | Zuffa purchased the UFC in which year? | 2001 | Direct source in seed |
| ufc-r2-zuffa-first-venue | round2 | Retire | Which venue hosted UFC 30, the first event of the Zuffa era? | Trump Taj Mahal | Direct source in seed |
| ufc-r2-bustamante-title-opponent | round2 | Rework | Murilo Bustamante beat which fighter to become Brazil's first UFC champion? | Dave Menne | Direct source in seed |
| ufc-r2-moreno-title-opponent | round2 | Keep | Brandon Moreno submitted which champion to become Mexico's first UFC titleholder? | Deiveson Figueiredo | Direct source in seed |
| ufc-r2-newton-title-opponent | round2 | Rework | Carlos Newton defeated which champion to become Canada's first UFC titleholder? | Pat Miletich | Direct source in seed |
| ufc-r2-whittaker-tuf-version | round2 | Keep | Robert Whittaker first reached the UFC through which version of The Ultimate Fighter? | The Smashes | Direct source in seed |
| ufc-r2-rousey-olympic-sport | round2 | Rework | Before becoming the UFC's first female champion, Ronda Rousey won an Olympic medal in which sport? | Judo | Direct source in seed |
| ufc-r2-rousey-carmouche-city | round2 | Retire | Ronda Rousey and Liz Carmouche made women's UFC history in which California city? | Anaheim | Direct source in seed |
| ufc-r2-first-womens-flyweight-champ | round2 | Keep | Who became the UFC's first women's flyweight champion? | Nicco Montano | Direct source in seed |
| ufc-r2-first-female-double-champ | round2 | Prior retirement | Who became the first woman to hold UFC titles in two divisions at the same time? | Amanda Nunes | Direct source in seed |
| ufc-r2-ufc205-three-title-fights | round2 | Retire | What made UFC 205 unique among UFC cards at the time besides being the first at Madison Square Garden? | It featured three world title fights | Direct source in seed |
| ufc-r2-ufc205-welterweight-draw | round2 | Rework | Which two fighters battled to a majority draw for the welterweight title at UFC 205? | Tyron Woodley and Stephen Thompson | Direct source in seed |
| ufc-r2-first-brazil-event-city | round2 | Retire | The UFC's first event in Brazil took place in which city? | São Paulo | Direct source in seed |
| ufc-r3-ufc-origin-inspiration | round3 | Rework | UFC co-founder Art Davie said which ancient combat sport helped inspire the concept for the UFC? | Pankration | Direct source in seed |
| ufc-r3-first-creative-director | round3 | Retire | Which filmmaker and writer served as the first UFC's creative director? | John Milius | Direct source in seed |
| ufc-r3-bustamante-ufc-debut | round3 | Retire | At UFC 25, Murilo Bustamante made his UFC debut by submitting which opponent? | Yoji Anjo | Direct source in seed |
| ufc-r3-bustamante-debut-opponent | round3 | Prior retirement | Brazil's first UFC champion Murilo Bustamante made his Octagon debut against whom? | Yoji Anjo | Direct source in seed |
| ufc-r3-moreno-title-event | round2 | Prior retirement | At UFC 263, whom did Brandon Moreno submit to become Mexico's first UFC champion? | Deiveson Figueiredo | Direct source in seed |
| ufc-r3-bisping-title-event | round2 | Prior retirement | At UFC 199, Michael Bisping stepped in on short notice and upset which champion for the middleweight title? | Luke Rockhold | Direct source in seed |
| ufc-r3-bisping-tuf-season | round3 | Retire | Michael Bisping first entered the UFC by winning which season of The Ultimate Fighter? | Season 3 | Direct source in seed |
| ufc-r3-newton-title-event | round3 | Prior retirement | At UFC 31, whom did Carlos Newton defeat to become Canada's first UFC champion? | Pat Miletich | Direct source in seed |
| ufc-r3-ufc205-main-finish | round3 | Keep | How did Conor McGregor defeat Eddie Alvarez in the UFC 205 main event? | Second-round TKO | Direct source in seed |
| ufc-r3-ufc205-womens-title | round3 | Retire | Which women's title was defended by Joanna Jedrzejczyk at UFC 205? | Strawweight | Direct source in seed |
| ufc-r3-ultimate-brazil-title-firsts | round3 | Retire | The UFC's first event in Brazil also featured the promotion's first title fights in which two divisions? | Lightweight and middleweight | Direct source in seed |
| ufc-r3-vitor-wanderlei-event | round3 | Rework | Vitor Belfort's famous quick knockout of Wanderlei Silva happened at which event? | UFC Ultimate Brazil | Direct source in seed |
| ufc-r3-tuf1-other-winner | round3 | Rework | Besides Forrest Griffin, which fighter won a tournament on the first season of The Ultimate Fighter? | Diego Sanchez | Direct source in seed |
| ufc-final-zuffa-purchase-date | last-call | Retire | Zuffa's purchase of the UFC was completed in which month of 2001? | January | Direct source in seed |
| ufc-final-first-brazil-two-titles | last-call | Keep | At the UFC's first event in Brazil, which future Hall of Famer fought Wanderlei Silva in the card's famous sprint of a fight? | Vitor Belfort | Direct source in seed |
| ufc-final-first-ufc-name-purpose | last-call | Rework | The original UFC concept was built to answer what basic question? | Which martial art was most effective in a real fight? | Direct source in seed |
| ufc-r1-first-canada-event | round1 | Rework | UFC 83 was the promotion's first event in Canada. Which city hosted it? | Montreal | Direct source in seed |
| ufc-r1-first-canada-city | round1 | Prior retirement | Which Canadian city hosted the UFC for the first time? | Montreal | Direct source in seed |
| ufc-r1-first-australia-event | round1 | Rework | UFC 110 was the promotion's first event in Australia. Which city hosted it? | Sydney | Direct source in seed |
| ufc-r1-first-australia-city | round1 | Prior retirement | Which city hosted the UFC's first Australian event? | Sydney | Direct source in seed |
| ufc-r1-first-europe-event | round1 | Rework | UFC 38: Brawl at the Hall was the promotion's first event in Europe. Which country hosted it? | England | Direct source in seed |
| ufc-r1-first-europe-venue | round1 | Retire | The UFC's first European event was held at which famous London venue? | Royal Albert Hall | Direct source in seed |
| ufc-r1-first-brazil-event | round1 | Retire | What was the name of the UFC's first event in Brazil? | Ultimate Brazil | Direct source in seed |
| ufc-r1-first-france-headliner | round1 | Rework | Who headlined the UFC's first event in France? | Ciryl Gane | Direct source in seed |
| ufc-r1-first-france-opponent | round1 | Rework | Ciryl Gane faced which heavyweight in the main event of the UFC's first show in France? | Tai Tuivasa | Direct source in seed |
| ufc-r1-tuf2-winner | round1 | Rework | Which future UFC champion won The Ultimate Fighter season 2? | Rashad Evans | Direct source in seed |
| ufc-r1-tuf3-winner | round1 | Rework | Which future UFC champion won The Ultimate Fighter season 3? | Michael Bisping | Direct source in seed |
| ufc-r1-tuf5-winner | round1 | Rework | Which fan favorite won The Ultimate Fighter season 5? | Nate Diaz | Direct source in seed |
| ufc-r1-tuf18-womens-winner | round1 | Rework | Who became the first woman to win The Ultimate Fighter? | Julianna Peña | Direct source in seed |
| ufc-r1-black-beast | round1 | Keep | Which heavyweight fan favorite is known as \"The Black Beast\"? | Derrick Lewis | Direct source in seed |
| ufc-r1-ufc100-location | round1 | Retire | UFC 100 took place in which city? | Las Vegas | Direct source in seed |
| ufc-r2-first-nevada-sanctioned | round2 | Retire | UFC 33 became the first UFC event sanctioned under the Unified Rules by which state athletic commission? | Nevada State Athletic Commission | Direct source in seed |
| ufc-r2-ufc70-city | round2 | Retire | UFC 70, an early major international card, was held in which English city? | Manchester | Direct source in seed |
| ufc-r2-first-blue-chip-sponsor | round2 | Retire | Which company became the first blue-chip sponsor to advertise inside the UFC Octagon in 2008? | Anheuser-Busch | Direct source in seed |
| ufc-r2-ufc100-technical-event-number | round2 | Prior retirement | Although it was called UFC 100, it was technically what number UFC event when Fight Nights and TUF finales were counted? | 133rd | Direct source in seed |
| ufc-r2-ufc100-fan-expo | round2 | Retire | Which landmark card was accompanied by the UFC's first Fan Expo? | UFC 100 | Direct source in seed |
| ufc-r2-ufc83-main-result | round2 | Rework | What did Georges St-Pierre accomplish in the main event of the UFC's first Canadian card? | Regained the welterweight title | Direct source in seed |
| ufc-r2-ufc110-main-winner | round2 | Rework | Who won the main event of the UFC's first card in Australia? | Cain Velasquez | Direct source in seed |
| ufc-r2-ufc38-main-winner | round2 | Rework | Who defended the welterweight title in the main event of UFC 38, the UFC's first European card? | Matt Hughes | Direct source in seed |
| ufc-r2-hof-four-wings | round2 | Retire | How many distinct wings does the UFC Hall of Fame use? | 4 | Direct source in seed |
| ufc-r2-hof-contributors-purpose | round2 | Prior retirement | Which UFC Hall of Fame wing honors major contributions outside active competition? | Contributors Wing | Direct source in seed |
| ufc-r2-hof-fight-purpose | round2 | Prior retirement | Which UFC Hall of Fame wing honors historically significant individual bouts? | Fight Wing | Direct source in seed |
| ufc-r2-first-womens-hof-fight | round2 | Rework | Which bout became the first women's fight selected for the UFC Hall of Fame Fight Wing? | Zhang Weili vs. Joanna Jedrzejczyk | Direct source in seed |
| ufc-r2-hof-2025-fight | round2 | Rework | Which UFC 236 classic joined the Hall of Fame Fight Wing in the Class of 2025? | Israel Adesanya vs. Kelvin Gastelum | Direct source in seed |
| ufc-r2-hof-2024-fight | round2 | Rework | Which UFC 117 comeback fight joined the Hall of Fame Fight Wing in 2024? | Anderson Silva vs. Chael Sonnen | Direct source in seed |
| ufc-r2-hof-2023-fight | round2 | Rework | Which bloody UFC 189 title fight entered the Hall of Fame Fight Wing in 2023? | Robbie Lawler vs. Rory MacDonald II | Direct source in seed |
| ufc-r3-hof-swanson-choi-event | round2 | Retire | At UFC 206, Cub Swanson fought which opponent in a bout later inducted into the UFC Hall of Fame? | Dooho Choi | Direct source in seed |
| ufc-r3-hof-hendo-shogun-event | round2 | Prior retirement | At UFC 139, Dan Henderson fought which opponent in their Hall of Fame five-round battle? | Mauricio 'Shogun' Rua | Direct source in seed |
| ufc-r3-hof-hughes-trigg-event | round2 | Prior retirement | At UFC 52, Matt Hughes fought which rival in their Hall of Fame rematch? | Frank Trigg | Direct source in seed |
| ufc-r3-hof-sanchez-guida-event | round3 | Retire | Diego Sanchez and Clay Guida's Hall of Fame fight was staged at which show? | The Ultimate Fighter 9 Finale | Direct source in seed |
| ufc-r3-hof-williams-coleman | round3 | Keep | Which fighter scored the upset over Mark Coleman in the 1998 bout later inducted into the UFC Hall of Fame? | Pete Williams | Direct source in seed |
| ufc-r3-hof-jones-gus-location | round3 | Retire | Jon Jones and Alexander Gustafsson's UFC 165 classic took place in which city? | Toronto | Direct source in seed |
| ufc-r3-hof-zhang-joanna-event | round2 | Retire | At UFC 248, Zhang Weili defended the strawweight title in a Hall of Fame classic against whom? | Joanna Jedrzejczyk | Direct source in seed |
| ufc-r3-hof-adesanya-gastelum-event | round2 | Prior retirement | At UFC 236, Israel Adesanya won the interim middleweight title in a classic against whom? | Kelvin Gastelum | Direct source in seed |
| ufc-r3-hof-lawler-macdonald-event | round2 | Retire | At UFC 189, Robbie Lawler fought which opponent in their Hall of Fame welterweight title rematch? | Rory MacDonald | Direct source in seed |
| ufc-r3-hof-silva-sonnen-event | round2 | Retire | At UFC 117, Anderson Silva rallied late in the fifth round to submit which challenger? | Chael Sonnen | Direct source in seed |
| ufc-r3-first-asia-event | round3 | Rework | The UFC's first event in Asia was held in which country? | Japan | Direct source in seed |
| ufc-r3-first-asia-city | round3 | Retire | Which Japanese city hosted the UFC's first event in Asia? | Yokohama | Direct source in seed |
| ufc-r3-hunt-bigfoot-draw | round3 | Keep | What decision did the judges announce after five rounds of Mark Hunt vs. Antonio \"Bigfoot\" Silva in Brisbane? | Majority draw | Direct source in seed |
| ufc-r3-el-guapo | round3 | Keep | Which UFC Hall of Famer is famously nicknamed \"El Guapo\"? | Bas Rutten | Direct source in seed |
| ufc-r3-hof-modern-cutoff | round3 | Retire | UFC 28 serves as the dividing line between which two UFC Hall of Fame eras? | Pioneer and Modern | Direct source in seed |
| ufc-final-first-europe-date | last-call | Retire | In what year did the UFC stage its first event in Europe at Royal Albert Hall? | 2002 | Direct source in seed |
| ufc-final-first-canada-date | last-call | Retire | In what year did UFC 83 bring the Octagon to Canada for the first time? | 2008 | Direct source in seed |
| ufc-final-first-australia-date | last-call | Retire | In what year did UFC 110 become the promotion's first event in Australia? | 2010 | Direct source in seed |
| ufc-final-hof-contributor-matchmaker | last-call | Retire | Which longtime UFC matchmaker is a member of the Hall of Fame Contributors Wing? | Joe Silva | Direct source in seed |
| ufc-final-hof-contributor-cofounder | last-call | Rework | Which UFC co-founder was inducted into the Hall of Fame Contributors Wing in 2018? | Art Davie | Direct source in seed |
| ufc-r1-oliveira-chandler | round1 | Prior retirement | Charles Oliveira won the vacant UFC lightweight title by stopping which opponent? | Michael Chandler | Direct source in seed |
| ufc-r1-gsp-first-title-hughes | round1 | Prior retirement | Georges St-Pierre won his first UFC welterweight title by defeating whom? | Matt Hughes | Legacy missing URL; authority fallback |
| ufc-r1-cejudo-dj | round1 | Prior retirement | Who ended Demetrious Johnson's historic UFC flyweight title reign? | Henry Cejudo | Legacy missing URL; authority fallback |
| ufc-r1-garbrandt-cruz | round1 | Prior retirement | Who took the UFC bantamweight title from Dominick Cruz at UFC 207? | Cody Garbrandt | Legacy missing URL; authority fallback |
| ufc-r1-volkanovski-holloway | round1 | Prior retirement | Who ended Max Holloway's first UFC featherweight title reign? | Alexander Volkanovski | Legacy missing URL; authority fallback |
| ufc-r1-edgar-penn | round1 | Prior retirement | Who took the UFC lightweight title from BJ Penn at UFC 112? | Frankie Edgar | Direct source in seed |
| ufc-r1-silva-franklin | round1 | Prior retirement | Anderson Silva won the UFC middleweight title by defeating whom? | Rich Franklin | Direct source in seed |
| ufc-r1-joanna-esparza | round1 | Prior retirement | Joanna Jedrzejczyk won the UFC strawweight title by defeating which inaugural champion? | Carla Esparza | Legacy missing URL; authority fallback |
| ufc-r1-khabib-final | round1 | Prior retirement | Who did Khabib Nurmagomedov defeat in his final professional fight? | Justin Gaethje | Legacy missing URL; authority fallback |
| ufc-r1-holloway-aldo | round1 | Prior retirement | Max Holloway became undisputed featherweight champion by defeating whom? | Jose Aldo | Legacy missing URL; authority fallback |
| ufc-r1-woodley-lawler | round1 | Prior retirement | Tyron Woodley won the UFC welterweight title by knocking out whom? | Robbie Lawler | Legacy missing URL; authority fallback |
| ufc-r1-nunes-tate | round1 | Prior retirement | Amanda Nunes won her first UFC title by defeating whom at UFC 200? | Miesha Tate | Legacy missing URL; authority fallback |
| ufc-r1-khabib-eagle | round1 | Prior retirement | Which undefeated UFC champion is known as 'The Eagle'? | Khabib Nurmagomedov | Legacy missing URL; authority fallback |
| ufc-r1-poatan | round1 | Keep | Which two-division UFC champion is known as 'Poatan'? | Alex Pereira | Legacy missing URL; authority fallback |
| ufc-r1-rocky-edwards | round1 | Rework | Which former UFC welterweight champion is nicknamed 'Rocky'? | Leon Edwards | Legacy missing URL; authority fallback |
| ufc-r2-ufc194-two-title-changes | round2 | Keep | At UFC 194, Conor McGregor took Jose Aldo's featherweight title and which fighter took Chris Weidman's middleweight title? | Luke Rockhold | Legacy missing URL; authority fallback |
| ufc-r2-ufc189-interim | round2 | Keep | Conor McGregor won an interim featherweight title at UFC 189 by defeating whom? | Chad Mendes | Legacy missing URL; authority fallback |
| ufc-r2-ufc202-main | round2 | Rework | Which rematch headlined UFC 202? | Conor McGregor vs. Nate Diaz II | Legacy missing URL; authority fallback |
| ufc-r2-ufc264-main | round2 | Rework | Which trilogy fight headlined UFC 264? | Dustin Poirier vs. Conor McGregor III | Legacy missing URL; authority fallback |
| ufc-r2-ufc280-lightweight | round2 | Keep | Who won the vacant lightweight title by submitting Charles Oliveira at UFC 280? | Islam Makhachev | Legacy missing URL; authority fallback |
| ufc-r2-ufc284-champ-champ | round2 | Keep | Islam Makhachev defended the lightweight title at UFC 284 against which featherweight champion? | Alexander Volkanovski | Legacy missing URL; authority fallback |
| ufc-r2-ufc300-bmf | round2 | Keep | Who won the BMF title with a last-second knockout of Justin Gaethje at UFC 300? | Max Holloway | Legacy missing URL; authority fallback |
| ufc-r2-ufc300-main | round2 | Keep | Which light heavyweight title fight headlined UFC 300? | Alex Pereira vs. Jamahal Hill | Legacy missing URL; authority fallback |
| ufc-r2-ufc306-sphere | round2 | Rework | UFC 306 was staged inside which futuristic Las Vegas venue? | Sphere | Legacy missing URL; authority fallback |
| ufc-r2-cormier-stipe | round2 | Keep | Daniel Cormier became a simultaneous two-division champion by knocking out which heavyweight champion? | Stipe Miocic | Legacy missing URL; authority fallback |
| ufc-r2-pena-nunes | round2 | Keep | Who shocked Amanda Nunes to win the women's bantamweight title at UFC 269? | Julianna Pena | Legacy missing URL; authority fallback |
| ufc-r2-strickland-adesanya | round2 | Keep | Who upset Israel Adesanya to win the middleweight title at UFC 293? | Sean Strickland | Legacy missing URL; authority fallback |
| ufc-r2-edwards-usman | round2 | Retire | Leon Edwards won the welterweight title from Kamaru Usman with what strike? | Head kick | Legacy missing URL; authority fallback |
| ufc-r2-dillashaw-barao | round2 | Keep | TJ Dillashaw won his first UFC title by upsetting which champion at UFC 173? | Renan Barao | Legacy missing URL; authority fallback |
| ufc-r2-miocic-werdum | round2 | Prior retirement | Stipe Miocic won his first UFC heavyweight title by knocking out whom in Brazil? | Fabricio Werdum | Legacy missing URL; authority fallback |
| ufc-r3-serra-upset-event | round2 | Prior retirement | At UFC 69, Matt Serra pulled off a massive upset by stopping which welterweight champion? | Georges St-Pierre | Legacy missing URL; authority fallback |
| ufc-r3-weidman-upset-event | round2 | Retire | At UFC 162, Chris Weidman ended the long middleweight title reign of which champion? | Anderson Silva | Legacy missing URL; authority fallback |
| ufc-r3-couture-sylvia-return | round3 | Keep | Which heavyweight champion did 43-year-old Randy Couture beat after coming out of retirement at UFC 68? | Tim Sylvia | Direct source in seed |
| ufc-r3-cejudo-dj-event | round2 | Retire | At UFC 227, Henry Cejudo ended the long flyweight title reign of which champion? | Demetrious Johnson | Legacy missing URL; authority fallback |
| ufc-r3-pena-nunes-rematch | round2 | Rework | At UFC 277, who regained the women's bantamweight title from Julianna Pena in their rematch? | Amanda Nunes | Legacy missing URL; authority fallback |
| ufc-r3-miocic-dc-regain | round2 | Rework | At UFC 241, who regained the heavyweight title from Daniel Cormier in their rematch? | Stipe Miocic | Legacy missing URL; authority fallback |
| ufc-r3-miocic-dc-trilogy | round2 | Prior retirement | At UFC 252, who won the deciding third fight in the Stipe Miocic-Daniel Cormier trilogy? | Stipe Miocic | Legacy missing URL; authority fallback |
| ufc-r3-topuria-volkanovski | round2 | Keep | At UFC 298, who knocked out Alexander Volkanovski to win the featherweight title? | Ilia Topuria | Legacy missing URL; authority fallback |
| ufc-r3-du-plessis-first-sa | round3 | Rework | Who became the first South African UFC champion? | Dricus du Plessis | Legacy missing URL; authority fallback |
| ufc-r3-du-plessis-strickland | round3 | Keep | Dricus du Plessis won the middleweight title from whom at UFC 297? | Sean Strickland | Legacy missing URL; authority fallback |
| ufc-r3-ufc278-round | round3 | Rework | Leon Edwards' title-winning head kick against Kamaru Usman came in which round? | Fifth | Legacy missing URL; authority fallback |
| ufc-r3-ufc300-holloway-time | round3 | Keep | Max Holloway knocked out Justin Gaethje with how much time left at UFC 300? | One second | Legacy missing URL; authority fallback |
| ufc-r3-ufc194-aldo-time | round3 | Retire | How quickly did Conor McGregor knock out Jose Aldo at UFC 194? | 13 seconds | Legacy missing URL; authority fallback |
| ufc-r3-ufc207-nunes-rousey | round3 | Retire | Amanda Nunes stopped Ronda Rousey in how many seconds at UFC 207? | 48 seconds | Legacy missing URL; authority fallback |
| ufc-r3-ufc200-nunes-method | round3 | Keep | How did Amanda Nunes finish Miesha Tate to win the title at UFC 200? | Rear-naked choke | Legacy missing URL; authority fallback |
| ufc-r3-ufc262-oliveira-round | round3 | Rework | Charles Oliveira stopped Michael Chandler in which round to win the vacant lightweight title? | Second | Legacy missing URL; authority fallback |
| ufc-r3-ufc280-makhachev-method | round3 | Keep | How did Islam Makhachev finish Charles Oliveira to win the lightweight title? | Arm-triangle choke | Legacy missing URL; authority fallback |
| ufc-r3-ufc226-dc-round | round3 | Rework | Daniel Cormier knocked out Stipe Miocic in which round at UFC 226? | First | Legacy missing URL; authority fallback |
| ufc-r3-ufc198-city | round3 | Retire | Stipe Miocic won the heavyweight title from Fabricio Werdum in which Brazilian city? | Curitiba | Legacy missing URL; authority fallback |
| ufc-r3-ufc306-main | round3 | Rework | Which bantamweight title fight headlined the UFC's Sphere event, UFC 306? | Sean O'Malley vs. Merab Dvalishvili | Legacy missing URL; authority fallback |
| ufc-final-ufc194-main-seconds | last-call | Retire | What was the official time of Conor McGregor's title-winning knockout of Jose Aldo? | 0:13 | Legacy missing URL; authority fallback |
| ufc-final-ufc278-kick-round | last-call | Retire | Leon Edwards' famous head-kick knockout of Kamaru Usman came in which round? | Round 5 | Legacy missing URL; authority fallback |
| ufc-final-ufc300-bmf-time | last-call | Retire | At what official time did Max Holloway knock out Justin Gaethje at UFC 300? | 4:59 of Round 5 | Legacy missing URL; authority fallback |
| ufc-final-jones-hamill-dq | last-call | Keep | Jon Jones' lone official UFC loss came by disqualification against which fighter? | Matt Hamill | Direct source in seed |
| ufc-final-ufc205-opponent | last-call | Prior retirement | Whom did Conor McGregor defeat to become the UFC's first simultaneous two-division champion? | Eddie Alvarez | Legacy missing URL; authority fallback |
| ufc-r1-buckley-kasanganay | round1 | Rework | Joaquin Buckley's viral jump-spinning back-kick knockout came against which opponent? | Impa Kasanganay | Direct source in seed |
| ufc-r1-kongo-barry-comeback | round1 | Rework | Who survived being dropped twice by Pat Barry before scoring a stunning comeback knockout in 2011? | Cheick Kongo | Direct source in seed |
| ufc-r1-sexyama | round1 | Rework | Which UFC fan favorite was widely dubbed \"Sexyama\"? | Yoshihiro Akiyama | Direct source in seed |
| ufc-r1-serra-tuf4 | round1 | Prior retirement | Which fighter won The Ultimate Fighter 4 and then shocked Georges St-Pierre for the title? | Matt Serra | Legacy missing URL; authority fallback |
| ufc-r1-roy-nelson-tuf10 | round1 | Rework | Which heavyweight known as 'Big Country' won The Ultimate Fighter 10? | Roy Nelson | Legacy missing URL; authority fallback |
| ufc-r1-tony-tuf13 | round1 | Rework | Which future interim lightweight champion won The Ultimate Fighter 13? | Tony Ferguson | Legacy missing URL; authority fallback |
| ufc-r1-gastelum-tuf17 | round1 | Rework | Which fighter upset Uriah Hall to win The Ultimate Fighter 17? | Kelvin Gastelum | Legacy missing URL; authority fallback |
| ufc-r1-pena-tuf18 | round1 | Retire | Who became the first female winner of The Ultimate Fighter? | Julianna Pena | Legacy missing URL; authority fallback |
| ufc-r1-usman-tuf21 | round1 | Rework | Which future welterweight champion won The Ultimate Fighter 21? | Kamaru Usman | Legacy missing URL; authority fallback |
| ufc-r1-big-john | round1 | Keep | Which referee became an early UFC icon under the nickname 'Big John'? | John McCarthy | Legacy missing URL; authority fallback |
| ufc-r1-herb-dean | round1 | Rework | Which longtime referee has become one of the UFC's most recognizable officials? | Herb Dean | Legacy missing URL; authority fallback |
| ufc-r1-voice-octagon | round1 | Retire | Who is known as the 'Voice of the Octagon' and announces fighters before UFC bouts? | Bruce Buffer | Legacy missing URL; authority fallback |
| ufc-r1-rogan-role | round1 | Keep | Joe Rogan is best known in UFC broadcasts for which role? | Color commentator | Legacy missing URL; authority fallback |
| ufc-r1-anik-role | round1 | Keep | Jon Anik is primarily known in UFC broadcasts as a... | Play-by-play announcer | Legacy missing URL; authority fallback |
| ufc-r1-ufc205-venue | round1 | Keep | UFC 205 was the promotion's first event at which famous arena? | Madison Square Garden | Legacy missing URL; authority fallback |
| ufc-r2-ufc129-city | round2 | Keep | UFC 129, the promotion's first stadium-scale Canadian event, took place in which city? | Toronto | Legacy missing URL; authority fallback |
| ufc-r2-ufc193-city-melbourne | round2 | Rework | Which Australian city hosted UFC 193, where Holly Holm upset Ronda Rousey? | Melbourne | Legacy missing URL; authority fallback |
| ufc-r2-ufc243-city | round2 | Retire | UFC 243, headlined by Whittaker vs. Adesanya, was held in which city? | Melbourne | Legacy missing URL; authority fallback |
| ufc-r2-california-kid | round2 | Prior retirement | Which longtime bantamweight contender is known as \"The California Kid\"? | Urijah Faber | Direct source in seed |
| ufc-r2-russia-debut-city | round2 | Rework | Which city hosted the UFC's first event in Russia in 2018? | Moscow | Direct source in seed |
| ufc-r2-first-mexico | round2 | Retire | Which country hosted UFC 180, a landmark first for the promotion? | Mexico | Legacy missing URL; authority fallback |
| ufc-r2-natural-born-killer | round2 | Keep | Which former interim welterweight champion is known as \"The Natural Born Killer\"? | Carlos Condit | Direct source in seed |
| ufc-r2-ufc83-main | round2 | Prior retirement | Who did Georges St-Pierre defeat in the main event of UFC 83 in Montreal? | Matt Serra | Legacy missing URL; authority fallback |
| ufc-r2-price-brown-hammerfists | round2 | Rework | Niko Price scored one of the UFC's strangest knockouts by hammerfisting which opponent from the bottom position? | Randy Brown | Direct source in seed |
| ufc-r2-triple-c | round2 | Keep | Which Olympic gold medalist and two-division UFC champion adopted the nickname \"Triple C\"? | Henry Cejudo | Direct source in seed |
| ufc-r2-stun-gun | round2 | Keep | Which South Korean welterweight was known as \"The Stun Gun\"? | Dong Hyun Kim | Direct source in seed |
| ufc-r2-sanchez-guida-event | round2 | Retire | Diego Sanchez vs. Clay Guida took place at the finale of which season of The Ultimate Fighter? | Season 9 | Direct source in seed |
| ufc-r2-jones-gus-event | round2 | Prior retirement | At UFC 165, Jon Jones fought which challenger in their Hall of Fame light heavyweight title fight? | Alexander Gustafsson | Direct source in seed |
| ufc-r2-mighty-mouse | round2 | Prior retirement | Which longtime flyweight champion is known as \"Mighty Mouse\"? | Demetrious Johnson | Direct source in seed |
| ufc-r2-first-msg-year | round2 | Retire | UFC first held an event at Madison Square Garden in which year? | 2016 | Legacy missing URL; authority fallback |
| ufc-r3-tuf3-other-winner | round3 | Retire | Alongside Michael Bisping, who won the other tournament on The Ultimate Fighter 3? | Kendall Grove | Legacy missing URL; authority fallback |
| ufc-r3-tuf4-other-winner | round3 | Retire | Alongside Matt Serra, who won the other tournament on The Ultimate Fighter 4? | Travis Lutter | Legacy missing URL; authority fallback |
| ufc-r3-tuf18-male-winner | round3 | Retire | Who won the men's bantamweight tournament on The Ultimate Fighter 18? | Chris Holdsworth | Legacy missing URL; authority fallback |
| ufc-r3-mir-sylvia-arm | round3 | Keep | Frank Mir won the vacant heavyweight title at UFC 48 by breaking which opponent's arm with an armbar? | Tim Sylvia | Direct source in seed |
| ufc-r3-tuf21-format | round3 | Rework | The Ultimate Fighter 21 was built around a rivalry between American Top Team and which gym? | Blackzilians | Legacy missing URL; authority fallback |
| ufc-r3-silva-belfort-front-kick | round3 | Keep | Anderson Silva's famous front-kick knockout at UFC 126 came against whom? | Vitor Belfort | Direct source in seed |
| ufc-r3-hof-modern-bisping | round3 | Prior retirement | Michael Bisping is inducted in which UFC Hall of Fame wing? | Modern Wing | Legacy missing URL; authority fallback |
| ufc-r3-hof-gracie-wing | round3 | Prior retirement | Royce Gracie belongs to which UFC Hall of Fame wing? | Pioneer Wing | Direct source in seed |
| ufc-r3-hof-mask-wing | round3 | Prior retirement | TapouT co-founder Charles 'Mask' Lewis is honored in which Hall of Fame wing? | Contributors Wing | Direct source in seed |
| ufc-r3-zombie-first-twister | round3 | Keep | Whom did Chan Sung Jung submit with the first Twister finish in UFC history? | Leonard Garcia | Direct source in seed |
| ufc-r3-yair-zombie-elbow | round3 | Keep | Yair Rodriguez knocked out The Korean Zombie in the final second of their 2018 classic with what strike? | Up elbow | Direct source in seed |
| ufc-r3-russia-debut-winner | round3 | Rework | Who submitted Mark Hunt in the main event of the UFC's first event in Russia? | Aleksei Oleinik | Direct source in seed |
| ufc-r3-first-mexico-city | round3 | Prior retirement | UFC's first event in Mexico was held in which city? | Mexico City | Legacy missing URL; authority fallback |
| ufc-r3-ufc180-interim | round3 | Keep | Fabricio Werdum won an interim heavyweight title at UFC 180 by stopping whom? | Mark Hunt | Legacy missing URL; authority fallback |
| ufc-r3-ufc129-main | round3 | Keep | Which welterweight title fight headlined UFC 129 in Toronto? | Georges St-Pierre vs. Jake Shields | Legacy missing URL; authority fallback |
| ufc-r3-ufc193-venue-name | round3 | Prior retirement | UFC 193 took place at a Melbourne stadium then known as what? | Etihad Stadium | Legacy missing URL; authority fallback |
| ufc-r3-ufc243-venue-name | round3 | Retire | UFC 243 took place at which Melbourne venue? | Marvel Stadium | Legacy missing URL; authority fallback |
| ufc-r3-griffin-bonnar-year | round3 | Retire | Forrest Griffin vs. Stephan Bonnar I took place in which year? | 2005 | Direct source in seed |
| ufc-r3-tuf1-network | round3 | Rework | The first season of The Ultimate Fighter originally aired on which network? | Spike TV | Direct source in seed |
| ufc-r3-ufc205-state | round3 | Keep | UFC 205 became possible after professional MMA was legalized in which state? | New York | Legacy missing URL; authority fallback |
| ufc-final-schnell-sumudaerji | last-call | Rework | Who survived a barrage from Sumudaerji and rallied to win by triangle choke in one of 2022's wildest UFC comebacks? | Matt Schnell | Direct source in seed |
| ufc-final-dean-of-mean | last-call | Keep | Which UFC light heavyweight was known as \"The Dean of Mean\"? | Keith Jardine | Direct source in seed |
| ufc-final-daley-koscheck-release | last-call | Keep | Which UFC 113 fighter was released after throwing a punch at Josh Koscheck after the final bell? | Paul Daley | Direct source in seed |
| ufc-final-belfort-ufc12-age | last-call | Keep | How old was Vitor Belfort when he won the UFC 12 heavyweight tournament? | 19 | Direct source in seed |
| ufc-final-smith-sell-comeback | last-call | Keep | Who scored the famous TUF 4 Finale knockout of Pete Sell after being badly hurt by a body shot? | Scott Smith | Direct source in seed |
| ufc-r1-jimmerson-one-glove | round1 | Rework | Which UFC 1 fighter famously entered the Octagon wearing one boxing glove? | Art Jimmerson | Direct source in seed |
| ufc-r1-abbott-fingerless | round1 | Retire | Who was the first UFC fighter to wear protective fingerless gloves in competition? | Tank Abbott | Direct source in seed |
| ufc-r1-first-headkick-ko | round1 | Rework | Who scored the first head-kick knockout in UFC history? | Gerard Gordeau | Direct source in seed |
| ufc-r1-first-170-fight | round1 | Retire | The first UFC fight contested at 170 pounds featured Laverne Clark against whom? | Josh Stewart | Direct source in seed |
| ufc-r1-first-155-fight | round1 | Retire | Jens Pulver fought whom in the UFC's first 155-pound bout? | Joao Roque | Direct source in seed |
| ufc-r1-first-145-fight | round1 | Retire | The UFC's first 145-pound bout featured Pablo Garza against whom? | Fredson Paixao | Direct source in seed |
| ufc-r1-first-135-fight | round1 | Retire | The UFC's first 135-pound bout featured Nick Pace against whom? | Will Campuzano | Direct source in seed |
| ufc-r1-first-125-fight | round1 | Rework | The UFC's first flyweight bout featured Demetrious Johnson against whom? | Ian McCall | Direct source in seed |
| ufc-r1-first-uk | round1 | Retire | What subtitle did UFC 38, the promotion's first event in the United Kingdom, carry? | Brawl at the Hall | Direct source in seed |
| ufc-r1-gonzaga-crocop | round1 | Rework | Who shocked Mirko Cro Cop by knocking him out with a head kick at UFC 70? | Gabriel Gonzaga | Direct source in seed |
| ufc-r1-first-network-tv | round1 | Rework | Which two heavyweights fought in UFC's first bout broadcast live on U.S. network television? | Cain Velasquez and Junior dos Santos | Legacy missing URL; authority fallback |
| ufc-r1-fox-first-winner | round1 | Retire | Who won the UFC's first fight broadcast live on FOX? | Junior dos Santos | Legacy missing URL; authority fallback |
| ufc-r1-ufc3-winner | round1 | Rework | Who won the unusual UFC 3 tournament after entering as an alternate? | Steve Jennum | Legacy missing URL; authority fallback |
| ufc-r1-ufc4-winner | round1 | Retire | Who won the UFC 4 tournament? | Royce Gracie | Direct source in seed |
| ufc-r1-ufc6-winner | round1 | Rework | Who won the UFC 6 tournament? | Oleg Taktarov | Direct source in seed |
| ufc-r2-ufc4-final | round2 | Rework | Royce Gracie defeated whom in the UFC 4 tournament final? | Dan Severn | Direct source in seed |
| ufc-r2-ufc5-winner | round2 | Retire | Who won the UFC 5 tournament? | Dan Severn | Direct source in seed |
| ufc-r2-ufc5-superfight | round2 | Rework | The UFC 5 Superfight between Royce Gracie and Ken Shamrock ended how? | Draw | Direct source in seed |
| ufc-r2-ufc6-final | round2 | Retire | Oleg Taktarov defeated whom in the UFC 6 tournament final? | Tank Abbott | Direct source in seed |
| ufc-r2-ufc6-fastest-sub | round2 | Retire | Oleg Taktarov set a UFC submission record by finishing Anthony Macias in how many seconds? | 9 | Direct source in seed |
| ufc-r2-gloves-mandatory | round2 | Keep | At UFC 14, which piece of equipment became mandatory for fighters? | Protective MMA-style gloves | Direct source in seed |
| ufc-r2-gloves-first-appearance | round2 | Retire | At UFC 9, which piece of protective equipment first appeared in UFC competition? | MMA-style gloves | Direct source in seed |
| ufc-r2-unified-rules-first | round2 | Retire | UFC 28 was the first UFC show held under which standardized ruleset? | Unified Rules of MMA | Direct source in seed |
| ufc-r2-last-bare-knuckle | round2 | Retire | Which bout is listed by UFC as its last bare-knuckle fight? | Randy Couture vs. Steven Graham | Direct source in seed |
| ufc-r2-last-no-weightclasses | round2 | Rework | What was the last UFC event held without weight classes? | Ultimate Ultimate '96 | Direct source in seed |
| ufc-r2-last-one-night-tourney | round2 | Rework | UFC 23: Ultimate Japan 2 marked the final appearance of which old-school UFC format? | One-night tournament | Direct source in seed |
| ufc-r2-sterling-yan-dq | round2 | Keep | Who won the UFC bantamweight title by disqualification after Petr Yan landed an illegal knee at UFC 259? | Aljamain Sterling | Direct source in seed |
| ufc-r2-ufc38-main | round2 | Rework | Which welterweight title rematch headlined UFC 38, the first UFC event in the UK? | Matt Hughes vs. Carlos Newton | Direct source in seed |
| ufc-r2-ufc-japan-city | round2 | Retire | UFC Japan: Ultimate Japan was held in which city? | Yokohama | Direct source in seed |
| ufc-r2-sakuraba-ufc-tourney | round2 | Rework | Which future PRIDE legend won the UFC Japan heavyweight tournament in 1997? | Kazushi Sakuraba | Legacy missing URL; authority fallback |
| ufc-r3-last-headbutt | round3 | Retire | UFC lists which fighter as landing the last legal headbutt before the technique was banned? | Mark Coleman | Direct source in seed |
| ufc-r3-last-groin-shot | round3 | Retire | At UFC 12, which now-illegal strike was recorded for the final time while still legal? | Groin strike | Direct source in seed |
| ufc-r3-last-shoes | round3 | Retire | At UFC 30, Mark Robinson became the last UFC fighter to compete wearing what? | Shoes | Direct source in seed |
| ufc-r3-last-gi | round3 | Retire | At UFC 18, Frank Caracci became the last UFC fighter to compete wearing what? | A gi | Direct source in seed |
| ufc-r3-last-down-knees | round3 | Retire | At UFC 14, which technique was used legally for the final time before later being prohibited? | Knees to the head of a downed opponent | Direct source in seed |
| ufc-r3-first-wheel-kick-ko | round3 | Keep | Who scored the first wheel-kick knockout in UFC history? | Edson Barboza | Direct source in seed |
| ufc-r3-double-ko | round3 | Keep | Which two fighters produced UFC's famous double-knockout/no-contest at The Ultimate Fighter 5 Finale? | Gray Maynard and Rob Emerson | Direct source in seed |
| ufc-r3-first-170-event | round3 | Retire | At UFC 16, Laverne Clark vs. Josh Stewart became the UFC's first fight contested at what weight? | 170 pounds | Direct source in seed |
| ufc-r3-first-155-event | round3 | Retire | At UFC 26, Jens Pulver vs. Joao Roque became the UFC's first fight contested at what weight? | 155 pounds | Direct source in seed |
| ufc-r3-first-145-event | round3 | Retire | The UFC's first 145-pound fight took place on which event? | The Ultimate Fighter 12 Finale | Direct source in seed |
| ufc-r3-first-135-event | round3 | Retire | The UFC's first 135-pound fight took place on which event? | The Ultimate Fighter 12 Finale | Direct source in seed |
| ufc-r3-first-125-event | round3 | Retire | At UFC on FX 2, Ian McCall and Demetrious Johnson met in the UFC's first bout in which division? | Flyweight | Direct source in seed |
| ufc-r3-last-no-time-limit | round3 | Rework | Which famous fight is listed as UFC's last bout without a time limit? | Royce Gracie vs. Dan Severn | Direct source in seed |
| ufc-r3-gracie-severn-time | round3 | Retire | Royce Gracie's UFC 4 final submission of Dan Severn came after roughly how long? | 15 minutes 49 seconds | Direct source in seed |
| ufc-r3-gracie-shamrock-36 | round3 | Rework | Royce Gracie and Ken Shamrock's UFC 5 Superfight lasted approximately how long? | 36 minutes | Direct source in seed |
| ufc-r3-oleg-macias-opponent | round3 | Retire | Oleg Taktarov's nine-second submission at UFC 6 came against whom? | Anthony Macias | Direct source in seed |
| ufc-r3-fox-finish-time | round3 | Rework | Junior dos Santos needed how long to stop Cain Velasquez in UFC's FOX debut? | 64 seconds | Legacy missing URL; authority fallback |
| ufc-r3-the-natural | round3 | Rework | Which UFC Hall of Famer fought under the nickname \"The Natural\"? | Randy Couture | Direct source in seed |
| ufc-r3-ufc-japan-year | round3 | Retire | UFC's first event in Asia took place in which year? | 1997 | Direct source in seed |
| ufc-r3-ufc1-eight-man | round3 | Retire | How many fighters were in the original UFC 1 tournament? | 8 | Direct source in seed |
| ufc-final-jimmerson-glove-color | last-call | Retire | What color was the single boxing glove Art Jimmerson wore at UFC 1? | Red | Direct source in seed |
| ufc-final-maine-iac | last-call | Keep | Which former two-time heavyweight champion was nicknamed \"The Maine-iac\"? | Tim Sylvia | Direct source in seed |
| ufc-final-lewis-volkov-quote | last-call | Keep | Derrick Lewis delivered his famous \"my balls was hot\" interview after a last-second knockout of whom at UFC 229? | Alexander Volkov | Direct source in seed |
| ufc-final-muscle-shark | last-call | Keep | Which former UFC lightweight champion was known as \"The Muscle Shark\"? | Sean Sherk | Direct source in seed |
| ufc-final-barboza-etim | last-call | Keep | Edson Barboza's first-in-UFC spinning wheel-kick knockout came against which opponent at UFC 142? | Terry Etim | Direct source in seed |
| ufc-r1-do-bronx | round1 | Keep | Which former UFC lightweight champion is known as 'Do Bronx'? | Charles Oliveira | Legacy missing URL; authority fallback |
| ufc-r1-the-reaper | round1 | Keep | Which former UFC middleweight champion is known as 'The Reaper'? | Robert Whittaker | Legacy missing URL; authority fallback |
| ufc-r1-magnum | round1 | Keep | Which UFC champion is known as 'Magnum'? | Zhang Weili | Legacy missing URL; authority fallback |
| ufc-r2-stockton-slap | round2 | Rework | The taunting strike known as the 'Stockton Slap' is most closely associated with which fighting family? | The Diaz brothers | Legacy missing URL; authority fallback |
| ufc-r2-where-you-at-georges | round2 | Keep | After beating BJ Penn at UFC 137, who famously called out Georges St-Pierre with 'Where you at, Georges?' | Nick Diaz | Direct source in seed |
| ufc-easy-stylebender | round1 | Prior retirement | Which former UFC middleweight champion is known as 'The Last Stylebender'? | Israel Adesanya | Legacy missing URL; authority fallback |
| ufc-easy-bullet | round1 | Keep | Which longtime UFC champion is known by the nickname 'Bullet'? | Valentina Shevchenko | Legacy missing URL; authority fallback |
| ufc-easy-diamond | round1 | Keep | Which UFC lightweight star is known as 'The Diamond'? | Dustin Poirier | Legacy missing URL; authority fallback |
| ufc-easy-highlight | round1 | Keep | Which former UFC interim lightweight champion is known as 'The Highlight'? | Justin Gaethje | Legacy missing URL; authority fallback |
| ufc-easy-sugar | round1 | Keep | Which UFC bantamweight star is known as 'Sugar'? | Sean O'Malley | Legacy missing URL; authority fallback |
| ufc-easy-rowdy-ronda | round1 | Keep | Which former UFC champion fought under the nickname 'Rowdy'? | Ronda Rousey | Legacy missing URL; authority fallback |
| ufc-easy-mighty-mouse | round1 | Keep | Which former UFC flyweight champion is famously known as 'Mighty Mouse'? | Demetrious Johnson | Legacy missing URL; authority fallback |
| ufc-easy-fastest-ko-opponent | round1 | Keep | Jorge Masvidal's record-setting five-second UFC knockout came against whom? | Ben Askren | Legacy missing URL; authority fallback |
| ufc-easy-holm-rousey | round1 | Keep | Who shocked Ronda Rousey with a head-kick knockout to win the bantamweight title? | Holly Holm | Legacy missing URL; authority fallback |
| ufc-easy-khabib-mcgregor | round1 | Keep | Who submitted Conor McGregor in the main event of UFC 229? | Khabib Nurmagomedov | Legacy missing URL; authority fallback |
| ufc-easy-leon-usman | round1 | Keep | Leon Edwards won the welterweight title with a famous head-kick knockout of which champion? | Kamaru Usman | Legacy missing URL; authority fallback |
| ufc-easy-home-base | round1 | Keep | Which U.S. city is most closely associated with the UFC's longtime home base? | Las Vegas | Legacy missing URL; authority fallback |
| ufc-easy2-lioness | round1 | Keep | Which former two-division UFC champion is known as 'The Lioness'? | Amanda Nunes | Legacy missing URL; authority fallback |
| ufc-easy2-iceman | round1 | Keep | Which UFC Hall of Famer is famously known as 'The Iceman'? | Chuck Liddell | Legacy missing URL; authority fallback |
| ufc-easy2-huntington-bad-boy | round1 | Keep | Which former UFC champion was known as 'The Huntington Beach Bad Boy'? | Tito Ortiz | Legacy missing URL; authority fallback |
| ufc-easy2-gamebred | round1 | Keep | Which UFC star is known by the nickname 'Gamebred'? | Jorge Masvidal | Legacy missing URL; authority fallback |
| ufc-easy2-wonderboy | round1 | Keep | Which longtime UFC welterweight contender is known as 'Wonderboy'? | Stephen Thompson | Legacy missing URL; authority fallback |
| ufc-easy2-dc | round1 | Keep | Which former UFC two-division champion is commonly known simply as 'DC'? | Daniel Cormier | Legacy missing URL; authority fallback |
| ufc-easy2-the-count | round1 | Keep | Which former UFC middleweight champion fought under the nickname 'The Count'? | Michael Bisping | Legacy missing URL; authority fallback |
| ufc-easy2-predator | round1 | Keep | Which former UFC heavyweight champion is known as 'The Predator'? | Francis Ngannou | Legacy missing URL; authority fallback |
| ufc-easy2-axe-murderer | round1 | Keep | Which legendary Brazilian fighter is known as 'The Axe Murderer'? | Wanderlei Silva | Legacy missing URL; authority fallback |
| ufc-easy2-california-kid | round1 | Keep | Which UFC Hall of Famer is known as 'The California Kid'? | Urijah Faber | Legacy missing URL; authority fallback |
| ufc-easy2-rampage | round1 | Keep | Quinton Jackson is better known to fight fans by which nickname? | Rampage | Legacy missing URL; authority fallback |
| ufc-easy2-shogun | round1 | Keep | Mauricio Rua is better known to MMA fans by which nickname? | Shogun | Legacy missing URL; authority fallback |
| ufc-easy2-cro-cop | round1 | Keep | Mirko Filipovic is best known in MMA by which nickname? | Cro Cop | Legacy missing URL; authority fallback |
| ufc-easy2-cookie-monster | round1 | Keep | Which former UFC strawweight champion is known as 'Cookie Monster'? | Carla Esparza | Legacy missing URL; authority fallback |
| ufc-easy2-polish-power | round1 | Keep | Which former UFC light heavyweight champion is associated with 'Polish Power'? | Jan Blachowicz | Legacy missing URL; authority fallback |
| ufc-easy2-el-matador | round1 | Keep | Which UFC star is known by the nickname 'El Matador'? | Ilia Topuria | Legacy missing URL; authority fallback |
| ufc-easy2-title-rounds | round1 | Rework | A standard UFC championship fight is scheduled for how many rounds? | 5 | Legacy missing URL; authority fallback |
| ufc-easy2-round-length | round1 | Rework | How long is a standard round in a UFC fight? | 5 minutes | Legacy missing URL; authority fallback |
| ufc-easy2-lightweight-limit | round1 | Keep | Which weight is the standard UFC lightweight division limit for title fights? | 155 pounds | Legacy missing URL; authority fallback |
| ufc-easy2-welterweight-limit | round1 | Keep | Which weight is the UFC welterweight division limit for title fights? | 170 pounds | Legacy missing URL; authority fallback |
| ufc-easy2-middleweight-limit | round1 | Keep | Which weight is the UFC middleweight division limit for title fights? | 185 pounds | Legacy missing URL; authority fallback |
| ufc-easy2-lhw-limit | round1 | Keep | Which weight is the UFC light heavyweight division limit? | 205 pounds | Legacy missing URL; authority fallback |
| ufc-easy2-heavyweight-limit | round1 | Keep | What is the upper weight limit for the UFC heavyweight division? | 265 pounds | Legacy missing URL; authority fallback |
| ufc-easy2-tap | round1 | Rework | In MMA, what does a fighter usually signal by tapping an opponent or the mat? | Submission | Legacy missing URL; authority fallback |
| ufc-easy2-corners | round1 | Retire | UFC fighters are traditionally assigned to which two colored corners? | Red and blue | Legacy missing URL; authority fallback |
| ufc-easy2-gloves | round1 | Rework | What style of gloves do UFC fighters wear so they can still grapple? | Fingerless gloves | Legacy missing URL; authority fallback |
| ufc-easy2-first-womens-champ | round1 | Prior retirement | Who was introduced as the UFC's first women's champion? | Ronda Rousey | Legacy missing URL; authority fallback |
| ufc-easy2-youngest-champ | round1 | Keep | Who became the youngest champion in UFC history? | Jon Jones | Legacy missing URL; authority fallback |
| ufc-easy2-aldo-13 | round1 | Prior retirement | Who knocked out Jose Aldo in 13 seconds to win the featherweight title at UFC 194? | Conor McGregor | Legacy missing URL; authority fallback |
| ufc-easy2-weidman-silva | round1 | Prior retirement | Who ended Anderson Silva's long UFC middleweight title reign in 2013? | Chris Weidman | Legacy missing URL; authority fallback |
| ufc-easy2-diaz-mcgregor | round1 | Prior retirement | Who submitted Conor McGregor in their first UFC fight in 2016? | Nate Diaz | Legacy missing URL; authority fallback |
| ufc-easy2-nunes-rousey | round1 | Keep | Who stopped Ronda Rousey in just 48 seconds at UFC 207? | Amanda Nunes | Legacy missing URL; authority fallback |
| ufc-easy2-gsp-canada | round1 | Prior retirement | Georges St-Pierre became a UFC icon representing which country? | Canada | Legacy missing URL; authority fallback |
| ufc-easy2-silva-division | round1 | Keep | Anderson Silva's legendary UFC championship reign came in which division? | Middleweight | Legacy missing URL; authority fallback |
| ufc-easy2-khabib-record | round1 | Prior retirement | Khabib Nurmagomedov retired from professional MMA with which unbeaten record? | 29-0 | Legacy missing URL; authority fallback |
| ufc-easy2-tuf-name | round1 | Keep | What UFC reality competition is commonly abbreviated as 'TUF'? | The Ultimate Fighter | Legacy missing URL; authority fallback |
| ufc-current-2026-10-03-silva-wang-title | round1 | Keep | Who won the vacant UFC women's flyweight title by defeating Wang Cong at UFC 332? | Natalia Silva | Direct source in seed |
| ufc-current-2026-09-26-rosas-barcelos | round1 | Rework | Whose first UFC main event ended with a fifth-round slam TKO of Raoni Barcelos? | Raul Rosas Jr. | Direct source in seed |
| ufc-current-2026-09-26-akylbek-tuf-dq | round2 | Prior retirement | Which fighter became the first competitor from Kyrgyzstan to win The Ultimate Fighter after an illegal-knee disqualification? | Ilimbek Akylbek | Direct source in seed |
| ufc-current-2026-09-26-tina-black-tuf | round1 | Prior retirement | Who became the first Brazilian woman to win The Ultimate Fighter with a second-round stoppage of Melissa Amaya? | Tina Black | Direct source in seed |
| ufc-current-2026-09-19-joshua-van-pantoja | round1 | Keep | Which flyweight champion silenced doubts by beating Alexandre Pantoja in their UFC 331 rematch? | Joshua Van | Direct source in seed |
| ufc-current-2026-09-19-sharaf-steveson | round1 | Rework | Who knocked out Olympic gold medalist Gable Steveson in just 12 seconds at UFC 331? | Sean Sharaf | Direct source in seed |
| ufc-current-2026-09-19-chito-jourdain | round2 | Rework | Which former title challenger snapped a four-fight skid by stopping Charles Jourdain at UFC 331? | Marlon Vera | Direct source in seed |
| ufc-current-2026-09-19-pitbull-choi | round2 | Rework | Which former Bellator champion knocked out Dooho Choi on the UFC 331 main card? | Patricio Pitbull | Direct source in seed |
| ufc-current-2026-09-19-casey-oneill-armbar | round2 | Retire | Which flyweight earned a UFC 331 performance bonus by reversing trouble into a first-round armbar of Eduarda Moura? | Casey O'Neill | Direct source in seed |
| ufc-current-2026-09-05-parnasse-hooker | round1 | Keep | Which French star made his UFC debut by stopping Dan Hooker in the first round of the Paris main event? | Salahdine Parnasse | Direct source in seed |
| ufc-current-2026-08-29-song-umar | round1 | Keep | Which Chinese bantamweight knocked out Umar Nurmagomedov in the UFC Shanghai main event? | Song Yadong | Direct source in seed |
| ufc-current-2026-10-17-malott-buckley | round1 | Keep | Which Canadian welterweight stopped Joaquin Buckley with a knee at UFC Edmonton in October 2026? | Mike Malott | Direct source in seed |
| ufc-current-2026-10-17-jasudavicius-blanchfield | round2 | Keep | Who defeated Erin Blanchfield by unanimous decision in the UFC Edmonton co-main event? | Jasmine Jasudavicius | Direct source in seed |
| ufc-current-2026-10-10-allen-duncan | round2 | Keep | Who submitted Christian Leroy Duncan in Round 5 of the October 2026 UFC Fight Night main event? | Brendan Allen | Direct source in seed |

## New UFC editorial additions (110)

| ID | Round | Question | Correct answer | Official source URL |
| --- | --- | --- | --- | --- |
| ufc-bt-v3-e-001 | round1 | What combat sport did Henry Cejudo win an Olympic gold medal in? | Wrestling | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-002 | round1 | Which former WWE champion also won the UFC heavyweight championship? | Brock Lesnar | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-003 | round1 | Which fighter is especially famous for his karate-based stance and counterstriking? | Lyoto Machida | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-004 | round1 | Which UFC fighter landed the famous off-the-cage 'Showtime Kick'? | Anthony Pettis | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-005 | round1 | Which former champion first rose to fame as a professional kickboxer in GLORY? | Alex Pereira | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-006 | round1 | Which former UFC heavyweight champion is originally from Cameroon? | Francis Ngannou | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-007 | round1 | Which Russian region is closely associated with Khabib Nurmagomedov? | Dagestan | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-008 | round1 | What does the 'TKO' abbreviation stand for in UFC results? | Technical knockout | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-009 | round1 | Which of these can end a UFC fight without a knockout or decision? | Submission | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-010 | round1 | In standard MMA scoring, what is the usual score awarded to the winner of a round? | 10 points | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-011 | round1 | What does 'southpaw' describe in combat sports? | A left-handed fighting stance | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-012 | round1 | Which UFC broadcast figure used to host Fear Factor? | Joe Rogan | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-013 | round1 | Which of these is a common Brazilian jiu-jitsu submission used in UFC fights? | Triangle choke | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-014 | round1 | What happens when a fighter 'taps out'? | They concede the submission | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-015 | round1 | Which UFC heavyweight famously coined the postfight line 'My balls was hot'? | Derrick Lewis | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-016 | round1 | Which American city are the Diaz brothers strongly associated with? | Stockton | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-017 | round1 | Which future UFC heavyweight champion was a two-time NCAA All-American wrestler at Arizona State? | Cain Velasquez | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-018 | round1 | Which UFC pioneer is known as the 'Godfather of Ground and Pound'? | Mark Coleman | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-019 | round1 | In the UFC, what is an interim champion? | A temporary titleholder while the undisputed title is unavailable | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-020 | round1 | Which type of strike is generally illegal to the back of an opponent's head? | Punches to the back of the head | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-021 | round1 | Which MMA position puts a fighter on top of an opponent's torso facing them? | Mount | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-022 | round1 | What is 'ground and pound' in MMA? | Striking an opponent while grappling on the mat | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-023 | round1 | Which discipline is especially associated with the Gracie family's early UFC success? | Brazilian jiu-jitsu | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-024 | round1 | Which UFC welterweight contender is particularly famous for his karate background and side-on stance? | Stephen Thompson | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-025 | round1 | Which fighter crossed over from professional wrestling and lost his UFC debut to Mickey Gall? | CM Punk | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-026 | round1 | Which UFC star once fought Floyd Mayweather Jr. in a professional boxing match? | Conor McGregor | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-027 | round1 | What does 'no contest' usually mean in a UFC result? | The fight has no official winner | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-028 | round1 | Which gym was famously linked with fighters such as Jon Jones and Holly Holm? | Jackson-Wink MMA | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-029 | round1 | Which gym is strongly associated with Khabib Nurmagomedov and Daniel Cormier? | American Kickboxing Academy | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-030 | round1 | Which Canadian gym is famously associated with Georges St-Pierre? | Tristar Gym | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-031 | round1 | Which New Zealand gym helped develop Israel Adesanya and Alexander Volkanovski? | City Kickboxing | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-032 | round1 | What does a fighter commonly do during a UFC 'weigh-in'? | Step on a scale to make their division's weight | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-033 | round1 | Which of these is an example of an illegal UFC foul? | Eye gouging | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-034 | round1 | What is a 'clinch' in an MMA fight? | Close-range grappling while standing | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-035 | round1 | Which fighter is recognized as a former PRIDE heavyweight champion who later won a UFC interim heavyweight title? | Antonio Rodrigo Nogueira | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-036 | round1 | Which Brazilian fighter famously used capoeira-inspired techniques in the Octagon? | Michel Pereira | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-037 | round1 | What do referees usually signal when they wave off a UFC fight after a knockout? | The fight is over | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-038 | round1 | Which MMA technique is a 'sprawl' primarily used to defend? | A takedown attempt | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-039 | round1 | Which UFC organization holds fighter interviews and broadcasts many events at its Las Vegas Apex venue? | The UFC | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-001 | round2 | Which fighter knocked out Chuck Liddell to take the light heavyweight championship at UFC 71? | Quinton Jackson | https://www.ufc.com/event/ufc-71 |
| ufc-bt-v3-m-002 | round2 | Who did Jon Jones beat to win his first UFC light heavyweight championship in 2011? | Mauricio Rua | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-003 | round2 | Who stopped Brock Lesnar to take the heavyweight title at UFC 121? | Cain Velasquez | https://www.ufc.com/event/ufc-121 |
| ufc-bt-v3-m-004 | round2 | Who submitted Michael Bisping to capture the middleweight championship at UFC 217? | Georges St-Pierre | https://www.ufc.com/event/ufc-217 |
| ufc-bt-v3-m-005 | round2 | Which UFC champion famously defended his title against Chael Sonnen after being badly hurt early in the fight? | Anderson Silva | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-006 | round2 | Which longtime UFC champion made his debut against Marcus Brimage in Sweden? | Conor McGregor | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-007 | round2 | Which former lightweight champion also appeared in the WEC as the 'Smooth' champion? | Benson Henderson | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-008 | round2 | Which former UFC women's champion had a notable rivalry with Miesha Tate before signing with the UFC? | Ronda Rousey | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-009 | round2 | Who beat Lyoto Machida in their UFC 113 rematch to become light heavyweight champion? | Mauricio Rua | https://www.ufc.com/event/ufc-113 |
| ufc-bt-v3-m-010 | round2 | Which fighter ended Chuck Liddell's UFC career by knocking him out at UFC 115? | Rich Franklin | https://www.ufc.com/event/ufc-115 |
| ufc-bt-v3-m-011 | round2 | Which lightweight star was once famous for performing a cage-side backflip after a win? | Justin Gaethje | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-012 | round2 | Which fighter became UFC welterweight champion by outpointing Johny Hendricks at UFC 181? | Robbie Lawler | https://www.ufc.com/event/ufc-181 |
| ufc-bt-v3-m-013 | round2 | Which heavyweight beat Fedor Emelianenko in Strikeforce and later held UFC heavyweight gold? | Fabricio Werdum | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-m-014 | round2 | Which fighter was nicknamed 'The All-American' and became UFC middleweight champion? | Chris Weidman | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-043 | round1 | What does MMA stand for? | Mixed martial arts | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-044 | round1 | What does BJJ stand for in MMA training? | Brazilian jiu-jitsu | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-045 | round1 | What is a UFC cutman's primary job during a bout? | Treat cuts and reduce swelling | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-e-046 | round1 | How many judges typically score a UFC fight if it goes the distance? | Three | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-047 | round1 | Which part of the body does a rear-naked choke principally attack? | The neck | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-048 | round1 | Which former UFC welterweight champion is known as 'The Nigerian Nightmare'? | Kamaru Usman | https://www.ufc.com/athlete/kamaru-usman |
| ufc-bt-v3-e-049 | round1 | Which UFC superstar acted alongside Jake Gyllenhaal in the 2024 film Road House? | Conor McGregor | https://www.ufc.com/news/history-ufc-fighters-movies-and-television-conor-mcgregor-road-house |
| ufc-bt-v3-e-050 | round1 | Who said 'headshot, dead' after a famous UFC title-winning knockout? | Leon Edwards | https://www.ufc.com/news/best-moments-salt-lake-city |
| ufc-bt-v3-e-051 | round1 | Which former UFC two-division champion is a familiar color commentator on UFC broadcasts? | Daniel Cormier | https://www.ufc.com/athlete/daniel-cormier |
| ufc-bt-v3-e-052 | round1 | What piece of protective equipment do UFC fighters wear inside their mouths? | A mouthguard | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-053 | round1 | What does it mean when a UFC fighter wins a unanimous decision? | All three judges scored the fight for that fighter | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-e-054 | round1 | What is an orthodox fighting stance? | Left side forward, right power hand | https://www.ufc.com/unified-rules-mixed-martial-arts |
| ufc-bt-v3-h-001 | round3 | Which former UFC heavyweight champion submitted boxer James Toney in the boxer's only UFC fight? | Randy Couture | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-002 | round3 | Which fighter won the highly anticipated Chuck Liddell–Wanderlei Silva bout at UFC 79? | Chuck Liddell | https://www.ufc.com/event/ufc-79 |
| ufc-bt-v3-h-003 | round3 | Who submitted Matt Hughes with a triangle choke in their first UFC meeting at UFC 46? | BJ Penn | https://www.ufc.com/event/ufc-46 |
| ufc-bt-v3-h-004 | round3 | Which fighter shocked Robbie Lawler with a knockout at UFC 47 in 2004? | Nick Diaz | https://www.ufc.com/event/ufc-47 |
| ufc-bt-v3-h-005 | round3 | What submission did Demetrious Johnson famously secure against Ray Borg after lifting him into the air? | Armbar | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-006 | round3 | Which heavyweight avenged a prior title loss by stopping Stipe Miocic in their 2021 rematch? | Francis Ngannou | https://www.ufc.com/honors/fans-choice |
| ufc-bt-v3-h-007 | round3 | How did Jon Jones win the vacant heavyweight title against Ciryl Gane at UFC 285? | Guillotine choke | https://www.ufc.com/event/ufc-285 |
| ufc-bt-v3-h-008 | round3 | Who did Tom Aspinall defeat to win the interim UFC heavyweight championship at UFC 295? | Sergei Pavlovich | https://www.ufc.com/event/ufc-295 |
| ufc-bt-v3-h-009 | round3 | Which former light heavyweight champion did Alex Pereira beat to capture the vacant 205-pound belt at UFC 295? | Jiri Prochazka | https://www.ufc.com/event/ufc-295 |
| ufc-bt-v3-h-010 | round3 | Who became the first fighter to knock out Max Holloway in his professional MMA career at UFC 308? | Ilia Topuria | https://www.ufc.com/event/ufc-308 |
| ufc-bt-v3-h-011 | round3 | Which featherweight champion lost his title to a head-kick knockout in a 2023 rematch with Islam Makhachev? | Alexander Volkanovski | https://www.ufc.com/honors/fans-choice |
| ufc-bt-v3-h-012 | round3 | Which longtime lightweight contender was submitted by Islam Makhachev in the fifth round at UFC 302? | Dustin Poirier | https://www.ufc.com/event/ufc-302 |
| ufc-bt-v3-h-013 | round3 | Who upset Leon Edwards by decision to capture the welterweight championship at UFC 304? | Belal Muhammad | https://www.ufc.com/event/ufc-304 |
| ufc-bt-v3-h-014 | round3 | Which former welterweight contender was knocked out by Kamaru Usman's right hand at UFC 261? | Jorge Masvidal | https://www.ufc.com/event/ufc-261 |
| ufc-bt-v3-h-015 | round3 | Who knocked out Cris Cyborg in a stunning first-round UFC 232 title fight? | Amanda Nunes | https://www.ufc.com/event/ufc-232 |
| ufc-bt-v3-h-016 | round3 | Which lightweight contender won the UFC 249 interim title by stopping Tony Ferguson? | Justin Gaethje | https://www.ufc.com/event/ufc-249 |
| ufc-bt-v3-h-017 | round3 | Which former strawweight champion knocked out Zhang Weili with a head kick at UFC 261? | Rose Namajunas | https://www.ufc.com/event/ufc-261 |
| ufc-bt-v3-h-018 | round3 | Who submitted Glover Teixeira late in Round 5 to win the light heavyweight title at UFC 275? | Jiri Prochazka | https://www.ufc.com/event/ufc-275 |
| ufc-bt-v3-h-019 | round3 | Who stopped Aljamain Sterling to win the bantamweight championship at UFC 292? | Sean O'Malley | https://www.ufc.com/event/ufc-292 |
| ufc-bt-v3-h-020 | round3 | Which lightweight star knocked out Tony Ferguson with a front kick at UFC 274? | Michael Chandler | https://www.ufc.com/event/ufc-274 |
| ufc-bt-v3-h-021 | round3 | Which Brazilian fighter knocked out Rose Namajunas with a slam to win the strawweight title at UFC 237? | Jessica Andrade | https://www.ufc.com/event/ufc-237 |
| ufc-bt-v3-h-022 | round3 | Who delivered the famous head-kick knockout of Jessica Eye at UFC 238? | Valentina Shevchenko | https://www.ufc.com/event/ufc-238 |
| ufc-bt-v3-h-023 | round3 | Which fighter won the Zhang Weili–Joanna Jedrzejczyk rematch at UFC 275 with a spinning backfist? | Zhang Weili | https://www.ufc.com/event/ufc-275 |
| ufc-bt-v3-h-024 | round3 | Which UFC heavyweight submitted Cain Velasquez in Mexico City to capture the undisputed title at UFC 188? | Fabricio Werdum | https://www.ufc.com/event/ufc-188 |
| ufc-bt-v3-h-025 | round3 | Which striker knocked out Luke Rockhold with a spinning heel kick at UFC on FX 8? | Vitor Belfort | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-026 | round3 | Which fighter broke his leg throwing a kick during his rematch with Chris Weidman at UFC 168? | Anderson Silva | https://www.ufc.com/event/ufc-168 |
| ufc-bt-v3-h-027 | round3 | Which UFC star knocked out Sean Salmon with a famous head kick in 2007? | Rashad Evans | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-028 | round3 | Which fighter submitted Matt Sayles with the UFC's second twister submission in 2019? | Bryce Mitchell | https://www.ufc.com/honors/fans-choice |
| ufc-bt-v3-h-029 | round3 | Which veteran submitted Viktor Pesta with an unusual Ezekiel choke at UFC Fight Night 103? | Aleksei Oleinik | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-030 | round3 | Which contender became the first person to stop Frankie Edgar with strikes at UFC 222? | Brian Ortega | https://www.ufc.com/event/ufc-222 |
| ufc-bt-v3-h-031 | round3 | Which former featherweight contender knocked out Chad Mendes in the first round in December 2015? | Frankie Edgar | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-032 | round3 | Who defeated Justin Gaethje by knockout in their action-packed 2018 lightweight main event? | Dustin Poirier | https://www.ufc.com/honors/fans-choice |
| ufc-bt-v3-h-033 | round3 | Which fighter became the first to knock out Conor McGregor in the UFC at UFC 257? | Dustin Poirier | https://www.ufc.com/event/ufc-257 |
| ufc-bt-v3-h-034 | round3 | During his famous 2021 performance against Calvin Kattar, which fighter shouted that he was the UFC's best boxer? | Max Holloway | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-h-035 | round3 | Who won the main event of UFC 279 by submitting Tony Ferguson? | Nate Diaz | https://www.ufc.com/event/ufc-279 |
| ufc-bt-v3-f-001 | last-call | Which fighter lost his UFC debut to Joe Lauzon in a famous upset at UFC 63? | Jens Pulver | https://www.ufc.com/event/ufc-63 |
| ufc-bt-v3-f-002 | last-call | Which fighter knocked out Matt Serra with a spinning backfist at UFC 31? | Shonie Carter | https://www.ufc.com/event/ufc-31 |
| ufc-bt-v3-f-003 | last-call | Which heavyweight was knocked out by Junior dos Santos in JDS's UFC debut at UFC 90? | Fabricio Werdum | https://www.ufc.com/event/ufc-90 |
| ufc-bt-v3-f-004 | last-call | Which former PRIDE champion did Quinton Jackson defeat to unify light heavyweight gold at UFC 75? | Dan Henderson | https://www.ufc.com/event/ufc-75 |
| ufc-bt-v3-f-005 | last-call | Who was the opponent in Shogun Rua's UFC debut loss at UFC 76? | Forrest Griffin | https://www.ufc.com/event/ufc-76 |
| ufc-bt-v3-f-006 | last-call | Which fighter delivered the spinning-backfist knockout of Kyle Watson at UFC 129? | John Makdessi | https://www.ufc.com/event/ufc-129 |
| ufc-bt-v3-f-007 | last-call | Which fighter stopped Matt Brown with a head kick after the two embraced before the final round at UFC 206? | Donald Cerrone | https://www.ufc.com/event/ufc-206 |
| ufc-bt-v3-f-008 | last-call | Which opponent did Demian Maia finish with a particularly tight choke that caused a nosebleed at UFC 153? | Rick Story | https://www.ufc.com/event/ufc-153 |
| ufc-bt-v3-f-013 | last-call | Who won the famous five-round war between Chan Sung Jung and Dustin Poirier in 2012? | Chan Sung Jung | https://www.ufc.com/news/top-500-ufc-moments-list |
| ufc-bt-v3-f-014 | last-call | Which two veterans fought in the main event of the UFC's first show in Germany, UFC 99? | Rich Franklin and Wanderlei Silva | https://www.ufc.com/event/ufc-99 |

## Acceptance

Before promoting this PR from draft: run exact-head typecheck and affected tests, demonstrate 20 full appearances without repeated IDs, audit semantic collisions against UFC Millionaire/other games, check distractors for accidental giveaways, and independently validate answer/explanation against the stated source. No migration, no production publication and no merge are authorized by this PR alone.
