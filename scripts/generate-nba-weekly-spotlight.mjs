#!/usr/bin/env node
/**
 * Automated NBA weekly package. Fails closed: never emits a player card without
 * ESPN box-score aggregates and a matching direct highlight from an official
 * NBA YouTube channel. Last verified package remains active on failure.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";
// @NBA is the sole permitted publisher for player spotlight videos.
const NBA_CHANNEL_ID = "UCWJ2lWNubArHWmf3FIHbfcQ";
const OFFICIAL_CHANNELS = [NBA_CHANNEL_ID];
const MS_DAY = 86_400_000;
const round = x => (Math.round(x * 10) / 10).toFixed(1);
const dateText = d => d.toISOString().slice(0, 10);
const ymd = d => dateText(d).replaceAll("-", "");

export function finishedWeek(now = new Date()) {
  // Use local Central calendar dates; Sunday is the final day of a media week.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(now);
  const get = k => parts.find(x => x.type === k)?.value;
  const local = new Date(Date.UTC(+get("year"), +get("month") - 1, +get("day"), 12));
  const weekday = local.getUTCDay(); // Tuesday=2; prior Monday is 8 days earlier
  const daysToPriorSunday = weekday === 0 ? 7 : weekday;
  const end = new Date(local.getTime() - daysToPriorSunday * MS_DAY);
  const start = new Date(end.getTime() - 6 * MS_DAY);
  return { start, end, weekStart: dateText(start), weekEnd: dateText(end) };
}

export async function retrieveJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "OctagonHQ/1.0 NBA weekly editorial" } });
    if (!response.ok) throw Error(`source returned HTTP ${response.status}: ${url}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
async function retrieveText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw Error(`video feed returned HTTP ${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

function numerical(value) { const v=Number(value); return Number.isFinite(v)?v:NaN; }
function esc(s) { return String(s??"").replaceAll("&amp;","&").replaceAll("&#39;","'").replaceAll("&quot;",'"').replaceAll("&lt;","<").replaceAll("&gt;",">"); }
function normal(s) { return String(s??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim(); }

export function extractYoutubeVideos(xml, channel) {
  const result=[];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const body=match[1];
    const video=body.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
    const title=body.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published=body.match(/<published>([^<]+)<\/published>/)?.[1];
    if (video && title && published && Number.isFinite(Date.parse(published)))
      result.push({id:video,title:esc(title),published,channel});
  }
  return result;
}
export function findMatchingHighlight(playerName, videos, lastSunday) {
  const names=normal(playerName).split(" ").filter(Boolean);
  while (["jr","sr","ii","iii","iv"].includes(names.at(-1))) names.pop();
  if (names.length<2) return null;
  const first=names[0], last=names.at(-1);
  // Last week's Sunday games finish early Monday UTC. Stop before Monday's
  // new slate so the video cannot accidentally showcase next week's game.
  const end=Date.parse(lastSunday+"T00:00:00Z")+MS_DAY+16*3_600_000;
  const start=Date.parse(lastSunday+"T00:00:00Z")-6*MS_DAY;
  return videos.filter(v=>{
    if (v.channel !== NBA_CHANNEL_ID) return false;
    const title=normal(v.title);
    const words=title.split(" ");
    const date=Date.parse(v.published);
    return date>=start && date<=end
      && words.includes(first) && words.includes(last)
      && /highlights?|full game|best plays|performance/i.test(v.title);
  }).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published))[0]??null;
}

function readPlayerBoxscore(raw, result, eventId) {
  for (const group of raw?.boxscore?.players ?? []) {
    const teamId = String(group?.team?.abbreviation ?? "").toUpperCase();
    for (const block of group.statistics ?? []) {
      const names = block.names ?? block.labels ?? [];
      const stat = (row, keys) => {
        const i=names.findIndex(n=>keys.includes(normal(n).replaceAll(" ","")));
        return i<0?NaN:numerical(row.stats?.[i]);
      };
      const fg=(row)=>{
        const i=names.findIndex(n=>["fg","fieldgoals","fieldgoalsmadefieldgoalsattempted"].includes(normal(n).replaceAll(" ","")));
        const pair=String(row.stats?.[i]??"").split("-").map(Number);
        return i>=0&&pair.length===2&&Number.isFinite(pair[0])&&Number.isFinite(pair[1])
          ? pair : [0,0];
      };
      for (const row of block.athletes??[]) {
        if (row.didNotPlay || row.athlete?.didNotPlay || row.stats?.length !== names.length) continue;
        const athlete=row.athlete ?? {};
        const id=String(athlete.id ?? "");
        const pts=stat(row,["pts","points"]),reb=stat(row,["reb","rebounds"]),ast=stat(row,["ast","assists"]);
        if (!id || !athlete.displayName || ![pts,reb,ast].every(Number.isFinite)) continue;
        const [made,attempts]=fg(row);
        const steals=stat(row,["stl","steals"]),blocks=stat(row,["blk","blocks"]);
        if (![made,attempts,steals,blocks].every(Number.isFinite) || attempts<=0) continue;
        const old=result.get(id)??{id,name:athlete.displayName,team:group?.team?.displayName??"",teamId,
          position:athlete.position?.abbreviation??"",headshotUrl:athlete.headshot?.href??`https://a.espncdn.com/i/headshots/nba/players/full/${id}.png`,
          games:new Set(),points:0,rebounds:0,assists:0,made:0,attempts:0,steals:0,blocks:0};
        if (old.games.has(eventId)) continue;
        old.games.add(eventId); old.points+=pts;old.rebounds+=reb;old.assists+=ast;old.made+=made;old.attempts+=attempts;old.steals+=steals;old.blocks+=blocks;
        result.set(id,old);
      }
    }
  }
}
export function collectTeamGames(events) {
  const teams=new Map(), finals=[];
  for (const event of events) {
    const contest=event.competitions?.[0];
    if (!event.status?.type?.completed || !contest || contest.competitors?.length!==2) continue;
    const [a,b]=contest.competitors;
    if (![a,b].every(x=>x.team?.id&&Number.isFinite(numerical(x.score)))) continue;
    finals.push(event);
    for (const [self,other] of [[a,b],[b,a]]) {
      const id=String(self.team.id);
      const row=teams.get(id)??{id,name:self.team.displayName,abbreviation:self.team.abbreviation,
        logoUrl:self.team.logo??`https://a.espncdn.com/i/teamlogos/nba/500/${String(self.team.abbreviation).toLowerCase()}.png`,
        wins:0,losses:0,for:0,against:0,games:new Set(),opponents:[]};
      if (row.games.has(event.id)) continue;
      const pts=numerical(self.score),opp=numerical(other.score);
      row.games.add(event.id); row.opponents.push(String(other.team.id));
      row.wins+=pts>opp?1:0;row.losses+=pts<opp?1:0;row.for+=pts;row.against+=opp;
      teams.set(id,row);
    }
  }
  return { teams, finals };
}
// Approved editorial model: 40% production, 20% efficiency, 20% winning,
// 20% defense. Position normalization values guard assists / big rebounds
// without arbitrarily rewarding whichever player scored the most points.
const clamp01 = n => Math.max(0, Math.min(1, n));
export function playerEditorialScore(p, teams) {
  const games=p.games.size;
  if (!games || !p.attempts) return 0;
  const team=[...teams.values()].find(t=>t.abbreviation===p.teamId);
  const role=String(p.position).toUpperCase();
  const weights=role==="C" || role==="PF" ? [.5,.15,.35]
    : role==="PG" || role==="SG" || role==="G" ? [.58,.3,.12] : [.63,.17,.2];
  const production=100*(weights[0]*clamp01(p.points/games/35)
    +weights[1]*clamp01(p.assists/games/10)
    +weights[2]*clamp01(p.rebounds/games/12));
  const efficiency=100*clamp01((p.made/p.attempts-.35)/.25)
    *clamp01(p.attempts/games/12);
  const winning=100*(team ? team.wins/Math.max(1,team.games.size) : 0);
  const defense=100*(role==="C"||role==="PF"
    ? .35*clamp01(p.steals/games/2.5)+.65*clamp01(p.blocks/games/2.5)
    : .65*clamp01(p.steals/games/2.5)+.35*clamp01(p.blocks/games/2.5));
  return .4*production+.2*efficiency+.2*winning+.2*defense;
}

// Team award: wins are most important, then margin, points allowed, opponent
// strength. For teams with only one observed opponent game, opposition quality
// is neutral rather than falsely treating the opponent as a weak/strong team.
export function teamEditorialScore(t, teams) {
  const games=t.games.size;
  if (!games) return 0;
  const winRate=t.wins/games;
  const margin=(t.for-t.against)/games;
  const allowed=t.against/games;
  const opponentRates=t.opponents.map(id=>teams.get(id)).filter(Boolean)
    .map(opp=>opp.games.size>=2 ? opp.wins/opp.games.size : .5);
  const opponentStrength=opponentRates.length
    ? opponentRates.reduce((sum,n)=>sum+n,0)/opponentRates.length : .5;
  return 45*winRate+25*clamp01((margin+10)/40)
    +15*clamp01((125-allowed)/40)+15*opponentStrength;
}
export function selectWeek({events, boxscores, videos, weekStart, weekEnd, publishedAt, previous=null}) {
  const {teams,finals}=collectTeamGames(events);
  // Two or more final appearances required to establish a genuine weekly sample.
  if (finals.length<8) throw Error("Fewer than eight verified final NBA games");
  const players=new Map();
  for (const game of finals) {
    const summary=boxscores.get(String(game.id));
    if (!summary?.boxscore?.players?.length) throw Error(`Missing complete boxscore for ${game.id}`);
    readPlayerBoxscore(summary,players,String(game.id));
  }
  const candidateTeams=[...teams.values()].filter(t=>t.games.size>=2)
    .sort((a,b)=> (teamEditorialScore(b,teams)-(previous?.team?.teamId===b.abbreviation?7:0))
      -(teamEditorialScore(a,teams)-(previous?.team?.teamId===a.abbreviation?7:0))
      || b.wins-a.wins || a.name.localeCompare(b.name));
  if (!candidateTeams.length) throw Error("No team with two completed games");
  const playerCandidates=[...players.values()].filter(p=>p.games.size>=2&&p.points/p.games.size>=16&&p.attempts/p.games.size>=9)
    .sort((a,b)=> (playerEditorialScore(b,teams)-(previous?.player?.name===b.name?7:0))
      -(playerEditorialScore(a,teams)-(previous?.player?.name===a.name?7:0))
      || a.name.localeCompare(b.name));
  const selected=playerCandidates.map(player=>({
    player, video:findMatchingHighlight(player.name,videos,weekEnd),
  })).find(x=>x.video);
  if (!selected) throw Error("No eligible weekly player has a verified matching NBA YouTube highlight");
  const p=selected.player,g=p.games.size,t=candidateTeams[0],tg=t.games.size;
  const fg=p.attempts>0?round(p.made/p.attempts*100):"—";
  const winner={
    weekStart,weekEnd,publishedAt,
    player:{
      name:p.name,team:p.team,position:p.position||"NBA",
      headshotUrl:p.headshotUrl,profileUrl:`https://www.espn.com/nba/player/_/id/${p.id}`,
      highlightUrl:`https://www.youtube.com/watch?v=${selected.video.id}`,
      highlightSourceChannelId: selected.video.channel,
      channelUrl: "https://www.youtube.com/@NBA",
      summary:`Averaged ${round(p.points/g)} points, ${round(p.assists/g)} assists and ${round(p.rebounds/g)} rebounds across ${g} completed games this week.`,
      stats:[{label:"PPG",value:round(p.points/g)},{label:"APG",value:round(p.assists/g)},
        {label:"RPG",value:round(p.rebounds/g)},{label:"FG%",value:fg}],
    },
    team:{
      name:t.name,teamId:t.abbreviation,logoUrl:t.logoUrl,
      profileUrl:`https://www.espn.com/nba/team/_/name/${String(t.abbreviation).toLowerCase()}`,
      record:`${t.wins}-${t.losses}`,
      ppg:round(t.for/tg),oppPpg:round(t.against/tg),
      netMargin:(t.for>=t.against?"+":"")+round((t.for-t.against)/tg),
      summary:`Went ${t.wins}-${t.losses} across ${tg} games, scoring ${round(t.for/tg)} points per game and allowing ${round(t.against/tg)}.`,
    },
  };
  return winner;
}

const VIDEO_CACHE_FILE = path.resolve(".nba-weekly-video-cache.json");

/** Keep an accumulated feed across days: YouTube RSS exposes only the latest
 * 15 uploads, far too few to recover an entire NBA week on Tuesday. */
export function mergeOfficialVideos(...collections) {
  const byId = new Map();
  const earliest = Date.now() - 21 * MS_DAY;
  for (const entries of collections) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!OFFICIAL_CHANNELS.includes(entry?.channel)
        || !/^[\w-]{11}$/.test(entry?.id ?? "")
        || typeof entry.title !== "string" || !entry.title.trim()
        || !Number.isFinite(Date.parse(entry?.published ?? ""))
        || Date.parse(entry.published) < earliest
        || Date.parse(entry.published) > Date.now() + MS_DAY) continue;
      byId.set(entry.id, entry);
    }
  }
  return [...byId.values()].sort((a,b) => Date.parse(b.published) - Date.parse(a.published));
}

async function youtubeApiVideos(channel, key) {
  const videos=[];
  let pageToken="";
  const after = new Date(Date.now() - 15 * MS_DAY).toISOString();
  const before = new Date(Date.now() + MS_DAY).toISOString();
  for (let page=0; page<4; page++) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part","snippet");
    url.searchParams.set("channelId",channel);
    url.searchParams.set("maxResults","50");
    url.searchParams.set("order","date");
    url.searchParams.set("type","video");
    url.searchParams.set("publishedAfter",after);
    url.searchParams.set("publishedBefore",before);
    url.searchParams.set("key",key);
    if (pageToken) url.searchParams.set("pageToken",pageToken);
    // Never include a source URL with a secret API key in errors or logs.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),14_000);
    let payload;
    try {
      const response=await fetch(url,{signal:controller.signal});
      if(!response.ok) throw Error("YouTube Data API error " + response.status);
      payload=await response.json();
    } finally { clearTimeout(timer); }
    for(const item of payload.items ?? []) {
      const id=item.id?.videoId, snippet=item.snippet;
      if(snippet?.channelId===channel && /^[\w-]{11}$/.test(id??""))
        videos.push({id,channel,title:snippet.title,published:snippet.publishedAt});
    }
    pageToken=payload.nextPageToken ?? "";
    if(!pageToken) break;
  }
  return videos;
}

export async function collectOfficialVideos() {
  const previous=JSON.parse(await fs.readFile(VIDEO_CACHE_FILE,"utf8").catch(() => "[]"));
  const newlyFound=[];
  const key=process.env.YOUTUBE_DATA_API_KEY?.trim();
  const errors=[];
  for(const channel of OFFICIAL_CHANNELS) {
    try {
      const xml=await retrieveText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`);
      newlyFound.push(...extractYoutubeVideos(xml,channel));
    } catch(error) { errors.push(String(error?.message ?? error)); }
    if(key) {
      try { newlyFound.push(...await youtubeApiVideos(channel,key)); }
      catch(error) { errors.push(String(error?.message ?? error)); }
    }
  }
  const merged=mergeOfficialVideos(previous,newlyFound);
  if (!merged.length) throw Error("No verifiable official YouTube videos; " + errors.join("; "));
  await fs.writeFile(VIDEO_CACHE_FILE, JSON.stringify(merged,null,2)+"\n");
  console.log(`Verified official NBA video catalog: ${merged.length} videos (${newlyFound.length} refreshed)`);
  return merged;
}

async function main(){
  const {start,end,weekStart,weekEnd}=finishedWeek();
  const videos=await collectOfficialVideos();
  if (process.argv.includes("--collect-only")) return;
  const destination=path.resolve("public/nba-weekly/active.json");
  const existing=JSON.parse(await fs.readFile(destination,"utf8").catch(()=>"{}"));
  if (existing.weekEnd===weekEnd&&existing.player&&existing.team) {
    console.log("Already verified:",weekEnd);return;
  }
  const dates=`${ymd(start)}-${ymd(end)}`;
  const scoreboard=await retrieveJson(`${ESPN}/scoreboard?dates=${dates}&limit=150`);
  const {finals}=collectTeamGames(scoreboard.events??[]);
  if (finals.length<8) throw Error("NBA week not complete or too few results; previous verified content retained");
  const boxscores=new Map();
  // Stay well under ESPN's rate limits. Missing any boxscore aborts the batch.
  for (const event of finals) {
    boxscores.set(String(event.id),await retrieveJson(`${ESPN}/summary?event=${encodeURIComponent(event.id)}`));
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  const data=selectWeek({events:finals,boxscores,videos,weekStart,weekEnd,publishedAt:new Date().toISOString(),previous:existing});
  await fs.mkdir(path.dirname(destination),{recursive:true});
  await fs.writeFile(destination,JSON.stringify(data,null,2)+"\n");
  const archive=path.resolve(`data/generated/nba/weekly-${weekEnd}.json`);
  await fs.mkdir(path.dirname(archive),{recursive:true});
  await fs.writeFile(archive,JSON.stringify(data,null,2)+"\n");
  console.log(`Verified NBA weekly ${weekStart} to ${weekEnd}: ${data.player.name}, ${data.team.name}`);
}
if (process.argv[1] && import.meta.url===new URL("file://"+path.resolve(process.argv[1])).href) {
  main().catch(e=>{console.error("NBA weekly fail-closed:",e.message);process.exitCode=1});
}
