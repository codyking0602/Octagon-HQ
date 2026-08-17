import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";

const current = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find(
    (candidate) => candidate.fighter === name,
  );
  if (!fighter) throw new Error(`Missing current fighter ${name}.`);
  return fighter;
};

const approved = {
  "Jon Jones": {
    oneLiner:
      "Jones is the UFC's ultimate problem-solver: freakishly long, creative, ruthless in the clinch, elite in wrestling, and brilliant at adapting mid-fight. His dominance, longevity, aura, and controversies are inseparable from a career that has defined multiple eras.",
    whyRankedHere:
      "Jones built the deepest championship resume in UFC history. He became the youngest champion, won 16 title fights, collected 12 Top-5 victories, and beat generations of elite opposition including Mauricio Rua, Lyoto Machida, Daniel Cormier, and Alexander Gustafsson. Heavyweight title wins over Ciryl Gane and Stipe Miocic extended that dominance into a second division.",
    whyNotHigher:
      "The resume carries real blemishes despite the competitive dominance. Drug-testing failures, suspensions, stripped titles, and the overturned Daniel Cormier result interrupted his reign and complicate the legacy. Close decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes also created legitimate debate around portions of an otherwise extraordinary championship run.",
  },
  "Glover Teixeira": {
    oneLiner:
      "Teixeira's story starts with becoming UFC champion at 42, the payoff to a career built on durability, pressure boxing, takedowns, punishing top control, and a submission game that stayed dangerous late.",
    whyRankedHere:
      "Sixteen UFC wins, thirteen over ranked opponents, and seven Top-5 victories give Teixeira exceptional light-heavyweight depth. He beat contenders across multiple eras, then submitted Jan Blachowicz for the title at 42, turning remarkable longevity into a championship breakthrough.",
    whyNotHigher:
      "His championship peak was brief: one title-fight win and no successful defense. He also lost repeatedly during his prime, including decisive defeats to Anthony Johnson, Alexander Gustafsson, and Corey Anderson, leaving a less consistent elite run than the stronger cases above him.",
  },
  "Conor McGregor": {
    oneLiner:
      "McGregor became the UFC's biggest superstar, pairing unmatched aura and theatrical confidence with lethal counterstriking. His timing, distance control, and straight left made him electric while pushing MMA further into the mainstream.",
    whyRankedHere:
      "McGregor produced two of the UFC's defining championship performances, knocking out Jose Aldo in 13 seconds and dismantling Eddie Alvarez to become the first simultaneous two-division champion. Wins over Chad Mendes, Max Holloway, Dustin Poirier, and Nate Diaz add depth beneath an extraordinary competitive peak.",
    whyNotHigher:
      "The elite body of work is short. McGregor never defended either UFC title and spent long stretches inactive. Losses to Khabib Nurmagomedov and Dustin Poirier limited the championship run, while Max Holloway's 2026 knockout added another major defeat after the peak had already faded.",
  },
  "Mackenzie Dern": {
    oneLiner:
      "Dern's identity starts with world-class jiu-jitsu and the constant threat that one scramble can end the fight. Aggressive transitions, back takes, and opportunistic submissions remain her signature, while improved striking and composure helped carry her to UFC gold.",
    whyRankedHere:
      "Dern has built a 12-5 UFC record with eight ranked wins, then converted that long contender run into championship success. She won the vacant strawweight title over Virna Jandiroba and successfully defended it against Gillian Robertson, giving her two title-fight wins and an active reign.",
    whyNotHigher:
      "Her championship case is still young: the belt came through a vacant-title fight and she has only one successful defense. Earlier losses to Marina Rodriguez, Yan Xiaonan, Jessica Andrade, and Amanda Lemos also showed real inconsistency against upper-level contenders before her title run.",
  },
} as const;

describe("reviewed fighter profile copy protection", () => {
  it("preserves presentation during data-only ranking refreshes", async () => {
    const { rankingDataRefresh } = await import("./v2RankingRoster");
    const fighter = current("Mackenzie Dern");
    const refreshed = rankingDataRefresh(fighter, { facts: fighter.facts });
    expect(refreshed.presentation).toBe(fighter.presentation);
  });

  it("keeps every approved calibration profile exact", () => {
    for (const [name, presentation] of Object.entries(approved)) {
      expect(current(name).presentation).toMatchObject(presentation);
    }
  });

  it("keeps refreshed ranking data while presentation stays locked", () => {
    expect(current("Dricus du Plessis").facts.fights.filter((fight) => fight.id === "2026-07-18-kamaru-usman")).toHaveLength(1);
    expect(current("Kamaru Usman").facts.fights.filter((fight) => fight.id === "2026-07-18-dricus-du-plessis")).toHaveLength(1);
    expect(current("Mackenzie Dern").facts.fights.filter((fight) => fight.id === "2026-08-15-gillian-robertson")).toHaveLength(1);
    expect(current("Islam Makhachev").facts.fights.filter((fight) => fight.id === "2026-08-15-ian-machado-garry")).toHaveLength(1);
    expect(current("Conor McGregor").facts.fights.find((fight) => fight.id === "2026-07-11-max-holloway")?.methodCategory).toBe("ko-tko");
  });
});
