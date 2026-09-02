// Logo GCL inline SVG component – adapts to dark mode via currentColor
export function Logo({ className = 'h-8', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <svg
      viewBox="0 0 680 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GCL Agency"
    >
      {/* Barras ascendentes - identidade visual */}
      <rect x="193" y="100" width="30" height="60" rx="6" fill="#85B7EB" />
      <rect x="233" y="70" width="30" height="90" rx="6" fill="#378ADD" />
      <rect x="273" y="40" width="30" height="120" rx="6" fill="#185FA5" />

      {showText && (
        <>
          <text
            x="327"
            y="126"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="56"
            fontWeight="600"
            letterSpacing="1"
            fill="currentColor"
          >
            GCL
          </text>
          <text
            x="340"
            y="200"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="16"
            fill="currentColor"
            opacity="0.5"
            textAnchor="middle"
          >
            Desenvolvimento e inovação
          </text>
        </>
      )}
    </svg>
  )
}

// Logo icon only (for small spaces like sidebar header)
export function LogoIcon({ className = 'h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="180 30 135 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GCL"
    >
      <rect x="193" y="100" width="30" height="60" rx="6" fill="#85B7EB" />
      <rect x="233" y="70" width="30" height="90" rx="6" fill="#378ADD" />
      <rect x="273" y="40" width="30" height="120" rx="6" fill="#185FA5" />
    </svg>
  )
}
