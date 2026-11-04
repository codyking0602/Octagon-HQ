// Public-source diagnostics for 2026 Cup score feed. No credentials involved.
const urls={
  live:"https://octagon.hq-app.workers.dev/api/nba/cup-2026-scoreboard?date=2026-10-30",
  espn:"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=20261030&limit=100",
  nba_box:"https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022600017.json",
  nba_schedule:"https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json",
};
await Promise.all(Object.entries(urls).map(async([name,url])=>{
  try{
    const response=await fetch(url,{headers:{Accept:"application/json","User-Agent":"OctagonHQ/1.0"},signal:AbortSignal.timeout(12000)});
    const text=await response.text();
    let value;try{value=JSON.parse(text)}catch{}
    const games=value?.events??value?.game??value?.leagueSchedule?.gameDates;
    console.log(JSON.stringify({
      name,status:response.status,length:text.length,contentType:response.headers.get("content-type"),
      sample:typeof games==="object"?JSON.stringify(games).slice(0,1200):text.slice(0,700),
      error:value?.error,
    }));
  }catch(error){console.log(JSON.stringify({name,error:String(error)}));}
}));
