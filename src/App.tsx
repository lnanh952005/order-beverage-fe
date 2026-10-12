import * as React from 'react';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/api/query-client';
import { useAuthStore } from '@/features/auth';
import { router } from './router';
import '@/core/assets/css/App.css';

export function App() {
  React.useEffect(() => {
    void useAuthStore.getState().initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
