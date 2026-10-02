import { cloneElement, forwardRef, isValidElement, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/format'

const baseControl =
  'w-full rounded-control border bg-surface text-ink placeholder:text-ink-subtle ' +
  'transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ' +
  'disabled:bg-stone disabled:text-ink-muted'

const borde = (error) => (error ? 'border-danger' : 'border-line-strong')

/**
 * Envoltorio de formulario: label arriba, ayuda y error debajo.
 * Inyecta id, aria-invalid y aria-describedby en el control hijo.
 */
export function Field({ label, hint, error, required, children, className }) {
  const id = useId()
  const descId = `${id}-desc`
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': hint || error ? descId : undefined,
        error,
      })
    : children
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={children?.props?.id ?? id} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-ink-subtle font-normal"> (obligatorio)</span>}
        </label>
      )}
      {control}
      {(error || hint) && (
        <p id={descId} className={cn('text-sm', error ? 'text-danger' : 'text-ink-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, error, icon: Icon, ...props }, ref) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
        <input ref={ref} className={cn(baseControl, borde(error), 'h-11 pl-9 pr-3', className)} {...props} />
      </div>
    )
  }
  return <input ref={ref} className={cn(baseControl, borde(error), 'h-11 px-3', className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, error, rows = 3, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(baseControl, borde(error), 'px-3 py-2.5 resize-y', className)} {...props} />
})

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(baseControl, borde(error), 'h-11 appearance-none pl-3 pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
    </div>
  )
})

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn('inline-flex items-center gap-2.5 text-sm text-ink min-h-9', className)}>
      <input type="checkbox" className="size-4 rounded border-line-strong accent-accent" {...props} />
      {label}
    </label>
  )
}
