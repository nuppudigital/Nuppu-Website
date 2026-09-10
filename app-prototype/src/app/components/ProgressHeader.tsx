import { ChevronLeft } from 'lucide-react';
import { IconButton } from './IconButton';

export function ProgressHeader({
  onBack,
  progress,
  stepLabel,
  title,
}: {
  onBack: () => void;
  progress?: number;
  stepLabel?: string;
  title?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 pt-2 pb-2">
      <IconButton icon={ChevronLeft} onClick={onBack} aria-label="Back" />
      {progress !== undefined ? (
        <div className="flex-1 h-2 rounded-full bg-nuppu-border overflow-hidden">
          <div
            className="h-full bg-nuppu-blue-deep rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      ) : (
        title && <h1 className="font-display font-bold text-lg flex-1">{title}</h1>
      )}
      {stepLabel && <span className="text-sm font-bold text-nuppu-gray shrink-0">{stepLabel}</span>}
    </div>
  );
}
