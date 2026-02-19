"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, useTrpcClient } from "@/lib/trpc";
import { Toaster } from "react-hot-toast";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const { queryClient, trpcClient } = useTrpcClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
