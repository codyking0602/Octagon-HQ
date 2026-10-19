import type { NbaWhoAmIAuthoredIdentity } from "./nbaWhoAmIAuthoredScripts";

/** Batch 3: forty-eight exclusive historical NBA identities; two independently authored reveal paths each. */
type Entry = { name: string; bref: string; group: "guard" | "wing" | "big"; a: readonly string[]; b: readonly string[]; history?: string };
const bands = ["broad", "broad", "helpful", "helpful", "helpful", "strong", "strong", "strong", "giveaway", "giveaway"] as const;
const entries: readonly Entry[] = [
  {
    "name": "Allen Iverson",
    "bref": "iversal01",
    "group": "guard",
    "history": "https://www.nba.com/news/history-nba-legend-allen-iverson",
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
    "history": "https://www.nba.com/news/history-nba-legend-steve-nash",
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
    "history": "https://www.nba.com/news/history-nba-legend-jason-kidd",
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
    "history": "https://www.nba.com/news/history-nba-legend-grant-hill",
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
