import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: 'font-semibold',
        style: {
          border: '1px solid #e2e8f0', // slate-200
          padding: '16px',
          color: '#1e293b', // slate-800
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22c55e', // green-500
            secondary: 'white',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: 'white',
          },
        }
      }}
    />
  );
}