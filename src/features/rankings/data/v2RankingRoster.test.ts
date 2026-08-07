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
      "Randy Couture",
      "Israel Adesanya",
      "Alex Pereira",
      "Chuck Liddell",
      "Charles Oliveira",
      "Amanda Nunes",
    ]);
    expect(sourceOverrides).toMatchObject({
      factsVersion: "octagon-hq-v2-rda-20260730",
      judgmentVersion: "octagon-hq-v2-amanda-nunes-profile-20260807",
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
    expect(input?.facts.fights).toHaveLength(34);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "win"),
    ).toHaveLength(20);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "loss"),
    ).toHaveLength(14);
    expect(input?.facts.primeWindow).toEqual({
      startFightId: "2014-08-23-benson-henderson",
      endFightId: "2019-05-18-kevin-lee",
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
    expect(fighter?.visibleStats.ufcRecord).toBe("20-14");
    expect(fighter?.visibleStats.primeRecord).toBe("8-4");
    expect(fighter?.visibleStats.titleFightWins).toBe(2);
    expect(fighter?.rank).toBeGreaterThan(0);
    expect(fighter?.ovr).toBeLessThanOrEqual(99);

    const colby = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Colby Covington",
    );
    const usman = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Kamaru Usman",
    );
    expect(colby).toMatchObject({ phase: "prime", upwardDivision: true });
    expect(usman).toMatchObject({ phase: "prime", upwardDivision: true });
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
