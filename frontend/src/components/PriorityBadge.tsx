import React from 'react';

interface PriorityBadgeProps {
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score?: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ category, score }) => {
  const cat = (category || 'LOW').toUpperCase();

  let colorClasses = 'bg-[#FAF5E4] text-[#82653D] border-[#E7E0D2]';
  let dotColor = 'bg-[#9C7B4F]';
  let pulse = false;

  if (cat === 'CRITICAL') {
    colorClasses = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-600';
    pulse = true;
  } else if (cat === 'HIGH') {
    colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
    dotColor = 'bg-orange-600';
  } else if (cat === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-600';
  } else if (cat === 'LOW') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-600';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-warm-xs ${colorClasses}`}
    >
      <span className="relative flex items-center justify-center w-1.5 h-1.5">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${dotColor}`} />
      </span>
      <span>{cat}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({Math.round(score)})</span>
      )}
    </span>
  );
};

export default PriorityBadge;
