import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
}

export function IconButton({ icon: Icon, size = 20, className = '', ...props }: IconButtonProps) {
  return (
    <button type="button" className={`icon-btn ${className}`} {...props}>
      <Icon size={size} />
    </button>
  );
}
