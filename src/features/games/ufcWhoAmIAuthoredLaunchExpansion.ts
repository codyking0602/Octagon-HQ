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
          { id: "ufc-israel-adesanya-b-2", text: "I carried that dance background into my public fight persona before I became a UFC champion.", band: "broad", verification: "verified", sourceIds: ["walkout", "profile"] },
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
          { id: "ufc-alex-pereira-a-3", text: "I built a championship-level kickboxing career before making the UFC my primary stage.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-a-4", text: "I competed at more than one weight class in elite kickboxing before focusing on my UFC run.", band: "helpful", verification: "verified", sourceIds: ["career", "profile"] },
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
          { id: "ufc-alex-pereira-b-1", text: "I built a high-level career in another combat sport before my UFC rise.", band: "broad", verification: "verified", sourceIds: ["profile", "career"] },
          { id: "ufc-alex-pereira-b-2", text: "I entered the UFC with far more high-level striking experience than MMA experience.", band: "broad", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-alex-pereira-b-3", text: "My first UFC light heavyweight bout was a split-decision win over a former champion.", band: "helpful", verification: "verified", sourceIds: ["career", "moving"] },
          { id: "ufc-alex-pereira-b-4", text: "My first UFC light heavyweight title opportunity came only months after I moved up a division.", band: "helpful", verification: "verified", sourceIds: ["career", "moving"] },
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
          { id: "ufc-conor-mcgregor-a-2", text: "Before committing fully to fighting, I spent time working in a trade apprenticeship.", band: "broad", verification: "verified", sourceIds: ["about"] },
          { id: "ufc-conor-mcgregor-a-3", text: "My UFC debut in 2013 ended with a first-round stoppage.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-a-4", text: "Three UFC fights into my run, I was already headlining a card in my home country.", band: "helpful", verification: "verified", sourceIds: ["profile", "walkouts"] },
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
          { id: "ufc-conor-mcgregor-b-1", text: "A long-term coaching relationship became a major turning point when I was pushed to commit seriously to training.", band: "broad", verification: "verified", sourceIds: ["making"] },
          { id: "ufc-conor-mcgregor-b-2", text: "Outside fighting, I later built major business ventures around my public persona.", band: "broad", verification: "verified", sourceIds: ["about"] },
          { id: "ufc-conor-mcgregor-b-3", text: "My fame eventually carried me into a major crossover bout outside mixed martial arts.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
          { id: "ufc-conor-mcgregor-b-4", text: "One of my early UFC setbacks led to an immediate rematch that went the full five rounds.", band: "helpful", verification: "verified", sourceIds: ["profile"] },
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
          { id: "ufc-demetrious-johnson-a-2", text: "Before fighting full time, I worked early shifts at a recycling warehouse.", band: "broad", verification: "verified", sourceIds: ["pregame"] },
          { id: "ufc-demetrious-johnson-a-3", text: "I formed a long-term relationship with the same coach early in my professional development.", band: "helpful", verification: "verified", sourceIds: ["hardwork"] },
          { id: "ufc-demetrious-johnson-a-4", text: "My first UFC title opportunity came in a division above the one where I later became champion.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
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
          { id: "ufc-demetrious-johnson-b-3", text: "My first WEC appearance ended in a decision loss.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
          { id: "ufc-demetrious-johnson-b-4", text: "One of my championship rematches ended with a first-round knockout.", band: "helpful", verification: "verified", sourceIds: ["hof"] },
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
          { id: "ufc-anderson-silva-a-3", text: "Watching the earliest UFC events helped turn competing in the promotion into a dream of mine.", band: "helpful", verification: "verified", sourceIds: ["spiderquotes"] },
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
          { id: "ufc-anderson-silva-b-3", text: "I won each of my first three UFC appearances by stoppage.", band: "helpful", verification: "verified", sourceIds: ["hof", "profile"] },
          { id: "ufc-anderson-silva-b-4", text: "During my title years, I also accepted non-title fights in another division.", band: "helpful", verification: "verified", sourceIds: ["greatness"] },
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
,
  {
    subjectId: "ufc:randy-couture",
    name: "Randy Couture",
    earlyRotation: "normal",
    sources: {
      service: "https://www.war.gov/News/Feature-Stories/Story/Article/3619215/sports-heroes-who-served-champion-wrestler-actor-was-also-a-soldier/",
      nickname: "https://sports.yahoo.com/randy-couture-explains-origin-natural-135052584.html",
      feats: "https://www.ufc.com/news/greatest-feats-ufc-history",
      twodiv: "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250",
      brock: "https://www.ufc.com/news/flashback-brock-lesnar-shocks-randy-couture-ufc-91",
      champs: "https://www.ufc.com/news/15-ufc-heavyweight-champions"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-randy-couture-a-1", text: "Before MMA, I served in the U.S. Army.", band: "broad", verification: "verified", sourceIds: ["service"] },
          { id: "ufc-randy-couture-a-2", text: "I came to MMA from a high-level Greco-Roman wrestling background.", band: "broad", verification: "verified", sourceIds: ["service"] },
          { id: "ufc-randy-couture-a-3", text: "I entered the UFC unusually late for a future champion, after an extensive wrestling career.", band: "helpful", verification: "verified", sourceIds: ["service", "feats"] },
          { id: "ufc-randy-couture-a-4", text: "My first UFC championship came at heavyweight.", band: "helpful", verification: "verified", sourceIds: ["twodiv", "champs"] },
          { id: "ufc-randy-couture-a-5", text: "After losing consecutive heavyweight title fights, I dropped to light heavyweight just before turning 40.", band: "helpful", verification: "verified", sourceIds: ["feats"] },
          { id: "ufc-randy-couture-a-6", text: "I stopped Chuck Liddell to win an interim light heavyweight championship in 2003.", band: "strong", verification: "verified", sourceIds: ["feats", "twodiv"] },
          { id: "ufc-randy-couture-a-7", text: "I unified that title by defeating Tito Ortiz later the same year.", band: "strong", verification: "verified", sourceIds: ["feats", "twodiv"] },
          { id: "ufc-randy-couture-a-8", text: "I became the first fighter in UFC history to win championships in two weight classes.", band: "strong", verification: "verified", sourceIds: ["twodiv"] },
          { id: "ufc-randy-couture-a-9", text: "At age 43, I returned to heavyweight and defeated Tim Sylvia to capture the championship again.", band: "giveaway", verification: "verified", sourceIds: ["twodiv"] },
          { id: "ufc-randy-couture-a-10", text: "My nickname “The Natural” reflected how quickly I adapted to mixed martial arts.", band: "giveaway", verification: "verified", sourceIds: ["nickname"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-randy-couture-b-1", text: "My collegiate wrestling career included competing for Oklahoma State.", band: "broad", verification: "verified", sourceIds: ["service"] },
          { id: "ufc-randy-couture-b-2", text: "Outside competition, I created a foundation supporting wounded U.S. service members and their families.", band: "broad", verification: "verified", sourceIds: ["service"] },
          { id: "ufc-randy-couture-b-3", text: "One of my heavyweight championship reigns began with a stoppage victory at UFC 28.", band: "helpful", verification: "verified", sourceIds: ["champs"] },
          { id: "ufc-randy-couture-b-4", text: "I then defended that heavyweight belt twice against the same challenger.", band: "helpful", verification: "verified", sourceIds: ["champs"] },
          { id: "ufc-randy-couture-b-5", text: "My career included a championship trilogy with Chuck Liddell.", band: "helpful", verification: "verified", sourceIds: ["feats", "twodiv"] },
          { id: "ufc-randy-couture-b-6", text: "Across heavyweight and light heavyweight, I accumulated five undisputed UFC championship reigns.", band: "strong", verification: "verified", sourceIds: ["twodiv"] },
          { id: "ufc-randy-couture-b-7", text: "I successfully defended the heavyweight title against Gabriel Gonzaga after my late-career return.", band: "strong", verification: "verified", sourceIds: ["brock"] },
          { id: "ufc-randy-couture-b-8", text: "Brock Lesnar ended that heavyweight reign with a second-round stoppage at UFC 91.", band: "strong", verification: "verified", sourceIds: ["brock"] },
          { id: "ufc-randy-couture-b-9", text: "I was inducted into the UFC Hall of Fame in 2006.", band: "giveaway", verification: "verified", sourceIds: ["twodiv"] },
          { id: "ufc-randy-couture-b-10", text: "I am the former Army wrestler who became UFC champion at both heavyweight and light heavyweight.", band: "giveaway", verification: "verified", sourceIds: ["service", "twodiv"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:chuck-liddell",
    name: "Chuck Liddell",
    earlyRotation: "normal",
    sources: {
      roots: "https://www.ufc.com/news/road-ufc-200-fighting-liddells-dna",
      tribute: "https://www.ufc.com/news/chuck-liddell-tribute-fighter",
      boardroom: "https://www.ufc.com/news/chuck-liddell-retires-boardroom",
      roster: "https://www.ufc.com/news/ultimate-30-all-time-roster",
      hof: "https://www.ufc.com/news/liddell-and-mask-are-two-newest-inductees-ufc-hall-fame"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-chuck-liddell-a-1", text: "I began karate around age 12 and once imagined owning a karate gym.", band: "broad", verification: "verified", sourceIds: ["roots"] },
          { id: "ufc-chuck-liddell-a-2", text: "I earned an accounting degree after my grandmother encouraged me to have a practical fallback plan.", band: "broad", verification: "verified", sourceIds: ["roots"] },
          { id: "ufc-chuck-liddell-a-3", text: "I blended a long karate background with wrestling before developing my UFC striking style.", band: "helpful", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-a-4", text: "I became one of the defining stars of the UFC’s early Zuffa era.", band: "helpful", verification: "verified", sourceIds: ["roster", "hof"] },
          { id: "ufc-chuck-liddell-a-5", text: "My first UFC title opportunity came after a long climb through the light heavyweight division.", band: "helpful", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-a-6", text: "I won the light heavyweight championship by knocking out Randy Couture in our rematch.", band: "strong", verification: "verified", sourceIds: ["tribute", "roster"] },
          { id: "ufc-chuck-liddell-a-7", text: "I successfully defended that championship four times.", band: "strong", verification: "verified", sourceIds: ["roster"] },
          { id: "ufc-chuck-liddell-a-8", text: "Two of my most famous victories were knockouts of Tito Ortiz during my championship-era run.", band: "strong", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-a-9", text: "I was inducted into the UFC Hall of Fame’s Pioneer Wing in 2009.", band: "giveaway", verification: "verified", sourceIds: ["hof", "roster"] },
          { id: "ufc-chuck-liddell-a-10", text: "Known as “The Iceman,” I became one of the UFC’s first major crossover superstars.", band: "giveaway", verification: "verified", sourceIds: ["roster", "hof"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-chuck-liddell-b-1", text: "While in college, I worked behind a bar before fighting became my profession.", band: "broad", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-b-2", text: "After my first retirement, I moved into a UFC executive role involving fighter relations and business work.", band: "broad", verification: "verified", sourceIds: ["boardroom"] },
          { id: "ufc-chuck-liddell-b-3", text: "My fighting identity blended a wrestling base with an aggressive striking style.", band: "helpful", verification: "verified", sourceIds: ["roots", "tribute"] },
          { id: "ufc-chuck-liddell-b-4", text: "An early title-fight loss later became the start of a championship rivalry I eventually turned around.", band: "helpful", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-b-5", text: "I knocked out Vernon White and Jeremy Horn during the stretch that established my championship reign.", band: "helpful", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-b-6", text: "My title run ended when Quinton Jackson stopped me in the first round.", band: "strong", verification: "verified", sourceIds: ["tribute"] },
          { id: "ufc-chuck-liddell-b-7", text: "A three-round fight with Wanderlei Silva was recognized as Fight of the Year.", band: "strong", verification: "verified", sourceIds: ["roster"] },
          { id: "ufc-chuck-liddell-b-8", text: "I became especially known for knockout power at light heavyweight.", band: "strong", verification: "verified", sourceIds: ["roster", "hof"] },
          { id: "ufc-chuck-liddell-b-9", text: "My UFC résumé is closely linked to rivalries with Couture, Ortiz and Jackson.", band: "giveaway", verification: "verified", sourceIds: ["tribute", "roster"] },
          { id: "ufc-chuck-liddell-b-10", text: "My mohawk, head tattoo and “Iceman” nickname became instantly recognizable parts of UFC culture.", band: "giveaway", verification: "verified", sourceIds: ["tribute", "hof"] }
        ]
      }
    }
  },
  {
    subjectId: "ufc:jose-aldo",
    name: "Jose Aldo",
    earlyRotation: "normal",
    sources: {
      roots: "https://www.ufc.com/news/brazil-aldo-king-honed-humble-roots",
      evolution: "https://www.ufc.com/news/legendary-moura-discusses-aldos-evolution",
      origin: "https://www.ufc.com/news/jose-aldo-el-maradona-de-las-amm",
      career: "https://www.ufc.com/news/jose-aldo-career-ufc-career-highlights",
      hof: "https://www.ufc.com/news/jose-aldo-king-rio-earns-enshrinement-ufc-hall-fame"
    },
    scripts: {
      A: {
        id: "A",
        clues: [
          { id: "ufc-jose-aldo-a-1", text: "I grew up with limited resources before combat sports became my professional path.", band: "broad", verification: "verified", sourceIds: ["roots"] },
          { id: "ufc-jose-aldo-a-2", text: "Before fighting became my career, I tried to pursue professional soccer.", band: "broad", verification: "verified", sourceIds: ["evolution"] },
          { id: "ufc-jose-aldo-a-3", text: "I left home as a young fighter with very little money or support to train in a larger fight scene.", band: "helpful", verification: "verified", sourceIds: ["roots"] },
          { id: "ufc-jose-aldo-a-4", text: "My martial-arts path included capoeira before Brazilian jiu-jitsu became another foundation.", band: "helpful", verification: "verified", sourceIds: ["origin"] },
          { id: "ufc-jose-aldo-a-5", text: "I went 8-0 in the WEC with seven finishes.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-a-6", text: "An eight-second flying-knee knockout of Cub Swanson became one of my signature WEC performances.", band: "strong", verification: "verified", sourceIds: ["hof", "career"] },
          { id: "ufc-jose-aldo-a-7", text: "I stopped Mike Brown to win the WEC featherweight championship in 2009.", band: "strong", verification: "verified", sourceIds: ["career", "hof"] },
          { id: "ufc-jose-aldo-a-8", text: "When the WEC merged into the UFC, I was awarded the inaugural UFC featherweight championship.", band: "strong", verification: "verified", sourceIds: ["career", "hof"] },
          { id: "ufc-jose-aldo-a-9", text: "My first UFC featherweight reign included seven successful title defenses.", band: "giveaway", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-a-10", text: "Known as the “King of Rio,” I entered the UFC Hall of Fame’s Modern Wing in 2023.", band: "giveaway", verification: "verified", sourceIds: ["hof"] }
        ]
      },
      B: {
        id: "B",
        clues: [
          { id: "ufc-jose-aldo-b-1", text: "Early in my career, I sometimes slept on academy mats and relied on teammates for meals and clothing.", band: "broad", verification: "verified", sourceIds: ["evolution"] },
          { id: "ufc-jose-aldo-b-2", text: "Explosive kicks and fast striking became hallmarks of my fighting style.", band: "broad", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-3", text: "I defended a major featherweight championship before ever competing in the UFC.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-4", text: "I entered the UFC already carrying championship status from another promotion.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-5", text: "I knocked out Chad Mendes at 4:59 of the first round in a title fight in Rio.", band: "helpful", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-6", text: "I later beat Mendes again, this time by five-round decision in another championship fight.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-7", text: "An 18-fight winning streak ended when Conor McGregor knocked me out in 13 seconds.", band: "strong", verification: "verified", sourceIds: ["career", "hof"] },
          { id: "ufc-jose-aldo-b-8", text: "I regained UFC featherweight gold by beating Frankie Edgar for an interim title that was later elevated.", band: "strong", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-9", text: "I later moved to bantamweight and challenged Petr Yan for a vacant UFC championship.", band: "giveaway", verification: "verified", sourceIds: ["career"] },
          { id: "ufc-jose-aldo-b-10", text: "My championship history spans WEC dominance, the inaugural UFC featherweight crown and a later bantamweight run.", band: "giveaway", verification: "verified", sourceIds: ["career", "hof"] }
        ]
      }
    }
  }

];
