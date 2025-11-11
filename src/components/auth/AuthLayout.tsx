import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  // Reutiliza el mismo fondo y centrado que el Login
  return (
    <main className="login-instagram">
      {children}
    </main>
  )
}