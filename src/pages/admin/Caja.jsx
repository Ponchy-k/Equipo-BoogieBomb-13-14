import { useState } from 'react'
import { Printer, Receipt, Scissors, ShoppingBag, Wallet } from 'lucide-react'
import { AsyncBoundary, Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton, StatCard, Table, Td, Th } from '../../components/ui'
import { useResource } from '../../hooks/useResource'
import { getCaja } from '../../services'
import { hoy } from '../../utils/fecha'
import { formatCurrency, formatDate } from '../../utils/format'

export default function Caja() {
  const [fecha, setFecha] = useState(hoy)
  const caja = useResource(() => getCaja(fecha), [fecha])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Caja del día"
        description={`Resumen de lo cobrado el ${formatDate(fecha)}.`}
        actions={
          <>
            <label htmlFor="fecha-caja" className="sr-only">Fecha</label>
            <Input id="fecha-caja" type="date" max={hoy()} value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className="w-44!" />
            <Button variant="secondary" icon={Printer} onClick={() => window.print()} className="print:hidden">Imprimir</Button>
          </>
        }
      />
      <AsyncBoundary
        resource={caja}
        skeleton={<div className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-card" />)}</div><Skeleton className="h-64 rounded-card" /></div>}
      >
        {(c) => (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard className="col-span-2 border-ink lg:col-span-1" label="Total cobrado" value={formatCurrency(c.total)} icon={Wallet} hint={`${c.movimientos.length} movimientos`} />
              <StatCard label="Servicios" value={formatCurrency(c.servicios)} icon={Scissors} />
              <StatCard label="Productos" value={formatCurrency(c.productos)} icon={ShoppingBag} />
              <Card className="col-span-2 flex flex-col gap-2 p-5 lg:col-span-1">
                <p className="text-sm text-ink-muted">Productos por método</p>
                {Object.keys(c.porMetodo).length ? (
                  Object.entries(c.porMetodo).map(([m, v]) => (
                    <div key={m} className="flex justify-between text-sm"><span>{m}</span><span className="tabular font-medium">{formatCurrency(v)}</span></div>
                  ))
                ) : (
                  <p className="text-sm text-ink-subtle">Sin ventas de productos.</p>
                )}
              </Card>
            </div>

            {c.movimientos.length === 0 ? (
              <EmptyState icon={Receipt} title="Sin cobros registrados este día" description="Los servicios finalizados y los pedidos entregados aparecerán aquí." />
            ) : (
              <Table>
                <thead>
                  <tr><Th>Hora</Th><Th>Tipo</Th><Th>Concepto</Th><Th>Detalle</Th><Th>Método</Th><Th className="text-right">Monto</Th></tr>
                </thead>
                <tbody>
                  {c.movimientos.map((m) => (
                    <tr key={m.id}>
                      <Td className="tabular">{m.hora}</Td>
                      <Td><Badge tone={m.tipo === 'Productos' ? 'neutral' : 'accent'}>{m.tipo}</Badge></Td>
                      <Td className="font-medium">{m.concepto}</Td>
                      <Td className="text-ink-muted">{m.detalle}</Td>
                      <Td className="text-ink-muted">{m.metodo}</Td>
                      <Td className="tabular text-right">{formatCurrency(m.monto)}</Td>
                    </tr>
                  ))}
                  <tr className="bg-stone/50">
                    <Td colSpan={5} className="font-medium">Total</Td>
                    <Td className="tabular text-right font-medium">{formatCurrency(c.total)}</Td>
                  </tr>
                </tbody>
              </Table>
            )}
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
