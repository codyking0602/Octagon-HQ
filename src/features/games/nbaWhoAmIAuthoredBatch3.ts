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
  {
    "name": "Charles Barkley",
    "bref": "barklch01",
    "group": "big",
    "a": [
      "I earned All-Rookie First Team honors before becoming a perennial All-Star.",
      "I ranked among the league's most efficient high-volume scorers and rebounders.",
      "I earned multiple All-NBA First Team selections.",
      "I led the league in rebounds during one season.",
      "I won an NBA Most Valuable Player award but never an NBA championship.",
      "I earned MVP in 1993 after leaving Philadelphia for Phoenix.",
      "I faced Michael Jordan's Bulls in the 1993 NBA Finals.",
      "I helped form a veteran Houston trio with Hakeem Olajuwon and Clyde Drexler.",
      "My nickname was the Round Mound of Rebound.",
      "I was the No. 34 Phoenix Suns star nicknamed Sir Charles."
    ],
    "b": [
      "I was selected to eleven NBA All-Star Games.",
      "I became famous for powerful rebounding despite being undersized for my interior role.",
      "I won the 1991 All-Star Game MVP award.",
      "I averaged more than twenty points and ten rebounds over my career.",
      "I was selected fifth overall in the famous 1984 draft.",
      "I starred for the Philadelphia 76ers beside Moses Malone and Julius Erving.",
      "I won Olympic gold with the 1992 Dream Team and again in 1996.",
      "My Phoenix team won 62 games in 1992-93 before losing the Finals.",
      "I won my lone league MVP as a member of the Phoenix Suns.",
      "I was the outspoken Auburn alum Charles 'Sir Charles' Barkley, the Round Mound of Rebound."
    ]
  },
  {
    "name": "Karl Malone",
    "bref": "malonka01",
    "group": "big",
    "a": [
      "I earned repeated All-NBA selections across an exceptionally long career.",
      "I was a consistently productive scorer and rebounder.",
      "I made the All-NBA First Team eleven consecutive times.",
      "I was chosen for fourteen All-Star Games.",
      "I won two regular-season league MVP awards.",
      "I led my team to the Finals in consecutive seasons in the late 1990s.",
      "I shared most of my career with one legendary pass-first teammate.",
      "I played my final NBA season with the Los Angeles Lakers after eighteen seasons in Utah.",
      "My longtime Jazz teammate was John Stockton.",
      "I was Utah's No. 32 star nicknamed the Mailman."
    ],
    "b": [
      "I joined the league as a mid-first-round selection.",
      "I regularly played more than thirty-five minutes per game well into my career.",
      "I earned a spot on the All-Rookie First Team.",
      "I earned multiple All-Defensive First Team selections.",
      "I won an All-Star Game MVP award in both 1989 and 1993.",
      "I became an Olympic gold medalist on the original Dream Team.",
      "I won league MVP in 1997 and again in 1999.",
      "I finished my career second on the NBA's all-time scoring list at the time of retirement.",
      "I formed a signature pick-and-roll partnership for the Utah Jazz.",
      "I was known as the Mailman because I delivered for the Jazz."
    ]
  },
  {
    "name": "John Stockton",
    "bref": "stockjo01",
    "group": "guard",
    "a": [
      "I earned All-NBA honors and numerous All-Star selections during a lengthy career.",
      "I was especially noted for durable play and consistently high assist totals.",
      "I led the NBA in assists in nine consecutive seasons.",
      "I earned five All-Defensive Second Team selections.",
      "I was chosen to the league's All-NBA First Team twice.",
      "I made eleven NBA All-Star Games across my career.",
      "I finished as the NBA career leader in steals and assists.",
      "I played all nineteen NBA seasons with the Utah Jazz.",
      "I was famous for feeding Karl Malone in Utah's pick-and-roll.",
      "I was the Gonzaga alumnus who wore No. 12 for the Jazz."
    ],
    "b": [
      "I spent my entire professional career with one franchise.",
      "I became a fixture of my team's postseason appearances over many seasons.",
      "I was a member of the league's All-Rookie Second Team.",
      "I was an Olympic gold medalist on both the 1992 and 1996 United States teams.",
      "I reached consecutive NBA Finals without winning a title.",
      "I made the 1992 Dream Team roster alongside Michael Jordan and Magic Johnson.",
      "I hit a buzzer-beating three to send Utah to the 1997 NBA Finals.",
      "My last season with the Jazz was 2002-03.",
      "I amassed 15,806 career NBA assists while playing with Karl Malone.",
      "I am the Utah Jazz's all-time assists-and-steals leader known simply as Stockton."
    ]
  },
  {
    "name": "Scottie Pippen",
    "bref": "pippesc01",
    "group": "wing",
    "a": [
      "I gained a reputation as a versatile defender and secondary offensive creator.",
      "I was repeatedly voted to both All-NBA and All-Defensive teams.",
      "I made ten All-Defensive First Teams.",
      "I became an All-NBA First Team selection in multiple seasons.",
      "I took a leading offensive role during an interval when my team's biggest star retired.",
      "I finished third in the 1994 league MVP voting.",
      "I helped win six NBA championships during the 1990s.",
      "I spent a stretch with Houston and Portland before returning to Chicago.",
      "I was the long-time defensive counterpart to Michael Jordan on the Bulls.",
      "I was the Bulls' No. 33 star from Central Arkansas."
    ],
    "b": [
      "I became a seven-time NBA All-Star.",
      "I often guarded opposing perimeter stars while facilitating my team's offense.",
      "I was originally drafted by one franchise and traded immediately to another.",
      "I was named MVP of the 1994 NBA All-Star Game.",
      "I earned a place on the original 1992 U.S. Olympic Dream Team.",
      "I played college basketball at Central Arkansas before being selected fifth in the 1987 draft.",
      "I posted a famous triple-double in Game 6 of the 1992 Finals.",
      "I helped Portland reach a conference final against the Lakers in 2000.",
      "I won six championships alongside Michael Jordan and coach Phil Jackson in Chicago.",
      "I became the famous No. 33 Chicago Bulls partner to Jordan."
    ]
  },
  {
    "name": "Dennis Rodman",
    "bref": "rodmade01",
    "group": "big",
    "a": [
      "I became one of the NBA's most decorated defenders.",
      "I was known for extraordinary rebounding energy rather than leading my team in points.",
      "I won consecutive Defensive Player of the Year awards.",
      "I was named to eight NBA All-Defensive teams.",
      "I led the NBA in rebounds for seven consecutive seasons.",
      "I began my career as a key defensive piece for Detroit's championship teams.",
      "I won five NBA championships with two different franchises.",
      "I played briefly for San Antonio between my Detroit and Chicago years.",
      "I helped Michael Jordan and Scottie Pippen win three straight titles with Chicago.",
      "I wore No. 91 for the Bulls and was nicknamed the Worm."
    ],
    "b": [
      "I was selected to two All-Star Games.",
      "I became an All-NBA Third Team honoree despite relatively modest scoring averages.",
      "I entered the NBA as a second-round draft selection.",
      "I led the league in rebounding at both a high tempo and a deliberate tempo.",
      "I regularly defended players much taller than myself.",
      "I played for Chuck Daly's Detroit Bad Boys championship squads in 1989 and 1990.",
      "I collected 18.7 rebounds per game during the 1991-92 season.",
      "I joined Chicago as a rebounding specialist before its 72-win season.",
      "I starred on the Pistons' Bad Boys and then the Bulls' second three-peat.",
      "My dyed hair and No. 91 Bulls jersey helped make Dennis 'the Worm' Rodman unmistakable."
    ]
  },
  {
    "name": "Clyde Drexler",
    "bref": "drexlcl01",
    "group": "wing",
    "a": [
      "I combined scoring, passing and rebounding during a long All-Star career.",
      "I made several All-NBA teams as one of the league's best all-around performers.",
      "I was chosen for ten NBA All-Star Games.",
      "I led a contender on several deep postseason runs.",
      "I became a league champion after leaving my longtime team.",
      "I brought Portland to the 1990 and 1992 NBA Finals.",
      "I was traded during the 1994-95 season to reunite with a college teammate.",
      "I won the 1995 title with Hakeem Olajuwon in Houston.",
      "My nickname was Clyde the Glide during my Trail Blazers years.",
      "I was the Houston college Phi Slama Jama star who wore No. 22 in Portland and Houston."
    ],
    "b": [
      "I was a first-round draft pick outside the lottery's very top selections.",
      "I became known for finishing fast breaks spectacularly.",
      "I was named to the NBA's 50th and 75th anniversary teams.",
      "I appeared in a Finals series against the Bad Boy Pistons.",
      "I averaged more than twenty points per game across multiple seasons.",
      "I played on the original U.S. Olympic Dream Team in 1992.",
      "I lost the 1992 NBA Finals to Michael Jordan's Chicago Bulls.",
      "I left Portland to win the 1995 title with the Rockets.",
      "I starred for the Portland Trail Blazers before returning home to Houston.",
      "I was the graceful star nicknamed Clyde the Glide."
    ]
  },
  {
    "name": "Dominique Wilkins",
    "bref": "wilkido01",
    "group": "wing",
    "a": [
      "I made multiple All-NBA teams thanks to consistently elite scoring.",
      "I played in nine NBA All-Star Games during my career.",
      "I finished in the NBA's top three scorers in multiple seasons.",
      "I won a league scoring title during the 1980s.",
      "I twice won the NBA Slam Dunk Contest.",
      "I scored 47 points in Game 7 of a 1988 playoff series but my team lost to Boston.",
      "I returned to elite NBA play after a ruptured Achilles tendon.",
      "I spent most of my NBA career with Atlanta before a surprise move to the Clippers.",
      "I had a legendary 1988 dunk contest duel with Michael Jordan in Chicago.",
      "I was Atlanta's No. 21 star known as the Human Highlight Film."
    ],
    "b": [
      "I was an All-Rookie First Team selection.",
      "I regularly scored more than twenty-five points per game in my prime.",
      "I was selected third overall in my NBA draft.",
      "I starred in an unforgettable duel with Larry Bird in a playoff Game 7.",
      "I became the franchise's all-time leading scorer.",
      "I initially refused to play for the Utah Jazz, who had drafted me in 1982.",
      "I ultimately played NBA games for Atlanta, the Clippers, Boston, San Antonio and Orlando.",
      "I also spent time playing professionally in Greece and Italy.",
      "I became best known for explosive dunks wearing No. 21 for the Atlanta Hawks.",
      "The Human Highlight Film was my lasting nickname."
    ]
  },
  {
    "name": "Dikembe Mutombo",
    "bref": "mutomdi01",
    "group": "big",
    "a": [
      "I became known as one of the league's foremost shot blockers.",
      "I played in eight NBA All-Star Games.",
      "I earned several All-NBA and All-Defensive selections.",
      "I won the NBA's Defensive Player of the Year award four times.",
      "I was selected fourth overall in the 1991 NBA Draft.",
      "I helped an eighth seed defeat a first seed in the 1994 NBA playoffs.",
      "I was famously shown clutching the ball on the floor after Denver upset Seattle.",
      "I reached the 2001 NBA Finals with Philadelphia and Allen Iverson.",
      "My signature celebration was a finger wag after blocking a shot.",
      "I was the Georgetown-trained No. 55 star whose name became synonymous with the finger wag."
    ],
    "b": [
      "I consistently ranked near the league lead in rebounds and blocked shots.",
      "I was selected to multiple All-Defensive First Teams.",
      "I played NBA basketball into my forties.",
      "I earned an NBA rebounding title in two seasons.",
      "I became a four-time Defensive Player of the Year winner.",
      "I played for Denver, Atlanta, Philadelphia, New Jersey, New York and Houston.",
      "I became the first player to win Defensive Player of the Year four times.",
      "I played alongside Allen Iverson in the 2001 Finals against the Lakers.",
      "I was the Congolese Hall of Famer who made the finger wag famous with Denver and Atlanta.",
      "I wore No. 55 while starring at Georgetown and in the NBA."
    ]
  },
  {
    "name": "Alonzo Mourning",
    "bref": "mournal01",
    "group": "big",
    "a": [
      "I made seven NBA All-Star teams.",
      "I became a perennial All-Defensive candidate and feared rim protector.",
      "I led the NBA in blocked shots in consecutive seasons.",
      "I earned All-NBA First Team recognition in 1999.",
      "I won Defensive Player of the Year in two straight seasons.",
      "I was diagnosed with a serious kidney disorder during my career.",
      "I underwent a kidney transplant in 2003 before returning to the NBA.",
      "I won the 2006 championship as a reserve alongside Dwyane Wade and Shaquille O'Neal.",
      "I was a longtime Miami Heat star after beginning with the Charlotte Hornets.",
      "My nickname was Zo, and I wore No. 33 in Miami."
    ],
    "b": [
      "I played for more than one franchise yet became most identified with one.",
      "I was among the league's best shot blockers for years.",
      "I finished as runner-up in MVP voting in 1999.",
      "I made the All-NBA Second Team in 2000.",
      "I was selected second overall in the 1992 NBA Draft.",
      "I partnered with Larry Johnson during the early years of an expansion franchise.",
      "I was traded from Charlotte to Miami in 1995.",
      "I returned to basketball after a kidney transplant.",
      "I starred at Georgetown before becoming a defensive mainstay for the Miami Heat.",
      "I was called Zo and won my first ring with the 2006 Heat."
    ]
  },
  {
    "name": "Larry Johnson",
    "bref": "johnsla02",
    "group": "big",
    "a": [
      "I earned NBA Rookie of the Year honors.",
      "I became a multiple-time All-Star early in my career.",
      "I posted prolific points-and-rebounds totals in my first NBA seasons.",
      "I was selected to the All-NBA Second Team in 1993.",
      "I battled a back injury that changed my style of play.",
      "I was the first overall pick in the 1991 NBA Draft.",
      "I played with Alonzo Mourning on the young Charlotte Hornets.",
      "I hit a memorable four-point play against Indiana in the 1999 playoffs.",
      "I later reached the 1999 NBA Finals with the New York Knicks.",
      "My Converse advertising alter ego was the grandmother known as Grandmama."
    ],
    "b": [
      "I had an immediate impact on an expanding NBA franchise.",
      "I was known for strength, athleticism and rebounding early on.",
      "I made consecutive major league honors during my first seasons.",
      "I was chosen to play in the 1993 and 1995 NBA All-Star Games.",
      "I won the 1990 NCAA championship before entering the NBA.",
      "I played on a celebrated UNLV college team coached by Jerry Tarkanian.",
      "I was traded from Charlotte to New York in 1996.",
      "I helped an eighth-seeded team make the 1999 NBA Finals.",
      "I starred first for the Hornets and later for the Knicks.",
      "My nickname Grandmama came from the Converse commercials I made as a Charlotte star."
    ]
  },
  {
    "name": "Glen Rice",
    "bref": "ricegl01",
    "group": "wing",
    "a": [
      "I became a reliable outside shooter and prolific scorer.",
      "I was selected for three NBA All-Star Games.",
      "I led my team in scoring during multiple seasons.",
      "I won the All-Star Game MVP award in 1997.",
      "I won an NBA three-point contest.",
      "I was drafted fourth overall by Miami in 1989.",
      "I was traded to Charlotte in a deal for Alonzo Mourning.",
      "I joined the Lakers before their three-peat and won the title in 2000.",
      "I won the NCAA championship at Michigan before playing for the Miami Heat and Hornets.",
      "I became an NBA champion with Shaquille O'Neal and Kobe Bryant on the 2000 Lakers."
    ],
    "b": [
      "I developed into an All-Star after several productive seasons.",
      "I scored efficiently from beyond the arc during my prime.",
      "I was the 1989 NCAA tournament's Most Outstanding Player.",
      "I made my first NBA All-Star appearance in 1996.",
      "I helped win Michigan's first men's basketball national championship.",
      "I scored 26 points as the MVP of the 1997 All-Star Game.",
      "I was acquired by Los Angeles in a trade involving Eddie Jones and Elden Campbell.",
      "I played in the 2000 Finals against Indiana.",
      "I starred in Miami and Charlotte before becoming a Lakers champion.",
      "I was the sharpshooting Michigan Wolverine who won the 1997 All-Star MVP."
    ]
  },
  {
    "name": "Tim Hardaway",
    "bref": "hardati01",
    "group": "guard",
    "a": [
      "I earned five NBA All-Star selections.",
      "I was selected to multiple All-NBA teams during my prime.",
      "I was named to the All-NBA First Team in 1997.",
      "I became a high-volume assist producer early in my career.",
      "I was a centerpiece of a three-player, high-scoring offensive trio.",
      "I helped Miami reach the Eastern Conference Finals in 1997.",
      "I played alongside Alonzo Mourning under coach Pat Riley.",
      "I spent my early career with Golden State before a 1996 trade to Miami.",
      "I teamed with Mitch Richmond and Chris Mullin on the Warriors' Run TMC.",
      "My signature crossover was called the UTEP Two-Step."
    ],
    "b": [
      "I entered the NBA as a mid-first-round draft pick.",
      "I built a reputation for creative ball handling and shot creation.",
      "I made the All-Rookie First Team.",
      "I recorded repeated seasons of more than nine assists per game.",
      "I was chosen fourteenth overall in the 1989 NBA Draft.",
      "I won Olympic gold with the United States in 2000.",
      "I finished fourth in the league MVP voting in 1997.",
      "I was part of Miami's bruising late-1990s playoff battles with New York.",
      "I was the original Tim Hardaway from the Warriors and Heat, not my NBA-playing son.",
      "I was the Run TMC guard whose crossover became the UTEP Two-Step."
    ]
  },
  {
    "name": "Michael Finley",
    "bref": "finlemi01",
    "group": "wing",
    "a": [
      "I earned two NBA All-Star selections.",
      "I developed into an effective volume scorer and reliable long-range shooter.",
      "I spent more than a decade as a starter.",
      "I recorded several seasons averaging more than twenty points.",
      "I was selected twenty-first overall in the 1995 NBA Draft.",
      "I was included in a trade that sent Jason Kidd to Phoenix.",
      "I was part of a talented Dallas trio with Dirk Nowitzki and Steve Nash.",
      "I joined San Antonio after leaving Dallas in 2005.",
      "I won the 2007 NBA championship with the Spurs.",
      "I was the No. 4 Mavericks scorer who shared the floor with Nowitzki and Nash."
    ],
    "b": [
      "I was selected to the NBA All-Rookie First Team.",
      "I gradually grew into an All-Star after a trade early in my career.",
      "I regularly played heavy minutes at my peak.",
      "I became an All-Star in 2000 and 2001.",
      "I started my NBA career with Phoenix before a move to Dallas.",
      "I scored more than twenty points a game in the 1999-2000 season.",
      "I played alongside Tim Duncan, Tony Parker and Manu Ginóbili later in my career.",
      "I helped San Antonio beat Cleveland in the 2007 Finals.",
      "I starred at Wisconsin before becoming a leading Dallas Mavericks scorer.",
      "I was Michael Finley, the former Suns draft pick who became a 2007 Spurs champion."
    ]
  },
  {
    "name": "Antoine Walker",
    "bref": "walkean02",
    "group": "big",
    "a": [
      "I became an NBA All-Star on three occasions.",
      "I was a prolific rebounder and willing three-point shooter.",
      "I averaged more than twenty points per game in multiple seasons.",
      "I helped my team reach a conference final in the early 2000s.",
      "I was a first-round pick in 1996.",
      "I was the teammate of Paul Pierce during Boston's 2002 playoff run.",
      "I played for Dallas before returning briefly to Boston.",
      "I joined Miami and won the 2006 NBA championship.",
      "I was the former Kentucky champion known for scoring and shooting threes for the Celtics.",
      "My signature celebration was a shoulder shimmy after a big shot."
    ],
    "b": [
      "I entered the league with considerable expectations after college success.",
      "I was regularly involved as both a scorer and playmaker.",
      "I earned All-Star selections in 1998, 2002 and 2003.",
      "I averaged more than eight rebounds over several seasons.",
      "I won the 1996 NCAA national championship with Kentucky.",
      "I was the sixth overall selection of the Boston Celtics that year.",
      "I was traded to Dallas in 2003 and later played in Atlanta.",
      "I became a starter for the 2006 championship-winning Miami Heat.",
      "I wore No. 8 while forming a star partnership with Paul Pierce in Boston.",
      "I was the Celtics star known for the shimmy and later a Miami Heat champion."
    ]
  },
  {
    "name": "Richard Hamilton",
    "bref": "hamilri01",
    "group": "wing",
    "a": [
      "I made three consecutive NBA All-Star teams.",
      "I was renowned for constant movement and midrange jump shooting.",
      "I won an NBA championship as a starting player.",
      "I was a leading scorer on a team with multiple outstanding defenders.",
      "I entered the NBA as the seventh overall pick in 1999.",
      "I was traded for Jerry Stackhouse in 2002.",
      "I helped defeat a star-studded Lakers team in the 2004 NBA Finals.",
      "I reached six straight conference finals while playing for Detroit.",
      "I was the masked scoring specialist for the championship-era Pistons.",
      "My nickname was Rip, and I wore a protective face mask through much of my Detroit career."
    ],
    "b": [
      "I won a national championship before entering professional basketball.",
      "I earned multiple All-Star selections only after a change of teams.",
      "I became famous for running defenders through screens.",
      "I was named the Final Four Most Outstanding Player in 1999.",
      "I played my first NBA seasons for Washington.",
      "I shared a 2004 championship starting lineup with Chauncey Billups and Ben Wallace.",
      "I played against San Antonio in the 2005 NBA Finals.",
      "I finished my career with the Chicago Bulls after leaving Detroit.",
      "I won the 1999 NCAA title at Connecticut and the 2004 NBA title with the Pistons.",
      "I was the masked Pistons shooter nicknamed Rip Hamilton."
    ]
  },
  {
    "name": "Chauncey Billups",
    "bref": "billuch01",
    "group": "guard",
    "a": [
      "I had several early-career stops before establishing myself as an All-Star.",
      "I was respected for shooting and guiding organized half-court offenses.",
      "I made five straight NBA All-Star teams in the later part of my career.",
      "I received All-NBA Second Team recognition in 2006.",
      "I won a Finals MVP award.",
      "I joined Detroit as a free agent in 2002.",
      "I led a balanced Pistons team past the Lakers in the 2004 NBA Finals.",
      "I later returned to Denver and reached the 2009 Western Conference Finals.",
      "I was the No. 1 point guard of Detroit's 2004 championship team.",
      "My clutch reputation earned me the nickname Mr. Big Shot."
    ],
    "b": [
      "I developed into a leader after changing teams multiple times.",
      "I earned a reputation for steady decision-making in big games.",
      "I was a first-round pick who found his best form well after his debut.",
      "I was named to NBA All-Defensive teams during my prime.",
      "I was chosen third overall in the 1997 NBA Draft.",
      "I played college basketball at Colorado.",
      "I won the 2004 Finals MVP award for a team that had no dominant single scorer.",
      "I shared Detroit's title-winning backcourt with Richard Hamilton.",
      "I won a championship against Kobe Bryant and Shaquille O'Neal with the Pistons.",
      "I was the Colorado-born guard called Mr. Big Shot who led Detroit in 2004."
    ]
  },
  {
    "name": "Alonzo Mourning",
    "bref": "mournal01",
    "group": "big",
    "a": [
      "I earned NBA All-Rookie First Team honors.",
      "I was a multiple-time All-Star and an intimidating interior defender.",
      "I was named to both All-NBA and All-Defensive teams.",
      "I led the league in blocked shots more than once.",
      "I won back-to-back Defensive Player of the Year awards.",
      "I received a kidney transplant after a serious medical diagnosis threatened my career.",
      "I returned to NBA basketball after the transplant and earned a championship.",
      "I won the 2006 NBA title as a veteran reserve with Miami.",
      "I was the longtime Miami Heat No. 33 enforcer known as Zo.",
      "I formed a celebrated Georgetown frontcourt lineage with Patrick Ewing and Dikembe Mutombo."
    ],
    "b": [
      "I was drafted near the top of the first round and immediately contributed.",
      "I averaged at least twenty points in several of my early seasons.",
      "I became a seven-time NBA All-Star.",
      "I was selected second overall in the 1992 NBA Draft.",
      "I received All-NBA First Team honors in 1999.",
      "I began my NBA career with the Charlotte Hornets before joining Miami.",
      "I battled the Knicks in a series of bitter late-1990s playoffs.",
      "I won an Olympic gold medal with the United States in 2000.",
      "I returned from kidney disease to help Dwyane Wade and Shaq win Miami's first NBA title.",
      "I was the Heat shot blocker Alonzo 'Zo' Mourning, who wore No. 33."
    ]
  },
  {
    "name": "Larry Johnson",
    "bref": "johnsla02",
    "group": "big",
    "a": [
      "I won Rookie of the Year after an exceptionally productive debut.",
      "I was selected to the NBA All-Rookie First Team.",
      "I earned multiple NBA All-Star selections.",
      "I was named to the All-NBA Second Team early in my career.",
      "I was chosen first overall in the 1991 NBA Draft.",
      "I was part of a young frontcourt tandem with Alonzo Mourning in Charlotte.",
      "I battled serious back injuries that changed the way I played.",
      "I later reached the NBA Finals as a New York Knick in 1999.",
      "I hit a memorable four-point play against Indiana in the 1999 Eastern Conference finals.",
      "I became famous as the Hornets star who played the 'Grandmama' character in ads."
    ],
    "b": [
      "I played a particularly physical inside-out offensive style.",
      "I was a two-time NBA All-Star.",
      "I averaged more than twenty points in each of my first two NBA seasons.",
      "I earned All-NBA honors before later changing franchises.",
      "I helped win an NCAA national championship in 1990.",
      "I was the 1991 top draft choice after winning national player awards at UNLV.",
      "I began in Charlotte with Muggsy Bogues and Alonzo Mourning.",
      "I joined the Knicks and reinvented my game as injuries reduced my explosiveness.",
      "I scored a four-point play in the final seconds against the Pacers during the Knicks' 1999 playoff run.",
      "I was Charlotte's Grandmama, the No. 2 star who later wore No. 2 for the Knicks."
    ]
  },
  {
    "name": "Glen Rice",
    "bref": "ricegl01",
    "group": "wing",
    "a": [
      "I developed into an effective high-volume jump shooter.",
      "I became an NBA All-Star in the prime of my career.",
      "I averaged more than twenty points per game in multiple seasons.",
      "I led the NBA in three-point percentage during one season.",
      "I received All-NBA Second Team honors in 1997.",
      "I was named the 1997 NBA All-Star Game MVP after a major scoring outburst.",
      "I began my NBA career with Miami and later became a Hornets standout.",
      "I joined the Los Angeles Lakers and won the 2000 NBA championship.",
      "I set an All-Star Game record at the time with twenty points in a quarter in 1997.",
      "I was the Michigan national champion who became a sharpshooter for the Hornets and Lakers."
    ],
    "b": [
      "I was a first-round draft choice who started many games as a rookie.",
      "I scored efficiently from long range before the modern three-point boom.",
      "I earned three NBA All-Star selections.",
      "I was a key college scorer on a national championship team.",
      "I helped Michigan win the 1989 NCAA title and was named the Final Four Most Outstanding Player.",
      "I was traded from the Heat to Charlotte in a deal involving Alonzo Mourning.",
      "I scored 26 points in the third quarter of the 1997 All-Star Game.",
      "I played beside Shaquille O'Neal and Kobe Bryant in a championship season.",
      "I won my only NBA championship with the 1999-2000 Lakers.",
      "I was the 1997 All-Star MVP Glen Rice, famous in Charlotte for my outside shooting."
    ]
  },
  {
    "name": "Tim Hardaway",
    "bref": "hardati01",
    "group": "guard",
    "a": [
      "I was selected to the NBA All-Rookie First Team.",
      "I made five NBA All-Star teams during my career.",
      "I earned All-NBA honors in multiple seasons.",
      "I averaged more than ten assists per game in a season.",
      "I was selected fourteenth in the 1989 NBA Draft.",
      "I was part of an exciting trio named for its three players' first names.",
      "I moved to Miami after building an All-Star reputation with Golden State.",
      "I earned All-NBA First Team recognition in 1997 as a Miami Heat player.",
      "I formed Run TMC with Mitch Richmond and Chris Mullin on the Warriors.",
      "I was the former Warriors and Heat point guard famous for the killer crossover, not my NBA-player son."
    ],
    "b": [
      "I was a dynamic ball handler and playmaker.",
      "I was regularly among the league's assist leaders in my prime.",
      "I helped a team become a major Eastern Conference contender.",
      "I won an Olympic gold medal with Team USA in 2000.",
      "I earned All-NBA First Team honors once and Second Team honors three times.",
      "I scored 32 points in a 1991 playoff win against the Lakers.",
      "I joined forces with Alonzo Mourning under Pat Riley in Miami.",
      "I helped the Heat reach the 1997 Eastern Conference finals.",
      "I began my career wearing No. 10 with Golden State and later wore No. 10 in Miami.",
      "My trademark UTEP two-step crossover earned me recognition long before Tim Hardaway Jr. reached the NBA."
    ]
  },
  {
    "name": "Michael Finley",
    "bref": "finlemi01",
    "group": "wing",
    "a": [
      "I earned an All-Rookie First Team spot early in my career.",
      "I was a durable scorer who regularly played heavy minutes.",
      "I became a two-time NBA All-Star.",
      "I made his first All-Star team while playing beside a future MVP.",
      "I began my career as a first-round selection in 1995.",
      "I was traded from Phoenix to Dallas as part of a deal involving Jason Kidd.",
      "I became a primary scorer for the Mavericks before their championship era.",
      "I played alongside Steve Nash and Dirk Nowitzki in Dallas.",
      "I won the 2007 NBA title as a member of the San Antonio Spurs.",
      "I was the Wisconsin product and longtime Mavericks No. 4 scorer Michael Finley."
    ],
    "b": [
      "I was known for consistent scoring and strong midrange offense.",
      "I eventually became a useful veteran shooter on a championship club.",
      "I was chosen for the All-Star Game in consecutive seasons.",
      "I was drafted twenty-first overall and traded after my rookie year.",
      "I started my NBA career with the Phoenix Suns.",
      "I averaged a career-high 22.6 points in the 1999-2000 season.",
      "I reached the 2006 NBA Finals with Dallas but had already left the team.",
      "I helped San Antonio beat Cleveland in the 2007 Finals.",
      "I was part of Dallas's early-2000s offensive trio with Nash and Nowitzki.",
      "I spent nine seasons with the Mavericks and won a ring with the Spurs."
    ]
  },
  {
    "name": "Antoine Walker",
    "bref": "walkean02",
    "group": "big",
    "a": [
      "I earned multiple NBA All-Star berths during my career.",
      "I was known for taking an unusually large number of three-pointers for a frontcourt player.",
      "I regularly combined scoring, rebounding and passing.",
      "I became a three-time NBA All-Star.",
      "I was a high lottery pick in the 1996 NBA Draft.",
      "I helped a team reach the 2002 Eastern Conference finals.",
      "I played alongside Paul Pierce for the Boston Celtics.",
      "I spent part of my career in Dallas before returning briefly to Boston.",
      "I won a championship in 2006 with Dwyane Wade and Shaquille O'Neal in Miami.",
      "I became famous as the shimmying No. 8 Boston Celtics star known as Toine."
    ],
    "b": [
      "I immediately made the NBA All-Rookie First Team.",
      "I scored more than twenty points per game in several seasons.",
      "I was an All-Star before my team became an Eastern contender.",
      "I was the sixth overall pick in a draft rich with future stars.",
      "I won the 1996 NCAA championship as a Kentucky Wildcat.",
      "I developed an unconventional outside shot despite playing many minutes in the frontcourt.",
      "I reached the 2002 conference finals with the Celtics and Paul Pierce.",
      "I averaged 12.2 points in the 2006 playoffs en route to an NBA title with Miami.",
      "I wore No. 8 for Boston and was recognized for my shoulder-shaking shimmy.",
      "I was the Celtics' Antoine 'Toine' Walker before winning a Heat championship."
    ]
  },
  {
    "name": "Richard Hamilton",
    "bref": "hamilri01",
    "group": "wing",
    "a": [
      "I developed into a reliable scorer without relying on heavy three-point volume.",
      "I earned multiple NBA All-Star selections.",
      "I became particularly effective moving without the ball.",
      "I made three consecutive NBA All-Star teams in my prime.",
      "I was a first-round draft pick in 1999.",
      "I moved to Detroit in a major trade that sent Jerry Stackhouse to Washington.",
      "I helped Detroit reach six straight Eastern Conference finals.",
      "I led Detroit in scoring during its 2004 title run.",
      "I was the Pistons guard who wore a protective face mask after breaking his nose.",
      "I was known as Rip Hamilton, a key scorer on the 2004 champion Detroit Pistons."
    ],
    "b": [
      "I made an immediate impact during a championship run after changing teams.",
      "I was widely respected for stamina and nonstop off-ball movement.",
      "I became an All-Star only after winning a championship.",
      "I was drafted seventh overall after a successful college career.",
      "I led Connecticut to the 1999 NCAA championship and won the Final Four Most Outstanding Player award.",
      "I spent my early NBA seasons with the Washington Wizards.",
      "I played alongside Chauncey Billups, Ben Wallace and Rasheed Wallace in Detroit.",
      "I scored 21.4 points per game in the 2004 Finals win over Los Angeles.",
      "I became a familiar masked No. 32 figure for the Detroit Pistons.",
      "I was the smooth-shooting UConn alumnus called Rip Hamilton."
    ]
  },
  {
    "name": "Chauncey Billups",
    "bref": "billuch01",
    "group": "guard",
    "a": [
      "I eventually made multiple NBA All-Star teams after a slow start to my career.",
      "I developed a reputation for trustworthy decision-making late in games.",
      "I received both All-NBA and All-Defensive selections during my prime.",
      "I was selected for five consecutive NBA All-Star Games.",
      "I was the third overall pick in the 1997 NBA Draft.",
      "I played for several franchises before becoming a championship team leader.",
      "I guided Detroit to consecutive Finals appearances in 2004 and 2005.",
      "I won the 2004 NBA Finals MVP award after an upset of the Lakers.",
      "I was the Detroit Pistons leader known as Mr. Big Shot.",
      "I wore No. 1 as the Finals MVP on Detroit's 2004 championship team."
    ],
    "b": [
      "I began my career with several team changes before establishing myself.",
      "I was valued as a floor leader and late-game free-throw shooter.",
      "I made an All-NBA Second Team in the middle of the 2000s.",
      "I won the league's sportsmanship award in 2009.",
      "I played for Boston, Toronto, Denver and Minnesota before moving to Detroit.",
      "I became the starting leader on the Pistons' defensive-minded championship team.",
      "I returned to Denver and helped the Nuggets reach the 2009 Western Conference finals.",
      "I scored 27 points in the clinching Game 5 of the 2004 Finals.",
      "I was known as Mr. Big Shot while playing alongside the two Wallaces in Detroit.",
      "My 2004 Finals MVP came while I guided the Pistons past Shaq and Kobe's Lakers."
    ]
  },
  {
    "name": "Ben Wallace",
    "bref": "wallabe01",
    "group": "big",
    "history": "https://www.nba.com/watch/video/ben-wallace-career-retrospective",
    "a": [
      "I became an All-Star despite entering the league undrafted.",
      "I was valued far more for defense and rebounding than scoring.",
      "I earned multiple All-Defensive First Team selections.",
      "I was the league's leading rebounder in more than one season.",
      "I won the Defensive Player of the Year award four times.",
      "I was a starting member of the 2004 NBA championship team.",
      "I helped Detroit upset a Lakers roster featuring four future Hall of Famers.",
      "I played beside Rasheed Wallace on the Pistons' interior defense.",
      "I was the undrafted defensive cornerstone called Big Ben in Detroit.",
      "My No. 3 Pistons jersey was retired after four Defensive Player of the Year awards."
    ],
    "b": [
      "I worked my way from the fringes of the NBA into a starting role.",
      "I was known for limiting opposing stars without needing plays run for me.",
      "I was named an NBA All-Star four times.",
      "I led the NBA in blocks during the 2001-02 season.",
      "I began my career with Washington before playing in Orlando.",
      "I played college basketball at Virginia Union after attending a junior college.",
      "I reached consecutive NBA Finals with Detroit in 2004 and 2005.",
      "I later played for Chicago and Cleveland before returning to the Pistons.",
      "I won the 2004 championship alongside Chauncey Billups and Richard Hamilton.",
      "I was the iconic afro-wearing, undrafted center known as Big Ben Wallace."
    ]
  },
  {
    "name": "Rasheed Wallace",
    "bref": "wallara01",
    "group": "big",
    "a": [
      "I was selected to four NBA All-Star Games.",
      "I was a versatile scorer who could shoot from distance and defend inside.",
      "I played in several deep postseason runs.",
      "I was a strong contributor to a championship roster.",
      "I was drafted fourth overall in 1995.",
      "I helped Portland reach the 2000 Western Conference Finals.",
      "I played one game for Atlanta in 2004 before being moved again.",
      "I won the 2004 NBA championship shortly after arriving in Detroit.",
      "I formed the Pistons' championship front line with Ben Wallace.",
      "My catchphrase was 'Ball don't lie,' and fans called me Sheed."
    ],
    "b": [
      "I earned the NBA All-Rookie Second Team honor.",
      "I competed in the playoffs with different title-contending teams.",
      "I could score in the post while also spacing the floor.",
      "I made the All-Star team for more than one franchise.",
      "I spent most of my first decade in Portland.",
      "I was part of the Trail Blazers team that lost Game 7 to the Lakers in 2000.",
      "I was traded twice within days during the 2003-04 season.",
      "I reached the 2010 NBA Finals with Boston after my title years in Detroit.",
      "I wore No. 36 during the Pistons' 2004 championship run.",
      "I was Rasheed 'Sheed' Wallace, known for 'Ball don't lie' in Detroit."
    ]
  },
  {
    "name": "Baron Davis",
    "bref": "davisba01",
    "group": "guard",
    "a": [
      "I earned two NBA All-Star selections.",
      "I was an attacking playmaker who also produced high steal totals.",
      "I led the NBA in steals in more than one season.",
      "I was chosen third overall in the 1999 NBA Draft.",
      "I became known for explosive transition dunks as well as assists.",
      "I helped an eighth-seeded team upset a top seed in the playoffs.",
      "I was the central star of Golden State's 2007 We Believe run.",
      "I made a famous poster dunk over Andrei Kirilenko during the 2007 playoffs.",
      "I starred for Charlotte and New Orleans before joining the Warriors.",
      "My high-energy Warriors persona earned me the nickname Boom Dizzle."
    ],
    "b": [
      "I made an All-Rookie First Team.",
      "I established myself as a scorer and creator in the backcourt.",
      "I averaged more than seven assists in several NBA seasons.",
      "I played in back-to-back All-Star Games early in my career.",
      "I played college basketball at UCLA before turning pro.",
      "I became a franchise leader after the Hornets relocated to New Orleans.",
      "I signed with the Los Angeles Clippers after my playoff breakthrough.",
      "I finished my NBA career after stints in Cleveland and New York.",
      "I led the Warriors past the top-seeded Mavericks in 2007.",
      "I was the No. 5 Golden State playmaker of the We Believe upset."
    ]
  },
  {
    "name": "Peja Stojaković",
    "bref": "stojape01",
    "group": "wing",
    "a": [
      "I became an NBA All-Star three times.",
      "I developed into one of the league's most dangerous perimeter shooters.",
      "I was chosen for an All-NBA Second Team.",
      "I finished among the top five of league MVP voting.",
      "I won two consecutive NBA three-point contests.",
      "I played a pivotal role in a team that challenged the Lakers in the 2002 playoffs.",
      "I later joined a championship team as a veteran long-range specialist.",
      "I won the 2011 NBA Finals with Dirk Nowitzki's Dallas Mavericks.",
      "I starred for Sacramento during its early-2000s run with Chris Webber and Vlade Divac.",
      "My No. 16 was retired by the Kings after a career known for three-point shooting."
    ],
    "b": [
      "I was selected in the first round but did not immediately enter the NBA.",
      "I built my career around a quick and accurate shooting release.",
      "I earned an All-NBA selection during my highest-scoring season.",
      "I averaged more than twenty-four points per game in a season.",
      "I was drafted fourteenth overall in 1996.",
      "I played professionally in Greece before joining Sacramento.",
      "I later played for Indiana and New Orleans before my final NBA season.",
      "I helped Dallas eliminate the defending champion Lakers in 2011.",
      "I was part of the Sacramento Kings team that lost a seven-game 2002 West final.",
      "I was the Serbian sharpshooter nicknamed Peja on both the Kings and Mavericks."
    ]
  },
  {
    "name": "Jermaine O'Neal",
    "bref": "onealje01",
    "group": "big",
    "a": [
      "I became a six-time NBA All-Star after starting as a reserve.",
      "I was a strong rebounder and shot blocker in my prime.",
      "I earned three All-NBA selections.",
      "I won the league's Most Improved Player award.",
      "I finished third in regular-season MVP voting in 2004.",
      "I entered the league directly from high school as a teenager.",
      "I broke out after a trade from Portland to Indiana.",
      "I played a major role in the Pacers' Eastern Conference Finals appearance in 2004.",
      "I wore No. 7 as the face of the early-2000s Indiana Pacers.",
      "I was Jermaine O'Neal, not my fellow NBA star Shaquille O'Neal."
    ],
    "b": [
      "I developed more slowly than my eventual All-Star reputation suggests.",
      "I built my success on interior scoring and defensive presence.",
      "I became an All-Star in six consecutive seasons.",
      "I made the All-NBA Second Team in 2004.",
      "I was selected seventeenth overall in the 1996 NBA Draft.",
      "I spent the beginning of my professional career behind established veterans in Portland.",
      "I became a central figure on a Pacers team coached by Rick Carlisle.",
      "I was one of the players suspended after the 2004 Malice at the Palace.",
      "I later played for Miami, Toronto, Boston, Phoenix and Golden State.",
      "My greatest NBA years came in Indiana, where I wore No. 7 and won Most Improved Player."
    ]
  },
  {
    "name": "Shawn Marion",
    "bref": "mariosh01",
    "group": "wing",
    "a": [
      "I was chosen for four NBA All-Star Games.",
      "I was prized for versatile defense, rebounding and finishing in transition.",
      "I earned an All-NBA Third Team selection in my prime.",
      "I regularly recorded double-doubles while guarding multiple positions.",
      "I became a cornerstone of a rapid-paced offense.",
      "I played with Steve Nash and Amar'e Stoudemire on a prominent Phoenix team.",
      "I was traded from Phoenix to Miami in the 2008 Shaquille O'Neal deal.",
      "I defended LeBron James during Dallas's 2011 championship run.",
      "I won the 2011 NBA title alongside Dirk Nowitzki.",
      "My nickname was the Matrix, and I was a mainstay of the Seven Seconds or Less Suns."
    ],
    "b": [
      "I was a first-round draft pick who soon became a regular starter.",
      "I was an athletic rebounder with a notably unconventional jump shot.",
      "I made four All-Star appearances during the 2000s.",
      "I recorded more than ten rebounds per game in several seasons.",
      "I was chosen ninth overall in the 1999 NBA Draft.",
      "I played at UNLV before beginning my professional career.",
      "I was selected for the 2004 U.S. Olympic team.",
      "I played for Toronto and Miami between my Phoenix and Dallas years.",
      "I was an essential defensive wing for the 2011 Dallas Mavericks.",
      "I was the Phoenix Suns star known as the Matrix before winning with Dallas."
    ]
  },
  {
    "name": "Yao Ming",
    "bref": "mingya01",
    "group": "big",
    "a": [
      "I became an NBA All-Star immediately after entering the league.",
      "I developed a reliable midrange touch and soft shooting form for a very tall player.",
      "I received multiple All-NBA selections.",
      "I was limited by significant foot and ankle injuries in later seasons.",
      "I was selected first overall in the 2002 NBA Draft.",
      "I made eight NBA All-Star teams despite an injury-shortened career.",
      "I led my team past Portland in a first-round playoff series in 2009.",
      "I formed a Houston Rockets star partnership with Tracy McGrady.",
      "I was the 7-foot-6 Rockets star who arrived from the Shanghai Sharks.",
      "I became the first Chinese player selected No. 1 overall in the NBA Draft."
    ],
    "b": [
      "I was selected for the NBA All-Rookie First Team.",
      "I combined post scoring, shot blocking and accurate free throws.",
      "I earned five All-NBA selections.",
      "I repeatedly ranked among the highest vote-getters for All-Star starting spots.",
      "I began my NBA career after playing professionally in Asia.",
      "I won multiple domestic league honors with the Shanghai Sharks.",
      "I spent my entire NBA career with the Houston Rockets.",
      "I retired after persistent injuries following the 2010-11 season.",
      "I represented China internationally and stood 7 feet 6 inches tall.",
      "I wore No. 11 for Houston and entered the Basketball Hall of Fame in 2016."
    ]
  },
  {
    "name": "Tony Allen",
    "bref": "allento01",
    "group": "guard",
    "a": [
      "I entered the NBA as a first-round pick and earned a championship early in my career.",
      "I became most valuable as a defender rather than a primary scorer.",
      "I received six NBA All-Defensive team selections.",
      "I was an important perimeter stopper for multiple playoff teams.",
      "I was selected twenty-fifth overall in the 2004 NBA Draft.",
      "I won the 2008 NBA championship as a Boston Celtics reserve.",
      "I joined Memphis in 2010 and helped build its defense-first identity.",
      "I helped Memphis reach its first Western Conference Finals in 2013.",
      "I was known as the Grindfather on the Grizzlies' Grit and Grind teams.",
      "I was the No. 9 Memphis defensive ace who called himself the Grindfather."
    ],
    "b": [
      "I was an athletic defender with an important role on successful clubs.",
      "I earned All-Defensive First Team honors in multiple seasons.",
      "I was not known for leading my teams in scoring.",
      "I became a vital part of a team built on physical, deliberate basketball.",
      "I played college basketball at Oklahoma State before the NBA.",
      "I won a title alongside Paul Pierce, Kevin Garnett and Ray Allen.",
      "I formed a defensive partnership with Marc Gasol after leaving Boston.",
      "I drew difficult matchups against top Western Conference perimeter stars.",
      "I played on Memphis teams with Mike Conley and Zach Randolph.",
      "I was the former Celtics champion whose nickname the Grindfather fit Memphis's Grit and Grind era."
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
