import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useIdentity } from "../features/identity/IdentityProvider";
import { AppProviders } from "./providers";
import { appRouter } from "./router";
import { BootScreen } from "./BootScreen";

async function waitForFirstPaint(): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function AppRuntime() {
  const identity = useIdentity();
  const [paintReady, setPaintReady] = useState(false);

  useEffect(() => {
    let active = true;

    void waitForFirstPaint().finally(() => {
      if (active) setPaintReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return !paintReady || !identity.ready
    ? <BootScreen />
    : <RouterProvider router={appRouter} />;
}

export function App() {
  return (
    <AppProviders>
      <AppRuntime />
    </AppProviders>
  );
}
