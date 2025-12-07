import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { ChartConfig, DataPoint, ChartType } from '../types';
import { Settings2 } from 'lucide-react';

interface DynamicChartProps {
  config: ChartConfig;
  data: DataPoint[];
  onConfigChange?: (newConfig: ChartConfig) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const DynamicChart: React.FC<DynamicChartProps> = ({ config, data, onConfigChange }) => {
  const { type, xAxisKey, yAxisKey, title, color } = config;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        type: e.target.value as ChartType
      });
    }
  };

  // Increased margins to ensure labels are not cut off
  const themeProps = {
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const chartColor = color || COLORS[Math.floor(Math.random() * COLORS.length)];
  
  // Updated axis style: Visible lines, ticks, and better color contrast
  const axisStyle = { 
    stroke: '#94a3b8', // Lighter slate for better visibility on dark bg
    fontSize: 12, 
    tickLine: true,    // Show ticks
    axisLine: true,    // Show axis lines
    tickMargin: 8
  };

  const tooltipStyle = { 
    backgroundColor: '#0f172a', 
    borderColor: '#334155', 
    color: '#f8fafc',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    fontSize: '12px'
  };
  
  const gridStyle = {
    strokeDasharray: "3 3",
    stroke: "#334155",
    vertical: true // Enabled vertical grid lines for better readability
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} {...themeProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#334155', opacity: 0.2 }} />
            <Bar dataKey={yAxisKey} fill={chartColor} radius={[4, 4, 0, 0]} maxBarSize={60} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} {...themeProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={chartColor} 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: chartColor }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} {...themeProps}>
            <defs>
              <linearGradient id={`gradient-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={chartColor} 
              fill={`url(#gradient-${config.id})`} 
              strokeWidth={2}
            />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...themeProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} name={xAxisKey} {...axisStyle} />
            <YAxis dataKey={yAxisKey} name={yAxisKey} {...axisStyle} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
            <Scatter name={title} data={data} fill={chartColor} />
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              innerRadius={70}
              paddingAngle={2}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1e293b" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        );
      default:
        return null;
    }
  };

  const chartContent = renderChart();

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col h-[450px] overflow-hidden hover:border-slate-600 transition-colors group">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-start gap-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-slate-100 font-semibold text-base truncate" title={title}>{title}</h3>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1" title={config.description}>
            {config.description || `${xAxisKey} vs ${yAxisKey}`}
          </p>
        </div>
        
        {/* Type Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select 
              value={type}
              onChange={handleTypeChange}
              className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-md py-1 pl-2 pr-6 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-750 transition-colors"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="pie">Pie Chart</option>
            </select>
            <Settings2 className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-grow w-full min-h-0 min-w-0 relative">
        <div className="absolute inset-0 p-4">
          {chartContent ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartContent}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Unable to render chart
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
