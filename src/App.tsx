// frontend/App.tsx

import { RouterProvider } from 'react-router-dom';
import { useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { router } from './routes';
import { PublicAuthProvider } from './context/PublicAuthContext';
import Toaster from './components/ui/Toaster';
import MaintenanceWrapper from './components/maintenance/MaintenanceWrapper';
import { getSettingsData } from './services/settingsService';
// Import the globally managed socket instance
import { socket } from './sockets/socket';

// This should be in your main.tsx, not here.
// const queryClient = new QueryClient(); 

function App() {
  const queryClient = useQueryClient();
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The connection is now managed globally and survives HMR updates.
    // This effect's only job is to add listeners when App mounts
    // and remove them when it unmounts.

    const fetchSettings = async () => {
      try {
        const res = await getSettingsData();
        setMaintenance(res.data.maintenance);
        setMaintenanceMessage(res.data.maintenanceMessage);
        setMaintenanceEndTime(res.data.maintenanceEndTime);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();

    const handleSettingsUpdate = (data: any) => {
      console.log('✅ Socket event received: settingsUpdated', data);
      setMaintenance(data.maintenance);
      setMaintenanceMessage(data.maintenanceMessage);
      setMaintenanceEndTime(data.maintenanceEndTime);
      
      queryClient.setQueryData(['settings'], (oldData: any) => ({
          ...oldData,
          data: { ...oldData?.data, ...data }
      }));
    };

    socket.on('settingsUpdated', handleSettingsUpdate);

    // This cleanup now ONLY removes the listener, it doesn't kill the connection.
    return () => {
      socket.off('settingsUpdated', handleSettingsUpdate);
    };
  }, [queryClient]);

  return (
      <PublicAuthProvider>
        <MaintenanceWrapper
          maintenance={maintenance}
          maintenanceMessage={maintenanceMessage}
          maintenanceEndTime={maintenanceEndTime}
          loading={loading}
        >
          <RouterProvider router={router} />
        </MaintenanceWrapper>
        <Toaster />
      </PublicAuthProvider>
  );
}

export default App;