import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/**
 * Independently verifiable UFC recordbook and Hall of Fame boards, prepared
 * against the official 18 October 2026 UFC statistics snapshot. These are
 * editorial candidates, not approval or activation.
 */
const RECORD = "https://statleaders.ufc.com/en";
const HALL = "https://www.ufc.com/ufc-hall-of-fame";
const ROWS = [
{
 id:"ufc-v2-main9-twenty-wins", lane:"career-twenty-ufc-wins",
 prompt:"Name a fighter on the UFC Record Book's career wins Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Jim Miller|Charles Oliveira|Neil Magny|Max Holloway|Andrei Arlovski|Donald Cerrone|Demian Maia|Jon Jones",
 extras:"Dustin Poirier|Rafael dos Anjos", source:[RECORD]
},
{
 id:"ufc-v2-main9-ten-knockouts", lane:"ten-ufc-ko-tko-wins",
 prompt:"Name a fighter on the UFC Record Book's career KO/TKO wins Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Derrick Lewis|Matt Brown|Max Holloway|Anderson Silva|Anthony Johnson|Drew Dober|Dustin Poirier|Thiago Santos",
 extras:"Michael Bisping|Cain Velasquez|Junior dos Santos|Donald Cerrone|Francis Ngannou",
 aliases:{"Anthony Johnson":["Rumble"],"Junior dos Santos":["JDS"],"Donald Cerrone":["Cowboy"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-eight-submissions",lane:"eight-ufc-submission-wins",
 prompt:"Name a fighter on the UFC Record Book's career submission wins Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Charles Oliveira|Jim Miller|Demian Maia|Gerald Meerschaert|Nate Diaz|Michael Chiesa|Frank Mir|Gunnar Nelson",
 extras:"Islam Makhachev|Brendan Allen",source:[RECORD]
},
{
 id:"ufc-v2-main9-postfight-bonuses",lane:"ufc-postfight-bonuses-twelve",
 prompt:"Name a fighter on the UFC Record Book's career Fight Night bonuses Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Charles Oliveira|Donald Cerrone|Justin Gaethje|Jim Miller|Nate Diaz|Joe Lauzon|Dustin Poirier|Anderson Silva",
 extras:"Edson Barboza|Max Holloway",
 aliases:{"Donald Cerrone":["Cowboy"],"Justin Gaethje":["The Highlight"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-ufc-win-streak",lane:"twelve-fight-ufc-winning-streak",
 prompt:"Name a fighter on the UFC Record Book's longest career win streak Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Islam Makhachev|Anderson Silva|Kamaru Usman|Merab Dvalishvili|Georges St-Pierre|Jon Jones|Demetrious Johnson|Khabib Nurmagomedov",
 extras:"Max Holloway|Amanda Nunes|Tony Ferguson|Alexander Volkanovski",
 aliases:{"Georges St-Pierre":["GSP"],"Demetrious Johnson":["Mighty Mouse"],"Alexander Volkanovski":["Volk"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-title-fight-wins",lane:"eight-ufc-title-fight-wins",
 prompt:"Name a fighter on the UFC Record Book's career title fight wins Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Jon Jones|Georges St-Pierre|Demetrious Johnson|Anderson Silva|Amanda Nunes|Valentina Shevchenko|Matt Hughes|Randy Couture",
 extras:"Jose Aldo|Alexander Volkanovski|Israel Adesanya",
 aliases:{"Georges St-Pierre":["GSP"],"Demetrious Johnson":["Mighty Mouse"],"Valentina Shevchenko":["Bullet"],"Alexander Volkanovski":["Volk"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-sig-strike-volume",lane:"ufc-career-significant-strikes-1800",
 prompt:"Name a fighter on the UFC Record Book's career significant strikes landed Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Max Holloway|Sean Strickland|Angela Hill|King Green|Dustin Poirier|Rafael dos Anjos|Jessica Andrade|Alexander Volkanovski",
 extras:"Frankie Edgar",
 aliases:{"King Green":["Bobby Green"],"Rafael dos Anjos":["RDA"],"Alexander Volkanovski":["Volk"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-knockdowns",lane:"ufc-career-knockdowns-14",
 prompt:"Name a fighter on the UFC Record Book's career knockdowns landed Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Donald Cerrone|Anderson Silva|Jeremy Stephens|Edson Barboza|Marlon Vera|Dustin Poirier|Chuck Liddell|Lyoto Machida",
 extras:"Mauricio Rua|Junior dos Santos|Thiago Santos|Khalil Rountree Jr.|Montel Jackson",
 aliases:{"Donald Cerrone":["Cowboy"],"Marlon Vera":["Chito Vera","Chito"],"Mauricio Rua":["Shogun Rua","Shogun"],"Junior dos Santos":["JDS"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-decision-wins",lane:"ufc-career-12-decision-wins",
 prompt:"Name a fighter on the UFC Record Book's career decision wins Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Brad Tavares|Neil Magny|Andrei Arlovski|Georges St-Pierre|Diego Sanchez|Rafael dos Anjos|Darren Elkins|Sean Strickland",
 extras:"Belal Muhammad|Merab Dvalishvili",
 aliases:{"Georges St-Pierre":["GSP"],"Rafael dos Anjos":["RDA"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-fight-appearances",lane:"ufc-career-thirty-three-appearances",
 prompt:"Name a fighter on the UFC Record Book's career total fights Top 10 list (including ties) as of October 18, 2026.",
 kind:"person",
 ranked:"Jim Miller|Andrei Arlovski|Donald Cerrone|Neil Magny|Clay Guida|Rafael dos Anjos|Charles Oliveira|Jeremy Stephens",
 extras:"Demian Maia|Edson Barboza|Max Holloway",
 aliases:{"Donald Cerrone":["Cowboy"],"Rafael dos Anjos":["RDA"]},source:[RECORD]
},
{
 id:"ufc-v2-main9-fight-hall-of-fame",lane:"ufc-hall-of-fame-fight-wing-fighters",
 prompt:"Name a fighter who took part in a UFC bout inducted into the UFC Hall of Fame's Fight Wing by 2026.",
 kind:"person",
 ranked:"Forrest Griffin|Stephan Bonnar|Robbie Lawler|Rory MacDonald|Jon Jones|Alexander Gustafsson|Israel Adesanya|Kelvin Gastelum",
 extras:"Cub Swanson|Doo Ho Choi|Diego Sanchez|Clay Guida|Dan Henderson|Mauricio Rua|Pete Williams|Mark Coleman|Matt Hughes|Frank Trigg|Anderson Silva|Chael Sonnen|Zhang Weili|Joanna Jedrzejczyk",
 aliases:{"Mauricio Rua":["Shogun"],"Zhang Weili":["Weili Zhang"],"Joanna Jedrzejczyk":["Joanna Champion"]},source:[HALL,"https://www.ufc.com/news/ufc-248-fight-between-zhang-weili-and-joanna-jedrzejczyk-to-be-inducted-into-ufc-hall-fame"]
},
{
 id:"ufc-v2-main9-hall-contributors",lane:"ufc-hall-of-fame-contributor-wing",
 prompt:"Name a person inducted into the UFC Hall of Fame Contributors Wing by 2025.",
 kind:"person",
 ranked:"Art Davie|Marc Ratner|Joe Silva|Jeff Blatnick|Bob Meyrowitz|Bruce Connal|Charles Lewis|Craig Piligian",
 extras:"",
 aliases:{"Charles Lewis":["Mask","Charles Mask Lewis","Charles 'Mask' Lewis"],"Craig Piligian":["Craig Piligan"]},
 source:[HALL,"https://www.ufc.com/story/0e7afed4-0cf9-491b-8814-d4ad7ce7b656"]
}
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH9 = makeUfcFeudDraft(ROWS);
