import React from 'react';

export type StatusType = 'safe' | 'warning' | 'active' | 'critical' | 'ai' | 'neutral';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'sm',
  className = '',
}) => {
  const statusStyles: Record<
    StatusType,
    { dot: string; ping: string; border: string; text: string; bg: string }
  > = {
    safe: {
      dot: 'bg-emerald-600',
      ping: 'bg-emerald-400',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      bg: 'bg-emerald-50',
    },
    warning: {
      dot: 'bg-amber-600',
      ping: 'bg-amber-400',
      border: 'border-amber-200',
      text: 'text-amber-800',
      bg: 'bg-amber-50',
    },
    active: {
      dot: 'bg-orange-600',
      ping: 'bg-orange-400',
      border: 'border-orange-200',
      text: 'text-orange-800',
      bg: 'bg-orange-50',
    },
    critical: {
      dot: 'bg-red-600',
      ping: 'bg-red-400',
      border: 'border-red-200',
      text: 'text-red-800',
      bg: 'bg-red-50',
    },
    ai: {
      dot: 'bg-indigo-600',
      ping: 'bg-indigo-400',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      bg: 'bg-indigo-50',
    },
    neutral: {
      dot: 'bg-[#9C7B4F]',
      ping: 'bg-[#B39264]',
      border: 'border-[#E7E0D2]',
      text: 'text-[#82653D]',
      bg: 'bg-[#FAF5E4]',
    },
  };

  const current = statusStyles[status] || statusStyles.neutral;

  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  if (!label) {
    return (
      <span className={`relative flex items-center justify-center ${dotSize} ${className}`}>
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.ping}`}
        />
        <span className={`relative inline-flex rounded-full ${dotSize} ${current.dot}`} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <span className={`relative flex items-center justify-center ${dotSize}`}>
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.ping}`}
        />
        <span className={`relative inline-flex rounded-full ${dotSize} ${current.dot}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};

export default StatusIndicator;
