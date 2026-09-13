export function parseMinSec(value: string): number {
  const [min, sec] = value.split(':').map(Number);
  return min * 60 + sec;
}

export function formatMinSec(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const min = Math.floor(clamped / 60);
  const sec = clamped % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
