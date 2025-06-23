import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { PublicAuthProvider } from './context/PublicAuthContext'; // <-- Import the provider
import Toaster from './components/ui/Toaster';

// Create a client for react-query
const queryClient = new QueryClient();

function App() {
  return (
    // We must wrap the entire application in our providers
    <QueryClientProvider client={queryClient}>
      <PublicAuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </PublicAuthProvider>
    </QueryClientProvider>
  );
}

export default App;