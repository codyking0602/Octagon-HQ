# Average Fan Stage 2P — UFC history overlap and recognizable-finish review

Date: October 14, 2026. This increment audits **three specific surviving UFC history fact families** against UFC event results and the actual 10-run Millionaire UFC bank. It is not a complete review of all UFC history source rows or the selected/generated UFC bank.

| Historical Average Fan source | Disposition | Why |
| --- | --- | --- |
| `aldo-13`: "How many seconds did Conor McGregor need to knock out Jose Aldo at UFC 194?" | **Retire** | [Official UFC 194 result](https://www.ufc.com/news/conor-mcgregor-kos-jose-aldo-13-seconds-win-title): 13 seconds. Millionaire already asks which fighter knocked out Aldo in 13 seconds to win the title, answering Conor McGregor. That is the *same KO/fact* despite reversing the response. Exact-time recall adds little value. |
| `holm-rousey`: "Who knocked out Ronda Rousey with a head kick at UFC 193?" | **Retire** | [UFC 193 official result](https://www.ufc.com/news/ufc-193-rousey-vs-holm-results) confirms Holly Holm. Millionaire already asks who handed Rousey her first professional loss, also answering Holly Holm. Same opponent and signature upset, not two independent trivia facts. |
| `holloway-gaethje-time`: exact one-second remaining free recall at UFC 300 | **Rewrite**, new question ID | [UFC 300 official results](https://www.ufc.com/news/official-judges-scorecards-ufc-300-pereira-vs-hill) give 4:59 of R5, but asking exactly how many seconds remained is an arbitrary calculation. The new question instead asks **who Max Holloway knocked out with a second left at UFC 300**, answer Justin Gaethje; authored wrong opponents Dustin Poirier, Calvin Kattar and Yair Rodriguez are recognizable Holloway-era alternatives, none fought him at UFC 300. |

## Operational conditions

- Future question selection only. Old published questions, grading/private evidence and player results remain unchanged.
- The two retired Average Fan facts remain independently available through Millionaire rather than being silently paraphrased.
- Same cross-game semantic overlap scanner and 120-day deterministic Daily tests remain in place; focused regression checks the corresponding Millionaire correct-choice IDs and prevents the old fact families from returning.
- Exact-number or exact-time recall is not inherently forbidden, but it should reward a recognizable sporting achievement. The new Holloway–Gaethje question rewards identifying an iconic fight, not subtracting a timestamp.
- Other UFC history families (including the historical Chris Weidman–Anderson Silva upset, which also appears in Millionaire) still require editorial game-allocation decisions. No claim of comprehensive Stage 2 completeness.
