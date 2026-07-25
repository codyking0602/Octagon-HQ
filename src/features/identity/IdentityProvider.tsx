import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { createIdentityGateway, type IdentityGateway, type IdentitySession } from "./identityGateway";
import { parseIdentityCredentials, type IdentityProfile } from "./identityModel";

export type IdentityStatus = "loading" | "unconfigured" | "signed-out" | "ready" | "error";

interface IdentityContextValue {
  status: IdentityStatus;
  ready: boolean;
  profile: IdentityProfile | null;
  busy: boolean;
  error: string;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  clearError: () => void;
  signIn: (displayName: string, pin: string) => Promise<boolean>;
  createProfile: (displayName: string, pin: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not complete that request.";
}

export function IdentityProvider({
  children,
  gateway: suppliedGateway,
}: PropsWithChildren<{ gateway?: IdentityGateway | null }>) {
  const initialGateway = suppliedGateway === undefined ? createIdentityGateway() : suppliedGateway;
  const [gateway] = useState<IdentityGateway | null>(initialGateway);
  const [status, setStatus] = useState<IdentityStatus>(() => gateway ? "loading" : "unconfigured");
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!gateway) return undefined;
    const activeGateway = gateway;
    let active = true;
    let revision = 0;

    async function applySession(session: IdentitySession | null) {
      const current = ++revision;
      if (!session) {
        if (active) {
          setProfile(null);
          setStatus("signed-out");
        }
        return;
      }

      try {
        const nextProfile = await activeGateway.loadProfile(session.userId);
        if (!active || current !== revision) return;
        if (!nextProfile) {
          setProfile(null);
          setStatus("error");
          setError("This account does not have an Octagon HQ profile yet.");
          return;
        }
        setProfile(nextProfile);
        setStatus("ready");
        setError("");
        setDialogOpen(false);
      } catch (nextError) {
        if (!active || current !== revision) return;
        setProfile(null);
        setStatus("error");
        setError(errorMessage(nextError));
      }
    }

    void activeGateway.getSession()
      .then((session) => applySession(session))
      .catch((nextError) => {
        if (!active) return;
        setStatus("error");
        setError(errorMessage(nextError));
      });

    const unsubscribe = activeGateway.subscribe((session) => {
      void applySession(session);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [gateway]);

  async function authenticate(
    action: "signIn" | "createProfile",
    displayName: string,
    pin: string,
  ) {
    if (!gateway) {
      setError("Profiles are not connected on this build yet.");
      return false;
    }

    const parsed = parseIdentityCredentials(displayName, pin);
    if (!parsed.success) {
      setError(parsed.error);
      return false;
    }

    setBusy(true);
    setError("");
    try {
      if (action === "signIn") {
        await gateway.signIn(parsed.data.displayName, parsed.data.pin);
      } else {
        await gateway.createProfile(parsed.data.displayName, parsed.data.pin);
      }
      const session = await gateway.getSession();
      if (!session) throw new Error("The profile was not signed in.");
      const nextProfile = await gateway.loadProfile(session.userId);
      if (!nextProfile) throw new Error("The profile could not be loaded.");
      setProfile(nextProfile);
      setStatus("ready");
      setDialogOpen(false);
      return true;
    } catch (nextError) {
      setError(errorMessage(nextError));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!gateway) return;
    setBusy(true);
    setError("");
    try {
      await gateway.signOut();
      setProfile(null);
      setStatus("signed-out");
      setDialogOpen(false);
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  const value: IdentityContextValue = {
    status,
    ready: status !== "loading",
    profile,
    busy,
    error,
    dialogOpen,
    openDialog: () => setDialogOpen(true),
    closeDialog: () => {
      setDialogOpen(false);
      setError("");
    },
    clearError: () => setError(""),
    signIn: (displayName, pin) => authenticate("signIn", displayName, pin),
    createProfile: (displayName, pin) => authenticate("createProfile", displayName, pin),
    signOut,
  };

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error("useIdentity must be used inside IdentityProvider");
  return value;
}
