import { Link } from 'react-router-dom'
import { cn } from '../../utils/format'

export function Logo({ to = '/', className, compact = false }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 text-ink', className)} aria-label="Lumina, ir al inicio">
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-control bg-ink" aria-hidden="true">
        <span className="size-3.5 rounded-full border-2 border-accent-line" />
      </span>
      {!compact && <span className="font-display text-2xl font-semibold leading-none tracking-tight">Lumina</span>}
    </Link>
  )
}
