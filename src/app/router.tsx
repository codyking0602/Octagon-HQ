import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "./AppShell";

const HomePage = lazy(() => import("../features/home/HomePage"));
const PlaceholderPage = lazy(() => import("../features/placeholders/PlaceholderPage"));

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "rankings", element: <PlaceholderPage title="Rankings" eyebrow="UFC ALL-TIME" /> },
      { path: "play", element: <PlaceholderPage title="Play" eyebrow="GAMES & CHALLENGES" /> },
      { path: "picks", element: <PlaceholderPage title="Picks" eyebrow="EVENT PICKS" /> },
      { path: "intelligence", element: <PlaceholderPage title="Intelligence" eyebrow="SETTLE THE DEBATE" /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
