import { barTriviaQuestion, type BarTriviaQuestion } from "../games/barTriviaEngine";

const TOP500 = "https://www.ufc.com/news/top-500-ufc-moments-list";

function q(seed: Parameters<typeof barTriviaQuestion>[0]) {
  return barTriviaQuestion({ ...seed, verifiedAt: "2026-09-28" });
}

export const BAR_TRIVIA_UFC_EVERGREEN_WAVE_7: readonly BarTriviaQuestion[] = [
  q({ id:"ufc-r1-do-bronx", league:"ufc", round:"round1", category:"Nicknames", prompt:"Which former UFC lightweight champion is known as 'Do Bronx'?", choices:["Charles Oliveira","Alex Pereira","Jose Aldo","Fabricio Werdum"], answer:"Charles Oliveira", explanation:"Charles Oliveira has long competed under the nickname 'Do Bronx.'", sourceId:"ufc-athlete-oliveira" }),
  q({ id:"ufc-r1-the-reaper", league:"ufc", round:"round1", category:"Nicknames", prompt:"Which former UFC middleweight champion is known as 'The Reaper'?", choices:["Robert Whittaker","Michael Bisping","Chris Weidman","Sean Strickland"], answer:"Robert Whittaker", explanation:"Robert Whittaker is widely known by the nickname 'The Reaper.'", sourceId:"ufc-athlete-whittaker" }),
  q({ id:"ufc-r1-magnum", league:"ufc", round:"round1", category:"Nicknames", prompt:"Which UFC champion is known as 'Magnum'?", choices:["Zhang Weili","Valentina Shevchenko","Joanna Jedrzejczyk","Alexa Grasso"], answer:"Zhang Weili", explanation:"Zhang Weili competes under the nickname 'Magnum.'", sourceId:"ufc-athlete-zhang" }),
  q({ id:"ufc-r2-stockton-slap", league:"ufc", round:"round2", category:"Fight Culture", prompt:"The taunting strike known as the 'Stockton Slap' is most closely associated with which fighting family?", choices:["The Diaz brothers","The Pettis brothers","The Nogueira brothers","The Shevchenko sisters"], answer:"The Diaz brothers", explanation:"Nick and Nate Diaz made the open-hand Stockton Slap part of MMA culture.", sourceId:"ufc-diaz-culture" }),
  q({ id:"ufc-r2-where-you-at-georges", league:"ufc", round:"round2", category:"Famous Callouts", prompt:"After beating BJ Penn at UFC 137, who famously called out Georges St-Pierre with 'Where you at, Georges?'", choices:["Nick Diaz","Carlos Condit","Johny Hendricks","Josh Koscheck"], answer:"Nick Diaz", explanation:"Nick Diaz used the post-fight microphone to call out Georges St-Pierre after UFC 137.", sourceId:"ufc-top500", sourceUrl:TOP500 }),
];
