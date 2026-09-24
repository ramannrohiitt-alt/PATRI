import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-[#E7E0D2] shadow-warm-sm">
      <div className="h-7 bg-[#EFE9DC] rounded-xl w-1/4"></div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-11 bg-[#F5EFE4] rounded-xl border border-[#E7E0D2]/70 w-full"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
