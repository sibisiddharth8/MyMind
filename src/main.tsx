import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import clarity from '@microsoft/clarity';

const queryClient = new QueryClient();

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

if (import.meta.env.PROD) {
  // ✅ Initialize Microsoft Clarity
  clarity.init(import.meta.env.VITE_CLARITY_PROJECT_ID);

  // ✅ Initialize Google Analytics (GA4)
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaMeasurementId) {
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(script);

    // Initialize GA dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', gaMeasurementId);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
