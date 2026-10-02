import { useState } from 'react'
import { Banknote, PackageCheck, QrCode, ShoppingBag, Wallet } from 'lucide-react'
import { AsyncBoundary, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, Segmented, SkeletonList, StatusBadge, Tabs } from '../../components/ui'
import { useAccion, useResource } from '../../hooks/useResource'
import { cambiarEstadoPedido, getPedidos } from '../../services'
import { formatCurrency, formatDate } from '../../utils/format'

const TABS = ['Activos', 'Entregado y pagado', 'Cancelado', 'Expirado']
const ACTIVOS = ['Pendiente', 'Listo para recoger']

export default function Pedidos() {
  const pedidos = useResource(() => getPedidos(), [])
  const { ejecutar, pendiente } = useAccion()
  const [tab, setTab] = useState('Activos')
  const [cobrar, setCobrar] = useState(null)
  const [cancelar, setCancelar] = useState(null)

  const filtrar = (data, t) => data.filter((p) => (t === 'Activos' ? ACTIVOS.includes(p.estado) : p.estado === t))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pedidos" description="Pedidos de la tienda para retiro en el local. El cobro se registra al entregar." />
      <AsyncBoundary resource={pedidos} skeleton={<SkeletonList rows={5} />}>
        {(data) => {
          const lista = filtrar(data, tab)
          return (
            <>
              <Tabs label="Estado del pedido" value={tab} onChange={setTab} tabs={TABS.map((t) => ({ value: t, label: t === 'Entregado y pagado' ? 'Entregados' : t, count: filtrar(data, t).length }))} />
              {lista.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="No hay pedidos aquí" />
              ) : (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {lista.map((p) => (
                    <li key={p.id}>
                      <Card className="flex h-full flex-col gap-4 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="tabular font-medium">{p.id}</p>
                              <StatusBadge estado={p.estado} />
                            </div>
                            <p className="mt-1 text-sm text-ink-muted">{p.cliente?.nombre} · <span className="tabular">{p.cliente?.telefono}</span></p>
                          </div>
                          <p className="tabular text-lg font-medium">{formatCurrency(p.total)}</p>
                        </div>
                        <ul className="flex flex-col gap-1 text-sm">
                          {p.items.map((i) => (
                            <li key={i.productoId} className="flex justify-between gap-3">
                              <span><span className="tabular text-ink-muted">{i.cantidad} ×</span> {i.nombre}</span>
                              <span className="tabular text-ink-muted">{formatCurrency(i.precio * i.cantidad)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                          <p className="text-ink-muted">
                            {ACTIVOS.includes(p.estado)
                              ? `Reservado hasta el ${formatDate(p.expiraEl)}`
                              : p.fechaPago
                                ? `Cobrado el ${formatDate(p.fechaPago)} · ${p.metodoPago}`
                                : `Pedido del ${formatDate(p.fechaCreacion)}`}
                          </p>
                          {ACTIVOS.includes(p.estado) && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setCancelar(p)}>Cancelar</Button>
                              {p.estado === 'Pendiente' ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={PackageCheck}
                                  loading={pendiente === p.id}
                                  onClick={() => ejecutar(() => cambiarEstadoPedido(p.id, 'Listo para recoger'), { clave: p.id, exito: `${p.id} listo para recoger.` })}
                                >
                                  Marcar listo
                                </Button>
                              ) : (
                                <Button size="sm" icon={Wallet} onClick={() => setCobrar(p)}>Registrar cobro</Button>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
        }}
      </AsyncBoundary>

      <CobroModal pedido={cobrar} onClose={() => setCobrar(null)} />
      <ConfirmDialog
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        title="¿Cancelar el pedido?"
        description={cancelar ? `${cancelar.id} de ${cancelar.cliente?.nombre}. El stock reservado vuelve al inventario.` : ''}
        confirmLabel="Cancelar pedido"
        tone="danger"
        loading={pendiente != null}
        onConfirm={async () => {
          await ejecutar(() => cambiarEstadoPedido(cancelar.id, 'Cancelado'), { exito: 'Pedido cancelado.' })
          setCancelar(null)
        }}
      />
    </div>
  )
}

function CobroModal({ pedido, onClose }) {
  const [metodo, setMetodo] = useState('Efectivo')
  const { ejecutar, pendiente } = useAccion()

  const cobrar = async () => {
    const r = await ejecutar(() => cambiarEstadoPedido(pedido.id, 'Entregado y pagado', { metodoPago: metodo }), {
      exito: `Cobro registrado: ${formatCurrency(pedido.total)} (${metodo}).`,
    })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      size="sm"
      title="Registrar cobro"
      description={pedido ? `${pedido.id} · ${pedido.cliente?.nombre}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Volver</Button>
          <Button onClick={cobrar} loading={pendiente != null}>Entregar y cobrar</Button>
        </>
      }
    >
      {pedido && (
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <p className="text-sm text-ink-muted">Total a cobrar</p>
            <p className="tabular mt-1 text-4xl font-medium">{formatCurrency(pedido.total)}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Método de pago</p>
            <Segmented
              label="Método de pago"
              className="w-full"
              value={metodo}
              onChange={setMetodo}
              options={[{ value: 'Efectivo', label: 'Efectivo', icon: Banknote }, { value: 'QR en caja', label: 'QR en caja', icon: QrCode }]}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
