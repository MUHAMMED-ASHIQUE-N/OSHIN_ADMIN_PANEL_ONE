// src/components/layout/Layout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import Nav from "./Nav";
import { useCompositeStore } from "../../stores/compositeStore"; // ✅ Import the new store


// This custom hook to detect mobile screen size remains the same.
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export const Layout = () => {
  const isMobile = useResponsive();
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const fetchComposites = useCompositeStore((state) => state.fetchComposites); // ✅ Get the fetch action


  // Fetch composites on mount
      useEffect(() => {
    // ✅ Fetch composites once when the layout loads
    fetchComposites();
  }, [fetchComposites]);
  
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);



  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // The main content's margin logic is still needed for desktop.
 

  return (
    // Main container is now a column
    <div className="flex flex-col h-screen bg-background">
        <Nav/>
      <Header toggleSidebar={toggleSidebar} />

      
      {/* This container holds both sidebar and main content side-by-side */}
     <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          isMobile={isMobile} 
          toggleSidebar={toggleSidebar} 
        />
        <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};