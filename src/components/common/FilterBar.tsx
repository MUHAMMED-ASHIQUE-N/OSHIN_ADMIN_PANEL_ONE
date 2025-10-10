



/// src/components/common/FilterBar.tsx (Corrected)
import React, { useState, useRef, useEffect } from 'react'; // ✅ FIXED: Imported necessary hooks

import { FaChartBar } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { PiChartPieSliceBold } from "react-icons/pi";
import { useChart, ChartType } from "../../context/ChartContext";
import { YearFilterBar } from "./YearFilterBar";
import { useDashboardStore } from '../../stores/dashboardStore'; // ✅ Use the new store

// Type definitions (no changes needed)
type RightIconItem = {
  icon: React.ComponentType<{ className?: string }>;
  type: ChartType;
};

const rightIcons: RightIconItem[] = [
  { icon: FaChartBar, type: 'bar' },
  { icon: PiChartPieSliceBold, type: 'pie' },
  { icon: GoGraph, type: 'line' },
];

const periods: Array<'Weekly' | 'Monthly' | 'Yearly'> = ["Weekly", "Monthly", "Yearly"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const FilterBar: React.FC = () => {
  // State and context hooks (no changes needed here)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // const { selectedPeriod, setPeriod, selectedMonth, setMonth } = useFilters();
  const { activeChart, setActiveChart } = useChart();
  const { selectedPeriod, setPeriod, selectedMonth, setMonth } = useDashboardStore();

  // useEffect for handling outside clicks on the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]); // ✅ FIXED: Completed the dependency array

  return (
    <>
  <YearFilterBar />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2">
        {/* --- Left: Period and Month Filters --- */}
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                selectedPeriod === p ? "bg-[#650933] text-white" : "bg-[#E4B587]/30 text-[#650933] hover:bg-[#751b40] hover:text-white"
              }`}
            >
              {p === 'Yearly' ? '1 Year' : p}
            </button>
          ))}
          {/* Conditionally render month dropdown for Weekly view */}
          {selectedPeriod === 'Weekly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="ml-2 px-4 py-2 hover:bg-primary hover:text-white  rounded-full text-sm font-medium bg-[#E4B587]/30 text-[#650933] border-none focus:ring-2 focus:ring-[#650933]"
            >
              {months.map((m, index) => (
                <option key={m} value={index}>{m}</option>
              ))}
            </select>
          )}
        </div>

        {/* --- Right: View + Chart Type Icons --- */}
        <div className="flex items-center gap-3 lg:gap-6 rounded-full bg-[#650933] px-6 py-2">
        
          {rightIcons.map((item, idx) => {
            const IconComponent = item.icon;
            const isActive = item.type === activeChart;
            return (
              <span
                key={idx}
                onClick={() => setActiveChart(item.type)}
                className={`flex items-center justify-center text-2xl rounded-full w-8 h-8 cursor-pointer ${
                  isActive
                    ? "bg-pink-100 p-2 text-primary"
                    : "text-[#F8E4ED] hover:bg-[#751b40]"
                }`}
              >
                <IconComponent />
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};