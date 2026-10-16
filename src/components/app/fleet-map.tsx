import L from "leaflet"
import { useEffect, type ReactNode } from "react"
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet"
import { truckColor } from "@/components/app/status"
import { crewById, sites as allSites, type Site, type Truck } from "@/data/mock"
import { cn } from "@/lib/utils"

const siteColor: Record<Site["kind"], string> = {
  dock: "#0c1f5c",
  store: "#2172dd",
  vendor: "#f5a623",
  hospital: "#15803d",
  yard: "#4d5875",
}

function truckIcon(t: Truck, selected: boolean) {
  const color = truckColor[t.status]
  const ring = selected ? "box-shadow:0 0 0 4px rgba(245,166,35,.65);" : ""
  const phoneOnly = t.gps === "none" ? "border-style:dashed;" : ""
  return L.divIcon({
    className: "",
    html: `<div class="truck-pin" style="background:${color};${ring}${phoneOnly}">${t.plate.slice(-4)}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function siteIcon(s: Site) {
  return L.divIcon({
    className: "",
    html: `<div class="site-pin" style="background:${siteColor[s.kind]}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FlyTo({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 })
  }, [center?.[0], center?.[1]])
  return null
}

export function FleetMap({
  trucks = [],
  sites = allSites,
  showGeofences = true,
  selectedTruckId,
  onSelectTruck,
  track,
  focus,
  className,
  zoom = 11,
  children,
  label = "Placeholder GPS: sample positions, not live data",
}: {
  trucks?: Truck[]
  sites?: Site[]
  showGeofences?: boolean
  selectedTruckId?: string
  onSelectTruck?: (id: string) => void
  track?: [number, number][]
  focus?: [number, number]
  className?: string
  zoom?: number
  children?: ReactNode
  label?: string
}) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-lg bg-muted", className)}>
      <MapContainer center={[14.43, 121.05]} zoom={zoom} scrollWheelZoom className="size-full min-h-64">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={focus} zoom={13} />
        {sites.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={siteIcon(s)}>
            <Popup>
              <div className="space-y-0.5 text-xs">
                <div className="font-semibold">{s.name}</div>
                <div>{s.address}</div>
                <div>Geofence {s.radiusM} m · avg dwell {s.avgDwellMin} min</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {showGeofences &&
          sites.map((s) => (
            <Circle key={`g-${s.id}`} center={[s.lat, s.lng]} radius={s.radiusM} pathOptions={{ color: siteColor[s.kind], weight: 1.5, fillOpacity: 0.12 }} />
          ))}
        {track && <Polyline positions={track} pathOptions={{ color: "#2172dd", weight: 4, opacity: 0.8 }} />}
        {trucks.map((t) => (
          <Marker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={truckIcon(t, t.id === selectedTruckId)}
            eventHandlers={{ click: () => onSelectTruck?.(t.id) }}
          >
            <Popup>
              <div className="space-y-0.5 text-xs">
                <div className="font-semibold">
                  {t.plate} · {t.model}
                </div>
                <div>Driver: {t.driverId ? crewById[t.driverId]?.name : "Unassigned"}</div>
                <div>
                  {t.speedKph} km/h · last ping {t.lastPing}
                </div>
                <div>{t.gps === "vectra" ? "Source: Vectras tracker + crew phone" : "Source: crew phone only"}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {children}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-2 left-2 z-[400] rounded bg-brand-navy/90 px-2 py-1 text-[11px] text-white">{label}</div>
    </div>
  )
}

export function MapLegend() {
  const items: [string, string][] = [
    ["On trip", "#2172dd"],
    ["Available", "#15803d"],
    ["Maintenance", "#b45309"],
    ["Off duty", "#4d5875"],
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map(([l, c]) => (
        <span key={l} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: c }} />
          {l}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full border border-dashed border-muted-foreground" />
        Phone-only position
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-brand-blue" />
        Site and geofence
      </span>
    </div>
  )
}
