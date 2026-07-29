import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import AppRouteError from "./AppRouteError";
import { AppShell } from "./AppShell";

const HomePage = lazy(() => import("../features/home/HomePage"));
const RankingsPage = lazy(() => import("../features/rankings/RankingsPage"));
const FighterProfilePage = lazy(() => import("../features/rankings/FighterProfilePage"));
const IntelligencePage = lazy(() => import("../features/intelligence/IntelligencePage"));
const MemberDirectoryPage = lazy(() => import("../features/members/MemberDirectoryPage"));
const MemberProfilePage = lazy(() => import("../features/members/MemberProfilePage"));
const NotificationCenterPage = lazy(() => import("../features/notifications/NotificationCenterPage"));
const PlayPage = lazy(() => import("../features/play/PlayPage"));
const FindLeaderChallengeRoute = lazy(() => import("../features/challenges/FindLeaderChallengeRoute"));
const WavelengthPage = lazy(() => import("../features/play/WavelengthPage"));
const BlindResumePage = lazy(() => import("../features/play/BlindResumePage"));
const BlindRankPage = lazy(() => import("../features/play/BlindRankPage"));
const KeepCutPage = lazy(() => import("../features/play/KeepCutPage"));
const BetterThanPage = lazy(() => import("../features/play/BetterThanPage"));
const PicksPage = lazy(() => import("../features/picks/PicksPage"));
const PicksControlPage = lazy(() => import("../features/picks-control/PicksControlPage"));
const PicksSetupPage = lazy(() => import("../features/picks-setup/PicksSetupPage"));
const MonitoringInboxPage = lazy(() => import("../features/picks-monitoring/MonitoringInboxPage"));
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
      { path: "rankings", element: <RankingsPage /> },
      { path: "fighters/:slug", element: <FighterProfilePage /> },
      { path: "intelligence", element: <IntelligencePage /> },
      { path: "members", element: <MemberDirectoryPage /> },
      { path: "members/:memberName", element: <MemberProfilePage /> },
      { path: "notifications", element: <NotificationCenterPage /> },
      { path: "play", element: <PlayPage /> },
      { path: "play/find-leader", element: <FindLeaderChallengeRoute /> },
      { path: "play/wavelength", element: <WavelengthPage /> },
      { path: "play/blind-resume", element: <BlindResumePage /> },
      { path: "play/blind-rank", element: <BlindRankPage /> },
      { path: "play/keep-cut", element: <KeepCutPage /> },
      { path: "play/better-than", element: <BetterThanPage /> },
      { path: "picks", element: <PicksPage /> },
      { path: "picks/control", element: <PicksControlPage /> },
      { path: "picks/setup", element: <PicksSetupPage /> },
      { path: "picks/monitoring", element: <MonitoringInboxPage /> },
      { path: "war-room/join", element: <WarRoomJoinPage /> },
      { path: "war-room", element: <WarRoomPage /> },
      { path: "whats-new", element: <WhatsNewPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
