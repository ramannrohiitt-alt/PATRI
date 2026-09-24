import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: string[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  badge,
  icon,
  actions,
  breadcrumbs,
  className = '',
}) => {
  const displaySubtitle = subtitle || description;

  return (
    <div
      className={`bg-white/90 backdrop-blur-md border border-[#E7E0D2] p-4 md:p-5 rounded-2xl shadow-warm-sm flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#FAF5E4] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B4F] shrink-0 shadow-warm-xs">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400 mb-1 uppercase tracking-wider">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && <span>/</span>}
                  <span className={i === breadcrumbs.length - 1 ? 'text-accent-brown font-semibold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-bold text-stone-900 tracking-tight truncate font-sans">
              {title}
            </h2>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {displaySubtitle && (
            <p className="text-xs text-stone-500 truncate mt-0.5 max-w-2xl">{displaySubtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
};

export default PageHeader;
