import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type SelectedSport = "ufc" | "football";

export const SELECTED_SPORT_STORAGE_KEY = "the-hq:selected-sport";

const DEFAULT_SPORT: SelectedSport = "ufc";

function isSelectedSport(value: string | null): value is SelectedSport {
  return value === "ufc" || value === "football";
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

type SportContextValue = {
  selectedSport: SelectedSport;
  setSelectedSport: (sport: SelectedSport) => void;
};

const SportContext = createContext<SportContextValue | null>(null);

export function SportProvider({ children }: PropsWithChildren) {
  const [selectedSport, setSelectedSportState] = useState<SelectedSport>(readPersistedSport);

  const setSelectedSport = useCallback((sport: SelectedSport) => {
    setSelectedSportState(sport);

    try {
      window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, sport);
    } catch {
      // Persistence should never prevent the in-session sport selection from changing.
    }
  }, []);

  const value = useMemo(
    () => ({ selectedSport, setSelectedSport }),
    [selectedSport, setSelectedSport],
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
