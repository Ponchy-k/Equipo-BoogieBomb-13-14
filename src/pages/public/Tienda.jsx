import { useEffect, useMemo, useState } from 'react'
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import { AsyncBoundary, Button, EmptyState, Field, Input, PageHeader, Select, Skeleton } from '../../components/ui'
import { ProductCard } from '../../components/shop/ProductCard'
import { useResource } from '../../hooks/useResource'
import { getProductos } from '../../services'
import { cn } from '../../utils/format'

const FILTROS_VACIOS = { categoria: '', marca: '', precioMin: '', precioMax: '' }

export default function Tienda() {
  const [q, setQ] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [panel, setPanel] = useState(false)

  // Debounce de la búsqueda para no consultar en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(q), 250)
    return () => clearTimeout(t)
  }, [q])

  const todos = useResource(() => getProductos(), [])
  const productos = useResource(() => getProductos({ q: busqueda, ...filtros }), [busqueda, filtros])

  const opciones = useMemo(() => {
    const lista = todos.data ?? []
    return {
      categorias: [...new Set(lista.map((p) => p.categoria))].sort(),
      marcas: [...new Set(lista.map((p) => p.marca))].sort(),
    }
  }, [todos.data])

  const activos = Object.values(filtros).filter(Boolean).length
  const set = (k) => (e) => setFiltros((f) => ({ ...f, [k]: e.target.value }))
  const limpiar = () => {
    setFiltros(FILTROS_VACIOS)
    setQ('')
  }

  return (
    <div className="container-page py-10 md:py-16">
      <PageHeader title="Tienda" description="Pide en línea y retira en el local. El pago se realiza al recoger." />

      <div className="mt-8 flex gap-2">
        <div className="flex-1">
          <label htmlFor="buscar" className="sr-only">Buscar productos</label>
          <Input id="buscar" icon={Search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por producto o marca" />
        </div>
        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          className="lg:hidden"
          onClick={() => setPanel((v) => !v)}
          aria-expanded={panel}
          aria-controls="filtros"
        >
          Filtros{activos ? ` (${activos})` : ''}
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside id="filtros" className={cn('flex-col gap-5 rounded-card border border-line bg-surface p-5 lg:flex lg:self-start', panel ? 'flex' : 'hidden')}>
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-medium">Filtros</h2>
            {(activos > 0 || q) && (
              <button onClick={limpiar} className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink">
                Limpiar
              </button>
            )}
          </div>
          <Field label="Categoría">
            <Select value={filtros.categoria} onChange={set('categoria')}>
              <option value="">Todas</option>
              {opciones.categorias.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Marca">
            <Select value={filtros.marca} onChange={set('marca')}>
              <option value="">Todas</option>
              {opciones.marcas.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Precio (Bs)</legend>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" inputMode="numeric" min="0" aria-label="Precio mínimo" placeholder="Mín." value={filtros.precioMin} onChange={set('precioMin')} />
              <Input type="number" inputMode="numeric" min="0" aria-label="Precio máximo" placeholder="Máx." value={filtros.precioMax} onChange={set('precioMax')} />
            </div>
          </fieldset>
        </aside>

        <div>
          <AsyncBoundary
            resource={productos}
            skeleton={
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[4/5] rounded-card" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            }
            empty={
              <EmptyState
                icon={PackageSearch}
                title="No encontramos productos"
                description="Prueba con otra palabra o quita algunos filtros."
                action={<Button variant="secondary" size="sm" icon={X} onClick={limpiar}>Quitar filtros</Button>}
              />
            }
          >
            {(data) => (
              <>
                <p className="mb-5 text-sm text-ink-muted" aria-live="polite">
                  {data.length} {data.length === 1 ? 'producto' : 'productos'}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                  {data.map((p) => <ProductCard key={p.id} producto={p} />)}
                </div>
              </>
            )}
          </AsyncBoundary>
        </div>
      </div>
    </div>
  )
}
