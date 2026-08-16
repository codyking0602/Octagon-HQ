import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getFighter } from "../rankingModel";
import {
  canonicalRankingInputs,
  historicalRankingMigrationInputs,
} from "./rankingInputs";
import {
  v2RankingRoster,
  type V2RankingRosterOverlay,
} from "./v2RankingRoster";

const projectRoot = resolve(process.cwd());

const sourceOverrides: Pick<
  V2RankingRosterOverlay,
  | "modelAsOfDate"
  | "factsVersion"
  | "judgmentVersion"
  | "eraLedgerVersion"
  | "eraDepthVersion"
  | "eraDepthResolutionVersion"
> = {
  modelAsOfDate: v2RankingRoster.modelAsOfDate,
  factsVersion: v2RankingRoster.factsVersion,
  judgmentVersion: v2RankingRoster.judgmentVersion,
  eraLedgerVersion: v2RankingRoster.eraLedgerVersion,
  eraDepthVersion: v2RankingRoster.eraDepthVersion,
  eraDepthResolutionVersion: v2RankingRoster.eraDepthResolutionVersion,
};

describe("V2 ranking roster overlay", () => {
  it("adds Rafael dos Anjos without changing the sealed baseline", () => {
    expect(v2RankingRoster.additions).toHaveLength(1);
    expect(Object.keys(v2RankingRoster.replacements)).toEqual([
      "Jose Aldo",
      "Stipe Miocic",
      "Daniel Cormier",
      "Jon Jones",
      "Georges St-Pierre",
      "Randy Couture",
      "Israel Adesanya",
      "Alex Pereira",
      "Chuck Liddell",
      "Charles Oliveira",
      "Amanda Nunes",
      "Dustin Poirier",
      "Robert Whittaker",
      "Kayla Harrison",
      "Khamzat Chimaev",
      "Islam Makhachev",
      "Robbie Lawler",
    ]);
    expect(sourceOverrides).toMatchObject({
      factsVersion: "octagon-hq-v2-rda-facts-20260807",
      judgmentVersion: "octagon-hq-v2-georges-st-pierre-profile-20260816",
      eraDepthVersion: "octagon-hq-v2-rda-20260730",
      eraDepthResolutionVersion: "octagon-hq-v2-rda-20260730",
    });
    expect(canonicalRankingInputs.counts).toEqual({
      fighters: 81,
      men: 66,
      women: 15,
    });

    const input = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Rafael dos Anjos",
    );
    expect(input).toBeDefined();
    expect(input?.facts.fights).toHaveLength(36);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "win"),
    ).toHaveLength(21);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "loss"),
    ).toHaveLength(15);
    expect(input?.facts.fights.find((fight) => fight.opponent === "Clay Guida")).toMatchObject({
      date: "2010-08-07",
      officialResult: "loss",
      division: "Lightweight",
    });
    expect(input?.facts.fights.find((fight) => fight.opponent === "Anthony Njokuani")).toMatchObject({
      date: "2012-07-11",
      officialResult: "win",
      division: "Lightweight",
    });
    expect(input?.facts.fights.find((fight) => fight.opponent === "Mark Bocek")).toMatchObject({
      id: "2012-11-17-mark-bocek",
      date: "2012-11-17",
    });
    expect(
      input?.judgments.opponentQuality.inputs.find((row) => row.opponent === "Mark Bocek"),
    ).toMatchObject({
      fightId: "2012-11-17-mark-bocek",
      date: "2012-11-17",
    });
    expect(input?.facts.primeWindow).toEqual({
      startFightId: "2014-08-23-benson-henderson",
      endFightId: "2019-07-20-leon-edwards",
      open: false,
    });
    expect(canonicalRankingInputs.filters.eraMembership["Rafael dos Anjos"]).toEqual({
      primary: "golden-age",
      secondary: "superstar",
    });
  });

  it("replaces only Amanda Nunes's approved profile copy", () => {
    const oneLiner = "Nunes combined crushing power with patience, timing, and complete versatility. She could pressure behind heavy boxing, wrestle when needed, punish mistakes instantly, and turn one clean opening into a finish before opponents could settle into their game plan.";
    const whyRankedHere = "Nunes built the strongest UFC resume in women's MMA: championships at bantamweight and featherweight, sustained title success, and victories over nearly every defining champion of her era. She stopped Ronda Rousey, Cris Cyborg, Holly Holm, and Miesha Tate, beat Valentina Shevchenko twice, and later reclaimed the bantamweight belt from Julianna Pena.";
    const whyNotHigher = "Nunes does have real blemishes: she lost the bantamweight title to Julianna Pena in a massive upset, dropped multiple UFC fights before her championship peak, and barely edged Valentina Shevchenko in their second meeting. But she avenged Pena decisively, beat Shevchenko twice, and built enough elite championship work around those setbacks that they never seriously threaten her place at the top.";
    const historical = historicalRankingMigrationInputs.fighters.find((fighter) => fighter.fighter === "Amanda Nunes");
    const current = canonicalRankingInputs.fighters.find((fighter) => fighter.fighter === "Amanda Nunes");
    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({ ...historical?.presentation, oneLiner, whyRankedHere, whyNotHigher });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) expect(value).toMatch(/^[\x00-\x7F]+$/);
  });

  it("replaces only Dustin Poirier's approved profile copy", () => {
    const oneLiner = "Poirier's peak was built on pressure boxing, durability, and ruthless combination work. He could survive violent exchanges, keep a punishing pace, and break elite lightweights with layered punches, body work, and opportunistic grappling when fights turned chaotic.";
    const whyRankedHere = "Poirier's 22 UFC wins are backed by unusual opponent quality and longevity. He won the interim lightweight title over Max Holloway, owns two UFC wins over Holloway and Conor McGregor, and beat Justin Gaethje, Eddie Alvarez, Anthony Pettis, Michael Chandler, and Dan Hooker. That depth gives him a stronger case than many fighters with thinner championship resumes.";
    const whyNotHigher = "The ceiling is championship achievement. Poirier never won the undisputed lightweight title, losing title fights to Khabib Nurmagomedov, Charles Oliveira, and Islam Makhachev. The Gaethje rematch knockout added another major setback during his late prime. His final loss to Max Holloway came post-prime, but the fighters above him generally paired comparable elite wins with sustained undisputed reigns.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Dustin Poirier",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Dustin Poirier",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Robert Whittaker's approved profile copy", () => {
    const oneLiner = "Whittaker's peak combined darting karate footwork, explosive boxing entries, sharp counters, and elite takedown defense, letting him control range while sustaining a punishing pace.";
    const whyRankedHere = "Whittaker's UFC resume has rare middleweight depth: two wins over Yoel Romero, including the interim-title victory, plus Jacare Souza, Jared Cannonier, Paulo Costa, and Marvin Vettori. Years of ranked wins separate him from the tier below.";
    const whyNotHigher = "The lack of an official title-defense streak limits Whittaker's ceiling, and Adesanya beat him twice during his championship window. Later finish losses to Dricus du Plessis and Khamzat Chimaev further separate him from fighters with deeper reigns.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Robert Whittaker",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Robert Whittaker",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Kayla Harrison's approved profile copy", () => {
    const oneLiner = "Harrison's UFC peak has been built on suffocating grappling control, relentless takedown pressure, heavy top positioning, and submission danger that lets her dictate rounds from start to finish.";
    const whyRankedHere = "A perfect 3-0 UFC run already includes taking the bantamweight title from reigning champion Julianna Pena, plus wins over former champion Holly Holm and top contender Ketlen Vieira. Few fighters have built that much quality in three appearances.";
    const whyNotHigher = "The limitation is simple: three UFC fights, one title-fight win, and no defenses. The women above Harrison built longer elite runs and deeper championship resumes, and her late UFC arrival leaves little time to match that volume.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Kayla Harrison",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Kayla Harrison",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Khamzat Chimaev's approved profile copy", () => {
    const oneLiner = "Chimaev overwhelmed opponents with relentless wrestling pressure, physical control, and submission danger, turning early takedowns into long stretches of dominance and fast finishes.";
    const whyRankedHere = "The UFC title win over Dricus du Plessis gives his resume championship weight. Wins over Robert Whittaker and Gilbert Burns, plus Kamaru Usman, back the peak with elite names, while a nine-fight UFC winning streak and four top-five wins separate him from shorter contender resumes.";
    const whyNotHigher = "One UFC title win with no successful defense is still a thin championship case. The Sean Strickland title loss ended the unbeaten run, and Chimaev's elite window is much shorter than the sustained title-fight volume and longevity of the fighters above him.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Khamzat Chimaev",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Khamzat Chimaev",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Islam Makhachev's approved profile copy", () => {
    const oneLiner = "Islam's peak combines suffocating control with rare finishing efficiency. He dictates where fights happen through pressure, wrestling, and top control, then forces mistakes with submissions or dangerous striking. He can dominate rounds without giving up the threat of a finish.";
    const whyRankedHere = "Islam has a 17-1 UFC record, six title-fight wins, and a 10-0 prime run. He submitted Charles Oliveira for the lightweight belt, defended it four times, including twice against Alexander Volkanovski, then beat Jack Della Maddalena over five rounds to become welterweight champion. That championship volume and elite-win quality separate him from the tier below.";
    const whyNotHigher = "The strongest case against moving Islam higher is career length, not peak quality. His elite run is still shorter than the sustained championship eras of the UFC greats above him. The Adriano Martins knockout is a UFC loss, even if it came well before his prime. He is still active at an elite level, so that longevity deficit can shrink.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Islam Makhachev",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Islam Makhachev",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Robbie Lawler's approved profile copy", () => {
    const oneLiner = "Lawler's peak paired a crushing southpaw left with sharp counters, elite durability, savage pocket work, and late-round surges that could turn momentum into a finish.";
    const whyRankedHere = "Lawler earned this tier by winning the UFC welterweight title from Johny Hendricks, stopping Rory MacDonald in the fifth round of a title defense, and beating Carlos Condit. Two successful defenses separate him from thinner championship resumes.";
    const whyNotHigher = "The limit is the short reign: Hendricks and Condit were split-decision wins, then Woodley took the belt by first-round knockout. Fighters above Lawler sustained championship control longer and stacked more elite UFC results.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Robbie Lawler",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Robbie Lawler",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Jose Aldo's approved profile copy", () => {
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Jose Aldo",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Jose Aldo",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner: "At his best, Aldo combined explosive speed, brutal leg kicks, elite takedown defense, and calm counterstriking. He won nearly seven of every ten scored rounds during his prime, controlling championship fights without needing to chase finishes.",
      whyRankedHere: "Eight UFC title-fight wins, two victories each over Frankie Edgar and Chad Mendes, and a deep list of ranked wins give Aldo both championship success and real depth. He repeatedly beat elite contenders and remained dangerous long after his original title reign ended.",
      whyNotHigher: "Part of Aldo's championship legacy happened before he entered the UFC, while his defining UFC losses came against the featherweights who followed him. McGregor stopped him immediately, Holloway finished him twice, and Volkanovski clearly beat him. His bantamweight run added longevity, but not another title-level peak.",
    });
    expect(
      `${current?.presentation.oneLiner}${current?.presentation.whyRankedHere}${current?.presentation.whyNotHigher}`,
    ).toMatch(/^[\x00-\x7F]+$/);
  });

  it("replaces only Stipe Miocic's approved profile reasoning", () => {
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Stipe Miocic",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Stipe Miocic",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      whyRankedHere: "Stipe built the greatest heavyweight resume in UFC history through sustained championship success rather than one dominant run. He owns the division's record for consecutive title defenses, reclaimed the belt after defeat, defeated Daniel Cormier twice in their trilogy, and consistently beat championship-caliber heavyweights across multiple eras. No UFC heavyweight combines championship accomplishment, elite wins, and longevity as completely.",
      whyNotHigher: "Heavyweight has never offered the week-to-week depth or sustained elite competition of divisions like welterweight or lightweight, limiting how high even its greatest champion can climb. Stipe also lacks the extended championship dominance of the fighters above him, and his prime includes decisive losses to Daniel Cormier and Francis Ngannou before the late-career Jon Jones defeat.",
    });
    expect(
      `${current?.presentation.whyRankedHere}${current?.presentation.whyNotHigher}`,
    ).toMatch(/^[\x00-\x7F]+$/);
  });

  it("replaces only Daniel Cormier's approved profile copy", () => {
    const oneLiner = "Cormier turned a short, powerful frame into a pressure weapon, crowding opponents with hand fighting, dirty boxing, body locks, and chain wrestling. His balance, pace, and top control let him dictate fights against much larger men.";
    const whyRankedHere = "Cormier became champion in both of the UFC's heaviest divisions, made three successful light heavyweight defenses, knocked out Stipe Miocic to claim heavyweight gold, and defended that belt against Derrick Lewis. Wins over Anthony Johnson twice, Alexander Gustafsson, Volkan Oezdemir, and Miocic give him enough elite championship work to separate him from fighters with thinner title records or success in only one division.";
    const whyNotHigher = "His ceiling is set by the rivals who defined each title run. Jon Jones handed him his only official light heavyweight loss and remained the superior 205-pound fighter, while Stipe Miocic won their heavyweight trilogy 2-1 and beat him in his final two bouts. Cormier entered the UFC at 34, so his elite window was shorter than the longer-reigning champions above him.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Daniel Cormier",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Daniel Cormier",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Jon Jones's approved profile copy", () => {
    const oneLiner = "At his best, Jones controlled fights before opponents could establish their own game. His length, oblique and side kicks, clinch elbows, and chain wrestling let him dominate distance and punish every attempted adjustment. He could win methodical rounds, turn scrambles into top control, or finish with ground strikes and submissions. His greatest weapon was how quickly he solved elite opponents.";
    const whyRankedHere = "Jones has the strongest championship resume in UFC history. He became the youngest champion, earned a record 16 title-fight wins, and beat generations of elite opposition from Mauricio Rua and Lyoto Machida through Daniel Cormier and Alexander Gustafsson. He later added heavyweight title wins over Ciryl Gane and Stipe Miocic. Twelve top-five wins and more than a decade of elite success separate him from every other case.";
    const whyNotHigher = "The case against greater separation rests on three things: disputed decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes; long absences that repeatedly interrupted his championship years; and a heavyweight resume built on only two wins. Suspensions, stripped titles, and stalled activity kept him from producing an even cleaner reign. Those flaws narrow the gap, but no rival owns the stronger UFC resume.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Jon Jones",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Jon Jones",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    expect(`${oneLiner}${whyRankedHere}${whyNotHigher}`).toMatch(/^[\x00-\x7F]+$/);
  });

  it("replaces only Georges St-Pierre's approved profile copy", () => {
    const oneLiner = "St-Pierre controlled fights with a sharp jab, explosive takedowns, suffocating top pressure, and elite defensive awareness. His prime stood out for adaptability, pace, and the ability to dictate where exchanges happened while banking rounds with remarkable consistency.";
    const whyRankedHere = "St-Pierre built one of the UFC's deepest championship resumes at welterweight, beating Matt Hughes, BJ Penn, Jon Fitch, Carlos Condit, and elite contenders across multiple generations. He avenged both UFC losses, then returned after four years away to win the middleweight title, adding two-division success to sustained divisional dominance.";
    const whyNotHigher = "The Serra upset is the clearest blemish on St-Pierre's prime, while Jones built a larger body of championship work and remained at the top for longer. St-Pierre's resume is cleaner than almost anyone else's, but against the strongest case above him, the difference is sustained title-level volume rather than quality of opposition.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Georges St-Pierre",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Georges St-Pierre",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Randy Couture's approved profile copy", () => {
    const oneLiner = "Couture forced elite opponents into his kind of fight. He closed distance with discipline, bullied them in the clinch, and mixed dirty boxing, takedowns, and top pressure with the composure and tactical intelligence to wear down younger, faster fighters.";
    const whyRankedHere = "Couture won UFC championships at heavyweight and light heavyweight, then kept adding major victories across different eras. He beat Vitor Belfort, Kevin Randleman, Pedro Rizzo, Chuck Liddell, Tito Ortiz, Tim Sylvia, and Gabriel Gonzaga, often with a title at stake. That two-division championship record, elite opponent list, and repeated ability to regain gold separate him from fighters with narrower peaks or thinner resumes.";
    const whyNotHigher = "Couture's championship highs were separated by too many losses and uneven stretches to match the cleaner cases above him. He never produced one long, dominant reign, and several elite rivals beat him decisively during or near title contention. His late-career heavyweight comeback was remarkable, but the full UFC record lacks the sustained control, consistency, and extended prime that define the highest tier.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Randy Couture",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Randy Couture",
    );
    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    expect(`${oneLiner}${whyRankedHere}${whyNotHigher}`).toMatch(/^[\x00-\x7F]+$/);
  });

  it("replaces only Israel Adesanya's approved profile copy", () => {
    const oneLiner = "Adesanya dictated fights through feints, stance changes, distance control, and elite counter striking. His kicks punished hesitation, while his reads made reckless entries dangerous. Once opponents became impatient, he turned small mistakes into knockdowns or sudden finishes without surrendering control.";
    const whyRankedHere = "Adesanya built one of the strongest UFC middleweight resumes ever: an interim title win over Kelvin Gastelum, a knockout of Robert Whittaker to unify the division, five defenses in his first reign, and a title-regaining knockout of Alex Pereira. Wins over Whittaker twice, Paulo Costa, Marvin Vettori, Jared Cannonier, and Yoel Romero give his championship run exceptional depth.";
    const whyNotHigher = "The case stops short of the highest tier because his later championship years became too uneven. Pereira ended his first reign, Sean Strickland clearly took the belt from him, and Dricus du Plessis submitted him in another title fight. The failed light heavyweight bid also denied him a second-division achievement, leaving more defining setbacks than the cleaner resumes above him.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Israel Adesanya",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Israel Adesanya",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Alex Pereira's approved profile copy", () => {
    const oneLiner = "Pereira was a patient pressure striker with terrifying composure. Calf kicks and feints narrowed the cage, his left hook punished bad reactions, and once opponents became predictable, he could end an elite fight in a single exchange.";
    const whyRankedHere = "Pereira built an extraordinary UFC resume. He stopped Israel Adesanya for middleweight gold, moved up to win the light heavyweight title, then added championship victories over Jiri Prochazka twice, Jamahal Hill, Khalil Rountree Jr., and Magomed Ankalaev. That two-division success and concentration of elite wins clearly separate him from fighters with shorter peaks or thinner title resumes.";
    const whyNotHigher = "Pereira still lacks the longevity and sustained control of the fighters above him. His elite UFC window is compact, he lost the first Ankalaev fight decisively before avenging it, and Adesanya and Ciryl Gane both stopped him. The Gane loss came at heavyweight, but it still interrupted the run.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Alex Pereira",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Alex Pereira",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Chuck Liddell's approved profile copy", () => {
    const oneLiner = "Liddell was the prototype sprawl-and-brawl destroyer. Elite defensive wrestling kept fights standing, while his awkward counters and right-hand power made every exchange dangerous. He could hurt opponents moving backward, then swarm once they were compromised.";
    const whyRankedHere = "Liddell's UFC resume carries serious championship weight. He took the light heavyweight title from Randy Couture, defended it four times, and added major wins over Couture, Tito Ortiz, Vitor Belfort, Renato Sobral, and Jeremy Horn. His 7-1 prime title stretch, finishing power, and repeated success against elite contenders separate him from fighters with shorter championship peaks.";
    const whyNotHigher = "The case against going higher is the damage around the edges of his reign. Couture stopped him before the title run, Rampage ended it in the first round, and Liddell went 1-5 over his final six UFC fights. Most of that collapse came from ages 37 to 40, but the fighters above him generally sustained elite results longer and finished cleaner.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Chuck Liddell",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Chuck Liddell",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("replaces only Charles Oliveira's approved profile copy", () => {
    const oneLiner = "Oliveira makes every exchange feel dangerous. His pressure, knees, elbows, opportunistic submissions, and fearless scrambles create constant chaos, while elite jiu-jitsu and sharp striking let him turn a single mistake into an immediate finish.";
    const whyRankedHere = "Oliveira's UFC resume combines championship success with historic finishing production. He stopped Michael Chandler to win the lightweight title, then finished Dustin Poirier and Justin Gaethje in consecutive championship fights. Later wins over Mateusz Gamrot and Max Holloway extended his relevance deep into his career, while his UFC records for finishes and submissions give the resume exceptional depth.";
    const whyNotHigher = "The limitation is consistency across the full UFC career. Oliveira lost eight times before becoming champion, Islam Makhachev decisively ended his title run, and later defeats to Arman Tsarukyan and Ilia Topuria kept him from rebuilding another sustained championship reign. At 36, he has added major late-career wins, but the fighters above him generally sustained elite success with fewer damaging setbacks.";
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Charles Oliveira",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Charles Oliveira",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.presentation.oneLiner).toBe(oneLiner);
    expect(current?.presentation.whyRankedHere).toBe(whyRankedHere);
    expect(current?.presentation.whyNotHigher).toBe(whyNotHigher);
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      oneLiner,
      whyRankedHere,
      whyNotHigher,
    });
    for (const value of [oneLiner, whyRankedHere, whyNotHigher]) {
      expect(value).toMatch(/^[\x00-\x7F]+$/);
    }
  });

  it("calculates Rafael dos Anjos through the canonical engine", () => {
    const fighter = getFighter("rafael-dos-anjos");
    expect(fighter).toBeDefined();
    expect(fighter?.visibleStats.ufcRecord).toBe("21-15");
    expect(fighter?.visibleStats.primeRecord).toBe("8-5");
    expect(fighter?.visibleStats.titleFightWins).toBe(2);
    expect(fighter?.rank).toBeGreaterThan(0);
    expect(fighter?.ovr).toBeLessThanOrEqual(99);

    const colby = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Colby Covington",
    );
    const usman = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Kamaru Usman",
    );
    const leon = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Leon Edwards",
    );
    expect(colby).toMatchObject({ phase: "prime", upwardDivision: false });
    expect(usman).toMatchObject({ phase: "prime", upwardDivision: false });
    expect(leon).toMatchObject({ phase: "prime", upwardDivision: false });
  });

  it("uses the existing local Rafael dos Anjos assets", () => {
    expect(
      existsSync(resolve(projectRoot, "public/assets/fighters/rafael-dos-anjos-thumb.webp")),
    ).toBe(true);
    expect(
      existsSync(resolve(projectRoot, "public/assets/fighters/rafael-dos-anjos-profile.webp")),
    ).toBe(true);
  });
});
