import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

export const ufcWhoAmIAuthoredLaunchExpansion: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    subjectId: "ufc:israel-adesanya",
    name: "Israel Adesanya",
    earlyRotation: "normal",
    sources: {
      profile: "https://www.ufc.com/athlete/israel-adesanya?language_content_entity=en",
      career: "https://www.ufc.com/news/israel-adesanya-career-highlights-title-wins-best-fights-ufc-middleweight",
      walkout: "https://www.ufc.com/news/ufc-walkouts-we-love-adesanya-mcgregor-ortega-till-covington-tuivasa-barnett",
      gastelum: "https://www.ufc.com/story/0e7afed4-0cf9-491b-8814-d4ad7ce7b656"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-israel-adesanya-a-1", text: "I began serious combat-sports training in 2008 because I wanted the skills to protect myself.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-israel-adesanya-a-2", text: "Before fighting became my full-time path, I spent several years studying computer graphic design.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-israel-adesanya-a-3", text: "One of my jobs before becoming a full-time fighter involved metering and billing for a gas-line company.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-israel-adesanya-a-4", text: "My UFC debut came in 2018 and ended with a second-round stoppage of Rob Wilkinson.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-a-5", text: "I beat Anderson Silva by decision in a three-round UFC main event before I ever held UFC gold.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-a-6", text: "I won an interim middleweight title by outlasting Kelvin Gastelum over five rounds.", band: "strong", verification: "verified", sourceIds: ["career", "gastelum"] },
          { id: "ufc-israel-adesanya-a-7", text: "Six months later, I knocked out Robert Whittaker to become the undisputed champion.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-a-8", text: "Before my first fight with Alex Pereira in the UFC, I had already made five successful title defenses.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-a-9", text: "I regained the middleweight championship by knocking out Pereira in the second round at UFC 287.", band: "giveaway", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-a-10", text: "My nickname “The Last Stylebender” reflects my long-running connection to anime and animation culture.", band: "giveaway", verification: "verified", sourceIds: ["profile"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-israel-adesanya-b-1", text: "Dance was part of my life before I became famous as a fighter.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-israel-adesanya-b-2", text: "I later turned that background into one of the UFC’s most memorable choreographed title-fight walkouts.", band: "broad", verification: "verified", sourceIds: ["walkout", "profile"] },
          { id: "ufc-israel-adesanya-b-3", text: "I stopped Derek Brunson in the first round during my rapid rise through the middleweight division.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-4", text: "A five-round decision over Brad Tavares was one of the early tests in my UFC run.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-5", text: "I defended the middleweight title by stopping the previously unbeaten Paulo Costa in the second round.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-6", text: "I moved up to light heavyweight for a title fight with Jan Blachowicz and lost a five-round decision.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-7", text: "I later beat Robert Whittaker a second time, this time by decision in a championship rematch.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-8", text: "Alex Pereira took my middleweight belt with a fifth-round stoppage at UFC 281.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-9", text: "I lost the same championship to Sean Strickland by unanimous decision at UFC 293.", band: "giveaway", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-israel-adesanya-b-10", text: "My title-unifying knockout of Whittaker followed a choreographed dance entrance at UFC 243.", band: "giveaway", verification: "verified", sourceIds: ["career", "walkout"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:alex-pereira",
    name: "Alex Pereira",
    earlyRotation: "normal",
    sources: {
      profile: "https://www.ufc.com/athlete/alex-pereira",
      career: "https://www.ufc.com/news/alex-pereira-career-highlights-journey-belt-middleweight-light-heavyweight-ufc",
      moving: "https://www.ufc.com/news/five-fighters-whove-thrived-moving-up-a-weight-division-ufc",
      sister: "https://www.ufc.com/news/aline-pereira-ready-make-alex-pereira-splash-ufc-fight-pass",
      nickname: "https://www.mmafighting.com/2023/4/8/23672500/racism-alcohol-rituals-fights-alex-pereira-mentor-poatan-israel-adesanya-ufc-287"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-alex-pereira-a-1", text: "I began kickboxing in 2009 as part of changing my life and getting away from alcohol.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-alex-pereira-a-2", text: "Before combat sports became my career, I worked in a tire repair shop.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-alex-pereira-a-3", text: "I became a GLORY Kickboxing middleweight champion and made five successful defenses there.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-a-4", text: "I later added a GLORY light heavyweight championship before making my UFC run.", band: "helpful", verification: "verified", sourceIds: ["career", "profile"] },
          { id: "ufc-alex-pereira-a-5", text: "My UFC debut ended with a second-round stoppage of Andreas Michailidis.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-a-6", text: "A first-round knockout of Sean Strickland put me in position for my first UFC title shot.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-a-7", text: "I won the UFC middleweight championship by stopping Israel Adesanya in the fifth round.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-a-8", text: "After losing that belt in a rematch, I moved to 205 pounds and defeated Jan Blachowicz.", band: "strong", verification: "verified", sourceIds: ["career", "moving"] },
          { id: "ufc-alex-pereira-a-9", text: "I became champion in a second UFC division by stopping Jiří Procházka at Madison Square Garden.", band: "giveaway", verification: "verified", sourceIds: ["career", "moving"] },
          { id: "ufc-alex-pereira-a-10", text: "My mentor gave me the name “Poatan,” tied to the idea of hands as hard as rock and to my Indigenous heritage.", band: "giveaway", verification: "verified", sourceIds: ["nickname"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-alex-pereira-b-1", text: "My younger sister also became a professional combat-sports athlete.", band: "broad", verification: "verified", sourceIds: ["sister"] },
          { id: "ufc-alex-pereira-b-2", text: "I reached my first UFC championship opportunity after only three fights in the promotion.", band: "broad", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-b-3", text: "My first UFC light heavyweight bout was a split-decision win over a former champion.", band: "helpful", verification: "verified", sourceIds: ["career", "moving"] },
          { id: "ufc-alex-pereira-b-4", text: "At UFC 300, I defended a championship by knocking out Jamahal Hill in the first round.", band: "helpful", verification: "verified", sourceIds: ["career", "moving"] },
          { id: "ufc-alex-pereira-b-5", text: "Two months later, I took a short-notice rematch and finished it with a head kick seconds into the second round.", band: "helpful", verification: "verified", sourceIds: ["moving"] },
          { id: "ufc-alex-pereira-b-6", text: "I defended the light heavyweight title three times in a seven-month stretch.", band: "strong", verification: "verified", sourceIds: ["moving"] },
          { id: "ufc-alex-pereira-b-7", text: "Magomed Ankalaev took my light heavyweight belt before I won it back in their rematch.", band: "strong", verification: "verified", sourceIds: ["moving"] },
          { id: "ufc-alex-pereira-b-8", text: "In the rematch with Ankalaev, I regained the title with a stoppage in one minute and 20 seconds.", band: "strong", verification: "verified", sourceIds: ["moving"] },
          { id: "ufc-alex-pereira-b-9", text: "After winning UFC championships at middleweight and light heavyweight, I pursued a third divisional title against Ciryl Gane.", band: "giveaway", verification: "verified", sourceIds: ["moving"] },
          { id: "ufc-alex-pereira-b-10", text: "My UFC identity combines elite kickboxing power, two divisional titles, and the nickname “Poatan.”", band: "giveaway", verification: "verified", sourceIds: ["career", "nickname"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:conor-mcgregor",
    name: "Conor McGregor",
    earlyRotation: "normal",
    sources: {
      profile: "https://www.ufc.com/athlete/conor-mcgregor?page=1",
      double: "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250",
      aldo: "https://www.ufc.com/news/conor-mcgregor-kos-jose-aldo-13-seconds-win-title",
      ufc205: "https://www.ufc.com/news/ufc-205-final-results-and-news-nyc",
      walkouts: "https://www.ufc.com/news/elite-8-conor-mcgregors-greatest-ufc-walkouts-ufc-329",
      decade: "https://www.ufc.com/news/fighter-decade-resume-conor-mcgregor-champ-champ-ufc-fight-pass",
      making: "https://us.ufcespanol.com/news/flashback-making-mcgregor",
      about: "https://shop.conormcgregor.com/pages/about-conor",
      nickname: "https://www.mmafighting.com/ufc/495077/conor-mcgregor-explains-backstory-behind-notorious-nickname"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-conor-mcgregor-a-1", text: "I played football as a boy before boxing became the combat sport that first captured my attention.", band: "broad", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-a-2", text: "Before committing fully to fighting, I spent time working as a plumber’s apprentice in Dublin.", band: "broad", verification: "verified", sourceIds: ["about"] },
          { id: "ufc-conor-mcgregor-a-3", text: "My UFC debut in 2013 ended with a first-round stoppage of Marcus Brimage.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-a-4", text: "Three UFC fights into my run, I returned home to headline in Dublin and stopped Diego Brandao in the first round.", band: "helpful", verification: "verified", sourceIds: ["profile", "walkouts"] },
          { id: "ufc-conor-mcgregor-a-5", text: "I knocked out Dustin Poirier in the first round at UFC 178.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-a-6", text: "I won an interim featherweight championship by stopping Chad Mendes at UFC 189.", band: "strong", verification: "verified", sourceIds: ["profile", "double"] },
          { id: "ufc-conor-mcgregor-a-7", text: "I unified that division with a 13-second knockout that ended José Aldo’s decade-long unbeaten run.", band: "strong", verification: "verified", sourceIds: ["aldo", "double"] },
          { id: "ufc-conor-mcgregor-a-8", text: "In 2016, I split two welterweight fights with Nate Diaz, losing the first and winning the rematch.", band: "strong", verification: "verified", sourceIds: ["profile", "double"] },
          { id: "ufc-conor-mcgregor-a-9", text: "At UFC 205, I stopped Eddie Alvarez to become the first simultaneous two-division champion in UFC history.", band: "giveaway", verification: "verified", sourceIds: ["ufc205", "double"] },
          { id: "ufc-conor-mcgregor-a-10", text: "I am the Irish star whose championship run made “Champ-Champ” part of UFC vocabulary.", band: "giveaway", verification: "verified", sourceIds: ["double", "decade"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-conor-mcgregor-b-1", text: "My relationship with coach John Kavanagh became a major turning point when I was pushed to commit seriously to training.", band: "broad", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-conor-mcgregor-b-2", text: "Outside fighting, I later became associated with an Irish whiskey brand I helped launch.", band: "broad", verification: "verified", sourceIds: ["about"] },
          { id: "ufc-conor-mcgregor-b-3", text: "I crossed over into boxing for a 2017 bout with Floyd Mayweather.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-4", text: "I avenged my first UFC loss by winning a five-round majority decision in a rematch with Nate Diaz.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-5", text: "After a long MMA layoff, I returned in 2020 and stopped Donald Cerrone in 40 seconds.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-6", text: "I was stopped by Dustin Poirier in our 2021 rematch.", band: "strong", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-7", text: "Our trilogy fight ended after the first round because of a doctor stoppage following a leg injury.", band: "strong", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-8", text: "I challenged Khabib Nurmagomedov for the lightweight title at UFC 229 and was submitted in the fourth round.", band: "strong", verification: "verified", sourceIds: ["profile", "walkouts"] },
          { id: "ufc-conor-mcgregor-b-9", text: "I returned to the UFC again in 2026 for a bout with Max Holloway.", band: "giveaway", verification: "verified", sourceIds: ["profile", "walkouts"] },
          { id: "ufc-conor-mcgregor-b-10", text: "My “Notorious” nickname became part of a public persona tied to my Irish identity and crossover fame.", band: "giveaway", verification: "verified", sourceIds: ["nickname", "walkouts", "decade"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:demetrious-johnson",
    name: "Demetrious Johnson",
    earlyRotation: "normal",
    sources: {
      hof: "https://www.ufc.com/news/demetrious-johnson-named-ufc-hall-fame-class-2026",
      fights: "https://www.ufc.com/news/10-fantastic-flyweight-title-fights-ufc-296-alexandre-pantoja",
      cejudo: "https://www.ufc.com/news/history-making-cejudo-takes-belt-dj?language_content_entity=en",
      origin: "https://www.onefc.com/features/the-untold-origins-of-demetrious-mighty-mouse-johnson/",
      pregame: "https://www.ufc.com/news/demetrious-johnson-talks-kyoji-horiguchi-americas-pregame",
      hardwork: "https://www.ufc.com/news/demetrious-johnson-hard-work-pays",
      nickname: "https://www.seattlemet.com/news-and-city-life/2013/07/demetrious-johnson-isnt-as-little-as-he-looks-july-2013",
      gamer: "https://www.gameinformer.com/b/features/archive/2017/10/08/ufc-flyweight-champ-demetrious-johnson-talks-streaming-and.aspx"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-demetrious-johnson-a-1", text: "I first tried wrestling at 13 and was drawn to the sport’s individual accountability.", band: "broad", verification: "verified", sourceIds: ["origin"] },
          { id: "ufc-demetrious-johnson-a-2", text: "Before fighting full time, I worked an early shift at a Tacoma-area recycling warehouse.", band: "broad", verification: "verified", sourceIds: ["pregame"] },
          { id: "ufc-demetrious-johnson-a-3", text: "Coach Matt Hume became a long-term mentor after I linked up with AMC Pankration in 2005.", band: "helpful", verification: "verified", sourceIds: ["hardwork"] },
          { id: "ufc-demetrious-johnson-a-4", text: "I first fought for UFC gold at bantamweight and lost a five-round decision to Dominick Cruz.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-a-5", text: "After a draw and then a rematch win over Ian McCall, I advanced to the UFC flyweight tournament final.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-a-6", text: "I beat Joseph Benavidez at UFC 152 to become the inaugural UFC flyweight champion.", band: "strong", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-a-7", text: "My title reign eventually reached 11 consecutive successful defenses.", band: "strong", verification: "verified", sourceIds: ["hof", "cejudo"] },
          { id: "ufc-demetrious-johnson-a-8", text: "My eleventh defense ended with a mid-air transition into an armbar against Ray Borg.", band: "strong", verification: "verified", sourceIds: ["fights"] },
          { id: "ufc-demetrious-johnson-a-9", text: "That submission became widely known as the “Mighty Wiz-bar.”", band: "giveaway", verification: "verified", sourceIds: ["fights"] },
          { id: "ufc-demetrious-johnson-a-10", text: "My nickname “Mighty Mouse” came from being the smallest athlete in the gym while still willing to spar with anyone.", band: "giveaway", verification: "verified", sourceIds: ["nickname"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-demetrious-johnson-b-1", text: "Video games became a major hobby for me long before I later became a serious streamer.", band: "broad", verification: "verified", sourceIds: ["gamer"] },
          { id: "ufc-demetrious-johnson-b-2", text: "I won my first nine amateur MMA fights before making my professional debut in 2009.", band: "broad", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-3", text: "My first WEC appearance ended in a decision loss to Brad Pickett.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-4", text: "I later knocked out Joseph Benavidez in the first round of a championship rematch.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-5", text: "I stopped Olympic gold medalist Henry Cejudo in the first round during my title reign.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-6", text: "I submitted Kyoji Horiguchi in the final second of the fifth round of a title fight.", band: "strong", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-7", text: "My championship run lasted nearly six years atop the flyweight division.", band: "strong", verification: "verified", sourceIds: ["fights", "cejudo"] },
          { id: "ufc-demetrious-johnson-b-8", text: "A split-decision loss to Cejudo at UFC 227 ended that historic reign.", band: "strong", verification: "verified", sourceIds: ["hof", "cejudo"] },
          { id: "ufc-demetrious-johnson-b-9", text: "I was selected for the UFC Hall of Fame’s Modern Wing in the Class of 2026.", band: "giveaway", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-10", text: "I am the inaugural flyweight champion whose reign produced a UFC-record 11 straight title defenses.", band: "giveaway", verification: "verified", sourceIds: ["hof"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:anderson-silva",
    name: "Anderson Silva",
    earlyRotation: "normal",
    sources: {
      hof: "https://www.ufc.com/news/anderson-silva-named-ufc-hall-fame-class-2023-middleweight-brazil",
      greatness: "https://www.ufc.com/news/greatness-anderson-silva-ufc-hall-fame-class-2023",
      defenses: "https://www.ufc.com/news/looking-back-anderson-silvas-ten-title-defenses",
      origin: "https://www.ufc.com/news/comeback-anderson-silva-never-really-left",
      soundbytes: "https://www.ufc.com/news/say-it-again-anderson-silvas-greatest-soundbytes",
      spiderquotes: "https://www.ufc.com/news/spider-says-silvas-quotes"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-anderson-silva-a-1", text: "I was raised largely by an aunt and uncle after being separated from my parents at a young age.", band: "broad", verification: "verified", sourceIds: ["origin"] },
          { id: "ufc-anderson-silva-a-2", text: "As a child I wanted to play soccer, but organized training was difficult for my family to afford.", band: "broad", verification: "verified", sourceIds: ["origin"] },
          { id: "ufc-anderson-silva-a-3", text: "Watching Royce Gracie at UFC 1 helped turn competing in the UFC into a dream of mine.", band: "helpful", verification: "verified", sourceIds: ["spiderquotes"] },
          { id: "ufc-anderson-silva-a-4", text: "I opened my UFC run with a first-round knockout and reached a title fight almost immediately.", band: "helpful", verification: "verified", sourceIds: ["hof", "greatness"] },
          { id: "ufc-anderson-silva-a-5", text: "I won the middleweight championship in only my second UFC appearance.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-anderson-silva-a-6", text: "My reign eventually reached ten successful UFC middleweight title defenses.", band: "strong", verification: "verified", sourceIds: ["hof", "greatness", "defenses"] },
          { id: "ufc-anderson-silva-a-7", text: "I put together 16 consecutive UFC victories, with 14 of them ending by stoppage.", band: "strong", verification: "verified", sourceIds: ["greatness"] },
          { id: "ufc-anderson-silva-a-8", text: "I survived major trouble against Chael Sonnen and submitted him late in the fifth round of a title fight.", band: "strong", verification: "verified", sourceIds: ["defenses"] },
          { id: "ufc-anderson-silva-a-9", text: "I defended my title against Vitor Belfort with a front-kick knockout in the first round.", band: "giveaway", verification: "verified", sourceIds: ["defenses"] },
          { id: "ufc-anderson-silva-a-10", text: "Known as “The Spider,” I entered the UFC Hall of Fame as a Pioneer in 2023.", band: "giveaway", verification: "verified", sourceIds: ["hof"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-anderson-silva-b-1", text: "I became a dedicated Spider-Man comic collector and said I related to a superhero who still had ordinary bills to pay.", band: "broad", verification: "verified", sourceIds: ["soundbytes"] },
          { id: "ufc-anderson-silva-b-2", text: "Away from competition, I described myself as a practical joker who enjoyed making people laugh.", band: "broad", verification: "verified", sourceIds: ["soundbytes"] },
          { id: "ufc-anderson-silva-b-3", text: "My championship run lasted nearly seven years at the top of the middleweight division.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-anderson-silva-b-4", text: "During that era I also took several light heavyweight fights without giving up my middleweight crown.", band: "helpful", verification: "verified", sourceIds: ["greatness"] },
          { id: "ufc-anderson-silva-b-5", text: "My striking performances made opponents such as Forrest Griffin part of some of the sport’s most replayed highlights.", band: "helpful", verification: "verified", sourceIds: ["greatness"] },
          { id: "ufc-anderson-silva-b-6", text: "I stopped Sonnen in the second round of our rematch after submitting him in our first fight.", band: "strong", verification: "verified", sourceIds: ["defenses"] },
          { id: "ufc-anderson-silva-b-7", text: "Chris Weidman ended my championship reign with a second-round knockout.", band: "strong", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-anderson-silva-b-8", text: "My immediate rematch with Weidman ended when I suffered a severe leg injury.", band: "strong", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-anderson-silva-b-9", text: "Late in my UFC career, I shared the Octagon with Michael Bisping, Daniel Cormier and Israel Adesanya.", band: "giveaway", verification: "verified", sourceIds: ["greatness"] },
          { id: "ufc-anderson-silva-b-10", text: "My 16-fight UFC winning streak and ten middleweight title defenses became defining records of my era.", band: "giveaway", verification: "verified", sourceIds: ["hof", "greatness"] }
        ]
      }
    }
  }
];
