//components/charts/pieChartt.tsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { clsx } from 'clsx'; 

export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any;
}

// Define the props, adding 'size' and 'showLabels'
interface DynamicPieChartProps {
  data: ChartDataItem[];
  title?: string | null;
  style?: string; 
  size?: 'small' | 'medium' | 'large'; 
  showLabels?: boolean; // ✅ ADDED: New prop to control labels
}

const COLORS = [
  '#650933', '#E4B587', '#FFBB28', '#FF8042',
  '#AF19FF', '#FF1943', '#3366E6', '#FF6633',
  '#FFB399', '#FF33FF', '#FFFF99', '#B34D4D'
];

const getChartDimensions = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
        case 'small':
            return { height: 180, innerRadius: 40, outerRadius: 70, legend: false }; 
        case 'large':
            return { height: 400, innerRadius: 100, outerRadius: 150, legend: true };
        case 'medium':
        default:
            return { height: 350, innerRadius: 80, outerRadius: 130, legend: true };
    }
}

export const PieChartt: React.FC<DynamicPieChartProps> = ({ 
  data, 
  title, 
  style, 
  size = 'medium', 
  showLabels = false // ✅ ADDED: Default to false
}) => {
  
  const { height, innerRadius, outerRadius, legend } = getChartDimensions(size);

  return (
    <div className={clsx('rounded-lg', style)}> 
      {title && ( 
          <h2 
            className="text-xl font-semibold  text-center"
            style={{ color: '#650933' }}
          >
            {title}
          </h2>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius} 
            outerRadius={outerRadius} 
            paddingAngle={2}
            fill="#8884d8"
            label={showLabels} // ✅ MODIFIED: Use the prop to show/hide labels
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          {legend && <Legend />} 
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};