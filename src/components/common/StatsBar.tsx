import  { useEffect } from 'react';
import StatCard from './StatCard';
import { useStatsStore } from '../../stores/statsStore'; // ✅ Import store
import { useNavigate } from 'react-router-dom';

const StatsBar = () => {
  const { stats, isLoading, fetchStats } = useStatsStore(); // ✅ Get state from store
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Create the data dynamically from the store's state
  const statData = [
    { title: "Total Reviews", value: isLoading ? '...' : stats.totalReviews },
    { title: "Total Staff", value: isLoading ? '...' : stats.totalStaff },
    { title: "Active Staff", value: isLoading ? '...' : stats.activeStaff },
  ];

  return (
    <div className="py-3 bg-gray-50 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5 mx-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1">
          {statData.map(card =>
            <StatCard key={card.title} title={card.title} value={card.value} />
          )}
        </div>
        <div className="lg:mt-0 flex lg:justify-end">
          {/* ✅ Make the button navigate to the new management page */}
          <button 
            onClick={() => navigate('/management/composites')}
            className="bg-[#5D1130] hover:bg-[#751b40] text-white font-semibold px-6 py-6 rounded-[20px] shadow transition-all w-full lg:w-auto"
          >
            Add Ques & Composite
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;