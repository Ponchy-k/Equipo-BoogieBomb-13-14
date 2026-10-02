import { Link } from 'react-router-dom'
import { Minus, Package, Plus } from 'lucide-react'
import { Placeholder } from '../ui'
import { cn, formatCurrency } from '../../utils/format'

export function ProductCard({ producto, className }) {
  const agotado = producto.stock === 0
  return (
    <Link
      to={`/tienda/${producto.id}`}
      className={cn('group flex flex-col gap-3 rounded-card focus-visible:outline-offset-4', className)}
    >
      <div className="relative overflow-hidden rounded-card border border-line">
        <Placeholder
          tono={producto.tono}
          icon={Package}
          className="aspect-[4/5] transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
        />
        {agotado && (
          <span className="absolute left-3 top-3 rounded-control bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted">Agotado</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="text-xs text-ink-muted">{producto.marca}</p>
        <p className="font-medium leading-snug text-ink group-hover:underline group-hover:underline-offset-4">{producto.nombre}</p>
        <p className="tabular mt-1 text-ink">{formatCurrency(producto.precio)}</p>
      </div>
    </Link>
  )
}

export function QuantityStepper({ value, onChange, max = 99, min = 1, label = 'Cantidad' }) {
  return (
    <div className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="flex h-full w-11 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
        aria-label="Restar uno"
      >
        <Minus className="size-4" />
      </button>
      <span className="tabular w-8 text-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="flex h-full w-11 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
        aria-label="Sumar uno"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
