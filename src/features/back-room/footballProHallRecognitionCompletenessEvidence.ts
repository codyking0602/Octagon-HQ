import type {
  FootballRecognitionCompletenessCandidate,
  FootballRecognitionSourceDispositionTier,
} from "./footballRecognitionCompletenessEvidence";

export type FootballProHallReviewKind = "player" | "coach" | "contributor";

export interface FootballProHallRecognitionDisposition {
  name: string;
  reviewKind: FootballProHallReviewKind;
  disposition: FootballRecognitionSourceDispositionTier;
  reason: string;
  source: string;
}

export const PRO_FOOTBALL_HALL_DIRECTORY = "https://www.profootballhof.com/players";
export const PRO_FOOTBALL_HALL_POSITIONS = "https://www.profootballhof.com/hall-of-famers/positions";

const PRO_FOOTBALL_HALL_REVIEW = `B|P|Herb Adderley
A|P|Troy Aikman
B|P|Eric Allen
B|C|George Allen
B|P|Jared Allen
B|P|Larry Allen
A|P|Marcus Allen
B|P|Lance Alworth
B|P|Morten Andersen
D|P|Doug Atkins
B|P|Steve Atwater
D|P|Morris 'Red' Badgro
B|P|Champ Bailey
B|P|Rondé Barber
B|P|Lem Barney
D|P|Cliff Battles
A|P|Sammy Baugh
D|X|Bobby Beathard
A|P|Chuck Bednarik
D|X|Bert Bell
B|P|Bobby Bell
A|P|Raymond Berry
B|P|Elvin Bethea
B|P|Jerome Bettis
D|X|Charles W. Bidwill, Sr.
B|P|Fred Biletnikoff
B|P|George Blanda
B|P|Mel Blount
B|P|Tony Boselli
D|X|Pat Bowlen
A|P|Terry Bradshaw
B|P|Cliff Branch
D|X|Gil Brandt
B|P|Robert Brazile
A|P|Drew Brees
B|P|Derrick Brooks
B|P|Bob 'Boomer' Brown
A|P|Jim Brown
A|C|Paul Brown
D|P|Roosevelt Brown
B|P|Tim Brown
B|P|Willie Brown
B|P|Isaac Bruce
B|P|Junious 'Buck' Buchanan
B|P|Nick Buoniconti
A|P|Dick Butkus
D|P|Jack Butler
B|P|LeRoy Butler
A|P|Earl Campbell
D|P|Tony Canadeo
B|P|Harold Carmichael
D|X|Joe Carr
B|P|Harry Carson
B|P|Cris Carter
B|P|Dave Casper
D|P|Guy Chamberlin
D|P|Jack Christiansen
D|P|Earl 'Dutch' Clark
D|P|George Connor
D|P|Jimmy Conzelman
B|C|Don Coryell
B|P|Jimbo Covert
B|C|Bill Cowher
B|P|Roger Craig
D|P|Lou Creekmur
B|P|Larry Csonka
B|P|Curley Culp
D|X|Al Davis
B|P|Terrell Davis
D|P|Willie Davis
B|P|Brian Dawkins
B|P|Dermontti Dawson
B|P|Len Dawson
B|P|Fred Dean
D|X|Edward DeBartolo Jr.
B|P|Joe DeLamielleure
B|P|Richard Dent
A|P|Eric Dickerson
B|P|Dan Dierdorf
D|P|Bobby Dillon
B|P|Mike Ditka
B|P|Chris Doleman
D|P|Art Donovan
A|P|Tony Dorsett
D|P|John 'Paddy' Driscoll
D|P|Bill Dudley
B|C|Tony Dungy
B|P|Kenny Easley
D|P|Albert Glen 'Turk' Edwards
B|P|Carl Eller
A|P|John Elway
B|C|Weeb Ewbank
B|P|Alan Faneca
A|P|Marshall Faulk
A|P|Brett Favre
D|P|Tom Fears
D|X|Jim Finks
A|P|Larry Fitzgerald
B|C|Ray Flaherty
B|C|Tom Flores
D|P|Len Ford
D|P|Dan Fortmann
B|P|Dan Fouts
B|P|Dwight Freeney
D|P|Benny Friedman
B|P|Antonio Gates
D|P|Frank Gatski
D|P|Bill George
A|C|Joe Gibbs
A|P|Frank Gifford
B|C|Sid Gillman
B|P|Tony Gonzalez
B|P|Randy Gradishar
A|P|Otto Graham
A|P|Harold 'Red' Grange
B|C|Bud Grant
B|P|Darrell Green
A|P|Joe Greene
B|P|Kevin Greene
B|P|Forrest Gregg
B|P|Bob Griese
B|P|Russ Grimm
D|P|Lou Groza
B|P|Ray Guy
D|P|Joe Guyon
A|C|George Halas
B|P|Charles Haley
B|P|Jack Ham
B|P|Dan Hampton
B|P|Chris Hanburger
B|P|John Hannah
B|P|Cliff Harris
B|P|Franco Harris
B|P|Marvin Harrison
B|P|Bob Hayes
B|P|Mike Haynes
D|P|Ed Healey
D|P|Mel Hein
B|P|Ted Hendricks
D|P|Wilbur 'Pete' Henry
D|P|Arnie Herber
B|P|Devin Hester
D|P|Bill Hewitt
B|P|Gene Hickerson
B|P|Winston Hill
D|P|Clarke Hinkle
D|P|Elroy 'Crazylegs' Hirsch
A|P|Paul Hornung
B|P|Ken Houston
B|P|Chuck Howley
D|P|Robert 'Cal' Hubbard
A|P|Sam Huff
B|P|Claude Humphrey
D|X|Lamar Hunt
B|P|Steve Hutchinson
A|P|Don Hutson
B|P|Michael Irvin
B|P|Rickey Jackson
B|P|Edgerrin James
B|P|Andre Johnson
A|P|Calvin Johnson
A|C|Jimmy Johnson
B|P|Jimmy Johnson
D|P|John Henry Johnson
B|P|Charlie Joiner
A|P|David 'Deacon' Jones
D|X|Jerry Jones
D|P|Stan Jones
B|P|Walter Jones
D|P|Henry Jordan
B|P|Sonny Jurgensen
B|P|Alex Karras
A|P|Jim Kelly
B|P|Leroy Kelly
B|P|Cortez Kennedy
D|P|Walt Kiesling
D|P|Frank 'Bruiser' Kinard
B|P|Joe Klecko
D|P|Jerry Kramer
B|P|Paul Krause
B|P|Luke Kuechly
A|C|Earl 'Curly' Lambeau
B|P|Jack Lambert
A|C|Tom Landry
A|P|Dick 'Night Train' Lane
B|P|Jim Langer
B|P|Willie Lanier
B|P|Steve Largent
D|P|Yale Lary
D|P|Dante Lavelli
B|P|Ty Law
A|P|Bobby Layne
B|P|Dick LeBeau
D|P|Alphonse 'Tuffy' Leemans
B|C|Marv Levy
A|P|Ray Lewis
B|P|Bob Lilly
B|P|Floyd Little
B|P|Larry Little
B|P|James Lofton
A|C|Vince Lombardi
B|P|Howie Long
A|P|Ronnie Lott
A|P|Sid Luckman
D|P|William Roy 'Link' Lyman
B|P|John Lynch
B|P|Tom Mack
B|P|John Mackey
A|C|John Madden
A|P|Peyton Manning
D|X|Tim Mara
D|X|Wellington Mara
D|P|Gino Marchetti
A|P|Dan Marino
D|X|George Preston Marshall
B|P|Curtis Martin
D|P|Ollie Matson
B|P|Bruce Matthews
B|P|Kevin Mawae
B|P|Don Maynard
D|P|George McAfee
D|P|Mike McCormack
B|P|Randall McDaniel
D|P|Tommy McDonald
D|P|Hugh McElhenny
B|P|Steve McMichael
D|X|Art McNally
D|P|John 'Blood' McNally
D|P|Mike Michalske
D|P|Wayne Millner
B|P|Sam Mills
D|P|Bobby Mitchell
D|P|Ron Mix
B|P|Art Monk
A|P|Joe Montana
B|P|Warren Moon
D|P|Lenny Moore
A|P|Randy Moss
D|P|Marion Motley
B|P|Mike Munchak
A|P|Anthony Muñoz
D|P|George Musso
A|P|Bronko Nagurski
A|P|Joe Namath
B|C|Earle 'Greasy' Neale
D|P|Ernie Nevers
B|P|Ozzie Newsome
B|P|Ray Nitschke
A|C|Chuck Noll
D|P|Leo Nomellini
D|X|Bill Nunn
B|P|Jonathan Ogden
B|P|Merlin Olsen
B|P|Jim Otto
B|C|Steve Owen
B|P|Terrell Owens
B|P|Orlando Pace
A|P|Alan Page
A|C|Bill Parcells
D|P|Clarence 'Ace' Parker
D|P|Jim Parker
A|P|Walter Payton
B|P|Drew Pearson
B|P|Julius Peppers
D|P|Joe Perry
D|P|Pete Pihos
A|P|Troy Polamalu
D|X|Bill Polian
D|P|Fritz Pollard
B|P|John Randle
D|X|Hugh 'Shorty' Ray
B|P|Andre Reed
A|P|Ed Reed
D|X|Dan Reeves
B|P|Mel Renfro
B|P|Darrelle Revis
A|P|Jerry Rice
D|P|Les Richter
B|P|John Riggins
B|P|Ken Riley
D|P|Jim Ringo
B|P|Willie Roaf
B|P|Dave Robinson
B|P|Johnny Robinson
D|P|Andy Robustelli
D|X|Art Rooney
D|X|Dan Rooney
D|X|Pete Rozelle
D|X|Ed Sabol
D|X|Steve Sabol
A|P|Barry Sanders
B|P|Charlie Sanders
A|P|Deion Sanders
B|P|Warren Sapp
A|P|Gale Sayers
D|P|Joe Schmidt
D|X|Tex Schramm
B|P|Junior Seau
B|P|Lee Roy Selmon
B|P|Richard Seymour
B|P|Shannon Sharpe
B|P|Sterling Sharpe
D|P|Billy Shaw
B|P|Art Shell
B|P|Donnie Shell
B|P|Will Shields
A|C|Don Shula
A|P|O.J. Simpson
B|P|Mike Singletary
D|P|Duke Slater
B|P|Jackie Slater
A|P|Bruce Smith
A|P|Emmitt Smith
B|P|Jackie Smith
D|P|Mac Speedie
D|P|Ed Sprinkle
D|P|Bob St. Clair
B|P|Ken Stabler
B|P|John Stallworth
D|P|Dick Stanfel
A|P|Bart Starr
A|P|Roger Staubach
D|P|Ernie Stautner
A|P|Jan Stenerud
B|P|Dwight Stephenson
B|P|Michael Strahan
B|C|Hank Stram
D|P|Ken Strong
D|P|Joe Stydahar
B|P|Lynn Swann
D|X|Paul Tagliabue
A|P|Fran Tarkenton
B|P|Charley Taylor
B|P|Jason Taylor
D|P|Jim Taylor
A|P|Lawrence Taylor
B|P|Derrick Thomas
B|P|Emmitt Thomas
B|P|Joe Thomas
B|P|Thurman Thomas
B|P|Zach Thomas
A|P|Jim Thorpe
B|P|Mick Tingelhoff
B|P|Andre Tippett
A|P|Y.A. Tittle
A|P|LaDainian Tomlinson
D|P|George Trafton
D|P|Charley Trippi
A|P|Emlen Tunnell
D|P|Clyde 'Bulldog' Turner
A|P|Johnny Unitas
B|P|Gene Upshaw
A|P|Brian Urlacher
D|P|Norm Van Brocklin
D|P|Steve Van Buren
B|C|Dick Vermeil
B|P|Adam Vinatieri
A|P|Doak Walker
A|C|Bill Walsh
B|P|DeMarcus Ware
B|P|Paul Warfield
A|P|Kurt Warner
D|P|Bob Waterfield
B|P|Mike Webster
B|P|Roger Wehrli
D|P|Arnie Weinmeister
B|P|Randy White
A|P|Reggie White
B|P|Dave Wilcox
B|P|Aeneas Williams
D|P|Bill Willis
B|P|Patrick Willis
B|P|Larry Wilson
D|X|Ralph Wilson Jr.
B|P|Kellen Winslow
D|P|Alex Wojciechowicz
D|X|Ron Wolf
B|P|Willie Wood
A|P|Charles Woodson
B|P|Rod Woodson
B|P|Rayfield Wright
B|P|Ron Yary
B|P|Bryant Young
D|X|George Young
A|P|Steve Young
B|P|Jack Youngblood
B|P|Gary Zimmerman`.trim().split("\n");

const PRO_FOOTBALL_HALL_ALIASES = new Map<string, readonly string[]>([
  ["Harold 'Red' Grange", ["Red Grange"]],
  ["David 'Deacon' Jones", ["Deacon Jones"]],
  ["Dick 'Night Train' Lane", ["Dick Lane", "Night Train Lane"]],
  ["Earl 'Curly' Lambeau", ["Curly Lambeau"]],
  ["Elroy 'Crazylegs' Hirsch", ["Elroy Hirsch", "Crazylegs Hirsch"]],
  ["Junious 'Buck' Buchanan", ["Buck Buchanan"]],
  ["Robert 'Cal' Hubbard", ["Cal Hubbard"]],
  ["Hugh 'Shorty' Ray", ["Shorty Ray"]],
  ["John 'Blood' McNally", ["John McNally", "Johnny Blood"]],
  ["Alphonse 'Tuffy' Leemans", ["Tuffy Leemans"]],
  ["Albert Glen 'Turk' Edwards", ["Turk Edwards"]],
  ["Frank 'Bruiser' Kinard", ["Frank Kinard"]],
  ["Wilbur 'Pete' Henry", ["Pete Henry"]],
  ["William Roy 'Link' Lyman", ["Link Lyman"]],
  ["Morris 'Red' Badgro", ["Red Badgro"]],
  ["Earl 'Dutch' Clark", ["Dutch Clark"]],
  ["Earle 'Greasy' Neale", ["Greasy Neale"]],
  ["John 'Paddy' Driscoll", ["Paddy Driscoll"]],
  ["Bob 'Boomer' Brown", ["Boomer Brown"]],
]);

const KIND_BY_CODE = { P: "player", C: "coach", X: "contributor" } as const;

function hallReason(reviewKind: FootballProHallReviewKind, disposition: FootballRecognitionSourceDispositionTier) {
  if (reviewKind === "contributor") {
    return "Official Pro Football Hall of Fame contributor or official reviewed explicitly; the canonical Football ledger has no contributor subject kind, so this identity remains archive-only.";
  }
  if (disposition === "A") {
    return reviewKind === "coach"
      ? "Pro Football Hall of Fame coach with enduring cross-era national recognition clears the A head-coach recognition bar."
      : "Pro Football Hall of Fame player with enduring cross-era national recognition clears the A player-career recognition bar.";
  }
  if (disposition === "B") {
    return reviewKind === "coach"
      ? "Pro Football Hall of Fame coach remains broadly recognizable enough for the B head-coach pool without requiring A-icon status."
      : "Pro Football Hall of Fame player remains broadly recognizable enough for the B player-career pool without requiring A-icon status.";
  }
  return "Pro Football Hall of Fame player reviewed against the Stage 13.5 era-sensitive recognizability standard but kept archive-only rather than inflating the canonical A/B career universe.";
}

/**
 * Exhaustive member-by-member review of the official Pro Football Hall of Fame directory after the 2026 class.
 * P = player, C = coach, X = contributor/official. Contributors remain D because the ledger has no contributor kind.
 * This is audit evidence only and never owns runtime membership, facts, game eligibility, or query routing.
 */
export const footballProHallRecognitionDispositions: readonly FootballProHallRecognitionDisposition[] =
  PRO_FOOTBALL_HALL_REVIEW.map((encoded) => {
    const [disposition, kindCode, ...nameParts] = encoded.split("|");
    const reviewKind = KIND_BY_CODE[kindCode as keyof typeof KIND_BY_CODE];
    const name = nameParts.join("|");
    if (!reviewKind || !name || !["A", "B", "D"].includes(disposition)) {
      throw new Error(`Invalid Pro Football Hall review row: ${encoded}`);
    }
    return {
      name,
      reviewKind,
      disposition: disposition as FootballRecognitionSourceDispositionTier,
      reason: hallReason(reviewKind, disposition as FootballRecognitionSourceDispositionTier),
      source: PRO_FOOTBALL_HALL_DIRECTORY,
    };
  });

export const footballProHallRecognitionCandidates: readonly FootballRecognitionCompletenessCandidate[] =
  footballProHallRecognitionDispositions.flatMap((row) => {
    if (row.disposition !== "A" && row.disposition !== "B") return [];
    return [{
      name: row.name,
      ...(PRO_FOOTBALL_HALL_ALIASES.has(row.name) ? { identityAliases: PRO_FOOTBALL_HALL_ALIASES.get(row.name)! } : {}),
      league: "NFL" as const,
      kind: row.reviewKind === "coach" ? "coach" as const : "player-career" as const,
      minimumTier: row.disposition,
      evidenceFamily: "pro-football-hall-of-fame" as const,
      source: row.source,
    }];
  });
