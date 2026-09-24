import React from 'react';

export type ButtonVariant = 'primary' | 'pale' | 'secondary' | 'success' | 'danger' | 'indigo' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-xs font-semibold gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5 rounded-xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#9C7B4F] hover:bg-[#8C6D42] text-[#FEFCE8] border border-[#8C6D42] shadow-warm-sm hover:shadow-glow-brown active:scale-[0.98]',
    pale:
      'bg-[#FEFCE8] hover:bg-[#FFFDF0] text-[#1C1917] border border-[#E7E0D2] shadow-warm-xs hover:border-[#9C7B4F]/50 active:scale-[0.98]',
    secondary:
      'bg-[#FAF6EE] hover:bg-[#F5EFE4] text-stone-800 border border-[#E7E0D2] shadow-warm-xs hover:border-[#D5CBB8] active:scale-[0.98]',
    success:
      'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-800 shadow-warm-sm hover:shadow-emerald-700/20 active:scale-[0.98]',
    danger:
      'bg-red-700 hover:bg-red-600 text-white border border-red-800 shadow-warm-sm hover:shadow-red-700/20 active:scale-[0.98]',
    indigo:
      'bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-800 shadow-warm-sm hover:shadow-indigo-700/20 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#FAF6EE] text-stone-700 hover:text-stone-900 border border-transparent active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default GlowButton;
