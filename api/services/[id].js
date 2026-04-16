import { getSupabaseAdmin } from '../_lib/supabase.js'
import { getBearerToken, verifyAdminToken } from '../_lib/auth.js'
import { fromDbService, toDbServicePatch } from '../_lib/serviceMapper.js'

const json = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

const requireAdmin = async (req) => {
  const token = getBearerToken(req)
  if (!token) return false
  try {
    await verifyAdminToken(token)
    return true
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  const id = req.query?.id
  if (!id) return json(res, 400, { error: 'Missing id' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single()
    if (error) return json(res, 404, { error: 'Not found' })
    return json(res, 200, { data: fromDbService(data) })
  }

  const ok = await requireAdmin(req)
  if (!ok) return json(res, 401, { error: 'Unauthorized' })

  if (req.method === 'PUT') {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        return json(res, 400, { error: 'Invalid JSON' })
      }
    }
    const payload = body || {}
    const { data, error } = await supabase.from('services').update(toDbServicePatch(payload)).eq('id', id).select('*').single()
    if (error) return json(res, 400, { error: 'Invalid payload' })
    return json(res, 200, { data: fromDbService(data) })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return json(res, 500, { error: 'Database error' })
    return json(res, 204, {})
  }

  return json(res, 405, { error: 'Method not allowed' })
}
