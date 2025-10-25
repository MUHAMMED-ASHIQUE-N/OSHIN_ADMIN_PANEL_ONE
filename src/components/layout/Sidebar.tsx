import { NavLink, useLocation } from "react-router-dom";
import { BarChart2 } from "lucide-react"; // Removed LayoutDashboard
import clsx from "clsx";
import { useCompositeStore } from "../../stores/compositeStore";
import { useFilterStore } from "../../stores/filterStore"; // ✅ 1. Import filter store
import { slugify } from "../../utils/slugify";
import { useMemo } from "react";


interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ isSidebarOpen, isMobile, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const composites = useCompositeStore((state) => state.composites);
  const { category } = useFilterStore(); // ✅ 2. Get the current category

  // Dynamically build the navigation items based on the selected category
  const navItems = useMemo(() => {
    // Filter composites based on the current category from the filter store
    const filteredComposites = composites.filter(c => c.category === category);

    // Create links ONLY for the filtered composites
    const dynamicItems = filteredComposites.map(composite => ({
        href: `/composites/${slugify(composite.name)}`,
        icon: BarChart2,
        label: composite.name,
    }));

    return dynamicItems;
  // ✅ 3. Add 'category' to the dependency array
  }, [composites, category]);

  const sidebarClasses = clsx(
    "bg-primary text-white transition-all duration-300 ease-in-out rounded-[20px] md:ml-2 md:my-2",
    "overflow-y-auto",
    {
      "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40": isMobile,
      "transform -translate-x-full": isMobile && !isSidebarOpen,
      "transform translate-x-0": isMobile && isSidebarOpen,
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
        <nav className=" flex-1 py-4 ">
          {/* Display message if no composites match the filter */}
          {navItems.length === 0 && (
             <p className="px-4 py-2 text-pink-100 text-sm text-center">No {category.toUpperCase()} composites found.</p>
          )}
          {navItems.map((item) => {
            // isActive logic remains the same
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={clsx(
                  "flex items-center px-2 py-2 mx-4 mt-1 rounded-lg hover:bg-secondary hover:text-white transition-colors duration-200 text-pink-100",
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