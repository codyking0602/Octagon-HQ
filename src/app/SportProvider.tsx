import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type SelectedSport = "ufc" | "football" | "mlb" | "nba";
export type HomeSport = SelectedSport | "all";

// Keep the original key so existing sport preferences migrate without competing storage.
export const SELECTED_SPORT_STORAGE_KEY = "the-hq:selected-sport";

export const SPORT_ORDER: readonly SelectedSport[] = ["football", "ufc", "mlb", "nba"];

export function nextSport(current: SelectedSport, showMlb = true, showNba = true): SelectedSport {
  const available = SPORT_ORDER.filter((sport) => (showMlb || sport !== "mlb") && (showNba || sport !== "nba"));
  return available[(available.indexOf(current) + 1) % available.length] ?? "football";
}

const DEFAULT_SPORT: SelectedSport = "football";

type SportPreferences = {
  home: HomeSport;
  play: SelectedSport;
  picks: SelectedSport;
};

function isSelectedSport(value: unknown): value is SelectedSport {
  return value === "ufc" || value === "football" || value === "mlb" || value === "nba";
}

function isHomeSport(value: unknown): value is HomeSport {
  return value === "all" || isSelectedSport(value);
}

function readPersistedSportPreferences(): SportPreferences {
  const defaults: SportPreferences = { home: DEFAULT_SPORT, play: DEFAULT_SPORT, picks: DEFAULT_SPORT };
  if (typeof window === "undefined") return defaults;

  try {
    const stored = window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY);
    // Migrate the legacy single-sport value without changing anyone's existing default.
    if (isSelectedSport(stored)) return { home: stored, play: stored, picks: stored };
    if (!stored) return defaults;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return defaults;
    const saved = parsed as Partial<SportPreferences>;
    return {
      home: isHomeSport(saved.home) ? saved.home : defaults.home,
      play: isSelectedSport(saved.play) ? saved.play : defaults.play,
      picks: isSelectedSport(saved.picks) ? saved.picks : defaults.picks,
    };
  } catch {
    return defaults;
  }
}

type SportContextValue = {
  homeSport: HomeSport;
  playSport: SelectedSport;
  picksSport: SelectedSport;
  setHomeSport: (sport: HomeSport) => void;
  setPlaySport: (sport: SelectedSport) => void;
  setPicksSport: (sport: SelectedSport) => void;
  /** Compatibility for older sport consumers: this is Play, never the Home preference. */
  selectedSport: SelectedSport;
  setSelectedSport: (sport: SelectedSport) => void;
};

const SportContext = createContext<SportContextValue | null>(null);

export function SportProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<SportPreferences>(readPersistedSportPreferences);

  const updatePreference = useCallback((section: keyof SportPreferences, sport: HomeSport) => {
    setPreferences((current) => {
      if (current[section] === sport) return current;
      const next: SportPreferences = {
        home: section === "home" ? sport : current.home,
        play: section === "play" ? sport as SelectedSport : current.play,
        picks: section === "picks" ? sport as SelectedSport : current.picks,
      };
      try {
        window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage failures must never block in-session section navigation.
      }
      return next;
    });
  }, []);

  const setHomeSport = useCallback((sport: HomeSport) => updatePreference("home", sport), [updatePreference]);
  const setPlaySport = useCallback((sport: SelectedSport) => updatePreference("play", sport), [updatePreference]);
  const setPicksSport = useCallback((sport: SelectedSport) => updatePreference("picks", sport), [updatePreference]);

  const value = useMemo(
    () => ({
      homeSport: preferences.home,
      playSport: preferences.play,
      picksSport: preferences.picks,
      setHomeSport,
      setPlaySport,
      setPicksSport,
      selectedSport: preferences.play,
      setSelectedSport: setPlaySport,
    }),
    [preferences, setHomeSport, setPlaySport, setPicksSport],
  );

  return <SportContext.Provider value={value}>{children}</SportContext.Provider>;
}

export function useSport() {
  const context = useContext(SportContext);

  if (!context) {
    throw new Error("useSport must be used within SportProvider.");
  }

  return context;
}

/** Optional access for independently rendered Home previews and unit tests. */
export function useOptionalSport() {
  return useContext(SportContext);
}
