import { test } from "node:test";
import assert from "node:assert/strict";
import { finishedWeek, collectTeamGames, selectWeek, extractYoutubeVideos,
  findMatchingHighlight, mergeOfficialVideos } from "./generate-nba-weekly-spotlight.mjs";
test("A Tuesday run selects only the previous completed Central Monday-Sunday", () => {
  assert.deepEqual(
    (({weekStart,weekEnd})=>({weekStart,weekEnd}))(finishedWeek(new Date("2026-10-27T12:00:00Z"))),
    {weekStart:"2026-10-19",weekEnd:"2026-10-25"});
});
const player={id:"123",displayName:"Sample Star",position:{abbreviation:"PG"}};
const teams=[
  {id:"1",displayName:"Sample Winners",abbreviation:"AAA",logo:"https://a.espncdn.com/i/teamlogos/nba/500/aaa.png"},
  {id:"2",displayName:"Sample Rivals",abbreviation:"BBB",logo:"https://a.espncdn.com/i/teamlogos/nba/500/bbb.png"},
];
const events=Array.from({length:8},(_,i)=>({
  id:String(i+1),status:{type:{completed:true}},
  competitions:[{competitors:[
    {team:teams[0],score:"120"},
    {team:teams[1],score:"105"},
  ]}],
}));
const boxscores=new Map(events.map(event=>[event.id,{boxscore:{players:[{
  team:teams[0],
  statistics:[{
    names:["points","assists","rebounds","fieldGoalsMade-fieldGoalsAttempted"],
    athletes:[{athlete:player,stats:["30","5","7","11-20"],didNotPlay:false}],
  }],
}]}}]));
const xml='<feed><entry><yt:videoId>ABCdefghi12</yt:videoId><title>Sample Star 30 Point Highlights</title><published>2026-10-26T00:00:00Z</published></entry></feed>';
test("requires directly matched videos from a verified channel, not fabricated links",()=>{
  const videos=extractYoutubeVideos(xml,"UCWJ2lWNubArHWmf3FIHbfcQ");
  assert.equal(videos.length,1);
  assert.equal(findMatchingHighlight("Sample Star",videos,"2026-10-25")?.id,"ABCdefghi12");
  assert.equal(findMatchingHighlight("Different Player",videos,"2026-10-25"),null);
});
test("uses only completed NBA results and calculates weekly stats from actual athlete lines",()=>{
  const scoreboard=collectTeamGames(events);
  assert.equal(scoreboard.finals.length,8);
  const data=selectWeek({
    events,boxscores,
    videos:extractYoutubeVideos(xml,"UCWJ2lWNubArHWmf3FIHbfcQ"),
    weekStart:"2026-10-19",weekEnd:"2026-10-25",publishedAt:"2026-10-27T11:00:00Z",
  });
  assert.equal(data.player.name,"Sample Star");
  assert.deepEqual(data.player.stats.map(x=>x.value),["30.0","5.0","7.0","55.0"]);
  assert.equal(data.team.record,"8-0");
  assert.equal(data.team.netMargin,"+15.0");
  assert.match(data.player.highlightUrl,/^https:\/\/www\.youtube\.com\/watch\?v=/);
});
test("fails closed for incomplete source video and boxscore coverage",()=>{
  assert.throws(()=>selectWeek({events,boxscores,videos:[],weekStart:"2026-10-19",
    weekEnd:"2026-10-25",publishedAt:"2026-10-27T11:00:00Z"}),/verified matching/);
  const missing=new Map(boxscores);
  missing.delete("2");
  assert.throws(()=>selectWeek({events,boxscores:missing,
    videos:extractYoutubeVideos(xml,"UCWJ2lWNubArHWmf3FIHbfcQ"),
    weekStart:"2026-10-19",weekEnd:"2026-10-25",publishedAt:"2026-10-27T11:00:00Z"}),/Missing complete boxscore/);
});

test("recovers week-long NBA highlight coverage from cached daily official uploads",()=>{
  const now=new Date().toISOString();
  const older={id:"ABCdefghi12",title:"Sample Star Full Game Highlights",published:now,channel:"UCWJ2lWNubArHWmf3FIHbfcQ"};
  const latest={id:"ABCDEFGHIjk",title:"Latest NBA Highlights",published:now,channel:"UCWJ2lWNubArHWmf3FIHbfcQ"};
  const list=mergeOfficialVideos([older],[latest,older],[
    {...older,id:"XBCdefghi12",channel:"unknown-channel"}
  ]);
  assert.equal(list.length,2);
  assert.ok(list.some(v=>v.id==="ABCdefghi12"));
  assert.ok(list.some(v=>v.id==="ABCDEFGHIjk"));
  assert.ok(list.every(v=>v.channel==="UCWJ2lWNubArHWmf3FIHbfcQ"));
});

test("rejects an otherwise matching highlight from Monday's next slate",()=>{
  const future=extractYoutubeVideos(
    '<feed><entry><yt:videoId>ABCdefghi12</yt:videoId><title>Sample Star NBA Highlights</title><published>2026-10-27T01:00:00Z</published></entry></feed>',
    "UCWJ2lWNubArHWmf3FIHbfcQ");
  assert.equal(findMatchingHighlight("Sample Star",future,"2026-10-25"),null);
  const valid=extractYoutubeVideos(
    '<feed><entry><yt:videoId>ABCdefghi12</yt:videoId><title>Sample Star Jr Highlights</title><published>2026-10-26T00:00:00Z</published></entry></feed>',
    "UCWJ2lWNubArHWmf3FIHbfcQ");
  assert.equal(findMatchingHighlight("Sample Star Jr.",valid,"2026-10-25")?.id,"ABCdefghi12");
});
