import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, className = '', ...props }: ChipProps) {
  return <button type="button" className={`chip ${selected ? 'chip-selected' : ''} ${className}`} {...props} />;
}
