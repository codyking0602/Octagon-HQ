import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { ChallengeProvider } from "../features/challenges/ChallengeProvider";
import { IdentityProvider } from "../features/identity/IdentityProvider";

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
        <ChallengeProvider>{children}</ChallengeProvider>
      </IdentityProvider>
    </QueryClientProvider>
  );
}
