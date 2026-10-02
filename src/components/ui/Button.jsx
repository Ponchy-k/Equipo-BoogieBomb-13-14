import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/format'

const variantes = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover border border-transparent',
  dark: 'bg-ink text-bg hover:bg-ink/90 border border-transparent',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-stone',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-stone',
  danger: 'bg-surface text-danger border border-danger/40 hover:bg-danger-soft',
}

const tamanos = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-[15px] gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-11 w-11 justify-center',
  'icon-sm': 'h-9 w-9 justify-center',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, loading = false, disabled, className, children, icon: Icon, ...props },
  ref,
) {
  const clases = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-control font-medium select-none',
    'transition-[background-color,border-color,color,transform] duration-200 ease-out-soft',
    'active:translate-y-px disabled:opacity-50 disabled:pointer-events-none',
    variantes[variant],
    tamanos[size],
    className,
  )
  const contenido = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      )}
      {children}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={clases} {...props}>
        {contenido}
      </Link>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={clases} {...props}>
        {contenido}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" className={clases} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {contenido}
    </button>
  )
})
