import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white shadow-md',
  secondary: 'bg-gradient-to-r from-[#B8DDB8] to-[#C9EDE1] text-[#2D3748] shadow-md',
  ghost: 'bg-white border-2 border-gray-200 text-[#2D3748] hover:border-[#A8D5E2]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`rounded-full font-semibold transition-all active:scale-95 ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
