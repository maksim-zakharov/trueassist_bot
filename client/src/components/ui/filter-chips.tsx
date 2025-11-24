import React from 'react';

export interface FilterChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto -mx-3 px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}>
      <div className="flex gap-2 w-fit">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              style={{
                backgroundColor: isSelected 
                  ? 'rgba(128, 128, 128, 0.2)' 
                  : 'transparent',
                color: isSelected 
                  ? 'var(--tg-theme-text-color, #000000)' 
                  : 'var(--tg-theme-hint-color)'
              }}
              className="rounded-full px-4 py-1.5 whitespace-nowrap text-sm font-medium transition-colors"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

