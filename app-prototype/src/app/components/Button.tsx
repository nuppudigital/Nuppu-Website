import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-outline';
  return <button className={`${base} w-full ${className}`} {...props} />;
}
