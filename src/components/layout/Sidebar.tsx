// src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart2,  } from "lucide-react";
import clsx from "clsx";
import { useCompositeStore } from "../../stores/compositeStore"; // ✅ Import the store
import { slugify } from "../../utils/slugify"; // ✅ Import the slugify helper
import { useMemo } from "react";


interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

// const navItems = [
//   { href: "/", icon: LayoutDashboard, label: "OSAT" },
//   { href: "/gust-loyality-composit", icon: BarChart2, label: "GUEST LOYALTY COMPOSITE" },
//   { href: "/arrival-composite", icon: ShoppingCart, label: "ARRIVAL COMPOSITE" },
//   { href: "/physical-composite", icon: Users, label: "PHYSICAL COMPOSITE" },
//   { href: "/service-composite", icon: SettingsIcon, label: "SERVICE COMPOSITE" },
//   { href: "/food-and-beverage-composite", icon: SettingsIcon, label: "FOOD AND BEVERAGE COMPOSITE" },
// ];

export const Sidebar = ({ isSidebarOpen, isMobile, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const composites = useCompositeStore((state) => state.composites); // ✅ Get composites from the store

  // ✅ Dynamically build the navigation items
  const navItems = useMemo(() => {
    // Start with the static Dashboard/OSAT link
    const staticItems = [{ href: "/", icon: LayoutDashboard, label: "OSAT" }];
    
    // Create links for each composite fetched from the backend
    const dynamicItems = composites.map(composite => ({
        href: `/composites/${slugify(composite.name)}`,
        icon: BarChart2, // Use a generic icon for all composites
        label: composite.name,
    }));

    return [...staticItems, ...dynamicItems];
  }, [composites]);

  const sidebarClasses = clsx(
    "bg-primary text-white transition-all duration-300 ease-in-out rounded-[20px]  md:ml-2 md:my-2",
    "overflow-y-auto", // Ensure sidebar content is scrollable if it overflows
    {
      // Mobile Overlay styles
      "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40": isMobile, // h-16 is 4rem
      "transform -translate-x-full": isMobile && !isSidebarOpen,
      "transform translate-x-0": isMobile && isSidebarOpen,
      
      // Desktop / Tablet styles
      "relative hidden md:flex md:flex-col": !isMobile,
      "w-64": isSidebarOpen && !isMobile,
      "w-20": !isSidebarOpen && !isMobile,
    }
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" onClick={toggleSidebar}></div>
      )}

      <aside className={sidebarClasses}>
     
        <nav className=" flex-1 py-4 "> {/* flex-1 to push content */}
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={clsx(
                  "flex items-center px-2 py-2 mx-4 mt-1 rounded-lg  hover:bg-secondary hover:text-white transition-colors duration-200 text-pink-100  ",
                  { "bg-secondary text-white font-semibold": isActive }
                )}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <item.icon className="h-6 w-6" />
                <span className={clsx( "truncate ml-4 ", { "hidden": !isSidebarOpen && !isMobile })}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};  