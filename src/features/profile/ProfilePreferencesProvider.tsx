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
  type FootballTeam,
  type ProfilePreferencesRepository,
} from "./profilePreferencesRepository";

interface ProfilePreferencesContextValue {
  configured: boolean;
  avatarConfigured: boolean;
  footballTeamConfigured: boolean;
  loading: boolean;
  saving: boolean;
  savingAvatar: boolean;
  savingFootballTeam: boolean;
  error: string;
  favoriteFighterSlug: string | null;
  avatarPhotoData: string | null;
  footballTeam: FootballTeam | null;
  refresh: () => Promise<void>;
  setFavoriteFighter: (fighterSlug: string | null) => Promise<void>;
  setAvatarPhoto: (photoData: string | null) => Promise<void>;
  setFootballTeam: (team: FootballTeam) => Promise<void>;
}

const ProfilePreferencesContext = createContext<ProfilePreferencesContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "The HQ could not update that profile preference.";
}

export function ProfilePreferencesProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: ProfilePreferencesRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const lastRefreshAtRef = useRef(0);
  const [repository] = useState<ProfilePreferencesRepository | null>(() => (
    suppliedRepository === undefined
      ? createProfilePreferencesRepository()
      : suppliedRepository
  ));
  const [favoriteFighterSlug, setFavoriteFighterSlug] = useState<string | null>(null);
  const [avatarPhotoData, setAvatarPhotoData] = useState<string | null>(null);
  const [footballTeam, setFootballTeamValue] = useState<FootballTeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingFootballTeam, setSavingFootballTeam] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      setFavoriteFighterSlug(null);
      setAvatarPhotoData(null);
      setFootballTeamValue(null);
      setLoading(false);
      setError("");
      return;
    }

    if (!repository) {
      setFavoriteFighterSlug(null);
      setAvatarPhotoData(null);
      setFootballTeamValue(null);
      setLoading(false);
      setError("Profile preferences are not connected on this build.");
      return;
    }

    lastRefreshAtRef.current = Date.now();
    setLoading(true);
    try {
      // Production uses one RPC. Keep injected mock repositories compatible.
      const snapshot = repository.loadSnapshot
        ? await repository.loadSnapshot()
        : await Promise.all([
          repository.loadFavoriteFighter(),
          repository.loadAvatarPhoto ? repository.loadAvatarPhoto() : Promise.resolve(null),
          repository.loadFootballTeam ? repository.loadFootballTeam() : Promise.resolve(null),
        ]).then(([favoriteFighterSlug, avatarPhotoData, footballTeam]) => ({
          favoriteFighterSlug,
          avatarPhotoData,
          footballTeam,
        }));
      if (profileIdRef.current !== expectedProfileId) return;
      setFavoriteFighterSlug(snapshot.favoriteFighterSlug);
      setAvatarPhotoData(snapshot.avatarPhotoData);
      setFootballTeamValue(snapshot.footballTeam);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      lastRefreshAtRef.current = 0; // Retry on the next foreground event.
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoading(false);
    }
  }, [profileId, repository]);

  useEffect(() => {
    lastRefreshAtRef.current = 0;
    setSaving(false);
    setSavingAvatar(false);
    setSavingFootballTeam(false);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profileId || !repository) return undefined;
    // Don't redownload the full base64 avatar for quick app switches.
    const refreshIfStale = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAtRef.current < 10 * 60_000) return;
      void refresh();
    };
    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", refreshIfStale);
    return () => {
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", refreshIfStale);
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

  const setAvatarPhoto = useCallback(async (photoData: string | null) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      identity.openDialog();
      return;
    }
    if (!repository?.saveAvatarPhoto) {
      const missingError = new Error("Profile photo uploads are not connected on this build.");
      setError(missingError.message);
      throw missingError;
    }

    setSavingAvatar(true);
    try {
      const avatar = await repository.saveAvatarPhoto(photoData);
      if (profileIdRef.current !== expectedProfileId) return;
      setAvatarPhotoData(avatar);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
      throw nextError;
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingAvatar(false);
    }
  }, [identity.openDialog, profileId, repository]);

  const setFootballTeam = useCallback(async (team: FootballTeam) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      identity.openDialog();
      return;
    }
    if (!repository?.saveFootballTeam) {
      const missingError = new Error("Football team preferences are not connected on this build.");
      setError(missingError.message);
      throw missingError;
    }

    setSavingFootballTeam(true);
    try {
      const savedTeam = await repository.saveFootballTeam(team);
      if (profileIdRef.current !== expectedProfileId) return;
      setFootballTeamValue(savedTeam);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
      throw nextError;
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingFootballTeam(false);
    }
  }, [identity.openDialog, profileId, repository]);

  return (
    <ProfilePreferencesContext.Provider value={{
      configured: Boolean(repository),
      avatarConfigured: Boolean(repository?.saveAvatarPhoto),
      footballTeamConfigured: Boolean(repository?.saveFootballTeam),
      loading,
      saving,
      savingAvatar,
      savingFootballTeam,
      error,
      favoriteFighterSlug,
      avatarPhotoData,
      footballTeam,
      refresh,
      setFavoriteFighter,
      setAvatarPhoto,
      setFootballTeam,
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
