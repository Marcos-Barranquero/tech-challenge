"use client";

import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@tech-challenge/api/router";
import superjson from "superjson";
import { useState } from "react";

export const trpc = createTRPCReact<AppRouter>();

export function useTrpcClient() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/trpc`,
          transformer: superjson
        })
      ]
    })
  );

  return { queryClient, trpcClient };
}
