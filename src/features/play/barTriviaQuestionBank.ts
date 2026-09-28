import { barTriviaQuestion, type BarTriviaQuestion, type BarTriviaQuestionSeed } from "../games/barTriviaEngine";
import { BAR_TRIVIA_CURRENT_EVENT_QUESTIONS } from "./barTriviaCurrentEvents";
import { BAR_TRIVIA_NFL_EVERGREEN_EXPANSION } from "./barTriviaEvergreenNfl";
import { BAR_TRIVIA_NFL_EVERGREEN_WAVE_2 } from "./barTriviaEvergreenNflWave2";
import { BAR_TRIVIA_NFL_EVERGREEN_WAVE_3 } from "./barTriviaEvergreenNflWave3";
import { BAR_TRIVIA_CFB_EVERGREEN_EXPANSION } from "./barTriviaEvergreenCfb";
import { BAR_TRIVIA_CFB_EVERGREEN_WAVE_2 } from "./barTriviaEvergreenCfbWave2";
import { BAR_TRIVIA_CFB_EVERGREEN_WAVE_3 } from "./barTriviaEvergreenCfbWave3";
import { BAR_TRIVIA_UFC_EVERGREEN_EXPANSION } from "./barTriviaEvergreenUfc";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_2 } from "./barTriviaEvergreenUfcWave2";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_3 } from "./barTriviaEvergreenUfcWave3";
import { BAR_TRIVIA_NFL_EVERGREEN_WAVE_4 } from "./barTriviaEvergreenNflWave4";
import { BAR_TRIVIA_CFB_EVERGREEN_WAVE_4 } from "./barTriviaEvergreenCfbWave4";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_4 } from "./barTriviaEvergreenUfcWave4";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_5 } from "./barTriviaEvergreenUfcWave5";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_6 } from "./barTriviaEvergreenUfcWave6";
import { BAR_TRIVIA_UFC_EVERGREEN_WAVE_7 } from "./barTriviaEvergreenUfcWave7";

function q(question: BarTriviaQuestionSeed) {
  return barTriviaQuestion(question);
}

export const BAR_TRIVIA_QUESTION_BANK: readonly BarTriviaQuestion[] = [
  // NFL · Round 1 — Around the League
  q({ id:"nfl-r1-ravens-name", league:"nfl", round:"round1", category:"Team Identity", prompt:"The Baltimore Ravens got their name from a work by which writer?", choices:["Edgar Allan Poe","F. Scott Fitzgerald","Mark Twain","Ernest Hemingway"], answer:"Edgar Allan Poe", explanation:"Baltimore chose Ravens as a nod to Edgar Allan Poe's poem “The Raven.”", sourceId:"nfl-history" }),
  q({ id:"nfl-r1-steelers-helmet", league:"nfl", round:"round1", category:"Uniforms", prompt:"Which NFL team famously wears its primary helmet logo on only one side?", choices:["Pittsburgh Steelers","Las Vegas Raiders","Chicago Bears","Green Bay Packers"], answer:"Pittsburgh Steelers", explanation:"The Steelers' Steelmark logo appears only on the right side of the helmet.", sourceId:"nfl-history" }),
  q({ id:"nfl-r1-lombardi", league:"nfl", round:"round1", category:"Super Bowl", prompt:"The Super Bowl trophy is named for which legendary coach?", choices:["Vince Lombardi","Paul Brown","George Halas","Don Shula"], answer:"Vince Lombardi", explanation:"The NFL renamed its championship trophy the Vince Lombardi Trophy in 1970.", sourceId:"nfl-history" }),
  q({ id:"nfl-r1-thanksgiving", league:"nfl", round:"round1", category:"Traditions", prompt:"Along with Detroit, which team became a long-running Thanksgiving Day host?", choices:["Dallas Cowboys","Green Bay Packers","New York Giants","Kansas City Chiefs"], answer:"Dallas Cowboys", explanation:"Dallas joined Detroit as a regular Thanksgiving host beginning in 1966.", sourceId:"nfl-history" }),
  q({ id:"nfl-r1-frozen-tundra", league:"nfl", round:"round1", category:"Stadiums", prompt:"The nickname “Frozen Tundra” is associated with which NFL stadium?", choices:["Lambeau Field","Soldier Field","Arrowhead Stadium","Highmark Stadium"], answer:"Lambeau Field", explanation:"Lambeau Field became famously linked with the “frozen tundra” phrase after the Ice Bowl era.", sourceId:"nfl-history" }),

  // NFL · Round 2 — Deep Cuts
  q({ id:"nfl-r2-staleys", league:"nfl", round:"round2", category:"Origins", prompt:"Before becoming the Chicago Bears, the franchise was known as the...", choices:["Decatur Staleys","Chicago Cardinals","Rock Island Independents","Canton Bulldogs"], answer:"Decatur Staleys", explanation:"The franchise began as the Decatur Staleys before moving to Chicago and later becoming the Bears.", sourceId:"nfl-history" }),
  q({ id:"nfl-r2-terrible-towel", league:"nfl", round:"round2", category:"Fan Culture", prompt:"The “Terrible Towel” belongs to fans of which franchise?", choices:["Pittsburgh Steelers","Cleveland Browns","Philadelphia Eagles","Buffalo Bills"], answer:"Pittsburgh Steelers", explanation:"Broadcaster Myron Cope introduced the Terrible Towel for Steelers fans in 1975.", sourceId:"nfl-history" }),
  q({ id:"nfl-r2-philly-special", league:"nfl", round:"round2", category:"Iconic Plays", prompt:"The “Philly Special” became famous during which Super Bowl?", choices:["Super Bowl LII","Super Bowl XLIX","Super Bowl LIV","Super Bowl XLVII"], answer:"Super Bowl LII", explanation:"Philadelphia used the trick play against New England in its 41–33 Super Bowl LII win.", sourceId:"nfl-history" }),
  q({ id:"nfl-r2-rams-city", league:"nfl", round:"round2", category:"Franchise Moves", prompt:"Immediately before returning to Los Angeles in 2016, the Rams played in which city?", choices:["St. Louis","San Diego","Oakland","Memphis"], answer:"St. Louis", explanation:"The Rams played in St. Louis from 1995 through the 2015 season.", sourceId:"nfl-history" }),
  q({ id:"nfl-r2-just-win", league:"nfl", round:"round2", category:"Quotes", prompt:"“Just win, baby” is most closely associated with which NFL figure?", choices:["Al Davis","Bill Belichick","Jerry Jones","John Madden"], answer:"Al Davis", explanation:"The phrase became one of longtime Raiders owner Al Davis's signature lines.", sourceId:"nfl-history" }),

  // NFL · Round 3 — Fourth Quarter
  q({ id:"nfl-r3-first-ot-super-bowl", league:"nfl", round:"round3", category:"Super Bowl History", prompt:"Which Super Bowl became the first in history to go to overtime?", choices:["Super Bowl LI","Super Bowl XLIX","Super Bowl XLII","Super Bowl LVIII"], answer:"Super Bowl LI", explanation:"Patriots–Falcons in Super Bowl LI was the first Super Bowl to reach overtime.", sourceId:"nfl-history" }),
  q({ id:"nfl-r3-hester-kickoff", league:"nfl", round:"round3", category:"Super Bowl Moments", prompt:"Who returned the opening kickoff of Super Bowl XLI for a touchdown?", choices:["Devin Hester","Dante Hall","Josh Cribbs","Desmond Howard"], answer:"Devin Hester", explanation:"Chicago's Devin Hester took the opening kick 92 yards for a touchdown.", sourceId:"nfl-history" }),
  q({ id:"nfl-r3-eli-drafted", league:"nfl", round:"round3", category:"Draft Night", prompt:"Which franchise officially drafted Eli Manning before trading him to the Giants?", choices:["San Diego Chargers","Arizona Cardinals","Cleveland Browns","Washington"], answer:"San Diego Chargers", explanation:"San Diego took Manning No. 1 in 2004, then traded him to the Giants.", sourceId:"nfl-history" }),
  q({ id:"nfl-r3-four-super-bowls", league:"nfl", round:"round3", category:"Dynasties", prompt:"Which franchise reached — and lost — four straight Super Bowls?", choices:["Buffalo Bills","Minnesota Vikings","Denver Broncos","Cincinnati Bengals"], answer:"Buffalo Bills", explanation:"Buffalo appeared in four consecutive Super Bowls from the 1990 through 1993 seasons.", sourceId:"nfl-history" }),
  q({ id:"nfl-r3-music-city", league:"nfl", round:"round3", category:"Iconic Plays", prompt:"Who scored the touchdown on the “Music City Miracle”?", choices:["Kevin Dyson","Frank Wycheck","Eddie George","Derrick Mason"], answer:"Kevin Dyson", explanation:"Frank Wycheck's lateral reached Kevin Dyson, who ran it in for Tennessee's winning touchdown.", sourceId:"nfl-history" }),

  // NFL · Last Call
  q({ id:"nfl-final-losing-mvp", league:"nfl", round:"last-call", category:"Super Bowl Oddities", prompt:"Who is the only player to win Super Bowl MVP while playing for the losing team?", choices:["Chuck Howley","Larry Fitzgerald","Thurman Thomas","Steve McNair"], answer:"Chuck Howley", explanation:"Cowboys linebacker Chuck Howley won MVP of Super Bowl V despite Dallas losing to Baltimore.", sourceId:"nfl-history" }),
  q({ id:"nfl-final-kicker-mvp", league:"nfl", round:"last-call", category:"NFL Awards", prompt:"Which kicker won the NFL MVP award in the strike-shortened 1982 season?", choices:["Mark Moseley","Jan Stenerud","Morten Andersen","Adam Vinatieri"], answer:"Mark Moseley", explanation:"Washington kicker Mark Moseley remains the only pure placekicker to win AP NFL MVP.", sourceId:"nfl-history" }),
  q({ id:"nfl-final-spartans", league:"nfl", round:"last-call", category:"Franchise Origins", prompt:"Which current NFL franchise began as the Portsmouth Spartans?", choices:["Detroit Lions","Cleveland Browns","Indianapolis Colts","Tennessee Titans"], answer:"Detroit Lions", explanation:"The Portsmouth Spartans moved to Detroit in 1934 and became the Lions.", sourceId:"nfl-history" }),

  // CFB · Round 1 — Around the Country
  q({ id:"cfb-r1-big-house", league:"cfb", round:"round1", category:"Stadiums", prompt:"Which stadium is known simply as “The Big House”?", choices:["Michigan Stadium","Ohio Stadium","Neyland Stadium","Beaver Stadium"], answer:"Michigan Stadium", explanation:"Michigan Stadium in Ann Arbor is college football's famous “Big House.”", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r1-12th-man", league:"cfb", round:"round1", category:"Traditions", prompt:"The “12th Man” tradition is most closely associated with which school?", choices:["Texas A&M","Texas","Oklahoma","Nebraska"], answer:"Texas A&M", explanation:"Texas A&M's student body and football tradition have long embraced the 12th Man identity.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r1-howards-rock", league:"cfb", round:"round1", category:"Traditions", prompt:"Players rub “Howard's Rock” before home games at which school?", choices:["Clemson","Georgia","Auburn","Florida State"], answer:"Clemson", explanation:"Clemson players touch Howard's Rock before running down The Hill into Memorial Stadium.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r1-red-river", league:"cfb", round:"round1", category:"Rivalries", prompt:"The Red River Rivalry is traditionally played at which stadium?", choices:["Cotton Bowl","AT&T Stadium","DKR-Texas Memorial Stadium","Gaylord Family Oklahoma Memorial Stadium"], answer:"Cotton Bowl", explanation:"Texas and Oklahoma traditionally meet at the Cotton Bowl during the State Fair of Texas.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r1-swamp", league:"cfb", round:"round1", category:"Stadiums", prompt:"Which school's home field is nicknamed “The Swamp”?", choices:["Florida","LSU","Miami","Oregon"], answer:"Florida", explanation:"Ben Hill Griffin Stadium at Florida is famously known as The Swamp.", sourceId:"cfb-traditions" }),

  // CFB · Round 2 — Deep Cuts
  q({ id:"cfb-r2-champion-sign", league:"cfb", round:"round2", category:"Traditions", prompt:"The “Play Like a Champion Today” sign is associated with which program?", choices:["Notre Dame","USC","Alabama","Penn State"], answer:"Notre Dame", explanation:"Notre Dame players traditionally touch the sign on the way to the field.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r2-enter-sandman", league:"cfb", round:"round2", category:"Entrances", prompt:"Which team famously enters its stadium to “Enter Sandman”?", choices:["Virginia Tech","South Carolina","Wisconsin","Iowa"], answer:"Virginia Tech", explanation:"Virginia Tech's Lane Stadium entrance to Metallica's “Enter Sandman” is one of the sport's signature scenes.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r2-jump-around", league:"cfb", round:"round2", category:"Fan Culture", prompt:"“Jump Around” between the third and fourth quarters is a tradition at which school?", choices:["Wisconsin","Minnesota","Iowa","Michigan State"], answer:"Wisconsin", explanation:"Camp Randall erupts to House of Pain's “Jump Around” before the fourth quarter.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r2-call-hogs", league:"cfb", round:"round2", category:"Cheers", prompt:"Fans “Call the Hogs” at which school?", choices:["Arkansas","Nebraska","Iowa State","NC State"], answer:"Arkansas", explanation:"The “Woo Pig Sooie” Hog Call is a signature Arkansas tradition.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r2-sooner-schooner", league:"cfb", round:"round2", category:"Mascots", prompt:"The Sooner Schooner belongs to which program?", choices:["Oklahoma","Oklahoma State","Texas Tech","Kansas"], answer:"Oklahoma", explanation:"The horse-drawn Sooner Schooner is one of Oklahoma's best-known game-day symbols.", sourceId:"cfb-traditions" }),

  // CFB · Round 3 — Fourth Quarter
  q({ id:"cfb-r3-first-game", league:"cfb", round:"round3", category:"Origins", prompt:"Which school defeated Princeton in the game widely recognized as the first college football game in 1869?", choices:["Rutgers","Yale","Harvard","Columbia"], answer:"Rutgers", explanation:"Rutgers beat Princeton 6–4 in New Brunswick, New Jersey, on Nov. 6, 1869.", sourceId:"cfb-history" }),
  q({ id:"cfb-r3-little-brown-jug", league:"cfb", round:"round3", category:"Rivalry Trophies", prompt:"The Little Brown Jug is contested by Michigan and which school?", choices:["Minnesota","Michigan State","Wisconsin","Notre Dame"], answer:"Minnesota", explanation:"Michigan and Minnesota have played for the Little Brown Jug for more than a century.", sourceId:"cfb-history" }),
  q({ id:"cfb-r3-ralphie", league:"cfb", round:"round3", category:"Live Mascots", prompt:"Ralphie the buffalo is the live mascot of which program?", choices:["Colorado","Wyoming","North Dakota State","West Virginia"], answer:"Colorado", explanation:"Colorado's Ralphie leads the Buffaloes onto the field before home games.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r3-war-eagle", league:"cfb", round:"round3", category:"School Identity", prompt:"Which Tigers program is also famous for the cry “War Eagle”?", choices:["Auburn","LSU","Clemson","Missouri"], answer:"Auburn", explanation:"Auburn's teams are the Tigers, while “War Eagle” is the university's celebrated battle cry.", sourceId:"cfb-traditions" }),
  q({ id:"cfb-r3-first-heisman", league:"cfb", round:"round3", category:"Awards", prompt:"Who won the first Heisman Trophy in 1935?", choices:["Jay Berwanger","Doc Blanchard","Tom Harmon","Davey O'Brien"], answer:"Jay Berwanger", explanation:"University of Chicago halfback Jay Berwanger won the inaugural Downtown Athletic Club Trophy, later renamed the Heisman.", sourceId:"cfb-history" }),

  // CFB · Last Call
  q({ id:"cfb-final-two-heismans", league:"cfb", round:"last-call", category:"Heisman History", prompt:"Who remains the only player to win the Heisman Trophy twice?", choices:["Archie Griffin","Tim Tebow","Matt Leinart","O.J. Simpson"], answer:"Archie Griffin", explanation:"Ohio State's Archie Griffin won consecutive Heismans in 1974 and 1975.", sourceId:"cfb-history" }),
  q({ id:"cfb-final-first-ap-champ", league:"cfb", round:"last-call", category:"Poll Era", prompt:"Which school finished No. 1 in the very first Associated Press college football poll season in 1936?", choices:["Minnesota","Notre Dame","Alabama","Pittsburgh"], answer:"Minnesota", explanation:"Minnesota finished atop the first final AP poll in 1936.", sourceId:"cfb-history" }),
  q({ id:"cfb-final-1902-rose", league:"cfb", round:"last-call", category:"Bowl History", prompt:"Michigan beat which school 49–0 in the first Rose Bowl game in 1902?", choices:["Stanford","California","USC","Washington"], answer:"Stanford", explanation:"Michigan defeated Stanford 49–0 in the inaugural Tournament East-West football game, now known as the Rose Bowl.", sourceId:"cfb-history" }),

  // UFC · Round 1 — Around the Octagon
  q({ id:"ufc-r1-ufc1-winner", league:"ufc", round:"round1", category:"Origins", prompt:"Who won the UFC 1 tournament?", choices:["Royce Gracie","Ken Shamrock","Gerard Gordeau","Dan Severn"], answer:"Royce Gracie", explanation:"Royce Gracie won three fights in one night to capture UFC 1.", sourceId:"ufc-history" }),
  q({ id:"ufc-r1-eight-sides", league:"ufc", round:"round1", category:"The Octagon", prompt:"How many sides does the UFC Octagon have?", choices:["8","6","10","12"], answer:"8", explanation:"The Octagon is an eight-sided competition enclosure.", sourceId:"ufc-history" }),
  q({ id:"ufc-r1-its-time", league:"ufc", round:"round1", category:"Broadcast", prompt:"Who is famous for the UFC introduction “It's time!”?", choices:["Bruce Buffer","Joe Rogan","Jon Anik","Mike Goldberg"], answer:"Bruce Buffer", explanation:"Bruce Buffer has made “It's time!” his signature UFC main-event call.", sourceId:"ufc-history" }),
  q({ id:"ufc-r1-tuf1-lhw", league:"ufc", round:"round1", category:"The Ultimate Fighter", prompt:"Who won the light heavyweight final on the first season of The Ultimate Fighter?", choices:["Forrest Griffin","Stephan Bonnar","Rashad Evans","Diego Sanchez"], answer:"Forrest Griffin", explanation:"Forrest Griffin beat Stephan Bonnar in the famous TUF 1 finale fight.", sourceId:"ufc-history" }),
  q({ id:"ufc-r1-first-women", league:"ufc", round:"round1", category:"Women's MMA", prompt:"Who faced Ronda Rousey in the first women's fight in UFC history?", choices:["Liz Carmouche","Miesha Tate","Cat Zingano","Sara McMann"], answer:"Liz Carmouche", explanation:"Rousey defended the inaugural women's bantamweight title against Liz Carmouche at UFC 157.", sourceId:"ufc-history" }),

  // UFC · Round 2 — Deep Cuts
  q({ id:"ufc-r2-double-champ", league:"ufc", round:"round2", category:"Championships", prompt:"Who became the first UFC fighter to hold titles in two divisions at the same time?", choices:["Conor McGregor","Daniel Cormier","Amanda Nunes","Georges St-Pierre"], answer:"Conor McGregor", explanation:"McGregor added the lightweight title to his featherweight belt at UFC 205.", sourceId:"ufc-history" }),
  q({ id:"ufc-r2-first-bmf", league:"ufc", round:"round2", category:"BMF", prompt:"Who won the first BMF title in 2019?", choices:["Jorge Masvidal","Nate Diaz","Justin Gaethje","Dustin Poirier"], answer:"Jorge Masvidal", explanation:"Masvidal beat Nate Diaz by doctor stoppage at UFC 244 to win the inaugural BMF belt.", sourceId:"ufc-history" }),
  q({ id:"ufc-r2-korean-zombie", league:"ufc", round:"round2", category:"Nicknames", prompt:"Which fighter was known as “The Korean Zombie”?", choices:["Chan Sung Jung","Doo Ho Choi","Dong Hyun Kim","Yair Rodriguez"], answer:"Chan Sung Jung", explanation:"Chan Sung Jung became one of MMA's most recognizable fighters under “The Korean Zombie” nickname.", sourceId:"ufc-history" }),
  q({ id:"ufc-r2-first-city", league:"ufc", round:"round2", category:"Origins", prompt:"UFC 1 was held in which U.S. city?", choices:["Denver","Las Vegas","Atlantic City","Los Angeles"], answer:"Denver", explanation:"UFC 1 took place at McNichols Sports Arena in Denver in November 1993.", sourceId:"ufc-history" }),
  q({ id:"ufc-r2-ufc100", league:"ufc", round:"round2", category:"Milestone Events", prompt:"Which heavyweight title fight headlined UFC 100?", choices:["Brock Lesnar vs. Frank Mir","Randy Couture vs. Brock Lesnar","Cain Velasquez vs. Brock Lesnar","Frank Mir vs. Antônio Rodrigo Nogueira"], answer:"Brock Lesnar vs. Frank Mir", explanation:"Lesnar stopped Mir in their rematch to headline UFC 100.", sourceId:"ufc-history" }),

  // UFC · Round 3 — Championship Rounds
  q({ id:"ufc-r3-first-flyweight", league:"ufc", round:"round3", category:"Championships", prompt:"Who became the UFC's first flyweight champion?", choices:["Demetrious Johnson","Joseph Benavidez","Henry Cejudo","John Dodson"], answer:"Demetrious Johnson", explanation:"Demetrious Johnson beat Joseph Benavidez in 2012 to become the inaugural UFC flyweight champion.", sourceId:"ufc-history" }),
  q({ id:"ufc-r3-msg", league:"ufc", round:"round3", category:"Venues", prompt:"Which milestone event was the UFC's first card at Madison Square Garden?", choices:["UFC 205","UFC 200","UFC 217","UFC 229"], answer:"UFC 205", explanation:"UFC 205 in November 2016 was the promotion's first event at Madison Square Garden.", sourceId:"ufc-history" }),
  q({ id:"ufc-r3-tuf-finale", league:"ufc", round:"round3", category:"Historic Fights", prompt:"The famous 2005 fight credited with helping launch the UFC into a new era featured Forrest Griffin against...", choices:["Stephan Bonnar","Tito Ortiz","Chuck Liddell","Rashad Evans"], answer:"Stephan Bonnar", explanation:"Griffin–Bonnar at The Ultimate Fighter 1 Finale became one of the promotion's defining early television moments.", sourceId:"ufc-history" }),
  q({ id:"ufc-r3-ronda-awarded", league:"ufc", round:"round3", category:"Women's MMA", prompt:"Who was named the UFC's first women's bantamweight champion before the division's first UFC title fight?", choices:["Ronda Rousey","Miesha Tate","Liz Carmouche","Holly Holm"], answer:"Ronda Rousey", explanation:"The UFC introduced Ronda Rousey as its inaugural women's bantamweight champion before UFC 157.", sourceId:"ufc-history" }),
  q({ id:"ufc-r3-ufc1-format", league:"ufc", round:"round3", category:"Old-School UFC", prompt:"Which modern feature was missing from UFC 1?", choices:["Weight classes","A referee","A cage","A tournament bracket"], answer:"Weight classes", explanation:"UFC 1 had no weight classes, helping create the event's anything-goes tournament identity.", sourceId:"ufc-history" }),

  // UFC · Last Call
  q({ id:"ufc-final-ufc1-final", league:"ufc", round:"last-call", category:"Origins", prompt:"Royce Gracie defeated whom in the UFC 1 tournament final?", choices:["Gerard Gordeau","Ken Shamrock","Kevin Rosier","Teila Tuli"], answer:"Gerard Gordeau", explanation:"Gracie submitted Gerard Gordeau in the final to win UFC 1.", sourceId:"ufc-history" }),
  q({ id:"ufc-final-bmf-ending", league:"ufc", round:"last-call", category:"BMF", prompt:"How did the inaugural Masvidal–Diaz BMF fight officially end?", choices:["Doctor stoppage","Unanimous decision","Corner stoppage","Submission"], answer:"Doctor stoppage", explanation:"The ringside physician stopped UFC 244 after the third round because of cuts around Nate Diaz's eye.", sourceId:"ufc-history" }),
  q({ id:"ufc-final-first-event-year", league:"ufc", round:"last-call", category:"Origins", prompt:"In what year did UFC 1 take place?", choices:["1993","1991","1995","1997"], answer:"1993", explanation:"UFC 1 was held on Nov. 12, 1993, in Denver.", sourceId:"ufc-history" }),
  ...BAR_TRIVIA_NFL_EVERGREEN_EXPANSION,
  ...BAR_TRIVIA_NFL_EVERGREEN_WAVE_2,
  ...BAR_TRIVIA_NFL_EVERGREEN_WAVE_3,
  ...BAR_TRIVIA_CFB_EVERGREEN_EXPANSION,
  ...BAR_TRIVIA_CFB_EVERGREEN_WAVE_2,
  ...BAR_TRIVIA_CFB_EVERGREEN_WAVE_3,
  ...BAR_TRIVIA_UFC_EVERGREEN_EXPANSION,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_2,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_3,
  ...BAR_TRIVIA_NFL_EVERGREEN_WAVE_4,
  ...BAR_TRIVIA_CFB_EVERGREEN_WAVE_4,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_4,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_5,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_6,
  ...BAR_TRIVIA_UFC_EVERGREEN_WAVE_7,
  ...BAR_TRIVIA_CURRENT_EVENT_QUESTIONS,
];
