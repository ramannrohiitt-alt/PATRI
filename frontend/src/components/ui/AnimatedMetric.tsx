import React from 'react';

interface AnimatedMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
  color?: 'brown' | 'green' | 'amber' | 'orange' | 'red' | 'indigo' | 'slate';
  className?: string;
}

export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  trendPositive = true,
  onClick,
  color = 'brown',
  className = '',
}) => {
  const colorMap = {
    brown: {
      text: 'text-[#82653D]',
      iconBg: 'bg-[#FAF5E4]',
      iconColor: 'text-[#9C7B4F]',
      borderHover: 'hover:border-[#9C7B4F]/50',
    },
    green: {
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400/60',
    },
    amber: {
      text: 'text-amber-700',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400/60',
    },
    orange: {
      text: 'text-orange-700',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderHover: 'hover:border-orange-400/60',
    },
    red: {
      text: 'text-red-700',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      borderHover: 'hover:border-red-400/60',
    },
    indigo: {
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderHover: 'hover:border-indigo-400/60',
    },
    slate: {
      text: 'text-stone-800',
      iconBg: 'bg-stone-100',
      iconColor: 'text-stone-600',
      borderHover: 'hover:border-stone-400/60',
    },
  };

  const scheme = colorMap[color] || colorMap.brown;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#E7E0D2] p-4 md:p-5 shadow-warm-sm transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-warm-md ${
        onClick ? 'cursor-pointer' : ''
      } ${scheme.borderHover} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-stone-600 truncate">{label}</span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${scheme.iconBg} ${scheme.iconColor}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${scheme.text}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-mono text-stone-500">{unit}</span>}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs gap-2 pt-2 border-t border-[#EFE9DC]/80">
          {subtext && <span className="text-stone-500 truncate text-[11px]">{subtext}</span>}
          {trend && (
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimatedMetric;
