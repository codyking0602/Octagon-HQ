import type { WhoAmIClueBand } from "./whoAmIEngine";

export type UfcWhoAmIAuthoredScriptId = "A" | "B" | "C";
export type UfcWhoAmIAuthoredEarlyRotation = "normal" | "deprioritized";

export interface UfcWhoAmIAuthoredClue {
  id: string;
  text: string;
  band: WhoAmIClueBand;
  verification: "verified";
  sourceIds: readonly string[];
}

export interface UfcWhoAmIAuthoredScript {
  id: UfcWhoAmIAuthoredScriptId;
  clues: readonly UfcWhoAmIAuthoredClue[];
}

export interface UfcWhoAmIAuthoredIdentity {
  subjectId: string;
  name: string;
  earlyRotation: UfcWhoAmIAuthoredEarlyRotation;
  sources: Readonly<Record<string, string>>;
  scripts: Readonly<Partial<Record<UfcWhoAmIAuthoredScriptId, UfcWhoAmIAuthoredScript>>>;
}

/**
 * UFC authored-clue contract:
 * - two materially different ten-clue scripts per fighter
 * - clues 1-4 create possibilities; 5-7 narrow; 8-10 identify
 * - title résumé, signature fights, style/background and career path beat generic counts
 * - opponent and nickname anchors generally stay late
 * - distinctive geography, nationality and gym/camp combinations stay out of clues 1-4 when they would identify the fighter too quickly
 * - signature opponents and defining title-fight names generally stay out of clues 1-4
 * - every clue is verified against the existing research archive and/or direct UFC authority
 * - authored text is served verbatim; runtime must never reconstruct these clues
 */
export const ufcWhoAmIAuthoredIdentities: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    subjectId: "ufc:khabib-nurmagomedov",
    name: "Khabib Nurmagomedov",
    earlyRotation: "normal",
    sources: {
      making: "https://www.ufc.com/news/making-khabib-nurmagomedov",
      hof: "https://www.ufc.com/news/khabib-eagle-nurmagomedov-named-ufc-hall-fame-class-2022",
      road: "https://www.ufc.com/news/road-ufc-229-khabibs-run-lightweight-dominance",
      profile: "https://www.ufc.com/athlete/khabib-nurmagomedov?id=&page=1",
      retired: "https://www.ufc.com/news/khabib-nurmagomedov-officially-retires"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-khabib-nurmagomedov-a-1", text: "My father initially wanted me to focus on school before taking a larger role in my fight training.", band: "broad", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-khabib-nurmagomedov-a-2", text: "I turned professional in mixed martial arts in 2008.", band: "broad", verification: "verified", sourceIds: ["making", "hof"] },
          { id: "ufc-khabib-nurmagomedov-a-3", text: "Before reaching the UFC, I built a background across wrestling, judo and combat sambo.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-khabib-nurmagomedov-a-4", text: "I arrived in the UFC with an unbeaten professional record.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-khabib-nurmagomedov-a-5", text: "My UFC debut ended with a rear-naked choke victory in Nashville in 2012.", band: "helpful", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-khabib-nurmagomedov-a-6", text: "A 2014 decision win over Rafael dos Anjos became one of the important victories in my climb at lightweight.", band: "strong", verification: "verified", sourceIds: ["profile", "hof"] },
          { id: "ufc-khabib-nurmagomedov-a-7", text: "I won a vacant UFC lightweight championship by going five rounds with Al Iaquinta.", band: "strong", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-khabib-nurmagomedov-a-8", text: "I defended that championship by submitting Dustin Poirier in the third round in Abu Dhabi.", band: "strong", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-khabib-nurmagomedov-a-9", text: "I closed my professional career with a second-round submission of Justin Gaethje in a title unification bout.", band: "giveaway", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-khabib-nurmagomedov-a-10", text: "I retired as the reigning lightweight champion with a perfect 29-0 professional record.", band: "giveaway", verification: "verified", sourceIds: ["hof", "retired"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-khabib-nurmagomedov-b-1", text: "I grew up competing in fighting environments from a young age and credited that experience for giving me unusual calm in competition.", band: "broad", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-khabib-nurmagomedov-b-2", text: "My father recognized my potential and began training me with the goal of making me an elite fighter in 2005.", band: "broad", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-khabib-nurmagomedov-b-3", text: "My professional debut ended in a first-round submission before I had ever fought in the UFC.", band: "helpful", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-khabib-nurmagomedov-b-4", text: "Early in my UFC run, I stopped Thiago Tavares in the first round with punches and elbows.", band: "helpful", verification: "verified", sourceIds: ["road", "profile"] },
          { id: "ufc-khabib-nurmagomedov-b-5", text: "I submitted Michael Johnson with a kimura at UFC 205.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-khabib-nurmagomedov-b-6", text: "I dominated Edson Barboza over three rounds immediately before receiving my UFC title opportunity.", band: "strong", verification: "verified", sourceIds: ["profile", "road"] },
          { id: "ufc-khabib-nurmagomedov-b-7", text: "My championship fight at UFC 223 changed opponents multiple times during fight week before I ultimately faced a late replacement.", band: "strong", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-khabib-nurmagomedov-b-8", text: "My first title defense came against Conor McGregor and ended by fourth-round submission.", band: "strong", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-khabib-nurmagomedov-b-9", text: "My last three UFC fights were championship submissions of McGregor, Poirier and Gaethje.", band: "giveaway", verification: "verified", sourceIds: ["retired", "hof"] },
          { id: "ufc-khabib-nurmagomedov-b-10", text: "I was inducted into the UFC Hall of Fame in 2022 after a career associated with the nickname “The Eagle.”", band: "giveaway", verification: "verified", sourceIds: ["hof"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:georges-st-pierre",
    name: "Georges St-Pierre",
    earlyRotation: "normal",
    sources: {
      hof: "https://www.ufc.com/hof/georges-st-pierre-hall-of-fame",
      moments: "https://www.ufc.com/news/georges-st-pierre-defining-moments",
      retired: "https://www.ufc.com/news/ufc-and-canadian-icon-georges-st-pierre-retires",
      lineage: "https://www.ufc.com/news/ufc-welterweight-title-lineage",
      champchamp: "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-georges-st-pierre-a-1", text: "Being bullied by older and stronger kids helped push me toward martial arts as a child.", band: "broad", verification: "verified", sourceIds: ["retired"] },
          { id: "ufc-georges-st-pierre-a-2", text: "I made my UFC debut in 2004 with a decision victory over Karo Parisyan.", band: "broad", verification: "verified", sourceIds: ["retired", "hof"] },
          { id: "ufc-georges-st-pierre-a-3", text: "My first UFC title shot came against a fighter I had viewed as an idol, and I lost by first-round armbar.", band: "helpful", verification: "verified", sourceIds: ["moments"] },
          { id: "ufc-georges-st-pierre-a-4", text: "Two years later, I avenged that loss with a second-round TKO to win my first UFC championship.", band: "helpful", verification: "verified", sourceIds: ["moments", "lineage"] },
          { id: "ufc-georges-st-pierre-a-5", text: "I suffered a first-round upset loss to Matt Serra in my first defense of that belt.", band: "helpful", verification: "verified", sourceIds: ["moments", "lineage"] },
          { id: "ufc-georges-st-pierre-a-6", text: "I later won an interim championship by submitting Matt Hughes in the third fight of our trilogy.", band: "strong", verification: "verified", sourceIds: ["lineage", "moments"] },
          { id: "ufc-georges-st-pierre-a-7", text: "I regained the undisputed welterweight title by stopping Serra in Montreal at UFC 83.", band: "strong", verification: "verified", sourceIds: ["retired", "lineage"] },
          { id: "ufc-georges-st-pierre-a-8", text: "My second welterweight title reign included nine consecutive successful defenses.", band: "strong", verification: "verified", sourceIds: ["hof", "retired"] },
          { id: "ufc-georges-st-pierre-a-9", text: "After nearly four years away, I returned at Madison Square Garden and submitted Michael Bisping for a title in a second division.", band: "giveaway", verification: "verified", sourceIds: ["champchamp", "retired"] },
          { id: "ufc-georges-st-pierre-a-10", text: "I finished my UFC career as a two-division champion with a 26-2 professional record.", band: "giveaway", verification: "verified", sourceIds: ["hof", "retired"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-georges-st-pierre-b-1", text: "I was born in the small Quebec municipality of Saint-Isidore.", band: "broad", verification: "verified", sourceIds: ["retired"] },
          { id: "ufc-georges-st-pierre-b-2", text: "Before reaching the UFC, I worked my way through the Quebec regional promotion TKO MMA.", band: "broad", verification: "verified", sourceIds: ["retired"] },
          { id: "ufc-georges-st-pierre-b-3", text: "I won 20 of my 22 UFC appearances.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-georges-st-pierre-b-4", text: "One stretch of my UFC career reached 13 consecutive victories.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-georges-st-pierre-b-5", text: "Across my UFC career, I landed 90 takedowns.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-georges-st-pierre-b-6", text: "At UFC 129 in Toronto, I headlined a card attended by 55,724 fans.", band: "strong", verification: "verified", sourceIds: ["retired"] },
          { id: "ufc-georges-st-pierre-b-7", text: "My long championship run included wins over Jon Fitch, BJ Penn, Thiago Alves, Dan Hardy and Josh Koscheck in succession.", band: "strong", verification: "verified", sourceIds: ["lineage", "hof"] },
          { id: "ufc-georges-st-pierre-b-8", text: "Outside the Octagon, I appeared in Captain America: The Winter Soldier.", band: "strong", verification: "verified", sourceIds: ["retired"] },
          { id: "ufc-georges-st-pierre-b-9", text: "My final UFC appearance ended with a third-round technical submission to win the middleweight championship.", band: "giveaway", verification: "verified", sourceIds: ["champchamp"] },
          { id: "ufc-georges-st-pierre-b-10", text: "I entered the UFC Hall of Fame’s Modern Wing as one of Canada’s defining MMA stars.", band: "giveaway", verification: "verified", sourceIds: ["hof", "retired"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:amanda-nunes",
    name: "Amanda Nunes",
    earlyRotation: "normal",
    sources: {
      hof: "https://www.ufc.com/hof/amanda-nunes-hall-of-fame",
      goat: "https://www.ufc.com/news/amanda-nunes-forever-goat",
      champchamp: "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250",
      comfort: "https://www.ufc.com/news/amanda-nunes-loves-stepping-out-of-her-comfort-zone-ufc-289",
      lineage: "https://www.ufc.com/news/ufc-womens-bantamweight-title-lineage-Rousey-Holm-Tate-Nunes-Pena",
      return2026: "https://www.ufc.com/news/gane-hokit-harrison-nunes-headline-ufc-334-new-york-city",
      early: "https://www.ufc.com/news/super-seven-amanda-nunes"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-amanda-nunes-a-1", text: "Before reaching the UFC, I competed under both the Strikeforce and Invicta FC banners.", band: "broad", verification: "verified", sourceIds: ["early"] },
          { id: "ufc-amanda-nunes-a-2", text: "My UFC debut in 2013 ended with a first-round stoppage.", band: "broad", verification: "verified", sourceIds: ["early"] },
          { id: "ufc-amanda-nunes-a-3", text: "I won each of my first two UFC appearances by first-round stoppage.", band: "helpful", verification: "verified", sourceIds: ["early"] },
          { id: "ufc-amanda-nunes-a-4", text: "After a setback in 2014, I put together three straight UFC wins to earn my first title opportunity.", band: "helpful", verification: "verified", sourceIds: ["early", "goat"] },
          { id: "ufc-amanda-nunes-a-5", text: "A 2016 win over Valentina Shevchenko helped move me into position for that title shot.", band: "helpful", verification: "verified", sourceIds: ["goat"] },
          { id: "ufc-amanda-nunes-a-6", text: "I won my first UFC championship by submitting Miesha Tate in the first round at UFC 200.", band: "strong", verification: "verified", sourceIds: ["goat", "lineage"] },
          { id: "ufc-amanda-nunes-a-7", text: "I later moved up a division and stopped Cris Cyborg in 51 seconds.", band: "strong", verification: "verified", sourceIds: ["goat", "champchamp"] },
          { id: "ufc-amanda-nunes-a-8", text: "That victory made me the first woman to hold UFC championships in two weight classes.", band: "strong", verification: "verified", sourceIds: ["champchamp"] },
          { id: "ufc-amanda-nunes-a-9", text: "I became the first simultaneous two-division UFC champion to successfully defend both belts.", band: "giveaway", verification: "verified", sourceIds: ["champchamp", "goat"] },
          { id: "ufc-amanda-nunes-a-10", text: "Known as “The Lioness,” I was inducted into the UFC Hall of Fame’s Modern Wing in 2025.", band: "giveaway", verification: "verified", sourceIds: ["hof"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-amanda-nunes-b-1", text: "My rise to the top accelerated after I won a close three-round fight over an opponent who would later become a dominant champion in another division.", band: "broad", verification: "verified", sourceIds: ["goat"] },
          { id: "ufc-amanda-nunes-b-2", text: "The first UFC belt I captured was the women’s bantamweight championship.", band: "broad", verification: "verified", sourceIds: ["lineage"] },
          { id: "ufc-amanda-nunes-b-3", text: "I defended that belt against Raquel Pennington in Brazil.", band: "helpful", verification: "verified", sourceIds: ["goat", "champchamp"] },
          { id: "ufc-amanda-nunes-b-4", text: "I stopped Holly Holm with a head kick after becoming a two-division champion.", band: "helpful", verification: "verified", sourceIds: ["comfort"] },
          { id: "ufc-amanda-nunes-b-5", text: "Against Germaine de Randamie, I leaned heavily on wrestling to neutralize a dangerous striker.", band: "helpful", verification: "verified", sourceIds: ["comfort"] },
          { id: "ufc-amanda-nunes-b-6", text: "I also defended my featherweight championship against Felicia Spencer and Megan Anderson.", band: "strong", verification: "verified", sourceIds: ["comfort", "champchamp"] },
          { id: "ufc-amanda-nunes-b-7", text: "I lost my bantamweight title to Julianna Peña by second-round submission at UFC 269.", band: "strong", verification: "verified", sourceIds: ["lineage"] },
          { id: "ufc-amanda-nunes-b-8", text: "I reclaimed that belt by dominating Peña over five rounds in their rematch at UFC 277.", band: "strong", verification: "verified", sourceIds: ["comfort", "lineage"] },
          { id: "ufc-amanda-nunes-b-9", text: "I announced my retirement after a five-round title defense against Irene Aldana at UFC 289, then later set plans to return.", band: "giveaway", verification: "verified", sourceIds: ["goat", "lineage", "return2026"] },
          { id: "ufc-amanda-nunes-b-10", text: "My comeback was booked as a women’s bantamweight title challenge against Kayla Harrison in 2026.", band: "giveaway", verification: "verified", sourceIds: ["return2026"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:max-holloway",
    name: "Max Holloway",
    earlyRotation: "normal",
    sources: {
      career: "https://www.ufc.com/news/max-holloway-career-highlights-ufc-308-topuria-vs-holloway-abu-dhabi",
      hometown: "https://www.ufc.com/news/max-holloway-diamond-paradise",
      profile: "https://www.ufc.com/athlete/max-holloway?page=2",
      lifetime: "https://www.ufc.com/news/max-holloway-expects-performance-lifetime-co-main-ufc-276",
      records: "https://www.ufc.com/news/max-holloway-chasing-all-records-main-event-ufc-308"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-max-holloway-a-1", text: "I entered the UFC before my 21st birthday.", band: "broad", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-2", text: "A friend helped bring me into formal fight training after a trainer noticed my natural ability on a speed bag.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-max-holloway-a-3", text: "I developed from a young UFC prospect into the centerpiece of a long featherweight winning streak.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-4", text: "I first captured UFC gold by winning an interim featherweight championship.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-5", text: "I stopped José Aldo twice in 2017, both times in the third round.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-6", text: "One of my title defenses ended after four rounds when Brian Ortega could not continue.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-7", text: "I later defended the featherweight belt by winning a five-round decision over Frankie Edgar.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-8", text: "Against Calvin Kattar, I landed 445 significant strikes in a record-breaking five-round performance.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-a-9", text: "My nickname “Blessed” came from a coach who said I was blessed because of how quickly I progressed in fighting.", band: "giveaway", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-max-holloway-a-10", text: "At UFC 300, I won the BMF title by knocking out Justin Gaethje at 4:59 of the fifth round.", band: "giveaway", verification: "verified", sourceIds: ["career", "records"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-max-holloway-b-1", text: "Before fighting became my profession, I worked as a handyman.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-max-holloway-b-2", text: "My son Rush has been a visible part of my fight life and a major source of motivation.", band: "broad", verification: "verified", sourceIds: ["lifetime"] },
          { id: "ufc-max-holloway-b-3", text: "I received the UFC Forrest Griffin Community Award in 2022.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-4", text: "I challenged Dustin Poirier for an interim lightweight title in 2019 and lost a five-round decision.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-5", text: "I lost the featherweight championship to Alexander Volkanovski by decision later that year.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-6", text: "An immediate rematch with Volkanovski ended in a split-decision loss.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-7", text: "I rebounded from championship losses with a five-round win over Yair Rodriguez.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-8", text: "I knocked out Chan Sung Jung in the third round in 2023.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-9", text: "During a dominant performance against Calvin Kattar, I looked away from my opponent while shouting that I was the UFC’s best boxer.", band: "giveaway", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-max-holloway-b-10", text: "I am a Hawaiian former featherweight champion whose career later added the UFC’s BMF championship.", band: "giveaway", verification: "verified", sourceIds: ["career", "records"] }
        ]
      }
    }
  }
];

export function getUfcWhoAmIAuthoredIdentity(subjectId: string) {
  return ufcWhoAmIAuthoredIdentities.find((identity) => identity.subjectId === subjectId) ?? null;
}
