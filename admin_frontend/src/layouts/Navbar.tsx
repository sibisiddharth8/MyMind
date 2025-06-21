import { Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';

interface NavbarProps { onMenuClick: () => void; }

// The UserAvatar component is now simpler and more robust
const UserAvatar = () => {
    const { user } = useAuth();

    // Display image if available
    if (user?.image) {
        return <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover" />;
    }
    // Otherwise, display initial if name is available
    if (user?.name) {
        return (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    }
    // Fallback icon
    return <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center"><FiUser/></div>
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get the first name for the welcome message
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <header className="flex justify-end items-center h-16 px-6 bg-white border-b border-slate-200 gap-4">
      {/* Left Side: Personalized Welcome Message (hidden on mobile) */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-slate-700">Welcome, {firstName}!</h1>
      </div>
      
      {/* Right Side: Profile Menu and Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
            {/* FIX: Increased z-index to ensure it's above all page content */}
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Signed in as</p>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1 border-t border-slate-100">
                <Menu.Item>
                  {({ active }) => ( 
                    <button 
                      onClick={handleLogout} 
                      // IMPROVED DESIGN for the logout button
                      className={`${
                        active ? 'bg-red-500 text-white' : 'text-red-600'
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm font-semibold`}
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
        
        {/* Mobile Sidebar Button is now the last item on the right */}
        <button onClick={onMenuClick} className="text-slate-500 focus:outline-none md:hidden">
          <FiMenu size={24} />
        </button>
      </div>
    </header>
  );
}