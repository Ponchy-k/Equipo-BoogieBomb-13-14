// Datos de prueba. Reemplazar por GET /api/empleados/
// horario: clave = día de la semana (0 domingo … 6 sábado), valor = turnos del día.
const turnoPartido = [
  { inicio: '09:00', fin: '13:00' },
  { inicio: '14:00', fin: '19:00' },
]
const turnoTarde = [{ inicio: '12:00', fin: '20:00' }]
const sabado = [{ inicio: '09:00', fin: '15:00' }]

const semana = (lunVie, sab = sabado) => ({ 1: lunVie, 2: lunVie, 3: lunVie, 4: lunVie, 5: lunVie, 6: sab })

export const empleados = [
  { id: 'e1', nombre: 'Rodrigo Mamani Choque', especialidad: 'Barbero', estado: 'Disponible', activo: true,
    telefono: '+591 712 48 391', correo: 'rodrigo@lumina.bo',
    servicioIds: ['s9', 's10', 's11', 's12', 's13'], horario: semana(turnoPartido) },
  { id: 'e2', nombre: 'Andrea Flores Vargas', especialidad: 'Estilista', estado: 'Ocupado', activo: true,
    telefono: '+591 768 20 154', correo: 'andrea@lumina.bo',
    servicioIds: ['s1', 's2', 's3', 's8'], horario: semana(turnoPartido) },
  { id: 'e3', nombre: 'Luis Fernando Condori', especialidad: 'Barbero', estado: 'Disponible', activo: true,
    telefono: '+591 791 33 027', correo: 'luisfernando@lumina.bo',
    servicioIds: ['s9', 's10', 's11', 's13'], horario: semana(turnoTarde, [{ inicio: '10:00', fin: '16:00' }]) },
  { id: 'e4', nombre: 'Gabriela Rojas Salazar', especialidad: 'Estilista', estado: 'En descanso', activo: true,
    telefono: '+591 725 61 908', correo: 'gabriela@lumina.bo',
    servicioIds: ['s1', 's3', 's4', 's5', 's8'], horario: semana(turnoPartido) },
  { id: 'e5', nombre: 'Marcela Ticona Huanca', especialidad: 'Estilista', estado: 'Disponible', activo: true,
    telefono: '+591 776 04 512', correo: 'marcela@lumina.bo',
    servicioIds: ['s2', 's6', 's7'], horario: semana(turnoTarde) },
  { id: 'e6', nombre: 'Diego Quisbert Apaza', especialidad: 'Barbero', estado: 'Ocupado', activo: true,
    telefono: '+591 708 87 263', correo: 'diego@lumina.bo',
    servicioIds: ['s9', 's10', 's11', 's12'], horario: semana(turnoPartido) },
]
