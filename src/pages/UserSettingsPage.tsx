import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiActivity, FiSettings } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { usePublicAuth } from '../context/PublicAuthContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import ActivitySettings from '../components/settings/ActivitySettings';
import UserAvatar from '../components/ui/UserAvatar';
import apiClient from '../services/apiClient';

type TabType = 'profile' | 'security' | 'activity';

// Fetch current user profile from backend
const fetchUserProfile = async () => {
  const { data } = await apiClient.get('/profile');
  return data.user;
};

export default function UserSettingsPage() {
  const { user, refreshUser } = usePublicAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Fetch fresh user data when page loads
  const { data: freshUserData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onSuccess: (data) => {
      // Update context with fresh data from backend
      refreshUser(data);
    }
  });

  // Use fresh data if available, otherwise use context data
  const displayUser = freshUserData || user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
            <div className="hidden w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:flex items-center justify-center shadow-lg flex-shrink-0">
              <FiSettings className="text-white text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Account Settings</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Manage your profile, security, and activity preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-72 shrink-0"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
          {/* User Info Card */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0 border-2 border-white/30 overflow-hidden bg-white/20">
                    <UserAvatar
                      src={user?.profileImage ? `${user.profileImage}?t=${Date.now()}` : user?.profileImage}
                      alt={user?.name}
                      size="lg"
                      className="w-full h-full"
                    />
                    <p className="text-xs sm:text-sm text-blue-100 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="p-2 sm:p-3">
                <TabButton
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  icon={<FiUser />}
                  label="Profile"
                  description="Edit your details"
                />
                {/* Hide Security tab for Google Users */}
                {!user?.googleId && (
                  <TabButton
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                    icon={<FiLock />}
                    label="Security"
                    description="Change password"
                  />
                )}
                <TabButton
                  active={activeTab === 'activity'}
                  onClick={() => setActiveTab('activity')}
                  icon={<FiActivity />}
                  label="My Activity"
                  description="Comments & likes"
                />
              </nav>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProfileSettings user={displayUser} refreshUser={refreshUser} />
                  </motion.div>
                )}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SecuritySettings />
                  </motion.div>
                )}
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActivitySettings />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const TabButton = ({ active, onClick, icon, label, description }: TabButtonProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`cursor-pointer relative w-full flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 mb-2
      ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
  >
    <div
      className={`mt-0.5 text-lg sm:text-xl flex-shrink-0 ${
        active ? 'text-white' : 'text-slate-400'
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-xs sm:text-sm">{label}</div>
      <div
        className={`text-xs mt-0.5 ${
          active ? 'text-blue-100' : 'text-slate-500'
        }`}
      >
        {description}
      </div>
    </div>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-full flex-shrink-0"
      />
    )}
  </motion.button>
);
