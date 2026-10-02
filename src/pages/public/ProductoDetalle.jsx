import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Package, ShoppingBag, Store } from 'lucide-react'
import { AsyncBoundary, Badge, Button, Placeholder, Skeleton, useToast } from '../../components/ui'
import { ProductCard, QuantityStepper } from '../../components/shop/ProductCard'
import { useResource } from '../../hooks/useResource'
import { useCart } from '../../context/CartContext'
import { getProducto, getProductos } from '../../services'
import { formatCurrency } from '../../utils/format'

export default function ProductoDetalle() {
  const { id } = useParams()
  const producto = useResource(() => getProducto(id), [id])

  return (
    <div className="container-page py-8 md:py-12">
      <Link to="/tienda" className="inline-flex h-11 items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver a la tienda
      </Link>
      <AsyncBoundary
        resource={producto}
        skeleton={
          <div className="mt-6 grid gap-10 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-card" />
            <div className="flex flex-col gap-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24" /></div>
          </div>
        }
      >
        {(p) => <Detalle producto={p} />}
      </AsyncBoundary>
    </div>
  )
}

function Detalle({ producto: p }) {
  const [cantidad, setCantidad] = useState(1)
  const { agregar, items } = useCart()
  const toast = useToast()
  const enCarrito = items.find((i) => i.productoId === p.id)?.cantidad ?? 0
  const disponible = p.stock - enCarrito
  const relacionados = useResource(() => getProductos({ categoria: p.categoria }), [p.categoria])

  const onAgregar = () => {
    agregar(p, cantidad)
    toast.success(`${p.nombre} se agregó al carrito.`)
    setCantidad(1)
  }

  return (
    <>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-14">
        <Placeholder tono={p.tono} icon={Package} label={`Imagen de ${p.nombre}`} className="aspect-square rounded-card border border-line" iconClassName="size-14" />
        <div className="flex flex-col gap-6 md:py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-muted">{p.marca} · {p.categoria}</p>
            <h1 className="text-4xl font-medium md:text-5xl">{p.nombre}</h1>
            <p className="tabular mt-1 text-2xl">{formatCurrency(p.precio)}</p>
          </div>
          <p className="max-w-[55ch] text-ink-muted">{p.descripcion}</p>
          <div>
            {p.stock === 0 ? (
              <Badge tone="neutral">Agotado</Badge>
            ) : p.stock <= p.stockMinimo ? (
              <Badge tone="warning">Quedan {p.stock} unidades</Badge>
            ) : (
              <Badge tone="success" icon={Check}>En stock</Badge>
            )}
          </div>
          {p.stock > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <QuantityStepper value={cantidad} onChange={setCantidad} max={Math.max(1, disponible)} />
              <Button size="lg" icon={ShoppingBag} onClick={onAgregar} disabled={disponible <= 0} className="flex-1">
                {disponible <= 0 ? 'Ya tienes todo el stock' : 'Agregar al carrito'}
              </Button>
            </div>
          )}
          {enCarrito > 0 && (
            <p className="text-sm text-ink-muted">
              Tienes {enCarrito} en tu carrito. <Link to="/carrito" className="font-medium text-ink underline underline-offset-4">Ver carrito</Link>
            </p>
          )}
          <div className="flex gap-3 rounded-card border border-line bg-surface p-4 text-sm">
            <Store className="mt-0.5 size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-ink-muted">
              <span className="font-medium text-ink">Retiro en el local.</span> El pago se realiza al recoger. Reservamos tu pedido por 48 horas.
            </p>
          </div>
        </div>
      </div>

      {relacionados.data && relacionados.data.filter((r) => r.id !== p.id).length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-3xl font-medium">De la misma categoría</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {relacionados.data
              .filter((r) => r.id !== p.id)
              .slice(0, 4)
              .map((r) => <ProductCard key={r.id} producto={r} />)}
          </div>
        </section>
      )}
    </>
  )
}
