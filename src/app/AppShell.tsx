import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { BottomNavigation } from "../components/BottomNavigation";
import { RouteLoading } from "../components/RouteLoading";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <BrandMark size="compact" />
        <NavLink
          className={({ isActive }) => (isActive ? "app-ask-action is-active" : "app-ask-action")}
          to="/intelligence"
          aria-label="Ask Octagon Verdict"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5a7.5 7.5 0 1 0 4.9 13.2L21 20l-1.4-4.7A7.5 7.5 0 0 0 12 3.5Z" />
            <path d="M9.6 9.2a2.7 2.7 0 0 1 5.1 1.2c0 1.9-2.7 2-2.7 3.7M12 17.2h.01" />
          </svg>
          <span className="sr-only">Ask Octagon Verdict</span>
        </NavLink>
      </header>

      <main className="app-content">
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>

      <BottomNavigation />
    </div>
  );
}
