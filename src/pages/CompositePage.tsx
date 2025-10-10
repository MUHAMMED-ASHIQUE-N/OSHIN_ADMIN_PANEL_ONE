import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { slugify } from '../utils/slugify';

// Import all the stores we need
import { useCompositeStore } from '../stores/compositeStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { useCompositePageStore } from '../stores/compositePageStore'; // ✅ Our new store

// Import UI and Chart components
import { BarDiagram } from '../components/Charts/BarDiagram';
import { PieChartt } from '../components/Charts/PieChartt';
import { LineChartt } from '../components/Charts/LineChartt';
import { FilterBar } from '../components/common/FilterBar';
import StatsBar from '../components/common/StatsBar';
import { useChart } from '../context/ChartContext'; // Keep for chart type switching

const BreakdownChart: React.FC<{ data: { name: string; value: number } }> = ({ data }) => {
    const chartData = [
        { name: data.name, value: data.value },
        { name: 'Remaining', value: 10 - data.value }
    ];
    return (
        <div className='w-full text-center py-4 bg-[#FAFBFF] rounded-lg shadow-md'>
            <h3 className='font-semibold text-gray-700 truncate px-2'>{data.name}</h3>
            <PieChartt data={chartData} />
            <p className='font-bold text-xl text-primary'>{data.value.toFixed(2)}</p>
        </div>
    );
};

const CompositePage: React.FC = () => {
    const { compositeSlug } = useParams<{ compositeSlug: string }>();
    const { activeChart } = useChart();

    // State from our stores
    const { composites } = useCompositeStore();
    const { selectedYear, selectedPeriod, selectedMonth } = useDashboardStore();
    const { mainChartData, breakdownData, isLoadingMain, isLoadingBreakdown, error, fetchCompositePageData } = useCompositePageStore();

    // Find the current composite object from the URL slug
    const currentComposite = useMemo(() => {
        return composites.find(c => slugify(c.name) === compositeSlug);
    }, [composites, compositeSlug]);

    // This effect runs whenever the composite or any filter changes
    useEffect(() => {
        if (currentComposite) {
            fetchCompositePageData(currentComposite._id);
        }
    }, [currentComposite, selectedYear, selectedPeriod, selectedMonth, fetchCompositePageData]);

    // Handle loading state for the main page content
    if (!currentComposite) {
        return <div>Loading composite details...</div>;
    }

    const renderActiveChart = () => {
        if (isLoadingMain) return <div className="text-center p-4">Loading Main Chart...</div>;
        if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
        if (!mainChartData.length) return <div className="text-center p-4">No data for this period.</div>;

        switch (activeChart) {
            case 'bar': return <BarDiagram data={mainChartData} title={currentComposite.name} />;
            case 'line': return <LineChartt data={mainChartData} title={currentComposite.name} />;
            case 'pie': return <PieChartt data={mainChartData} title={currentComposite.name} />;
            default: return <BarDiagram data={mainChartData} title={currentComposite.name} />;
        }
    };

    const cardStyle = "bg-white p-4 rounded-lg shadow-md";

    return (
        <>
 <StatsBar />
      <FilterBar />
      <div className='w-full gap-6 px-4 pb-6 grid grid-cols-1 lg:grid-cols-4'>
        
        {/* --- ROW 1: Main Chart and First Breakdown --- */}

        {/* Main Chart Area */}
        <div className={`mt-4 w-full lg:col-span-3 ${cardStyle}`}>
          {renderActiveChart()}
        </div>

        {/* First Breakdown Chart Area */}
        <div className="mt-4 lg:col-span-1">
          {isLoadingBreakdown ? (
            <div className="text-center p-4">Loading...</div>
          ) : breakdownData.length > 0 ? (
            <div className={cardStyle}>
              <BreakdownChart data={breakdownData[0]} />
            </div>
          ) : (
            <div className="text-center p-4">No breakdown data.</div>
          )}
        </div>

        {/* --- ROW 2: Rest of the Breakdown Charts --- */}
        
        {/* This container spans the full width on the next row */}
        <div className="lg:col-span-4 mt-6">
          {isLoadingBreakdown === false && breakdownData.length > 1 && (
            // This sub-grid will responsively lay out the remaining charts
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breakdownData.slice(1).map(item => (
                <div key={item.name} className={cardStyle}>
                  <BreakdownChart data={item} />
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </>
    );
};

export default CompositePage;