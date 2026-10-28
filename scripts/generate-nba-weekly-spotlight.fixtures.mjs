import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { finishedWeek, fetchWeeklyScoreboard, collectTeamGames, selectWeek, extractYoutubeVideos,
  findMatchingHighlight, mergeOfficialVideos, archiveCandidates, verifiedArchiveVideo, playerEditorialScore, teamEditorialScore,
  basketballReferenceTeamSeasonUrl, basketballReferencePlayerUrl } from "./generate-nba-weekly-spotlight.mjs";
test("A Monday 8 AM run selects the previous seven completed Monday-Sunday dates", () => {
  assert.deepEqual(
    (({weekStart,weekEnd})=>({weekStart,weekEnd}))(finishedWeek(new Date("2026-10-26T13:00:00Z"))),
    {weekStart:"2026-10-19",weekEnd:"2026-10-25"});
});
test("seven independent ESPN daily scoreboards replace rejected date ranges without double counting",async()=>{
  const start=new Date("2026-10-19T12:00:00Z"),end=new Date("2026-10-25T12:00:00Z");
  const seen=[];
  const events=await fetchWeeklyScoreboard(start,end,async url=>{
    seen.push(url);
    return { events: [{id:String(seen.length),status:{type:{completed:true}}},
      {id:"one-duplicate"}] };
  });
  assert.equal(seen.length,7);
  assert.ok(seen.every(x=>/scoreboard\?dates=202610\d{2}&limit=100$/.test(x)));
  assert.deepEqual(events.map(x=>x.id),["1","one-duplicate","2","3","4","5","6","7"]);
  await assert.rejects(fetchWeeklyScoreboard(start,end,async()=>({})),/missing events/);
  await assert.rejects(fetchWeeklyScoreboard(start,start,async()=>({events:[]})),/exactly seven/);
});
test("official channel dated game highlights are verified without individual watch pages",()=>{
  const channel="UCWJ2lWNubArHWmf3FIHbfcQ";
  const entries=[
    {id:"ABCdefghi12",title:"Sample Star 30 Points Highlights | October 24, 2026",duration:190},
    {id:"ABCdefghi13",title:"OTHER basketball news",duration:190},
    {id:"ABCdefghi14",title:"Sample Star FULL GAME HIGHLIGHTS | October 24, 2026",duration:1200},
    {id:"ABCdefghi12",title:"Sample Star 30 Points Highlights | October 24, 2026",duration:190},
  ];
  assert.deepEqual(archiveCandidates(entries,["Sample Star"]),
    ["https://www.youtube.com/watch?v=ABCdefghi12"]);
  const good={...entries[0],timestamp:Date.parse("2026-10-25T00:00:00Z")/1000};
  const verify=(v,owner=channel)=>verifiedArchiveVideo(v,owner,"2026-10-19","2026-10-25");
  const within=verify(good);
  assert.equal(within?.channel,channel);
  assert.equal(within?.verifiedGameDate,"2026-10-24");
  assert.equal(within?.durationSeconds,190);
  assert.equal(findMatchingHighlight("Sample Star",[within],"2026-10-25")?.id,good.id);
  assert.equal(verify(good,"unofficial"),null);
  assert.equal(verify({...good,channel_id:"unofficial"}),null);
  assert.equal(verify({...good,duration:600}),null);
  assert.equal(verify({...good,title:"Sample Star 30 Points Highlights | October 26, 2026"}),null);
  assert.equal(verify({...good,title:"Sample Star 30 Points Highlights"}),null);
  assert.equal(verify({...good,title:"Sample Star 30 Points Highlights | February 31, 2026"}),null);
});
const player={id:"123",displayName:"Sample Star",position:{abbreviation:"PG"}};
const teams=[
  {id:"1",displayName:"Sample Winners",abbreviation:"ATL",logo:"https://a.espncdn.com/i/teamlogos/nba/500/aaa.png"},
  {id:"2",displayName:"Sample Rivals",abbreviation:"BOS",logo:"https://a.espncdn.com/i/teamlogos/nba/500/bbb.png"},
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
    names:["points","assists","rebounds","fieldGoalsMade-fieldGoalsAttempted","steals","blocks","threePointFieldGoalsMade-threePointFieldGoalsAttempted"],
    athletes:[{athlete:player,stats:["30","5","7","11-20","2","1","4-10"],didNotPlay:false}],
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
  assert.equal(data.player.gamesPlayed,8);
  assert.deepEqual(data.player.stats.map(x=>x.value),["30.0","5.0","7.0","55.0"]);
  assert.equal(data.team.record,"8-0");
  assert.equal(data.team.netMargin,"+15.0");
  assert.equal(data.team.fgPct,"55.0");
  assert.equal(data.team.threePct,"40.0");
  assert.equal(data.player.profileUrl, "https://www.basketball-reference.com/search/search.fcgi?search=Sample%20Star");
  assert.equal(data.team.profileUrl, "https://www.basketball-reference.com/teams/ATL/2027.html");
  assert.equal(Object.hasOwn(data.player,"summary"),false);
  assert.equal(Object.hasOwn(data.team,"summary"),false);
  assert.match(data.player.highlightUrl,/^https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.equal(data.player.highlightSourceChannelId,"UCWJ2lWNubArHWmf3FIHbfcQ");
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

test("official @NBA is the only eligible highlight channel",()=>{
  const espn=extractYoutubeVideos(xml,"UCVSSpcmZD2PwPBqb8yKQKBA");
  assert.equal(findMatchingHighlight("Sample Star",espn,"2026-10-25"),null);
  const raw=extractYoutubeVideos(xml,"UCWJ2lWNubArHWmf3FIHbfcQ");
  assert.ok(findMatchingHighlight("Sample Star",raw,"2026-10-25"));
  assert.throws(()=>selectWeek({events,boxscores,videos:espn,
    weekStart:"2026-10-19",weekEnd:"2026-10-25",publishedAt:"2026-10-27T11:00:00Z"}),
    /verified matching NBA YouTube/);
});

test("balanced production, efficiency, wins and defensive impact, and team dominance",()=>{
  const base={games:new Set(["1","2"]),position:"PG",teamId:"ATL",points:60,assists:10,
    rebounds:14,made:22,attempts:40,steals:4,blocks:2};
  const map=new Map([["ATL",{abbreviation:"ATL",games:new Set(["1","2"]),wins:2}]]);
  const score=playerEditorialScore(base,map);
  assert.ok(score>0&&score<=100);
  assert.ok(playerEditorialScore({...base,steals:0,blocks:0},map)<score);
  assert.ok(playerEditorialScore({...base,made:12},map)<score);
  assert.ok(playerEditorialScore({...base,teamId:"BOS"},map)<score);
  const teamsMap=collectTeamGames(events).teams;
  const winning=teamsMap.get("1"), losing=teamsMap.get("2");
  assert.ok(teamEditorialScore(winning,teamsMap)>teamEditorialScore(losing,teamsMap));
});

test("prefers short official NBA player performance clips over longer videos",()=>{
  const base={title:"Sample Star 30 Point Highlights",published:"2026-10-26T00:00:00Z",
    channel:"UCWJ2lWNubArHWmf3FIHbfcQ"};
  const items=[
    {...base,id:"ABCdefghi11",durationSeconds:420,published:"2026-10-26T02:00:00Z"},
    {...base,id:"ABCdefghi12",durationSeconds:190},
    {...base,id:"ABCdefghi13",durationSeconds:610},
    {...base,id:"ABCdefghi14",durationSeconds:160,title:"Sample Star EXTENDED HIGHLIGHTS"},
    {...base,id:"ABCdefghi15",durationSeconds:200,channel:"UCVSSpcmZD2PwPBqb8yKQKBA"},
  ];
  assert.equal(findMatchingHighlight("Sample Star",items,"2026-10-25")?.id,"ABCdefghi12");
});
test("published weekly snapshot keeps verified dynamic contracts across rotations",()=>{
  const data=JSON.parse(readFileSync("public/nba-weekly/active.json","utf8"));
  assert.match(data.weekStart,/^20\d{2}-\d{2}-\d{2}$/);
  assert.match(data.weekEnd,/^20\d{2}-\d{2}-\d{2}$/);
  assert.ok(data.weekStart<=data.weekEnd);
  assert.ok(Date.parse(data.publishedAt)<=Date.now()+60000);
  assert.ok(data.player.name && Number.isInteger(data.player.gamesPlayed) && data.player.gamesPlayed>=1);
  assert.match(data.player.headshotUrl,/^https:\/\/a\.espncdn\.com\//);
  assert.match(data.player.highlightUrl,/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  assert.equal(data.player.highlightSourceChannelId,"UCWJ2lWNubArHWmf3FIHbfcQ");
  assert.equal(data.player.stats.length,4);
  assert.ok(data.team.name && data.team.teamId);
  assert.match(data.team.profileUrl,/^https:\/\/www\.basketball-reference\.com\/teams\/[A-Z]{3}\/20\d{2}\.html$/);
  assert.equal(Object.hasOwn(data.team,"highlightUrl"),false);
  assert.equal(Object.hasOwn(data.player,"summary"),false);
  assert.equal(Object.hasOwn(data.team,"summary"),false);
});


test("Sports Reference season and player IDs remain correct across 2026-27",()=>{
  assert.equal(basketballReferenceTeamSeasonUrl("ATL","2026-10-23"),"https://www.basketball-reference.com/teams/ATL/2027.html");
  assert.equal(basketballReferenceTeamSeasonUrl("BKN","2026-11-01"),"https://www.basketball-reference.com/teams/BRK/2027.html");
  assert.equal(basketballReferenceTeamSeasonUrl("CHA","2026-11-01"),"https://www.basketball-reference.com/teams/CHO/2027.html");
  assert.equal(basketballReferenceTeamSeasonUrl("PHX","2026-11-01"),"https://www.basketball-reference.com/teams/PHO/2027.html");
  assert.equal(basketballReferenceTeamSeasonUrl("ATL","2027-02-08"),"https://www.basketball-reference.com/teams/ATL/2027.html");
  assert.equal(basketballReferencePlayerUrl("4431678","Tyrese Maxey"),"https://www.basketball-reference.com/players/m/maxeyty01.html");
  assert.equal(basketballReferencePlayerUrl("123","Sample Star"),"https://www.basketball-reference.com/search/search.fcgi?search=Sample%20Star");
  assert.throws(()=>basketballReferenceTeamSeasonUrl("INVALID","2026-10-23"),/Unsupported NBA team/);
});
