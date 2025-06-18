import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

export default function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* THIS IS THE FIX: Add the 'relative' class here */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
          <div className="container mx-auto px-4 py-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}