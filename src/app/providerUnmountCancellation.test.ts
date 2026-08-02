import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const whatsNewProvider = readFileSync(
  "src/features/whats-new/WhatsNewProvider.tsx",
  "utf8",
);
const picksProvider = readFileSync(
  "src/features/picks/PicksProvider.tsx",
  "utf8",
);

const unmountCancellation = `useEffect(() => () => {
    ++revisionRef.current;
    profileIdRef.current = null;
  }, []);`;

function occurrences(value: string, needle: string) {
  return value.split(needle).length - 1;
}

describe("provider work cancellation on unmount", () => {
  it("invalidates the existing What's New revision owner exactly once", () => {
    expect(occurrences(whatsNewProvider, unmountCancellation)).toBe(1);
    expect(whatsNewProvider).toContain(
      "revision !== revisionRef.current || profileIdRef.current !== expectedProfileId",
    );
    expect(whatsNewProvider).toContain(
      "if (profileIdRef.current !== expectedProfileId) return false;",
    );
    expect(whatsNewProvider).not.toContain("mountedRef");
    expect(whatsNewProvider).not.toContain("AbortController");
  });

  it("invalidates the existing Picks revision and identity owner exactly once", () => {
    expect(occurrences(picksProvider, unmountCancellation)).toBe(1);
    expect(picksProvider).toContain("if (revision !== revisionRef.current) return;");
    expect(picksProvider).toContain(
      "revision !== revisionRef.current || profileIdRef.current !== expectedProfileId",
    );
    expect(picksProvider).toContain(
      "if (profileIdRef.current !== expectedProfileId) return;",
    );
    expect(picksProvider).not.toContain("mountedRef");
    expect(picksProvider).not.toContain("AbortController");
  });

  it("does not add another repository, provider, or refresh owner", () => {
    expect(occurrences(whatsNewProvider, "createWhatsNewRepository()")).toBe(1);
    expect(occurrences(picksProvider, "createPicksRepository()")).toBe(1);
    expect(occurrences(whatsNewProvider, "const loadSnapshot = useCallback")).toBe(1);
    expect(occurrences(picksProvider, "const refresh = useCallback")).toBe(1);
  });
});
