import { Button } from '../../components/ui'

export default function NoEncontrado() {
  return (
    <div className="container-page flex flex-col items-start gap-6 py-24 md:py-32">
      <p className="tabular text-sm text-ink-muted">Error 404</p>
      <h1 className="text-5xl font-medium md:text-6xl">No encontramos esta página</h1>
      <p className="max-w-[45ch] text-ink-muted">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button to="/">Volver al inicio</Button>
        <Button to="/servicios" variant="secondary">Ver servicios</Button>
      </div>
    </div>
  )
}
