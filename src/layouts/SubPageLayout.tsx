import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSettings, FiLogOut, FiLogIn } from 'react-icons/fi';
import { FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';
import Footer from './Footer';
import NyraChatbot from '../components/NyraChatbot';
import UserAvatar from '../components/ui/UserAvatar';
import PublicAuthModal from '../components/contact/PublicAuthModal';
import { usePublicAuth } from '../context/PublicAuthContext';

export default function SubPageLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = usePublicAuth();
  const [showDropdown, setShowDropdown] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-2 flex items-center justify-between">
          <div>
          <button 
            onClick={() => navigate(-1)}
            className="font-semibold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <FiArrowLeft />
            Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="ml-4 font-semibold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <FaHome />
            Home
          </button>
          </div>

          {/* User Profile / Login Section */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <UserAvatar
                  src={user.profileImage ? `${user.profileImage}?t=${Date.now()}` : user.profileImage}
                  alt={user.name}
                  size="sm"
                />
                {/* <span className="hidden sm:block font-medium text-slate-700">{user.name}</span> */}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-3">
                      <div className='w-7 h-7 rounded-full'>
                        {user.profileImage? <img className='rounded-full' src={user.profileImage} alt={user.name} /> : <UserAvatar
                          src={user.profileImage ? `${user.profileImage}?t=${Date.now()}` : user.profileImage}
                          alt={user.name}
                          size="sm"
                        />}
                      </div>
                      <div>
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* blogs */}
                      <Link
                        to="/blogs"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FiBookOpen className="text-slate-500" />
                        <span>Blogs</span>
                      </Link>
                      <Link
                        to="/user-settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FiSettings className="text-slate-500" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="cursor-pointer group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg overflow-hidden"
            >
              <FiLogIn className="relative z-10" />
              <span className="relative z-10">Sign In</span>
            </button>
          )}
        </div>
      </header>

        {/* Auth Modal */}
        <PublicAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <main>
        {/* The child page (e.g., ProjectsPage) will be rendered here */}
        <Outlet />
      </main>
      <NyraChatbot />
      <Footer />
    </div>
  );
}