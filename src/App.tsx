import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from '@/shared/api/query-client';
import { env } from '@/core/config/env';
import { AuthProvider } from '@/features/auth';
import { router } from './router';
import '@/core/assets/css/App.css';

export function App() {
  const content = (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {env.VITE_GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
}

export default App;
