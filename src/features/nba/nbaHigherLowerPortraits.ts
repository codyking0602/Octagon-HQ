import { nbaFindLeaderHeadshot } from "./nbaFindTheLeaderModel";
import type { NbaHigherLowerSubject } from "./nbaHigherLowerModel";

/**
 * Player-identified editorial photographs for NBA historical headshots that
 * return a generic gray silhouette with HTTP 200 (so img.onerror never fires).
 *
 * Odom: Lakers-uniform portrait identified as Lamar Odom (Legit.ng sports).
 * Hardaway: Golden State Warriors Hall-of-Fame portrait (NBA-hosted).
 * Both are independently identified by the publishing articles, not guessed
 * from jersey numbers, positional similarity, or a different player's ID.
 */
/** Biography-identified historical portrait sources. The photo credits
 * (author, license and source) are visible in the game for all 24 restorations.
 */
export interface NbaHigherLowerPhotoCredit {
  name: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
}
export const NBA_HIGHER_LOWER_RESTORED_PORTRAITS: Readonly<Record<string, NbaHigherLowerPhotoCredit & {url:string}>> = {
  "alexenglish": {"name":"Alex English","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Alex_English.jpg/330px-Alex_English.jpg","author":"Gamecock Central","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Alex_English.jpg"},
  "alvinrobertson": {"name":"Alvin Robertson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Alvin_Robertson_Spurs.jpg/330px-Alvin_Robertson_Spurs.jpg","author":"Unknown","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Alvin_Robertson_Spurs.jpg"},
  "andreikirilenko": {"name":"Andrei Kirilenko","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Andrei_Kirilenko_in_2024.jpg/330px-Andrei_Kirilenko_in_2024.jpg","author":"Svklimkin","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","source":"https://commons.wikimedia.org/wiki/File:Andrei_Kirilenko_in_2024.jpg"},
  "andrewbynum": {"name":"Andrew Bynum","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Andrew_Bynum_Mar-2012.jpg/330px-Andrew_Bynum_Mar-2012.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Andrew_Bynum_Mar-2012.jpg"},
  "carlosboozer": {"name":"Carlos Boozer","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Carlos_Boozer.jpg/330px-Carlos_Boozer.jpg","author":"Keith Allison  from Owings Mills, USA","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Carlos_Boozer.jpg"},
  "danissel": {"name":"Dan Issel","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Dan_Issel_%281%29.jpeg/330px-Dan_Issel_%281%29.jpeg","author":"Malcolm W. Emmons","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Dan_Issel_(1).jpeg"},
  "davidthompson": {"name":"David Thompson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/David_Thompson_NC_State.jpg/330px-David_Thompson_NC_State.jpg","author":"Unknown North Carolina State University","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:David_Thompson_NC_State.jpg"},
  "dennisjohnson": {"name":"Dennis Johnson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Dennis_Johnson_Lipofsky.jpg/330px-Dennis_Johnson_Lipofsky.jpg","author":"Steve Lipofsky at  basketballphoto.com .","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","source":"https://commons.wikimedia.org/wiki/File:Dennis_Johnson_Lipofsky.jpg"},
  "glenrice": {"name":"Glen Rice","url":"https://upload.wikimedia.org/wikipedia/commons/1/14/Glen_Rice_2010_%28cropped%29.jpg","author":"inboundpass","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Glen_Rice_2010_(cropped).jpg"},
  "jacksikma": {"name":"Jack Sikma","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Jack_Sikma_IWU.jpg/330px-Jack_Sikma_IWU.jpg","author":"Unknown Illinois Wesleyan","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Jack_Sikma_IWU.jpg"},
  "jasonkidd": {"name":"Jason Kidd","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Jason_Kidd_Nets_coach_cropped.jpg/330px-Jason_Kidd_Nets_coach_cropped.jpg","author":"File:Jason Kidd Nets coach.jpg :  Keith Allison  \n derivative work:  Chrishmt0423","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","source":"https://commons.wikimedia.org/wiki/File:Jason_Kidd_Nets_coach_cropped.jpg"},
  "jermaineoneal": {"name":"Jermaine O'Neal","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Jermaine_O%27Neal_smiling.jpg/330px-Jermaine_O%27Neal_smiling.jpg","author":"Noah Salzman","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","source":"https://commons.wikimedia.org/wiki/File:Jermaine_O'Neal_smiling.jpg"},
  "jerrystackhouse": {"name":"Jerry Stackhouse","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Coach_Jerry_Stackhouse_%28cropped%29.jpg/330px-Coach_Jerry_Stackhouse_%28cropped%29.jpg","author":"Gamecock Central","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Coach_Jerry_Stackhouse_(cropped).jpg"},
  "larryjohnson": {"name":"Larry Johnson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Larry_Johnson_%28cropped%29.jpg/330px-Larry_Johnson_%28cropped%29.jpg","author":"Bryan Horowitz","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Larry_Johnson_(cropped).jpg"},
  "markaguirre": {"name":"Mark Aguirre","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Mark_Aguirre_2007_%28cropped%29.jpg/330px-Mark_Aguirre_2007_%28cropped%29.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Mark_Aguirre_2007_(cropped).jpg"},
  "mauricecheeks": {"name":"Maurice Cheeks","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Maurice_Cheeks.jpg/330px-Maurice_Cheeks.jpg","author":"Keith Allison  from Owings Mills, USA","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Maurice_Cheeks.jpg"},
  "michaelfinley": {"name":"Michael Finley","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Michael_Finley_042216_cropped.jpg/330px-Michael_Finley_042216_cropped.jpg","author":"David Krichmar","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:Michael_Finley_042216_cropped.jpg"},
  "michaelredd": {"name":"Michael Redd","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/ReddBucks.jpg/330px-ReddBucks.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:ReddBucks.jpg"},
  "patrickewing": {"name":"Patrick Ewing","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Patrick_Ewing_2021_%28cropped%29.jpg/330px-Patrick_Ewing_2021_%28cropped%29.jpg","author":"AlexanderJonesi","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Patrick_Ewing_2021_(cropped).jpg"},
  "ralphsampson": {"name":"Ralph Sampson","url":"https://upload.wikimedia.org/wikipedia/commons/6/6b/Ralph_Sampson_at_Family_farm_in_McGaheysville%2C_Virginia_on_May_23%2C_2024_%28cropped%29.jpg","author":"USDAgov","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Ralph_Sampson_at_Family_farm_in_McGaheysville%2C_Virginia_on_May_23%2C_2024_(cropped).jpg"},
  "richardhamilton": {"name":"Richard Hamilton","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Richard_Hamilton_180422-D-SW162-1588_%2827762040388%29_%28cropped%29.jpg/330px-Richard_Hamilton_180422-D-SW162-1588_%2827762040388%29_%28cropped%29.jpg","author":"Chairman of the Joint Chiefs of Staff  from Washington D.C, United States","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Richard_Hamilton_180422-D-SW162-1588_(27762040388)_(cropped).jpg"},
  "shawnmarion": {"name":"Shawn Marion","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Shawn_Marion_2013-03-27_%281%29.jpg/330px-Shawn_Marion_2013-03-27_%281%29.jpg","author":"Danny Bollinger","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Shawn_Marion_2013-03-27_(1).jpg"},
  "sidneymoncrief": {"name":"Sidney Moncrief","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Sidney_Moncrief_2015.jpg/330px-Sidney_Moncrief_2015.jpg","author":"Milwaukee VA Medical Center","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Sidney_Moncrief_2015.jpg"},
  "terrycummings": {"name":"Terry Cummings","url":"https://www.legendsofbasketball.com/wp-content/uploads/2012/02/terry-cummings-e1328557227579-181x181.jpeg","author":"National Basketball Retired Players Association","license":"Publisher photo","licenseUrl":null,"source":"https://www.legendsofbasketball.com/alumni/terry-cummings/"},
};
function photoKey(name: string) {
  return name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");
}
export function nbaHigherLowerPortraitCredit(subject: Pick<NbaHigherLowerSubject,"name">): NbaHigherLowerPhotoCredit | null {
  return NBA_HIGHER_LOWER_RESTORED_PORTRAITS[photoKey(subject.name)] ?? null;
}

export const NBA_HIGHER_LOWER_EDITORIAL_PHOTOS: Readonly<Record<string, string>> = {
  lamarodom: "https://cdn.legit.ng/images/1120/8b381781755bce3c.jpeg?v=1",
  timhardaway: "https://cdn.nba.com/teams/uploads/sites/1610612744/2022/09/hardaway-1920.jpg",
  ...Object.fromEntries(Object.entries(NBA_HIGHER_LOWER_RESTORED_PORTRAITS).map(([key, value]) => [key, value.url])),
};
export function nbaHigherLowerPortraitSource(subject: Pick<NbaHigherLowerSubject,"name"|"nbaId">) {
  const key = photoKey(subject.name);
  return NBA_HIGHER_LOWER_EDITORIAL_PHOTOS[key]
    ?? nbaFindLeaderHeadshot(subject);
}
/**
 * Guard against "successful" CDN placeholder images on browsers where canvas
 * inspection is permitted. A real photograph has many different tones; the
 * NBA generic silhouette is predominantly one flat gray. If a CDN blocks
 * canvas reads, keep the loaded photo (do not falsely reject all real players).
 */
export function nbaHigherLowerIsGenericSilhouette(image: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 28;
    canvas.height = 20;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    if (!ctx) return false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let samples = 0, flat = 0;
    for (let index = 0; index < data.length; index += 4) {
      const [r, g, b, a] = [data[index]!,data[index+1]!,data[index+2]!,data[index+3]!];
      if (a < 220) continue;
      samples++;
      if (r >= 125 && r <= 180 && Math.max(r,g,b)-Math.min(r,g,b) <= 7) flat++;
    }
    return samples >= 24 && flat / samples > .82;
  } catch {
    // CDN may not permit cross-origin canvas access; that isn't photo failure.
    return false;
  }
}
