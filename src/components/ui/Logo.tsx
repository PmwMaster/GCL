// Logo GCL image component
export function Logo({ className = 'h-8', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <img src="/logo.png" className={className} alt="GCL Agency" />
  )
}

// Logo icon only (for small spaces like sidebar header)
export function LogoIcon({ className = 'h-8' }: { className?: string }) {
  return (
    <img src="/logo.png" className={className} alt="GCL" style={{ objectFit: 'contain' }} />
  )
}
