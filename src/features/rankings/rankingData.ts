import { fighterAsset } from "../../config/brand";

export type RankingFighter = {
  rank: number;
  slug: string;
  name: string;
  division: string;
  ovr: number;
  rawScore: number;
  championship: number;
  opponentQuality: number;
  primeDominance: number;
  longevity: number;
  penalty: number;
  thumbUrl: string;
  profileUrl: string;
  oneLiner: string;
  divisionStrength: string;
  whyRankedHere: string;
  whyNotHigher: string;
  judgmentCalls: string[];
};

const makeFighter = (
  fighter: Omit<RankingFighter, "thumbUrl" | "profileUrl">,
): RankingFighter => ({
  ...fighter,
  thumbUrl: fighterAsset(fighter.slug, "thumb"),
  profileUrl: fighterAsset(fighter.slug),
});

export const menAllTime: RankingFighter[] = [
  makeFighter({ rank: 1, slug: "jon-jones", name: "Jon Jones", division: "LHW / HW", ovr: 99, rawScore: 88.7, championship: 30, opponentQuality: 16.92, primeDominance: 27.2, longevity: 14.57, penalty: 0, oneLiner: "The UFC-only benchmark: unmatched title-level volume, elite longevity, and no real competitive loss.", divisionStrength: "Early light heavyweight is treated as full-strength; the later LHW/HW window is slightly discounted around 0.95.", whyRankedHere: "Jones owns the best total UFC-only case. He combines the model's top championship score with elite prime dominance and the longest meaningful championship-level run.", whyNotHigher: "He is the benchmark. The Hamill disqualification is not treated like a genuine competitive loss, while late-career division context prevents the score from becoming untouchable.", judgmentCalls: ["Hamill DQ is not a real competitive loss.", "Early LHW receives stronger division credit than the late LHW/HW window.", "UFC-only accomplishments drive the case."] }),
  makeFighter({ rank: 2, slug: "georges-st-pierre", name: "Georges St-Pierre", division: "WW / MW", ovr: 97, rawScore: 79.26, championship: 24.68, opponentQuality: 25, primeDominance: 22.73, longevity: 13.09, penalty: -6.25, oneLiner: "The complete champion case: elite wins, tactical control, longevity, and two avenged losses.", divisionStrength: "GSP's welterweight era receives a 1.05 strength default because of the depth and consistency of the contender field.", whyRankedHere: "GSP has the strongest opponent-quality score in the model and pairs it with a deep, complete championship résumé.", whyNotHigher: "The Hughes and Serra losses create real penalty separation from Jones, even though both were later avenged decisively.", judgmentCalls: ["Hughes 2004 is an early elite loss.", "Serra 2007 is the counted prime finished loss.", "Middleweight gold adds value without replacing the welterweight core."] }),
  makeFighter({ rank: 3, slug: "demetrious-johnson", name: "Demetrious Johnson", division: "FLW / BW", ovr: 95, rawScore: 65.94, championship: 22.59, opponentQuality: 12.88, primeDominance: 23.42, longevity: 10.05, penalty: -3, oneLiner: "A technical dominance case built on sustained flyweight control and one of the cleanest championship primes ever.", divisionStrength: "Flyweight defaults to 0.85, which lowers résumé value without dismissing the skill and dominance of the reign.", whyRankedHere: "Johnson's championship consistency and prime dominance remain GOAT-tier even after the UFC-only and division-strength adjustments.", whyNotHigher: "ONE is excluded, and the lighter flyweight opponent-strength treatment leaves him behind the two deeper UFC résumé cases.", judgmentCalls: ["ONE accomplishments are excluded.", "Flyweight strength matters, but dominance remains heavily respected.", "The Cejudo split loss is counted without overstating it."] }),
  makeFighter({ rank: 4, slug: "anderson-silva", name: "Anderson Silva", division: "MW / LHW", ovr: 94, rawScore: 59.31, championship: 20.89, opponentQuality: 12.2, primeDominance: 20.35, longevity: 10.37, penalty: -4.5, oneLiner: "The aura and peak-dominance case: a historic title run defined by separation, finishes, and inevitability.", divisionStrength: "Silva's middleweight era uses a 0.95 default, reflecting a strong reign in a less consistently deep division.", whyRankedHere: "Silva's championship peak and finishing aura remain among the greatest the UFC has produced.", whyNotHigher: "The Weidman losses count as in-prime losses, and the opponent-quality depth trails the three fighters above him.", judgmentCalls: ["Both Weidman losses count in the prime window.", "Later career losses are treated as post-prime.", "Peak aura is central but does not erase résumé context."] }),
  makeFighter({ rank: 5, slug: "islam-makhachev", name: "Islam Makhachev", division: "LW", ovr: 93, rawScore: 56.71, championship: 11.68, opponentQuality: 9.8, primeDominance: 28.07, longevity: 9.15, penalty: -2, oneLiner: "The modern lightweight control case: elite separation, championship growth, and a prime still adding chapters.", divisionStrength: "Modern elite lightweight receives the 1.10 murderers' row adjustment.", whyRankedHere: "Islam's prime-dominance score is already historic, and the strength of modern lightweight gives every elite win added weight.", whyNotHigher: "His total title résumé and opponent volume have not yet caught the longer completed reigns above him.", judgmentCalls: ["Prime starts around Drew Dober in 2021.", "Modern lightweight receives 1.10 division strength.", "The early Martins loss remains a pre-prime loss."] }),
  makeFighter({ rank: 6, slug: "khabib-nurmagomedov", name: "Khabib Nurmagomedov", division: "LW", ovr: 93, rawScore: 55.54, championship: 7.41, opponentQuality: 8.99, primeDominance: 28.82, longevity: 10.33, penalty: 0, oneLiner: "The cleanest unbeaten prime: overwhelming control, elite lightweight wins, and zero UFC loss penalty.", divisionStrength: "The lightweight murderers' row receives the 1.10 strength default.", whyRankedHere: "Khabib owns the strongest prime-dominance score in this first migration batch and never took a UFC loss.", whyNotHigher: "The title reign and elite-win volume are shorter than the championship résumés above him.", judgmentCalls: ["No UFC loss penalty.", "Prime begins around Rafael dos Anjos.", "Retirement preserved a clean peak but capped title volume and longevity."] }),
  makeFighter({ rank: 7, slug: "alexander-volkanovski", name: "Alexander Volkanovski", division: "FW / LW", ovr: 92, rawScore: 50.89, championship: 15, opponentQuality: 14.45, primeDominance: 16.74, longevity: 8.95, penalty: -4.25, oneLiner: "The complete modern featherweight case: title consistency, strong wins, adaptability, and direct era separation.", divisionStrength: "Modern featherweight receives a 1.05 default.", whyRankedHere: "Volkanovski checks every major category and owns direct championship separation over Holloway.", whyNotHigher: "The Topuria loss creates meaningful main-division drag, while the reduced Islam penalties still do not add résumé value.", judgmentCalls: ["Prime begins around Jose Aldo.", "Islam losses use reduced upward-division elite penalties.", "The Topuria loss counts as a main-division prime finished loss."] }),
  makeFighter({ rank: 8, slug: "randy-couture", name: "Randy Couture", division: "HW / LHW", ovr: 91, rawScore: 49.47, championship: 17.09, opponentQuality: 13.71, primeDominance: 17.58, longevity: 11.09, penalty: -10, oneLiner: "A two-division championship résumé with extraordinary age-defying relevance and major title-fight volume.", divisionStrength: "Heavyweight and light heavyweight context is handled by era rather than receiving a blanket bonus.", whyRankedHere: "Couture's championship accomplishment and longevity are genuinely historic in UFC-only terms.", whyNotHigher: "The loss penalty is severe, and his prime was less consistently dominant than the cleaner cases above him.", judgmentCalls: ["Two-division title work carries major value.", "Late-career relevance boosts longevity.", "Frequent losses prevent the résumé from climbing higher."] }),
  makeFighter({ rank: 9, slug: "max-holloway", name: "Max Holloway", division: "FW / LW", ovr: 91, rawScore: 49.14, championship: 9.02, opponentQuality: 19.64, primeDominance: 17.85, longevity: 12.63, penalty: -10, oneLiner: "The elite-volume featherweight case: outstanding wins, remarkable durability, and years of contender-level relevance.", divisionStrength: "Modern featherweight receives a 1.05 default, with lightweight appearances evaluated separately.", whyRankedHere: "Holloway's opponent quality and active elite longevity are among the best in the ranking.", whyNotHigher: "Volkanovski owns the direct championship separation, and accumulated elite losses create the maximum penalty drag.", judgmentCalls: ["The Volkanovski trilogy matters heavily.", "Durability and long elite relevance remain major strengths.", "Lightweight work adds context without replacing the featherweight résumé."] }),
  makeFighter({ rank: 10, slug: "kamaru-usman", name: "Kamaru Usman", division: "WW", ovr: 90, rawScore: 48.33, championship: 11.39, opponentQuality: 13.63, primeDominance: 19.16, longevity: 8.65, penalty: -4.5, oneLiner: "A dominant modern welterweight reign built on pace, control, repeat wins, and championship consistency.", divisionStrength: "Modern welterweight receives strong contextual credit without exceeding the 1.05 GSP-era default.", whyRankedHere: "Usman combined a high-level title run with repeat wins over the best contenders of his era.", whyNotHigher: "The title run and longevity are shorter than the historic cases, and the Edwards finish loss creates real prime drag.", judgmentCalls: ["Repeat wins still count but with diminishing résumé novelty.", "The Edwards finish loss is meaningful.", "The late Chimaev fight is treated with age and division context."] }),
];

export function getFighter(slug?: string) {
  return menAllTime.find((fighter) => fighter.slug === slug);
}

export function categoryRating(value: number, maximum: number) {
  return Math.max(0, Math.min(99, Math.round((value / maximum) * 99)));
}
