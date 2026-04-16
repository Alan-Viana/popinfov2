export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { ok: false as const, error: String(body.error || 'Falha no login') }
    }

    const token = String(body.token || '')
    if (!token) return { ok: false as const, error: 'Resposta inválida do servidor.' }

    return { ok: true as const, token }
  } catch {
    return { ok: false as const, error: 'Não foi possível conectar ao backend. Se você estiver rodando localmente, faça o deploy no Vercel ou use vercel dev.' }
  }
}
