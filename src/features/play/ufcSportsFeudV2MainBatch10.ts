import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Official career rankings as published October 18, 2026. Not yet certified. */
const SOURCE = "https://statleaders.ufc.com/en";
const ROWS = [
  {
    id:"ufc-v2-main10-longest-average-fights",
    lane:"ufc-average-fight-time-longest",
    prompt:"Name a fighter in the UFC Record Book's longest average fight time Top 10 (minimum five UFC fights) on October 18, 2026.",
    kind:"person",
    ranked:"Valentina Shevchenko|Joanna Jedrzejczyk|Demetrious Johnson|Dominick Cruz|Kamaru Usman|Benson Henderson|Petr Yan|Merab Dvalishvili",
    extras:"Israel Adesanya|Marvin Vettori",
    aliases: {
      "Valentina Shevchenko":["Bullet"],
      "Joanna Jedrzejczyk":["Joanna Champion","Joanna Jędrzejczyk"],
      "Demetrious Johnson":["Mighty Mouse","DJ"],
      "Israel Adesanya":["Izzy"]
    },source:[SOURCE]
  },
  {
    id:"ufc-v2-main10-total-fight-time",
    lane:"ufc-total-career-fight-time",
    prompt:"Name a fighter in the UFC Record Book's all-time total Octagon fight time Top 10 on October 18, 2026.",
    kind:"person",
    ranked:"Max Holloway|Rafael dos Anjos|Frankie Edgar|Jim Miller|Neil Magny|Angela Hill|Clay Guida|Andrei Arlovski",
    extras:"Demian Maia|Jeremy Stephens",
    aliases:{"Max Holloway":["Blessed"],"Rafael dos Anjos":["RDA"]},
    source:[SOURCE]
  },
  {
    id:"ufc-v2-main10-control-time",
    lane:"ufc-career-control-time",
    prompt:"Name a fighter in the UFC Record Book's all-time career control time Top 10 on October 18, 2026.",
    kind:"person",
    ranked:"Georges St-Pierre|Clay Guida|Demian Maia|Kamaru Usman|Rafael dos Anjos|Darren Elkins|Jon Fitch|Randy Couture",
    extras:"Colby Covington|Islam Makhachev",
    aliases:{"Georges St-Pierre":["GSP"],"Rafael dos Anjos":["RDA"]},
    source:[SOURCE]
  },
  {
    id:"ufc-v2-main10-career-takedowns",
    lane:"ufc-career-takedowns-landed",
    prompt:"Name a fighter in the UFC Record Book's all-time career takedowns landed Top 10 (including ties) on October 18, 2026.",
    kind:"person",
    ranked:"Merab Dvalishvili|Georges St-Pierre|Gleison Tibau|Clay Guida|Demetrious Johnson|Frankie Edgar|Tim Elliott|Colby Covington",
    extras:"Curtis Blaydes|Nik Lentz",
    aliases:{"Georges St-Pierre":["GSP"],"Demetrious Johnson":["Mighty Mouse","DJ"]},
    source:[SOURCE]
  },
  {
    id:"ufc-v2-main10-takedown-defense",
    lane:"ufc-takedown-defense-percentage",
    prompt:"Name a fighter in the UFC Record Book's takedown defense percentage Top 10 on October 18, 2026 (minimum five fights and twenty opponent takedown attempts).",
    kind:"person",
    ranked:"Julio Arce|Ilia Topuria|Jon Jones|Eddie Wineland|Jimmie Rivera|Renan Barao|Gleison Tibau|Jose Aldo",
    extras:"Shane Burgos|Islam Makhachev",
    aliases:{"Jose Aldo":["José Aldo"],"Jon Jones":["Bones"]},
    source:[SOURCE]
  },
  {
    id:"ufc-v2-main10-submission-attempts",
    lane:"ufc-career-submission-attempts",
    prompt:"Name a fighter in the UFC Record Book's career submission attempts Top 10 (including ties) on October 18, 2026.",
    kind:"person",
    ranked:"Jim Miller|Charles Oliveira|Chris Lytle|Joe Lauzon|Demian Maia|Nate Diaz|Nik Lentz|Darren Elkins",
    extras:"Dustin Poirier|Matt Brown|Georges St-Pierre|Joe Stevenson|Cole Miller",
    aliases:{"Georges St-Pierre":["GSP"]},source:[SOURCE]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH10 = makeUfcFeudDraft(ROWS);
