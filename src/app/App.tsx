import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
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

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void waitForFirstPaint().finally(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppProviders>
      {!ready ? <BootScreen /> : <RouterProvider router={appRouter} />}
    </AppProviders>
  );
}
