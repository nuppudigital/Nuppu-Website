import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';

export function MobileScreen({
  children,
  bgClassName = 'bg-nuppu-page',
  statusBarDark = false,
  nav,
}: {
  children: ReactNode;
  bgClassName?: string;
  statusBarDark?: boolean;
  nav?: ReactNode;
}) {
  return (
    <div className="app-viewport">
      <div className={`phone-shell ${bgClassName}`}>
        <StatusBar dark={statusBarDark} />
        <div className="screen-scroll">{children}</div>
        {nav}
      </div>
    </div>
  );
}
