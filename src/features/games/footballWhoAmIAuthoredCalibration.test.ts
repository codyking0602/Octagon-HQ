import { describe, expect, it } from "vitest";
import {
  getFootballWhoAmIAuthoredIdentity,
  type FootballWhoAmIAuthoredLeague,
} from "./footballWhoAmIAuthoredScripts";

interface CalibrationFixture {
  league: FootballWhoAmIAuthoredLeague;
  name: string;
  scriptA: readonly string[];
  scriptB: readonly string[];
}

const CALIBRATION_FIXTURES: readonly CalibrationFixture[] = [
  {
    league: "NFL",
    name: "Josh Allen",
    scriptA: [
      "I was a top-10 draft pick who became known for contributing heavily as both a passer and runner.",
      "As a rookie, I rushed for 631 yards and eight touchdowns despite starting only 11 games.",
      "By my third NFL season, I had jumped to more than 4,500 passing yards and 35 passing touchdowns.",
      "I eventually produced multiple seasons with at least 4,000 passing yards and 35 passing touchdowns.",
      "I became one of only two players in NFL history to record 40 or more offensive touchdowns in five different seasons.",
      "In one season, I scored 15 rushing touchdowns from the quarterback position.",
      "I later became the first quarterback in the Super Bowl era to record a passing, rushing and receiving touchdown in the same game.",
      "I won an NFL MVP award in a season in which I was voted second-team All-Pro at quarterback.",
      "That MVP came while I was leading Buffalo to its fifth consecutive division title.",
      "I am the No. 17 quarterback who became the first Bills quarterback to win the AP NFL MVP.",
    ],
    scriptB: [
      "I finished high school without a Division I scholarship offer and began college at the junior-college level.",
      "After growing several inches, I eventually received an FBS opportunity and developed into an NFL first-round prospect.",
      "My NFL team traded up five spots to select me seventh overall.",
      "As a rookie, my rushing production immediately became an important part of my game.",
      "In my third NFL season, I helped my franchise win its first division title in 25 years.",
      "I followed that breakthrough by becoming a perennial 4,000-total-yard and 40-total-touchdown threat.",
      "My style produced an unusual quarterback game with touchdowns passing, rushing and receiving.",
      "I eventually became the first player in NFL history with five consecutive seasons of 40 or more total touchdowns.",
      "My college was Wyoming, and professionally I became the face of the offense in Buffalo.",
      "Wearing No. 17, I became the first Bills quarterback ever to win the AP NFL MVP.",
    ],
  },
  {
    league: "NFL",
    name: "Lamar Jackson",
    scriptA: [
      "I was a first-round quarterback who did not immediately begin my rookie season as the starter.",
      "Once I took over, my team won six of my seven regular-season starts and reached the playoffs.",
      "In my first full season as a starter, I led the NFL with 36 touchdown passes.",
      "That same year, I also rushed for more than 1,200 yards.",
      "Those rushing yards set a new NFL single-season record for a quarterback.",
      "I became only the second unanimous MVP in NFL history.",
      "Several years later, I won the league MVP award again.",
      "The season after that second MVP, I threw for a career-high 4,172 yards and 41 touchdowns with only four interceptions and was named first-team All-Pro.",
      "I have spent my entire NFL career with Baltimore.",
      "I am the No. 8 Ravens quarterback who won NFL MVP in both 2019 and 2023.",
    ],
    scriptB: [
      "I was a dual-threat quarterback from South Florida who entered the NFL after winning the Heisman Trophy.",
      "I was the fifth quarterback selected in my draft class.",
      "I was taken with the final pick of the first round.",
      "After taking over the starting job during my rookie year, I helped turn a struggling team into a division champion.",
      "In my second NFL season, I led the league in touchdown passes despite also being one of the league's most dangerous runners.",
      "I became the first quarterback in NFL history to rush for more than 1,000 yards in multiple seasons.",
      "My first MVP season was unanimous, something only one NFL player had done before me.",
      "I later became a multiple-time MVP and a three-time first-team AP All-Pro quarterback.",
      "Before the NFL I played at Louisville; professionally, I have played only for Baltimore.",
      "I wear No. 8 for the Ravens and own the NFL single-season quarterback rushing record.",
    ],
  },
  {
    league: "CFB",
    name: "Cam Newton",
    scriptA: [
      "I was a highly recruited quarterback from the Atlanta area.",
      "My college career was unusually winding: I attended more than one school before becoming a national star.",
      "I eventually produced one of the most dominant single seasons ever by a dual-threat quarterback.",
      "In that season, I accounted for 51 touchdowns passing, rushing and receiving.",
      "I became the first player in SEC history to throw for more than 2,000 yards and rush for more than 1,000 in the same season.",
      "I won the Heisman Trophy along with the Maxwell, Walter Camp and Davey O'Brien awards.",
      "My team went 14-0 and won its first national championship since 1957.",
      "Only then does my unusual path become clear: I started at Florida, spent a year in junior college, and finished at Auburn.",
      "After that lone season as Auburn's starting quarterback, I was selected No. 1 overall in the NFL Draft.",
      "I later won NFL MVP after accounting for 45 touchdowns for a 15-1 Carolina team.",
    ],
    scriptB: [
      "I began college as a highly rated quarterback but didn't finish my career at the school where I originally signed.",
      "An ankle injury contributed to me redshirting during my second season.",
      "After leaving my first school, I spent a season playing outside the FBS.",
      "At that stop, I led my team to a junior-college national championship.",
      "I then transferred again, making me a double-transfer before my breakthrough season.",
      "In my only season at my final school, I threw for 2,854 yards and 30 touchdowns and rushed for 1,473 yards and 20 touchdowns.",
      "That final school was Auburn, where I became the program's third Heisman Trophy winner.",
      "I completed that season 14-0 with an SEC title and a BCS national championship.",
      "Carolina made me the first overall selection in the following NFL Draft.",
      "Five seasons later, I won NFL MVP after throwing 35 touchdown passes and rushing for 10 more.",
    ],
  },
] as const;

describe("Football Who Am I authored calibration", () => {
  it.each(CALIBRATION_FIXTURES)(
    "preserves the owner-refined A/B calibration for $league $name",
    ({ league, name, scriptA, scriptB }) => {
      const identity = getFootballWhoAmIAuthoredIdentity(league, name);
      expect(identity).toBeDefined();
      expect(identity!.scripts.A!.clues.map((clue) => clue.text)).toEqual(scriptA);
      expect(identity!.scripts.B!.clues.map((clue) => clue.text)).toEqual(scriptB);
    },
  );

  it.each(CALIBRATION_FIXTURES)(
    "keeps $league $name on two materially different authored routes",
    ({ league, name }) => {
      const identity = getFootballWhoAmIAuthoredIdentity(league, name)!;
      const a = identity.scripts.A!.clues.map((clue) => clue.text);
      const b = identity.scripts.B!.clues.map((clue) => clue.text);

      expect(a).toHaveLength(10);
      expect(b).toHaveLength(10);
      expect(a.filter((text) => b.includes(text))).toHaveLength(0);
      expect(a.slice(0, 5)).not.toEqual(b.slice(0, 5));
      expect(a.slice(8)).not.toEqual(b.slice(8));
    },
  );
});
