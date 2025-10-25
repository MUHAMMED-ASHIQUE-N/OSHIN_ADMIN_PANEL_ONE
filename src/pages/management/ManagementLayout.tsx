// src/pages/management/ManagementLayout.tsx
import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Layers, HelpCircle, Users, CircleChevronLeft, LogOut,MessageSquareWarning } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Nav from '../../components/layout/Nav';
import StatsBar from '../../components/common/StatsBar';

const managementNavItems = [
  { href: "/management/composites", icon: Layers, label: "Composite" },
  { href: "/management/questions", icon: HelpCircle, label: "Questions" },
  { href: "/management/users", icon: Users, label: "Users" }, // <-- UPDATED LINK
  { href: "/management/issues", icon: MessageSquareWarning, label: "Guest Issues" }, // <-- Add link
];

const ManagementLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      <Nav />
      <div className='pt-1'></div>

      <div className="flex bg-background">
        {/* Management Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-8rem)] ml-2 rounded-[20px] bg-primary shadow-md flex flex-col flex-shrink-0">
          <div className="p-4 font-bold text-xl border-b text-white flex items-center">
            <Link to={'/'}><CircleChevronLeft size={28} className='text-xl hover:bg-white rounded-full hover:text-primary' /> </Link>
            <h1 className='px-8'>Management</h1>
          </div>

          {/* Main Navigation */}
          <nav className="mt-4 flex-grow">
            {managementNavItems.map(item => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 mt-2 py-3 mx-2 rounded-lg text-white hover:bg-secondary ${isActive ? 'bg-secondary' : ''}`
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
              onClick={logout}
              className="flex items-center w-full px-4 py-3 mx-2 rounded-lg text-white hover:bg-red-500 hover:bg-opacity-80"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <StatsBar />
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ManagementLayout;