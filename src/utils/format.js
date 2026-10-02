import { format, parseISO, formatDistanceToNowStrict } from 'date-fns'
import { es } from 'date-fns/locale'

/** 120 → "Bs 120,00" · 1500.5 → "Bs 1.500,50" */
export function formatCurrency(valor) {
  const n = Number(valor) || 0
  const [entero, decimales] = Math.abs(n).toFixed(2).split('.')
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '-' : ''}Bs ${conMiles},${decimales}`
}

const limpiar = (s) => s.replace(/\./g, '')

/** '2026-10-02' → "jue 2 oct 2026" */
export function formatDate(fechaISO) {
  if (!fechaISO) return ''
  const d = parseISO(fechaISO)
  const dia = limpiar(format(d, 'EEE', { locale: es }))
  const mes = limpiar(format(d, 'MMM', { locale: es })).slice(0, 3)
  return `${dia} ${format(d, 'd')} ${mes} ${format(d, 'yyyy')}`
}

/** '2026-10-02' → "jue 2 oct" (sin año, para vistas compactas) */
export function formatDateShort(fechaISO) {
  if (!fechaISO) return ''
  return formatDate(fechaISO).replace(/ \d{4}$/, '')
}

/** '2026-10-02' → "jueves 2 de octubre" */
export function formatDateLong(fechaISO) {
  if (!fechaISO) return ''
  return format(parseISO(fechaISO), "EEEE d 'de' MMMM", { locale: es })
}

/** "09:00" → "09:00" (24 h). Admite también ISO completo. */
export function formatTime(hhmm) {
  if (!hhmm) return ''
  return hhmm.slice(0, 5)
}

export function formatRange(inicio, fin) {
  return `${formatTime(inicio)} - ${formatTime(fin)}`
}

export function formatDuration(minutos) {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function formatRelative(isoDateTime) {
  return formatDistanceToNowStrict(parseISO(isoDateTime), { locale: es, addSuffix: true })
}

export function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function cn(...clases) {
  return clases.filter(Boolean).join(' ')
}
