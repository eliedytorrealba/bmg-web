import {
  AlertTriangle,
  CheckCircle2,
  MailCheck,
} from 'lucide-react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

function EmailVerification() {
  const [searchParams] = useSearchParams()

  const status = searchParams.get('status')

  const isVerified = status === 'verified'
  const isAlreadyVerified =
    status === 'already-verified'
  const isInvalid = status === 'invalid'

  let content = {
    icon: MailCheck,
    title: 'Verificación de correo',
    description:
      'Estamos procesando el estado de verificación de tu correo electrónico.',
  }

  if (isVerified) {
    content = {
      icon: CheckCircle2,
      title: 'Correo verificado correctamente',
      description:
        'Tu dirección de correo electrónico fue verificada correctamente. Tu cuenta BMG ya cuenta con el correo confirmado.',
    }
  }

  if (isAlreadyVerified) {
    content = {
      icon: CheckCircle2,
      title: 'Tu correo ya está verificado',
      description:
        'Esta dirección de correo electrónico ya había sido verificada anteriormente. No necesitas realizar ninguna otra acción.',
    }
  }

  if (isInvalid) {
    content = {
      icon: AlertTriangle,
      title: 'Enlace de verificación no válido',
      description:
        'El enlace de verificación es inválido o ha expirado. Ingresa a tu cuenta para solicitar un nuevo correo de verificación.',
    }
  }

  const Icon = content.icon

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <p className="font-semibold text-bmg-blue">
            Seguridad de la cuenta
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Verificación de correo
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Confirma tu dirección de correo electrónico
            para mantener actualizada la información de
            tu cuenta.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-20">
          <section className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <Icon
                size={38}
                aria-hidden="true"
              />
            </span>

            <h2 className="mt-7 text-3xl font-bold text-bmg-dark">
              {content.title}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-neutral-600">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/mi-cuenta"
                className="inline-flex items-center justify-center rounded-xl bg-bmg-blue px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Ir a mi cuenta
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default EmailVerification