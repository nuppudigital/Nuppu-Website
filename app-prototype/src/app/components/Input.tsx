import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export function Input({ label, icon: Icon, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-nuppu-gray">{label}</span>}
      <div className="relative">
        {Icon && <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-nuppu-gray" />}
        <input
          className={`w-full rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3.5 text-base font-semibold text-nuppu-dark outline-none focus:border-nuppu-blue-deep ${
            Icon ? 'pl-11' : ''
          } ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
