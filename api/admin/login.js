import { timingSafeEqual } from 'node:crypto'
import { signAdminToken } from '../_lib/auth.js'

const json = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

const safeEqual = (a, b) => {
  const aBuf = Buffer.from(String(a), 'utf8')
  const bBuf = Buffer.from(String(b), 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim()
  const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim()

  if (!adminEmail || !adminPassword) {
    return json(res, 500, { error: 'Admin not configured' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return json(res, 400, { error: 'Invalid JSON' })
    }
  }

  const email = String(body?.email || '').trim()
  const password = String(body?.password || '').trim()

  const ok = email && password && safeEqual(email.toLowerCase(), adminEmail.toLowerCase()) && safeEqual(password, adminPassword)
  if (!ok) return json(res, 401, { error: 'Credenciais inválidas.' })

  const token = await signAdminToken({ sub: 'admin', email: adminEmail })
  return json(res, 200, { token })
}
