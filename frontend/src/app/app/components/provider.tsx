"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { usePathname } from "next/navigation";
import Loading from "../loading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize query client and persister
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStoragePersister = createAsyncStoragePersister({
        storage: window.localStorage,
      });

      persistQueryClient({
        persister: localStoragePersister,
        queryClient,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        buster: "v1.0.2",
      });
    }
  }, []);

  const isProtectedRoute = pathname?.startsWith("/app");

  if (!isMounted && isProtectedRoute) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;

