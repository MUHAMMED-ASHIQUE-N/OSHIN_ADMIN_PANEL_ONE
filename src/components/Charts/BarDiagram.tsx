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
  LabelList, // ✅ 1. Imported LabelList
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
  barColor?: string;
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


export const BarDiagram: React.FC<DynamicBarChartProps> = ({
  data,
  title = "GUEST LOYALTY COMPOSITE",
  summaryValue,
  timeLabel,
  barColor = "#650933",
}) => (
  <div className="bg-white rounded-lg shadow px-2 py-3 xs:px-4 xs:py-4 sm:px-6 mx-4">
    {/* ... (header section remains the same) ... */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between  gap-2">
      <div>
        <h2 className="text-base xs:text-lg md:text-xl font-semibold text-[#5D1130] leading-tight">
          {title}
        </h2>
        {summaryValue && (
          <div
            className="text-xs text-gray-400 mt-1"
            dangerouslySetInnerHTML={{ __html: summaryValue }}
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
          <Bar dataKey="value" radius={[6, 6, 3, 3]} barSize={50}>
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={barColor} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            
            {/* ✅ 2. Added the LabelList to render values by default */}
            <LabelList
              dataKey="value"
              position="top"
              fontSize={12}
              fontWeight="bold"
              fill="#5D1130"
             // ✅ This is the fix
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