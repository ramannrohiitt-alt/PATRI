import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showHindi?: boolean;
  showSubtitle?: boolean;
  className?: string;
  isDarkBackground?: boolean;
}

export const LogoIcon: React.FC<{ className?: string; size?: number | string }> = ({
  className = 'w-10 h-10',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="PATRI Logo Icon"
    >
      <defs>
        <linearGradient id="patriSquircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B39264" />
          <stop offset="50%" stopColor="#9C7B4F" />
          <stop offset="100%" stopColor="#785930" />
        </linearGradient>
      </defs>
      {/* Precision continuous curvature squircle from official design */}
      <path
        d="M 44 0 L 156 0 C 158.889069 0, 161.750381 .28181583, 164.583954 .84544748 C 167.417526 1.40907907, 170.16888 2.2436967, 172.83806 3.3492999 C 175.50722 4.4549026, 178.04289 5.8102484, 180.44507 7.4153361 C 182.84724 9.0204229, 185.06979 10.8444109, 187.11269 12.8873005 C 189.15558 14.9301891, 190.97955 17.152725, 192.58464 19.554907 C 194.18973 21.95709, 195.54507 24.492764, 196.65068 27.161926 C 197.75629 29.831089, 198.5909 32.582455, 199.15453 35.416019 C 199.71817 38.249588, 199.99998 41.110916, 200 44 L 200 156 C 199.99998 158.889069, 199.71817 161.750381, 199.15453 164.583954 C 198.59088 167.417526, 197.75627 170.16888, 196.65067 172.83806 C 195.54506 175.50722, 194.18971 178.04289, 192.58463 180.44507 C 190.97955 182.84724, 189.15558 185.06979, 187.11269 187.11269 C 185.06979 189.15558, 182.84724 190.97955, 180.44507 192.58464 C 178.04289 194.18973, 175.50722 195.54507, 172.83806 196.65068 C 170.16888 197.75629, 167.417526 198.5909, 164.583954 199.15453 C 161.750381 199.71817, 158.889069 199.99998, 156 200 L 44 200 C 41.110916 199.99998, 38.249588 199.71817, 35.416019 199.15453 C 32.582455 198.59088, 29.831089 197.75627, 27.161926 196.65067 C 24.492764 195.54506, 21.95709 194.18971, 19.554907 192.58463 C 17.152725 190.97955, 14.9301891 189.15558, 12.8873005 187.11269 C 10.8444109 185.06979, 9.0204229 182.84724, 7.4153361 180.44507 C 5.8102484 178.04289, 4.4549026 175.50722, 3.3492999 172.83806 C 2.2436967 170.16888, 1.40907907 167.417526, .84544748 164.583954 C .28181583 161.750381, 0 158.889069, 0 156 L 0 44 C 0 41.110916, .28181583 38.249588, .84544748 35.416019 C 1.40907907 32.582455, 2.2436967 29.831089, 3.3492999 27.161926 C 4.4549026 24.492764, 5.8102484 21.95709, 7.4153361 19.554907 C 9.0204229 17.152725, 10.8444109 14.9301891, 12.8873005 12.8873005 C 14.9301891 10.8444109, 17.152725 9.0204229, 19.554907 7.4153361 C 21.95709 5.8102484, 24.492764 4.4549026, 27.161926 3.3492999 C 29.831089 2.2436967, 32.582455 1.40907907, 35.416019 .84544748 C 38.249588 .28181583, 41.110916 0, 44 0 Z"
        fill="url(#patriSquircleGrad)"
      />
      {/* Converging Track Rails forming the letter 'A' */}
      <path
        d="M55 152 L100 55 L145 152"
        stroke="#FEFCE8"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 4 Track Sleepers / Ties */}
      <line x1="92.9" y1="70" x2="107.1" y2="70" stroke="#FEFCE8" strokeWidth="8" strokeLinecap="round" />
      <line x1="83.4" y1="90" x2="116.6" y2="90" stroke="#FEFCE8" strokeWidth="8" strokeLinecap="round" />
      <line x1="74" y1="110" x2="126" y2="110" stroke="#FEFCE8" strokeWidth="8" strokeLinecap="round" />
      <line x1="64.5" y1="130" x2="135.5" y2="130" stroke="#FEFCE8" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'compact',
  size = 'md',
  showHindi = true,
  showSubtitle = true,
  className = '',
  isDarkBackground = false,
}) => {
  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  if (variant === 'icon') {
    return <LogoIcon className={`${iconSizeMap[size]} ${className}`} />;
  }

  const titleColor = isDarkBackground ? 'text-white' : 'text-stone-900';
  const subtitleColor = isDarkBackground ? 'text-stone-400' : 'text-stone-500';

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        <LogoIcon className={`${iconSizeMap[size]} shadow-warm-md`} />
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`font-extrabold tracking-wider font-sans text-xl leading-none ${titleColor}`}>
              PATRI
            </span>
            {showHindi && (
              <span className="text-[#9C7B4F] font-bold text-sm leading-none font-sans">
                पट्री
              </span>
            )}
          </div>
          {showSubtitle && (
            <p className={`text-[10px] font-medium tracking-tight mt-1 leading-tight ${subtitleColor}`}>
              Predictive &amp; Adaptive Track Resource Intelligence
            </p>
          )}
        </div>
      </div>
    );
  }

  // Compact variant (standard for Sidebar header)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon className={`${iconSizeMap[size]} shadow-warm-sm`} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className={`font-extrabold font-mono tracking-wider text-base ${titleColor}`}>PATRI</span>
          {showHindi && (
            <span className="text-xs font-semibold text-[#9C7B4F]">
              पट्री
            </span>
          )}
          <span className="text-[9px] bg-[#FAF5E4] text-[#82653D] font-mono px-1.5 py-0.5 rounded-full border border-[#E7E0D2] ml-0.5">
            v1.0
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[10px] truncate max-w-[150px] leading-tight mt-0.5 ${subtitleColor}`}>
            Adaptive Track Intelligence
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
