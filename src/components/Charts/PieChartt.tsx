// src/components/Charts/PieChartt.tsx
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Define a more generic type for our data items
export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any; // ✅ ADD THIS LINE
}

// Define the props the component will accept
interface DynamicPieChartProps {
  data: ChartDataItem[];
  title?: string | null; // The title is now an optional prop
  style?: string; // Optional additional styles
}

// A color palette
const COLORS = [
  '#650933', '#E4B587', '#FFBB28', '#FF8042',
  '#AF19FF', '#FF1943', '#3366E6', '#FF6633',
  '#FFB399', '#FF33FF', '#FFFF99', '#B34D4D'
];

// The component now accepts props ({ data, title })
export const PieChartt: React.FC<DynamicPieChartProps> = ({ data, title,style }) => {
  return (
    <div 
      className={`rounded-lg  ${style}  `} 
     
    >
      <h2 
        className="text-xl font-bold " 
        style={{ color: '#650933' }}
      >
        {/* Use the title from props, or provide a default */}
        {title || null}
      </h2>
      <ResponsiveContainer  width="100%" height={400}>
        <PieChart>
          <Pie
            // Data now comes directly from props
            data={data}
            // dataKey and nameKey are updated to be generic
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={150}
            paddingAngle={2}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};