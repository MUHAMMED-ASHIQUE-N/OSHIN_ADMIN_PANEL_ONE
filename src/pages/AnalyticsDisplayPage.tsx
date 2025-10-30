    //pages/AnalyticsDisplayPage.tsx
    import React, { useMemo } from "react";
    import { useFilterControlStore } from "../stores/filterControlStore";
    import { useAnalyticsStore } from "../stores/analyticsStore";
    import { BarDiagram } from "../components/Charts/BarDiagram";
    import { PieChartt } from "../components/Charts/PieChartt"; // Import updated PieChartt
    import { LineChartt } from "../components/Charts/LineChartt";
    import { FilterBar } from "../components/common/FilterBar";
    import StatsBar  from "../components/common/StatsBar";
    import { useChart } from "../context/ChartContext";

    // BreakdownChart component
    const BreakdownChart: React.FC<{ data: { name: string; value: number } }> = ({ data }) => {
    const chartData = useMemo(() => [
        { name: data.name, value: data.value },
        { name: "Remaining", value: Math.max(0, 10 - data.value) },
    ], [data]);

    return (
        <div className="w-full text-center py-4 bg-[#FAFBFF] rounded-lg shadow-md flex flex-col h-full"> {/* Added flex full height */}
        <h3 className="font-semibold text-sm text-[#949CA1]  px-6 h-12 flex items-center justify-center" title={data.name}> {/* Increased height slightly */}
            {data.name}
        </h3>
        {/* Use the new 'size' prop. 'small' disables the legend. */}
        <div className="flex-1"> {/* Allow chart to fill remaining space */}
            <PieChartt data={chartData} title={null} size="small" />
        </div>
        <p className="font-bold text-xl text-primary mt-2">{data.value.toFixed(2)}</p>
        </div>
    );
    };


    // Main page component
    const AnalyticsDisplayPage: React.FC = () => {
        const { activeChart } = useChart();
        const { selectedPeriod } = useFilterControlStore();
        const {
            currentItemName,
            currentItemType,
            mainChartData,
            breakdownData,
            isLoadingMain,
            isLoadingBreakdown,
            error,
        } = useAnalyticsStore();

        // Loading/Error states (no changes)
        if (error && !isLoadingMain && !isLoadingBreakdown) { /* ... return error ... */ }
        if (!currentItemName && !error && !isLoadingMain && !isLoadingBreakdown) { /* ... return select item ... */ }
        if (!currentItemName && (isLoadingMain || isLoadingBreakdown)) { /* ... return loading ... */ }


        // Function to render the main chart
        const renderActiveChart = () => {
            console.log("renderActiveChart called - Period:", selectedPeriod, "Loading:", isLoadingMain, "Error:", error, "Data:", mainChartData);

            if (isLoadingMain) return <div className="text-center p-4 h-72 flex items-center justify-center animate-pulse">Loading Chart Data...</div>;
            if (error && mainChartData.length === 0) return <div className="text-center p-4 text-red-500 h-72 flex items-center justify-center">{error}</div>;
            if (!mainChartData || mainChartData.length === 0) return <div className="text-center p-4 h-72 flex items-center justify-center">No data available for this period.</div>;

            const chartTitle = currentItemName || "Analytics Data";

            switch (activeChart) {
                case "bar":
                    return <BarDiagram data={mainChartData} title={chartTitle} />;
                case "line":
                    if ((selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') && mainChartData.length <= 1) {
                        return <BarDiagram data={mainChartData} title={chartTitle} />;
                    }
                    return <LineChartt data={mainChartData} title={chartTitle} />;
            case "pie":
                    // ✅ MODIFIED: Logic now only depends on data length
                    if (mainChartData.length === 1) {
                        const singlePointData = [
                            { name: mainChartData[0].name, value: mainChartData[0].value },
                            { name: "Remaining", value: Math.max(0, 10 - mainChartData[0].value) }
                        ];
                        // ✅ ADDED: showLabels={true}
                        return <PieChartt data={singlePointData} title={chartTitle} size="medium" showLabels={true} />;
                    } else {
                        // ✅ ADDED: showLabels={true}
                        return <PieChartt data={mainChartData} title={chartTitle} size="medium" showLabels={true} />;
                    }
                default:
                    return <BarDiagram data={mainChartData} title={chartTitle} />;
            }
        };

        const cardStyle = "bg-white p-4 rounded-lg shadow-md";

        return (
            <>
                <StatsBar />
                <FilterBar />
                {/* Main content grid */}
                {/* Added 'items-start' to align cards to the top */}
                <div className={`w-full gap-6 px-4 pb-6 grid grid-cols-1 ${currentItemType === 'composite' ? 'lg:grid-cols-4' : ''} items-start`}>

                    {/* --- Main Chart Area --- */}
                    <div className={`mt-4 w-full ${currentItemType === 'composite' ? 'lg:col-span-3' : 'lg:col-span-4'} ${cardStyle}`}>
                        {renderActiveChart()}
                    </div>

                    {/* --- Conditionally render Breakdown Chart Area (First Item) --- */}
                    {currentItemType === 'composite' && (
                        <div className="mt-4 lg:col-span-1">
                            {isLoadingBreakdown ? (
                                // Fixed typo from h-[800px] to h-[420px]
                                <div className={`text-center p-4 ${cardStyle} h-[420px] flex items-center justify-center animate-pulse`}>Loading Breakdown...</div>
                            ) : error && breakdownData.length === 0 && !isLoadingMain && mainChartData.length > 0 ? (
                                <div className={`text-center p-4 text-red-500 ${cardStyle} h-[420px] flex items-center justify-center`}>{error}</div>
                            ) : breakdownData.length > 0 ? (
                                <div className={`${cardStyle} h-full`}> {/* Added h-full */}
                                    <BreakdownChart data={breakdownData[0]} />
                                </div>
                            ) : (
                                !error && <div className={`text-center p-4 ${cardStyle} h-[420px] flex items-center justify-center`}>No breakdown data.</div>
                            )}
                        </div>
                    )}

                    {/* --- Conditionally render Rest of Breakdown Charts (ROW 2) --- */}
                    {currentItemType === 'composite' && (
                        <div className="lg:col-span-4 mt-6">
                            {!isLoadingBreakdown && !error && breakdownData.length > 1 && (
                                // Updated grid layout for better responsiveness
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {breakdownData.slice(1).map(item => (
                                        <div key={item.name} className={`${cardStyle} h-full`}> {/* Added h-full */}
                                            <BreakdownChart data={item} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isLoadingBreakdown && !error && breakdownData.length === 1 && (
                                <div className="text-center text-gray-500 italic mt-4">Only one question in this composite.</div>
                            )}
                        </div>
                    )}
                </div>
            </>
        );
    };

    export default AnalyticsDisplayPage;