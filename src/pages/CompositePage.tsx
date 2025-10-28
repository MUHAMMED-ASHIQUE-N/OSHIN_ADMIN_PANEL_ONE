import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { slugify } from "../utils/slugify";

// Import stores
import { useCompositeStore } from "../stores/compositeStore";
import { useFilterControlStore } from "../stores/filterControlStore";
import { useCompositePageStore } from "../stores/compositePageStore";
import { useFilterStore } from "../stores/filterStore";
// Import UI components
import { BarDiagram } from "../components/Charts/BarDiagram";
import { PieChartt } from "../components/Charts/PieChartt";
import { LineChartt } from "../components/Charts/LineChartt";
import { FilterBar } from "../components/common/FilterBar";
import StatsBar from "../components/common/StatsBar";
import { useChart } from "../context/ChartContext";

// BreakdownChart component
const BreakdownChart: React.FC<{ data: { name: string; value: number } }> = ({ data }) => {
  const chartData = useMemo(() => [
    { name: data.name, value: data.value },
    { name: "Remaining", value: Math.max(0, 10 - data.value) },
  ], [data]);

  return (
    <div className="w-full text-center py-4 bg-[#FAFBFF] rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-700 truncate px-2 h-10 flex items-center justify-center">{data.name}</h3>
      <PieChartt data={chartData} />
      <p className="font-bold text-xl text-primary mt-2">{data.value.toFixed(2)}</p>
    </div>
  );
};


const CompositePage: React.FC = () => {
  const { compositeSlug } = useParams<{ compositeSlug: string }>();
  const { activeChart } = useChart();

  // State from stores
  const { composites } = useCompositeStore();
  const { selectedYear, selectedPeriod, selectedMonth, startDate, endDate } = useFilterControlStore();
  const { category } = useFilterStore();
  const {
    mainChartData,
    breakdownData,
    isLoadingMain,
    isLoadingBreakdown,
    error,
    fetchCompositePageData,
  } = useCompositePageStore();

  // Find the current composite object
  const currentComposite = useMemo(() => {
    if (!composites || composites.length === 0) return null;
    return composites.find((c) => slugify(c.name) === compositeSlug);
  }, [composites, compositeSlug]);

  // Effect runs whenever the composite or any filter changes
  useEffect(() => {
    if (currentComposite?._id && currentComposite?.name) {
      fetchCompositePageData(currentComposite._id, currentComposite.name);
    } else if (composites.length > 0 && compositeSlug) {
        console.warn(`Composite with slug "${compositeSlug}" not found.`);
    }
  }, [
    currentComposite,
    selectedYear,
    selectedPeriod,
    selectedMonth,
    category,
    startDate,
    endDate,
    fetchCompositePageData,
    composites,
    compositeSlug
  ]);

  // Loading/Error states for finding the composite itself
  if (composites.length > 0 && !currentComposite) {
      return <div className="text-center p-6 text-red-600">Composite not found for slug: {compositeSlug}</div>;
  }
  if (!currentComposite) {
     return <div className="text-center p-6">Loading composite details...</div>;
  }


  const renderActiveChart = () => {
    console.log("renderActiveChart called - selectedPeriod:", selectedPeriod, "isLoadingMain:", isLoadingMain, "error:", error, "mainChartData:", mainChartData);

    // Loading/Error states for chart data
    if (isLoadingMain) return <div className="text-center p-4 h-72 flex items-center justify-center">Loading Main Chart...</div>;
    if (error) return <div className="text-center p-4 text-red-500 h-72 flex items-center justify-center">{error}</div>;
    if (!mainChartData || mainChartData.length === 0) return <div className="text-center p-4 h-72 flex items-center justify-center">No data available for this period.</div>;

    // Switch statement for rendering charts
    switch (activeChart) {
      case "bar":
        return <BarDiagram data={mainChartData} title={currentComposite.name} />;
      case "line":
         // Line chart needs at least 2 points, default to Bar for single point periods
         if (selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') {
             console.log("Switching Line chart to Bar for single data point period.");
             return <BarDiagram data={mainChartData} title={currentComposite.name} />;
         }
        return <LineChartt data={mainChartData} title={currentComposite.name} />;
      case "pie":
        // Pie chart makes sense for single point periods too
        if (selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') {
             const singlePointData = [
                 { name: mainChartData[0].name, value: mainChartData[0].value },
                 { name: "Remaining", value: Math.max(0, 10 - mainChartData[0].value) }
             ];
             return <PieChartt data={singlePointData} title={currentComposite.name} />;
        } else {
             console.log("Switching Pie chart to Bar for multi-data point period.");
             return <BarDiagram data={mainChartData} title={currentComposite.name} />;
        }
      default:
        return <BarDiagram data={mainChartData} title={currentComposite.name} />;
    }
  };

  const cardStyle = "bg-white p-4 rounded-lg shadow-md";

  return (
    <>
      <StatsBar />
      <FilterBar />
      <div className="w-full gap-6 px-4 pb-6 grid grid-cols-1 lg:grid-cols-4">
        {/* --- ROW 1: Main Chart and First Breakdown --- */}
        <div className={`mt-4 w-full lg:col-span-3 ${cardStyle}`}>
          {renderActiveChart()}
        </div>
        <div className="mt-4 lg:col-span-1">
          {isLoadingBreakdown ? (
            <div className={`text-center p-4 ${cardStyle} h-[420px] flex items-center justify-center`}>Loading Breakdown...</div>
          ) : error ? (
            <div className={`text-center p-4 text-red-500 ${cardStyle} h-[420px] flex items-center justify-center`}>{error}</div>
          ) : breakdownData.length > 0 ? (
            <div className={cardStyle}>
              {/* Render only the first breakdown item here */}
              <BreakdownChart data={breakdownData[0]} />
            </div>
          ) : (
            <div className={`text-center p-4 ${cardStyle} h-[420px] flex items-center justify-center`}>No breakdown data.</div>
          )}
        </div>

        {/* --- ROW 2: Rest of the Breakdown Charts --- */}
        <div className="lg:col-span-4 mt-6">
          {!isLoadingBreakdown && !error && breakdownData.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Render breakdown items starting from the second one */}
              {breakdownData.slice(1).map(item => (
                <div key={item.name} className={cardStyle}>
                  <BreakdownChart data={item} />
                </div>
              ))}
            </div>
          )}
          {/* Optionally show a message if there's only one breakdown item */}
          {!isLoadingBreakdown && !error && breakdownData.length === 1 && (
             <div className="text-center text-gray-500 italic mt-4">Only one question in this composite.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CompositePage;