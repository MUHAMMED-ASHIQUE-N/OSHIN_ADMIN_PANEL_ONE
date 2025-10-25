import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Layers,
  HelpCircle,
  Users,
  CircleChevronLeft,
  LogOut,
  MessageSquareWarning,
  Menu, // Added for hamburger
  X, // Added for close button
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Nav from '../../components/layout/Nav';
import StatsBar from '../../components/common/StatsBar';

const managementNavItems = [
  { href: '/management/composites', icon: Layers, label: 'Composite' },
  { href: '/management/questions', icon: HelpCircle, label: 'Questions' },
  { href: '/management/users', icon: Users, label: 'Users' },
  { href: '/management/issues', icon: MessageSquareWarning, label: 'Guest Issues' },
];

const ManagementLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false); // Close sidebar on logout
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false); // Close sidebar when a link is clicked
  };

  return (
    <>
      <Nav />
      <div className="pt-1"></div>

      {/* Main container */}
      <div className="flex bg-background">
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/10 z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Management Sidebar
          - Mobile: fixed, slides in from left, full height
          - Desktop (lg:): relative, original styles
        */}
        <aside
          className={`
            fixed top-0 left-0 h-screen w-72 z-40
            bg-primary shadow-md flex flex-col
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}

            lg:relative lg:top-auto lg:left-auto lg:h-auto
            lg:min-h-[calc(100vh-8rem)] lg:w-64 lg:ml-2
            lg:rounded-[20px] lg:translate-x-0 lg:z-auto
            flex-shrink-0
          `}
        >
          <div className="p-4 font-bold text-xl border-b text-white flex items-center">
            {/* Back button (Desktop) */}
            <Link
              to={'/'}
              className="hidden lg:flex"
            >
              <CircleChevronLeft
                size={28}
                className="text-xl hover:bg-white rounded-full hover:text-primary"
              />
            </Link>

            {/* Close button (Mobile) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white rounded-full hover:text-primary p-1"
            >
              <X size={24} />
            </button>

            <h1 className="px-4 lg:px-8">Management</h1>
          </div>

          {/* Main Navigation */}
          <nav className="mt-4 flex-grow">
            {managementNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={handleLinkClick} // Close sidebar on click
                className={({ isActive }) =>
                  `flex items-center px-4 mt-2 py-3 mx-2 rounded-lg text-white hover:bg-secondary ${
                    isActive ? 'bg-secondary' : ''
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 mt-auto">
            <button
              onClick={handleLogout} // Use updated handler
              className="flex items-center w-full px-4 py-3 mx-2 rounded-lg text-white hover:bg-red-500 hover:bg-opacity-80"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Hamburger Menu Button - visible on mobile/tablet */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-700 rounded-md hover:bg-gray-100 mb-4"
          >
            <Menu size={28} />
          </button>

          <StatsBar />
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ManagementLayout;

