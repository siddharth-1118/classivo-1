"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
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
  const [isMounted, setIsMounted] = React.useState(false);

  // Initialize state after mount to prevent hydration mismatch
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

  // Show loading state until component is mounted
  if (!isMounted) {
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

