// frontend/components/maintenance/MaintenanceWrapper.tsx
import React from 'react';
import MaintenanceSection from './MaintenanceSection';
import Loader from '../ui/Loader';

interface Props {
  children: React.ReactNode;
  maintenance: boolean;
  maintenanceMessage: string;
  maintenanceEndTime: string | null;
  loading?: boolean;
}

const MaintenanceWrapper: React.FC<Props> = ({ children, maintenance, maintenanceMessage, maintenanceEndTime, loading }) => {
  if (loading) return <Loader />;
  if (maintenance) {
    return <MaintenanceSection message={maintenanceMessage} endTime={maintenanceEndTime} />;
  }
  return <>{children}</>;
};

export default MaintenanceWrapper;