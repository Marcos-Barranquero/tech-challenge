"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, useTrpcClient } from "@/lib/trpc";
import { Toaster } from "react-hot-toast";
import { type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLocaleStore } from "@/stores/locale.store";
import { messages } from "@/i18n/messages";
import { useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const { queryClient, trpcClient } = useTrpcClient();
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
        </NextIntlClientProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
