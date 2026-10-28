import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { forceRefreshLatestBuild, recoverRouteLoadError } from "./installUpdateRecovery";

export default function AppRouteError() {
  const error = useRouteError();

  useEffect(() => {
    recoverRouteLoadError({ error });
  }, [error]);

  return (
    <main className="app-error" role="alert">
      <img src="/assets/app-icon.png" alt="" aria-hidden="true" />
      <p className="eyebrow">OCTAGON HQ UPDATE</p>
      <h1>Refresh to load the latest build</h1>
      <p>The app changed while this page was open. Your profile and saved picks are safe.</p>
      <button className="primary-action" type="button" onClick={() => forceRefreshLatestBuild()}>
        REFRESH OCTAGON HQ
      </button>
    </main>
  );
}
