import { useState, useEffect, useRef } from 'react';
import { createIcons, icons } from 'lucide';

const allIcons = {
  ...icons,
  Instagram: [
    ['rect', { width: '20', height: '20', x: '2', y: '2', rx: '5', ry: '5' }],
    ['path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }],
    ['line', { x1: '17.5', x2: '17.51', y1: '6.5', y2: '6.5' }],
  ],
  Facebook: [
    ['path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' }],
  ],
};

export default function App() {
  // 1. Estados requeridos de la aplicación
  const [carritoContador, setCarritoContador] = useState(0);
  const [servicioActual, setServicioActual] = useState('Corte de Autor & Styling');
  const [precioActual, setPrecioActual] = useState('Bs. 45.00');
  const [estilistaActual, setEstilistaActual] = useState('Valeria Dumas (Master Colorist)');
  const [fechaActual, setFechaActual] = useState('Martes, 13 Octubre');
  const [horaActual, setHoraActual] = useState('11:30 AM');

  // Estados booleanos para visibilidad de Modal y Toast
  const [modalAbierto, setModalAbierto] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('Producto añadido con éxito');

  // Estados interactivos adicionales
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [cartBadgeAnimated, setCartBadgeAnimated] = useState(false);

  const toastTimeoutRef = useRef(null);

  // Inicializar Lucide Icons en cada render
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    } else {
      createIcons({ icons: allIcons });
    }
  });

  // Manejador para cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalAbierto(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notificación Toast con debounce
  const mostrarToast = (mensaje) => {
    setToastMensaje(mensaje);
    setToastVisible(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Añadir al carrito
  const anadirAlCarrito = (nombreProducto, precio) => {
    setCarritoContador((prev) => prev + 1);
    setCartBadgeAnimated(true);
    setTimeout(() => setCartBadgeAnimated(false), 200);
    mostrarToast(`Añadido: ${nombreProducto} (Bs. ${precio.toFixed(2)})`);
  };

  // Botón carrito en el Header
  const handleCartClick = () => {
    if (carritoContador === 0) {
      mostrarToast('Tu bolsa está vacía. Añade productos desde la tienda.');
    } else {
      mostrarToast(`Tienes ${carritoContador} producto(s) en tu bolsa`);
    }
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Seleccionar Servicio desde las tarjetas
  const seleccionarServicio = (servicio, precio) => {
    setServicioActual(servicio);
    setPrecioActual(precio);
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
    mostrarToast(`Servicio seleccionado: ${servicio}`);
  };

  // Lista de Estilistas
  const estilistas = [
    {
      id: 'valeria',
      nombre: 'Valeria Dumas',
      rol: 'Master Colorist',
      displayTag: 'Valeria Dumas (Master Colorist)',
      label: 'Valeria D.',
      sublabel: 'Colorista Master',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'mateo',
      nombre: 'Mateo Ross',
      rol: 'Corte & Estilo',
      displayTag: 'Mateo Ross (Corte & Estilo)',
      label: 'Mateo R.',
      sublabel: 'Diseño & Corte',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'cualquiera',
      nombre: 'Cualquiera disponible',
      rol: 'Asignación Óptima',
      displayTag: 'Cualquiera disponible (Asignación Óptima)',
      label: 'Cualquiera',
      sublabel: 'Más rápido',
      avatar: null,
    },
  ];

  // Lista de Días
  const dias = [
    { fecha: 'Lunes, 12 Octubre', dia: 'Lun', num: '12', estado: 'Libre', color: 'text-emerald-600', hideSm: false },
    { fecha: 'Martes, 13 Octubre', dia: 'Mar', num: '13', estado: 'Hoy', color: 'text-brand-200', hideSm: false },
    { fecha: 'Miércoles, 14 Octubre', dia: 'Mié', num: '14', estado: 'Libre', color: 'text-emerald-600', hideSm: false },
    { fecha: 'Jueves, 15 Octubre', dia: 'Jue', num: '15', estado: '3 citas', color: 'text-amber-600', hideSm: false },
    { fecha: 'Viernes, 16 Octubre', dia: 'Vie', num: '16', estado: 'Libre', color: 'text-emerald-600', hideSm: false },
    { fecha: 'Sábado, 17 Octubre', dia: 'Sáb', num: '17', estado: 'Últimos', color: 'text-amber-600', hideSm: true },
  ];

  // Lista de Horas
  const horas = [
    { hora: '10:00 AM', icon: 'sun', iconColor: 'text-amber-500', disabled: false },
    { hora: '11:30 AM', icon: 'sun', iconColor: 'text-champagne', disabled: false },
    { hora: '02:30 PM', icon: 'sunset', iconColor: 'text-brand-600', disabled: false },
    { hora: '04:00 PM', icon: 'sunset', iconColor: 'text-brand-600', disabled: false },
    { hora: '05:30 PM', icon: 'moon', iconColor: 'text-indigo-400', disabled: false },
    { hora: '07:00 PM', icon: 'moon', iconColor: 'text-indigo-400', disabled: false },
    { hora: '01:00 PM', disabled: true },
    { hora: '03:15 PM', disabled: true },
  ];

  return (
    <div className="bg-brand-50 text-noir font-sans antialiased selection:bg-brand-200 selection:text-noir-soft min-h-screen">
      {/* TOAST NOTIFICACIÓN FLOTANTE */}
      <div
        id="toastNotification"
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 flex items-center gap-3 bg-noir text-white px-5 py-3.5 rounded-2xl shadow-elevated border border-brand-800 ${
          toastVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <i data-lucide="check-circle" className="w-5 h-5 text-champagne shrink-0"></i>
        <span id="toastMessage" className="text-sm font-medium">
          {toastMensaje}
        </span>
      </div>

      {/* HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-200/70 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <a href="#" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform duration-300">
                <i data-lucide="sparkles" className="w-5 h-5 text-brand-600"></i>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold tracking-tight text-noir group-hover:text-brand-700 transition-colors">
                  Boutique <span className="italic font-normal text-brand-600">de la Belleza</span>
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-noir-muted font-medium">
                  Haute Coiffure & Spa
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-noir-soft">
              <a
                href="#servicios"
                className="hover:text-brand-600 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-500 hover:after:w-full after:transition-all"
              >
                Servicios
              </a>
              <a
                href="#reserva"
                className="hover:text-brand-600 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-500 hover:after:w-full after:transition-all"
              >
                Reservar Cita
              </a>
              <a
                href="#productos"
                className="hover:text-brand-600 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-500 hover:after:w-full after:transition-all"
              >
                Tienda
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Carrito Contador */}
              <button
                id="cartBtn"
                onClick={handleCartClick}
                className="relative p-2.5 rounded-full hover:bg-brand-100 text-noir transition-colors"
                title="Ver carrito"
              >
                <i data-lucide="shopping-bag" className="w-5 h-5"></i>
                <span
                  id="cartCountBadge"
                  className={`absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white transition-transform duration-200 ${
                    cartBadgeAnimated ? 'scale-125' : ''
                  }`}
                >
                  {carritoContador}
                </span>
              </button>

              {/* Botón CTA Header */}
              <a
                href="#reserva"
                className="hidden sm:inline-flex items-center gap-2 bg-noir hover:bg-brand-800 text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <i data-lucide="calendar" className="w-4 h-4 text-champagne"></i>
                <span>Reservar Cita</span>
              </a>

              {/* Botón Móvil Menú */}
              <button
                id="mobileMenuBtn"
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className="md:hidden p-2.5 rounded-xl hover:bg-brand-100 text-noir transition-colors focus:outline-none"
                aria-label="Abrir menú"
              >
                <i id="menuIcon" data-lucide={menuMovilAbierto ? 'x' : 'menu'} className="w-6 h-6"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        <div
          id="mobileMenu"
          className={`${
            menuMovilAbierto ? 'block' : 'hidden'
          } md:hidden bg-white border-b border-brand-200 px-6 py-6 space-y-4 shadow-lg`}
        >
          <a
            href="#servicios"
            onClick={() => setMenuMovilAbierto(false)}
            className="block text-base font-medium text-noir hover:text-brand-600 mobile-nav-link"
          >
            Catálogo de Servicios
          </a>
          <a
            href="#reserva"
            onClick={() => setMenuMovilAbierto(false)}
            className="block text-base font-medium text-noir hover:text-brand-600 mobile-nav-link"
          >
            Agendar Cita
          </a>
          <a
            href="#productos"
            onClick={() => setMenuMovilAbierto(false)}
            className="block text-base font-medium text-noir hover:text-brand-600 mobile-nav-link"
          >
            Tienda de Productos
          </a>
          <div className="pt-4 border-t border-brand-100">
            <a
              href="#reserva"
              onClick={() => setMenuMovilAbierto(false)}
              className="w-full flex items-center justify-center gap-2 bg-noir text-white font-medium py-3 rounded-xl shadow-md mobile-nav-link"
            >
              <i data-lucide="calendar" className="w-4 h-4 text-champagne"></i>
              <span>Reservar Cita Ahora</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-100/50 via-brand-50 to-brand-50">
          {/* Decoración de fondo sutil */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-roseaccent/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Contenido Texto Hero (Mobile-First) */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Badge Superior */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-300/80 shadow-soft text-xs font-semibold tracking-wide text-brand-700 uppercase">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                  Atención Exclusiva & Personalizada
                </div>

                {/* Título Principal */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-noir font-bold tracking-tight leading-[1.15]">
                  Realza tu esencia con el arte del{' '}
                  <span className="italic font-normal text-brand-600 underline decoration-brand-300 decoration-wavy decoration-1 underline-offset-8">
                    estilismo de autor
                  </span>
                  .
                </h1>

                {/* Subtítulo */}
                <p className="text-base sm:text-lg text-noir-muted max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  En <strong className="text-noir font-medium">Boutique de la Belleza</strong> fusionamos técnicas de
                  vanguardia, diagnóstico capilar milimétrico y una atmósfera de calma y sofisticación pensada para ti.
                </p>

                {/* Acciones CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#reserva"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-noir hover:bg-brand-800 text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 shadow-elevated hover:shadow-glow transform hover:-translate-y-0.5"
                  >
                    <i data-lucide="sparkles" className="w-5 h-5 text-champagne"></i>
                    <span>Reservar Cita</span>
                  </a>

                  <a
                    href="#servicios"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-100 text-noir border border-brand-300/80 font-medium px-7 py-4 rounded-full text-base transition-all duration-200 shadow-soft"
                  >
                    <span>Ver Servicios</span>
                    <i data-lucide="arrow-down" className="w-4 h-4 text-brand-600"></i>
                  </a>
                </div>

                {/* Social Proof / Métricas de confianza */}
                <div className="pt-6 border-t border-brand-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img
                        className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Cliente"
                      />
                      <img
                        className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Cliente"
                      />
                      <img
                        className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Cliente"
                      />
                    </div>
                    <div>
                      <div className="flex items-center text-amber-500 text-xs">
                        ★★★★★ <span className="ml-1 text-noir font-bold text-xs">4.9/5</span>
                      </div>
                      <span className="text-xs text-noir-muted">+1,200 reseñas verificadas</span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-brand-200 hidden sm:block"></div>

                  <div>
                    <span className="block text-xl font-bold font-serif text-noir">10+ Años</span>
                    <span className="text-xs text-noir-muted">Creando estilos únicos</span>
                  </div>
                </div>
              </div>

              {/* Imagen / Composición Visual Hero */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                  {/* Marco Principal */}
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated border-4 border-white aspect-[4/5] bg-brand-200">
                    <img
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80"
                      alt="Instalaciones Boutique de la Belleza"
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <span className="text-xs font-semibold uppercase tracking-wider text-champagne">
                        Colección Otoño / Invierno
                      </span>
                      <p className="font-serif text-xl font-semibold mt-0.5">Diagnóstico Capilar Gratuito</p>
                      <p className="text-xs text-white/80">Incluido en tu primera reserva</p>
                    </div>
                  </div>

                  {/* Tarjeta Flotante: Experiencia VIP */}
                  <div className="absolute -bottom-6 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-elevated border border-brand-200 flex items-center gap-3.5 max-w-xs">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                      <i data-lucide="award" className="w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-noir uppercase tracking-wider">Productos Premium</h4>
                      <p className="text-[11px] text-noir-muted">Formulaciones orgánicas y libres de sulfatos.</p>
                    </div>
                  </div>

                  {/* Badge Flotante Superior */}
                  <div className="absolute -top-4 -right-4 sm:-right-6 z-20 bg-noir text-white px-4 py-2 rounded-2xl shadow-elevated border border-brand-800 flex items-center gap-2">
                    <i data-lucide="coffee" className="w-4 h-4 text-champagne"></i>
                    <span className="text-xs font-medium">Bebida de cortesía</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VENTAJAS / VALUE PROPOSITION */}
        <section className="py-10 bg-white border-y border-brand-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-3">
                <i data-lucide="scissors" className="w-6 h-6 mx-auto mb-2 text-brand-600"></i>
                <h4 className="font-bold text-sm text-noir">Cortes de Autor</h4>
                <p className="text-xs text-noir-muted mt-1">Diseñados para tu fisonomía</p>
              </div>
              <div className="p-3">
                <i data-lucide="palette" className="w-6 h-6 mx-auto mb-2 text-brand-600"></i>
                <h4 className="font-bold text-sm text-noir">Coloración High-End</h4>
                <p className="text-xs text-noir-muted mt-1">Balayage & tonos luminosos</p>
              </div>
              <div className="p-3">
                <i data-lucide="leaf" className="w-6 h-6 mx-auto mb-2 text-brand-600"></i>
                <h4 className="font-bold text-sm text-noir">Cosmética Vegana</h4>
                <p className="text-xs text-noir-muted mt-1">Cuidado libre de crueldad</p>
              </div>
              <div className="p-3">
                <i data-lucide="clock" className="w-6 h-6 mx-auto mb-2 text-brand-600"></i>
                <h4 className="font-bold text-sm text-noir">Puntualidad Absoluta</h4>
                <p className="text-xs text-noir-muted mt-1">Tu tiempo es sagrado</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: CATÁLOGO DE SERVICIOS */}
        <section id="servicios" className="py-16 md:py-24 bg-brand-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header de Sección */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
                Nuestra Carta
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-noir mt-3">
                Catálogo de Servicios Exclusivos
              </h2>
              <p className="text-noir-muted text-sm sm:text-base mt-3">
                Selecciona tu tratamiento preferido para incluirlo en tu sesión de belleza personalizada.
              </p>
            </div>

            {/* Grid de Servicios (Mobile First: 1 col -> 2 col -> 3 col) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Servicio 1: Corte de Autor */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=700&q=80"
                      alt="Corte & Styling Personalizado"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-noir text-champagne text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Más Solicitado
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>50 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Corte de Autor & Styling
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 45.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      Asesoría visagista, lavado relajante con masaje craneal, corte personalizado y peinado profesional con
                      acabado de pasarela.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Lavado Spa
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Styling Térmico
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Corte de Autor & Styling', 'Bs. 45.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>

              {/* Servicio 2: Balayage & Colorimetría */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80"
                      alt="Balayage y Tinte Premium"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Color Exclusivo
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>180 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Balayage & Efectos de Luz
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 120.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      Degradado a mano alzada para un brillo multidimensional. Incluye matización de alta pureza y
                      tratamiento protector de enlaces Plex.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Protector Plex
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Matización
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Balayage & Efectos de Luz', 'Bs. 120.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>

              {/* Servicio 3: Botox Capilar & Hidratación */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80"
                      alt="Tratamiento Capilar Intensivo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>75 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Botox Capilar & Reconstrucción
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 70.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      Inyección de ácido hialurónico, colágeno y aminoácidos para sellar cutículas, eliminar el frizz y
                      devolver sedosidad al cabello castigado.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Anti-Frizz
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Brillo Espejo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Botox Capilar & Reconstrucción', 'Bs. 70.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>

              {/* Servicio 4: Manicura & Spa de Uñas */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80"
                      alt="Spa de Uñas y Esmaltado Semipermanente"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>60 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Spa de Manos & Semipermanente
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 35.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      Exfoliación con sales marinas, nutrición de cutículas, masaje relajante y esmaltado en gel de larga
                      duración con secado LED.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Gel 21 días
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Masaje Spa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Spa de Manos & Semipermanente', 'Bs. 35.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>

              {/* Servicio 5: Alisado Orgánico Taninoplastia */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=700&q=80"
                      alt="Alisado Taninoplastia Orgánica"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>150 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Alisado Orgánico Tanino
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 140.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      0% formaldehído. Alisado natural con extractos botánicos que reestructura la fibra capilar manteniendo
                      movimiento natural y brillo cristalino.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        0% Formol
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Efecto 4-6 meses
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Alisado Orgánico Tanino', 'Bs. 140.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>

              {/* Servicio 6: Peinado Novias & Eventos */}
              <div className="service-card group bg-white rounded-3xl overflow-hidden border border-brand-200/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-brand-100">
                    <img
                      src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=700&q=80"
                      alt="Peinado Novias y Ocasiones Especiales"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-noir px-3 py-1 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-brand-600"></i>
                      <span>90 min</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-noir group-hover:text-brand-600 transition-colors">
                        Recogidos & Peinados de Gala
                      </h3>
                      <span className="text-xl font-bold text-noir font-serif shrink-0 ml-2">Bs. 65.00</span>
                    </div>
                    <p className="text-xs sm:text-sm text-noir-muted leading-relaxed mb-4">
                      Creaciones elegantes para bodas, galas y ocasiones inolvidables. Incluye preparación de textura,
                      fijación invisible y colocación de tocados.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Novias & Fiesta
                      </span>
                      <span className="text-[11px] bg-brand-100 text-brand-800 font-medium px-2.5 py-0.5 rounded-md">
                        Larga Duración
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => seleccionarServicio('Recogidos & Peinados de Gala', 'Bs. 65.00')}
                    className="w-full bg-brand-100 hover:bg-noir text-noir hover:text-white font-medium py-3 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 group-hover:bg-noir group-hover:text-white"
                  >
                    <i data-lucide="check" className="w-4 h-4"></i>
                    <span>Elegir para mi cita</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: SIMULACIÓN DE CALENDARIO Y AGENDAMIENTO */}
        <section id="reserva" className="py-16 md:py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
                Agenda Online
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-noir mt-3">
                Elige el Momento Ideal para Ti
              </h2>
              <p className="text-noir-muted text-sm sm:text-base mt-2">
                Simulador visual e interactivo: selecciona tu día, horario preferido y especialista.
              </p>
            </div>

            {/* Módulo de Reserva Interactivo */}
            <div className="max-w-5xl mx-auto bg-brand-50/70 border border-brand-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-elevated">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Selector de Día y Hora */}
                <div className="lg:col-span-7 space-y-7">
                  {/* 1. Selección de Estilista */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-noir-muted mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-noir text-white text-[10px] flex items-center justify-center">
                        1
                      </span>
                      Selecciona tu Estilista
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {estilistas.map((item) => {
                        const isSelected = estilistaActual === item.displayTag;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setEstilistaActual(item.displayTag)}
                            className={`stylist-btn p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
                              isSelected
                                ? 'active-stylist border-brand-600 bg-white'
                                : 'border-transparent bg-white hover:border-brand-300'
                            }`}
                          >
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.nombre}
                                className={`w-10 h-10 rounded-full object-cover mb-2 ring-2 ${
                                  isSelected ? 'ring-brand-300' : 'ring-brand-200'
                                }`}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 mb-2 font-bold text-xs">
                                ✨
                              </div>
                            )}
                            <span className="text-xs font-bold text-noir block">{item.label}</span>
                            <span
                              className={`text-[10px] ${isSelected ? 'text-brand-600' : 'text-noir-muted'}`}
                            >
                              {item.sublabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Simulación de Calendario (Días de la semana) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-noir-muted flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-noir text-white text-[10px] flex items-center justify-center">
                          2
                        </span>
                        Selecciona el Día
                      </label>
                      <span className="text-xs font-medium text-brand-700 flex items-center gap-1">
                        <i data-lucide="calendar" className="w-3.5 h-3.5"></i>
                        Octubre 2026
                      </span>
                    </div>

                    {/* Carrusel / Fila de Días Interactiva */}
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2" id="daysContainer">
                      {dias.map((d) => {
                        const isSelected = fechaActual === d.fecha;
                        return (
                          <button
                            key={d.num}
                            type="button"
                            onClick={() => setFechaActual(d.fecha)}
                            className={`day-slot p-3 rounded-2xl text-center transition-all ${
                              d.hideSm ? 'hidden sm:block' : ''
                            } ${
                              isSelected
                                ? 'active-day border-2 border-brand-600 bg-noir text-white shadow-md'
                                : 'border border-brand-200 bg-white hover:border-brand-500'
                            }`}
                          >
                            <span
                              className={`block text-[10px] uppercase font-bold ${
                                isSelected ? 'text-champagne' : 'text-noir-muted'
                              }`}
                            >
                              {d.dia}
                            </span>
                            <span
                              className={`block text-base sm:text-lg font-bold my-0.5 ${
                                isSelected ? 'text-white' : 'text-noir'
                              }`}
                            >
                              {d.num}
                            </span>
                            <span className={`block text-[9px] font-medium ${d.color}`}>{d.estado}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Selección de Hora */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-noir-muted mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-noir text-white text-[10px] flex items-center justify-center">
                        3
                      </span>
                      Selecciona la Hora
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="hoursContainer">
                      {horas.map((h, idx) => {
                        if (h.disabled) {
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled
                              className="p-3 rounded-xl border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-400 cursor-not-allowed flex items-center justify-center gap-1.5 line-through"
                            >
                              <span>{h.hora}</span>
                            </button>
                          );
                        }

                        const isSelected = horaActual === h.hora;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setHoraActual(h.hora)}
                            className={`hour-slot p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'active-hour border-2 border-brand-600 bg-noir text-white shadow'
                                : 'border border-brand-200 bg-white text-noir hover:border-brand-500'
                            }`}
                          >
                            <i
                              data-lucide={h.icon}
                              className={`w-3.5 h-3.5 ${isSelected ? 'text-champagne' : h.iconColor}`}
                            ></i>
                            <span>{h.hora}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Tarjeta Resumen de Cita */}
                <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-brand-200 shadow-soft">
                  <div className="flex items-center justify-between pb-4 border-b border-brand-100">
                    <h4 className="font-serif text-lg font-bold text-noir">Resumen de tu Cita</h4>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Espacio Reservable
                    </span>
                  </div>

                  {/* Detalle dinámico */}
                  <div className="py-5 space-y-4 text-sm">
                    {/* Servicio Elegido */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0 mt-0.5">
                          <i data-lucide="scissors" className="w-4 h-4"></i>
                        </div>
                        <div>
                          <span className="text-xs text-noir-muted block">Servicio Seleccionado</span>
                          <strong id="summaryService" className="font-semibold text-noir">
                            {servicioActual}
                          </strong>
                        </div>
                      </div>
                      <span id="summaryPrice" className="font-bold text-noir font-serif">
                        {precioActual}
                      </span>
                    </div>

                    {/* Estilista */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
                        <i data-lucide="user-check" className="w-4 h-4"></i>
                      </div>
                      <div>
                        <span className="text-xs text-noir-muted block">Profesional a cargo</span>
                        <strong id="summaryStylist" className="font-semibold text-noir">
                          {estilistaActual}
                        </strong>
                      </div>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
                        <i data-lucide="calendar-check" className="w-4 h-4"></i>
                      </div>
                      <div>
                        <span className="text-xs text-noir-muted block">Fecha y Hora</span>
                        <span className="font-semibold text-noir">
                          <span id="summaryDate">{fechaActual}</span> ·{' '}
                          <span id="summaryHour">{horaActual}</span>
                        </span>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-100 text-brand-700 shrink-0">
                        <i data-lucide="map-pin" className="w-4 h-4"></i>
                      </div>
                      <div>
                        <span className="text-xs text-noir-muted block">Ubicación Salón</span>
                        <span className="font-semibold text-noir">
                          C/ Zoológico entre C/ San Lorenzo y C/ Manuel Marín
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Política y Total */}
                  <div className="pt-4 border-t border-brand-100 space-y-4">
                    <div className="bg-brand-50 p-3 rounded-xl border border-brand-200/70 text-[11px] text-noir-muted flex items-start gap-2">
                      <i data-lucide="info" className="w-4 h-4 text-brand-600 shrink-0 mt-0.5"></i>
                      <span>
                        No se cobra nada por adelantado en el prototipo. Pago al finalizar tu cita. Cancelación gratuita con
                        24h de aviso.
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider text-noir-muted font-bold">Total Estimado:</span>
                      <span id="summaryTotal" className="text-2xl font-bold font-serif text-noir">
                        {precioActual}
                      </span>
                    </div>

                    {/* Botón de Confirmación */}
                    <button
                      type="button"
                      onClick={() => setModalAbierto(true)}
                      className="w-full bg-noir hover:bg-brand-800 text-white font-semibold py-4 rounded-2xl shadow-elevated hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <i data-lucide="check-circle" className="w-5 h-5 text-champagne"></i>
                      <span>Confirmar mi Cita</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: TIENDA DE PRODUCTOS DE BELLEZA */}
        <section id="productos" className="py-16 md:py-24 bg-brand-100/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header de Sección */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div className="max-w-xl">
                <span className="text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
                  Boutique Store
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-noir mt-3">
                  Cuidado Profesional en Casa
                </h2>
                <p className="text-noir-muted text-sm sm:text-base mt-2">
                  Lleva a tu rutina los mismos productos de alta cosmética que utilizamos en el salón.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <span className="text-xs text-noir-muted">Envíos a todo el país</span>
                <div className="h-4 w-px bg-brand-300"></div>
                <span className="text-xs font-bold text-brand-700">100% Originales</span>
              </div>
            </div>

            {/* Grid de Productos (Mobile-First) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Producto 1: Sérum Molecular */}
              <div className="bg-white rounded-3xl p-5 border border-brand-200/90 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group">
                <div>
                  {/* Imagen Producto con Badge */}
                  <div className="relative rounded-2xl overflow-hidden bg-brand-50 mb-5 aspect-square flex items-center justify-center p-6">
                    <img
                      src="https://images.unsplash.com/photo-1608248597359-679940733d02?auto=format&fit=crop&w=600&q=80"
                      alt="Sérum Capilar Reconstructor"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-noir text-champagne text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Top Ventas
                    </span>
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-noir-muted hover:text-rose-500 transition-colors">
                      <i data-lucide="heart" className="w-4 h-4"></i>
                    </button>
                  </div>

                  {/* Información Producto */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-600 font-semibold tracking-wide uppercase text-[10px]">
                        Tratamiento Elixir
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        ★★★★★ <span className="text-noir font-bold ml-1 text-[11px]">(48)</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-noir group-hover:text-brand-600 transition-colors">
                      Sérum Molecular de Seda & Argán
                    </h3>

                    <p className="text-xs text-noir-muted line-clamp-2">
                      Sella puntas abiertas de forma instantánea, aporta brillo espejo sin apelmazar y protege del calor
                      hasta 230°C.
                    </p>

                    <div className="pt-2 text-xs text-noir-muted">
                      Presentación: <span className="font-medium text-noir">Frasco con dosificador 100ml</span>
                    </div>
                  </div>
                </div>

                {/* Precio y Botón Carrito */}
                <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-noir-muted block">Precio</span>
                    <span className="text-xl font-serif font-bold text-noir">Bs. 38.50</span>
                  </div>
                  <button
                    onClick={() => anadirAlCarrito('Sérum Molecular de Seda', 38.5)}
                    className="inline-flex items-center gap-2 bg-noir hover:bg-brand-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <i data-lucide="shopping-cart" className="w-4 h-4 text-champagne"></i>
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </div>

              {/* Producto 2: Mascarilla Nutritiva Profunda */}
              <div className="bg-white rounded-3xl p-5 border border-brand-200/90 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group">
                <div>
                  {/* Imagen Producto */}
                  <div className="relative rounded-2xl overflow-hidden bg-brand-50 mb-5 aspect-square flex items-center justify-center p-6">
                    <img
                      src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80"
                      alt="Mascarilla Nutritiva Queratina"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Recomendado
                    </span>
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-noir-muted hover:text-rose-500 transition-colors">
                      <i data-lucide="heart" className="w-4 h-4"></i>
                    </button>
                  </div>

                  {/* Información Producto */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-600 font-semibold tracking-wide uppercase text-[10px]">
                        Nutrición Intensiva
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        ★★★★★ <span className="text-noir font-bold ml-1 text-[11px]">(35)</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-noir group-hover:text-brand-600 transition-colors">
                      Mascarilla Bioreparadora de Queratina
                    </h3>

                    <p className="text-xs text-noir-muted line-clamp-2">
                      Tratamiento intensivo semanal con manteca de karité pura y ceramidas vegetales para reparar cabellos
                      decolorados o secos.
                    </p>

                    <div className="pt-2 text-xs text-noir-muted">
                      Presentación: <span className="font-medium text-noir">Tarro Spa 250ml</span>
                    </div>
                  </div>
                </div>

                {/* Precio y Botón Carrito */}
                <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-noir-muted block">Precio</span>
                    <span className="text-xl font-serif font-bold text-noir">Bs. 42.00</span>
                  </div>
                  <button
                    onClick={() => anadirAlCarrito('Mascarilla Bioreparadora', 42.0)}
                    className="inline-flex items-center gap-2 bg-noir hover:bg-brand-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <i data-lucide="shopping-cart" className="w-4 h-4 text-champagne"></i>
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </div>

              {/* Producto 3: Aceite Esencial de Brillo y Densidad */}
              <div className="bg-white rounded-3xl p-5 border border-brand-200/90 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group sm:col-span-2 lg:col-span-1">
                <div>
                  {/* Imagen Producto */}
                  <div className="relative rounded-2xl overflow-hidden bg-brand-50 mb-5 aspect-square flex items-center justify-center p-6">
                    <img
                      src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80"
                      alt="Aceite Esencial Brillo Orgánico"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      100% Vegano
                    </span>
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-noir-muted hover:text-rose-500 transition-colors">
                      <i data-lucide="heart" className="w-4 h-4"></i>
                    </button>
                  </div>

                  {/* Información Producto */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-600 font-semibold tracking-wide uppercase text-[10px]">
                        Aceite Botánico
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        ★★★★★ <span className="text-noir font-bold ml-1 text-[11px]">(62)</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-noir group-hover:text-brand-600 transition-colors">
                      Aceite Botánico de Camelia & Jojoba
                    </h3>

                    <p className="text-xs text-noir-muted line-clamp-2">
                      Fórmula ultraligera de rápida absorción que controla el encrespamiento, nutre el cuero cabelludo y
                      perfuma con notas florales.
                    </p>

                    <div className="pt-2 text-xs text-noir-muted">
                      Presentación: <span className="font-medium text-noir">Gotero de cristal 50ml</span>
                    </div>
                  </div>
                </div>

                {/* Precio y Botón Carrito */}
                <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-noir-muted block">Precio</span>
                    <span className="text-xl font-serif font-bold text-noir">Bs. 29.90</span>
                  </div>
                  <button
                    onClick={() => anadirAlCarrito('Aceite Botánico de Camelia', 29.9)}
                    className="inline-flex items-center gap-2 bg-noir hover:bg-brand-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <i data-lucide="shopping-cart" className="w-4 h-4 text-champagne"></i>
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-noir text-white border-t border-brand-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Columna 1: Marca */}
            <div className="lg:col-span-2 space-y-4">
              <a href="#" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-800 flex items-center justify-center text-champagne">
                  <i data-lucide="sparkles" className="w-5 h-5"></i>
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white">
                  Boutique <span className="italic font-normal text-champagne">de la Belleza</span>
                </span>
              </a>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed font-light">
                Salón de alta estética capilar y belleza integral. Pasión por la técnica, respeto por la salud de tu fibra
                capilar y exclusividad en cada detalle.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-champagne flex items-center justify-center transition-colors"
                >
                  <i data-lucide="instagram" className="w-4 h-4"></i>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-champagne flex items-center justify-center transition-colors"
                >
                  <i data-lucide="facebook" className="w-4 h-4"></i>
                </a>
                <a
                  href="https://wa.me/59160392788"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-champagne flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <i data-lucide="message-circle" className="w-4 h-4"></i>
                </a>
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest text-champagne mb-4">Navegación</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Servicios Principales
                  </a>
                </li>
                <li>
                  <a href="#reserva" className="hover:text-white transition-colors">
                    Reservar en Línea
                  </a>
                </li>
                <li>
                  <a href="#productos" className="hover:text-white transition-colors">
                    Tienda Online
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Horarios */}
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest text-champagne mb-4">Horarios de Atención</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex justify-between">
                  <span>Lun - Vie:</span>
                  <span className="text-white font-medium">9:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sábados:</span>
                  <span className="text-white font-medium">9:00 AM - 7:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos:</span>
                  <span className="text-brand-400">Previa Cita VIP</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto y Ubicación */}
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest text-champagne mb-4">Ubicación & Contacto</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <i data-lucide="map-pin" className="w-4 h-4 text-brand-400 shrink-0 mt-0.5"></i>
                  <span>C/ Zoológico entre C/ San Lorenzo y C/ Manuel Marín</span>
                </li>
                <li className="flex items-center gap-2">
                  <i data-lucide="phone" className="w-4 h-4 text-brand-400 shrink-0"></i>
                  <a href="tel:+59160392788" className="hover:text-white transition-colors">
                    +591 60392788
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 Boutique de la Belleza. Todos los derechos reservados. Prototipo Visual Frontend.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-300">
                Privacidad
              </a>
              <a href="#" className="hover:text-gray-300">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL DE CONFIRMACIÓN DE CITA */}
      <div
        id="bookingModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setModalAbierto(false);
          }
        }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/80 backdrop-blur-sm transition-opacity duration-300 ${
          modalAbierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-elevated transform transition-transform duration-300 border border-brand-200 text-center space-y-4 ${
            modalAbierto ? 'scale-100' : 'scale-95'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <i data-lucide="calendar-check" className="w-7 h-7"></i>
          </div>

          <h3 className="font-serif text-2xl font-bold text-noir">¡Cita Pre-Agendada!</h3>

          <p className="text-xs sm:text-sm text-noir-muted leading-relaxed">
            Hemos reservado tu espacio provisionalmente. En una versión con backend, recibirías un SMS o correo con el enlace
            de confirmación.
          </p>

          <div className="bg-brand-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-brand-200">
            <div className="flex justify-between">
              <span className="text-noir-muted">Servicio:</span>
              <strong id="modalService" className="text-noir">
                {servicioActual}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-noir-muted">Fecha & Hora:</span>
              <strong id="modalDateTime" className="text-noir">
                {fechaActual} - {horaActual}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-noir-muted">Estilista:</span>
              <strong id="modalStylist" className="text-noir">
                {estilistaActual}
              </strong>
            </div>
            <div className="flex justify-between border-t border-brand-200 pt-1 font-bold">
              <span>Total:</span>
              <span id="modalTotal" className="text-brand-700">
                {precioActual}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalAbierto(false)}
            className="w-full bg-noir hover:bg-brand-800 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
