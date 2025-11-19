import React from 'react';
import { LucideIcon } from 'lucide-react';
import MathDisplay from './MathDisplay';

interface VariableInputProps {
  label: string;
  symbol: string;
  value: number | null;
  onChange: (val: string) => void;
  unit: string;
  icon: LucideIcon;
  disabled?: boolean;
  placeholder?: string;
  highlight?: boolean;
}

const VariableInput: React.FC<VariableInputProps> = ({ 
  label, 
  symbol, 
  value, 
  onChange, 
  unit, 
  icon: Icon, 
  disabled = false,
  placeholder = "Unknown",
  highlight = false
}) => {
  return (
    <div className={`relative group transition-all duration-200`}>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label} (<MathDisplay latex={`$${symbol}$`} />)
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-4 w-4 transition-colors ${highlight ? 'text-indigo-500' : 'text-slate-400'}`} />
        </div>
        <input
          type="number"
          value={value === null ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-12 py-2.5 sm:text-sm rounded-lg shadow-sm outline-none transition-all
            border
            ${disabled 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
              : highlight
                ? 'bg-indigo-50/30 border-indigo-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-slate-300'
            }
          `}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-400 text-xs font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default VariableInput;