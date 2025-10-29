import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom' // Added useNavigate
import {
  Layers,
  HelpCircle,
  Users,
  CircleChevronLeft,
  LogOut,
  Menu, // Added for hamburger
  X,    // Added for close button
  ListChecks,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Nav from '../../components/layout/Nav';
import clsx from 'clsx'; // Utility for conditional classes
// Import category store
import { useFilterStore } from '../../stores/filterStore';

const managementNavItems = [
  { href: '/management/composites', icon: Layers, label: 'Composite' },
  { href: '/management/questions', icon: HelpCircle, label: 'Questions' },
  { href: '/management/users', icon: Users, label: 'Users' },
  { href: "/management/responses", icon: ListChecks, label: "Yes/No Responses" },
];

const ManagementLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State controls mobile sidebar visibility

  // ✅ Get category state from filter store
  const { category, setCategory } = useFilterStore();

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false); // Close sidebar on logout
    navigate('/login'); // Redirect to login after logout
  };

  // Close sidebar when a NavLink is clicked (for mobile/tablet)
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Mobile Header for Management section.
        The main Nav component (with category toggle) is used by the *analytics* layout,
        but this management layout needs its own Nav or header.
        We'll use a simplified header for mobile and the full Nav for desktop.
      */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow sticky top-0 z-40">
           <span className="text-lg font-bold text-primary">Management</span>
           <button onClick={toggleSidebar} className="text-gray-600 hover:text-primary">
               <Menu size={24} />
           </button>
      </div>

      {/* Desktop Nav: Pass the required category props */}
      <div className="hidden md:block">
        <Nav
            category={category}
            setCategory={setCategory}
            // Pass dummy/empty functions for props Nav expects but this layout doesn't use
        />
      </div>


      <div className="flex flex-1 overflow-hidden"> {/* Container for sidebar + content */}

        {/* --- Sidebar Overlay (Mobile/Tablet) --- */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar} // Close on overlay click
            aria-hidden="true"
          ></div>
        )}

        {/* --- Sidebar --- */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 flex flex-col flex-shrink-0 w-64 bg-primary shadow-lg',
            'transition-transform duration-300 ease-in-out',
            // Mobile/Tablet: Slide in/out
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            // Desktop: Always visible, relative positioning
            'md:relative md:translate-x-0 md:shadow-md md:rounded-[20px] md:ml-2 md:my-2 md:h-[calc(100vh-80px)]' // Adjust height based on Nav
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 font-bold text-xl border-b border-secondary text-white flex items-center justify-between">
            <div className='flex items-center'>
                <Link
                    to={'/'} // Link back to main dashboard
                    onClick={handleLinkClick}
                    className='p-1 rounded-full hover:bg-white hover:text-primary'
                    title="Back to Dashboard"
                >
                <CircleChevronLeft size={24} />
                </Link>
                <h1 className='pl-6 pr-2'>Management</h1>
            </div>
             {/* Close Button (Mobile/Tablet Only) */}
             <button onClick={toggleSidebar} className="p-1 text-pink-100 hover:bg-secondary rounded-full md:hidden">
                 <X size={20} />
             </button>
          </div>

          {/* Main Navigation */}
          <nav className="mt-4 flex-grow overflow-y-auto">
            {managementNavItems.map(item => (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={handleLinkClick} // Close sidebar on link click
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-4 mt-2 py-3 mx-2 rounded-lg text-white hover:bg-secondary transition-colors',
                    isActive ? 'bg-secondary' : ''
                  )
                }
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 mt-auto border-t border-secondary">
            <button
              onClick={handleLogout} // Use updated handler
              className="flex items-center w-full px-4 py-2 mx-auto rounded-lg text-white hover:bg-red-500 hover:bg-opacity-80 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet /> {/* Child routes render here */}
        </main>
      </div>
    </div>
  );
};

export default ManagementLayout;