const pick = (value) => (value === undefined ? undefined : value)

export const toDbServiceInsert = (input) => {
  return {
    id: pick(input.id),
    name: input.name,
    type: input.type,
    address: input.address,
    number: pick(input.number),
    complement: pick(input.complement),
    neighborhood: input.neighborhood,
    city: input.city,
    zip: input.zip,
    phone: input.phone,
    email: input.email,
    hours: input.hours,
    operating_days: pick(input.operatingDays),
    description: input.description,
    services_offered: Array.isArray(input.services_offered) ? input.services_offered : [],
    lat: pick(input.lat),
    lng: pick(input.lng),
    imagem_url: pick(input.imagemUrl)
  }
}

export const toDbServicePatch = (input) => {
  const patch = {}
  if ('name' in input) patch.name = input.name
  if ('type' in input) patch.type = input.type
  if ('address' in input) patch.address = input.address
  if ('number' in input) patch.number = input.number
  if ('complement' in input) patch.complement = input.complement
  if ('neighborhood' in input) patch.neighborhood = input.neighborhood
  if ('city' in input) patch.city = input.city
  if ('zip' in input) patch.zip = input.zip
  if ('phone' in input) patch.phone = input.phone
  if ('email' in input) patch.email = input.email
  if ('hours' in input) patch.hours = input.hours
  if ('operatingDays' in input) patch.operating_days = input.operatingDays
  if ('description' in input) patch.description = input.description
  if ('services_offered' in input) patch.services_offered = input.services_offered
  if ('lat' in input) patch.lat = input.lat
  if ('lng' in input) patch.lng = input.lng
  if ('imagemUrl' in input) patch.imagem_url = input.imagemUrl
  return patch
}

export const fromDbService = (row) => {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    number: row.number ?? undefined,
    complement: row.complement ?? undefined,
    neighborhood: row.neighborhood,
    city: row.city,
    zip: row.zip,
    phone: row.phone,
    email: row.email,
    hours: row.hours,
    operatingDays: row.operating_days ?? undefined,
    description: row.description,
    services_offered: row.services_offered || [],
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    created_at: row.created_at,
    imagemUrl: row.imagem_url ?? undefined
  }
}
