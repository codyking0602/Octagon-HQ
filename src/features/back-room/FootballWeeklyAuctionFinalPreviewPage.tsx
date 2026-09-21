import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { FootballWeeklyAuctionFinal } from "../play/footballWeeklyAuctionRepository";
import { isFootballWeeklyAuctionFinalPreviewOwner } from "../play/footballWeeklyAuctionFinalPreviewAccess";
import { FootballWeeklyAuctionFinalResult } from "./FootballWeeklyAuctionGate";

const SAMPLE_USERS = {
  me: "00000000-0000-4000-8000-000000000001",
  two: "00000000-0000-4000-8000-000000000002",
  three: "00000000-0000-4000-8000-000000000003",
  four: "00000000-0000-4000-8000-000000000004",
  five: "00000000-0000-4000-8000-000000000005",
  six: "00000000-0000-4000-8000-000000000006",
} as const;

const sampleTeams = [
  [1, 1, "SEC", "weekly-cfb-florida-2001", "Florida", 2001, 94.0, 9, SAMPLE_USERS.me, "You"],
  [1, 2, "SEC", "weekly-cfb-tennessee-2001", "Tennessee", 2001, 91.5, 5, SAMPLE_USERS.two, "Sample Player 2"],
  [1, 3, "SEC", "weekly-cfb-texas-2001", "Texas", 2001, 89.5, 3, SAMPLE_USERS.three, "Sample Player 3"],
  [2, 1, "BIG TEN", "weekly-cfb-oregon-2001", "Oregon", 2001, 96.0, 12, SAMPLE_USERS.four, "Sample Player 4"],
  [2, 2, "BIG TEN", "weekly-cfb-usc-2002", "USC", 2002, 93.0, 7, SAMPLE_USERS.me, "You"],
  [2, 3, "BIG TEN", "weekly-cfb-ohio-state-2005", "Ohio State", 2005, 90.5, 4, SAMPLE_USERS.five, "Sample Player 5"],
  [3, 1, "BIG 12", "weekly-cfb-oklahoma-2002", "Oklahoma", 2002, 95.0, 10, SAMPLE_USERS.six, "Sample Player 6"],
  [3, 2, "BIG 12", "weekly-cfb-oklahoma-2003", "Oklahoma", 2003, 92.0, 6, SAMPLE_USERS.two, "Sample Player 2"],
  [3, 3, "BIG 12", "weekly-cfb-oklahoma-2004", "Oklahoma", 2004, 88.5, 2, SAMPLE_USERS.three, "Sample Player 3"],
  [4, 1, "BIG TEN", "weekly-cfb-usc-2006", "USC", 2006, 94.5, 8, SAMPLE_USERS.me, "You"],
  [4, 2, "BIG TEN", "weekly-cfb-penn-state-2008", "Penn State", 2008, 91.0, 4, SAMPLE_USERS.four, "Sample Player 4"],
  [4, 3, "BIG TEN", "weekly-cfb-ohio-state-2008", "Ohio State", 2008, 89.0, 2, SAMPLE_USERS.five, "Sample Player 5"],
  [5, 1, "ACC", "weekly-cfb-virginia-tech-2000", "Virginia Tech", 2000, 93.5, 7, SAMPLE_USERS.six, "Sample Player 6"],
  [5, 2, "ACC", "weekly-cfb-florida-state-2003", "Florida State", 2003, 90.0, 3, SAMPLE_USERS.me, "You"],
  [5, 3, "ACC", "weekly-cfb-virginia-tech-2006", "Virginia Tech", 2006, 87.5, 1, SAMPLE_USERS.two, "Sample Player 2"],
  [6, 1, "SEC", "weekly-cfb-georgia-2002", "Georgia", 2002, 97.0, 14, SAMPLE_USERS.three, "Sample Player 3"],
  [6, 2, "SEC", "weekly-cfb-lsu-2006", "LSU", 2006, 92.5, 5, SAMPLE_USERS.four, "Sample Player 4"],
  [6, 3, "SEC", "weekly-cfb-alabama-2010", "Alabama", 2010, 88.0, 1, SAMPLE_USERS.five, "Sample Player 5"],
  [7, 1, "WILDCARD", "weekly-cfb-boise-state-2006", "Boise State", 2006, 95.5, 9, SAMPLE_USERS.six, "Sample Player 6"],
  [7, 2, "WILDCARD", "weekly-cfb-notre-dame-2012", "Notre Dame", 2012, 91.5, 4, SAMPLE_USERS.two, "Sample Player 2"],
  [7, 3, "WILDCARD", "weekly-cfb-cincinnati-2009", "Cincinnati", 2009, 89.5, 2, SAMPLE_USERS.three, "Sample Player 3"],
] as const;

const PREVIEW_RESULT: FootballWeeklyAuctionFinal = {
  subject_key: "cfb-best-teams-since-2000",
  week_start: "2026-09-15",
  standings: [
    { rank: 1, profile_id: SAMPLE_USERS.me, display_name: "You", final_score: 93.8, scoring_cost: 24, owned_count: 4, is_winner: true, is_current_user: true },
    { rank: 2, profile_id: SAMPLE_USERS.two, display_name: "Sample Player 2", final_score: 92.7, scoring_cost: 19, owned_count: 5, is_winner: false, is_current_user: false },
    { rank: 3, profile_id: SAMPLE_USERS.three, display_name: "Sample Player 3", final_score: 91.9, scoring_cost: 21, owned_count: 4, is_winner: false, is_current_user: false },
    { rank: 4, profile_id: SAMPLE_USERS.four, display_name: "Sample Player 4", final_score: 90.8, scoring_cost: 18, owned_count: 4, is_winner: false, is_current_user: false },
    { rank: 5, profile_id: SAMPLE_USERS.five, display_name: "Sample Player 5", final_score: 89.9, scoring_cost: 16, owned_count: 5, is_winner: false, is_current_user: false },
    { rank: 6, profile_id: SAMPLE_USERS.six, display_name: "Sample Player 6", final_score: 88.6, scoring_cost: 15, owned_count: 4, is_winner: false, is_current_user: false },
  ],
  collection: [
    { season_reference: "weekly-cfb-florida-2001", school: "Florida", season_year: 2001, display_label: "2001 Florida", grade: 94.0, winning_bid: 9, counts: true },
    { season_reference: "weekly-cfb-usc-2002", school: "USC", season_year: 2002, display_label: "2002 USC", grade: 93.0, winning_bid: 7, counts: true },
    { season_reference: "weekly-cfb-usc-2006", school: "USC", season_year: 2006, display_label: "2006 USC", grade: 94.5, winning_bid: 8, counts: true },
    { season_reference: "weekly-cfb-florida-state-2003", school: "Florida State", season_year: 2003, display_label: "2003 Florida State", grade: 90.0, winning_bid: 3, counts: false },
  ],
  all_teams: sampleTeams.map(([day_index, slot, theme, season_reference, school, season_year, grade, winning_bid, winner_profile_id, winner_display_name]) => ({
    day_index,
    slot,
    theme,
    season_reference,
    school,
    season_year,
    display_label: `${season_year} ${school}`,
    grade,
    winning_bid,
    winner_profile_id,
    winner_display_name,
  })),
  my_result: {
    week_start: "2026-09-15",
    profile_id: SAMPLE_USERS.me,
    owned_count: 4,
    final_score: 93.8,
    scoring_cost: 24,
    scoring_refs: ["weekly-cfb-florida-2001", "weekly-cfb-usc-2002", "weekly-cfb-usc-2006"],
    final_rank: 1,
    is_winner: true,
  },
};

export default function FootballWeeklyAuctionFinalPreviewPage() {
  const identity = useIdentity();
  const navigate = useNavigate();

  if (!isFootballWeeklyAuctionFinalPreviewOwner(identity.profile)) {
    return <Navigate to="/football" replace />;
  }

  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">OWNER PREVIEW · CFB WEEKLY AUCTION</p>
        <h1>Final Results Preview</h1>
        <p>Sanitized sample data only. No live bids, hidden grades, or tonight’s winner are shown here.</p>
      </section>

      <FootballWeeklyAuctionFinalResult
        result={PREVIEW_RESULT}
        busy={false}
        onAcknowledge={() => navigate("/football")}
      />
    </div>
  );
}
