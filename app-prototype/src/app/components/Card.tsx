import type { HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'story' | 'emotion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-white rounded-2xl shadow-sm border border-gray-100',
  story: 'bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all',
  emotion: 'bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all',
};

export function Card({ variant = 'default', className = '', children, ...rest }: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
