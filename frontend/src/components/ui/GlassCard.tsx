import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  title,
  subtitle,
  action,
  headerBorder = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-white/90 backdrop-blur-md border border-[#E7E0D2] shadow-warm-sm ${
        interactive ? 'glass-panel-interactive cursor-pointer hover:border-[#9C7B4F]/40' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex items-center justify-between p-4 md:p-5 ${
            headerBorder ? 'border-b border-[#EFE9DC]' : ''
          }`}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-semibold text-stone-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={title ? 'p-4 md:p-5' : 'p-4 md:p-5'}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
