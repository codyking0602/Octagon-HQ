import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import AppRouteError from "./AppRouteError";
import { AppShell } from "./AppShell";

const HomePage = lazy(() => import("../features/home/HomePage"));
const ShanesWatchlistPage = lazy(() => import("../features/home/ShanesWatchlistPage"));
const RankingsPage = lazy(() => import("../features/rankings/RankingsPage"));
const FighterProfilePage = lazy(() => import("../features/rankings/FighterProfilePage"));
const IntelligencePage = lazy(() => import("../features/intelligence/IntelligencePage"));
const MemberDirectoryPage = lazy(() => import("../features/members/MemberDirectoryPage"));
const MemberProfilePage = lazy(() => import("../features/members/MemberProfilePage"));
const NotificationCenterPage = lazy(() => import("../features/notifications/NotificationCenterPage"));
const BackRoomPage = lazy(() => import("../features/back-room/BackRoomPage"));
const FootballBackRoomPage = lazy(() => import("../features/back-room/FootballBackRoomPage"));
const FootballTodayChallengePage = lazy(() => import("../features/back-room/FootballTodayChallengePage"));
const FootballRankFivePage = lazy(() => import("../features/back-room/FootballRankFivePage"));
const FootballKeepCutPage = lazy(() => import("../features/back-room/FootballKeepCutPage"));
const FootballWavelengthPage = lazy(() => import("../features/back-room/FootballWavelengthPage"));
const FootballBlindResumePage = lazy(() => import("../features/back-room/FootballBlindResumePage"));
const FootballHitTheNumberPage = lazy(() => import("../features/back-room/FootballHitTheNumberPage"));
const FootballFindLeaderPage = lazy(() => import("../features/back-room/FootballFindLeaderPage"));
const TodayChallengeHubPage = lazy(() => import("../features/play/TodayChallengeHubPage"));
const FindLeaderChallengeRoute = lazy(() => import("../features/challenges/FindLeaderChallengeRoute"));
const TodayChallengeGameRoute = lazy(() => import("../features/play/TodayChallengeGameRoute"));
const WavelengthPage = lazy(() => import("../features/play/WavelengthPage"));
const BlindResumePage = lazy(() => import("../features/play/BlindResumePage"));
const BlindRankPage = lazy(() => import("../features/play/BlindRankPage"));
const KeepCutPage = lazy(() => import("../features/play/KeepCutPage"));
const AuctionPage = lazy(() => import("../features/play/AuctionPage"));
const HitTheNumberPage = lazy(() => import("../features/play/HitTheNumberPage"));
const PicksPage = lazy(() => import("../features/picks/PicksPage"));
const PicksControlCenterPage = lazy(() => import("../features/picks-control/PicksControlCenterPage"));
const WarRoomPage = lazy(() => import("../features/war-room/WarRoomPage"));
const WarRoomJoinPage = lazy(() => import("../features/war-room/WarRoomJoinPage"));
const WhatsNewPage = lazy(() => import("../features/whats-new/WhatsNewPage"));

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    errorElement: <AppRouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "fighters-to-watch", element: <ShanesWatchlistPage /> },
      { path: "rankings", element: <RankingsPage /> },
      { path: "fighters/:slug", element: <FighterProfilePage /> },
      { path: "intelligence", element: <IntelligencePage /> },
      { path: "members", element: <MemberDirectoryPage /> },
      { path: "members/:memberName", element: <MemberProfilePage /> },
      { path: "notifications", element: <NotificationCenterPage /> },
      { path: "play", element: <TodayChallengeHubPage /> },
      { path: "play/find-leader", element: <TodayChallengeGameRoute gameType="find_leader" casual={<FindLeaderChallengeRoute />} /> },
      { path: "play/wavelength", element: <TodayChallengeGameRoute gameType="wavelength" casual={<WavelengthPage />} /> },
      { path: "play/blind-resume", element: <TodayChallengeGameRoute gameType="blind_resume" casual={<BlindResumePage />} /> },
      { path: "play/blind-rank", element: <TodayChallengeGameRoute gameType="blind_rank_5" casual={<BlindRankPage />} /> },
      { path: "play/keep-cut", element: <TodayChallengeGameRoute gameType="keep_4_cut_4" casual={<KeepCutPage />} /> },
      { path: "play/auction", element: <AuctionPage /> },
      { path: "play/hit-the-number", element: <TodayChallengeGameRoute gameType="hit_the_number" casual={<HitTheNumberPage />} /> },
      { path: "back-room", element: <BackRoomPage /> },
      { path: "back-room/football", element: <FootballBackRoomPage /> },
      { path: "back-room/football/today", element: <FootballTodayChallengePage /> },
      { path: "back-room/football/rank-five", element: <FootballRankFivePage /> },
      { path: "back-room/football/keep-cut", element: <FootballKeepCutPage /> },
      { path: "back-room/football/wavelength", element: <FootballWavelengthPage /> },
      { path: "back-room/football/blind-resume", element: <FootballBlindResumePage /> },
      { path: "back-room/football/hit-the-number", element: <FootballHitTheNumberPage /> },
      { path: "back-room/football/find-leader", element: <FootballFindLeaderPage /> },
      { path: "picks", element: <PicksPage /> },
      { path: "picks/control", element: <PicksControlCenterPage /> },
      { path: "picks/setup", element: <Navigate to="/picks/control#setup" replace /> },
      { path: "picks/monitoring", element: <Navigate to="/picks/control#monitoring" replace /> },
      { path: "war-room/join", element: <WarRoomJoinPage /> },
      { path: "war-room", element: <WarRoomPage /> },
      { path: "whats-new", element: <WhatsNewPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
