export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? '#ffffff' : 'currentColor';

  return (
    <div className="status-bar" style={dark ? { color: '#ffffff' } : undefined}>
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.5" fill={color} />
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill={color} />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill={color} />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill={color} />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={color} />
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill={color} />
          <rect x="21.5" y="4" width="2" height="4" rx="1" fill={color} />
        </svg>
      </span>
    </div>
  );
}
