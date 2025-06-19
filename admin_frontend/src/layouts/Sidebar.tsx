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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const isExpanded = !isCollapsed || isHovered;
  // On mobile, the sidebar is always "expanded" visually, even if the state is collapsed
  const shouldShowText = isExpanded || isMobileView;

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => { if (isCollapsed && !isMobileView) setIsHovered(true); };
  const handleMouseLeave = () => { if (isCollapsed && !isMobileView) setIsHovered(false); };
  const toggleCollapse = () => { setIsCollapsed(!isCollapsed); setIsHovered(false); };

  // FIX FOR TEXT JIGGLE: font-semibold is now the base style for all links.
  const linkClasses = "flex items-center w-full overflow-hidden px-4 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200 font-semibold";
  // FIX FOR TEXT JIGGLE: font-semibold is removed from the active state.
  const activeLinkClasses = "bg-blue-100 text-blue-600";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center h-16 px-4 border-b border-slate-200 transition-all duration-300 ${!shouldShowText ? 'justify-center' : 'justify-between'}`}>
        {/* The opacity transition makes the logo fade in and out smoothly */}
        {/* <span className={`text-xl font-bold text-slate-800 transition-opacity duration-200 ${shouldShowText ? 'opacity-100' : 'opacity-0'}`}>
            Sibi's Portal
        </span> */}
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500">
          <FiX size={24} />
        </button>
      </div>
      <nav className="flex-1 p-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `${linkClasses} ${!shouldShowText ? 'justify-center' : ''} ${isActive ? activeLinkClasses : ''}`}
            onClick={() => { if (isMobileView) setSidebarOpen(false); }}
            title={!shouldShowText ? link.label : undefined}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {/* FIX FOR TEXT POP-IN: The span now transitions its opacity and margin smoothly */}
            <span className={`transition-all duration-200 whitespace-nowrap ${shouldShowText ? 'ml-4 opacity-100 mb-0.5' : 'ml-0 w-0 opacity-0'}`}>
              {link.label}
            </span>
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
      <div className={`fixed inset-0 bg-black/40 z-20 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Main Sidebar */}
      <aside
        className={
          `fixed inset-y-0 right-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out
          md:left-0 md:relative md:translate-x-0
          ${isExpanded ? 'md:w-64' : 'md:w-20'}
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent}
      </aside>
    </>
  );
}