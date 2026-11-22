import { useEffect, useState, type PropsWithChildren } from "react";
import { Link, Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { getSupabaseClient } from "../../lib/supabase";
import "../../styles/crowns.css";

export interface CrownsAccessState {
  can_view: boolean;
  is_owner: boolean;
  is_public: boolean;
  loading: boolean;
}

export function useCrownsAccess(): CrownsAccessState {
  const identity = useIdentity();
  const [access, setAccess] = useState<CrownsAccessState>({
    can_view: false, is_owner: false, is_public: false, loading: true,
  });

  useEffect(() => {
    if (!identity.ready) return;
    let active = true;
    setAccess({ can_view: false, is_owner: false, is_public: false, loading: true });
    const client = getSupabaseClient();
    if (!client) {
      setAccess({ can_view: false, is_owner: false, is_public: false, loading: false });
      return;
    }
    void client.rpc("crowns_access").then(({ data, error }) => {
      if (!active) return;
      const result = !error && data && typeof data === "object"
        ? data as Partial<CrownsAccessState> : {};
      setAccess({
        can_view: result.can_view === true,
        is_owner: result.is_owner === true,
        is_public: result.is_public === true,
        loading: false,
      });
    });
    return () => { active = false; };
  }, [identity.ready, identity.profile?.id]);

  return access;
}

// Exact transparent vector trace of the owner's supplied three-point crown,
// including the intentionally detached lower chevron.
function CrownMark() {
  return (
    <svg viewBox="25 42 652 469" aria-hidden="true" fill="currentColor" focusable="false">
      <path d="M161,468 170,495 175,502 350,464 526,502 532,495 540,472 540,467 533,463 354,423 340,424 165,464Z" />
      <path d="M40,173 36,182 36,196 42,210 54,219 76,222 79,226 149,435 156,447 344,411 364,412 547,447 624,224 627,221 641,221 654,216 662,207 666,194 664,177 655,164 642,158 620,160 608,170 604,178 602,190 606,207 461,309 367,112 382,94 383,78 380,68 371,57 357,51 341,52 333,56 321,70 320,93 335,114 241,309 99,210 96,204 100,184 96,173 88,164 76,158 60,158 50,162Z" />
    </svg>
  );
}

export function CrownsHeaderLink() {
  const access = useCrownsAccess();
  if (!access.can_view || access.loading) return null;
  return (
    <Link className="crowns-header-link" to="/crowns" aria-label="Open CROWNS Card Company" title="CROWNS Card Company">
      <CrownMark />
    </Link>
  );
}

export function CrownsRouteGate({ children }: PropsWithChildren) {
  const access = useCrownsAccess();
  if (access.loading) return <main className="crowns-gate-loading">Opening CROWNS…</main>;
  return access.can_view ? <>{children}</> : <Navigate to="/" replace />;
}
