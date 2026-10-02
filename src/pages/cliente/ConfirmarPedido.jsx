import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CircleCheck, Clock, MapPin, Wallet } from 'lucide-react'
import { Button, Card, PageHeader } from '../../components/ui'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useAccion, useResource } from '../../hooks/useResource'
import { crearPedido, getSalon } from '../../services'
import { formatCurrency, formatDate } from '../../utils/format'

export default function ConfirmarPedido() {
  const { items, total, vaciar } = useCart()
  const { usuario } = useAuth()
  const { data: salon } = useResource(getSalon, [])
  const { ejecutar, pendiente } = useAccion()
  const [pedido, setPedido] = useState(null)

  if (pedido) return <PedidoListo pedido={pedido} salon={salon} />
  if (!items.length) return <Navigate to="/carrito" replace />

  const confirmar = async () => {
    const r = await ejecutar(() => crearPedido({ clienteId: usuario.clienteId, items }))
    if (r.ok) {
      setPedido(r.data)
      vaciar()
    }
  }

  return (
    <div className="container-page max-w-3xl py-10 md:py-16">
      <PageHeader title="Confirmar pedido" description="Revisa tu pedido antes de reservarlo para retiro." />

      <div role="note" className="mt-8 flex gap-4 rounded-card border border-accent-line bg-accent-soft p-5">
        <Wallet className="mt-0.5 size-5 shrink-0 text-accent-hover" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="font-medium text-ink">El pago se realiza al recoger.</p>
          <p className="mt-0.5 text-ink-muted">El pedido se reserva por 48 horas. Puedes pagar en efectivo o con QR en caja.</p>
        </div>
      </div>

      <Card className="mt-6">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.productoId} className="flex items-baseline justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium">{i.nombre}</p>
                <p className="text-sm text-ink-muted">{i.cantidad} × {formatCurrency(i.precio)}</p>
              </div>
              <p className="tabular">{formatCurrency(i.precio * i.cantidad)}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
          <p className="font-medium">Total</p>
          <p className="tabular text-xl font-medium">{formatCurrency(total)}</p>
        </div>
      </Card>

      {salon && (
        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <p><span className="block font-medium">Retiro en {salon.nombre}</span><span className="text-ink-muted">{salon.direccion}</span></p>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <p><span className="block font-medium">Horario de retiro</span><span className="text-ink-muted">{salon.horarios[0].dias}, {salon.horarios[0].horas}</span></p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button to="/carrito" variant="secondary" size="lg">Editar carrito</Button>
        <Button size="lg" onClick={confirmar} loading={pendiente != null}>
          Confirmar pedido
        </Button>
      </div>
    </div>
  )
}

function PedidoListo({ pedido, salon }) {
  return (
    <div className="container-page flex max-w-xl flex-col items-center py-16 text-center md:py-24">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <CircleCheck className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-medium md:text-5xl">Pedido reservado</h1>
      <p className="mt-3 text-ink-muted">
        Tu pedido <span className="font-medium text-ink">{pedido.id}</span> está reservado hasta el{' '}
        <span className="font-medium text-ink">{formatDate(pedido.expiraEl)}</span>. Te avisaremos cuando esté listo para recoger.
      </p>
      <Card className="mt-8 w-full p-5 text-left">
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-ink-muted">Total a pagar en el local</dt><dd className="tabular font-medium">{formatCurrency(pedido.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">Dirección</dt><dd>{salon?.direccion}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">Estado</dt><dd>{pedido.estado}</dd></div>
        </dl>
      </Card>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/mi-cuenta?tab=pedidos">Ver mis pedidos</Button>
        <Button to="/tienda" variant="secondary">Seguir comprando</Button>
      </div>
      <Link to="/" className="mt-6 text-sm text-ink-muted underline underline-offset-4 hover:text-ink">Volver al inicio</Link>
    </div>
  )
}
