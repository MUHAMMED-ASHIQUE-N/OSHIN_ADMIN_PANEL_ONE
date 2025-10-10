import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
// ✅ 1. Import LogOut icon and the auth store
import { Layers, HelpCircle, Users, CircleChevronLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore'; 
import Nav from '../../components/layout/Nav';
import StatsBar from '../../components/common/StatsBar';

const managementNavItems = [
    { href: "/management/composites", icon: Layers, label: "Composite" },
    { href: "/management/questions", icon: HelpCircle, label: "Questions" },
    { href: "/management/staff", icon: Users, label: "Staff List" },
];

const ManagementLayout: React.FC = () => {
    // ✅ 2. Get the logout function from the store
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

                    {/* ✅ 3. Add the Logout Button at the bottom */}
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