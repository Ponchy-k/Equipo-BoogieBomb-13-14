import { AlertCircle, Inbox, RotateCcw } from 'lucide-react'
import { cn, iniciales } from '../../utils/format'
import { tonoEstado } from '../../utils/estados'
import { Button } from './Button'

export function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('rounded-card border border-line bg-surface', className)} {...props}>
      {children}
    </Tag>
  )
}

const tonosBadge = {
  neutral: 'bg-stone text-ink-muted border-line',
  accent: 'bg-accent-soft text-accent-hover border-accent-line',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-surface text-ink border-line-strong',
}

export function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-control border px-2 py-0.5 text-xs font-medium',
        tonosBadge[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Badge cuyo tono se deduce del estado (cita, pedido, empleado, prioridad). */
export function StatusBadge({ estado, className }) {
  return (
    <Badge tone={tonoEstado(estado)} className={className}>
      {estado}
    </Badge>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-shimmer rounded-control bg-stone', className)} aria-hidden="true" />
}

export function SkeletonList({ rows = 4, className }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} role="status" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-6 w-20 sm:block" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-12 text-center', className)}>
      <span className="flex size-11 items-center justify-center rounded-full bg-stone text-ink-muted">
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-card border border-danger/25 bg-danger-soft/50 px-6 py-10 text-center', className)}>
      <AlertCircle className="size-6 text-danger" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <p className="font-medium text-ink">No pudimos cargar la información</p>
        <p className="mt-1 text-sm text-ink-muted">{error?.message ?? 'Intenta de nuevo en unos segundos.'}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

/**
 * Renderiza carga, error o vacío según el estado de un recurso.
 * Uso: <AsyncBoundary resource={r} empty={...} skeleton={...}>{(data) => ...}</AsyncBoundary>
 */
export function AsyncBoundary({ resource, skeleton, empty, isEmpty, children }) {
  const { data, loading, error, reload } = resource
  if (loading) return skeleton ?? <SkeletonList />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const vacio = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0
  if (vacio && empty) return empty
  return children(data)
}

export function Avatar({ nombre, size = 'md', className }) {
  const s = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' }[size]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-stone font-medium text-ink-muted border border-line', s, className)}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}

const gradientes = [
  'linear-gradient(140deg, var(--color-stone) 0%, var(--color-sand) 100%)',
  'linear-gradient(160deg, var(--color-accent-soft) 0%, var(--color-accent-line) 100%)',
  'linear-gradient(135deg, #e9e2d6 0%, #cfc4b2 100%)',
  'linear-gradient(150deg, #e4e3df 0%, #bdbab2 100%)',
  'linear-gradient(140deg, #dfe3d8 0%, #b9c0ad 100%)',
  'linear-gradient(150deg, #4a4741 0%, #2e2c28 100%)',
]

/** Placeholder neutro para imágenes (sin fotos reales). */
export function Placeholder({ tono = 0, icon: Icon, label, className, iconClassName }) {
  const oscuro = tono % gradientes.length === 5
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ backgroundImage: gradientes[tono % gradientes.length] }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 20%, rgb(255 255 255 / 0.35), transparent 55%)' }}
      />
      {Icon && (
        <Icon
          className={cn('relative size-8', oscuro ? 'text-sand/70' : 'text-ink/25', iconClassName)}
          strokeWidth={1.25}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="text-3xl font-medium md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon, tone, to, className }) {
  const alerta = tone === 'danger' || tone === 'warning'
  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        {Icon && (
          <Icon
            className={cn('size-4', alerta ? (tone === 'danger' ? 'text-danger' : 'text-warning') : 'text-ink-subtle')}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="tabular text-3xl font-medium tracking-tight text-ink">{value}</p>
      {hint && <p className={cn('text-sm', alerta ? (tone === 'danger' ? 'text-danger' : 'text-warning') : 'text-ink-muted')}>{hint}</p>}
      {to}
    </Card>
  )
}

export function Divider({ className }) {
  return <hr className={cn('border-line', className)} />
}
