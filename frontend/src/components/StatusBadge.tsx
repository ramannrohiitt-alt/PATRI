import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = (status || 'pending').toLowerCase();

  let styles = 'bg-[#FAF5E4] text-[#82653D] border-[#E7E0D2]';

  if (s.includes('available') || s.includes('completed') || s.includes('approved')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (s.includes('planned') || s.includes('scheduled')) {
    styles = 'bg-[#FAF5E4] text-[#82653D] border-[#E0D7C4]';
  } else if (s.includes('active') || s.includes('in progress')) {
    styles = 'bg-orange-50 text-orange-800 border-orange-200';
  } else if (s.includes('critical') || s.includes('conflict') || s.includes('rejected')) {
    styles = 'bg-red-50 text-red-800 border-red-200';
  } else if (s.includes('pending')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-warm-xs ${styles}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
