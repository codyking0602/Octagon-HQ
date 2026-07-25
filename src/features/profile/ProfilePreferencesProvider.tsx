import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const [repository] = useState<ProfilePreferencesRepository | null>(() => (
    suppliedRepository === undefined
      ? createProfilePreferencesRepository()
      : suppliedRepository
  ));
  const [favoriteFighterSlug, setFavoriteFighterSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
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
      const favorite = await repository.loadFavoriteFighter();
      if (profileIdRef.current !== expectedProfileId) return;
      setFavoriteFighterSlug(favorite);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoading(false);
    }
  }, [profileId, repository]);

  useEffect(() => {
    setSaving(false);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profileId || !repository) return undefined;
    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [profileId, refresh, repository]);

  const setFavoriteFighter = useCallback(async (fighterSlug: string | null) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      identity.openDialog();
      return;
    }
    if (!repository) {
      setError("Profile preferences are not connected on this build.");
      return;
    }

    setSaving(true);
    try {
      const favorite = await repository.saveFavoriteFighter(fighterSlug);
      if (profileIdRef.current !== expectedProfileId) return;
      setFavoriteFighterSlug(favorite);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setSaving(false);
    }
  }, [identity.openDialog, profileId, repository]);

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
