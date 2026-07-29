export type FighterNicknamePosition = "prefix" | "middle" | "suffix";

export interface FighterNamePresentation {
  nickname: string;
  position: FighterNicknamePosition;
  baseName?: string;
}

export const fighterNamePresentationBySlug: Readonly<Record<string, FighterNamePresentation>> = {
  "jon-jones": { nickname: "Bones", position: "middle" },
  "georges-st-pierre": { nickname: "Rush", position: "middle" },
  "demetrious-johnson": { nickname: "Mighty Mouse", position: "middle" },
  "anderson-silva": { nickname: "The Spider", position: "middle" },
  "khabib-nurmagomedov": { nickname: "The Eagle", position: "middle" },
  "daniel-cormier": { nickname: "DC", position: "middle" },
  "amanda-nunes": { nickname: "The Lioness", position: "middle" },
  "valentina-shevchenko": { nickname: "Bullet", position: "middle" },
  "israel-adesanya": { nickname: "The Last Stylebender", position: "middle" },
  "charles-oliveira": { nickname: "Do Bronx", position: "middle" },
  "chan-sung-jung": { nickname: "The Korean Zombie", position: "prefix" },
  "mauricio-rua": { nickname: "Shogun", position: "middle", baseName: "Maurício Rua" },
  "brandon-moreno": { nickname: "The Assassin Baby", position: "middle" },
  "anthony-pettis": { nickname: "Showtime", position: "middle" },
  "alex-pantoja": { nickname: "The Cannibal", position: "middle", baseName: "Alexandre Pantoja" },
  "alex-pereira": { nickname: "Poatan", position: "middle" },
  "alexander-volkanovski": { nickname: "The Great", position: "middle" },
  "aljamain-sterling": { nickname: "Funk Master", position: "middle" },
  "benson-henderson": { nickname: "Smooth", position: "middle" },
  "bj-penn": { nickname: "The Prodigy", position: "middle", baseName: "B.J. Penn" },
  "carla-esparza": { nickname: "Cookie Monster", position: "middle" },
  "chael-sonnen": { nickname: "The American Gangster", position: "middle" },
  "chris-weidman": { nickname: "The All-American", position: "middle" },
  "chuck-liddell": { nickname: "The Iceman", position: "middle" },
  "conor-mcgregor": { nickname: "The Notorious", position: "prefix" },
  "dan-henderson": { nickname: "Hendo", position: "middle" },
  "deiveson-figueiredo": { nickname: "Deus da Guerra", position: "middle" },
  "dominick-cruz": { nickname: "The Dominator", position: "middle" },
  "dricus-du-plessis": { nickname: "Stillknocks", position: "middle" },
  "dustin-poirier": { nickname: "The Diamond", position: "middle" },
  "fabricio-werdum": { nickname: "Vai Cavalo", position: "middle" },
  "francis-ngannou": { nickname: "The Predator", position: "middle" },
  "frankie-edgar": { nickname: "The Answer", position: "middle" },
  "henry-cejudo": { nickname: "Triple C", position: "middle" },
  "holly-holm": { nickname: "The Preacher’s Daughter", position: "middle" },
  "ilia-topuria": { nickname: "El Matador", position: "middle" },
  "jessica-andrade": { nickname: "Bate Estaca", position: "middle", baseName: "Jéssica Andrade" },
  "julianna-pena": { nickname: "The Venezuelan Vixen", position: "middle", baseName: "Julianna Peña" },
  "junior-dos-santos": { nickname: "Cigano", position: "middle" },
  "justin-gaethje": { nickname: "The Highlight", position: "middle" },
  "kamaru-usman": { nickname: "The Nigerian Nightmare", position: "middle" },
  "khamzat-chimaev": { nickname: "Borz", position: "middle" },
  "leon-edwards": { nickname: "Rocky", position: "middle" },
  "lyoto-machida": { nickname: "The Dragon", position: "middle" },
  "max-holloway": { nickname: "Blessed", position: "middle" },
  "merab-dvalishvili": { nickname: "The Machine", position: "middle" },
  "michael-bisping": { nickname: "The Count", position: "middle" },
  "miesha-tate": { nickname: "Cupcake", position: "middle" },
  "paddy-pimblett": { nickname: "The Baddy", position: "middle" },
  "petr-yan": { nickname: "No Mercy", position: "middle" },
  "quinton-jackson": { nickname: "Rampage", position: "middle" },
  "randy-couture": { nickname: "The Natural", position: "middle" },
  "rashad-evans": { nickname: "Suga", position: "prefix" },
  "robbie-lawler": { nickname: "Ruthless", position: "prefix" },
  "robert-whittaker": { nickname: "The Reaper", position: "middle" },
  "ronda-rousey": { nickname: "Rowdy", position: "prefix" },
  "rose-namajunas": { nickname: "Thug", position: "prefix" },
  "sean-omalley": { nickname: "Suga", position: "prefix", baseName: "Sean O’Malley" },
  "sean-strickland": { nickname: "Tarzan", position: "middle" },
  "shogun-rua": { nickname: "Shogun", position: "middle", baseName: "Maurício Rua" },
  "tito-ortiz": { nickname: "The Huntington Beach Bad Boy", position: "middle" },
  "tony-ferguson": { nickname: "El Cucuy", position: "middle" },
  "tyron-woodley": { nickname: "The Chosen One", position: "middle" },
  "vitor-belfort": { nickname: "The Phenom", position: "middle" },
  "zhang-weili": { nickname: "Magnum", position: "middle" },
};

function cleanNickname(value: string) {
  return value.trim().replace(/^[“”"']+|[“”"']+$/g, "").trim();
}

export function formatFighterDisplayName(slug: string, canonicalName: string) {
  const presentation = fighterNamePresentationBySlug[slug];
  if (!presentation) return canonicalName;

  const nickname = cleanNickname(presentation.nickname);
  const baseName = presentation.baseName?.trim() || canonicalName.trim();
  if (!nickname || !baseName) return canonicalName;

  const quotedNickname = `“${nickname}”`;
  if (presentation.position === "prefix") return `${quotedNickname} ${baseName}`;
  if (presentation.position === "suffix") return `${baseName} ${quotedNickname}`;

  const parts = baseName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return `${baseName} ${quotedNickname}`;
  return `${parts[0]} ${quotedNickname} ${parts.slice(1).join(" ")}`;
}
