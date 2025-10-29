import { Menu } from "lucide-react";
import {  FaDownload,  FaSearch } from "react-icons/fa";

interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean; // ✅ Added isMobile prop
}

export const Header = ({ toggleSidebar, isMobile }: HeaderProps) => { // ✅ Accept isMobile
  return (
    <header className="bg-background flex flex-col">
      {/* Nav Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-1">
        <div className="flex items-center gap-4">
          
          {/* ✅ Menu Icon - Now only shows on mobile */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
          <Menu className="h-6 w-6" />
            </button>
          )}

          <span className="hidden md:inline text-xl text-gray-500 font-semibold">Dashboards <span className="mx-1 text-gray-400">/</span> Menu</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-44 md:w-72">
        <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              placeholder="Search"
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            {/* download button  */}
          <FaDownload className="text-xl text-gray-400 hover:text-pink-700 cursor-pointer" />
        </div>
    </div>
    </header>
  );
};