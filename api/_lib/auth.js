import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET not configured')
  return encoder.encode(secret)
}

export const signAdminToken = async (payload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export const verifyAdminToken = async (token) => {
  const result = await jwtVerify(token, getJwtSecret())
  return result.payload
}

export const getBearerToken = (req) => {
  const auth = req.headers?.authorization || ''
  const parts = String(auth).split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1]
  return null
}
