import type { NbaHigherLowerSubject } from "./nbaHigherLowerModel";

/**
 * Player-identified editorial photographs for NBA historical headshots that
 * return a generic gray silhouette with HTTP 200 (so img.onerror never fires).
 *
 * Playing-era editorial overrides replace unsuitable post-career/event images as well as CDN silhouettes.
 * Hardaway: Golden State Warriors Hall-of-Fame portrait (NBA-hosted).
 * Both are independently identified by the publishing articles, not guessed
 * from jersey numbers, positional similarity, or a different player's ID.
 */
/** Biography-identified historical portrait sources. The photo credits
 * (author, license and source) accompany each displayed editorial photograph.
 */
export interface NbaHigherLowerPhotoCredit {
  name: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
}
export const NBA_HIGHER_LOWER_RESTORED_PORTRAITS: Readonly<Record<string, NbaHigherLowerPhotoCredit & {url:string}>> = {
  "clydedrexler": {"name":"Clyde Drexler","url":"https://www.basketballnetwork.net/.image/c_fill%2Cw_1200%2Ch_1200%2Cg_faces%3Acenter/MjAxMDA4NTkxNTQ3ODY4ODM0/clyde-drexler.jpg","author":"Basketball Network","license":"Publisher photograph","licenseUrl":null,"source":"https://www.basketballnetwork.net/old-school/clyde-drexler-shares-why-he-stayed-loyal-to-the-portland-trail-blazers"},
  "timhardaway": {"name":"Tim Hardaway","url":"https://www.basketballnetwork.net/.image/c_fill%2Cw_1200%2Ch_1200%2Cg_faces%3Acenter/MTg3MTYwOTUzOTUxMjk5NDY5/tim-hardaway.jpg","author":"Basketball Network","license":"Publisher photo","licenseUrl":null,"source":"https://www.basketballnetwork.net/old-school/tim-hardaways-nightmare-game-against-the-dallas-mavericks-in-1991"},
  "mauricecheeks": {"name":"Maurice Cheeks","url":"https://cdn.nba.com/teams/uploads/sites/1610612755/2023/01/cheeks2.png","author":"Philadelphia 76ers / NBA","license":"Publisher photo","licenseUrl":null,"source":"https://www.nba.com/sixers/76ers-alumni/maurice-cheeks"},
  "ralphsampson": {"name":"Ralph Sampson","url":"https://images.imagerenderer.com/images/artworkimages/mediumlarge/3/ralph-sampson-andrew-d-bernstein.jpg","author":"Andrew D. Bernstein / NBAE","license":"Publisher photo","licenseUrl":null,"source":"https://photostore.nba.com/featured/ralph-sampson-andrew-d-bernstein.html"},
  "alexenglish": {"name":"Alex English","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Alex_English.jpg/330px-Alex_English.jpg","author":"Gamecock Central","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Alex_English.jpg"},
  "alvinrobertson": {"name":"Alvin Robertson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Alvin_Robertson_Spurs.jpg/330px-Alvin_Robertson_Spurs.jpg","author":"Unknown","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Alvin_Robertson_Spurs.jpg"},
  "andreikirilenko": {"name":"Andrei Kirilenko","url":"https://upload.wikimedia.org/wikipedia/commons/f/ff/Andrei_Kirilenko_2006.jpg","author":"Kevin Ward","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Andrei_Kirilenko_2006.jpg"},
  "andrewbynum": {"name":"Andrew Bynum","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Andrew_Bynum_Mar-2012.jpg/330px-Andrew_Bynum_Mar-2012.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Andrew_Bynum_Mar-2012.jpg"},
  "brandonroy": {"name":"Brandon Roy","url":"https://upload.wikimedia.org/wikipedia/commons/5/53/Brandon_Roy.jpg","author":"Davej1006","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Brandon_Roy.jpg"},
  "carlosboozer": {"name":"Carlos Boozer","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Carlos_Boozer.jpg/330px-Carlos_Boozer.jpg","author":"Keith Allison  from Owings Mills, USA","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Carlos_Boozer.jpg"},
  "danissel": {"name":"Dan Issel","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Dan_Issel_%281%29.jpeg/330px-Dan_Issel_%281%29.jpeg","author":"Malcolm W. Emmons","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Dan_Issel_(1).jpeg"},
  "davidthompson": {"name":"David Thompson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/David_Thompson_NC_State.jpg/330px-David_Thompson_NC_State.jpg","author":"Unknown North Carolina State University","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:David_Thompson_NC_State.jpg"},
  "dennisjohnson": {"name":"Dennis Johnson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Dennis_Johnson_Lipofsky.jpg/330px-Dennis_Johnson_Lipofsky.jpg","author":"Steve Lipofsky at  basketballphoto.com .","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","source":"https://commons.wikimedia.org/wiki/File:Dennis_Johnson_Lipofsky.jpg"},
  "glenrice": {"name":"Glen Rice","url":"https://a57.foxsports.com/statics.foxsports.com/www.foxsports.com/content/uploads/2020/02/1280/1280/3c7d54b1-082915-nba-Glen-Rice-pi-mp.jpg?tl=1&ve=1","author":"Fox Sports","license":"Publisher photo","licenseUrl":null,"source":"https://amp.foxsports.com/stories/nba/whos-the-best-shooting-guard-in-charlotte-hornets-history"},
  "jacksikma": {"name":"Jack Sikma","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Jack_Sikma_IWU.jpg/330px-Jack_Sikma_IWU.jpg","author":"Unknown Illinois Wesleyan","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Jack_Sikma_IWU.jpg"},
  "jasonkidd": {"name":"Jason Kidd","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Jason_Kidd_mavs_allison.jpg/330px-Jason_Kidd_mavs_allison.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Jason_Kidd_mavs_allison.jpg"},
  "jermaineoneal": {"name":"Jermaine O'Neal","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Jermaine_O%27Neal_cropped.jpg/330px-Jermaine_O%27Neal_cropped.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Jermaine_O%27Neal_cropped.jpg"},
  "jerrystackhouse": {"name":"Jerry Stackhouse","url":"https://i.ebayimg.com/images/g/qLEAAOSwbnxj97rW/s-l1200.jpg","author":"Positive Images (archival photo)","license":"Publisher photograph","licenseUrl":null,"source":"https://www.ebay.com/itm/134462866127"},
  "larryjohnson": {"name":"Larry Johnson","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Larry_Johnson_%28cropped%29.jpg/330px-Larry_Johnson_%28cropped%29.jpg","author":"Bryan Horowitz","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Larry_Johnson_(cropped).jpg"},
  "markaguirre": {"name":"Mark Aguirre","url":"https://upload.wikimedia.org/wikipedia/commons/7/76/Lipofsky_Mark_Aguirre.jpg","author":"Steve Lipofsky","license":"CC BY 3.0","licenseUrl":"https://creativecommons.org/licenses/by/3.0","source":"https://commons.wikimedia.org/wiki/File:Lipofsky_Mark_Aguirre.jpg"},
  "michaelfinley": {"name":"Michael Finley","url":"https://upload.wikimedia.org/wikipedia/commons/e/e5/Michael_Finley_2009_headshot.jpg","author":"Keith Allison / Lpdrew","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Michael_Finley_2009_headshot.jpg"},
  "michaelredd": {"name":"Michael Redd","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/ReddBucks.jpg/330px-ReddBucks.jpg","author":"Keith Allison","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:ReddBucks.jpg"},
  "patrickewing": {"name":"Patrick Ewing","url":"https://upload.wikimedia.org/wikipedia/commons/a/a8/Patrick_Ewing_ca._1995_cropped.jpg","author":"Seidenstud","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","source":"https://commons.wikimedia.org/wiki/File:Patrick_Ewing_ca._1995_cropped.jpg"},
  "richardhamilton": {"name":"Richard Hamilton","url":"https://upload.wikimedia.org/wikipedia/commons/d/db/Richard_Hamilton_Pistons_2009.jpg","author":"Kevin Ward","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","source":"https://commons.wikimedia.org/wiki/File:Richard_Hamilton_Pistons_2009.jpg"},
  "shawnmarion": {"name":"Shawn Marion","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Shawn_Marion_2013-03-27_%281%29.jpg/330px-Shawn_Marion_2013-03-27_%281%29.jpg","author":"Danny Bollinger","license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0","source":"https://commons.wikimedia.org/wiki/File:Shawn_Marion_2013-03-27_(1).jpg"},
  "sidneymoncrief": {"name":"Sidney Moncrief","url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Sidney_Moncrief_Arkansas.jpg/330px-Sidney_Moncrief_Arkansas.jpg","author":"University of Arkansas (1977 yearbook)","license":"Public domain","licenseUrl":null,"source":"https://commons.wikimedia.org/wiki/File:Sidney_Moncrief_Arkansas.jpg"},
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
  gailgoodrich: "https://cdn.nba.com/manage/2021/08/GettyImages-1148261504.jpg",
  ...Object.fromEntries(Object.entries(NBA_HIGHER_LOWER_RESTORED_PORTRAITS).map(([key, value]) => [key, value.url])),
};
/**
 * Canonical NBA portrait source for every photo-bearing NBA game.
 * Player IDs are resolved by the owning game's season/identity roster; never
 * infer a different person's ID from a fuzzy name. Named editorial overrides
 * are source-identified photographs for CDN 200-OK gray placeholders.
 */
export function nbaPortraitSource(subject: Pick<NbaHigherLowerSubject, "name" | "nbaId">): string | null {
  const editorial = NBA_HIGHER_LOWER_EDITORIAL_PHOTOS[photoKey(subject.name)];
  if (editorial) return editorial;
  return subject.nbaId == null ? null
    : "https://cdn.nba.com/headshots/nba/latest/1040x760/" + subject.nbaId + ".png";
}
/** Backwards-compatible game-specific name; no second portrait registry. */
export const nbaHigherLowerPortraitSource = nbaPortraitSource;
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
