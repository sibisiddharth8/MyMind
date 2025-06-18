import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiUser, FiLink, FiBriefcase, FiAward, FiFileText,
  FiMessageSquare, FiShield, FiX, FiLayers, FiUsers,
  FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';

const navLinks = [
  { to: '/', icon: FiGrid, label: 'Dashboard' },
  { to: '/about', icon: FiUser, label: 'About' },
  { to: '/links', icon: FiLink, label: 'Links' },
  { to: '/experience', icon: FiBriefcase, label: 'Experience' },
  { to: '/education', icon: FiAward, label: 'Education' },
  { to: '/skills', icon: FiLayers, label: 'Skills' },
  { to: '/projects', icon: FiFileText, label: 'Projects' },
  { to: '/members', icon: FiUsers, label: 'Members' },
  { to: '/contact', icon: FiMessageSquare, label: 'Messages' },
  { to: '/terms', icon: FiShield, label: 'Terms' },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setSidebarOpen }: SidebarProps) {
  // --- STATE MANAGEMENT ---

  // State for desktop collapse behavior
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Change 1: Add state to track if we are in a mobile viewport.
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // --- DERIVED STATE ---

  // This computed value determines if the sidebar should be in its expanded state on DESKTOP
  const isExpanded = !isCollapsed || isHovered;

  // Change 2: This new value determines if text labels should be visible.
  // Show text if it's expanded on desktop OR if it's a mobile view.
  const shouldShowText = isExpanded || isMobileView;

  // --- EFFECTS ---

  // Change 3: Add an effect to listen for window resize events.
  // This makes our component responsive to screen size changes (e.g., device rotation).
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // --- EVENT HANDLERS ---

  const handleMouseEnter = () => {
    if (isCollapsed) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isCollapsed) setIsHovered(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsHovered(false);
  };

  // --- RENDER LOGIC ---

  const linkClasses = "flex items-center px-4 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-blue-100 text-blue-600 font-semibold";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Change 4: Use `shouldShowText` to conditionally render header and center icons */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-200 transition-all duration-300 ${!shouldShowText ? 'justify-center' : 'justify-between'}`}>
        {shouldShowText && <h1 className="text-xl font-bold text-slate-800">Logo</h1>}
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500">
          <FiX size={24} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            // Change 5: Use `shouldShowText` for alignment and text visibility
            className={({ isActive }) => `${linkClasses} ${!shouldShowText ? 'justify-center' : ''} ${isActive ? activeLinkClasses : ''}`}
            onClick={() => {
              if (isMobileView) { // Use our state variable here
                  setSidebarOpen(false);
              }
            }}
            title={!shouldShowText ? link.label : undefined}
          >
            <link.icon className="w-5 h-5" />
            {shouldShowText && <span className="mx-4 font-medium">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
      {/* Collapse button for desktop */}
      <div className="hidden md:flex justify-center p-4 border-t border-slate-200">
        <button
          onClick={toggleCollapse}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <FiChevronsRight className="w-5 h-5" /> : <FiChevronsLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Overlay) */}
      <div className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Main Sidebar (No changes needed here from last version) */}
      <aside
        className={
          `fixed inset-y-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out
          right-0 w-64 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:left-0 md:relative md:translate-x-0
          ${isExpanded ? 'md:w-64' : 'md:w-20'}`
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent}
      </aside>
    </>
  );
}