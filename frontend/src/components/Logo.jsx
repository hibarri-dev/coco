const LETTERS = [
  'M87.16 16.54A50 50 0 1 0 87.16 83.46L71.18 69.07A28.5 28.5 0 1 1 71.18 30.93Z',
  'M99.16 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0ZM120.66 50a28.5 28.5 0 1 1 57 0a28.5 28.5 0 1 1 -57 0Z',
  'M298.32 16.54A50 50 0 1 0 298.32 83.46L282.34 69.07A28.5 28.5 0 1 1 282.34 30.93Z',
  'M310.32 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0ZM331.82 50a28.5 28.5 0 1 1 57 0a28.5 28.5 0 1 1 -57 0Z',
];

/**
 * Transparent vector CoCo logo. Inherits `currentColor`, so set the colour with a text-* class.
 * `tagline` toggles the "By Hibarri" line under the wordmark.
 */
export function Logo({ tagline = true, className = '', title = 'CoCo by Hibarri' }) {
  return (
    <svg
      viewBox={tagline ? '0 0 411 156' : '0 0 411 100'}
      className={className}
      fill="currentColor"
      role="img"
      aria-label={title}
    >
      <g fillRule="evenodd">
        {LETTERS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {tagline && (
        <text
          x="404"
          y="147"
          textAnchor="end"
          fontSize="27"
          fontWeight="400"
          letterSpacing="0.4"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          By Hibarri
        </text>
      )}
    </svg>
  );
}

/** Square brand mark: a single geometric C with the purple compute dot. */
export function LogoMark({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M46.86 18.62A20 20 0 1 0 46.86 45.38L40.47 39.63A11.4 11.4 0 1 1 40.47 24.37Z"
      />
      <circle cx="47.5" cy="32" r="4.6" fill="#9e00ff" />
    </svg>
  );
}
