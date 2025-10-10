// src/pages/Dashboard.tsx
import React, {  useEffect } from 'react';
import { BarDiagram} from '../components/Charts/BarDiagram';
import { PieChartt } from '../components/Charts/PieChartt';
import { LineChartt} from '../components/Charts/LineChartt';
import { useDashboardStore } from '../stores/dashboardStore'; // ✅ Use the new store
import { FilterBar } from '../components/common/FilterBar';
import StatsBar from '../components/common/StatsBar';
import { useChart } from '../context/ChartContext'; // Keep this for now for chart switching

const Dashboard: React.FC = () => {
  const { activeChart } = useChart();
  // ✅ Get ALL state and the fetch action from our new Zustand store
  const {
    dashboardData,
    isLoading,
    error,
    selectedYear,
    selectedPeriod,
    selectedMonth,
    fetchDashboardData,
  } = useDashboardStore();

  // ✅ The main useEffect that reacts to ANY filter change and fetches data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedPeriod, selectedMonth, fetchDashboardData]); // Dependency array is key!

  const renderActiveChart = () => {
    // Show a loading or error message
    if (isLoading) return <div>Loading chart data...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!dashboardData || dashboardData.length === 0) return <div className='flex items-center justify-center h-96'><h1 className='text-xl text-primary font-semibold'>No data available for the selected period.</h1></div>;
    
    // Pass the live data from the store to the charts
    switch (activeChart) {
      case 'bar':
        return <BarDiagram data={dashboardData} title="Overall Satisfaction Score" />;
      case 'pie':
        return <PieChartt data={dashboardData} title="Overall Satisfaction Score" />;
      case 'line':
        return <LineChartt data={dashboardData} title="Overall Satisfaction Score" />;
      default:
        return <BarDiagram data={dashboardData} title="Overall Satisfaction Score" />;
    }
  };

  return (
    <div>
      <StatsBar />
      <FilterBar /> 
      <div>
        {renderActiveChart()}
      </div>
    </div>
  );
};

export default Dashboard;