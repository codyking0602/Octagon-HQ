import { describe, expect, it } from "vitest";
import { buildSportsFeudBoardGuessRows } from "./DailyLeaderboardGameResult";

describe("Sports Feud daily completed result transparency", () => {
  it("shows the real ordered submissions and credits without changing the score", () => {
    const rows = buildSportsFeudBoardGuessRows({
      guesses: [
        { submittedText: "Khabib", matchedName: "Khabib Nurmagomedov", points: 10, outcome: "correct" },
        { submittedText: "Wrong Person", matchedName: null, points: 0, outcome: "strike" },
        { submittedText: "Chael", matchedName: "Chael Sonnen", points: 2, outcome: "accepted" },
      ],
      slots: [{ found: true, points: 10, entity: { display_name: "Khabib Nurmagomedov" } }],
    });
    expect(rows.map((row) => row.submittedText)).toEqual(["Khabib", "Wrong Person", "Chael"]);
    expect(rows.map((row) => row.points)).toEqual([10, 0, 2]);
    expect(rows[1]?.outcome).toBe("strike");
  });

  it("does not invent legacy guess order and recognizes an explicit historical review", () => {
    const rows = buildSportsFeudBoardGuessRows({
      slots: [
        { found: true, points: 10, entity: { display_name: "Khabib Nurmagomedov" } },
        { found: true, points: 8, entity: { display_name: "Georges St-Pierre" } },
      ],
      reviewed_guesses: [{ submitted_text: "Khamzat Chimaev", points: 0, outcome: "accepted-after-review" }],
    });
    expect(rows.map((row) => row.submittedText)).toEqual([
      "Khabib Nurmagomedov", "Georges St-Pierre", "Khamzat Chimaev",
    ]);
    expect(rows[2]?.outcome).toBe("accepted-after-review");
  });
});
