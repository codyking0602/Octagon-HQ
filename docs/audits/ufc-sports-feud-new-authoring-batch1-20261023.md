# UFC Sports Feud — fresh authoring batch 1 (not live)

October 23, 2026. Separate audit branch only; **no live selectors, Daily timing, scoring, source rows, result snapshots, or production files have been changed**. This supplements the 350-row editorial keep/rewrite/retire audit in this PR.

## What's genuinely new

**Six new Main Round concepts** with eight ranked answers, accepted extras and source references: UFC 1 participants, TUF coaches, TUF winners who became UFC champions, interim titleholders, UFC fighters who also performed professional wrestling, and undisputed UFC titles won by submission. Historically anchored, not a rephrased list of 'UFC legends.'

**20 authored Fast Money concepts**, intended as quick everyday UFC recall (weigh-in, event culture, training, gear, celebrations, media, rules-light fan experiences). Four currently have too much semantic overlap with other new concepts, so **16 Fast concepts advance to deeper accepted-answer testing**, **four remain on hold**. A hold is not a live candidate.

**Batch 1 net:** 6 Main + 16 promising Fast = **22 distinct concepts advancing** (pending independent fact and accepted-answer sign-off), with four exploratory Fast questions on hold. This is NOT 26 certified additions and NOT a live final inventory.

Existing second-pass bank: 20 keep-as-concept + 31 rewrite/move = up to 51 salvageable concepts if rewritten and verified. Combined ceiling from this first new batch is **73 potentially useful concepts**, not a guarantee. The target remains around **70 Main / 140 Fast** for a properly versioned 20-appearance repeat-free rotation. Filling the gap requires genuinely different topics, not stretching a question five ways.

## Fast Money usability screen

- Short, accessible wording; something an average UFC fan can answer within seconds.
- No named gym roster, exact historical title date, obscure transfer between promotions or subjective GOAT dispute under a 50-second clock.
- At least eight distinct canonical ranked examples plus broad valid, unranked extras. Off-board correct answers must count; editorial rankings are **not** represented as real survey data.
- Common shorthand and spelling variants must bind to one canonical answer: `Enswell` means the cold swelling tool, `TV` means television, `GSP` is Georges St-Pierre, `Bobby Knuckles` is Whittaker, `Phil Brooks` is CM Punk.
- Rank/alias collision fix: several authored extras were synonyms for an existing ranked answer; the duplicate extras were removed while keeping the synonymous form as an accepted alias. This prevents two independently scored slots for 'Vaseline' versus 'petroleum jelly', 'ice bag' versus 'ice pack', 'round clock' versus 'timer', or 'hoodie' versus 'sweatshirt'.

## Main Round — six authored proposals

| Stable draft ID | Prompt | Status | Off-board responses |
|---|---|---|---:|
| `ufc-v2-main-ufc-one-roster` | Name a fighter who competed on the original UFC 1 card in 1993. | advance to answer verification | 2 |
| `ufc-v2-main-tuf-head-coaches` | Name a UFC fighter who served as a team coach on The Ultimate Fighter. | advance to answer verification | 19 |
| `ufc-v2-main-tuf-winner-champs` | Name a fighter who won The Ultimate Fighter competition and later became an undisputed UFC champion. | advance to answer verification | 1 |
| `ufc-v2-main-interim-title-holders` | Name a fighter who has won a UFC interim championship. | advance to answer verification | 9 |
| `ufc-v2-main-pro-wrestlers` | Name a UFC fighter who has also appeared as a professional wrestler. | advance to answer verification | 3 |
| `ufc-v2-main-title-winning-submissions` | Name a fighter who won an undisputed UFC title by submitting their opponent in the title-winning fight. | advance to answer verification | 1 |

## Fast Money — sixteen advance, four hold

| Stable draft ID | Prompt | Status | Off-board responses |
|---|---|---|---:|
| `ufc-v2-fast-weighin-actions` | Name something a fighter might do at a UFC ceremonial weigh-in. | advance to answer verification | 12 |
| `ufc-v2-fast-practice-gear` | Name a piece of equipment MMA fighters use in training. | advance to answer verification | 12 |
| `ufc-v2-fast-watch-party` | Name something you might find at a UFC watch party. | advance to answer verification | 15 |
| `ufc-v2-fast-merchandise` | Name something a UFC fan might buy at a live event. | advance to answer verification | 12 |
| `ufc-v2-fast-fight-sounds` | Name something you might hear during a UFC fight. | advance to answer verification | 10 |
| `ufc-v2-fast-faceoff-gestures` | Name something fighters sometimes do during a UFC faceoff. | hold — semantic overlap | 13 |
| `ufc-v2-fast-press-room` | Name something you might see at a UFC press conference. | advance to answer verification | 15 |
| `ufc-v2-fast-corner-gear` | Name an item a UFC fighter's corner might use between rounds. | advance to answer verification | 8 |
| `ufc-v2-fast-training-sites` | Name a place UFC fighters might train. | advance to answer verification | 13 |
| `ufc-v2-fast-training-sessions` | Name a workout or training activity UFC fighters regularly practice. | advance to answer verification | 14 |
| `ufc-v2-fast-walkout-attire` | Name something a UFC fighter might wear or carry during their walkout. | advance to answer verification | 11 |
| `ufc-v2-fast-victory-actions` | Name something a UFC fighter might do right after winning. | advance to answer verification | 15 |
| `ufc-v2-fast-tv-graphics` | Name something you might see in UFC's on-screen fight graphics. | advance to answer verification | 13 |
| `ufc-v2-fast-event-workers` | Name a job someone might have working at a UFC event, other than fighting. | advance to answer verification | 15 |
| `ufc-v2-fast-locker-prep` | Name something a UFC fighter might do in the locker room before walking out. | advance to answer verification | 13 |
| `ufc-v2-fast-retired-careers` | Name a job a retired UFC fighter might do after leaving the cage. | hold — semantic overlap | 15 |
| `ufc-v2-fast-event-poster` | Name something you would expect to see on a UFC fight poster. | hold — semantic overlap | 12 |
| `ufc-v2-fast-recovery` | Name something an MMA fighter might do to recover after training. | advance to answer verification | 13 |
| `ufc-v2-fast-prefight-talk` | Name something commentators might mention before a UFC fight. | hold — semantic overlap | 15 |
| `ufc-v2-fast-follow-results` | Name a way UFC fans could follow a fight's result without watching it live. | advance to answer verification | 12 |

## Still required before any Daily use

1. **Verification beyond compilation:** run the exact tests/CI on the PR head, separately investigate any backend CI environmental failure. Existing 350-question generation must remain intact. No merge on a red head.
2. Examine every canonical and extra accepted answer, check official evidence for Main facts and evolving UFC rules; no arbitrary strikes for natural fan responses. Try first names, surnames, aliases, misspellings and abbreviation collisions against the actual matcher.
3. Build more distinct Fast prompts and Main concepts, plus salvage the 31 rewrites. Do not count these 26 drafts as 26 live questions.
4. Write a **new future-only content selector** after enough bank material is individually signed off. Must guarantee no exact prompt or semantic concept repeats for 20 consecutive official UFC Feud appearances, while keeping 2 Main/5 Fast, published historical packets and leaderboard results immutable.

## Full answer review matrix

### `ufc-v2-main-ufc-one-roster`

**Prompt:** Name a fighter who competed on the original UFC 1 card in 1993.

**Eight ranked editorial answers (not survey results):** 1. Royce Gracie; 2. Ken Shamrock; 3. Gerard Gordeau; 4. Art Jimmerson; 5. Teila Tuli; 6. Patrick Smith; 7. Kevin Rosier; 8. Zane Frazier

**Other authored answers (2):** Jason DeLucia; Trent Jenkins

**Decision:** advance to answer verification. Finite 1993 fight card; archived source lists 10 entrants including Jason DeLucia vs Trent Jenkins. Don't imply only eight entrants fought on the card.

**Primary/historical references:** https://www.ufc.com/event/ufc-1


### `ufc-v2-main-tuf-head-coaches`

**Prompt:** Name a UFC fighter who served as a team coach on The Ultimate Fighter.

**Eight ranked editorial answers (not survey results):** 1. Conor McGregor; 2. Jon Jones; 3. Daniel Cormier; 4. Michael Bisping; 5. Georges St-Pierre; 6. Chuck Liddell; 7. Randy Couture; 8. Tito Ortiz

**Other authored answers (19):** Chael Sonnen; Ken Shamrock; Quinton Jackson; Rashad Evans; BJ Penn; Dominick Cruz; Anthony Pettis; Frankie Edgar; Urijah Faber; Ronda Rousey; Miesha Tate; Joanna Jedrzejczyk; Claudia Gadelha; Junior dos Santos; Brock Lesnar; Matt Hughes; Rich Franklin; Vitor Belfort; Forrest Griffin

**Decision:** advance to answer verification. Verify named coaches and recognize any relevant TUF Brazil or international spin-offs, if included.

**Primary/historical references:** https://www.ufc.com/news/tuf-coaches-numbers ; https://www.ufc.com/news/ultimate-fighter-returns-coaches-daniel-cormier-and-michael-bisping


### `ufc-v2-main-tuf-winner-champs`

**Prompt:** Name a fighter who won The Ultimate Fighter competition and later became an undisputed UFC champion.

**Eight ranked editorial answers (not survey results):** 1. Forrest Griffin; 2. Rashad Evans; 3. Michael Bisping; 4. Matt Serra; 5. Kamaru Usman; 6. Robert Whittaker; 7. Carla Esparza; 8. Julianna Pena

**Other authored answers (1):** Nicco Montano

**Decision:** advance to answer verification. Check winner identity and undisputed UFC title record; women's flyweight inaugural Nicco Montaño also counts.

**Primary/historical references:** https://www.ufc.com/news/the-winners-of-the-ultimate-fighter-diaz-ferguson-esparza-pena-usman-tuf


### `ufc-v2-main-interim-title-holders`

**Prompt:** Name a fighter who has won a UFC interim championship.

**Eight ranked editorial answers (not survey results):** 1. Conor McGregor; 2. Tony Ferguson; 3. Dustin Poirier; 4. Justin Gaethje; 5. Israel Adesanya; 6. Robert Whittaker; 7. Tom Aspinall; 8. Colby Covington

**Other authored answers (9):** Yair Rodriguez; Brandon Moreno; Ciryl Gane; Jon Jones; Renan Barao; Shane Carwin; Carlos Condit; Frank Mir; Antonio Rodrigo Nogueira

**Decision:** advance to answer verification. Check interim vs undisputed vs BMF distinction; update with future interim champs only after sourcing.

**Primary/historical references:** https://www.ufc.com/athlete/justin-gaethje ; https://www.ufc.com/athlete/jon-jones


### `ufc-v2-main-pro-wrestlers`

**Prompt:** Name a UFC fighter who has also appeared as a professional wrestler.

**Eight ranked editorial answers (not survey results):** 1. Brock Lesnar; 2. Ronda Rousey; 3. CM Punk; 4. Ken Shamrock; 5. Dan Severn; 6. Cain Velasquez; 7. Shayna Baszler; 8. Matt Riddle

**Other authored answers (3):** Josh Barnett; Paige VanZant; Tito Ortiz

**Decision:** advance to answer verification. Use genuine staged professional-wrestling appearances, not athlete appearances in wrestling-media programming.

**Primary/historical references:** https://www.wwe.com/superstars/brock-lesnar ; https://www.wwe.com/superstars/ronda-rousey


### `ufc-v2-main-title-winning-submissions`

**Prompt:** Name a fighter who won an undisputed UFC title by submitting their opponent in the title-winning fight.

**Eight ranked editorial answers (not survey results):** 1. Jon Jones; 2. Islam Makhachev; 3. Georges St-Pierre; 4. Miesha Tate; 5. Julianna Pena; 6. Anthony Pettis; 7. Frank Mir; 8. Brandon Moreno

**Other authored answers (1):** Carla Esparza

**Decision:** advance to answer verification. Only a SUB victory awarding undisputed gold counts. Do not count later title defenses or wins with no title awarded.

**Primary/historical references:** https://www.ufc.com/athlete/jon-jones ; https://www.ufc.com/news/tate-wins-title-after-late-submission-holm


### `ufc-v2-fast-weighin-actions`

**Prompt:** Name something a fighter might do at a UFC ceremonial weigh-in.

**Eight ranked editorial answers (not survey results):** 1. Step on the scale; 2. Face off with opponent; 3. Pose for photos; 4. Raise fists; 5. Flex for the crowd; 6. Wave to fans; 7. Shake hands; 8. Talk trash

**Other authored answers (12):** Stare down opponent; Smile; Point at opponent; Wear a flag; Show off a belt; Bow; Clap; Give a thumbs-up; Turn around for cameras; Speak into microphone; Take off shoes; Raise arms

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-practice-gear`

**Prompt:** Name a piece of equipment MMA fighters use in training.

**Eight ranked editorial answers (not survey results):** 1. Heavy bag; 2. Boxing gloves; 3. Focus mitts; 4. Jump rope; 5. Wrestling mat; 6. Shin guards; 7. Headgear; 8. Punching pads

**Other authored answers (12):** Grappling dummy; Speed bag; Medicine ball; Kettlebell; Resistance bands; Treadmill; Stationary bike; Hand wraps; Mouthguard; Timer; Weightlifting bar; Foam roller

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-watch-party`

**Prompt:** Name something you might find at a UFC watch party.

**Eight ranked editorial answers (not survey results):** 1. Television; 2. Pizza; 3. Friends; 4. Drinks; 5. Wings; 6. Couch; 7. Snacks; 8. UFC fans

**Other authored answers (15):** Big screen; Nachos; Popcorn; Chips; Beer; Soda; Team shirts; Streaming subscription; Remote control; Speakers; Chairs; Fighter posters; Cell phones; Family; Fight predictions

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-merchandise`

**Prompt:** Name something a UFC fan might buy at a live event.

**Eight ranked editorial answers (not survey results):** 1. Fighter T-shirt; 2. Hat; 3. Food; 4. Drink; 5. Event poster; 6. Hoodie; 7. Replica gloves; 8. Souvenir

**Other authored answers (12):** Program; Autographed photo; Keychain; Lanyard; Wristband; Jacket; Replica belt; Water bottle; Sticker; Collectible; Trading card; Snacks

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-fight-sounds`

**Prompt:** Name something you might hear during a UFC fight.

**Eight ranked editorial answers (not survey results):** 1. Crowd cheering; 2. Commentators talking; 3. Referee instructions; 4. Corner shouting; 5. Round horn; 6. Crowd booing; 7. Fans chanting; 8. Punches landing

**Other authored answers (10):** Fighter grunting; Applause; Announcer; Coaches yelling; Warning from referee; Music; Gasp from crowd; Crowd screaming; Bell; Stadium noise

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-faceoff-gestures`

**Prompt:** Name something fighters sometimes do during a UFC faceoff.

**Eight ranked editorial answers (not survey results):** 1. Stare at each other; 2. Stand nose to nose; 3. Raise fists; 4. Talk trash; 5. Smile; 6. Shake hands; 7. Point at opponent; 8. Pose for cameras

**Other authored answers (13):** Flex; Push; Look away; Laugh; Wave to fans; Clap; Make a gesture; Nod; Wear sunglasses; Hold championship belt; Bow; Clench fists; Turn sideways

**Decision:** hold — semantic overlap. Faceoff actions are heavily nested inside ceremonial weigh-in actions; cannot count both as distinct until the overlap is substantially reduced.


### `ufc-v2-fast-press-room`

**Prompt:** Name something you might see at a UFC press conference.

**Eight ranked editorial answers (not survey results):** 1. Microphones; 2. Fighters; 3. Reporters; 4. Cameras; 5. UFC logo backdrop; 6. Journalists asking questions; 7. Table; 8. Championship belt

**Other authored answers (15):** Chairs; Water bottles; Photographers; Security; Sponsor logos; Dana White; Interviewer; Lights; Notebooks; Nameplates; Media badges; Translators; Headphones; Television crew; Phones

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-corner-gear`

**Prompt:** Name an item a UFC fighter's corner might use between rounds.

**Eight ranked editorial answers (not survey results):** 1. Water bottle; 2. Towel; 3. Ice bag; 4. Stool; 5. Vaseline; 6. Gauze; 7. Cotton swab; 8. Cold metal swelling tool

**Other authored answers (8):** Bucket; Medical tape; Scissors; Gloves; Sponge; Cutman supplies; Paper towels; Cup

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-training-sites`

**Prompt:** Name a place UFC fighters might train.

**Eight ranked editorial answers (not survey results):** 1. MMA gym; 2. Boxing gym; 3. Wrestling room; 4. Weight room; 5. Training cage; 6. Jiu-jitsu academy; 7. Running track; 8. Swimming pool

**Other authored answers (13):** Kickboxing gym; Martial arts studio; Park; Beach; Road; Hill; Fitness center; Home gym; Outdoor field; Training camp; Sports performance center; School gym; Dojo

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-training-sessions`

**Prompt:** Name a workout or training activity UFC fighters regularly practice.

**Eight ranked editorial answers (not survey results):** 1. Sparring; 2. Running; 3. Lifting weights; 4. Wrestling drills; 5. Pad work; 6. Jiu-jitsu practice; 7. Jump rope; 8. Bag work

**Other authored answers (14):** Swimming; Cycling; Shadowboxing; Stretching; Kickboxing; Boxing drills; Muay Thai; Conditioning; Sprint intervals; Hill sprints; Yoga; Technical drilling; Cardio; Footwork drills

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-walkout-attire`

**Prompt:** Name something a UFC fighter might wear or carry during their walkout.

**Eight ranked editorial answers (not survey results):** 1. Fighter shorts; 2. Walkout shirt; 3. Hoodie; 4. Country flag; 5. Hat; 6. Sneakers; 7. Headphones; 8. Sunglasses

**Other authored answers (11):** Jacket; Track pants; Team uniform; Warmup top; Mouthguard; Gloves; Cape; Championship belt; Chain; Robe; Flag draped over shoulders

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-victory-actions`

**Prompt:** Name something a UFC fighter might do right after winning.

**Eight ranked editorial answers (not survey results):** 1. Raise both arms; 2. Hug teammates; 3. Celebrate in the cage; 4. Shake opponent's hand; 5. Cry with joy; 6. Talk to interviewer; 7. Wave to crowd; 8. Point to the fans

**Other authored answers (15):** Call out next opponent; Put on championship belt; Thank coaches; Pray; Kneel; Bow; Fist pump; Dance; Jump up; Climb cage; Smile; Celebrate with family; Do a backflip; Take a photo; Run around

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-tv-graphics`

**Prompt:** Name something you might see in UFC's on-screen fight graphics.

**Eight ranked editorial answers (not survey results):** 1. Round clock; 2. Fighter names; 3. Fighter records; 4. Weight class; 5. Country flags; 6. Round number; 7. Significant strikes; 8. Betting odds

**Other authored answers (13):** Height; Reach; Age; Rankings; Event name; UFC logo; Takedowns; Control time; Fight date; Fighter pictures; Fight statistics; Sponsored graphic; PPV logo

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-event-workers`

**Prompt:** Name a job someone might have working at a UFC event, other than fighting.

**Eight ranked editorial answers (not survey results):** 1. Referee; 2. Judge; 3. Ring announcer; 4. Commentator; 5. Coach; 6. Cutman; 7. Camera operator; 8. Security guard

**Other authored answers (15):** Doctor; Medic; Production crew; Timekeeper; Translator; Photographer; Interviewer; Official; UFC staff; Promoter; Ticket taker; Lighting crew; Event coordinator; Scorekeeper; Reporter

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-locker-prep`

**Prompt:** Name something a UFC fighter might do in the locker room before walking out.

**Eight ranked editorial answers (not survey results):** 1. Warm up; 2. Stretch; 3. Shadowbox; 4. Hit pads; 5. Talk to coaches; 6. Listen to music; 7. Pray; 8. Drink water

**Other authored answers (13):** Wrap hands; Check equipment; Put on gloves; Visualize fight; Breathe deeply; Walk around; Get a massage; Get taped up; Review game plan; Eat a snack; Use bathroom; Meditate; Focus

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-retired-careers`

**Prompt:** Name a job a retired UFC fighter might do after leaving the cage.

**Eight ranked editorial answers (not survey results):** 1. MMA coach; 2. TV analyst; 3. Gym owner; 4. Podcast host; 5. Commentator; 6. Referee; 7. Promoter; 8. Sports broadcaster

**Other authored answers (15):** Trainer; YouTuber; Business owner; Actor; Author; Manager; Journalist; Athlete manager; Judge; Public speaker; Brand ambassador; Instructor; Scout; Fighter mentor; Entrepreneur

**Decision:** hold — semantic overlap. Shares commentator/referee/coach jobs with the event-personnel question; revise into a different recognition lane or retire.


### `ufc-v2-fast-event-poster`

**Prompt:** Name something you would expect to see on a UFC fight poster.

**Eight ranked editorial answers (not survey results):** 1. Fighter photographs; 2. UFC logo; 3. Main event names; 4. Event date; 5. Arena or city; 6. Event number; 7. Fight card title; 8. Sponsor logo

**Other authored answers (12):** Start time; Ticket information; Country flag; Promotional tagline; Fight Night name; Broadcast partner; PPV information; Website; Championship belt; Weight class; Social-media handle; Event branding

**Decision:** hold — semantic overlap. Fighter names, logos, event details overlap broadcast graphics; test distinctness before count.


### `ufc-v2-fast-recovery`

**Prompt:** Name something an MMA fighter might do to recover after training.

**Eight ranked editorial answers (not survey results):** 1. Sleep; 2. Stretch; 3. Drink water; 4. Eat a meal; 5. Take an ice bath; 6. Get a massage; 7. Rest; 8. Use a foam roller

**Other authored answers (13):** See physiotherapist; Cool down; Sauna; Shower; Have protein shake; Meditate; Walk; Compression boots; Elevate legs; Use heat pack; Take a nap; Physical therapy; Take a day off

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


### `ufc-v2-fast-prefight-talk`

**Prompt:** Name something commentators might mention before a UFC fight.

**Eight ranked editorial answers (not survey results):** 1. Fighter record; 2. Fighter rankings; 3. Reach; 4. Height; 5. Recent wins; 6. Fighting style; 7. Betting odds; 8. Training camp

**Other authored answers (15):** Age; Hometown; Previous opponent; Knockout power; Wrestling; Finishing rate; Weight class; Previous injuries; Title defenses; Submission wins; Last fight; Weight; Experience; Southpaw stance; Win streak

**Decision:** hold — semantic overlap. Record, reach, odds and rankings largely duplicate the on-screen graphics question; likely retire or replace.


### `ufc-v2-fast-follow-results`

**Prompt:** Name a way UFC fans could follow a fight's result without watching it live.

**Eight ranked editorial answers (not survey results):** 1. Check UFC website; 2. Check sports app; 3. Read news article; 4. Look at social media; 5. Get a text from a friend; 6. Watch highlights later; 7. Listen to a podcast; 8. Search for scores

**Other authored answers (12):** Read ESPN; Check MMA news site; Look at UFC app; Check X; Watch YouTube replay; Talk with friends; Read fight recap; Follow live blog; Get push notification; Read newspaper; Listen to sports news; Search Google

**Decision:** advance to answer verification. New category compared with existing UFC Feud source families; full subjective off-board acceptance still needs live-match and editorial proof


