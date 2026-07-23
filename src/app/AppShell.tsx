import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { BottomNavigation } from "../components/BottomNavigation";
import { RouteLoading } from "../components/RouteLoading";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <BrandMark size="compact" />
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
