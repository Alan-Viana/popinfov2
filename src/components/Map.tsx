import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin as LuMapPin, Phone as LuPhone, Clock3 as LuClock } from 'lucide-react'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapProps {
  locations: {
    id: string
    name: string
    lat: number
    lng: number
    address: string
    type?: string
    phone?: string
    hours?: string
  }[]
  center?: [number, number]
  zoom?: number
  heightClassName?: string
  containerClassName?: string
}

const Map = ({ locations, center = [-23.5505, -46.6333], zoom = 12, heightClassName = 'h-[400px]', containerClassName = '' }: MapProps) => {
  return (
    <div className={`${heightClassName} w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800 ${containerClassName}`.trim()}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <LuMapPin size={16} strokeWidth={1.5} className="text-blue-600" />
                  {loc.name}
                </h3>
                {loc.type && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 mb-2 inline-block">
                    {loc.type}
                  </span>
                )}
                <p className="text-xs text-slate-600 mb-2">{loc.address}</p>
                <div className="flex flex-col gap-1">
                  {loc.phone && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <LuPhone size={14} strokeWidth={1.5} />
                      {loc.phone}
                    </div>
                  )}
                  {loc.hours && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <LuClock size={14} strokeWidth={1.5} />
                      {loc.hours}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map

