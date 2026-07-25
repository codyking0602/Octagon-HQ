const UPDATE_RELOAD_KEY = "octagon-hq:update-reload-at";
const UPDATE_RELOAD_COOLDOWN_MS = 15_000;

interface UpdateRecoveryOptions {
  target?: Window;
  storage?: Storage;
  reload?: () => void;
  now?: () => number;
}

export function installUpdateRecovery({
  target = window,
  storage = window.sessionStorage,
  reload = () => window.location.reload(),
  now = () => Date.now(),
}: UpdateRecoveryOptions = {}) {
  const handlePreloadError = (event: Event) => {
    event.preventDefault();

    const current = now();
    const previous = Number(storage.getItem(UPDATE_RELOAD_KEY) ?? "0");
    if (previous > 0 && current - previous < UPDATE_RELOAD_COOLDOWN_MS) return;

    storage.setItem(UPDATE_RELOAD_KEY, String(current));
    reload();
  };

  target.addEventListener("vite:preloadError", handlePreloadError);
  return () => target.removeEventListener("vite:preloadError", handlePreloadError);
}
