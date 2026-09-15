'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '@/types/api';
import { SessionProvider } from './session-provider';

/**
 * `staleTime` 30 giây: dữ liệu quản trị không đổi từng giây, và mỗi lần refetch
 * là một request. Màn nào cần nhịp khác thì đặt riêng ở query đó.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          // Không retry lỗi 4xx: thử lại cũng ra kết quả đó.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        // Thao tác ghi KHÔNG tự retry — người dùng cần biết thao tác hỏng để quyết định.
        retry: false,
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  // useState để mỗi lần render lại không dựng QueryClient mới — dựng mới là mất cache.
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
