/** Runtime-only amendment: do not mutate the published Daily setup or old results. */
export const OCT30_CFB_FEUD_CORRECTION = "cfb-feud-oct30-editorial-v1";
export const OCT30_CFB_FEUD_STATE_KEY = "football_feud_correction_version";
type R = Record<string, unknown>;
const obj = (v: unknown): R => v && typeof v === "object" && !Array.isArray(v) ? v as R : {};
const arr = (v: unknown): R[] => Array.isArray(v) ? v.map(obj) : [];
const oldId = "cfb-feud-r2-main-four-team-cfp-schools";
const newId = "cfb-feud-r2-main-named-college-rivalries";
const big12 = "cfb-feud-r2-fast-big-twelve-2025-schools";
const prompt = "Name a well-known nickname for a college football rivalry game.";
const ranked = [
  ["Iron Bowl", "Alabama Auburn", "Bama Auburn"],
  ["Red River Rivalry", "Red River Shootout", "Texas Oklahoma", "OU Texas"],
  ["The Game", "Ohio State Michigan", "Michigan Ohio State"],
  ["Egg Bowl", "Mississippi State Ole Miss"],
  ["Holy War", "BYU Utah"],
  ["Bedlam", "Oklahoma Oklahoma State"],
  ["Backyard Brawl", "Pitt West Virginia"],
  ["Apple Cup", "Washington Washington State"],
];
const valid = [
  ["Clean Old-Fashioned Hate"], ["Palmetto Bowl"],
  ["The Civil War", "Oregon Oregon State"],
  ["World's Largest Outdoor Cocktail Party", "Florida Georgia"],
  ["Third Saturday in October", "Alabama Tennessee"],
  ["Deep South's Oldest Rivalry"], ["Sunshine Showdown"],
  ["Army-Navy Game", "Army Navy"], ["Border War"], ["Oldest Rivalry in the South"],
];
const variants: Record<string, Record<string, string[]>> = {
 "cfb-feud-r2-fast-alumni-on-saturdays": {
   "Wear school colors": ["wear a jersey","jersey","team gear","wear team shirt"],
   "Watch game": ["watch football","watch the game","watch on TV"],
   "Attend tailgate": ["tailgate","tailgating","go tailgating"],
   "Travel to campus": ["visit campus","visit alma mater"],
   "Donate to athletics": ["donate","donate money","make a donation"],
   "Buy tickets": ["purchase tickets","get tickets"],
 },
 "cfb-feud-r2-fast-college-football-polls": {
   "Top 25": ["top twenty five"],
   "Strength of schedule": ["SOS","tough schedule"],
   "Quality wins": ["signature wins","good wins"],
   "Ranked win": ["ranked wins","beating ranked teams"],
   "Poll voters": ["poll bias","voter bias","biased voting"],
   "Ranking debate": ["ranking arguments","ranking controversy"],
 },
 "cfb-feud-r2-fast-student-section-actions": {
   "Chant": ["chanting","school chants"],
   "Cheer": ["cheering","yell","yelling","shouting","scream"],
   "Wave signs": ["hold signs","hold up signs"],
   "Jump in unison": ["jump","jumping"],
   "Paint faces": ["face paint"],
   "Sing fight song": ["sing the fight song","sing school song"],
   "Clap": ["clapping","applaud"],
   "Start a wave": ["do the wave","the wave"],
 },
};
function makeBoard() {
 const entities = [...ranked.map((v,i) => ({
   id:`${newId}:a${i+1}`, displayName:v[0], kind:"other", aliases:v.slice(1),
 })), ...valid.map((v,i) => ({
   id:`${newId}:v${i+1}`, displayName:v[0], kind:"other", aliases:v.slice(1),
 }))];
 const answers = ranked.map((_v,i) => ({entityId:`${newId}:a${i+1}`,points:[10,8,7,5,5,4,4,3][i]}));
 return { entities, question: {
   id:newId,prompt, candidateIds:entities.map(e=>e.id), answers,
   alsoAcceptedEntityIds:valid.map((_v,i)=>`${newId}:v${i+1}`),
 }};
}
function reveal(question:R, entities:R[]) {
 const byId = new Map(entities.map(e=>[e.id,e.displayName]));
 return {id:question.id, accepted_answers:arr(question.answers).map((a,i)=>({
  rank:i+1,entity:{id:a.entityId,display_name:byId.get(a.entityId)},points:a.points,
 }))};
}
export function applyOct30FootballFeudCorrection<T extends R>(ctx:T):T {
 if(ctx.gameType!=="sports_feud" || ctx.central_day!=="2026-10-30"
  || ctx.schedule_version!=="football-daily-v22-higher-lower-oct27"
  || typeof ctx.setupKey!=="string"
  || !ctx.setupKey.includes(":football:sports-feud-bank-r2-cfb-2026-10-30-")) return ctx;
 const submission=obj(ctx.submissionState);
 const active=submission[OCT30_CFB_FEUD_STATE_KEY]===OCT30_CFB_FEUD_CORRECTION;
 if(!active && (Number(ctx.progress_revision??0)>0 || Boolean(ctx.official_attempt))) return ctx;
 const evidence=obj(ctx.privateSetupEvidence);
 const pack=obj(evidence.pack);
 const mains=arr(pack.mainBoards), fast=arr(pack.fastMoney), entities=arr(pack.entities);
 if(mains[1]?.id!==oldId || fast[0]?.id!==big12) return ctx;
 const {entities:rivals,question:board}=makeBoard();
 const selected=[`${big12}:a1`,`${big12}:v1`,`${big12}:a2`,`${big12}:a3`,
   `${big12}:a4`,`${big12}:a5`,`${big12}:a6`,`${big12}:a7`];
 const newFast={...fast[0],
  answers:selected.map((entityId,i)=>({entityId,points:8-i})),
  alsoAcceptedEntityIds:[...(fast[0].alsoAcceptedEntityIds as string[]??[])
    .filter(id=>id!==`${big12}:v1`),`${big12}:a8`],
 };
 const newEntities=[...entities.filter(e=>!String(e.id).startsWith(oldId+":")).map(e=>{
  const id=String(e.id), qid=id.slice(0,id.lastIndexOf(":"));
  const extra=variants[qid]?.[String(e.displayName)]??[];
  return extra.length? {...e,aliases:[...new Set([...(e.aliases as string[]??[]),...extra])]}:e;
 }),...rivals];
 const setup=obj(ctx.publicSetup), initial=obj(setup.initial_state), state=obj(ctx.publicState);
 const patchBoard=(v:R)=>({...v,id:newId,prompt});
 const rsetup=obj(ctx.revealSetup), rmain=arr(rsetup.main_boards), rfast=arr(rsetup.fast_money);
 return {...ctx,
  privateSetupEvidence:{...evidence,pack:{...pack,entities:newEntities,
    mainBoards:[mains[0],board],fastMoney:[newFast,...fast.slice(1)]},
    editorial_correction_version:OCT30_CFB_FEUD_CORRECTION},
  publicSetup:{...setup,editorial_correction_version:OCT30_CFB_FEUD_CORRECTION,
    main_boards:[arr(setup.main_boards)[0],{id:newId,prompt}],
    initial_state:{...initial,main_boards:[arr(initial.main_boards)[0],patchBoard(arr(initial.main_boards)[1]??{})]}},
  publicState:{...state,main_boards:[arr(state.main_boards)[0],patchBoard(arr(state.main_boards)[1]??{})]},
  revealSetup:{...rsetup,main_boards:[rmain[0],reveal(board,newEntities)],
    fast_money:[reveal(newFast,newEntities),...rfast.slice(1)]},
 } as T;
}
