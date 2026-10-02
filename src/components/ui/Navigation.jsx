import { useId, useRef } from 'react'
import { cn } from '../../utils/format'

/**
 * Pestañas accesibles (role=tablist, flechas izquierda/derecha).
 * tabs: [{ value, label, count? }]
 */
export function Tabs({ tabs, value, onChange, className, label = 'Secciones' }) {
  const refs = useRef([])
  const id = useId()
  const onKeyDown = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + tabs.length) % tabs.length
    refs.current[next]?.focus()
    onChange(tabs[next].value)
  }
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t, i) => {
        const activo = t.value === value
        return (
          <button
            key={t.value}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${id}-${t.value}`}
            aria-selected={activo}
            tabIndex={activo ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              '-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
              activo ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cn('tabular rounded-full px-1.5 text-xs', activo ? 'bg-ink text-bg' : 'bg-stone text-ink-muted')}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Control segmentado (radio group visual). options: [{ value, label, icon? }] */
export function Segmented({ options, value, onChange, label, className, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-control border border-line bg-stone p-1', className)}>
      {options.map((o) => {
        const activo = o.value === value
        const Icon = o.icon
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-control)-2px)] px-3 font-medium transition-[background-color,color,box-shadow] duration-200',
              size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm',
              activo ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink',
            )}
          >
            {Icon && <Icon className="size-4 max-sm:hidden" strokeWidth={1.75} aria-hidden="true" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Tabla ---------- */

export function Table({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-card border border-line bg-surface', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className, ...props }) {
  return (
    <th scope="col" className={cn('border-b border-line bg-stone/60 px-4 py-3 text-xs font-medium text-ink-muted', className)} {...props}>
      {children}
    </th>
  )
}

export function Td({ children, className, ...props }) {
  return (
    <td className={cn('border-b border-line px-4 py-3 align-middle text-ink [tr:last-child>&]:border-b-0', className)} {...props}>
      {children}
    </td>
  )
}
