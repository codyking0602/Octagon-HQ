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

// Keep the established key as the Play preference for existing users.
export const SELECTED_SPORT_STORAGE_KEY = "the-hq:selected-sport";
export const PICKS_SPORT_STORAGE_KEY = "the-hq:picks-sport";
export const HOME_SPORT_STORAGE_KEY = "the-hq:home-sport";
export const LAST_USED_SPORT_STORAGE_KEY = "the-hq:last-used-sport";

export const SPORT_ORDER: readonly SelectedSport[] = ["football", "ufc", "nba", "mlb"];

export function nextSport(current: SelectedSport, showMlb = true, showNba = true, order: readonly SelectedSport[] = SPORT_ORDER): SelectedSport {
  const available = order.filter((sport) => (showMlb || sport !== "mlb") && (showNba || sport !== "nba"));
  return available[(available.indexOf(current) + 1) % available.length] ?? "football";
}

const DEFAULT_SPORT: SelectedSport = "football";

function isSelectedSport(value: string | null): value is SelectedSport {
  return value === "ufc" || value === "football" || value === "mlb" || value === "nba";
}

function readPersistedSport(): SelectedSport {
  if (typeof window === "undefined") return DEFAULT_SPORT;

  try {
    const storedSport = window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY);
    return isSelectedSport(storedSport) ? storedSport : DEFAULT_SPORT;
  } catch {
    return DEFAULT_SPORT;
  }
}

// Snapshot the old shared preference once during migration, so later Play/Picks
// navigation cannot change Home or the other section after a reload.
function readSectionSport(key: string): SelectedSport {
  const legacySport = readPersistedSport();
  if (typeof window === "undefined") return legacySport;
  try {
    const stored = window.localStorage.getItem(key);
    if (isSelectedSport(stored)) return stored;
    window.localStorage.setItem(key, legacySport);
  } catch {
    // The selection still works in memory when storage is unavailable.
  }
  return legacySport;
}

function readLastUsedSport(): SelectedSport {
  if (typeof window === "undefined") return DEFAULT_SPORT;
  try {
    const stored = window.localStorage.getItem(LAST_USED_SPORT_STORAGE_KEY);
    if (isSelectedSport(stored)) return stored;
    const priorPicks = window.localStorage.getItem(PICKS_SPORT_STORAGE_KEY);
    if (isSelectedSport(priorPicks)) return priorPicks;
  } catch {
    // Local storage is optional.
  }
  return readPersistedSport();
}

function readHomeSport(): HomeSport {
  if (typeof window === "undefined") return DEFAULT_SPORT;
  try {
    const stored = window.localStorage.getItem(HOME_SPORT_STORAGE_KEY);
    if (stored === "all" || isSelectedSport(stored)) return stored;
  } catch {
    // Fall back to the existing preference.
  }
  return readSectionSport(HOME_SPORT_STORAGE_KEY);
}

function persistSport(key: string, sport: HomeSport) {
  try {
    window.localStorage.setItem(key, sport);
  } catch {
    // Persistence should never prevent in-session navigation.
  }
}

type SportContextValue = {
  /** Play selection, preserving the historical selectedSport API and key. */
  selectedSport: SelectedSport;
  setSelectedSport: (sport: SelectedSport) => void;
  picksSport: SelectedSport;
  setPicksSport: (sport: SelectedSport) => void;
  homeSport: HomeSport;
  setHomeSport: (sport: HomeSport) => void;
  lastUsedSport: SelectedSport;
};

const SportContext = createContext<SportContextValue | null>(null);

export function SportProvider({ children }: PropsWithChildren) {
  const [selectedSport, setSelectedSportState] = useState<SelectedSport>(readPersistedSport);
  const [picksSport, setPicksSportState] = useState<SelectedSport>(() => readSectionSport(PICKS_SPORT_STORAGE_KEY));
  const [homeSport, setHomeSportState] = useState<HomeSport>(readHomeSport);
  const [lastUsedSport, setLastUsedSport] = useState<SelectedSport>(readLastUsedSport);

  const rememberSport = useCallback((sport: SelectedSport) => {
    setLastUsedSport(sport);
    persistSport(LAST_USED_SPORT_STORAGE_KEY, sport);
  }, []);

  const setSelectedSport = useCallback((sport: SelectedSport) => {
    setSelectedSportState(sport);
    persistSport(SELECTED_SPORT_STORAGE_KEY, sport);
    rememberSport(sport);
  }, [rememberSport]);

  const setPicksSport = useCallback((sport: SelectedSport) => {
    setPicksSportState(sport);
    persistSport(PICKS_SPORT_STORAGE_KEY, sport);
    rememberSport(sport);
  }, [rememberSport]);

  const setHomeSport = useCallback((sport: HomeSport) => {
    setHomeSportState(sport);
    persistSport(HOME_SPORT_STORAGE_KEY, sport);
  }, []);

  const value = useMemo(
    () => ({ selectedSport, setSelectedSport, picksSport, setPicksSport, homeSport, setHomeSport, lastUsedSport }),
    [selectedSport, setSelectedSport, picksSport, setPicksSport, homeSport, setHomeSport, lastUsedSport],
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
