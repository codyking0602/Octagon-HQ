# Who Am I Rebuild PR10 — UFC person identity audit

## Scope

- Scope: UFC person identity knowledge only.
- Base main SHA: `aa509688091f0c2afebe23a4502d2d96d7343cf8`.
- Canonical UFC factual/runtime population owner: `src/features/back-room/ufcFactualLedger.ts`.
- Canonical PR10 person-identity knowledge owner: `src/features/back-room/ufcPersonIdentityKnowledge.ts`.
- Data-only authoritative research modules: `src/features/back-room/ufcPersonIdentityResearch1.ts` through `ufcPersonIdentityResearch10.ts`.
- Focused test: `src/features/back-room/ufcPersonIdentityKnowledge.test.ts`.
- Authoritative research input: the three completed PR10 UFC packages supplied for integration on 2026-09-10.
- Launch membership, recognizability, ranking inputs, OVRs, ranking philosophy, clue wording/order/scoring, Who Am I gameplay, routes, Supabase ownership, Cloudflare ownership, NFL/CFB knowledge, and Octagon Verdict data are explicitly out of scope.
- Final PR head SHA: the exact immutable value is recorded in PR metadata and the exact-head validation record after this document is committed. A Git commit SHA is content-addressed and cannot be embedded in the contents of the same commit without changing that SHA.

## Deterministic ingestion audit

- Attached research package 1: **34 identities / 170 concepts**.
- Attached research package 2: **33 identities / 165 concepts**.
- Attached research package 3: **33 identities / 165 concepts**.
- Researched identities: **100**.
- Retained runtime identities: **100**.
- Concepts per identity: **exactly 5**.
- Retained concepts: **500**.
- Unique canonical concept IDs after reconciliation: **500**.
- Unique canonical fact IDs: **500**.
- Duplicate normalized retained wording: **0**.
- Unique retained provenance URLs: **279**.
- Missing/invalid retained provenance URLs: **0**.
- Duplicate person records: **0**.
- Attachment fingerprint before the one mechanical concept-ID reconciliation: `0x606ca65f6d6e42a1`.
- Canonical retained-data fingerprint after reconciliation: `0xa3ee8afb0b5533fb`.
- Fingerprint input is the ordered list of `subjectId + conceptId + fact + sourceUrl`; the only content difference between those fingerprints is the one concept-ID reconciliation documented below. Retained fact wording and provenance are otherwise byte-for-byte preserved from the supplied packages.

## Canonical population reconciliation

Current main owns a **100-person UFC Who Am I population** through the UFC factual ledger: **81 ranked-core subjects + 19 recognizable-expansion subjects**. Direct comparison against the three supplied research packages found:

- Missing canonical launch identities: **0**.
- Stale researched identities: **0**.
- Population additions/removals required: **0**.
- Fighter slug/subject-ID alias mappings required: **0**.
- Targeted replacement research required: **0**.

The researched roster therefore matches current canonical launch membership exactly. PR10 does not alter the UFC factual ledger, recognizability tiers, ranking roster, or Who Am I authority.

### Concept-ID reconciliation

The supplied packages contained one cross-person concept-ID collision: `physical-education-degree` appeared for both Aljamain Sterling and Lyoto Machida. The facts are distinct person-scoped concepts, but PR10 requires globally unique canonical concept IDs.

Only the Lyoto Machida identifier was mechanically reconciled:

- Supplied: `physical-education-degree`
- Canonical retained ID: `lyoto-machida-physical-education-degree`

The fact wording, person mapping, publisher, source title, source URL, and underlying concept were not changed. No other supplied concept ID was altered.

## Full canonical identity mapping

| Fighter | Canonical UFC subject ID |
|---|---|
| Alexandre Pantoja | `ufc:alex-pantoja` |
| Alex Pereira | `ufc:alex-pereira` |
| Alexa Grasso | `ufc:alexa-grasso` |
| Alexander Volkanovski | `ufc:alexander-volkanovski` |
| Aljamain Sterling | `ufc:aljamain-sterling` |
| Amanda Nunes | `ufc:amanda-nunes` |
| Anderson Silva | `ufc:anderson-silva` |
| Anthony Pettis | `ufc:anthony-pettis` |
| Benson Henderson | `ufc:benson-henderson` |
| B.J. Penn | `ufc:bj-penn` |
| Brandon Moreno | `ufc:brandon-moreno` |
| Brian Ortega | `ufc:brian-ortega` |
| Brock Lesnar | `ufc:brock-lesnar` |
| Cain Velasquez | `ufc:cain-velasquez` |
| Carla Esparza | `ufc:carla-esparza` |
| Chael Sonnen | `ufc:chael-sonnen` |
| Charles Oliveira | `ufc:charles-oliveira` |
| Chris Weidman | `ufc:chris-weidman` |
| Chuck Liddell | `ufc:chuck-liddell` |
| Ciryl Gane | `ufc:ciryl-gane` |
| Colby Covington | `ufc:colby-covington` |
| Conor McGregor | `ufc:conor-mcgregor` |
| Cris Cyborg | `ufc:cris-cyborg` |
| Dan Henderson | `ufc:dan-henderson` |
| Dan Hooker | `ufc:dan-hooker` |
| Daniel Cormier | `ufc:daniel-cormier` |
| Deiveson Figueiredo | `ufc:deiveson-figueiredo` |
| Demetrious Johnson | `ufc:demetrious-johnson` |
| Derrick Lewis | `ufc:derrick-lewis` |
| Diego Lopes | `ufc:diego-lopes` |
| Dominick Cruz | `ufc:dominick-cruz` |
| Dominick Reyes | `ufc:dominick-reyes` |
| Donald Cerrone | `ufc:donald-cerrone` |
| Dricus du Plessis | `ufc:dricus-du-plessis` |
| Dustin Poirier | `ufc:dustin-poirier` |
| Fabricio Werdum | `ufc:fabricio-werdum` |
| Forrest Griffin | `ufc:forrest-griffin` |
| Francis Ngannou | `ufc:francis-ngannou` |
| Frank Shamrock | `ufc:frank-shamrock` |
| Frankie Edgar | `ufc:frankie-edgar` |
| Georges St-Pierre | `ufc:georges-st-pierre` |
| Gilbert Burns | `ufc:gilbert-burns` |
| Glover Teixeira | `ufc:glover-teixeira` |
| Henry Cejudo | `ufc:henry-cejudo` |
| Holly Holm | `ufc:holly-holm` |
| Ilia Topuria | `ufc:ilia-topuria` |
| Islam Makhachev | `ufc:islam-makhachev` |
| Israel Adesanya | `ufc:israel-adesanya` |
| Jessica Andrade | `ufc:jessica-andrade` |
| Joanna Jedrzejczyk | `ufc:joanna-jedrzejczyk` |
| Jon Jones | `ufc:jon-jones` |
| Jorge Masvidal | `ufc:jorge-masvidal` |
| Jose Aldo | `ufc:jose-aldo` |
| Julianna Peña | `ufc:julianna-pena` |
| Junior dos Santos | `ufc:junior-dos-santos` |
| Justin Gaethje | `ufc:justin-gaethje` |
| Kamaru Usman | `ufc:kamaru-usman` |
| Kayla Harrison | `ufc:kayla-harrison` |
| Kevin Holland | `ufc:kevin-holland` |
| Khabib Nurmagomedov | `ufc:khabib-nurmagomedov` |
| Khamzat Chimaev | `ufc:khamzat-chimaev` |
| Leon Edwards | `ufc:leon-edwards` |
| Lyoto Machida | `ufc:lyoto-machida` |
| Mackenzie Dern | `ufc:mackenzie-dern` |
| Marlon Vera | `ufc:marlon-vera` |
| Matt Hughes | `ufc:matt-hughes` |
| Max Holloway | `ufc:max-holloway` |
| Merab Dvalishvili | `ufc:merab-dvalishvili` |
| Michael Bisping | `ufc:michael-bisping` |
| Michael Chandler | `ufc:michael-chandler` |
| Miesha Tate | `ufc:miesha-tate` |
| Nate Diaz | `ufc:nate-diaz` |
| Nick Diaz | `ufc:nick-diaz` |
| Paddy Pimblett | `ufc:paddy-pimblett` |
| Paulo Costa | `ufc:paulo-costa` |
| Petr Yan | `ufc:petr-yan` |
| Quinton Jackson | `ufc:quinton-jackson` |
| Rafael dos Anjos | `ufc:rafael-dos-anjos` |
| Randy Couture | `ufc:randy-couture` |
| Rashad Evans | `ufc:rashad-evans` |
| Robbie Lawler | `ufc:robbie-lawler` |
| Robert Whittaker | `ufc:robert-whittaker` |
| Ronda Rousey | `ufc:ronda-rousey` |
| Rose Namajunas | `ufc:rose-namajunas` |
| Royce Gracie | `ufc:royce-gracie` |
| Sean O'Malley | `ufc:sean-omalley` |
| Sean Strickland | `ufc:sean-strickland` |
| Mauricio "Shogun" Rua | `ufc:shogun-rua` |
| Stephen Thompson | `ufc:stephen-thompson` |
| Stipe Miocic | `ufc:stipe-miocic` |
| Tai Tuivasa | `ufc:tai-tuivasa` |
| Tito Ortiz | `ufc:tito-ortiz` |
| T.J. Dillashaw | `ufc:tj-dillashaw` |
| Tom Aspinall | `ufc:tom-aspinall` |
| Tony Ferguson | `ufc:tony-ferguson` |
| Tyron Woodley | `ufc:tyron-woodley` |
| Valentina Shevchenko | `ufc:valentina-shevchenko` |
| Vitor Belfort | `ufc:vitor-belfort` |
| Yair Rodriguez | `ufc:yair-rodriguez` |
| Zhang Weili | `ufc:zhang-weili` |

## Architecture and preservation

PR10 follows the established NFL/CFB person-identity pattern: research is stored in data-only modules, while one canonical module owns validation, provenance normalization and lookup.

The canonical owner:

- rejects non-canonical UFC subject IDs;
- rejects duplicate person records;
- rejects duplicate concept IDs per person;
- rejects duplicate global fact IDs;
- rejects empty retained wording;
- rejects missing/unresolved provenance;
- globally deduplicates provenance by source URL;
- exposes lookup through the canonical UFC factual subject ID.

PR10 does **not** feed a second Who Am I route, does not create a fallback knowledge store, and does not change the existing clue-generation path. This is reusable person-first knowledge enrichment, not gameplay or ranking data.

## Focused test coverage

`src/features/back-room/ufcPersonIdentityKnowledge.test.ts` establishes:

- exact 100-ID equality with the canonical current UFC factual/Who Am I launch population;
- current population shape remains 81 ranked-core + 19 recognizable-expansion;
- recognizable expansion remains tier A;
- exactly 100 PR10 person records;
- exactly five concepts per fighter;
- exactly 500 retained concepts;
- 500 unique canonical fact IDs;
- 500 globally unique canonical concept IDs;
- 500 unique person-qualified concept keys;
- 500 unique normalized retained fact wordings;
- exactly 279 globally unique provenance URLs;
- nonempty publisher/title and HTTPS provenance;
- every provenance row is actually referenced;
- stale/noncanonical IDs do not resolve;
- prior football person-identity knowledge remains present;
- UFC Who Am I launch population remains 100.

The full repository test suite remains the regression gate for previously completed NFL/CFB identity work and existing UFC behavior outside PR10.

## Scope-preservation confirmation

- UFC launch membership changed: **no**.
- UFC recognizability changed: **no**.
- UFC rankings/ranking inputs/OVRs changed: **no**.
- Jon Jones 99 OVR benchmark changed: **no**.
- UFC factual/ranking ledger changed: **no**.
- Gameplay/clue generation/clue wording/clue ordering/scoring changed: **no**.
- Routes changed: **no**.
- Supabase/backend code changed: **no**.
- Cloudflare Worker/deployment ownership changed: **no**.
- NFL/CFB knowledge changed: **no**.
- Generated export artifacts changed: **no**.

## Final changed-file list

1. `docs/who-am-i-pr10-ufc-person-identity-audit.md`
2. `src/features/back-room/ufcPersonIdentityKnowledge.ts`
3. `src/features/back-room/ufcPersonIdentityKnowledge.test.ts`
4. `src/features/back-room/ufcPersonIdentityResearch1.ts`
5. `src/features/back-room/ufcPersonIdentityResearch2.ts`
6. `src/features/back-room/ufcPersonIdentityResearch3.ts`
7. `src/features/back-room/ufcPersonIdentityResearch4.ts`
8. `src/features/back-room/ufcPersonIdentityResearch5.ts`
9. `src/features/back-room/ufcPersonIdentityResearch6.ts`
10. `src/features/back-room/ufcPersonIdentityResearch7.ts`
11. `src/features/back-room/ufcPersonIdentityResearch8.ts`
12. `src/features/back-room/ufcPersonIdentityResearch9.ts`
13. `src/features/back-room/ufcPersonIdentityResearch10.ts`

No temporary probes, staging JSON, research archives, generated runtime artifacts, duplicate owners or unrelated refactors are part of the permanent PR.
