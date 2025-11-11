// src/components/common/StatsBar.tsx

import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { useStatsStore } from '../../stores/statsStore';
import { useFilterStore } from '../../stores/filterStore';
import { useNavigate } from 'react-router-dom';
import CategorySelectionModal from './CategorySelectionModal';
import { Category } from '../../stores/filterStore'; // ✅ Import the full Category type

const StatsBar = () => {
  const { stats, isLoading, fetchStats } = useStatsStore();
  const { category } = useFilterStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log("DEBOUNCED Stats Fetch: Fetching stats for category:", category);
      
      // ✅ FIX 1: Prevent crash if fetchStats doesn't support 'cfc'
      // You should update useStatsStore to accept 'cfc' to remove this check.
      if (category === 'room' || category === 'f&b') {
        fetchStats(category);
      } else {
        // Handle 'cfc' case if stats aren't applicable
        // Or remove this 'if' block entirely if fetchStats is updated
        console.warn("StatsBar: fetchStats does not support 'cfc' category yet.");
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchStats, category]);

  // ✅ FIX 2: Update signature to accept the full Category type
  const handleModalSubmit = (selectedCategory: Category) => {
    // This assumes your /compare/ route can also handle 'cfc'
    navigate(`/compare/${selectedCategory}`);
    setIsModalOpen(false);
  };

  const statData = [
    { title: "Total Reviews", value: isLoading ? "..." : stats.totalReviews },
    { title: "Total Staff", value: isLoading ? "..." : stats.totalStaff },
    { title: "Active Staff", value: isLoading ? "..." : stats.activeStaff },
  ];

  return (
    <>
      <div className="py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5 mx-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1">
            {statData.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row lg:justify-end gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5D1130] hover:bg-[#751b40] text-white font-semibold px-6 py-6 rounded-[20px] shadow transition-all w-full lg:w-auto"
            >
              Compare Data
            </button>
            <button
              onClick={() => navigate("/management/composites")}
              className="bg-[#5D1130] hover:bg-[#751b40] text-white font-semibold px-6 py-6 rounded-[20px] shadow transition-all w-full lg:w-auto"
            >
              Manage    
            </button>
          </div>
        </div>
      </div>
      <CategorySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit} // ✅ This prop now matches the handler's type
        // You may need to add 'currentCategory={category}' here if your modal needs it
      />
    </>
  );
};

export default StatsBar;