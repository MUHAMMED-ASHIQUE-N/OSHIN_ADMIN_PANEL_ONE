// src/components/Charts/BarDiagram.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// ... (interfaces and CustomTooltip component remain the same)
export interface ChartDataItem {
  name: string;
  value: number;
}
interface DynamicBarChartProps {
  data: ChartDataItem[];
  title?: string;
  summaryValue?: string;
  timeLabel?: string;
  barColor?: string; // Note: This prop will be overridden by the new logic
}
type TooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-pink-200">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-bold text-[#5D1130]">{payload[0].value.toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

// ✅ 1. ADDED: Helper function for conditional coloring
/**
 * Gets the bar color based on its value.
 * - Red: value < 6 (Covers 0-5.99)
 * - Orange: 6 <= value < 9 (Covers 6-8.99)
 * - Green: value >= 9 (Covers 9-10)
 */
const getColorForValue = (value: number) => {
  if (value < 6) {
    return "#EF4444"; // Tailwind Red-500
  }
  if (value >= 6 && value < 9) {
    return "#F97316"; // Tailwind Orange-500
  }
  if (value >= 9) {
    return "#22C55E"; // Tailwind Green-500
  }
  return "#650933"; // Fallback color
};


export const BarDiagram: React.FC<DynamicBarChartProps> = ({
  data,
  title = "GUEST LOYALTY COMPOSITE",
  summaryValue,
  timeLabel,
  // ⚠️ Note: barColor prop is no longer used due to conditional coloring 
}) => (
  <div className="bg-white rounded-lg shadow px-2 py-3 xs:px-4 xs:py-4 sm:px-6 mx-4">
    {/* ... (header section remains the same) ... */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between  gap-2">
      <div>
        <h2 className="text-base xs:text-lg md:text-xl font-semibold text-[#5D1130] leading-tight">
          {title}
        </h2>
        {summaryValue && (
          <div
            className="text-xs text-gray-400 mt-1"
            dangerouslySetInnerHTML={{ __html: summaryValue, }}
          />
        )}
      </div>
      {timeLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Year</span>
          <span className="font-semibold text-[#5D1130]">{timeLabel}</span>
          
        </div>
      )}
    </div>

    <div className="w-full h-48 xs:h-64 sm:h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap="10%"
          margin={{ top: 30, right: 10, left: 0, bottom: 0 }} // Increased top margin for labels
        >
          <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#bdbdbd" fontSize={10} />
          <YAxis
            domain={[0, 10]}
            ticks={[0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            axisLine={true}
            tickLine={false}
            stroke="#bdbdbd"
            fontSize={10}
            // gap between ticks
            tick={{ dy: 4 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          
          {/* ✅ 2. UPDATED: Bar component now maps data to Cells */}
          <Bar dataKey="value" radius={[6, 6, 3, 3]} barSize={50}>
            {/* 3. Map over data to get the 'entry' and its 'value' */}
            {data.map((entry, idx) => (
              <Cell 
                key={`cell-${idx}`} 
                // 4. Use the helper function to set the fill color
                fill={getColorForValue(entry.value)} 
                stroke="#e5e7eb" 
                strokeWidth={1} 
              />
            ))}
            
            {/* LabelList remains the same, it's correct */}
            <LabelList
              dataKey="value"
              position="top"
              fontSize={12}
              fontWeight="bold"
// ✅ 5. Set the fill color for the label
              fill="#333" // A dark, neutral color for the label
              formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return value.toFixed(2);
                  }
                  return value; // Return as-is if not a number
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);