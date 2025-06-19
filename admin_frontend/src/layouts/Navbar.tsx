import { Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FiLogOut, FiMenu, FiUser, FiPlus, FiBriefcase, FiLayers } from 'react-icons/fi';
import Button from '../components/ui/Button';

interface NavbarProps { onMenuClick: () => void; }

// This component is now much simpler. It gets user data directly from the AuthContext.
const UserAvatar = () => {
    const { user } = useAuth(); // Gets user profile from global state
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    if (user?.image) {
        return <img src={`${assetBaseUrl}/${user.image}`} alt="Profile" className="w-9 h-9 rounded-full object-cover" />;
    }
    if (user?.name) {
        return (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    }
    return <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center"><FiUser/></div>
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200">
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-slate-700">Admin Portal</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* --- "Quick Add" Menu --- */}
        <Menu as="div" className="relative">
          <Menu.Button as={Button} variant="secondary" className="!p-2 !rounded-full">
            <FiPlus size={20} />
          </Menu.Button>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="p-1">
                <Menu.Item><Link to="/experience/new" className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-slate-700 hover:bg-blue-500 hover:text-white"><FiBriefcase className="mr-2"/>New Experience</Link></Menu.Item>
                <Menu.Item><Link to="/skills/new" className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-slate-700 hover:bg-blue-500 hover:text-white"><FiLayers className="mr-2"/>New Skill</Link></Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* --- Profile Dropdown Menu --- */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <UserAvatar />
          </Menu.Button>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => ( <button onClick={handleLogout} className={`${active ? 'bg-blue-500 text-white' : 'text-slate-700'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><FiLogOut className="mr-2" />Logout</button> )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        
        <button onClick={onMenuClick} className="text-slate-500 focus:outline-none md:hidden"><FiMenu size={24} /></button>
      </div>
    </header>
  );
}