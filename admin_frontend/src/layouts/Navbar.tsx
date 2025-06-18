import { Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

interface NavbarProps { onMenuClick: () => void; }

// --- Profile Avatar Component ---
const UserAvatar = () => {
    // Fetch 'about' data to get user's name and image for the avatar
    const { data, isLoading } = useQuery({
        queryKey: ['about-profile'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/about');
                return response.data;
            } catch (error) {
                return null; // Handle case where 'about' data doesn't exist yet
            }
        }
    });

    if (isLoading) return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>;
    
    // If we have an image, display it
    if (data?.image) {
        return <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${data.image}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />;
    }
    
    // Otherwise, display the first letter of the name
    if (data?.name) {
        return (
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {data.name.charAt(0).toUpperCase()}
            </div>
        );
    }

    // Fallback if no data exists at all
    return <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"><FiUser/></div>
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200">
      {/* Portal Title - hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-slate-700">Admin Portal</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* --- Profile Dropdown Menu --- */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2">
            <UserAvatar />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-blue-500 text-white' : 'text-slate-700'
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      <FiLogOut className="mr-2" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        
        {/* Mobile Menu Button - on the far right */}
        <button onClick={onMenuClick} className="text-slate-500 focus:outline-none md:hidden">
          <FiMenu size={24} />
        </button>
      </div>
    </header>
  );
}