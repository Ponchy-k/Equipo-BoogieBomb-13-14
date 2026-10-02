import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Store, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader, Placeholder } from '../../components/ui'
import { QuantityStepper } from '../../components/shop/ProductCard'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/format'

export default function Carrito() {
  const { items, total, cantidad, actualizarCantidad, quitar } = useCart()

  return (
    <div className="container-page py-10 md:py-16">
      <PageHeader title="Carrito" description={cantidad ? `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}` : undefined} />

      {items.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          description="Explora la tienda y agrega productos para retirarlos en el local."
          action={<Button to="/tienda">Ir a la tienda</Button>}
        />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.productoId} className="flex gap-4 py-5">
                <Link to={`/tienda/${i.productoId}`} className="shrink-0">
                  <Placeholder tono={i.tono} icon={Package} className="size-20 rounded-control border border-line sm:size-24" iconClassName="size-6" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted">{i.marca}</p>
                    <Link to={`/tienda/${i.productoId}`} className="font-medium text-ink hover:underline hover:underline-offset-4">
                      {i.nombre}
                    </Link>
                    <p className="tabular mt-0.5 text-sm text-ink-muted">{formatCurrency(i.precio)} c/u</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="tabular font-medium sm:order-last">{formatCurrency(i.precio * i.cantidad)}</p>
                    <div className="flex items-center gap-1">
                      <QuantityStepper value={i.cantidad} onChange={(n) => actualizarCantidad(i.productoId, n)} max={i.stock} label={`Cantidad de ${i.nombre}`} />
                      <Button variant="ghost" size="icon" onClick={() => quitar(i.productoId)} aria-label={`Quitar ${i.nombre}`}>
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Card className="flex flex-col gap-5 p-6 lg:sticky lg:top-24">
            <h2 className="font-sans text-base font-medium">Resumen</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd className="tabular">{formatCurrency(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Envío</dt><dd>Retiro en el local</dd></div>
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-medium">Total a pagar al recoger</dt>
                <dd className="tabular font-medium">{formatCurrency(total)}</dd>
              </div>
            </dl>
            <div className="flex gap-3 rounded-control bg-stone/70 p-3 text-sm">
              <Store className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <p className="text-ink-muted">El pago se realiza al recoger. El pedido se reserva por 48 horas.</p>
            </div>
            <Button to="/carrito/confirmar" size="lg">
              Continuar
            </Button>
            <Link to="/tienda" className="text-center text-sm text-ink-muted underline underline-offset-4 hover:text-ink">
              Seguir comprando
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}
