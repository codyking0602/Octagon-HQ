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
      "I won Olympic gold with the United States men's national basketball team.",
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
      "I entered the league as a lottery selection following a college career.",
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
      "I joined San Antonio during the 2013 playoffs and was on a team that reached the Finals.",
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
      "I was a first-round pick who found a bigger role several seasons into my career.",
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
      "I entered the league as a high lottery pick.",
      "I shared a major rookie honor rather than winning it alone.",
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
      "I was selected to three straight All-Star Games.",
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
      "I made the All-NBA First Team during my early-career peak.",
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
      "I became an All-Star starter during my rookie season.",
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
      "I arrived in the NBA as a highly anticipated lottery selection.",
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
    "a": [
      "I was voted Rookie of the Year after my debut season.",
      "I became a multiple-time All-Star and All-NBA selection.",
      "I earned All-NBA First Team honors after developing into a franchise centerpiece.",
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
      "I entered the league as an early first-round selection.",
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
      "I was drafted just outside the top ten picks.",
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
      "I won an international gold medal representing the United States.",
      "I entered the NBA as a teenager after an unconventional path.",
      "I was a major part of a team that won more than fifty games repeatedly.",
      "I scored twenty or more points per game in two consecutive seasons after a trade.",
      "I played against Dennis Rodman in an NBA Finals series.",
      "I was sent from Seattle to Cleveland in a major 1997 trade.",
      "I formed a celebrated alley-oop partnership with Gary Payton in Seattle.",
      "I became famous for my high-flying dunks in Seattle as the Reign Man."
    ]
  },
  {
    "name": "Gary Payton",
    "bref": "paytoga01",
    "group": "guard",
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
      "I earned an All-NBA First Team selection during my prime.",
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
      "I won Olympic gold twice with the United States.",
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
      "I spent two seasons serving in the military before debuting in the NBA.",
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
      "I recorded one of the rare quadruple-doubles in NBA history.",
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
    "a": [
      "I earned All-Rookie First Team honors before becoming a perennial All-Star.",
      "I ranked among the league's most efficient high-volume scorers and rebounders.",
      "I received repeated All-NBA First Team recognition while anchoring my team's attack.",
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
      "I received an NBA All-Star Game MVP award.",
      "I averaged more than twenty points and ten rebounds over my career.",
      "I was selected fifth overall in the famous 1984 draft.",
      "I starred for the Philadelphia 76ers beside Moses Malone and Julius Erving.",
      "I won Olympic gold with the 1992 Dream Team and again in 1996.",
      "My Phoenix team won 62 games in 1992-93 before losing the Finals.",
      "I won my lone league MVP as a member of the Phoenix Suns.",
      "I was the outspoken Auburn alum called Sir Charles and the Round Mound of Rebound."
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
      "I became an Olympic gold medalist on more than one occasion.",
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
      "I helped lead a team during an extended absence by its biggest scorer.",
      "I was involved in a draft-night trade early in my professional career.",
      "I earned a place on the original 1992 U.S. Olympic Dream Team.",
      "I played college basketball at Central Arkansas before being selected fifth in the 1987 draft.",
      "I posted a famous triple-double in Game 6 of the 1992 Finals.",
      "I helped Portland reach a conference final against the Lakers in 2000.",
      "I won six championships alongside Michael Jordan and coach Phil Jackson in Chicago.",
      "I became the famous No. 33 Chicago Bulls partner to Jordan."
    ],
    "history": "https://www.nba.com/news/archive-75-scottie-pippen"
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
    ],
    "history": "https://www.nba.com/news/archive-75-dennis-rodman"
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
      "I was named to the NBA's fiftieth anniversary team.",
      "I was a first-round pick outside the very top of the draft.",
      "I averaged more than twenty points per game across multiple seasons.",
      "I played on the original U.S. Olympic Dream Team in 1992.",
      "I lost the 1992 NBA Finals to Michael Jordan's Chicago Bulls.",
      "I left Portland to win the 1995 title with the Rockets.",
      "I starred for the Portland Trail Blazers before returning home to Houston.",
      "I was the graceful star nicknamed Clyde the Glide."
    ],
    "history": "https://www.nba.com/news/archive-75-clyde-drexler"
  },
  {
    "name": "Dominique Wilkins",
    "bref": "wilkido01",
    "group": "wing",
    "a": [
      "I made multiple All-NBA teams thanks to consistently elite scoring.",
      "I played in nine NBA All-Star Games during my career.",
      "I finished in the NBA's top three scorers in multiple seasons.",
      "I won a league scoring title during the middle of my career.",
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
      "I entered the league as a highly regarded lottery selection.",
      "I spent long stretches as one of the league's highest-volume scorers.",
      "I became the franchise's all-time leading scorer.",
      "I initially refused to play for the Utah Jazz, who had drafted me in 1982.",
      "I ultimately played NBA games for Atlanta, the Clippers, Boston, San Antonio and Orlando.",
      "I also spent time playing professionally in Greece and Italy.",
      "I became best known for explosive dunks wearing No. 21 for the Atlanta Hawks.",
      "I became an Atlanta icon nicknamed the Human Highlight Film."
    ],
    "history": "https://www.nba.com/news/archive-75-dominique-wilkins"
  },
  {
    "name": "Dikembe Mutombo",
    "bref": "mutomdi01",
    "group": "big",
    "a": [
      "I became known as one of the league's foremost shot blockers.",
      "I reached eight All-Star Games while anchoring interior defenses.",
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
      "I earned an NBA rebounding title in two different seasons.",
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
      "I earned All-NBA honors during my peak.",
      "I earned All-NBA First Team honors during a deep playoff stretch.",
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
      "I produced several seasons above twenty points per game on efficient shooting.",
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
      "I scored twenty points during the third quarter of the 1997 NBA All-Star Game.",
      "I played beside Shaquille O'Neal and Kobe Bryant in a championship season.",
      "I won my only NBA championship with the 1999-2000 Lakers.",
      "I was the 1997 All-Star MVP celebrated in Charlotte for my elite outside shooting."
    ]
  },
  {
    "name": "Tim Hardaway",
    "bref": "hardati01",
    "group": "guard",
    "a": [
      "I joined the All-Rookie First Team before emerging as a perennial assist leader.",
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
      "I won an Olympic gold medal with Team USA.",
      "I scored 32 points as Golden State eliminated San Antonio in a 1991 playoff series.",
      "I scored 32 points in a 1991 playoff win against the Lakers.",
      "I joined forces with Alonzo Mourning under Pat Riley in Miami.",
      "I helped the Heat reach the 1997 Eastern Conference finals.",
      "I developed the killer crossover while starring for the Warriors and Heat.",
      "My trademark UTEP Two-Step crossover became famous long before my son entered the NBA."
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
      "I made my first All-Star team while playing beside a future MVP.",
      "I began my career as a first-round selection in 1995.",
      "I was traded from Phoenix to Dallas as part of a deal involving Jason Kidd.",
      "I became a primary scorer for the Mavericks before their championship era.",
      "I played alongside Steve Nash and Dirk Nowitzki in Dallas.",
      "I won the 2007 NBA title as a member of the San Antonio Spurs.",
      "I was the Wisconsin product and longtime No. 4 scorer for the Dallas Mavericks."
    ],
    "b": [
      "I was known for consistent scoring and strong midrange offense.",
      "I eventually became a useful veteran shooter on a championship club.",
      "I was chosen for the All-Star Game in consecutive seasons.",
      "I was drafted late in the first round and traded after my rookie year.",
      "I started my NBA career with the Phoenix Suns.",
      "I averaged a career-high 22.6 points in the 1999-2000 season.",
      "I watched Dallas reach the 2006 NBA Finals the season after I left for San Antonio.",
      "I helped San Antonio beat Cleveland in the 2007 Finals.",
      "I was part of Dallas's early-2000s offensive trio with Nash and Nowitzki.",
      "I was the former Wisconsin star who became an All-Star in Dallas and an NBA champion with San Antonio."
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
      "I was a high lottery pick in a draft rich with future stars.",
      "I won the 1996 NCAA championship as a Kentucky Wildcat.",
      "I developed an unconventional outside shot despite playing many minutes in the frontcourt.",
      "I reached the 2002 conference finals with the Celtics and Paul Pierce.",
      "I played an important bench role in the 2006 playoffs en route to an NBA title with Miami.",
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
      "My ability to score while moving without the ball helped me earn All-Star recognition.",
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
      "I was a first-round draft pick after a successful college career.",
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
      "I received the NBA's sportsmanship award during my career.",
      "I played for Boston, Toronto, Denver and Minnesota before moving to Detroit.",
      "I became the starting leader on the Pistons' defensive-minded championship team.",
      "I returned to Denver and helped the Nuggets reach the 2009 Western Conference finals.",
      "I scored 14 points with six assists in the title-clinching Game 5 against the Lakers in 2004.",
      "I was known as Mr. Big Shot while playing alongside the two Wallaces in Detroit.",
      "My 2004 Finals MVP came while I guided the Pistons past Shaq and Kobe's Lakers."
    ]
  },
  {
    "name": "Ben Wallace",
    "bref": "wallabe01",
    "group": "big",
    "a": [
      "I became one of the league's premier defenders after arriving as an overlooked prospect.",
      "I was named to multiple All-Star teams despite modest scoring numbers.",
      "I earned All-NBA honors largely through my defensive impact.",
      "I led the league in rebounding more than once.",
      "I won the Defensive Player of the Year award four times.",
      "I entered the NBA undrafted and spent time with Washington and Orlando.",
      "I anchored Detroit's 2004 championship defense against the Lakers.",
      "I shared the Pistons frontcourt with Rasheed Wallace.",
      "I was the No. 3 Detroit Pistons center with the famous towering Afro.",
      "I was nicknamed Big Ben and became the first undrafted Hall of Fame inductee from the modern NBA draft era."
    ],
    "b": [
      "I became a dominant rebounder and shot blocker.",
      "I earned repeated selections to the NBA All-Defensive First Team.",
      "I was a four-time All-Star during a stretch of team success.",
      "I once led the league in blocked shots as well as rebounds.",
      "I was acquired in a deal involving a former No. 2 draft pick.",
      "I came from Orlando to Detroit in the sign-and-trade that sent Grant Hill to the Magic.",
      "I won Defensive Player of the Year in 2002, 2003, 2005 and 2006.",
      "I helped the Pistons reach consecutive Finals in 2004 and 2005.",
      "I was the Detroit defender known as Big Ben who helped topple Shaq and Kobe.",
      "I was Detroit's Afro-wearing, undrafted champion known as Big Ben."
    ],
    "history": "https://www.nba.com/watch/video/ben-wallace-career-retrospective"
  },
  {
    "name": "Rasheed Wallace",
    "bref": "wallara01",
    "group": "big",
    "a": [
      "I was a skilled interior scorer with a dangerous outside shot.",
      "I was selected to multiple NBA All-Star Games.",
      "I became a starter on teams that made repeated deep playoff runs.",
      "I made four NBA All-Star teams over my career.",
      "I was taken fourth overall in the 1995 NBA Draft.",
      "I helped Portland reach the 2000 Western Conference finals.",
      "I briefly played one game for Atlanta during a midseason trade sequence.",
      "I joined Detroit in 2004 and immediately helped the Pistons win a championship.",
      "I formed the Pistons' title-winning frontcourt with Ben Wallace.",
      "I was the outspoken No. 36 Pistons star associated with the phrase 'Ball don't lie.'"
    ],
    "b": [
      "I was a versatile veteran who could score inside or stretch the floor.",
      "I became an All-Star for more than one franchise.",
      "I played in the NBA for well over a decade.",
      "I was named to consecutive All-Star teams early in my career.",
      "I played college basketball for Dean Smith at North Carolina.",
      "I was a central member of Portland's late-1990s and early-2000s contenders.",
      "I was traded from the Trail Blazers to Atlanta and then Detroit in February 2004.",
      "I hit important shots during Detroit's 2004 Finals victory over the Lakers.",
      "I played for Portland, Detroit, Boston and the New York Knicks.",
      "I was the big man known as Sheed and for the phrase 'Ball don't lie.'"
    ]
  },
  {
    "name": "Baron Davis",
    "bref": "davisba01",
    "group": "guard",
    "a": [
      "I was an explosive scorer and playmaker who earned All-Star selections.",
      "I became one of the league's more dangerous ball thieves.",
      "I had multiple seasons with more than twenty points and seven assists per game.",
      "I led the NBA in steals twice.",
      "I was selected third overall in the 1999 NBA Draft.",
      "I began my NBA career with the Charlotte Hornets before moving with the franchise to New Orleans.",
      "I later led a lower-seeded team on a stunning first-round playoff upset.",
      "I helped the eighth-seeded Warriors beat the 67-win Mavericks in 2007.",
      "I was the leading figure in the Golden State Warriors' 'We Believe' run.",
      "I was the UCLA guard known as B-Diddy who led the 2007 We Believe Warriors."
    ],
    "b": [
      "I earned a reputation as a powerful driving finisher for a backcourt star.",
      "I was selected to two NBA All-Star Games.",
      "I became a high-volume passer and scorer in the same seasons.",
      "I recorded a notable playoff triple-double during my career.",
      "I starred at UCLA before going third in the 1999 draft.",
      "I participated in a 2007 playoff series that shocked Dirk Nowitzki's Dallas.",
      "I scored 20 points on an injured hamstring as the Warriors closed out Dallas in Game 6 in 2007.",
      "I joined the Los Angeles Clippers as a free agent in 2008.",
      "I was Golden State's famous No. 5 during the 'We Believe' playoffs.",
      "My nickname B-Diddy followed me from the Hornets to the Warriors and Clippers."
    ]
  },
  {
    "name": "Peja Stojaković",
    "bref": "stojape01",
    "group": "wing",
    "a": [
      "I developed into one of the league's premier outside shooters.",
      "I became an All-Star during my most productive seasons.",
      "I made the All-NBA Second Team once.",
      "I was selected for three consecutive NBA All-Star Games.",
      "I finished near the top of league MVP voting in 2004.",
      "I won the NBA's Three-Point Contest twice.",
      "I was a central scorer for Sacramento's early-2000s playoff contenders.",
      "I played for Indiana, New Orleans and Toronto before a final championship run in Dallas.",
      "I helped Dirk Nowitzki's Mavericks win the 2011 NBA championship.",
      "I was the Serbian sharpshooter known as Peja, whose Kings jersey was No. 16."
    ],
    "b": [
      "I joined the league after playing professionally overseas.",
      "I became a high-scoring teammate on a conference-final contender.",
      "I won a league three-point shooting contest more than once.",
      "I earned an All-NBA Second Team selection during my peak.",
      "I was drafted fourteenth overall in 1996 but did not immediately begin my NBA career.",
      "I played a leading offensive role while Chris Webber missed much of the 2003-04 season.",
      "I helped Sacramento reach the Western Conference finals against the Lakers in 2002.",
      "I hit six three-pointers in a 2011 Dallas playoff victory over the Lakers.",
      "I was the long-range specialist for the Sacramento Kings alongside Webber and Mike Bibby.",
      "I became the Sacramento Kings' No. 16 sharpshooter and a Dallas championship veteran."
    ]
  },
  {
    "name": "Jermaine O’Neal",
    "bref": "onealje01",
    "group": "big",
    "a": [
      "I earned multiple All-NBA honors over a long NBA career.",
      "I became a reliable scorer, rebounder and rim protector.",
      "I was chosen for six NBA All-Star Games.",
      "I earned the Most Improved Player award.",
      "I was selected directly out of high school in the 1996 NBA Draft.",
      "I began my career in Portland before finding an expanded role in Indiana.",
      "I finished third in NBA MVP voting in 2004.",
      "I was involved in the 2004 Palace brawl while playing for the Pacers.",
      "I became the Pacers' six-time All-Star and wore No. 7 in Indiana.",
      "I became the No. 7 Indiana star whose surname I shared with Shaquille despite no family connection."
    ],
    "b": [
      "I played for several NBA organizations across a lengthy career.",
      "I became an elite interior scorer after spending early years in a reserve role.",
      "I earned three All-NBA selections.",
      "I entered the league at age seventeen.",
      "I was traded for Dale Davis in a deal between Portland and Indiana.",
      "I won Most Improved Player in 2002 with the Pacers.",
      "I helped Indiana post the NBA's best regular-season record in 2003-04.",
      "I later played for Toronto, Miami, Boston, Phoenix and Golden State.",
      "I wore No. 7 while starring for the Indiana Pacers during their Reggie Miller era.",
      "My six All-Star selections came with Indiana, not with Shaquille O'Neal's teams."
    ]
  },
  {
    "name": "Shawn Marion",
    "bref": "mariosh01",
    "group": "wing",
    "a": [
      "I built a long career on rebounding, transition play and versatile defense.",
      "I was voted to four NBA All-Star Games.",
      "I contributed on both ends without needing plays called for me.",
      "I averaged a double-double in several seasons.",
      "I earned a spot on the United States Olympic team.",
      "I became a major member of an offense nicknamed Seven Seconds or Less.",
      "I starred alongside Steve Nash and Amar'e Stoudemire in Phoenix.",
      "I won the 2011 NBA championship playing for Dallas.",
      "I was the high-flying Phoenix Suns No. 31 known as the Matrix.",
      "I was the Matrix who helped Dirk Nowitzki beat Miami in the 2011 Finals."
    ],
    "b": [
      "I earned NBA All-Rookie Second Team honors.",
      "I frequently filled the stat sheet in rebounds, steals and blocks.",
      "I played in the league for sixteen seasons.",
      "I earned several All-Star selections during my most productive stretch.",
      "I was drafted ninth overall in 1999.",
      "I played in Phoenix before moving to Miami, Toronto, Dallas and Cleveland.",
      "I was named to the 2004 United States Olympic team.",
      "I took on LeBron James defensively during the 2011 NBA Finals.",
      "I played with the Phoenix Suns during the Nash and D'Antoni era.",
      "My unusual shooting form and nickname the Matrix became signatures of my Suns career."
    ]
  },
  {
    "name": "Yao Ming",
    "bref": "mingya01",
    "group": "big",
    "a": [
      "I received NBA All-Rookie First Team recognition.",
      "I earned numerous NBA All-Star selections during a career shortened by injuries.",
      "I combined touch around the basket with dependable free-throw shooting.",
      "I was named to eight NBA All-Star teams.",
      "I earned five All-NBA selections.",
      "I was the first overall selection in the 2002 NBA Draft.",
      "I teamed with Tracy McGrady as a franchise centerpiece.",
      "I helped Houston beat Portland in the 2009 first round for my first NBA playoff series win.",
      "I was the 7-foot-6 Houston Rockets star who played professionally in China before coming to the NBA.",
      "I wore No. 11 for the Rockets and was inducted into the Basketball Hall of Fame in 2016."
    ],
    "b": [
      "I became a high-scoring interior player after entering the league from overseas.",
      "I ranked near the top of All-Star fan voting several times.",
      "I averaged over twenty points per game during multiple seasons.",
      "I was a dominant international player before my NBA debut.",
      "I played professionally for the Shanghai Sharks before joining the NBA.",
      "I was selected first in the draft without having played college basketball in the United States.",
      "I led the Rockets past Portland in a 2009 playoff series despite persistent foot trouble.",
      "I appeared in a renowned commercial with fellow NBA star Shaquille O'Neal and became a major global ambassador for the league.",
      "I became the best-known Chinese star ever to play for the Houston Rockets.",
      "I stood 7 feet 6 inches tall and wore No. 11 for Houston."
    ]
  },
  {
    "name": "Tony Allen",
    "bref": "allento01",
    "group": "guard",
    "a": [
      "I earned a reputation as one of the NBA's strongest perimeter defenders.",
      "I contributed valuable minutes for teams with sustained playoff success.",
      "I was named to multiple NBA All-Defensive teams.",
      "I was selected to three All-Defensive First Teams.",
      "I was drafted late in the first round in 2004.",
      "I won an NBA championship as a supporting player with Boston in 2008.",
      "I joined Memphis and became the face of a defense-first identity.",
      "I was one of the 'Grit and Grind' Grizzlies alongside Zach Randolph and Marc Gasol.",
      "I received praise from Kobe Bryant as a particularly difficult defender.",
      "I was the Memphis Grizzlies guard nicknamed the Grindfather."
    ],
    "b": [
      "I was known primarily for defending elite opposing scorers.",
      "I developed into a valuable specialist rather than an All-Star.",
      "I spent more than a decade in the NBA.",
      "I earned six NBA All-Defensive selections.",
      "I played college basketball at Oklahoma State.",
      "I helped the Celtics win the 2008 title alongside Paul Pierce and Kevin Garnett.",
      "I helped Memphis upset top-seeded San Antonio in the 2011 playoffs.",
      "I became the vocal heart of Memphis's Grit and Grind era.",
      "I wore No. 9 for the Grizzlies and was called the Grindfather.",
      "I was the former Celtics champion whose Memphis defense earned the nickname Grindfather."
    ]
  },
  {
    "name": "Hedo Türkoğlu",
    "bref": "turkohe01",
    "group": "wing",
    "a": [
      "I became a dependable scorer and passer on playoff teams.",
      "I developed a reputation for making difficult shots late in games.",
      "I won the NBA's Most Improved Player award.",
      "I averaged career-best scoring during my award-winning season.",
      "I was a first-round selection in the 2000 NBA Draft.",
      "I became a key playmaker on Orlando's deep playoff runs.",
      "I helped the Magic eliminate LeBron James's Cavaliers in the 2009 conference finals.",
      "I reached the 2009 NBA Finals with Dwight Howard and Rashard Lewis.",
      "I was the Turkish forward known as Hedo who played for the Orlando Magic.",
      "I won Most Improved Player in 2008 wearing No. 15 for Orlando."
    ],
    "b": [
      "I often handled the ball as an unusually tall facilitator.",
      "I made important contributions to teams with conference-final ambitions.",
      "I played for several organizations during a long NBA career.",
      "I was named Most Improved Player after expanding my offensive role.",
      "I began my NBA career with Sacramento before joining San Antonio.",
      "I was part of the Kings' rotation behind Chris Webber and Peja Stojaković.",
      "I left Orlando for Toronto as a free agent after a Finals run.",
      "I returned to Orlando before finishing my playing career with the Clippers.",
      "I was a creator on Dwight Howard's 2009 Orlando Magic Finals team.",
      "I was the Turkish playmaking forward who wore No. 15 for the Orlando Magic."
    ]
  },
  {
    "name": "Andrei Kirilenko",
    "bref": "kirilan01",
    "group": "wing",
    "a": [
      "I became known for disrupting offenses in several ways at once.",
      "I was an excellent shot blocker relative to my perimeter defensive responsibilities.",
      "I earned several NBA All-Defensive selections.",
      "I was selected to an NBA All-Star Game.",
      "I led the NBA in blocks per game during the 2004-05 season.",
      "I recorded multiple five-by-five statistical games involving points, rebounds, assists, steals and blocks.",
      "I starred for Utah during the period after John Stockton and Karl Malone.",
      "I later played for Minnesota and Brooklyn after a long stretch with the Jazz.",
      "My nickname AK-47 matched my initials and No. 47 Utah Jazz jersey.",
      "I was the Russian Utah Jazz forward whose initials and jersey made me AK-47."
    ],
    "b": [
      "I made NBA All-Defensive teams for versatility as well as rim protection.",
      "I was capable of filling five statistical categories in a single game.",
      "I was a key contributor on a conference-final playoff team.",
      "I led the NBA in blocks in one season.",
      "I earned an Olympic bronze medal in 2012.",
      "I helped Russia win EuroBasket gold in 2007 and received tournament MVP.",
      "I helped the Jazz reach the 2007 Western Conference finals.",
      "I played under Jerry Sloan during much of my Utah career.",
      "My No. 47 and the nickname AK-47 were inseparable in Utah.",
      "I was the Utah Jazz's all-purpose defender known as AK-47."
    ]
  },
  {
    "name": "Elton Brand",
    "bref": "brandel01",
    "group": "big",
    "a": [
      "I became an effective scorer and rebounder immediately after entering the league.",
      "I reached two NBA All-Star Games while posting frequent double-doubles.",
      "I regularly averaged double-digit rebounds early in my career.",
      "I was named to the All-NBA Second Team.",
      "I shared the Rookie of the Year award for the 1999-2000 season.",
      "I was the first overall choice in the 1999 NBA Draft.",
      "I moved from Chicago to the Los Angeles Clippers after only two seasons.",
      "I helped the Clippers win a playoff series in 2006 while averaging more than twenty-four points.",
      "I shared Rookie of the Year honors with Steve Francis.",
      "I was the Duke star who became the Clippers' No. 42 franchise player."
    ],
    "b": [
      "I developed into one of the league's most productive double-double players.",
      "I was a regular All-Star contender at my peak.",
      "I earned All-Rookie honors after entering as a highly regarded prospect.",
      "I made the NBA All-Star team twice during my career.",
      "I led Duke to the 1999 national championship game and was national player of the year.",
      "I won the 2000 Rookie of the Year award after being drafted by Chicago.",
      "I signed with Philadelphia following several Clippers seasons.",
      "I played later NBA seasons with Dallas and Atlanta before returning to Philadelphia.",
      "I averaged 24.7 points per game for the 2005-06 Clippers.",
      "I was the first overall selection in 1999 who became a Clippers All-Star."
    ]
  },
  {
    "name": "Carlos Boozer",
    "bref": "boozeca01",
    "group": "big",
    "a": [
      "I built a reputation as a productive rebounder and low-post scorer.",
      "I became an NBA All-Star more than once.",
      "I averaged a double-double in multiple seasons.",
      "I was selected to the All-NBA Third Team.",
      "I entered the NBA in the second round of the 2002 draft.",
      "I won an Olympic gold medal with Team USA in 2008.",
      "I helped the Utah Jazz reach the 2007 Western Conference finals.",
      "I later became a major frontcourt contributor for Chicago under Tom Thibodeau.",
      "I formed Utah's signature pick-and-roll partnership with Deron Williams.",
      "I was the Duke alumnus and Utah Jazz No. 5 known for scoring and rebounding."
    ],
    "b": [
      "I played a physical interior game and consistently collected rebounds.",
      "I contributed scoring to teams that routinely qualified for the playoffs.",
      "I earned two NBA All-Star selections.",
      "I won two NCAA national championships before entering the NBA.",
      "I was a member of Duke's 2001 NCAA title team and the 2002 Final Four squad.",
      "I began with Cleveland before signing with Utah in 2004.",
      "I averaged 20.9 points and 11.7 rebounds in the 2006-07 NBA season.",
      "I teamed with Derrick Rose and Joakim Noah on Chicago Bulls playoff teams.",
      "I starred for the Utah Jazz after the Stockton-and-Malone era.",
      "I was the left-handed scorer who starred for the Jazz and Bulls wearing No. 5."
    ]
  },
  {
    "name": "Lamar Odom",
    "bref": "odomla01",
    "group": "big",
    "a": [
      "I was a versatile player who could rebound, handle the ball and pass.",
      "I earned league recognition for contributions off the bench.",
      "I routinely helped my teams in several box-score categories.",
      "I received the NBA Sixth Man of the Year award.",
      "I was chosen fourth overall in the 1999 NBA Draft.",
      "I began my career with the Clippers and played one season in Miami.",
      "I went to the Lakers in the deal that sent Shaquille O'Neal to Miami.",
      "I helped the Lakers win championships in both 2009 and 2010.",
      "I won Sixth Man of the Year in 2011 after two titles with Kobe Bryant.",
      "I was the left-handed No. 7 Lakers forward who won the 2011 Sixth Man award."
    ],
    "b": [
      "I entered the league as a lottery pick.",
      "I was a valuable starter before becoming a reserve on title teams.",
      "I represented the United States in major international competition.",
      "I earned an Olympic medal with Team USA.",
      "I attended Rhode Island for one college season before entering the NBA.",
      "I averaged a double-double in the Lakers' 2008-09 championship season.",
      "I was a flexible frontcourt partner to Pau Gasol and Andrew Bynum.",
      "I was traded to Dallas after helping Los Angeles win two titles.",
      "I later became the Lakers' 2011 Sixth Man of the Year.",
      "I was known as LO during my long run as Kobe Bryant's Lakers teammate."
    ]
  },
  {
    "name": "Metta World Peace",
    "bref": "artesro01",
    "group": "wing",
    "a": [
      "I earned a reputation as an intensely physical defender.",
      "I was an NBA All-Star and made several All-Defensive teams.",
      "I was recognized as one of the league's best individual defensive players.",
      "I won the NBA Defensive Player of the Year award.",
      "I was selected in the first round of the 1999 NBA Draft.",
      "I starred for Indiana but was suspended for the remainder of the 2004-05 season following a notorious incident.",
      "I later played for Sacramento and Houston before signing with Los Angeles.",
      "I helped the Lakers win Game 7 of the 2010 Finals against Boston.",
      "I legally adopted a new three-word name years after becoming famous as Ron Artest.",
      "I won a 2010 title with the Lakers after playing for Indiana under the name Ron Artest."
    ],
    "b": [
      "I contributed tough defense and secondary scoring during a lengthy career.",
      "I was selected to the NBA All-Defensive First Team twice.",
      "I earned an All-NBA Third Team selection.",
      "I became an NBA champion after years of playoff contention.",
      "I played college basketball at St. John's before being drafted by Chicago.",
      "I won the 2004 Defensive Player of the Year award with the Indiana Pacers.",
      "I was a central figure in the infamous 2004 Malice at the Palace incident.",
      "I sank a critical three-pointer late in the Lakers' 2010 Finals Game 7 victory.",
      "I changed my legal name in 2011 after playing as Ron Artest.",
      "I won a Lakers championship under my old surname and later became known by a three-word name."
    ]
  },
  {
    "name": "Jerry Stackhouse",
    "bref": "stackje01",
    "group": "wing",
    "a": [
      "I became a high-volume scorer early in my professional career.",
      "I spent several seasons scoring more than twenty points per game.",
      "I was chosen for the All-Rookie First Team in my debut campaign.",
      "I was selected to consecutive All-Star Games at my peak.",
      "I was chosen third overall in the 1995 NBA Draft.",
      "I finished second in NBA scoring during the 2000-01 season.",
      "I averaged 29.8 points per game for Detroit in that season.",
      "I was traded from Detroit to Washington for Richard Hamilton.",
      "I reached the 2006 NBA Finals as a Dallas Maverick.",
      "I was the North Carolina star who led Detroit's offense before playing beside Dirk Nowitzki."
    ],
    "b": [
      "I was an explosive offensive player with a long NBA career.",
      "I remained a useful bench scorer after my peak seasons.",
      "I earned the NBA's All-Rookie First Team honor.",
      "I played one college season alongside another future top draft pick.",
      "I shared the floor at North Carolina with Rasheed Wallace.",
      "I played for Philadelphia before becoming a 2000s scoring star in Detroit.",
      "I scored a career-high 57 points in a 2001 game against Chicago.",
      "I later spent several seasons with the Dallas Mavericks.",
      "I led the 2000-01 Pistons with 29.8 points per game.",
      "I was the former No. 42 Pistons scoring star who later came off the Dallas bench."
    ]
  },
  {
    "name": "Mike Bibby",
    "bref": "bibbymi01",
    "group": "guard",
    "a": [
      "I built a long NBA career as a steady offensive organizer.",
      "I became known for timely jump shots in important games.",
      "I averaged at least five assists per game in numerous seasons.",
      "I served as a starting playmaker on successful playoff teams.",
      "I was the second overall selection in the 1998 NBA Draft.",
      "I began with Vancouver before moving to Sacramento in a major trade.",
      "I replaced Jason Williams as Sacramento's starting point guard.",
      "I hit a late game-winner in Game 5 of the 2002 Western Conference finals.",
      "I played alongside Chris Webber and Peja Stojaković on the 2002 Kings.",
      "I was the No. 10 Sacramento Kings guard and son of former NBA player Henry Bibby."
    ],
    "b": [
      "I contributed as both a passer and a dangerous outside shooter.",
      "I spent many NBA seasons in the starting lineup without making an All-Star team.",
      "I was an early lottery selection.",
      "I won a national championship during my college career.",
      "I helped Arizona win the 1997 NCAA title as a freshman.",
      "I was traded from the Grizzlies to the Kings in exchange for Jason Williams in 2001.",
      "I later played for Atlanta, Washington, Miami and New York.",
      "I hit a pivotal winning shot against the Lakers in the 2002 West finals.",
      "I was the Sacramento guard leading an offense with Chris Webber and Vlade Divac.",
      "I was the Arizona national champion who wore No. 10 for Sacramento's 2002 contender."
    ]
  }

];
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’\']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const nbaWhoAmIAuthoredBatch3: readonly NbaWhoAmIAuthoredIdentity[] = entries.map((entry): NbaWhoAmIAuthoredIdentity => {
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
    eraBand: "legacy" as const,
    rescueGroup: entry.group,
    earlyRotation: "normal" as const,
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
