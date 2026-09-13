import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const FOOTBALL_POSITION_TRAIT_MODEL_VERSION = "build-qb-v2-audited" as const;
export type BuildQbRarityBand = 1 | 2 | 3 | 4 | 5;

interface AuditedQbProfile {
  subjectId: string;
  name: string;
  rarityBand: BuildQbRarityBand;
  traits: Readonly<Record<BuildQbTrait, number>>;
}

export interface FootballBuildQbTraitProfile extends AuditedQbProfile {
  overall: number;
  evidenceMethod: "multi-source-film-context";
}

/**
 * Canonical, peak-capability Build-a-QB audit. Values synthesize film/scouting,
 * era-relative passing evidence, movement/pressure creation, and high-leverage
 * performance. Rarity describes room frequency—not a ceiling on any trait.
 */
const AUDITED_QB_PROFILES: readonly AuditedQbProfile[] = [
  { subjectId: "nfl-patrick-mahomes", name: "Patrick Mahomes", rarityBand: 5, traits: { Arm: 99, Accuracy: 94, Processing: 96, Mobility: 93, Clutch: 98 } },
  { subjectId: "tom-brady", name: "Tom Brady", rarityBand: 5, traits: { Arm: 88, Accuracy: 94, Processing: 99, Mobility: 55, Clutch: 99 } },
  { subjectId: "peyton-manning", name: "Peyton Manning", rarityBand: 5, traits: { Arm: 87, Accuracy: 96, Processing: 99, Mobility: 48, Clutch: 94 } },
  { subjectId: "nfl-aaron-rodgers", name: "Aaron Rodgers", rarityBand: 5, traits: { Arm: 96, Accuracy: 97, Processing: 98, Mobility: 84, Clutch: 94 } },
  { subjectId: "joe-montana", name: "Joe Montana", rarityBand: 5, traits: { Arm: 84, Accuracy: 95, Processing: 97, Mobility: 72, Clutch: 99 } },
  { subjectId: "dan-marino", name: "Dan Marino", rarityBand: 4, traits: { Arm: 97, Accuracy: 94, Processing: 96, Mobility: 52, Clutch: 91 } },
  { subjectId: "john-elway", name: "John Elway", rarityBand: 4, traits: { Arm: 98, Accuracy: 86, Processing: 91, Mobility: 86, Clutch: 97 } },
  { subjectId: "steve-young", name: "Steve Young", rarityBand: 4, traits: { Arm: 91, Accuracy: 94, Processing: 95, Mobility: 94, Clutch: 96 } },
  { subjectId: "drew-brees", name: "Drew Brees", rarityBand: 4, traits: { Arm: 84, Accuracy: 98, Processing: 97, Mobility: 58, Clutch: 94 } },
  { subjectId: "brett-favre", name: "Brett Favre", rarityBand: 4, traits: { Arm: 98, Accuracy: 87, Processing: 86, Mobility: 82, Clutch: 93 } },
  { subjectId: "nfl-josh-allen", name: "Josh Allen", rarityBand: 4, traits: { Arm: 99, Accuracy: 88, Processing: 89, Mobility: 96, Clutch: 91 } },
  { subjectId: "nfl-lamar-jackson", name: "Lamar Jackson", rarityBand: 4, traits: { Arm: 88, Accuracy: 87, Processing: 90, Mobility: 99, Clutch: 88 } },
  { subjectId: "nfl-joe-burrow", name: "Joe Burrow", rarityBand: 4, traits: { Arm: 88, Accuracy: 96, Processing: 95, Mobility: 78, Clutch: 96 } },
  { subjectId: "nfl-matthew-stafford", name: "Matthew Stafford", rarityBand: 4, traits: { Arm: 97, Accuracy: 91, Processing: 91, Mobility: 72, Clutch: 95 } },
  { subjectId: "ben-roethlisberger", name: "Ben Roethlisberger", rarityBand: 4, traits: { Arm: 94, Accuracy: 88, Processing: 88, Mobility: 87, Clutch: 96 } },
  { subjectId: "kurt-warner", name: "Kurt Warner", rarityBand: 3, traits: { Arm: 89, Accuracy: 95, Processing: 94, Mobility: 52, Clutch: 97 } },
  { subjectId: "andrew-luck", name: "Andrew Luck", rarityBand: 3, traits: { Arm: 94, Accuracy: 90, Processing: 93, Mobility: 88, Clutch: 89 } },
  { subjectId: "russell-wilson", name: "Russell Wilson", rarityBand: 3, traits: { Arm: 93, Accuracy: 91, Processing: 88, Mobility: 94, Clutch: 96 } },
  { subjectId: "nfl-philip-rivers", name: "Philip Rivers", rarityBand: 3, traits: { Arm: 89, Accuracy: 92, Processing: 94, Mobility: 52, Clutch: 87 } },
  { subjectId: "matt-ryan", name: "Matt Ryan", rarityBand: 3, traits: { Arm: 88, Accuracy: 93, Processing: 94, Mobility: 63, Clutch: 89 } },
  { subjectId: "cam-newton", name: "Cam Newton", rarityBand: 3, traits: { Arm: 95, Accuracy: 82, Processing: 84, Mobility: 98, Clutch: 88 } },
  { subjectId: "donovan-mcnabb", name: "Donovan McNabb", rarityBand: 3, traits: { Arm: 91, Accuracy: 85, Processing: 88, Mobility: 91, Clutch: 89 } },
  { subjectId: "steve-mcnair", name: "Steve McNair", rarityBand: 3, traits: { Arm: 90, Accuracy: 87, Processing: 88, Mobility: 92, Clutch: 95 } },
  { subjectId: "fran-tarkenton", name: "Fran Tarkenton", rarityBand: 3, traits: { Arm: 85, Accuracy: 89, Processing: 93, Mobility: 96, Clutch: 93 } },
  { subjectId: "roger-staubach", name: "Roger Staubach", rarityBand: 3, traits: { Arm: 88, Accuracy: 91, Processing: 94, Mobility: 89, Clutch: 98 } },
  { subjectId: "troy-aikman", name: "Troy Aikman", rarityBand: 3, traits: { Arm: 89, Accuracy: 95, Processing: 94, Mobility: 55, Clutch: 97 } },
  { subjectId: "jim-kelly", name: "Jim Kelly", rarityBand: 3, traits: { Arm: 92, Accuracy: 88, Processing: 92, Mobility: 67, Clutch: 92 } },
  { subjectId: "warren-moon", name: "Warren Moon", rarityBand: 3, traits: { Arm: 94, Accuracy: 91, Processing: 92, Mobility: 72, Clutch: 88 } },
  { subjectId: "ken-anderson", name: "Ken Anderson", rarityBand: 3, traits: { Arm: 82, Accuracy: 96, Processing: 95, Mobility: 65, Clutch: 87 } },
  { subjectId: "brock-purdy", name: "Brock Purdy", rarityBand: 3, traits: { Arm: 85, Accuracy: 93, Processing: 92, Mobility: 78, Clutch: 90 } },
  { subjectId: "eli-manning", name: "Eli Manning", rarityBand: 2, traits: { Arm: 89, Accuracy: 84, Processing: 86, Mobility: 52, Clutch: 98 } },
  { subjectId: "tony-romo", name: "Tony Romo", rarityBand: 2, traits: { Arm: 88, Accuracy: 92, Processing: 91, Mobility: 76, Clutch: 84 } },
  { subjectId: "dak-prescott", name: "Dak Prescott", rarityBand: 2, traits: { Arm: 89, Accuracy: 91, Processing: 91, Mobility: 80, Clutch: 86 } },
  { subjectId: "jalen-hurts", name: "Jalen Hurts", rarityBand: 2, traits: { Arm: 87, Accuracy: 84, Processing: 86, Mobility: 96, Clutch: 91 } },
  { subjectId: "justin-herbert", name: "Justin Herbert", rarityBand: 2, traits: { Arm: 97, Accuracy: 90, Processing: 89, Mobility: 84, Clutch: 84 } },
  { subjectId: "baker-mayfield", name: "Baker Mayfield", rarityBand: 2, traits: { Arm: 91, Accuracy: 87, Processing: 86, Mobility: 76, Clutch: 90 } },
  { subjectId: "jared-goff", name: "Jared Goff", rarityBand: 2, traits: { Arm: 88, Accuracy: 92, Processing: 91, Mobility: 57, Clutch: 87 } },
  { subjectId: "kirk-cousins", name: "Kirk Cousins", rarityBand: 2, traits: { Arm: 87, Accuracy: 93, Processing: 92, Mobility: 59, Clutch: 82 } },
  { subjectId: "carson-palmer", name: "Carson Palmer", rarityBand: 2, traits: { Arm: 94, Accuracy: 89, Processing: 88, Mobility: 61, Clutch: 82 } },
  { subjectId: "rich-gannon", name: "Rich Gannon", rarityBand: 2, traits: { Arm: 84, Accuracy: 92, Processing: 94, Mobility: 81, Clutch: 86 } },
  { subjectId: "randall-cunningham", name: "Randall Cunningham", rarityBand: 2, traits: { Arm: 95, Accuracy: 81, Processing: 82, Mobility: 99, Clutch: 86 } },
  { subjectId: "daunte-culpepper", name: "Daunte Culpepper", rarityBand: 2, traits: { Arm: 96, Accuracy: 85, Processing: 82, Mobility: 94, Clutch: 84 } },
  { subjectId: "michael-vick", name: "Michael Vick", rarityBand: 2, traits: { Arm: 98, Accuracy: 77, Processing: 78, Mobility: 99, Clutch: 86 } },
  { subjectId: "boomer-esiason", name: "Boomer Esiason", rarityBand: 2, traits: { Arm: 90, Accuracy: 88, Processing: 90, Mobility: 70, Clutch: 89 } },
  { subjectId: "mark-brunell", name: "Mark Brunell", rarityBand: 2, traits: { Arm: 86, Accuracy: 90, Processing: 89, Mobility: 87, Clutch: 88 } },
  { subjectId: "jay-cutler", name: "Jay Cutler", rarityBand: 1, traits: { Arm: 98, Accuracy: 82, Processing: 75, Mobility: 77, Clutch: 74 } },
  { subjectId: "joe-flacco", name: "Joe Flacco", rarityBand: 1, traits: { Arm: 95, Accuracy: 82, Processing: 81, Mobility: 54, Clutch: 94 } },
  { subjectId: "nick-foles", name: "Nick Foles", rarityBand: 1, traits: { Arm: 87, Accuracy: 86, Processing: 82, Mobility: 61, Clutch: 97 } },
  { subjectId: "jeff-garcia", name: "Jeff Garcia", rarityBand: 1, traits: { Arm: 79, Accuracy: 89, Processing: 90, Mobility: 88, Clutch: 87 } },
  { subjectId: "chad-pennington", name: "Chad Pennington", rarityBand: 1, traits: { Arm: 72, Accuracy: 96, Processing: 93, Mobility: 58, Clutch: 83 } },
  { subjectId: "ryan-fitzpatrick", name: "Ryan Fitzpatrick", rarityBand: 1, traits: { Arm: 88, Accuracy: 82, Processing: 80, Mobility: 82, Clutch: 82 } },
  { subjectId: "vinny-testaverde", name: "Vinny Testaverde", rarityBand: 1, traits: { Arm: 94, Accuracy: 80, Processing: 80, Mobility: 61, Clutch: 81 } },
  { subjectId: "jeff-george", name: "Jeff George", rarityBand: 1, traits: { Arm: 99, Accuracy: 79, Processing: 72, Mobility: 62, Clutch: 68 } },
  { subjectId: "doug-flutie", name: "Doug Flutie", rarityBand: 1, traits: { Arm: 79, Accuracy: 84, Processing: 87, Mobility: 94, Clutch: 88 } },
  { subjectId: "kordell-stewart", name: "Kordell Stewart", rarityBand: 1, traits: { Arm: 88, Accuracy: 73, Processing: 76, Mobility: 97, Clutch: 79 } },
  { subjectId: "jake-delhomme", name: "Jake Delhomme", rarityBand: 1, traits: { Arm: 83, Accuracy: 82, Processing: 81, Mobility: 66, Clutch: 90 } },
  { subjectId: "trent-green", name: "Trent Green", rarityBand: 1, traits: { Arm: 85, Accuracy: 91, Processing: 91, Mobility: 61, Clutch: 84 } },
  { subjectId: "derek-carr", name: "Derek Carr", rarityBand: 1, traits: { Arm: 91, Accuracy: 88, Processing: 87, Mobility: 72, Clutch: 78 } },
  { subjectId: "kyler-murray", name: "Kyler Murray", rarityBand: 1, traits: { Arm: 92, Accuracy: 85, Processing: 84, Mobility: 97, Clutch: 79 } },
  { subjectId: "tua-tagovailoa", name: "Tua Tagovailoa", rarityBand: 1, traits: { Arm: 80, Accuracy: 94, Processing: 92, Mobility: 73, Clutch: 78 } },
] as const;

export function buildFootballBuildQbTraitProfiles(): readonly FootballBuildQbTraitProfile[] {
  return AUDITED_QB_PROFILES.map((profile) => ({
    ...profile,
    overall: Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / BUILD_QB_TRAITS.length),
    evidenceMethod: "multi-source-film-context" as const,
  }));
}
