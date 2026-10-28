import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { barTriviaPublication } from "../nbaBarTriviaDailyPublication";

export function buildNbaBarTriviaLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "bar_trivia",
    (ordinal) => barTriviaPublication(day, scheduleVersion, ordinal));
}
export { buildNbaBarTriviaLeanPublication as buildNbaServerDailyPublication };
