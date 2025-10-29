import  { useState, useEffect } from 'react'; // Import useState
import StatCard from './StatCard';
import { useStatsStore } from '../../stores/statsStore';
import { useFilterStore } from '../../stores/filterStore';
import { useNavigate } from 'react-router-dom';
import CategorySelectionModal from './CategorySelectionModal'; // ✅ Import the new modal

const StatsBar = () => {
  const { stats, isLoading, fetchStats } = useStatsStore();
  const { category } = useFilterStore();
  const navigate = useNavigate();

  // ✅ State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStats(category);
  }, [fetchStats, category]);

  // ✅ Handler for when the modal submits
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
    <> {/* ✅ Use fragment to render modal alongside */}
      <div className="py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5 mx-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1">
            {statData.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row lg:justify-end gap-4"> {/* ✅ Group buttons */}
            {/* Compare Data Button */}
            <button
              onClick={() => setIsModalOpen(true)} // ✅ Open modal
              className="bg-[#5D1130] hover:bg-[#751b40] text-white font-semibold px-6 py-6 rounded-[20px] shadow transition-all w-full lg:w-auto"
            >
              Compare Data
            </button>

            {/* Manage Composite Button */}
            <button
              onClick={() => navigate("/management/composites")}
              className="bg-[#5D1130] hover:bg-[#751b40] text-white font-semibold px-6 py-6 rounded-[20px] shadow transition-all w-full lg:w-auto"
            >
              Manage Composite
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Render the modal */}
      <CategorySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default StatsBar;