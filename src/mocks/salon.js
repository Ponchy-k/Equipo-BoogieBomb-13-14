// Información fija del local y usuarios de demostración.
// Reemplazar por GET /api/salon/ y POST /api/auth/login/
export const salon = {
  nombre: 'Lumina',
  eslogan: 'Salón y barbería',
  direccion: 'Av. 20 de Octubre 2318, Sopocachi',
  ciudad: 'La Paz, Bolivia',
  telefono: '+591 2 241 7730',
  whatsapp: '59171248391',
  correo: 'hola@lumina.bo',
  horarios: [
    { dias: 'Lunes a viernes', horas: '09:00 - 20:00' },
    { dias: 'Sábado', horas: '09:00 - 16:00' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ],
}

export const usuariosDemo = {
  cliente: { id: 'u-cli', nombre: 'Valeria Quispe Mamani', correo: 'valeria.quispe@gmail.com', rol: 'cliente', clienteId: 'c1' },
  empleado: { id: 'u-emp', nombre: 'Rodrigo Mamani Choque', correo: 'rodrigo@lumina.bo', rol: 'empleado', empleadoId: 'e1' },
  admin: { id: 'u-adm', nombre: 'Carla Gutiérrez Rivero', correo: 'carla@lumina.bo', rol: 'admin' },
}

// Trabajos de la galería (las imágenes son placeholders de color).
export const galeria = [
  { id: 'g1', titulo: 'Balayage en tonos miel', categoria: 'Salón', tono: 2 },
  { id: 'g2', titulo: 'Degradado bajo con textura', categoria: 'Barbería', tono: 5 },
  { id: 'g3', titulo: 'Corte bob a la mandíbula', categoria: 'Salón', tono: 0 },
  { id: 'g4', titulo: 'Barba perfilada a navaja', categoria: 'Barbería', tono: 3 },
  { id: 'g5', titulo: 'Recogido para boda', categoria: 'Salón', tono: 1 },
]
