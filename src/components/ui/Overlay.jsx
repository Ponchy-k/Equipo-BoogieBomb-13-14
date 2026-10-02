import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '../../utils/format'
import { Button } from './Button'

/* ---------- Modal ---------- */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previo = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const primero = panelRef.current?.querySelector('[data-autofocus]') ?? panelRef.current?.querySelector(FOCUSABLE)
    primero?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.()
      if (e.key === 'Tab' && panelRef.current) {
        const nodos = [...panelRef.current.querySelectorAll(FOCUSABLE)]
        if (!nodos.length) return
        const [first, last] = [nodos[0], nodos.at(-1)]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previo?.focus?.()
    }
  }, [open])

  if (!open) return null
  const ancho = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size]

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/35" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-rise-in flex-col rounded-t-card border border-line bg-surface shadow-raised sm:rounded-card',
          ancho,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-2xl font-medium">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Cerrar" className="-mr-2">
            <X className="size-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', tone = 'primary', loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Volver
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-ink-muted">{description}</p>
    </Modal>
  )
}

/* ---------- Toast ---------- */

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const quitar = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const mostrar = useCallback(
    (tipo, mensaje) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t.slice(-2), { id, tipo, mensaje }])
      setTimeout(() => quitar(id), tipo === 'error' ? 6000 : 3800)
    },
    [quitar],
  )
  const api = useRef({ success: (m) => mostrar('success', m), error: (m) => mostrar('error', m) })

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-rise-in items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-raised"
          >
            {t.tipo === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={1.75} aria-hidden="true" />
            )}
            <p className="flex-1 text-sm text-ink">{t.mensaje}</p>
            <button onClick={() => quitar(t.id)} className="-mr-1 rounded p-1 text-ink-subtle hover:text-ink" aria-label="Cerrar aviso">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
