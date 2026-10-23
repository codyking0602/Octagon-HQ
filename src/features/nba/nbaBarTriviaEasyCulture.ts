import { barTriviaQuestion } from "../games/barTriviaEngine";
/** Two NBA-first fan-culture anchors not reused in the other NBA trivia banks. */
export const NBA_BAR_TRIVIA_EASY_CULTURE = [
  barTriviaQuestion({"id":"nba-bt-e3-1","league":"nba","round":"round1","sourceId":"nba-culture","sourceUrl":"https://www.nba.com/news","category":"NBA Culture","prompt":"Which NBA team's fans famously 'Light the Beam' after victories?","answer":"Sacramento Kings","choices":["Sacramento Kings","Phoenix Suns","Denver Nuggets","Portland Trail Blazers"],"explanation":"Sacramento's purple beam tradition celebrates Kings wins and became a modern rallying cry."}),
  barTriviaQuestion({"id":"nba-bt-e3-2","league":"nba","round":"round1","sourceId":"nba-culture","sourceUrl":"https://www.nba.com/news","category":"Broadcast Legends","prompt":"Which NBA broadcaster is famous for shouting 'Bang!' after huge shots?","answer":"Mike Breen","choices":["Mike Breen","Kevin Harlan","Ian Eagle","Marv Albert"],"explanation":"Longtime national broadcaster Mike Breen punctuates major shots with his signature 'Bang!' call."}),
] as const;
