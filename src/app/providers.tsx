import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { ChallengeProvider } from "../features/challenges/ChallengeProvider";
import { IdentityProvider } from "../features/identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "../features/play/FindLeaderHistoryProvider";
import { PicksProvider } from "../features/picks/PicksProvider";
import { ProfilePreferencesProvider } from "../features/profile/ProfilePreferencesProvider";
import { WarRoomProvider } from "../features/war-room/WarRoomProvider";
import { WhatsNewProvider } from "../features/whats-new/WhatsNewProvider";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <IdentityProvider>
        <WhatsNewProvider>
          <WarRoomProvider>
            <ProfilePreferencesProvider>
              <PicksProvider>
                <FindLeaderHistoryProvider>
                  <ChallengeProvider>{children}</ChallengeProvider>
                </FindLeaderHistoryProvider>
              </PicksProvider>
            </ProfilePreferencesProvider>
          </WarRoomProvider>
        </WhatsNewProvider>
      </IdentityProvider>
    </QueryClientProvider>
  );
}
