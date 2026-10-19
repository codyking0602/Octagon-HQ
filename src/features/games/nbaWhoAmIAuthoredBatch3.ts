import type { NbaWhoAmIAuthoredIdentity } from "./nbaWhoAmIAuthoredScripts";

/** Batch 3: forty-eight exclusive historical NBA identities; two independently authored reveal paths each. */
type Entry = { name: string; bref: string; group: "guard" | "wing" | "big"; a: readonly string[]; b: readonly string[]; history?: string };
const bands = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"] as const;
const entries: readonly Entry[] = [
  {
    "name": "Allen Iverson",
    "bref": "iversal01",
    "group": "guard",
    "history": "https://www.nba.com/news/archive-75-allen-iverson",
    "a": [
      "I won Rookie of the Year and made the All-Rookie First Team.",
      "I repeatedly ranked among the league leaders in minutes played.",
      "I earned multiple All-NBA First Team selections.",
      "I led the league in steals in three consecutive seasons.",
      "I won a regular-season Most Valuable Player award.",
      "I collected four NBA scoring titles during my career.",
      "I scored 48 points in the opening game of a Finals series.",
      "I took the heavily favored Lakers to overtime in Game 1 of the 2001 Finals and won.",
      "I became the face of the Philadelphia 76ers during their 2001 Finals run.",
      "I wore No. 3 and was famously called The Answer."
    ],
    "b": [
      "I was voted an All-Star in many consecutive seasons.",
      "I combined high-volume scoring with aggressive play in passing lanes.",
      "I entered the professional league after two college seasons.",
      "I made eleven NBA All-Star teams.",
      "I won the All-Star Game MVP award twice.",
      "I was the first overall selection in the 1996 NBA Draft.",
      "I won the 2001 MVP while leading my club to an Eastern Conference title.",
      "I played the majority of my career for Philadelphia before stops in Denver, Detroit and Memphis.",
      "My signature crossover and my 2001 step-over of Tyronn Lue became basketball landmarks.",
      "I was the Georgetown product called AI and The Answer."
    ]
  },
  {
    "name": "Vince Carter",
    "bref": "cartevi01",
    "group": "wing",
    "a": [
      "I earned Rookie of the Year recognition after immediately becoming a prolific scorer.",
      "I made the All-NBA team more than once during my career.",
      "I developed into an effective long-range shooter after building a reputation for explosive finishing.",
      "I played in eight NBA All-Star Games.",
      "I helped an international Olympic team win gold with the United States.",
      "I competed in NBA games across four different decades.",
      "I played a record 22 NBA seasons before retiring.",
      "I was traded from Toronto to New Jersey and paired with Jason Kidd.",
      "I won the 2000 NBA Slam Dunk Contest with a famous 360-degree windmill.",
      "I became the Raptors star called Vinsanity and Air Canada."
    ],
    "b": [
      "I earned an All-Rookie First Team selection.",
      "I played substantial minutes off the bench late in a lengthy career.",
      "I helped my team reach a conference semifinal in my third NBA season.",
      "I was selected fifth in the draft before my rights were dealt on draft night.",
      "I made the All-NBA Second Team in 2001.",
      "I famously dueled Allen Iverson in a seven-game 2001 playoff series.",
      "I hit a game-winning corner three for Dallas against San Antonio in the 2014 playoffs.",
      "I ended my NBA career as a veteran on the Atlanta Hawks.",
      "I was originally drafted by Golden State and immediately traded for Antawn Jamison to Toronto.",
      "My 2000 dunk contest for the Toronto Raptors remains one of the event's signature performances."
    ]
  },
  {
    "name": "Tracy McGrady",
    "bref": "mcgratr01",
    "group": "wing",
    "a": [
      "I became an All-Star before turning twenty-five.",
      "I earned multiple All-NBA selections during my prime.",
      "I entered the NBA straight from high school.",
      "I received the league's Most Improved Player award.",
      "I finished in the top five of league MVP voting more than once.",
      "I won consecutive league scoring titles in 2003 and 2004.",
      "I averaged 32.1 points per game during my first scoring-title season.",
      "I teamed with Yao Ming after being traded to Houston.",
      "I scored 13 points in 33 seconds against the Spurs in December 2004.",
      "I was the Orlando and Houston star known to fans as T-Mac."
    ],
    "b": [
      "I was drafted in the first round while still a teenager.",
      "I was named to seven All-NBA teams.",
      "I began my career in a secondary role before becoming a primary offensive option.",
      "I made seven NBA All-Star teams.",
      "I was selected ninth overall in the 1997 NBA Draft.",
      "I began my NBA career playing alongside cousin Vince Carter in Toronto.",
      "I became a star after moving from Toronto to Orlando.",
      "I joined San Antonio late in the 2013 playoffs and reached the NBA Finals without appearing in a Finals game.",
      "I was the Magic scorer who wore No. 1 during my two scoring-title seasons.",
      "My nickname T-Mac followed me from Orlando to the Houston Rockets."
    ]
  },
  {
    "name": "Steve Nash",
    "bref": "nashst01",
    "group": "guard",
    "history": "https://www.nba.com/news/archive-75-steve-nash",
    "a": [
      "I entered the NBA as a first-round pick but initially saw limited minutes.",
      "I consistently ranked among the league's best free-throw shooters.",
      "I later led the NBA in assists in multiple seasons.",
      "I earned three All-NBA First Team selections.",
      "I shot at least fifty percent from the field, forty percent from three and ninety percent from the line in several seasons.",
      "I won back-to-back league MVP awards in 2005 and 2006.",
      "I orchestrated a fast-paced offense under coach Mike D'Antoni.",
      "I led Phoenix's Seven Seconds or Less attack alongside Amar'e Stoudemire.",
      "I was the Canadian two-time MVP who also starred for Dallas and the Suns.",
      "I wore No. 13 as the celebrated point guard of the Phoenix Suns."
    ],
    "b": [
      "I made the All-NBA team in several different seasons.",
      "I was better known for creating shots than for volume scoring.",
      "I was a member of eight NBA All-Star teams.",
      "I was selected in the middle of the first round in 1996.",
      "I shared the floor with a future league MVP before becoming one myself.",
      "I played beside Dirk Nowitzki and Michael Finley for Dallas.",
      "I returned to the franchise that had drafted me as a free agent in 2004.",
      "I earned five NBA assists titles and two MVP awards without reaching the Finals.",
      "I finished my playing career with the Los Angeles Lakers after starring in Phoenix.",
      "I was the Santa Clara graduate who led the Suns' Seven Seconds or Less offense."
    ]
  },
  {
    "name": "Jason Kidd",
    "bref": "kiddja01",
    "group": "guard",
    "history": "https://www.nba.com/news/archive-75-jason-kidd",
    "a": [
      "I shared the Rookie of the Year award with another young star.",
      "I earned All-Defensive recognition in many seasons.",
      "I was named to the All-NBA First Team five times.",
      "I led the league in assists on five occasions.",
      "I became one of the league's leading triple-double producers.",
      "I guided a team to consecutive NBA Finals appearances in 2002 and 2003.",
      "I made ten All-Star teams before capturing my first championship.",
      "I won the 2011 NBA championship alongside Dirk Nowitzki.",
      "I transformed the New Jersey Nets into Eastern Conference champions.",
      "I was the No. 5 floor general called J-Kidd who later coached Dallas."
    ],
    "b": [
      "I played nearly two decades at the NBA level.",
      "I regularly contributed rebounds despite being best known as a playmaker.",
      "I was chosen second overall in my draft class.",
      "I started my professional career by sharing an award with Grant Hill.",
      "I won two Olympic gold medals with the United States.",
      "I spent notable stretches with Dallas, Phoenix and New Jersey.",
      "I returned to Dallas in a midseason trade before its title run.",
      "I retired among the NBA's career leaders in assists and steals.",
      "I helped defeat LeBron James's Miami Heat in the 2011 Finals as a Maverick.",
      "I began my championship career with the Dallas Mavericks and previously led the Nets to two Finals."
    ]
  },
  {
    "name": "Steve Francis",
    "bref": "francst01",
    "group": "guard",
    "a": [
      "I shared a Rookie of the Year award with another first-year standout.",
      "I earned three consecutive NBA All-Star selections.",
      "I regularly supplied both scoring and assists during my peak.",
      "I was named to the All-Rookie First Team.",
      "I entered the NBA as the second overall pick.",
      "I was initially drafted by Vancouver but never played for the Grizzlies.",
      "I was traded to Houston before playing my first NBA game.",
      "I was sent to Orlando in the blockbuster deal that brought Tracy McGrady to Houston.",
      "I headlined the early-2000s Houston Rockets alongside Yao Ming.",
      "I was the high-flying Houston guard known as Stevie Franchise."
    ],
    "b": [
      "I emerged as a team's offensive leader right out of the draft.",
      "I could contribute on the glass despite my backcourt role.",
      "I averaged more than twenty points per game in multiple seasons.",
      "I was an All-Star in 2002, 2003 and 2004.",
      "I shared the 2000 Rookie of the Year honor with Elton Brand.",
      "I starred in Houston before moving to Orlando and later New York.",
      "I reunited briefly with the Rockets late in my NBA career.",
      "I was chosen directly behind Elton Brand in the 1999 NBA Draft.",
      "I wore No. 3 during my celebrated early years with the Rockets.",
      "My nickname Stevie Franchise came from my status as Houston's centerpiece."
    ]
  },
  {
    "name": "Grant Hill",
    "bref": "hillgr01",
    "group": "wing",
    "history": "https://www.nba.com/news/nba-legends-brunch-david-robinson-grant-hill-honors",
    "a": [
      "I shared Rookie of the Year with another future Hall of Famer.",
      "I earned multiple All-NBA honors before chronic injuries interrupted my career.",
      "I could initiate offense while also scoring and rebounding effectively.",
      "I made the All-NBA First Team in 1997.",
      "I was an NBA All-Star in my first seven eligible seasons.",
      "I missed most of several seasons because of severe ankle problems.",
      "I was a key member of the United States' gold medal team at the 1996 Olympics.",
      "I rebuilt my career as a productive veteran for Phoenix after leaving Orlando.",
      "I was the star Detroit Pistons forward who later signed with the Orlando Magic.",
      "I won two national titles at Duke before becoming a Pistons icon."
    ],
    "b": [
      "I was an All-Rookie First Team pick.",
      "I developed into one of the league's best all-around playmakers.",
      "I recorded many triple-doubles early in my NBA career.",
      "I received more All-Star fan votes than any other player as a rookie.",
      "I entered the league as the third overall selection in 1994.",
      "I led the league in triple-doubles in the 1995-96 season.",
      "I was named to five All-NBA teams during my prime.",
      "I struggled through repeated surgeries after signing a major free-agent deal in 2000.",
      "I played for Detroit, Orlando, Phoenix and the Los Angeles Clippers.",
      "I was the Duke champion who shared 1995 Rookie of the Year with Jason Kidd."
    ]
  },
  {
    "name": "Penny Hardaway",
    "bref": "hardaan01",
    "group": "guard",
    "a": [
      "I was selected for the NBA All-Rookie First Team.",
      "I received back-to-back All-NBA First Team honors early in my career.",
      "I helped my team reach the NBA Finals while still early in my career.",
      "I played in four consecutive NBA All-Star Games.",
      "I finished third in MVP voting in 1996.",
      "I shared a backcourt with Nick Anderson during a championship push.",
      "I reached the 1995 NBA Finals alongside Shaquille O'Neal.",
      "I suffered serious knee problems that curtailed my prime.",
      "I was the dynamic No. 1 Orlando Magic guard of the Shaq-and-Penny pairing.",
      "My miniature advertising alter ego was called Lil' Penny."
    ],
    "b": [
      "I immediately became a valued contributor as a rookie.",
      "I could score and distribute the ball at an All-NBA level.",
      "I helped eliminate a defending champion in a playoff series.",
      "I was picked third overall in the 1993 NBA Draft.",
      "I entered the league through a draft-night trade involving Chris Webber.",
      "I won Olympic gold with the United States in 1996.",
      "I later spent several seasons with the Phoenix Suns after leaving my first team.",
      "I eventually returned to the school where I played college basketball as head coach.",
      "I was the Memphis State product whose NBA debut came with the Orlando Magic.",
      "My nickname Penny, partnership with Shaq and Lil' Penny commercials defined my first Magic years."
    ]
  },
  {
    "name": "Chris Webber",
    "bref": "webbech01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-chris-webber",
    "a": [
      "I was voted Rookie of the Year after my debut season.",
      "I became a multiple-time All-Star and All-NBA selection.",
      "I was named to the All-NBA First Team in 2001.",
      "I helped turn a struggling franchise into a consistent playoff team.",
      "I was selected first overall in the 1993 NBA Draft.",
      "I was traded on draft night for another highly touted prospect and draft picks.",
      "I anchored a team that won 61 games in the 2001-02 regular season.",
      "I came within a victory of the NBA Finals against the Lakers in 2002.",
      "I was a leader of the Sacramento Kings' celebrated early-2000s offense.",
      "I was part of Michigan's Fab Five before becoming the Kings' No. 4."
    ],
    "b": [
      "I was a highly regarded rookie who immediately averaged a double-double.",
      "I earned five All-Star selections over my NBA career.",
      "I was a gifted passer for a player of my size.",
      "I spent time with several franchises before reaching the height of my career.",
      "I played alongside Jason Williams and later Mike Bibby on a title contender.",
      "I suffered a serious knee injury during the 2003 postseason.",
      "I was originally drafted by Orlando, which exchanged my rights for Penny Hardaway.",
      "I later had a return stint in Golden State before retiring.",
      "I starred for the Golden State Warriors, Washington Bullets/Wizards and Sacramento Kings.",
      "I led the Sacramento group with Vlade Divac, Peja Stojaković and Mike Bibby."
    ]
  },
  {
    "name": "Chris Mullin",
    "bref": "mullich01",
    "group": "wing",
    "history": "https://www.nba.com/news/history-nba-legend-chris-mullin",
    "a": [
      "I earned five NBA All-Star selections during my prime.",
      "I was named to four All-NBA teams.",
      "I was an elite shooter whose scoring improved markedly after my first seasons.",
      "I averaged more than twenty-five points per game in several seasons.",
      "I earned All-NBA First Team honors in 1992.",
      "I was one of three high-scoring teammates in an offense given a short nickname.",
      "I won gold as a member of the original 1992 U.S. Olympic Dream Team.",
      "I played for Indiana late in my career before returning to my first franchise.",
      "I formed Run TMC with Tim Hardaway and Mitch Richmond at Golden State.",
      "I was the left-handed St. John's star who wore No. 17 for the Warriors."
    ],
    "b": [
      "I established myself as a dependable scorer after a modest rookie season.",
      "I could threaten defenders from outside without relying on spectacular athleticism.",
      "I spent most of my NBA career playing for one franchise.",
      "I was the seventh overall draft pick in 1985.",
      "I averaged more than twenty-five points in five straight seasons.",
      "I won Olympic gold with the United States in both 1984 and 1992.",
      "I played on a Don Nelson-coached team known for fast-paced offense.",
      "I reached the 2000 NBA Finals during a later stint with the Pacers.",
      "I returned to Golden State to finish my playing career in 2001.",
      "I was the former St. John's Red Storm standout in the Warriors trio Run TMC."
    ]
  },
  {
    "name": "Reggie Miller",
    "bref": "millere01",
    "group": "wing",
    "history": "https://www.nba.com/news/history-nba-legend-reggie-miller",
    "a": [
      "I was selected to five NBA All-Star Games.",
      "I earned multiple All-NBA Third Team honors.",
      "I became a premier off-ball shooter and a reliable foul-line scorer.",
      "I remained a regular playoff participant deep into my career.",
      "I made the NBA Finals once but did not win a championship.",
      "I scored 25 points in the fourth quarter of a famous playoff game against New York.",
      "I scored eight points in roughly nine seconds at Madison Square Garden in 1995.",
      "I played every NBA season of my career for Indiana.",
      "I dueled with Spike Lee and the Knicks during the Pacers' playoff runs.",
      "I wore No. 31 and became the defining long-range shooter of the Indiana Pacers."
    ],
    "b": [
      "I became a franchise's all-time scoring leader.",
      "I was famous for making big shots late in close games.",
      "I was named to the All-NBA Third Team three times.",
      "I entered the league as the eleventh overall pick in 1987.",
      "I made 2,560 career regular-season three-pointers.",
      "I reached the 2000 Finals under coach Larry Bird.",
      "I was a centerpiece of several playoff battles with Michael Jordan's Bulls.",
      "I retired in 2005 after eighteen seasons in the same uniform.",
      "I was the UCLA sharpshooter whose older sister Cheryl was also a basketball star.",
      "I became known as Miller Time while starring for the Indiana Pacers."
    ]
  },
  {
    "name": "Shawn Kemp",
    "bref": "kempsh01",
    "group": "big",
    "a": [
      "I developed from a teenage reserve into a perennial All-Star.",
      "I was a powerful finisher and prolific rebounder in my prime.",
      "I earned three All-NBA Second Team selections.",
      "I made six consecutive All-Star teams in the 1990s.",
      "I reached an NBA Finals but lost to a team built around a historic scorer.",
      "I helped a club win 64 regular-season games in 1995-96.",
      "I faced Michael Jordan's Chicago Bulls in the 1996 Finals.",
      "I later played for Cleveland, Portland and Orlando after my breakout.",
      "I teamed with Gary Payton on the Seattle SuperSonics.",
      "My spectacular dunks made me the player nicknamed the Reign Man."
    ],
    "b": [
      "I entered the NBA directly after high school rather than playing college basketball.",
      "I improved my scoring average across several consecutive early seasons.",
      "I won a world championship with the United States in 1994.",
      "I was chosen seventeenth overall in the 1989 NBA Draft.",
      "I was a major part of a team that won more than fifty games repeatedly.",
      "I scored twenty or more points per game in two consecutive seasons after a trade.",
      "I played against Dennis Rodman in an NBA Finals series.",
      "I was sent from Seattle to Cleveland in a major 1997 trade.",
      "I was one half of a famous alley-oop partnership with Gary Payton.",
      "I became famous for my high-flying dunks in Seattle as the Reign Man."
    ]
  },
  {
    "name": "Gary Payton",
    "bref": "paytoga01",
    "group": "guard",
    "history": "https://www.nba.com/news/history-nba-legend-gary-payton",
    "a": [
      "I became a regular All-Star and All-NBA performer.",
      "I was selected to an NBA All-Defensive First Team in nine consecutive seasons.",
      "I played in the Finals both in my prime and again near the end of my career.",
      "I became a league steals leader during my prime.",
      "I won the 1996 NBA Defensive Player of the Year award.",
      "I played on the 1996 Finals team that faced Michael Jordan's Bulls.",
      "I won my only NBA championship with Miami in 2006.",
      "I partnered with Shawn Kemp for many years in Seattle.",
      "I was the defensive Seattle guard famously called The Glove.",
      "I wore No. 20 for the SuperSonics and won the 1996 Defensive Player of the Year."
    ],
    "b": [
      "I was a first-round pick who became a two-way star.",
      "I contributed scoring, assists and steals for many years.",
      "I made the All-NBA First Team twice.",
      "I averaged more than twenty points in multiple seasons.",
      "I was chosen second overall in the 1990 NBA Draft.",
      "I won Olympic gold with the United States in 1996 and 2000.",
      "I played alongside Kobe Bryant and Shaquille O'Neal late in their Lakers partnership.",
      "I spent seventeen NBA seasons with Seattle, Milwaukee, the Lakers, Boston and Miami.",
      "I helped the SuperSonics reach the 1996 NBA Finals before winning a ring with the Heat.",
      "My nickname The Glove reflected my suffocating perimeter defense."
    ]
  },
  {
    "name": "Patrick Ewing",
    "bref": "ewingpa01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-patrick-ewing",
    "a": [
      "I earned Rookie of the Year in my first NBA season.",
      "I collected eleven NBA All-Star selections.",
      "I was a reliable twenty-point scorer and an imposing shot blocker.",
      "I earned an All-NBA First Team selection in 1990.",
      "I helped my club reach the conference finals multiple times.",
      "I faced Hakeem Olajuwon in a seven-game NBA Finals series.",
      "I led New York to the 1994 Finals, where Houston prevailed.",
      "I was selected first in the inaugural NBA draft lottery of 1985.",
      "I was the longtime New York Knicks cornerstone at Madison Square Garden.",
      "I wore No. 33 after starring under John Thompson at Georgetown."
    ],
    "b": [
      "I played more than a thousand NBA regular-season games.",
      "I was selected repeatedly to All-NBA teams.",
      "I built a reputation for mid-range shooting in addition to rim protection.",
      "I won Olympic gold at both the 1984 and 1992 Summer Games.",
      "I played a pivotal role in a famous college national championship.",
      "I returned from an Achilles injury after missing a team's 1999 Finals run.",
      "I finished with brief NBA stops in Seattle and Orlando.",
      "I lost the 1994 Finals to a college rival whose team had once lost to mine.",
      "I was the Georgetown Hoyas star who won the 1984 NCAA title.",
      "My No. 33 hangs in the rafters of Madison Square Garden for the Knicks."
    ]
  },
  {
    "name": "David Robinson",
    "bref": "robinda01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-david-robinson",
    "a": [
      "I won Rookie of the Year after joining the NBA.",
      "I combined elite rebounding with outstanding shot blocking.",
      "I earned the league's Defensive Player of the Year award.",
      "I won both a rebounding title and a scoring title in my career.",
      "I earned the 1995 NBA Most Valuable Player award.",
      "I scored 71 points in the final game of the 1993-94 regular season.",
      "I served in the U.S. Navy before starting my professional career.",
      "I won NBA championships in 1999 and 2003 alongside Tim Duncan.",
      "I played my entire NBA career for the San Antonio Spurs.",
      "I wore No. 50 and earned the nickname The Admiral."
    ],
    "b": [
      "I was a ten-time NBA All-Star.",
      "I quickly became one of the league's most versatile interior defenders.",
      "I earned numerous All-NBA and All-Defensive selections.",
      "I was selected first overall in a draft but debuted two seasons later.",
      "I recorded a quadruple-double in a 1994 regular-season game.",
      "I won the 1992 Defensive Player of the Year award.",
      "I was part of the 1992 U.S. Olympic Dream Team.",
      "I won my second NBA championship in my final season.",
      "I shared the Spurs frontcourt with Tim Duncan as part of the Twin Towers.",
      "I was the Naval Academy graduate called The Admiral in San Antonio."
    ]
  },
  {
    "name": "Hakeem Olajuwon",
    "bref": "olajuha01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-hakeem-olajuwon",
    "a": [
      "I was consistently among the league's top rebounders and shot blockers.",
      "I was chosen for multiple All-NBA and All-Defensive teams.",
      "I won the NBA Defensive Player of the Year award more than once.",
      "I made twelve NBA All-Star appearances.",
      "I won the regular-season MVP award during a championship season.",
      "I earned league MVP, Defensive Player of the Year and Finals MVP in the same season.",
      "I led back-to-back NBA championship runs in 1994 and 1995.",
      "I led the NBA in career blocks at retirement with 3,830.",
      "I became the centerpiece of the Houston Rockets' first two championships.",
      "My famous footwork and Dream Shake gave me the nickname Hakeem the Dream."
    ],
    "b": [
      "I was a dominant scorer even though defense was equally central to my game.",
      "I became a twelve-time All-NBA selection.",
      "I developed an extraordinary set of post moves and counter moves.",
      "I recorded a quadruple-double in 1990.",
      "I was the first pick of the 1984 NBA Draft ahead of Michael Jordan.",
      "I played on a college team known as Phi Slama Jama.",
      "I defeated Patrick Ewing's Knicks in the 1994 Finals.",
      "I outplayed David Robinson in a 1995 conference final before sweeping Orlando.",
      "I starred at the University of Houston and was drafted by the Houston Rockets.",
      "I was the Nigerian-born Rockets legend known for the Dream Shake and No. 34."
    ]
  },
  {
    "name": "Charles Barkley",
    "bref": "barklch01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-charles-barkley",
    "a": [
      "I made eleven NBA All-Star teams.",
      "I was a formidable rebounder despite being shorter than many of the players I battled inside.",
      "I led the NBA in rebounding during the 1986-87 season.",
      "I was named to the All-NBA First Team five times.",
      "I won a regular-season MVP award but never an NBA title.",
      "I won MVP in 1993 after joining a new franchise.",
      "I led Phoenix to the 1993 Finals against Michael Jordan's Bulls.",
      "I scored 56 points in a 1994 playoff game against Golden State.",
      "I starred for Philadelphia, Phoenix and Houston.",
      "I was the outspoken Dream Team star called the Round Mound of Rebound."
    ],
    "b": [
      "I was a dominant scorer and rebounder over a long career.",
      "I was a frequent All-NBA selection throughout my prime.",
      "I became a member of the original U.S. Olympic Dream Team.",
      "I left my first franchise in a major trade during my prime.",
      "I was named the 1991 NBA All-Star Game MVP.",
      "I played alongside Hakeem Olajuwon and Clyde Drexler in Houston late in my career.",
      "I was the fifth overall pick out of Auburn in the 1984 NBA Draft.",
      "I was the principal star of the 1992-93 Phoenix Suns.",
      "I was the MVP who lost the 1993 Finals to the Chicago Bulls.",
      "I was known as Sir Charles and the Round Mound of Rebound."
    ]
  },
  {
    "name": "Karl Malone",
    "bref": "malonka01",
    "group": "big",
    "history": "https://www.nba.com/news/history-nba-legend-karl-malone",
    "a": [
      "I scored more than twenty points per game in many consecutive seasons.",
      "I earned multiple All-NBA First Team selections.",
      "I won two NBA regular-season MVP awards.",
      "I made fourteen NBA All-Star Games.",
      "I became one of the most prolific free-throw earners in league history.",
      "I was named league MVP in 1997 and again in 1999.",
      "I appeared in consecutive NBA Finals against Chicago in 1997 and 1998.",
      "I joined the Lakers for a final attempt at a title in 2003-04.",
      "I formed a long-running pick-and-roll partnership with John Stockton in Utah.",
      "I wore No. 32 for the Jazz and was famously nicknamed the Mailman."
    ],
    "b": [
      "I was a dependable high-volume scorer and rebounder.",
      "I had an unusually long run as an elite starter.",
      "I appeared on eleven consecutive All-NBA First Teams.",
      "I finished my career with 36,928 regular-season points.",
      "I entered the league as the thirteenth overall pick in 1985.",
      "I helped bring my franchise to its first NBA Finals.",
      "I lost two Finals in consecutive seasons to Michael Jordan's Bulls.",
      "I played my final NBA season alongside Shaquille O'Neal and Kobe Bryant.",
      "I was the Louisiana Tech product who spent eighteen seasons with the Utah Jazz.",
      "My Utah teammate was assist king John Stockton, and my nickname was the Mailman."
    ]
  },
  {
    "name": "John Stockton",
    "bref": "stockjo01",
    "group": "guard",
    "history": "https://www.nba.com/news/history-nba-legend-john-stockton",
    "a": [
      "I played a remarkably long NBA career without changing franchises.",
      "I became a repeated All-Star and All-NBA selection.",
      "I led the league in assists for nine consecutive seasons.",
      "I was an elite ball thief as well as a playmaker.",
      "I appeared in two consecutive NBA Finals.",
      "I made a series-winning three-pointer to send my team to the 1997 Finals.",
      "I finished with 15,806 assists in the NBA regular season.",
      "I retired as the league's career leader in both assists and steals.",
      "I ran the Utah Jazz pick-and-roll alongside Karl Malone.",
      "I was the Gonzaga guard wearing No. 12 for the Jazz."
    ],
    "b": [
      "I was drafted in the first round and gradually earned a starting role.",
      "I became known for durable, efficient playmaking.",
      "I was chosen for ten NBA All-Star Games.",
      "I led the NBA in steals in two different seasons.",
      "I was selected sixteenth overall in the 1984 NBA Draft.",
      "I won Olympic gold with the U.S. Dream Team in 1992.",
      "I played all nineteen NBA seasons for one organization.",
      "I made back-to-back Finals appearances but was denied by the Bulls.",
      "My pass to Karl Malone became synonymous with Utah's signature pick-and-roll.",
      "I was the Utah Jazz's No. 12 and finished with 3,265 steals and 15,806 assists."
    ]
  },
  {
    "name": "Scottie Pippen",
    "bref": "pippesc01",
    "group": "wing",
    "history": "https://www.nba.com/news/archive-75-scottie-pippen",
    "a": [
      "I earned repeated All-Defensive First Team selections.",
      "I could guard several different kinds of opponents while initiating offense.",
      "I made seven NBA All-Star teams.",
      "I was selected to three All-NBA First Teams.",
      "I finished third in MVP voting while serving as my team's lead star.",
      "I won consecutive Olympic gold medals with the United States.",
      "I won six NBA championships alongside Michael Jordan.",
      "I spent a later career stretch in Houston and Portland.",
      "I served as the versatile co-star of Chicago's two championship three-peats.",
      "I wore No. 33 for the Bulls and was Michael Jordan's longtime championship partner."
    ],
    "b": [
      "I was selected to both All-NBA and All-Defensive teams in several seasons.",
      "I was highly valued for defense, passing and transition play.",
      "I became the All-Star Game MVP in 1994.",
      "I was drafted fifth overall in 1987 before a draft-night trade.",
      "I led the Bulls in major categories during Jordan's first retirement.",
      "I famously dunked over Patrick Ewing in the 1994 playoffs.",
      "I helped Portland reach Game 7 of the 2000 Western Conference Finals.",
      "I played college basketball at the University of Central Arkansas.",
      "I won six rings with Chicago while defending stars across the league.",
      "I was the Bulls' No. 33, the fellow Dream Teamer paired with Michael Jordan."
    ]
  },
  {
    "name": "Dennis Rodman",
    "bref": "rodmade01",
    "group": "big",
    "history": "https://www.nba.com/news/archive-75-dennis-rodman",
    "a": [
      "I earned multiple NBA All-Defensive selections.",
      "I built my value through defense and rebounding more than scoring.",
      "I won the league's rebounding title in seven consecutive seasons.",
      "I received the Defensive Player of the Year award twice.",
      "I won NBA championships with more than one franchise.",
      "I won my first two titles as part of Detroit's Bad Boys defense.",
      "I later captured three straight championships with Michael Jordan's Bulls.",
      "I played for the Spurs between my Detroit and Chicago title runs.",
      "I became the flamboyant rebounding specialist wearing No. 91 for Chicago.",
      "My nickname was the Worm, and I won five NBA championships."
    ],
    "b": [
      "I entered the league without a celebrated major-college pedigree.",
      "I became a rotation player before developing into an elite defender.",
      "I made two NBA All-Star appearances.",
      "I led the league in rebounds per game more than any other player in the 1990s.",
      "I was drafted in the second round in 1986.",
      "I won Defensive Player of the Year in 1990 and 1991.",
      "I reached the 1988 Finals before winning rings in 1989 and 1990.",
      "I was traded from San Antonio to the Bulls in 1995.",
      "I played alongside Isiah Thomas in Detroit and Michael Jordan in Chicago.",
      "I was known for dyed hair, the Worm nickname and my Bulls No. 91 jersey."
    ]
  },
  {
    "name": "Clyde Drexler",
    "bref": "drexlcl01",
    "group": "wing",
    "history": "https://www.nba.com/news/archive-75-clyde-drexler",
    "a": [
      "I made ten NBA All-Star teams.",
      "I was a strong scoring and rebounding contributor from the perimeter.",
      "I earned five All-NBA selections during my prime.",
      "I finished second in regular-season MVP voting in 1992.",
      "I appeared in multiple NBA Finals with different teammates.",
      "I led Portland to the 1990 and 1992 Finals.",
      "I reunited with a former college teammate in a midseason trade.",
      "I won the 1995 NBA championship beside Hakeem Olajuwon in Houston.",
      "I became a legend with the Trail Blazers before closing my career with the Rockets.",
      "My soaring finishes earned me the nickname Clyde the Glide."
    ],
    "b": [
      "I was a prolific transition scorer with notable playmaking ability.",
      "I grew into the star of a team that contended for titles.",
      "I joined the 1992 United States Olympic Dream Team.",
      "I was drafted fourteenth overall in 1983.",
      "I played on the Phi Slama Jama college teams.",
      "I lost the 1992 Finals to Michael Jordan's Bulls.",
      "I moved from Portland to Houston during the 1994-95 season.",
      "I helped the Rockets sweep the Orlando Magic in the 1995 Finals.",
      "I starred at the University of Houston before a long career wearing No. 22 in Portland.",
      "I was known as Clyde the Glide with the Blazers and championship-winning Rockets."
    ]
  },
  {
    "name": "Dominique Wilkins",
    "bref": "wilkido01",
    "group": "wing",
    "history": "https://www.nba.com/news/archive-75-dominique-wilkins",
    "a": [
      "I was chosen for nine NBA All-Star Games.",
      "I became one of the most prolific scorers of my generation.",
      "I made seven All-NBA teams.",
      "I won the league scoring title during the 1985-86 season.",
      "I battled a superstar opponent in a classic seventh game of a playoff series.",
      "I scored 47 points against Larry Bird's Boston Celtics in Game 7 in 1988.",
      "I won two NBA Slam Dunk Contest championships.",
      "I spent twelve seasons starring for the Atlanta Hawks before a major trade.",
      "I wore No. 21 for Atlanta and was one of the greatest in-game dunkers.",
      "My high-flying style earned me the nickname the Human Highlight Film."
    ],
    "b": [
      "I became a consistent twenty-point scorer across many seasons.",
      "I was a two-time winner of a major All-Star weekend competition.",
      "I played in multiple playoff series against championship-caliber opponents.",
      "I was selected third overall in the 1982 NBA Draft.",
      "I was drafted by Utah but traded before making my NBA debut.",
      "I returned from a torn Achilles tendon to regain elite scoring form.",
      "I finished a late-career season as a European club champion.",
      "I left Atlanta for the Los Angeles Clippers in 1994.",
      "I represented the Hawks in memorable 1985 and 1990 dunk-contest wins.",
      "I was the Atlanta star called the Human Highlight Film."
    ]
  },
  {
    "name": "Dikembe Mutombo",
    "bref": "mutomdi01",
    "group": "big",
    "a": [
      "I earned eight NBA All-Star selections.",
      "I established myself as an elite rebounder and defender.",
      "I won the Defensive Player of the Year award four times.",
      "I led the NBA in blocked shots multiple seasons.",
      "I won consecutive league rebounding titles late in my prime.",
      "I helped an eighth-seeded playoff team defeat the top seed.",
      "I celebrated Denver's 1994 upset of Seattle while clutching the ball on the floor.",
      "I helped Philadelphia reach the 2001 NBA Finals.",
      "I became known for wagging a finger after blocking shots.",
      "I was the Georgetown-trained No. 55 center with the signature finger wag."
    ],
    "b": [
      "I was an All-Defensive standout across several franchises.",
      "I was known for shot blocking rather than scoring championships.",
      "I developed into one of the most decorated defensive players in NBA history.",
      "I entered the NBA as the fourth overall choice in the 1991 draft.",
      "I won the league's Defensive Player of the Year award in both 1995 and 2001.",
      "I played in the NBA Finals with Allen Iverson's 76ers.",
      "I later played for the New Jersey Nets and Houston Rockets.",
      "I finished with more than three thousand career blocked shots.",
      "I first rose to fame in the Denver Nuggets' famous 1994 playoff upset.",
      "My finger wag and the phrase 'No, no, no' became my signature celebration."
    ]
  },
  // NEXT_BATCH
];
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const nbaWhoAmIAuthoredBatch3: readonly NbaWhoAmIAuthoredIdentity[] = entries.map((entry) => {
  const slug = normalize(entry.name);
  const sourceIds = entry.history ? ["career", "history"] : ["career"];
  const clues = (script: "A" | "B", lines: readonly string[]) => lines.map((line, index) => ({
    id: `nba-${slug}-${script.toLowerCase()}-${index + 1}`,
    text: line,
    band: bands[index]!,
    verification: "verified" as const,
    sourceIds,
  }));
  return {
    subjectId: `nba:${slug}`,
    name: entry.name,
    eraBand: "legacy",
    rescueGroup: entry.group,
    earlyRotation: "normal",
    sources: {
      career: `https://www.basketball-reference.com/players/${entry.bref[0]}/${entry.bref}.html`,
      ...(entry.history ? { history: entry.history } : {}),
    },
    scripts: {
      A: { id: "A", clues: clues("A", entry.a) },
      B: { id: "B", clues: clues("B", entry.b) },
    },
  };
});
