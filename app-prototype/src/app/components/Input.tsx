import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#55504A] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6660]">{icon}</div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border border-gray-200 bg-white text-[#35322B] placeholder:text-gray-400 py-3 ${
            icon ? 'pl-11' : 'pl-4'
          } pr-4 focus:outline-none focus:ring-2 focus:ring-[#6E4FD1] focus:border-transparent transition-all ${className}`}
          {...rest}
        />
      </div>
    </div>
  );
}
