// app/providers.tsx

"use client";

import { ReactNode, useMemo, useState } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TelegramProvider } from "@/contexts/TelegramContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      }),
  );

  const manifestUrl = useMemo(
    () => `${process.env.NEXT_PUBLIC_DOMAIN}/tonconnect-manifest.json`,
    [],
  );

  return (
    <TelegramProvider>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        analytics={{ mode: "off" }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </TonConnectUIProvider>
    </TelegramProvider>
  );
}
