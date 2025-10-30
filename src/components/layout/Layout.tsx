//components/layout/Layout.tsx
import  { useState, useEffect, useCallback, useRef } from "react"; // Import useRef
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import Nav from "./Nav";
import { useCompositeStore } from "../../stores/compositeStore";
import { useFilterControlStore } from "../../stores/filterControlStore";
import { useFilterStore } from "../../stores/filterStore";
import { useManagementStore } from "../../stores/managementStore";
import { useAnalyticsStore, AnalyticsItemType } from "../../stores/analyticsStore";
import { useAuthStore } from "../../stores/authStore";

// --- ✅ START: Custom hook to get the previous value ---
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value; // Update after render
  });
  return ref.current; // Return value from *previous* render
}
// --- ✅ END: Custom hook ---

// useResponsive hook
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
    const navigate = useNavigate();
    const params = useParams<{itemId?: string}>();

    const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [sidebarMode, setSidebarMode] = useState<AnalyticsItemType>('composite');

    // Data stores
    const { composites, fetchComposites, isLoading: isLoadingComposites } = useCompositeStore();
    const { questions, fetchQuestions, isLoading: isLoadingQuestions } = useManagementStore();
    const fetchAvailableYears = useFilterControlStore((state) => state.fetchAvailableYears);
    const { category, setCategory } = useFilterStore();
    const { fetchAnalyticsData, resetSelection, currentItemId: analyticsItemId } = useAnalyticsStore();
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };
    // ✅ Get the previous category
    const prevCategory = usePrevious(category);

    // Fetch initial lists (no change)
    useEffect(() => {
        fetchComposites();
        fetchQuestions();
        fetchAvailableYears();
    }, [fetchComposites, fetchQuestions, fetchAvailableYears]);

     // Adjust sidebar open state (no change)
    useEffect(() => {
        if (!isMobile) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [isMobile]);

    // Handle selecting an item (no change)
    const handleSelectItem = useCallback((id: string, name: string, type: AnalyticsItemType) => {
        console.log(`Sidebar selected: ${type} - ${name} (${id})`);
        if (sidebarMode !== type) {
            setSidebarMode(type);
        }
        if (params.itemId !== id) {
             navigate(`/view/${id}`);
        } else {
             fetchAnalyticsData(id, name, type);
        }
        if (isMobile) setSidebarOpen(false);
    }, [navigate, isMobile, params.itemId, sidebarMode, fetchAnalyticsData]);

    // Handle switching sidebar mode (no change)
    const handleSetSidebarMode = useCallback((mode: AnalyticsItemType) => {
        console.log(`handleSetSidebarMode called with mode: ${mode}`);
        if (mode === sidebarMode) {
            console.log("Mode is already active, returning.");
            return;
        }
        setSidebarMode(mode);
        // ... (rest of logic to find first item and navigate) ...
        let firstItem: { _id: string, name?: string, text?: string } | undefined;
        if (mode === 'composite') {
            firstItem = composites.find(c => c.category === category);
        } else {
            firstItem = questions.find(q => q.category === category);
        }
        if (firstItem) {
            const firstName = mode === 'question' ? firstItem.text : firstItem.name;
            console.log(`Navigating to first ${mode}: ${firstName} (ID: ${firstItem._id})`);
            navigate(`/view/${firstItem._id}`);
        } else {
            console.log(`No items found for mode ${mode} in category ${category}. Resetting.`);
            resetSelection();
        }
    }, [sidebarMode, category, composites, questions, navigate, resetSelection, isLoadingComposites, isLoadingQuestions]); // Added loading states back

   // Effect to fetch analytics data (no change)
    const { selectedYear, selectedPeriod, selectedMonth, startDate, endDate } = useFilterControlStore();
    const currentUrlItemId = params.itemId;
    useEffect(() => {
        let itemName = '';
        let itemType: AnalyticsItemType | null = null;
        if (currentUrlItemId) {
            // Determine name/type based on ID and lists (even if sidebarMode is temporarily out of sync)
            const comp = composites.find(c => c._id === currentUrlItemId);
            if (comp) {
                itemName = comp.name;
                itemType = 'composite';
                if(sidebarMode !== 'composite') setSidebarMode('composite'); // Sync mode
            } else {
                const ques = questions.find(q => q._id === currentUrlItemId);
                if (ques) {
                    itemName = ques.text;
                    itemType = 'question';
                    if(sidebarMode !== 'question') setSidebarMode('question'); // Sync mode
                }
            }
            // Fetch data if item found
          if (itemType && itemName) {
                 console.log(`Data Fetch Effect: Fetching for ${itemType}: ${itemName}`);
                 fetchAnalyticsData(currentUrlItemId, itemName, itemType);
            } else if (!isLoadingComposites && !isLoadingQuestions) {
               console.warn(`Item ID ${currentUrlItemId} from URL not found.`);
            } else {
                 console.log(`Waiting for lists to load to identify item ID ${currentUrlItemId}...`);
          }
        } else {
             console.log("No item ID in URL.");
        }
    }, [
        currentUrlItemId,
        composites, questions, // Re-run when lists load
        category, selectedYear, selectedPeriod, selectedMonth, startDate, endDate, // Re-run on filter change
        fetchAnalyticsData, isLoadingComposites, isLoadingQuestions
        // sidebarMode is removed: let the URL ID be the source of truth
    ]);


    // ✅ --- MODIFIED Effect to handle category switch ---
    useEffect(() => {
        // Only run if:
        // 1. Category has actually changed (prevCategory is not undefined and differs)
        // 2. Composites are loaded
        if (prevCategory !== category && prevCategory !== undefined && !isLoadingComposites && composites.length > 0) {
            const firstCompositeInNewCategory = composites.find(c => c.category === category);
            if (firstCompositeInNewCategory) {
                console.log(`Category CHANGED to ${category}. Selecting first composite: ${firstCompositeInNewCategory.name}`);
                setSidebarMode('composite'); // Reset mode to composite
                // Navigate to the first composite of the new category
             navigate(`/view/${firstCompositeInNewCategory._id}`, { replace: true });
            } else {
                console.log(`No composites found for newly selected category ${category}. Resetting selection.`);
                resetSelection();
                setSidebarMode('composite');
            }
        }
    // Only depends on category, prevCategory, composites, and loading state
    }, [category, prevCategory, composites, isLoadingComposites, navigate, resetSelection]);


    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* ✅ Props updated for Nav */}
            <Nav category={category} setCategory={setCategory} />
            
            {/* ✅ Props updated for Header */}
            <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
            
            <div className="flex flex-1 overflow-hidden pt-2">
                <Sidebar onLogout={handleLogout}
                    isSidebarOpen={isSidebarOpen}
                    isMobile={isMobile}
                    toggleSidebar={toggleSidebar}
            sidebarMode={sidebarMode}
                    setSidebarMode={handleSetSidebarMode}
                    onSelectItem={handleSelectItem}
                    currentItemId={analyticsItemId ?? undefined}
                />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    <Outlet />
                </main>
       </div>
        </div>
    );
};