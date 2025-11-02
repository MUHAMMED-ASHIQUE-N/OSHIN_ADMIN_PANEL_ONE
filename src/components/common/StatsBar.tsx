//src/components/common/StatsBar.tsx
import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { useStatsStore } from '../../stores/statsStore';
import { useFilterStore } from '../../stores/filterStore';
import { useNavigate } from 'react-router-dom';
import CategorySelectionModal from './CategorySelectionModal';

const StatsBar = () => {
  const { stats, isLoading, fetchStats } = useStatsStore();
  const { category } = useFilterStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ⭐️ MODIFIED: Effect to fetch stats with debounce ⭐️ ---
  useEffect(() => {
    // Set a timer to fetch stats
    const handler = setTimeout(() => {
      console.log("DEBOUNCED Stats Fetch: Fetching stats for category:", category);
      fetchStats(category);
    }, 300); // 300ms debounce timer (same as Layout)

    // Clear the previous timer if category changes again quickly
    return () => {
      clearTimeout(handler);
    };
  }, [fetchStats, category]); // Dependency array remains the same

  const handleModalSubmit = (selectedCategory: 'room' | 'f&b') => {
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
              Manage Composite
            </button>
          </div>
        </div>
      </div>
      <CategorySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default StatsBar;