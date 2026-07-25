import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createProfilePreferencesRepository,
  type ProfilePreferencesRepository,
} from "./profilePreferencesRepository";

interface ProfilePreferencesContextValue {
  configured: boolean;
  loading: boolean;
  saving: boolean;
  error: string;
  favoriteFighterSlug: string | null;
  refresh: () => Promise<void>;
  setFavoriteFighter: (fighterSlug: string | null) => Promise<void>;
}

const ProfilePreferencesContext = createContext<ProfilePreferencesContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not update that profile preference.";
}

export function ProfilePreferencesProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: ProfilePreferencesRepository | null }>) {
  const identity = useIdentity();
  const initialRepository = suppliedRepository === undefined
    ? createProfilePreferencesRepository()
    : suppliedRepository;
  const [repository] = useState<ProfilePreferencesRepository | null>(initialRepository);
  const [favoriteFighterSlug, setFavoriteFighterSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!identity.profile) {
      setFavoriteFighterSlug(null);
      setLoading(false);
      setError("");
      return;
    }

    if (!repository) {
      setFavoriteFighterSlug(null);
      setLoading(false);
      setError("Profile preferences are not connected on this build.");
      return;
    }

    setLoading(true);
    try {
      setFavoriteFighterSlug(await repository.loadFavoriteFighter());
      setError("");
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setLoading(false);
    }
  }, [identity.profile, repository]);

  useEffect(() => {
    void refresh();
  }, [identity.profile?.id, refresh]);

  const setFavoriteFighter = useCallback(async (fighterSlug: string | null) => {
    if (!identity.profile) {
      identity.openDialog();
      return;
    }
    if (!repository) {
      setError("Profile preferences are not connected on this build.");
      return;
    }

    setSaving(true);
    try {
      setFavoriteFighterSlug(await repository.saveFavoriteFighter(fighterSlug));
      setError("");
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setSaving(false);
    }
  }, [identity, repository]);

  return (
    <ProfilePreferencesContext.Provider value={{
      configured: Boolean(repository),
      loading,
      saving,
      error,
      favoriteFighterSlug,
      refresh,
      setFavoriteFighter,
    }}>
      {children}
    </ProfilePreferencesContext.Provider>
  );
}

export function useProfilePreferences() {
  const value = useContext(ProfilePreferencesContext);
  if (!value) throw new Error("useProfilePreferences must be used inside ProfilePreferencesProvider");
  return value;
}
