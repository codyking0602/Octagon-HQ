# Who Am I Rebuild PR10 — UFC person identity audit

## Scope and canonical ownership

- Scope: UFC person identity knowledge only.
- Canonical runtime population owner: `src/features/back-room/ufcFactualLedger.ts`, consumed by `getUfcWhoAmIUniverse()` in `src/features/games/whoAmIAuthority.ts`.
- Canonical PR10 person-identity knowledge owner: `src/features/back-room/ufcPersonIdentityKnowledge.ts`.
- Data-only research modules: `src/features/back-room/ufcPersonIdentityResearch1.ts`, `ufcPersonIdentityResearch2.ts`, and `ufcPersonIdentityResearch3.ts`.
- Focused validation owner: `src/features/back-room/ufcPersonIdentityKnowledge.test.ts`.
- Authoritative research inputs: the attached `Ufc1.json`, `Ufc2.json`, and `Ufc3.json` packages supplied for integration on 2026-09-10.
- Launch membership, recognizability, rankings/OVRs/ranking inputs, gameplay, clue generation/wording/ordering/scoring, routes, Supabase/Cloudflare ownership, NFL/CFB knowledge, and Octagon Verdict outputs are explicitly out of scope.

## Repository-state audit

- Exact base `main` SHA: `aa509688091f0c2afebe23a4502d2d96d7343cf8`.
- An existing branch `games/who-am-i-pr10-ufc-person-identity` was inspected read-only. It was based on current main but contained only one partial staging file with the first 10 research identities and no canonical owner, tests, or audit. It was not reused or merged.
- Final integration work was therefore created from current exact main on `games/who-am-i-pr10-ufc-person-identity-final`.
- Pre-audit integration head: `3d21c003ccf05d1ce517e94a882d13fa2849c5e4`.
- Final PR head SHA is reported by the PR/check metadata and release report after the audit commit. A tracked file cannot literally contain the SHA of the commit that contains that same file without changing that SHA.

## Deterministic ingestion audit

- `Ufc1.json`: **34 identities / 170 concepts / 105 unique package URLs**.
- `Ufc2.json`: **33 identities / 165 concepts / 83 unique package URLs**.
- `Ufc3.json`: **33 identities / 165 concepts / 92 unique package URLs**.
- Researched identities: **100**.
- Retained runtime identities: **100**.
- Concepts per fighter: **exactly 5**.
- Total retained concepts: **500**.
- Unique canonical concept IDs: **500**.
- Unique retained fact IDs: **500**.
- Duplicate normalized retained wording: **0**.
- Unique retained provenance URLs after cross-package URL deduplication: **279**.
- Every retained concept has one nonempty publisher, source title, direct HTTP(S) source URL, and one canonical provenance source ID.
- Every researched identity maps one-to-one to the exact current canonical UFC Who Am I population.

## Population and ID reconciliation

- Current canonical UFC Who Am I population on base main: **100 subjects** = **81 ranked-core** subjects plus **19 recognizable-expansion** subjects.
- Attached research population: **100 subjects**.
- Missing canonical launch identities in research: **0**.
- Stale researched identities outside current launch membership: **0**.
- Alias/slug mappings required: **none**. All supplied `ufc:*` IDs already match current canonical IDs.
- Targeted replacement research required: **none**.
- No launch-membership or recognizability edits were made.

## Concept/provenance reconciliation

- The supplied `conceptId` token `physical-education-degree` appears for both Aljamain Sterling and Lyoto Machida. The authoritative research token is preserved as `researchConceptId`; canonical runtime `conceptId` is person-namespaced as `<subjectId>--<researchConceptId>` so all 500 canonical concept IDs are unique without rewriting either researched concept.
- The direct URL `https://www.ufc.com/news/brothers-armbars-raw-story` appears in both `Ufc2.json` and `Ufc3.json`. Canonical provenance is deduplicated by direct URL, producing 279 unique retained provenance URLs from 280 package-local unique-source rows.
- Research notes supplied with softened or disputed details were respected during ingestion. No retained fact wording was broadened or independently rewritten.

## Full canonical identity mapping

- Alex Pereira → `ufc:alex-pereira`
- Alexa Grasso → `ufc:alexa-grasso`
- Alexander Volkanovski → `ufc:alexander-volkanovski`
- Alexandre Pantoja → `ufc:alex-pantoja`
- Aljamain Sterling → `ufc:aljamain-sterling`
- Amanda Nunes → `ufc:amanda-nunes`
- Anderson Silva → `ufc:anderson-silva`
- Anthony Pettis → `ufc:anthony-pettis`
- B.J. Penn → `ufc:bj-penn`
- Benson Henderson → `ufc:benson-henderson`
- Brandon Moreno → `ufc:brandon-moreno`
- Brian Ortega → `ufc:brian-ortega`
- Brock Lesnar → `ufc:brock-lesnar`
- Cain Velasquez → `ufc:cain-velasquez`
- Carla Esparza → `ufc:carla-esparza`
- Chael Sonnen → `ufc:chael-sonnen`
- Charles Oliveira → `ufc:charles-oliveira`
- Chris Weidman → `ufc:chris-weidman`
- Chuck Liddell → `ufc:chuck-liddell`
- Ciryl Gane → `ufc:ciryl-gane`
- Colby Covington → `ufc:colby-covington`
- Conor McGregor → `ufc:conor-mcgregor`
- Cris Cyborg → `ufc:cris-cyborg`
- Dan Henderson → `ufc:dan-henderson`
- Dan Hooker → `ufc:dan-hooker`
- Daniel Cormier → `ufc:daniel-cormier`
- Deiveson Figueiredo → `ufc:deiveson-figueiredo`
- Demetrious Johnson → `ufc:demetrious-johnson`
- Derrick Lewis → `ufc:derrick-lewis`
- Diego Lopes → `ufc:diego-lopes`
- Dominick Cruz → `ufc:dominick-cruz`
- Dominick Reyes → `ufc:dominick-reyes`
- Donald Cerrone → `ufc:donald-cerrone`
- Dricus du Plessis → `ufc:dricus-du-plessis`
- Dustin Poirier → `ufc:dustin-poirier`
- Fabricio Werdum → `ufc:fabricio-werdum`
- Forrest Griffin → `ufc:forrest-griffin`
- Francis Ngannou → `ufc:francis-ngannou`
- Frank Shamrock → `ufc:frank-shamrock`
- Frankie Edgar → `ufc:frankie-edgar`
- Georges St-Pierre → `ufc:georges-st-pierre`
- Gilbert Burns → `ufc:gilbert-burns`
- Glover Teixeira → `ufc:glover-teixeira`
- Henry Cejudo → `ufc:henry-cejudo`
- Holly Holm → `ufc:holly-holm`
- Ilia Topuria → `ufc:ilia-topuria`
- Islam Makhachev → `ufc:islam-makhachev`
- Israel Adesanya → `ufc:israel-adesanya`
- Jessica Andrade → `ufc:jessica-andrade`
- Joanna Jedrzejczyk → `ufc:joanna-jedrzejczyk`
- Jon Jones → `ufc:jon-jones`
- Jorge Masvidal → `ufc:jorge-masvidal`
- Jose Aldo → `ufc:jose-aldo`
- Julianna Peña → `ufc:julianna-pena`
- Junior dos Santos → `ufc:junior-dos-santos`
- Justin Gaethje → `ufc:justin-gaethje`
- Kamaru Usman → `ufc:kamaru-usman`
- Kayla Harrison → `ufc:kayla-harrison`
- Kevin Holland → `ufc:kevin-holland`
- Khabib Nurmagomedov → `ufc:khabib-nurmagomedov`
- Khamzat Chimaev → `ufc:khamzat-chimaev`
- Leon Edwards → `ufc:leon-edwards`
- Lyoto Machida → `ufc:lyoto-machida`
- Mackenzie Dern → `ufc:mackenzie-dern`
- Marlon Vera → `ufc:marlon-vera`
- Matt Hughes → `ufc:matt-hughes`
- Mauricio "Shogun" Rua → `ufc:shogun-rua`
- Max Holloway → `ufc:max-holloway`
- Merab Dvalishvili → `ufc:merab-dvalishvili`
- Michael Bisping → `ufc:michael-bisping`
- Michael Chandler → `ufc:michael-chandler`
- Miesha Tate → `ufc:miesha-tate`
- Nate Diaz → `ufc:nate-diaz`
- Nick Diaz → `ufc:nick-diaz`
- Paddy Pimblett → `ufc:paddy-pimblett`
- Paulo Costa → `ufc:paulo-costa`
- Petr Yan → `ufc:petr-yan`
- Quinton Jackson → `ufc:quinton-jackson`
- Rafael dos Anjos → `ufc:rafael-dos-anjos`
- Randy Couture → `ufc:randy-couture`
- Rashad Evans → `ufc:rashad-evans`
- Robbie Lawler → `ufc:robbie-lawler`
- Robert Whittaker → `ufc:robert-whittaker`
- Ronda Rousey → `ufc:ronda-rousey`
- Rose Namajunas → `ufc:rose-namajunas`
- Royce Gracie → `ufc:royce-gracie`
- Sean O'Malley → `ufc:sean-omalley`
- Sean Strickland → `ufc:sean-strickland`
- Stephen Thompson → `ufc:stephen-thompson`
- Stipe Miocic → `ufc:stipe-miocic`
- T.J. Dillashaw → `ufc:tj-dillashaw`
- Tai Tuivasa → `ufc:tai-tuivasa`
- Tito Ortiz → `ufc:tito-ortiz`
- Tom Aspinall → `ufc:tom-aspinall`
- Tony Ferguson → `ufc:tony-ferguson`
- Tyron Woodley → `ufc:tyron-woodley`
- Valentina Shevchenko → `ufc:valentina-shevchenko`
- Vitor Belfort → `ufc:vitor-belfort`
- Yair Rodriguez → `ufc:yair-rodriguez`
- Zhang Weili → `ufc:zhang-weili`

## Preservation and regression checks

- Launch membership unchanged: **yes**.
- Recognizability unchanged: **yes**.
- UFC rankings, OVRs, ranking inputs, and Jon Jones benchmark unchanged: **yes**.
- Gameplay, clue generation, clue wording, clue ordering, scoring, and challenge behavior unchanged: **yes**.
- Existing NFL and CFB person-identity knowledge remains owned by `footballPersonIdentityKnowledge.ts` and is regression-checked.
- PR10 adds no runtime web lookup, LLM truth judgment, fallback owner, second query path, duplicate route owner, duplicate initialization, or generated artifact.

## Focused test coverage

`src/features/back-room/ufcPersonIdentityKnowledge.test.ts` verifies:

- exact equality among attached research IDs, retained PR10 record IDs, the UFC factual ledger, and the current UFC Who Am I universe;
- exactly five retained concepts for every one of the 100 fighters and exactly 500 total;
- 500 unique fact IDs, 500 unique canonical concept IDs, nonempty normalized wording, and 500 unique normalized retained facts;
- valid provenance and exactly 279 unique direct provenance URLs;
- preservation of raw research concept tokens while canonical IDs remain unique;
- current ranking count / expansion count / A-tier launch recognition remain unchanged;
- existing UFC round behavior remains intact;
- representative completed NFL and CFB identity knowledge and 200-subject football launch pools remain intact;
- PR10 data modules do not import or own ranking, recognizability, round-generation, or scoring architecture.

## Final intended changed-file list

- `docs/who-am-i-pr10-ufc-person-identity-audit.md`
- `src/features/back-room/ufcPersonIdentityKnowledge.ts`
- `src/features/back-room/ufcPersonIdentityKnowledge.test.ts`
- `src/features/back-room/ufcPersonIdentityResearch1.ts`
- `src/features/back-room/ufcPersonIdentityResearch2.ts`
- `src/features/back-room/ufcPersonIdentityResearch3.ts`

## Release boundary

This document is audit/provenance documentation only. It is not a runtime data source and must not be imported by production code. Exact-head CI, merge SHA, GitHub Actions deployment, and live deployment-marker verification are release evidence and are reported against the immutable PR/merge SHAs after validation.
