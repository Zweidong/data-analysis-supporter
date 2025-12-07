import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ChartConfig, ChartType } from '../types';

interface ChartBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ChartConfig) => void;
  columns: string[];
}

export const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({ isOpen, onClose, onSave, columns }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = useState(columns[0] || '');
  const [yAxisKey, setYAxisKey] = useState(columns[1] || columns[0] || '');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: ChartConfig = {
      id: Date.now().toString(),
      title: title || 'New Chart',
      description,
      type,
      xAxisKey,
      yAxisKey,
      color: '#3b82f6' // Default blue
    };
    onSave(newConfig);
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('bar');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Create New Chart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Chart Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Revenue Trend"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Chart Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as ChartType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="pie">Pie Chart</option>
                  </select>
               </div>
               <div>
                 {/* Empty spacer or Color picker could go here */}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {type === 'pie' ? 'Category (Labels)' : 'X Axis (Category)'}
                </label>
                <select 
                  value={xAxisKey}
                  onChange={(e) => setXAxisKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                   {type === 'pie' ? 'Value (Size)' : 'Y Axis (Values)'}
                </label>
                <select 
                  value={yAxisKey}
                  onChange={(e) => setYAxisKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                   {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this chart shows..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Add Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
