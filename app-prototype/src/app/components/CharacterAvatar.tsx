export type Species = 'bunny' | 'bear' | 'cat' | 'fox';

interface SpeciesStyle {
  fur: string;
  furShade: string;
  shirt: string;
  shirtTrim: string;
}

const STYLES: Record<Species, SpeciesStyle> = {
  bunny: { fur: '#b7a3e6', furShade: '#9a82d1', shirt: '#f4b94f', shirtTrim: '#e2a23c' },
  bear: { fur: '#c99a68', furShade: '#b0824f', shirt: '#f6e3bd', shirtTrim: '#e3c98f' },
  cat: { fur: '#93b19f', furShade: '#7a9a87', shirt: '#f4c95a', shirtTrim: '#e0ad3d' },
  fox: { fur: '#e2915a', furShade: '#c9763f', shirt: '#a9c8e6', shirtTrim: '#8fb0d4' },
};

/**
 * Flat placeholder illustration standing in for real character art. The
 * production design has fully painted characters (see the shared design
 * file) — swap this component's markup for real assets when they land.
 */
export function CharacterAvatar({
  species,
  className = '',
  wheelchair = false,
}: {
  species: Species;
  className?: string;
  wheelchair?: boolean;
}) {
  const s = STYLES[species];

  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label={species}>
      {/* legs / seat */}
      {wheelchair ? (
        <g>
          <rect x="60" y="190" width="80" height="18" rx="9" fill={s.furShade} />
          <circle cx="55" cy="230" r="26" fill="none" stroke="#7c93a8" strokeWidth="6" />
          <circle cx="145" cy="230" r="26" fill="none" stroke="#7c93a8" strokeWidth="6" />
          <circle cx="55" cy="230" r="5" fill="#7c93a8" />
          <circle cx="145" cy="230" r="5" fill="#7c93a8" />
          <rect x="30" y="196" width="10" height="34" rx="4" fill="#93a9bd" />
        </g>
      ) : (
        <g>
          <rect x="68" y="196" width="24" height="42" rx="10" fill={s.fur} />
          <rect x="108" y="196" width="24" height="42" rx="10" fill={s.fur} />
          <ellipse cx="80" cy="242" rx="16" ry="8" fill={s.furShade} />
          <ellipse cx="120" cy="242" rx="16" ry="8" fill={s.furShade} />
        </g>
      )}

      {/* arms */}
      <rect x="40" y="140" width="20" height="52" rx="10" fill={s.fur} transform="rotate(-18 50 150)" />
      <rect x="140" y="140" width="20" height="52" rx="10" fill={s.fur} transform="rotate(18 150 150)" />

      {/* body / shirt */}
      <ellipse cx="100" cy="168" rx="46" ry="52" fill={s.shirt} />
      <rect x="60" y="150" width="80" height="12" fill={s.shirtTrim} opacity="0.6" />
      <rect x="60" y="176" width="80" height="12" fill={s.shirtTrim} opacity="0.6" />

      {/* head */}
      <circle cx="100" cy="88" r="58" fill={s.fur} />

      {/* species-specific ears */}
      {species === 'bunny' && (
        <>
          <ellipse cx="72" cy="24" rx="14" ry="42" fill={s.fur} transform="rotate(-10 72 24)" />
          <ellipse cx="128" cy="24" rx="14" ry="42" fill={s.fur} transform="rotate(10 128 24)" />
          <ellipse cx="72" cy="26" rx="7" ry="30" fill={s.furShade} transform="rotate(-10 72 26)" />
          <ellipse cx="128" cy="26" rx="7" ry="30" fill={s.furShade} transform="rotate(10 128 26)" />
        </>
      )}
      {species === 'bear' && (
        <>
          <circle cx="58" cy="42" r="20" fill={s.fur} />
          <circle cx="142" cy="42" r="20" fill={s.fur} />
          <circle cx="58" cy="42" r="10" fill={s.furShade} />
          <circle cx="142" cy="42" r="10" fill={s.furShade} />
        </>
      )}
      {species === 'cat' && (
        <>
          <path d="M52 50 L44 8 L82 34 Z" fill={s.fur} />
          <path d="M148 50 L156 8 L118 34 Z" fill={s.fur} />
          <path d="M56 46 L52 20 L74 36 Z" fill={s.furShade} />
          <path d="M144 46 L148 20 L126 36 Z" fill={s.furShade} />
        </>
      )}
      {species === 'fox' && (
        <>
          <path d="M50 44 L34 2 L80 30 Z" fill={s.fur} />
          <path d="M150 44 L166 2 L120 30 Z" fill={s.fur} />
          <path d="M54 40 L46 16 L72 32 Z" fill="#fbe8d8" />
          <path d="M146 40 L154 16 L128 32 Z" fill="#fbe8d8" />
        </>
      )}

      {/* face */}
      {species === 'fox' && <ellipse cx="100" cy="104" rx="30" ry="24" fill="#fbe8d8" />}
      <circle cx="82" cy="86" r="6" fill="#3a2f28" />
      <circle cx="118" cy="86" r="6" fill="#3a2f28" />
      <circle cx="70" cy="100" r="7" fill="#f2a488" opacity="0.7" />
      <circle cx="130" cy="100" r="7" fill="#f2a488" opacity="0.7" />
      {species === 'fox' || species === 'cat' ? (
        <path d="M92 104 L108 104 L100 114 Z" fill="#3a2f28" />
      ) : (
        <ellipse cx="100" cy="106" rx="6" ry="5" fill="#3a2f28" />
      )}
      <path d="M88 118 Q100 128 112 118" stroke="#3a2f28" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
