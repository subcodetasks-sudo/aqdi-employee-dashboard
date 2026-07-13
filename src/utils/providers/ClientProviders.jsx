'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CounterProvider } from '@/src/Context/CounterContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function ClientProviders({ children }) {
  // create QueryClient on the client only and persist it across renders
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
        <CounterProvider>
          {children}
          <Toaster position="top-center" richColors closeButton/>
        </CounterProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
