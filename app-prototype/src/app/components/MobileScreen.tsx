import type { ReactNode } from 'react';

export function MobileScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#D4C5F9]/15 via-white to-[#C9BBF5]/15 py-6">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ minHeight: 812 }}
      >
        {children}
      </div>
    </div>
  );
}
