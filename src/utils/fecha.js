import { addDays, format, parseISO } from 'date-fns'

/**
 * Manejo de fechas para la zona America/La_Paz (UTC-4, sin horario de verano).
 * Las fechas se guardan como 'YYYY-MM-DD' y las horas como 'HH:mm' (24 h),
 * igual que las expondrá la API de Django (DateField / TimeField).
 */
export const ZONA_HORARIA = 'America/La_Paz'

function partesLaPaz(date = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  return Object.fromEntries(partes.map((p) => [p.type, p.value]))
}

/** Fecha actual en La Paz, formato 'YYYY-MM-DD'. */
export function hoy() {
  const p = partesLaPaz()
  return `${p.year}-${p.month}-${p.day}`
}

/** Hora actual en La Paz, formato 'HH:mm'. */
export function ahora() {
  const p = partesLaPaz()
  return `${p.hour}:${p.minute}`
}

/** Suma días a una fecha ISO y devuelve otra fecha ISO. */
export function sumarDias(fechaISO, dias) {
  return format(addDays(parseISO(fechaISO), dias), 'yyyy-MM-dd')
}

/** Día de la semana (0 = domingo … 6 = sábado) de una fecha ISO. */
export function diaSemana(fechaISO) {
  return parseISO(fechaISO).getDay()
}

/** Lunes de la semana de la fecha dada. */
export function inicioSemana(fechaISO) {
  const d = diaSemana(fechaISO)
  const offset = d === 0 ? -6 : 1 - d
  return sumarDias(fechaISO, offset)
}

export function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function aHora(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function sumarMinutos(hhmm, minutos) {
  return aHora(aMinutos(hhmm) + minutos)
}

/** Compara fecha + hora con el momento actual en La Paz. */
export function esPasado(fechaISO, hhmm = '23:59') {
  const h = hoy()
  if (fechaISO < h) return true
  if (fechaISO > h) return false
  return aMinutos(hhmm) <= aMinutos(ahora())
}

export const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const NOMBRES_DIA_CORTO = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
