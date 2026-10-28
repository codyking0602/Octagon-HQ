import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC Feud batch five Fast Money: editorial-only, not imported into live Daily. */
const ROWS = [
  {
    "id": "ufc-v2-fast5-japanese-fighters",
    "lane": "japan-fighter-identities",
    "prompt": "Name a Japanese fighter who has competed in the UFC.",
    "kind": "person",
    "ranked": "Yushin Okami|Kyoji Horiguchi|Takanori Gomi|Tatsuro Taira|Takeya Mizugaki|Caol Uno|Kazushi Sakuraba|Rinya Nakamura",
    "extras": "Hatsu Hioki|Yuki Kondo|Norifumi Yamamoto|Keita Nakamura|Takanori Kikuno|Shinsho Anzai|Teruto Ishihara|Yuta Sasaki",
    "aliases": {
      "Norifumi Yamamoto": [
        "Kid Yamamoto"
      ],
      "Takanori Gomi": [
        "Fireball Kid"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-korean-fighters",
    "lane": "korea-fighter-identities",
    "prompt": "Name a fighter from South Korea who has competed in the UFC.",
    "kind": "person",
    "ranked": "The Korean Zombie|Dong Hyun Kim|Doo Ho Choi|Kyung Ho Kang|Jun Yong Park|Da Un Jung|Seung Woo Choi|Ji Yeon Kim",
    "extras": "Hyun Sung Park|Chan Mi Jeon|Tae Hyun Bang|Yui Chul Nam|Sung Bin Jo|Seokhyeon Ko",
    "aliases": {
      "The Korean Zombie": [
        "Chan Sung Jung"
      ],
      "Doo Ho Choi": [
        "Korean Superboy"
      ],
      "Dong Hyun Kim": [
        "Stun Gun"
      ],
      "Jun Yong Park": [
        "Iron Turtle"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-polish-fighters",
    "lane": "poland-fighter-identities",
    "prompt": "Name a Polish fighter who has competed in the UFC.",
    "kind": "person",
    "ranked": "Joanna Jedrzejczyk|Jan Blachowicz|Mateusz Gamrot|Marcin Tybura|Karolina Kowalkiewicz|Krzysztof Jotko|Michal Oleksiejczuk|Marcin Held",
    "extras": "Damian Stasiak|Daniel Omielanczuk|Piotr Hallmann|Lukasz Brzeski|Tomasz Drwal|Bartosz Fabinski",
    "aliases": {
      "Joanna Jedrzejczyk": [
        "Joanna Champion"
      ],
      "Jan Blachowicz": [
        "Jan Błachowicz"
      ],
      "Michal Oleksiejczuk": [
        "Michał Oleksiejczuk"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-chinese-fighters",
    "lane": "china-fighter-identities",
    "prompt": "Name a fighter from China who has competed in the UFC.",
    "kind": "person",
    "ranked": "Zhang Weili|Yan Xiaonan|Song Yadong|Li Jingliang|Su Mudaerji|Zhang Mingyang|Wang Cong|Aoriqileng",
    "extras": "Wu Yanan|Zhang Lipeng|Ma Yaozong|Heili Alateng|Zhu Rong|Zhang Tiequan|Liu Pingyuan",
    "aliases": {
      "Zhang Weili": [
        "Weili Zhang"
      ],
      "Li Jingliang": [
        "The Leech"
      ],
      "Song Yadong": [
        "Yadong Song"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-french-fighters",
    "lane": "france-fighter-identities",
    "prompt": "Name a French UFC fighter.",
    "kind": "person",
    "ranked": "Ciryl Gane|Benoit Saint Denis|Manon Fiorot|Cheick Kongo|Morgan Charriere|William Gomis|Fares Ziam|Taylor Lapilus",
    "extras": "Nassourdine Imavov|Oumar Sy|Cyrille Diabate|Mickael Lebout",
    "aliases": {
      "Ciryl Gane": [
        "Bon Gamin"
      ],
      "Benoit Saint Denis": [
        "Benoît Saint-Denis",
        "God of War"
      ],
      "Morgan Charriere": [
        "The Last Pirate"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-us-host-states",
    "lane": "ufc-us-state-hosts",
    "prompt": "Name a U.S. state that has hosted a UFC event.",
    "kind": "other",
    "ranked": "Nevada|New York|California|Texas|Florida|New Jersey|Massachusetts|Colorado",
    "extras": "Arizona|Georgia|Illinois|Louisiana|Utah|Tennessee|Pennsylvania|Washington|Ohio|Michigan|Missouri|North Carolina|Connecticut|Wisconsin|Oklahoma|Virginia",
    "aliases": {
      "Nevada": [
        "NV"
      ],
      "Texas": [
        "TX"
      ],
      "New York": [
        "NY"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-historic-tv",
    "lane": "ufc-event-broadcast-platforms",
    "prompt": "Name a channel or streaming service that has carried UFC fights.",
    "kind": "other",
    "ranked": "ESPN|FOX|Spike TV|ABC|UFC Fight Pass|Paramount+|CBS|FX",
    "extras": "FS1|Fuel TV|Fox Sports 2|Versus|ESPN2|Fox Deportes|ESPN Deportes|PPV provider",
    "aliases": {
      "ESPN": [
        "ESPN+"
      ],
      "FOX": [
        "Fox"
      ],
      "Spike TV": [
        "Spike"
      ],
      "UFC Fight Pass": [
        "Fight Pass"
      ],
      "Paramount+": [
        "Paramount Plus"
      ],
      "FS1": [
        "Fox Sports 1"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-scorecards",
    "lane": "ufc-judge-scorecard-items",
    "prompt": "Name something a UFC judge's official scorecard might contain.",
    "kind": "other",
    "ranked": "Fighter names|Round numbers|10-9 score|Judge name|Total scores|Point deductions|Event name|10-8 score",
    "extras": "Judge signature|Red corner|Blue corner|Date|Weight class|10-10 round|Fight number|Commission|Winner|Final tally",
    "aliases": {
      "Fighter names": [
        "Names"
      ],
      "Round numbers": [
        "Round"
      ],
      "Point deductions": [
        "Deductions"
      ],
      "Total scores": [
        "Totals"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-film-study",
    "lane": "ufc-opponent-video-analysis",
    "prompt": "Name something a UFC coach might study while reviewing an opponent's old fights.",
    "kind": "other",
    "ranked": "Striking|Takedown defense|Footwork|Submission attempts|Fighting stance|Cardio|Counterpunching|Clinch work",
    "extras": "Hand speed|Jab|Kicks|Guard|Movement|Range|Ground control|Fight pace|Tendencies|Weaknesses|Knockout power|Combinations|Defensive habits",
    "aliases": {
      "Fighting stance": [
        "Stance"
      ],
      "Clinch work": [
        "Clinch"
      ],
      "Takedown defense": [
        "Wrestling defense"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-prior-sports",
    "lane": "ufc-fighter-former-sports",
    "prompt": "Name a sport a UFC fighter might have played before starting MMA.",
    "kind": "other",
    "ranked": "Wrestling|Boxing|Football|Soccer|Basketball|Judo|Karate|Rugby",
    "extras": "Kickboxing|Taekwondo|Track|Baseball|Gymnastics|Swimming|Hockey|Tennis|Weightlifting|Jiu-jitsu|Sambo|Cycling|Volleyball",
    "aliases": {
      "Football": [
        "American football"
      ],
      "Wrestling": [
        "Amateur wrestling"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-fight-card-parts",
    "lane": "ufc-event-card-order",
    "prompt": "Name a part of a UFC event's fight-card running order.",
    "kind": "other",
    "ranked": "Main event|Co-main event|Main card|Preliminary card|Early preliminaries|Opening bout|Featured prelim|Title fight",
    "extras": "Undercard|Headline fight|Final fight|Main-card opener|Early prelim bout|Main-card bout",
    "aliases": {
      "Main event": [
        "Headliner"
      ],
      "Co-main event": [
        "Co-main"
      ],
      "Preliminary card": [
        "Prelims"
      ],
      "Early preliminaries": [
        "Early prelims"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-fighter-gear-care",
    "lane": "mma-training-equipment-care",
    "prompt": "Name something an MMA fighter might do to keep training equipment clean or usable.",
    "kind": "other",
    "ranked": "Wash clothes|Air out gloves|Clean mouthguard|Disinfect pads|Dry gear|Replace worn wraps|Wipe down headgear|Wash shin guards",
    "extras": "Wash shorts|Clean bag|Wipe gloves|Hang up gear|Dry shoes|Clean protective equipment|Sanitize gear|Repair equipment|Inspect gloves|Keep gear dry",
    "aliases": {
      "Wash clothes": [
        "Laundry"
      ],
      "Air out gloves": [
        "Dry gloves"
      ],
      "Disinfect pads": [
        "Sanitize pads"
      ],
      "Dry gear": [
        "Hang gear"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH5 = makeUfcFeudDraft(ROWS);
