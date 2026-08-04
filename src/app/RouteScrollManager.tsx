import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function scrollPageToTop(behavior: ScrollBehavior = "auto") {
  window.scrollTo({ top: 0, left: 0, behavior });
}

export function RouteScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (location.hash) return;
    scrollPageToTop();
  }, [location.hash, location.pathname, location.search]);

  return null;
}
