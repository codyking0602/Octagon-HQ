import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "./AppShell";

const HomePage = lazy(() => import("../features/home/HomePage"));
const RankingsPage = lazy(() => import("../features/rankings/RankingsPage"));
const FighterProfilePage = lazy(() => import("../features/rankings/FighterProfilePage"));
const IntelligencePage = lazy(() => import("../features/intelligence/IntelligencePage"));
const PlayPage = lazy(() => import("../features/play/PlayPage"));
const WavelengthPage = lazy(() => import("../features/play/WavelengthPage"));
const BlindResumePage = lazy(() => import("../features/play/BlindResumePage"));
const BlindRankPage = lazy(() => import("../features/play/BlindRankPage"));
const PlaceholderPage = lazy(() => import("../features/placeholders/PlaceholderPage"));

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "rankings", element: <RankingsPage /> },
      { path: "fighters/:slug", element: <FighterProfilePage /> },
      { path: "intelligence", element: <IntelligencePage /> },
      { path: "play", element: <PlayPage /> },
      { path: "play/find-leader", element: <PlayPage /> },
      { path: "play/wavelength", element: <WavelengthPage /> },
      { path: "play/blind-resume", element: <BlindResumePage /> },
      { path: "play/blind-rank", element: <BlindRankPage /> },
      { path: "picks", element: <PlaceholderPage title="Picks" eyebrow="EVENT PICKS" /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
